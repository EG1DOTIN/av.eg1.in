"""
Sync Site Config to HTML Pages
Synchronizes metadata from site-config.json across all HTML files.
"""

import json
import re
import sys
from pathlib import Path

# Add script directory to sys.path for direct module resolution
SCRIPT_DIR = Path(__file__).resolve().parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

from sync_components import sync_components

ROOT_DIR = SCRIPT_DIR.parent
CONFIG_PATH = ROOT_DIR / "site-config.json"

def load_config():
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def sync_config():
    if not CONFIG_PATH.exists():
        print(f"Error: {CONFIG_PATH} does not exist!")
        return False

    # Synchronize master header and footer partials first
    sync_components()

    config = load_config()
    version = config["project"]["version"]
    stage = config["project"]["releaseStage"]
    repo_url = config["github"]["repo"]
    website_repo_url = config["github"].get("websiteRepo", "https://github.com/EG1DOTIN/av.eg1.in")
    issues_url = config["github"]["issues"]
    releases_url = config["github"]["releases"]
    contact_url = config["contact"]["url"]
    privacy_url = config["contact"]["privacyPolicy"]
    official_url = config["contact"]["officialSite"]
    dl_win = config.get("downloads", {}).get("windows", "")
    dl_linux = config.get("downloads", {}).get("linux", "")
    dl_mac = config.get("downloads", {}).get("macos", "")
    screenshots = config.get("screenshots", [])

    html_files = [f for f in ROOT_DIR.glob("*.html") if f.name not in ("screenshots.html", "how-to-use.html")]
    updated_files = 0

    print(f"Syncing site-config.json across {len(html_files)} HTML pages...")

    for html_path in html_files:
        content = html_path.read_text(encoding="utf-8")
        original_content = content

        # 1. Update version markers: <!-- config:version -->...<!-- /config:version -->
        content = re.sub(
            r'<!--\s*config:version\s*-->.*?<!--\s*/config:version\s*-->',
            f'<!-- config:version -->{version}<!-- /config:version -->',
            content,
            flags=re.DOTALL
        )

        # 2. Update release stage markers: <!-- config:releaseStage -->...<!-- /config:releaseStage -->
        content = re.sub(
            r'<!--\s*config:releaseStage\s*-->.*?<!--\s*/config:releaseStage\s*-->',
            f'<!-- config:releaseStage -->{stage}<!-- /config:releaseStage -->',
            content,
            flags=re.DOTALL
        )

        # 3. Update GitHub Repo markers / URLs
        content = re.sub(
            r'<!--\s*config:githubRepo\s*-->.*?<!--\s*/config:githubRepo\s*-->',
            f'<!-- config:githubRepo -->{repo_url}<!-- /config:githubRepo -->',
            content,
            flags=re.DOTALL
        )

        content = re.sub(
            r'<!--\s*config:websiteRepo\s*-->.*?<!--\s*/config:websiteRepo\s*-->',
            f'<!-- config:websiteRepo -->{website_repo_url}<!-- /config:websiteRepo -->',
            content,
            flags=re.DOTALL
        )

        # 4. Update GitHub Issues markers / URLs
        content = re.sub(
            r'<!--\s*config:githubIssues\s*-->.*?<!--\s*/config:githubIssues\s*-->',
            f'<!-- config:githubIssues -->{issues_url}<!-- /config:githubIssues -->',
            content,
            flags=re.DOTALL
        )

        # 5. Update GitHub Releases markers / URLs
        content = re.sub(
            r'<!--\s*config:githubReleases\s*-->.*?<!--\s*/config:githubReleases\s*-->',
            f'<!-- config:githubReleases -->{releases_url}<!-- /config:githubReleases -->',
            content,
            flags=re.DOTALL
        )

        # 6. Update Contact URL markers
        content = re.sub(
            r'<!--\s*config:contactUrl\s*-->.*?<!--\s*/config:contactUrl\s*-->',
            f'<!-- config:contactUrl -->{contact_url}<!-- /config:contactUrl -->',
            content,
            flags=re.DOTALL
        )

        # 7. Update Privacy Policy markers / URLs
        content = re.sub(
            r'<!--\s*config:privacyPolicy\s*-->.*?<!--\s*/config:privacyPolicy\s*-->',
            f'<!-- config:privacyPolicy -->{privacy_url}<!-- /config:privacyPolicy -->',
            content,
            flags=re.DOTALL
        )

        # 8. Update Official Site markers / URLs
        content = re.sub(
            r'<!--\s*config:officialSite\s*-->.*?<!--\s*/config:officialSite\s*-->',
            f'<!-- config:officialSite -->{official_url}<!-- /config:officialSite -->',
            content,
            flags=re.DOTALL
        )

        # 9. Update Platform Direct Download markers
        if dl_win:
            content = re.sub(
                r'<!--\s*config:downloadWindows\s*-->.*?<!--\s*/config:downloadWindows\s*-->',
                f'<!-- config:downloadWindows -->{dl_win}<!-- /config:downloadWindows -->',
                content,
                flags=re.DOTALL
            )
        if dl_linux:
            content = re.sub(
                r'<!--\s*config:downloadLinux\s*-->.*?<!--\s*/config:downloadLinux\s*-->',
                f'<!-- config:downloadLinux -->{dl_linux}<!-- /config:downloadLinux -->',
                content,
                flags=re.DOTALL
            )
        if dl_mac:
            content = re.sub(
                r'<!--\s*config:downloadMacos\s*-->.*?<!--\s*/config:downloadMacos\s*-->',
                f'<!-- config:downloadMacos -->{dl_mac}<!-- /config:downloadMacos -->',
                content,
                flags=re.DOTALL
            )

        # 10. Sync any data-config hrefs on anchor tags
        content = re.sub(
            r'(<a\s+[^>]*href=")[^"]*("[^>]*data-config="githubRepo"[^>]*>)',
            rf'\g<1>{repo_url}\g<2>',
            content
        )
        content = re.sub(
            r'(<a\s+[^>]*data-config="githubRepo"[^>]*href=")[^"]*(")',
            rf'\g<1>{repo_url}\g<2>',
            content
        )
        content = re.sub(
            r'(<a\s+[^>]*href=")[^"]*("[^>]*data-config="websiteRepo"[^>]*>)',
            rf'\g<1>{website_repo_url}\g<2>',
            content
        )
        content = re.sub(
            r'(<a\s+[^>]*data-config="websiteRepo"[^>]*href=")[^"]*(")',
            rf'\g<1>{website_repo_url}\g<2>',
            content
        )
        content = re.sub(
            r'(<a\s+[^>]*href=")[^"]*("[^>]*data-config="githubIssues"[^>]*>)',
            rf'\g<1>{issues_url}\g<2>',
            content
        )
        content = re.sub(
            r'(<a\s+[^>]*data-config="githubIssues"[^>]*href=")[^"]*(")',
            rf'\g<1>{issues_url}\g<2>',
            content
        )
        content = re.sub(
            r'(<a\s+[^>]*href=")[^"]*("[^>]*data-config="githubReleases"[^>]*>)',
            rf'\g<1>{releases_url}\g<2>',
            content
        )
        content = re.sub(
            r'(<a\s+[^>]*data-config="githubReleases"[^>]*href=")[^"]*(")',
            rf'\g<1>{releases_url}\g<2>',
            content
        )
        content = re.sub(
            r'(<a\s+[^>]*href=")[^"]*("[^>]*data-config="contactUrl"[^>]*>)',
            rf'\g<1>{contact_url}\g<2>',
            content
        )
        content = re.sub(
            r'(<a\s+[^>]*data-config="contactUrl"[^>]*href=")[^"]*(")',
            rf'\g<1>{contact_url}\g<2>',
            content
        )
        content = re.sub(
            r'(<a\s+[^>]*href=")[^"]*("[^>]*data-config="privacyPolicy"[^>]*>)',
            rf'\g<1>{privacy_url}\g<2>',
            content
        )
        content = re.sub(
            r'(<a\s+[^>]*data-config="privacyPolicy"[^>]*href=")[^"]*(")',
            rf'\g<1>{privacy_url}\g<2>',
            content
        )
        content = re.sub(
            r'(<a\s+[^>]*href=")[^"]*("[^>]*data-config="officialSite"[^>]*>)',
            rf'\g<1>{official_url}\g<2>',
            content
        )
        content = re.sub(
            r'(<a\s+[^>]*data-config="officialSite"[^>]*href=")[^"]*(")',
            rf'\g<1>{official_url}\g<2>',
            content
        )

        if dl_win:
            content = re.sub(
                r'(<a\s+[^>]*href=")[^"]*("[^>]*data-config="downloadWindows"[^>]*>)',
                rf'\g<1>{dl_win}\g<2>',
                content
            )
            content = re.sub(
                r'(<a\s+[^>]*data-config="downloadWindows"[^>]*href=")[^"]*(")',
                rf'\g<1>{dl_win}\g<2>',
                content
            )
        if dl_linux:
            content = re.sub(
                r'(<a\s+[^>]*href=")[^"]*("[^>]*data-config="downloadLinux"[^>]*>)',
                rf'\g<1>{dl_linux}\g<2>',
                content
            )
            content = re.sub(
                r'(<a\s+[^>]*data-config="downloadLinux"[^>]*href=")[^"]*(")',
                rf'\g<1>{dl_linux}\g<2>',
                content
            )
        if dl_mac:
            content = re.sub(
                r'(<a\s+[^>]*href=")[^"]*("[^>]*data-config="downloadMacos"[^>]*>)',
                rf'\g<1>{dl_mac}\g<2>',
                content
            )
            content = re.sub(
                r'(<a\s+[^>]*data-config="downloadMacos"[^>]*href=")[^"]*(")',
                rf'\g<1>{dl_mac}\g<2>',
                content
            )

        # 11. Automatically normalize legacy privacypolicy.aspx to privacyPolicy URL
        content = content.replace("https://eg1.in/privacypolicy.aspx", privacy_url)

        # 11. Update Screenshots Gallery in screenshots.html if marker present
        if html_path.name == "screenshots.html" and "<!-- config:screenshotsGallery -->" in content:
            gallery_cards = []
            for sc in screenshots:
                card = f"""          <div class="gallery-card" data-full-src="{sc['src']}">
            <img src="{sc['src']}" alt="{sc['title']}" class="gallery-thumb" loading="lazy">
            <div class="gallery-info">
              <div class="gallery-title">{sc['title']}</div>
              <div class="gallery-desc">{sc['desc']}</div>
            </div>
          </div>"""
                gallery_cards.append(card)
            gallery_html = "\n\n".join(gallery_cards)

            content = re.sub(
                r'<!--\s*config:screenshotsGallery\s*-->.*?<!--\s*/config:screenshotsGallery\s*-->',
                f'<!-- config:screenshotsGallery -->\n{gallery_html}\n          <!-- /config:screenshotsGallery -->',
                content,
                flags=re.DOTALL
            )

        if content != original_content:
            html_path.write_text(content, encoding="utf-8")
            print(f"  Updated: {html_path.name}")
            updated_files += 1

    print(f"\nDone! Updated {updated_files} HTML files to version '{version}' ({stage}).")
    return True

if __name__ == "__main__":
    sync_config()
