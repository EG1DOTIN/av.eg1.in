"""
Sync Documentation from GitHub Repository
Fetches the latest technical markdown documents directly from the pyEGClamUI
GitHub repository (main branch) and compiles assets/js/docs-data.js.
"""

import json
import os
import sys
import urllib.request
from pathlib import Path

# Add script directory to sys.path so we can import build_docs_data
SCRIPT_DIR = Path(__file__).resolve().parent
ROOT_DIR = SCRIPT_DIR.parent
sys.path.insert(0, str(SCRIPT_DIR))

from build_docs_data import build_docs_data

GITHUB_API_TREE = "https://api.github.com/repos/EG1DOTIN/pyEGClamUI/git/trees/main?recursive=1"
GITHUB_RAW_BASE = "https://raw.githubusercontent.com/EG1DOTIN/pyEGClamUI/main/"
HELP_DOCS_DIR = ROOT_DIR / "pyEGClamUI-Docs"

def sync_docs() -> bool:
    print(f"Connecting to GitHub API to discover repository documents...")
    req = urllib.request.Request(
        GITHUB_API_TREE,
        headers={"User-Agent": "pyEGClamUI-DocSync/1.0", "Accept": "application/vnd.github.v3+json"}
    )

    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except Exception as e:
        print(f"Error querying GitHub API: {e}")
        return False

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
        raw_url = GITHUB_RAW_BASE + file_path
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

    # Now rebuild the offline docs-data.js
    print("\nCompiling assets/js/docs-data.js from updated documentation files...")
    rebuild_success = build_docs_data()

    if rebuild_success:
        print("\nDocs synchronization and bundling complete!")
    return rebuild_success

if __name__ == "__main__":
    success = sync_docs()
    sys.exit(0 if success else 1)
