"""Capture and restore complete project files, including ignored data and WSL links.

File: migration_backup.py
Maintainer: sunshine-engineer
Modified: 2026-11-11
"""

import argparse
import base64
import ctypes
import hashlib
import json
import os
from pathlib import Path
import stat
import struct
import time
import zipfile


def digest(path):
    """Return a file's SHA-256 digest using bounded memory."""
    with Path(path).open('rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()


def link_record(path, info):
    """Read link metadata without following its target or exposing file contents."""
    record = {'kind': 'link', 'directory': bool(info.st_file_attributes & 16) if os.name == 'nt' else False}
    if os.name != 'nt' or stat.S_ISLNK(info.st_mode):
        record['target'] = os.readlink(path)
        return record
    from ctypes import wintypes
    kernel = ctypes.WinDLL('kernel32', use_last_error=True)
    kernel.CreateFileW.argtypes = [wintypes.LPCWSTR, wintypes.DWORD, wintypes.DWORD, wintypes.LPVOID, wintypes.DWORD, wintypes.DWORD, wintypes.HANDLE]
    kernel.CreateFileW.restype = wintypes.HANDLE
    kernel.DeviceIoControl.argtypes = [wintypes.HANDLE, wintypes.DWORD, wintypes.LPVOID, wintypes.DWORD, wintypes.LPVOID, wintypes.DWORD, ctypes.POINTER(wintypes.DWORD), wintypes.LPVOID]
    kernel.CloseHandle.argtypes = [wintypes.HANDLE]
    handle = kernel.CreateFileW(str(path), 0, 7, None, 3, 0x02200000, None)
    if handle == ctypes.c_void_p(-1).value:
        raise ctypes.WinError(ctypes.get_last_error())
    try:
        buffer = ctypes.create_string_buffer(16384)
        length = wintypes.DWORD()
        if not kernel.DeviceIoControl(handle, 0x000900A8, None, 0, buffer, len(buffer), ctypes.byref(length), None):
            raise ctypes.WinError(ctypes.get_last_error())
        raw = buffer.raw[:length.value]
    finally:
        kernel.CloseHandle(handle)
    tag = struct.unpack_from('<I', raw)[0]
    if tag != 0xA000001D:
        raise ValueError(f'Unsupported reparse tag {tag:x}: {path}')
    record.update(target=raw[12:].rstrip(b'\0').decode('utf-8'), reparse_tag=tag, reparse_data_base64=base64.b64encode(raw).decode('ascii'))
    return record


def inventory(root):
    """Enumerate every directory, regular file and link without exclusions."""
    root = Path(root).resolve()
    entries = []
    def visit(directory):
        """Collect one directory without following any links."""
        for child in sorted(directory.iterdir(), key=lambda path: path.name):
            info = child.lstat()
            entry = {'path': child.relative_to(root).as_posix(), 'mtime_ns': info.st_mtime_ns, 'mode': info.st_mode}
            if stat.S_ISLNK(info.st_mode) or getattr(info, 'st_file_attributes', 0) & 1024:
                entry.update(link_record(child, info))
            elif child.is_dir():
                entry['kind'] = 'directory'
            elif child.is_file():
                entry.update(kind='file', size=info.st_size)
            else:
                raise ValueError(f'Unsupported filesystem object: {child}')
            entries.append(entry)
            if entry['kind'] == 'directory':
                visit(child)
    visit(root)
    return entries


def safe_target(root, relative):
    """Reject absolute/traversal paths before restoring an archive entry."""
    relative = relative.replace('\\', '/')
    parts = relative.split('/')
    if relative.startswith('/') or any(part in ('', '.', '..') or ':' in part for part in parts):
        raise ValueError(f'Unsafe archive path: {relative}')
    return Path(root).joinpath(*parts)


def capture(source, archive, manifest):
    """Archive all source entries and fail if the source changes during capture."""
    source = Path(source).resolve()
    archive, manifest = Path(archive).resolve(), Path(manifest).resolve()
    if archive.is_relative_to(source) or manifest.is_relative_to(source):
        raise ValueError('Backup output must be outside the source directory')
    if archive.exists() or manifest.exists():
        raise FileExistsError('Refusing to replace an existing backup')
    entries = inventory(source)
    archive.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(archive, 'x', compression=zipfile.ZIP_DEFLATED, compresslevel=6, allowZip64=True, strict_timestamps=False) as bundle:
        for entry in entries:
            path = source / entry['path']
            if entry['kind'] == 'directory':
                bundle.mkdir(entry['path'])
            elif entry['kind'] == 'link':
                data = entry['target'].encode('utf-8')
                entry['sha256'] = hashlib.sha256(data).hexdigest()
                info = zipfile.ZipInfo(entry['path'])
                info.create_system = 3
                info.external_attr = (stat.S_IFLNK | 0o777) << 16
                bundle.writestr(info, data)
            else:
                hasher = hashlib.sha256()
                with path.open('rb') as reader, bundle.open(entry['path'], 'w', force_zip64=True) as writer:
                    while chunk := reader.read(1024 * 1024):
                        hasher.update(chunk)
                        writer.write(chunk)
                entry['sha256'] = hasher.hexdigest()
                current = path.stat()
                if (current.st_size, current.st_mtime_ns) != (entry['size'], entry['mtime_ns']):
                    raise RuntimeError(f'Source changed during capture: {entry["path"]}')
    current = inventory(source)
    if [(item['path'], item['kind'], item.get('size'), item['mtime_ns']) for item in current] != [(item['path'], item['kind'], item.get('size'), item['mtime_ns']) for item in entries]:
        raise RuntimeError('Source entries changed during capture')
    report = {'format': 1, 'created_at_utc': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()), 'source': str(source), 'archive': archive.name, 'archive_sha256': digest(archive), 'entries': entries, 'counts': {kind: sum(item['kind'] == kind for item in entries) for kind in ('file', 'directory', 'link')}, 'regular_file_bytes': sum(item.get('size', 0) for item in entries), 'excluded_paths': []}
    manifest.write_text(json.dumps(report, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    print(json.dumps({key: report[key] for key in ('counts', 'regular_file_bytes', 'archive_sha256', 'excluded_paths')}, indent=2))


def verify(archive, manifest):
    """Validate archive identity, entry set and every file/link content hash."""
    report = json.loads(Path(manifest).read_text(encoding='utf-8'))
    if digest(archive) != report['archive_sha256']:
        raise ValueError('Archive SHA-256 mismatch')
    with zipfile.ZipFile(archive) as bundle:
        names = [info.filename.rstrip('/') for info in bundle.infolist()]
        if len(names) != len(set(names)) or set(names) != {entry['path'] for entry in report['entries']}:
            raise ValueError('Archive entry set mismatch')
        for entry in report['entries']:
            safe_target(Path.cwd(), entry['path'])
            if entry['kind'] == 'directory':
                continue
            hasher = hashlib.sha256()
            with bundle.open(entry['path']) as reader:
                while chunk := reader.read(1024 * 1024):
                    hasher.update(chunk)
            if hasher.hexdigest() != entry['sha256']:
                raise ValueError(f'Entry hash mismatch: {entry["path"]}')
    print('Archive verified:', json.dumps(report['counts']))
    return report


def restore(archive, manifest, destination, links):
    """Restore into a new directory; create links on Linux or record them on Windows."""
    report = verify(archive, manifest)
    destination = Path(destination).resolve()
    if destination.exists():
        raise FileExistsError('Restore destination must not already exist')
    destination.mkdir(parents=True)
    link_entries = []
    with zipfile.ZipFile(archive) as bundle:
        for entry in report['entries']:
            path = safe_target(destination, entry['path'])
            if entry['kind'] == 'directory':
                path.mkdir(parents=True, exist_ok=True)
            elif entry['kind'] == 'link':
                link_entries.append(entry)
            else:
                path.parent.mkdir(parents=True, exist_ok=True)
                with bundle.open(entry['path']) as reader, path.open('xb') as writer:
                    while chunk := reader.read(1024 * 1024):
                        writer.write(chunk)
                if digest(path) != entry['sha256']:
                    raise ValueError(f'Restored hash mismatch: {entry["path"]}')
                os.utime(path, ns=(entry['mtime_ns'], entry['mtime_ns']))
                if os.name != 'nt':
                    path.chmod(stat.S_IMODE(entry['mode']))
    for entry in link_entries:
        if links == 'create':
            path = safe_target(destination, entry['path'])
            path.parent.mkdir(parents=True, exist_ok=True)
            os.symlink(entry['target'], path, target_is_directory=entry.get('directory', False))
    if links == 'record' and link_entries:
        (destination / 'RESTORE_WSL_LINKS.json').write_text(json.dumps(link_entries, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    print(json.dumps({'restored_regular_files': report['counts']['file'], 'directories': report['counts']['directory'], 'links': len(link_entries), 'link_mode': links, 'destination': str(destination)}, indent=2))


def main():
    """Run a capture, verify or restore operation without shell interpolation."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command', choices=('capture', 'verify', 'restore'))
    parser.add_argument('--source')
    parser.add_argument('--archive', required=True)
    parser.add_argument('--manifest', required=True)
    parser.add_argument('--destination')
    parser.add_argument('--links', choices=('create', 'record'), default='create' if os.name != 'nt' else 'record')
    args = parser.parse_args()
    if args.command == 'capture':
        if not args.source:
            parser.error('capture requires --source')
        capture(args.source, args.archive, args.manifest)
    elif args.command == 'verify':
        verify(args.archive, args.manifest)
    else:
        if not args.destination:
            parser.error('restore requires --destination')
        restore(args.archive, args.manifest, args.destination, args.links)


if __name__ == '__main__':
    main()
