# Windows restore notes

Maintainer: sunshine-engineer. Modified: 2026-11-11.

Captured Git checkpoint refs can contain paths longer than the legacy Windows limit. After restoring, enable long paths in that restored repository before checking all refs or running Git integrity checks:

```powershell
git -C "D:\restored\YOUR_PROJECT" config core.longpaths true
git -C "D:\restored\YOUR_PROJECT" fsck --full
```

Use a short restoration root and Python 3.11 or newer. The restore helper validates the archived content before extraction. Windows `--links record` records WSL links in RESTORE_WSL_LINKS.json; Linux `--links create` recreates them. Rebuild virtual environments and native Node dependencies for the new device instead of relying on copied environments.
