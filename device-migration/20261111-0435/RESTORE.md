# Device recovery

Repository: https://github.com/sunshine-engineer/sunshine-engineer.github.io

Download **all** release assets from https://github.com/sunshine-engineer/sunshine-engineer.github.io/releases/tag/device-backup-20261111-0435. A normal Git clone does not include these assets. Keep this guide and the release together.

```powershell
gh release download device-backup-20261111-0435 --repo sunshine-engineer/sunshine-engineer.github.io --dir recovery-assets
cd recovery-assets
```

Use Python 3.11 or newer. For each ZIP/manifest pair listed in SOURCE_STATE.json, choose a destination that does not exist:

```powershell
python migration_backup.py restore --archive LABEL.zip --manifest LABEL.manifest.json --destination D:\restored\LABEL --links record
```

On Linux use `python3` and `--links create`; WSL links recorded on Windows are listed in RESTORE_WSL_LINKS.json. Recreate environments (`python -m venv .venv`, dependency installation, `npm ci` where applicable) instead of running copied virtual environments. The original README and dependency lock/config files are included in the full snapshot.

`all-history.bundle` contains remote and local Git refs, including auxiliary refs. Check with `git bundle verify all-history.bundle`; recover a separate history mirror with `git clone --mirror all-history.bundle history.git`. SOURCE_STATE.json maps local branch tips to dated namespaced branches on GitHub. Both knowledgebase clones are independent snapshots. Do not overlay them.

SHA256SUMS.txt covers the uploaded payloads. In PowerShell use `Get-FileHash -Algorithm SHA256`; on Linux run `sha256sum -c SHA256SUMS.txt`. The restore helper also verifies each archived file and the exact path inventory.

Every source path is captured, including ignored files, Git metadata, caches and empty directories. Manifest `redactions` records any current text file credential substitutions with original/stored hashes; dummy values must be replaced using fresh credentials on the new device. Private historical Git objects may retain historical credentials; keep private releases private. Never assume expired credentials provide continuing access.

The full snapshots are authoritative for uncommitted/ignored files. This backup branch supplies recovery documentation and the captured source HEAD. External cloud services, credentials, databases, Docker volumes and files outside these source roots are not implicitly included. Application runtime/cloud acceptance must be verified on the target device before removing original data. For Chess, separate database and volume coverage is required; the workspace archive alone does not establish complete recovery.
