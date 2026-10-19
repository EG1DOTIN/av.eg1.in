"""
Sync Latest GitHub Release to Site Config & HTML
Fetches latest release metadata directly from the pyEGClamUI GitHub repository
and synchronizes site-config.json and all HTML pages.
"""

import argparse
import json
import os
import re
import sys
import urllib.request
from datetime import datetime
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
ROOT_DIR = SCRIPT_DIR.parent
CONFIG_PATH = ROOT_DIR / "site-config.json"

if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

try:
    from sync_site_config import sync_config
except ImportError:
    sync_config = None


def format_release_date(iso_string: str) -> str:
    """Formats ISO 8601 timestamp (e.g. 2026-10-03T14:22:10Z) into 'Month Year'."""
    if not iso_string:
        return ""
    try:
        clean_iso = iso_string.replace("Z", "+00:00")
        dt = datetime.fromisoformat(clean_iso)
        return dt.strftime("%B %Y")
    except Exception:
        return iso_string[:10]


def fetch_latest_release(repo_slug: str) -> dict:
    """Fetches the latest release object from GitHub Releases API."""
    url = f"https://api.github.com/repos/{repo_slug}/releases/latest"
    headers = {
        "User-Agent": "pyEGClamUI-ReleaseSync/1.0",
        "Accept": "application/vnd.github.v3+json",
    }
    token = os.environ.get("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"

    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode("utf-8"))


def find_platform_assets(assets: list) -> dict:
    """Matches release asset URLs for Windows, Linux, macOS, and checksums."""
    matched = {
        "windows_exe": None,
        "windows_zip": None,
        "linux_tar": None,
        "macos_zip": None,
        "checksums": None,
    }

    if not isinstance(assets, list):
        return matched

    for asset in assets:
        name = asset.get("name", "")
        lower = name.lower()
        url = asset.get("browser_download_url", "")
        size = asset.get("size", 0)

        item = {"name": name, "url": url, "size": size}

        if lower.endswith(".exe"):
            # Prefer setup installer if multiple .exe exist
            if not matched["windows_exe"] or "setup" in lower:
                matched["windows_exe"] = item
        elif "windows" in lower and lower.endswith(".zip"):
            matched["windows_zip"] = item
        elif ("linux" in lower or "x86_64" in lower) and (
            lower.endswith(".tar.gz") or lower.endswith(".appimage") or lower.endswith(".tgz")
        ):
            matched["linux_tar"] = item
        elif ("macos" in lower or "darwin" in lower or "arm64" in lower) and (
            lower.endswith(".zip") or lower.endswith(".dmg")
        ):
            matched["macos_zip"] = item
        elif "sha256" in lower or "checksum" in lower:
            matched["checksums"] = item

    return matched


def sync_releases(dry_run: bool = False, run_html_sync: bool = True) -> bool:
    if not CONFIG_PATH.exists():
        print(f"Error: {CONFIG_PATH} not found!")
        return False

    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        config = json.load(f)

    repo_url = config.get("github", {}).get("repo", "https://github.com/EG1DOTIN/pyEGClamUI")
    repo_slug = re.sub(r"^https?://github\.com/", "", repo_url).strip("/")

    print(f"Connecting to GitHub API for repository '{repo_slug}'...")
    try:
        latest = fetch_latest_release(repo_slug)
    except Exception as e:
        print(f"Warning: Failed to fetch latest release from GitHub API: {e}")
        return False

    raw_tag = latest.get("tag_name", "")
    new_version = raw_tag.lstrip("v")
    if not new_version:
        print("Error: Release payload missing valid tag_name.")
        return False

    pub_date_raw = latest.get("published_at", "")
    new_release_date = format_release_date(pub_date_raw)
    is_prerelease = bool(latest.get("prerelease", False))

    print(f"Discovered GitHub release: v{new_version} ({new_release_date})")
    assets = find_platform_assets(latest.get("assets", []))

    # Update config project metadata
    old_version = config.get("project", {}).get("version", "")
    config["project"]["version"] = new_version
    if new_release_date:
        config["project"]["releaseDate"] = new_release_date

    # Ensure downloads dict exists
    if "downloads" not in config:
        config["downloads"] = {}

    # Map direct download URLs
    if assets["windows_exe"]:
        config["downloads"]["windows"] = assets["windows_exe"]["url"]
        if "platforms" in config and "windows" in config["platforms"]:
            config["platforms"]["windows"]["package"] = assets["windows_exe"]["name"]
            config["platforms"]["windows"]["downloadUrl"] = assets["windows_exe"]["url"]

    if assets["windows_zip"]:
        config["downloads"]["windowsZip"] = assets["windows_zip"]["url"]
        if "platforms" in config and "windows" in config["platforms"]:
            config["platforms"]["windows"]["zipPackage"] = assets["windows_zip"]["name"]
            config["platforms"]["windows"]["zipDownloadUrl"] = assets["windows_zip"]["url"]

    if assets["linux_tar"]:
        config["downloads"]["linux"] = assets["linux_tar"]["url"]
        if "platforms" in config and "linux" in config["platforms"]:
            config["platforms"]["linux"]["package"] = assets["linux_tar"]["name"]
            config["platforms"]["linux"]["downloadUrl"] = assets["linux_tar"]["url"]

    if assets["macos_zip"]:
        config["downloads"]["macos"] = assets["macos_zip"]["url"]
        if "platforms" in config and "macos" in config["platforms"]:
            config["platforms"]["macos"]["package"] = assets["macos_zip"]["name"]
            config["platforms"]["macos"]["downloadUrl"] = assets["macos_zip"]["url"]

    if assets["checksums"]:
        config["downloads"]["checksums"] = assets["checksums"]["url"]

    if dry_run:
        print("\n[DRY RUN] Updated site-config.json payload:")
        print(json.dumps(config, indent=2))
        return True

    with open(CONFIG_PATH, "w", encoding="utf-8") as f:
        json.dump(config, f, indent=2)
        f.write("\n")

    print(f"Successfully updated {CONFIG_PATH} (v{old_version} -> v{new_version}).")

    if run_html_sync and sync_config:
        print("\nRunning sync_site_config.py to synchronize HTML pages...")
        sync_config()

    return True


def main():
    parser = argparse.ArgumentParser(description="Synchronize latest GitHub release to site-config.json and HTML.")
    parser.add_argument("--dry-run", action="store_true", help="Print changes without modifying files.")
    parser.add_argument("--no-html-sync", action="store_true", help="Do not run sync_site_config.py.")
    args = parser.parse_args()

    success = sync_releases(dry_run=args.dry_run, run_html_sync=not args.no_html_sync)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
