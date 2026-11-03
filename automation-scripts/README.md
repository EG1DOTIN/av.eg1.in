# pyEGClamUI Automation & Verification Scripts (`automation-scripts/`)

This directory contains standalone Python maintenance utilities, documentation synchronization tools, and automated verification suites for `av.eg1.in`.

---

## 🛠️ Scripts Inventory

| Script | Purpose | When to Run |
|---|---|---|
| [`sync_docs_from_github.py`](file:///home/gautam/AntigravityProjects/EG1-LIVE-WEBSITES/AV-WEBSITE/av.eg1.in/automation-scripts/sync_docs_from_github.py) | Fetches latest markdown documents and images from `EG1DOTIN/pyEGClamUI` GitHub repo (`main` branch) and rebuilds offline doc stores. | Run whenever documentation in the desktop app repository is updated. |
| [`build_docs_data.py`](file:///home/gautam/AntigravityProjects/EG1-LIVE-WEBSITES/AV-WEBSITE/av.eg1.in/automation-scripts/build_docs_data.py) | Compiles local markdown files in `pyEGClamUI-Docs/` into `public/data/docs-data.json` and `docs-data.js` with mapped link aliases. | Invoked automatically by `sync_docs_from_github.py` or manually during local doc edits. |
| [`run_all_checks.py`](file:///home/gautam/AntigravityProjects/EG1-LIVE-WEBSITES/AV-WEBSITE/av.eg1.in/automation-scripts/run_all_checks.py) | Master runner executing TypeScript validation, production build, doc link audits, and release verification. | Run prior to committing or deploying changes to `av.eg1.in`. |

---

## 🛡️ Audits Subdirectory (`audits/`)

| Audit Script | What It Tests |
|---|---|
| [`audits/validate_docs_and_releases.py`](file:///home/gautam/AntigravityProjects/EG1-LIVE-WEBSITES/AV-WEBSITE/av.eg1.in/automation-scripts/audits/validate_docs_and_releases.py) | Confirms that all 19 ingested technical guides are present and well-formed in `docs-data.json`, and verifies checksum references in `DownloadPage.tsx`. |
| [`audits/audit_doc_links.py`](file:///home/gautam/AntigravityProjects/EG1-LIVE-WEBSITES/AV-WEBSITE/av.eg1.in/automation-scripts/audits/audit_doc_links.py) | Scans all ingested markdown documents to ensure relative links (`docs/ARCHITECTURE.md`, `README.md#features`) resolve properly to valid internal IDs. |
| [`audits/audit_simulator_integrity.py`](file:///home/gautam/AntigravityProjects/EG1-LIVE-WEBSITES/AV-WEBSITE/av.eg1.in/automation-scripts/audits/audit_simulator_integrity.py) | Tests interactive state transitions, scan simulation timers, and threat mock events in `DesktopSimulator.tsx`. |

---

## 📋 Quick Runbook

```bash
# Full Documentation Re-Sync & Bundling:
python3 automation-scripts/sync_docs_from_github.py

# Run All Audits & Health Checks:
python3 automation-scripts/run_all_checks.py
```

