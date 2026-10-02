# Automation & Maintenance Scripts

This directory houses automated auditing, maintenance, and build tools for the **pyEGClamUI** website.

## Scripts Directory

| Script | Purpose | Execution Command |
| :--- | :--- | :--- |
| `sync_site_config.py` | Reads `site-config.json` and updates version tags, release stage badges, GitHub URLs, and screenshot gallery across all HTML pages (and automatically runs component sync). | `python automation-scripts/sync_site_config.py` |
| `sync_components.py` | Synchronizes master header and footer templates from `partials/` across all HTML pages, automatically managing active navbar states. | `python automation-scripts/sync_components.py` |
| `build_docs_data.py` | Compiles all 16 technical markdown documents from `pyEGClamUI-Docs/` into `assets/js/docs-data.js` for instant client-side rendering and offline support. | `python automation-scripts/build_docs_data.py` |
| `download_vendor_assets.py` | Downloads and packages vendor runtime assets (`marked.js`, `prism.js` with language grammars, `mermaid.js`) into `assets/vendor/` for 100% offline capability. | `python automation-scripts/download_vendor_assets.py` |
| `audit_website_links.py` | Audits all internal relative links, `<script src>`, `<link href>`, and `<img src>` tags across all HTML files to ensure 0 broken links or missing assets. | `python automation-scripts/audit_website_links.py` |

## Local & One-Time Utilities

One-time refactoring tools and Playwright-powered media asset generators reside in the Git-ignored `gitignore/` directory:
- `gitignore/python-scripts/generate_media_assets.py`: Playwright-powered screenshot, animated GIF, video, and social card generator.
- `gitignore/python-scripts/generate_svg_icon.py`: Procedure to generate SVGs from source graphics.
- `gitignore/python-scripts/move_unused_files.py`: Refactoring utility to isolate legacy assets into `.unused-old-files/`.

## Environment Notes

- Run scripts using the workspace Python virtual environment or standard Python:
  `python automation-scripts/<script_name>.py`
