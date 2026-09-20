#!/usr/bin/env python3
"""Remove one specific release (data entry + folder) of one project, e.g. AutoClickerMaui v1.1.7."""
import os
import shutil
import sys
from pathlib import Path

import yaml

REPO_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = REPO_ROOT / "_data"


def read_env(name: str, what: str) -> str:
    value = os.environ.get(name, "").strip()
    if not value:
        sys.exit(f"{name} environment variable is required ({what})")
    return value


def main() -> None:
    project = read_env("PROJECT", "project name, e.g. AutoClickerMaui")
    tag = read_env("VERSION", "release tag, e.g. v1.1.7")

    # Only names that have a data file are accepted, so the value can never point outside the repo
    projects = sorted(p.stem for p in DATA_DIR.glob("*.yml"))
    if project not in projects:
        sys.exit(f"Unknown project {project!r}. Available: {', '.join(projects)}")

    data_file = DATA_DIR / f"{project}.yml"
    with data_file.open("r", encoding="utf-8") as f:
        entries = yaml.safe_load(f) or []

    tags = [entry["tag"] for entry in entries]
    if tag not in tags:
        sys.exit(f"{project} has no release {tag!r}. Available: {', '.join(tags)}")
    if len(entries) == 1:
        sys.exit(f"{tag} is the only release of {project}; refusing to leave the project without releases")

    keep = [entry for entry in entries if entry["tag"] != tag]

    release_dir = REPO_ROOT / project / tag
    if release_dir.is_dir():
        shutil.rmtree(release_dir)

    with data_file.open("w", encoding="utf-8") as f:
        yaml.dump(keep, f, default_flow_style=False, sort_keys=False, allow_unicode=True)

    print(f"{project}: removed {tag}, {len(keep)} release(s) left, latest is {keep[0]['tag']}")


if __name__ == "__main__":
    main()
