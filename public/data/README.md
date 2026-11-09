# pyEGClamUI Public Data Stores (`public/data/`)

This directory contains the pre-compiled documentation database and update changelogs feeding `av.eg1.in`.

---

## 🗄️ Files Inventory & Roles

| File | Purpose | Source of Truth |
|---|---|---|
| [`docs-data.json`](./docs-data.json) | Complete pre-indexed JSON catalog containing 19 full technical Markdown guides, navigation groupings, and cross-link resolution maps. | Generated automatically by `automation-scripts/sync_docs_from_github.py` from `EG1DOTIN/pyEGClamUI`. |
| [`docs-data.js`](./docs-data.js) | Offline fallback bundle assigning `window.__PYEGCLAMUI_DOCS_DATA__` for immediate synchronous execution in restricted environments. | Generated alongside `docs-data.json`. |
| [`updates.json`](./updates.json) | Static fallback release changelog and notifications feed. | Maintained locally and synchronized with major GitHub release notes. |

---

## 🔄 Rebuilding Documentation Data

Never edit `docs-data.json` manually! Whenever documentation changes in the desktop app repository, simply recompile the store using the synchronization utility:

```bash
python3 ../automation-scripts/sync_docs_from_github.py
```

