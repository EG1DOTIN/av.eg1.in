"""
Sync Site Components (Partials) to HTML Pages
Synchronizes master header and footer templates from partials/ across all HTML pages.
Automatically sets the active navigation state based on current page filename.
"""

import re
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
PARTIALS_DIR = ROOT_DIR / "partials"
HEADER_PARTIAL = PARTIALS_DIR / "header.html"
FOOTER_PARTIAL = PARTIALS_DIR / "footer.html"

# Mapping of HTML filename to its navigation href
NAV_PAGES = {
    "index.html": "index.html",
    "documentation.html": "documentation.html",
    "ui-preview.html": "ui-preview.html",
    "download.html": "download.html",
    "getting-started.html": "getting-started.html",
    "how-to-use.html": "getting-started.html",
    "about.html": "about.html",
    "updates.html": "updates.html",
}

def render_header_for_page(filename: str, header_template: str) -> str:
    """Renders header template with active class applied only to the current page."""
    # First normalize all nav links to 'class="nav-link"'
    rendered = re.sub(
        r'(<a\s+href="[^"]*"\s+class=")nav-link(?:\s+active)?(")',
        r'\g<1>nav-link\g<2>',
        header_template
    )

    # If this page is in NAV_PAGES, set its link to 'class="nav-link active"'
    if filename in NAV_PAGES:
        target_href = NAV_PAGES[filename]
        rendered = re.sub(
            rf'(<a\s+href="{re.escape(target_href)}"\s+class=")nav-link(")',
            r'\g<1>nav-link active\g<2>',
            rendered
        )

    return rendered.strip()

def render_footer(footer_template: str) -> str:
    """Renders footer template."""
    return footer_template.strip()

def sync_components() -> bool:
    if not HEADER_PARTIAL.exists() or not FOOTER_PARTIAL.exists():
        print(f"Error: Partials directory or template files missing in {PARTIALS_DIR}")
        return False

    header_template = HEADER_PARTIAL.read_text(encoding="utf-8")
    footer_template = FOOTER_PARTIAL.read_text(encoding="utf-8")

    html_files = [f for f in ROOT_DIR.glob("*.html") if f.name not in ("screenshots.html", "how-to-use.html")]
    updated_files = 0

    print(f"Syncing master partials across {len(html_files)} HTML pages...")

    for html_path in html_files:
        content = html_path.read_text(encoding="utf-8")
        original_content = content
        filename = html_path.name

        rendered_header = render_header_for_page(filename, header_template)
        rendered_footer = render_footer(footer_template)

        # 1. Sync or wrap header template
        header_block = f"<!-- template:header -->\n{rendered_header}\n  <!-- /template:header -->"
        if "<!-- template:header -->" in content:
            content = re.sub(
                r'<!--\s*template:header\s*-->.*?<!--\s*/template:header\s*-->',
                header_block,
                content,
                flags=re.DOTALL
            )
        else:
            # Wrap existing <header class="site-header">...</header>
            content = re.sub(
                r'<header\s+class="site-header">.*?</header>',
                header_block,
                content,
                flags=re.DOTALL
            )

        # 2. Sync or wrap footer template
        footer_block = f"<!-- template:footer -->\n{rendered_footer}\n  <!-- /template:footer -->"
        if "<!-- template:footer -->" in content:
            content = re.sub(
                r'<!--\s*template:footer\s*-->.*?<!--\s*/template:footer\s*-->',
                footer_block,
                content,
                flags=re.DOTALL
            )
        else:
            # Wrap existing <footer class="site-footer">...</footer>
            content = re.sub(
                r'<footer\s+class="site-footer">.*?</footer>',
                footer_block,
                content,
                flags=re.DOTALL
            )

        if content != original_content:
            html_path.write_text(content, encoding="utf-8")
            print(f"  Synced components: {filename}")
            updated_files += 1

    print(f"\nDone! Components synchronized across {updated_files} HTML files.")
    return True

if __name__ == "__main__":
    sync_components()
