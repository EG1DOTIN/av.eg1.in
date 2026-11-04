#!/usr/bin/env python3
"""
Sync Documentation from GitHub Repository
Fetches the latest technical markdown documents directly from the pyEGClamUI
GitHub repository (main branch) and compiles public/data/docs-data.json and public/data/docs-data.js.
"""

import json
import os
import sys
import urllib.request
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
ROOT_DIR = SCRIPT_DIR.parent
sys.path.insert(0, str(SCRIPT_DIR))

from build_docs_data import build_docs_data

CONFIG_PATH = ROOT_DIR / "site-config.json"
HELP_DOCS_DIR = ROOT_DIR / "pyEGClamUI-Docs"


def get_repo_slug() -> str:
    if CONFIG_PATH.exists():
        try:
            with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                repo_url = data.get("github", {}).get("repo", "")
                if repo_url:
                    return repo_url.replace("https://github.com/", "").strip("/")
        except Exception:
            pass
    return "EG1DOTIN/pyEGClamUI"


def sync_release_version(repo_slug: str, headers: dict) -> None:
    """Fetches latest release tag and updates site-config.json release version."""
    print(f"\nChecking latest release on GitHub for '{repo_slug}'...")
    release_url = f"https://api.github.com/repos/{repo_slug}/releases/latest"
    req = urllib.request.Request(release_url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=12) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            tag = data.get("tag_name") or data.get("name")
            if tag and CONFIG_PATH.exists():
                clean_ver = tag.strip().lstrip("vV")
                with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                    cfg = json.load(f)
                old_ver = cfg.get("project", {}).get("version", "")
                if "project" not in cfg:
                    cfg["project"] = {}
                cfg["project"]["version"] = clean_ver
                cfg["project"]["rawTag"] = tag.strip()
                if data.get("published_at"):
                    cfg["project"]["publishedAt"] = data["published_at"]
                with open(CONFIG_PATH, "w", encoding="utf-8") as f:
                    json.dump(cfg, f, indent=2, ensure_ascii=False)
                    f.write("\n")
                print(f"  [SYNCED] Release version in site-config.json: {old_ver} -> {clean_ver} ({tag.strip()})")
    except Exception as e:
        print(f"  [INFO] Could not fetch latest release for {repo_slug}: {e}")


def sync_docs() -> bool:
    repo_slug = get_repo_slug()
    github_api_tree = f"https://api.github.com/repos/{repo_slug}/git/trees/main?recursive=1"
    github_raw_base = f"https://raw.githubusercontent.com/{repo_slug}/main/"

    headers = {"User-Agent": "pyEGClamUI-DocSync/1.0", "Accept": "application/vnd.github.v3+json"}
    token = os.environ.get("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"

    # 1. Sync latest release version metadata into site-config.json
    sync_release_version(repo_slug, headers)

    print(f"\nConnecting to GitHub API for '{repo_slug}' to discover repository documents...")

    req = urllib.request.Request(github_api_tree, headers=headers)

    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except Exception as e:
        print(f"Error querying GitHub API ({e}). Falling back to existing local docs.")
        return build_docs_data()

    tree = data.get("tree", [])
    target_files = [
        item["path"] for item in tree
        if (item["path"] == "README.md" or item["path"].startswith("docs/"))
        and (item["path"].endswith(".md") or item["path"].endswith(".gif") or item["path"].endswith(".png") or item["path"].endswith(".svg"))
    ]

    print(f"Found {len(target_files)} documentation assets on GitHub 'main' branch.")
    HELP_DOCS_DIR.mkdir(parents=True, exist_ok=True)

    synced_count = 0
    for file_path in target_files:
        raw_url = github_raw_base + file_path
        dest_path = HELP_DOCS_DIR / file_path
        dest_path.parent.mkdir(parents=True, exist_ok=True)

        try:
            download_req = urllib.request.Request(
                raw_url,
                headers={"User-Agent": "pyEGClamUI-DocSync/1.0"}
            )
            with urllib.request.urlopen(download_req, timeout=15) as dl_resp:
                content = dl_resp.read()
                dest_path.write_bytes(content)
                synced_count += 1
                print(f"  [SYNCED] {file_path} ({len(content)} bytes)")
        except Exception as dl_err:
            print(f"  [ERROR] Failed to fetch {file_path}: {dl_err}")

    print(f"\nSuccessfully synchronized {synced_count}/{len(target_files)} assets to {HELP_DOCS_DIR}")

    # Now rebuild the offline docs stores
    print("\nCompiling public/data/docs-data.json and docs-data.js from updated documentation files...")
    rebuild_success = build_docs_data()

    if rebuild_success:
        print("\nDocs synchronization and bundling complete!")
    return rebuild_success


if __name__ == "__main__":
    success = sync_docs()
    sys.exit(0 if success else 1)
