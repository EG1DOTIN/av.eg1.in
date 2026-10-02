"""
Download Vendor Assets for pyEGClamUI Documentation Portal
Vendors marked.js, prism.js (with python, bash, powershell, json, ini, yaml),
and mermaid.js locally to ensure 100% offline functionality with zero external dependencies.
"""

import ssl
import urllib.request
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
VENDOR_DIR = ROOT_DIR / "assets" / "vendor"
VENDOR_DIR.mkdir(parents=True, exist_ok=True)

ctx = ssl.create_default_context()

def download_file(url: str, dest_path: Path):
    print(f"Downloading {url} -> {dest_path.name}...")
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, context=ctx) as response:
        content = response.read()
        dest_path.write_bytes(content)
    print(f"  Saved {dest_path.name} ({len(content)} bytes)")

def vendor_prism():
    """Combines prism core with necessary language grammars into a single prism.bundle.js."""
    base_url = "https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/"
    components = [
        "prism.min.js",
        "components/prism-bash.min.js",
        "components/prism-python.min.js",
        "components/prism-powershell.min.js",
        "components/prism-json.min.js",
        "components/prism-ini.min.js",
        "components/prism-yaml.min.js",
        "components/prism-markdown.min.js",
    ]

    bundle_parts = []
    print("Bundling Prism syntax highlighter...")
    for comp in components:
        url = base_url + comp
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, context=ctx) as response:
            bundle_parts.append(response.read().decode('utf-8'))

    bundle_code = "\n;\n".join(bundle_parts)
    dest = VENDOR_DIR / "prism.bundle.js"
    dest.write_text(bundle_code, encoding="utf-8")
    print(f"  Saved {dest.name} ({len(bundle_code)} chars)")

def main():
    print(f"Vendoring third-party assets into {VENDOR_DIR}...")

    # 1. Marked.js
    download_file(
        "https://cdnjs.cloudflare.com/ajax/libs/marked/12.0.2/marked.min.js",
        VENDOR_DIR / "marked.min.js"
    )

    # 2. Prism Bundle
    vendor_prism()

    # 3. Mermaid.js
    download_file(
        "https://cdnjs.cloudflare.com/ajax/libs/mermaid/10.9.0/mermaid.min.js",
        VENDOR_DIR / "mermaid.min.js"
    )

    print("\nAll vendor assets successfully downloaded and cached locally!")

if __name__ == "__main__":
    main()
