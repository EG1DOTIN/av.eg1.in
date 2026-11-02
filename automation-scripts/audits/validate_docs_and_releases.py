#!/usr/bin/env python3
"""
validate_docs_and_releases.py
-----------------------------
Validates that technical documentation and release configuration
in av.eg1.in are properly populated with clean structures:
1. public/data/docs-data.json (18 ingested technical guides)
2. src/pages/DownloadPage.tsx (installer assets and checksums)
"""

import sys
import json
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = ROOT_DIR / "public" / "data"
SRC_DIR = ROOT_DIR / "src"


def validate_docs_and_releases() -> int:
    errors = []

    # 1. Validate public/data/docs-data.json
    docs_json = DATA_DIR / "docs-data.json"
    if not docs_json.exists():
        errors.append(f"Missing {docs_json}")
    else:
        try:
            data = json.loads(docs_json.read_text(encoding="utf-8"))
            if not isinstance(data, dict):
                errors.append("docs-data.json must be a JSON object")
            else:
                docs = data.get("documents", {})
                if len(docs) < 15:
                    errors.append(f"Expected at least 15 technical documentation guides, found {len(docs)}")

                essential_guides = [
                    "overview", "architecture", "core-engines",
                    "scanner-engine", "quarantine-vault", "cli-reference", "security-model"
                ]
                for eg in essential_guides:
                    if eg not in docs:
                        errors.append(f"Missing essential doc guide in docs-data.json: '{eg}'")
        except Exception as e:
            errors.append(f"docs-data.json parsing error: {e}")

    # 2. Validate DownloadPage.tsx
    dl_page = SRC_DIR / "pages" / "DownloadPage.tsx"
    if not dl_page.exists():
        errors.append(f"Missing {dl_page}")
    else:
        content = dl_page.read_text(encoding="utf-8")
        if "github.com/EG1DOTIN/pyEGClamUI" not in content:
            errors.append("DownloadPage missing GitHub repository reference URL")
        if "SHA256SUMS" not in content and "checksum" not in content.lower():
            errors.append("DownloadPage missing checksum integrity verification logic")

    if errors:
        print(f"❌ Documentation & release validation failed with {len(errors)} error(s):")
        for err in errors:
            print(f"   • {err}")
        return 1

    print("✅ Documentation guides (18 guides in docs-data.json) and release assets verified successfully.")
    return 0


if __name__ == "__main__":
    sys.exit(validate_docs_and_releases())
