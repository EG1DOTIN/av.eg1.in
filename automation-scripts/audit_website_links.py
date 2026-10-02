"""
Audit Website Links and Asset References
Audits all internal relative links, script sources, and image tags across the pyEGClamUI website.
"""

import os
import re
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent

def audit_html_files():
    html_files = list(ROOT_DIR.glob("*.html"))
    errors = []
    checked_links = 0

    print(f"Auditing {len(html_files)} HTML files in {ROOT_DIR}...\n")

    for html_path in html_files:
        content = html_path.read_text(encoding="utf-8")
        rel_html_path = html_path.name

        # Match href and src attributes (relative paths)
        matches = re.findall(r'(?:href|src)=["\']([^"\']+)["\']', content)
        for link in matches:
            # Skip external links, fragments, mailto, javascript
            if link.startswith(("http://", "https://", "#", "mailto:", "javascript:")):
                continue

            # Strip fragments or query params
            clean_link = link.split("#")[0].split("?")[0]
            if not clean_link:
                continue

            target_path = (ROOT_DIR / clean_link).resolve()
            checked_links += 1

            if not target_path.exists():
                errors.append(f"[{rel_html_path}] Broken relative link: '{link}' -> Resolved: {target_path}")

    print(f"Total internal links/assets checked: {checked_links}")
    if errors:
        print(f"FAILED: Found {len(errors)} broken links/references:")
        for err in errors:
            print("  -", err)
        return False
    else:
        print("SUCCESS: All internal links and asset references are valid!")
        return True

if __name__ == "__main__":
    success = audit_html_files()
    exit(0 if success else 1)
