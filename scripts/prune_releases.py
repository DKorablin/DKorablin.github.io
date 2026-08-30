#!/usr/bin/env python3
"""Prune old release entries/folders from _data/*.yml, keeping only the newest N per project."""
import shutil
import sys
from pathlib import Path

import yaml

KEEP_COUNT = 10
REPO_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = REPO_ROOT / "_data"


def prune_project(data_file: Path) -> bool:
    project = data_file.stem
    with data_file.open("r", encoding="utf-8") as f:
        entries = yaml.safe_load(f) or []

    keep, drop = entries[:KEEP_COUNT], entries[KEEP_COUNT:]
    if not drop:
        print(f"{project}: {len(keep)} release(s), nothing to prune")
        return False

    for entry in drop:
        release_dir = REPO_ROOT / project / entry["tag"]
        if release_dir.is_dir():
            shutil.rmtree(release_dir)

    with data_file.open("w", encoding="utf-8") as f:
        yaml.dump(keep, f, default_flow_style=False, sort_keys=False, allow_unicode=True)

    print(f"{project}: kept {len(keep)}, dropped {len(drop)}")
    return True


def main() -> None:
    for data_file in sorted(DATA_DIR.glob("*.yml")):
        prune_project(data_file)

if __name__ == "__main__":
    sys.exit(main())