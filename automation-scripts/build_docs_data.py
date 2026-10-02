"""
Build Documentation Data Store
Compiles all technical Markdown documents from pyEGClamUI-Docs/ into
assets/js/docs-data.js for instant client-side rendering and offline support.
"""

import json
import re
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
HELP_DOCS_DIR = ROOT_DIR / "pyEGClamUI-Docs"
OUTPUT_FILE = ROOT_DIR / "assets" / "js" / "docs-data.js"

# Grouping and ordering of the documentation suite
DOC_METADATA = {
    # Getting Started
    "README.md": {
        "id": "overview",
        "title": "Project Overview & Quickstart",
        "category": "Getting Started",
        "badge": "Overview",
        "order": 1,
    },
    "docs/README.md": {
        "id": "docs-index",
        "title": "Documentation Index & Subsystems Map",
        "category": "Getting Started",
        "badge": "Index",
        "order": 2,
    },
    # Core Architecture
    "docs/ARCHITECTURE.md": {
        "id": "architecture",
        "title": "System Architecture & Concurrency",
        "category": "Core Architecture",
        "badge": "Core",
        "order": 10,
    },
    "docs/CORE_ENGINES.md": {
        "id": "core-engines",
        "title": "Core Engines & Subsystems",
        "category": "Core Architecture",
        "badge": "Engines",
        "order": 11,
    },
    "docs/GUI_DESIGN_SYSTEM.md": {
        "id": "gui-design-system",
        "title": "GUI Architecture & Design System",
        "category": "Core Architecture",
        "badge": "UI/UX",
        "order": 12,
    },
    # Protection Subsystems
    "docs/REALTIME_GUARD.md": {
        "id": "realtime-guard",
        "title": "Real-Time Filesystem Guard",
        "category": "Subsystem Deep Dives",
        "badge": "Guard",
        "order": 20,
    },
    "docs/SCANNER_ENGINE.md": {
        "id": "scanner-engine",
        "title": "Scanner Subsystem & Stream Parsing",
        "category": "Subsystem Deep Dives",
        "badge": "Scan",
        "order": 21,
    },
    "docs/QUARANTINE_VAULT.md": {
        "id": "quarantine-vault",
        "title": "Quarantine Vault & Remediation",
        "category": "Subsystem Deep Dives",
        "badge": "Vault",
        "order": 22,
    },
    "docs/SIGNATURE_UPDATER.md": {
        "id": "signature-updater",
        "title": "Signature Database Updater",
        "category": "Subsystem Deep Dives",
        "badge": "Updater",
        "order": 23,
    },
    "docs/TRAY_AND_LIFECYCLE.md": {
        "id": "tray-and-lifecycle",
        "title": "System Tray & App Lifecycle",
        "category": "Subsystem Deep Dives",
        "badge": "Tray",
        "order": 24,
    },
    "docs/LOGGING.md": {
        "id": "logging",
        "title": "Dual-Track Logging System",
        "category": "Subsystem Deep Dives",
        "badge": "Logs",
        "order": 25,
    },
    "docs/TELEMETRY_LOGIC.md": {
        "id": "telemetry-logic",
        "title": "Transparent Opt-In Telemetry",
        "category": "Subsystem Deep Dives",
        "badge": "Privacy",
        "order": 26,
    },
    # Operations & Reference
    "docs/CLI_REFERENCE.md": {
        "id": "cli-reference",
        "title": "CLI Utilities & Syntax Reference",
        "category": "Reference & Hardening",
        "badge": "CLI",
        "order": 30,
    },
    "docs/CONFIG_SCHEMA.md": {
        "id": "config-schema",
        "title": "Configuration Schemas & Storage",
        "category": "Reference & Hardening",
        "badge": "Config",
        "order": 31,
    },
    "docs/CROSS_PLATFORM.md": {
        "id": "cross-platform",
        "title": "Cross-Platform Hardening",
        "category": "Reference & Hardening",
        "badge": "Platform",
        "order": 32,
    },
    "docs/SECURITY_MODEL.md": {
        "id": "security-model",
        "title": "Security & Privacy Model",
        "category": "Reference & Hardening",
        "badge": "Security",
        "order": 33,
    },
}

def extract_heading_title(content: str, fallback: str) -> str:
    """Extracts first H1 title from markdown content."""
    match = re.search(r"^#\s+(.+)$", content, re.MULTILINE)
    if match:
        clean = match.group(1).strip()
        # Remove markdown bold/italics
        clean = re.sub(r"[\*_`]", "", clean)
        return clean
    return fallback

def slugify(text: str) -> str:
    """Creates a URL-safe anchor slug."""
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return text.strip("-")

def extract_headings(content: str) -> list:
    """Extracts H2 and H3 headings for on-page Table of Contents."""
    headings = []
    lines = content.splitlines()
    in_code_block = False

    for line in lines:
        if line.strip().startswith("```"):
            in_code_block = not in_code_block
            continue
        if in_code_block:
            continue

        match = re.match(r"^(#{2,3})\s+(.+)$", line)
        if match:
            level = len(match.group(1))
            raw_title = match.group(2).strip()
            # Clean markdown formatting from title
            clean_title = re.sub(r"\[([^\]]+)\]\([^\)]+\)", r"\1", raw_title)
            clean_title = re.sub(r"[\*_`]", "", clean_title)
            slug = slugify(clean_title)
            headings.append({
                "level": level,
                "title": clean_title,
                "slug": slug
            })

    return headings

def build_docs_data() -> bool:
    if not HELP_DOCS_DIR.exists():
        print(f"Error: {HELP_DOCS_DIR} does not exist!")
        return False

    documents = {}
    link_map = {}
    categories = {}

    print(f"Scanning help documents in {HELP_DOCS_DIR}...")

    # Gather all markdown files
    md_files = list(HELP_DOCS_DIR.rglob("*.md"))
    print(f"Found {len(md_files)} markdown files.")

    for md_path in md_files:
        rel_path = md_path.relative_to(HELP_DOCS_DIR).as_posix()
        raw_content = md_path.read_text(encoding="utf-8")

        meta = DOC_METADATA.get(rel_path, {})
        doc_id = meta.get("id", slugify(md_path.stem))
        title = meta.get("title", extract_heading_title(raw_content, md_path.stem))
        category = meta.get("category", "General")
        badge = meta.get("badge", "Doc")
        order = meta.get("order", 99)

        headings = extract_headings(raw_content)

        doc_data = {
            "id": doc_id,
            "filename": rel_path,
            "title": title,
            "category": category,
            "badge": badge,
            "order": order,
            "headings": headings,
            "content": raw_content,
        }

        documents[doc_id] = doc_data

        # Build alias link mapping
        # Maps relative filenames as written in Markdown links
        link_map[rel_path] = doc_id
        link_map[rel_path.lower()] = doc_id
        link_map[md_path.name] = doc_id
        link_map[md_path.name.lower()] = doc_id
        link_map[doc_id] = doc_id
        if rel_path.startswith("docs/"):
            link_map[rel_path[5:]] = doc_id
            link_map[rel_path[5:].lower()] = doc_id
            link_map[f"../{rel_path}"] = doc_id
            link_map[f"./{rel_path}"] = doc_id

        # Categorize
        if category not in categories:
            categories[category] = []
        categories[category].append({
            "id": doc_id,
            "title": title,
            "badge": badge,
            "order": order,
            "filename": rel_path,
        })

    # Sort documents within categories
    category_order = [
        "Getting Started",
        "Core Architecture",
        "Subsystem Deep Dives",
        "Reference & Hardening"
    ]

    sorted_groups = []
    for cat_name in category_order:
        if cat_name in categories:
            docs = sorted(categories[cat_name], key=lambda x: x["order"])
            sorted_groups.append({
                "category": cat_name,
                "docs": docs
            })

    # Add any remaining categories
    for cat_name, docs in categories.items():
        if cat_name not in category_order:
            sorted_groups.append({
                "category": cat_name,
                "docs": sorted(docs, key=lambda x: x["order"])
            })

    output_payload = {
        "version": "1.0",
        "defaultDoc": "overview",
        "groups": sorted_groups,
        "linkMap": link_map,
        "documents": documents,
    }

    # Ensure parent dir exists
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

    js_content = (
        "// Auto-generated by automation-scripts/build_docs_data.py\n"
        "// Do not edit manually. Generated for pyEGClamUI documentation portal.\n"
        "(function() {\n"
        "  var data = " + json.dumps(output_payload, indent=2, ensure_ascii=False) + ";\n"
        "  if (typeof window !== 'undefined') { window.DOCS_DATA = data; }\n"
        "  if (typeof module !== 'undefined' && module.exports) { module.exports = data; }\n"
        "})();\n"
    )

    OUTPUT_FILE.write_text(js_content, encoding="utf-8")
    print(f"Successfully generated docs data store: {OUTPUT_FILE}")
    print(f"  Total documents compiled: {len(documents)}")
    print(f"  Total link aliases mapped: {len(link_map)}")
    return True

if __name__ == "__main__":
    success = build_docs_data()
    exit(0 if success else 1)
