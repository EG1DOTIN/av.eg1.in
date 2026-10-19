# GitHub Actions Documentation Synchronization Architecture

This document describes how technical documentation is maintained, synchronized, and compiled for the **pyEGClamUI** official web portal ([av.eg1.in](https://av.eg1.in)).

---

## 1. Architectural Overview

The documentation system uses a **hybrid real-time & ahead-of-time (AOT)** architecture:

1. **Client-Side Live GitHub Sync & Stale-While-Revalidate**: In [assets/js/docs-viewer.js](../assets/js/docs-viewer.js), visiting [documentation.html](../documentation.html) immediately renders the local pre-bundled documentation in 0ms (Stale-While-Revalidate) and simultaneously executes a non-blocking background fetch to `raw.githubusercontent.com`. Whenever updates are committed to the `main` branch of `EG1DOTIN/pyEGClamUI`, website visitors automatically receive the freshest documentation without waiting for website redeployment. Results are cached in `sessionStorage` (15-minute TTL).
2. **Ahead-of-Time Offline Bundle**: All 18 Markdown files in [`../pyEGClamUI-Docs/`](../pyEGClamUI-Docs/) are synchronized and compiled by [`../automation-scripts/sync_docs_from_github.py`](../automation-scripts/sync_docs_from_github.py) and [`../automation-scripts/build_docs_data.py`](../automation-scripts/build_docs_data.py) into an offline-resilient JavaScript bundle: [`../assets/js/docs-data.js`](../assets/js/docs-data.js). This guarantees seamless offline browsing, fast initial loads, and search engine indexability.

```mermaid
flowchart TD
    subgraph AppRepo["Python App Repository (pyEGClamUI)"]
        direction TB
        AppDocs["docs/ and README.md (18 Guides)"]
        AppTrigger["Workflow: notify-website.yml"]
        RawEndpoint["raw.githubusercontent.com (main branch)"]
        AppDocs -->|"Git Push"| AppTrigger
        AppDocs -->|"Direct Branch Push"| RawEndpoint
    end

    subgraph ClientBrowser["Visitor Browser (av.eg1.in)"]
        direction TB
        Viewer["docs-viewer.js Controller"]
        PreBundle["Render Instantly from docs-data.js (0ms)"]
        BgFetch{"Background Revalidation from GitHub Raw"}
        SessionCache{"sessionStorage (15-min TTL)"}
        
        Viewer --> PreBundle
        PreBundle --> BgFetch
        BgFetch -->|"Cache Fresh"| SessionCache
        BgFetch -->|"Updated Content Available"| LiveUpdate["Smooth In-Place Content Update"]
    end

    RawEndpoint -.->|"CORS Enabled Fetch"| BgFetch

    subgraph WebRepo["Website Repository CI/CD (av.eg1.in)"]
        direction TB
        DispatchEvent{"Trigger Source"}
        LocalDocs["pyEGClamUI-Docs/"]
        WebWorkflow[".github/workflows/deploy.yml"]
        ReleaseSync["sync_releases_from_github.py"]
        ConfigSync["sync_site_config.py"]
        Compiler["build_docs_data.py"]
        Store["assets/js/docs-data.js"]

        DispatchEvent -->|"repository_dispatch event"| WebWorkflow
        DispatchEvent -->|"push to main/master"| WebWorkflow
        DispatchEvent -->|"manual workflow_dispatch"| WebWorkflow

        WebWorkflow --> ReleaseSync
        ReleaseSync -->|"Updates site-config.json"| ConfigSync
        WebWorkflow -->|"Fetches latest docs"| LocalDocs
        LocalDocs --> Compiler
        Compiler --> Store
    end

    AppTrigger -->|"Repository Dispatch Webhook"| DispatchEvent
```

---

## 2. Website Workflow Details

The website workflow is located at [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml).

### Trigger Conditions

1. **Direct Commits (`push`)**:
   Automatically triggers on any push to branches `main` or `master`.
2. **Pull Requests (`pull_request`)**:
   Runs verification, doc compilation, and link auditing against incoming PRs.
3. **Manual Execution (`workflow_dispatch`)**:
   Can be triggered manually from the GitHub Actions tab in the website repository. Includes an optional toggle: `fetch_from_app_repo` (defaults to `false`).
4. **Cross-Repo Dispatch (`repository_dispatch`)**:
   Listens for webhook events with type `docs_updated`, `pyegclamui_docs_updated`, or `release_published` sent from the `pyEGClamUI` code repository.

### Workflow Execution Lifecycle

1. **Checkout**: Checks out the website repository.
2. **Python Setup**: Initializes Python 3.11 runner environment.
3. **Synchronize Latest Releases (Step 0)**: Runs `python automation-scripts/sync_releases_from_github.py` using `GITHUB_TOKEN` to pull the latest published release tags, binaries (`.exe`, `.zip`, `.tar.gz`), and SHA256 checksums into `site-config.json`.
4. **Remote Sync (Conditional)**:
   If triggered by cross-repo dispatch, attempts a shallow clone of `https://github.com/EG1DOTIN/pyEGClamUI.git`. If docs are found, copies `docs/` and `README.md` into `pyEGClamUI-Docs/`. If the repo is empty or private, it gracefully falls back to the existing local docs without failing.
5. **Site Config & Partial Sync**: Executes `python automation-scripts/sync_site_config.py` to ensure all pages have synchronized versions, direct binary links, and partials.
6. **Deterministic Compilation**: Runs `python automation-scripts/build_docs_data.py` to deterministically compile Markdown files into `assets/js/docs-data.js`.
7. **Zero-Broken-Link Audit Gate**: Runs `python automation-scripts/audit_website_links.py` to verify 100% link integrity across all HTML files.
8. **Git Auto-Commit & Push**:
   Checks whether `site-config.json`, `assets/js/docs-data.js`, or HTML pages have changed. If changes exist, commits them with `[skip ci]` to prevent recursive loops and pushes directly to the repository.
9. **GitHub Pages Deployment**: Packages and deploys the audited production build to GitHub Pages.

---

## 3. Connecting the pyEGClamUI App Repository

When you are ready to publish code and documentation to the `EG1DOTIN/pyEGClamUI` repository on GitHub, configure the counterpart workflow in that repository using the steps below.

### Step 1: Create a Personal Access Token (PAT)
To allow the app repository to trigger the website workflow via webhook:
1. In your GitHub account, go to **Settings** > **Developer Settings** > **Personal Access Tokens** > **Fine-grained tokens** (or Classic tokens).
2. Grant `Contents: Read and write` permission (or `repo` scope for classic tokens) targeting the website repository (`av.eg1.in`).
3. In the `pyEGClamUI` repository, go to **Settings** > **Secrets and variables** > **Actions**.
4. Add a new repository secret named `WEBSITE_REPO_TOKEN` containing this token.

### Step 2: Add the Trigger Workflow in `pyEGClamUI`
In the `pyEGClamUI` app repository, create the following workflow file:

**File path in pyEGClamUI**: `.github/workflows/notify-website.yml`

```yaml
name: Notify Website of Docs Update

on:
  push:
    branches:
      - main
      - master
    paths:
      - 'docs/**'
      - 'README.md'
  workflow_dispatch:

jobs:
  dispatch-to-website:
    name: Trigger Website Docs Sync
    runs-on: ubuntu-latest
    steps:
      - name: Dispatch Event to Website Repository
        run: |
          curl -X POST \
            -H "Accept: application/vnd.github.v3+json" \
            -H "Authorization: token ${{ secrets.WEBSITE_REPO_TOKEN }}" \
            https://api.github.com/repos/EG1DOTIN/av.eg1.in/dispatches \
            -d '{"event_type": "docs_updated", "client_payload": {"sender": "pyEGClamUI"}}'
```

*(Note: Replace `EG1DOTIN/av.eg1.in` with your exact GitHub website repository name if different).*

---

## 4. Local Testing & Verification

You can verify the release synchronization and documentation pipeline locally at any time using the project's root `.venv` virtual environment:

### Synchronize Latest Releases from GitHub
Pull latest tags and binary URLs into `site-config.json`:
```bash
.venv/bin/python automation-scripts/sync_releases_from_github.py
# On Windows:
# .venv\Scripts\python.exe automation-scripts\sync_releases_from_github.py
```

### Synchronize Documentation from GitHub
Fetch all markdown files directly from GitHub `main` branch into `pyEGClamUI-Docs/` and compile the data store:
```bash
.venv/bin/python automation-scripts/sync_docs_from_github.py
```

Expected output:
```text
Connecting to GitHub API to discover repository documents...
Found 19 documentation assets on GitHub 'main' branch.
...
Successfully synchronized 19/19 assets to .../pyEGClamUI-Docs
Compiling assets/js/docs-data.js from updated documentation files...
Found 18 markdown files.
Successfully generated docs data store: .../assets/js/docs-data.js
  Total documents compiled: 18
  Total link aliases mapped: 120
```

### Build Documentation Bundle
Run using the project virtual environment:
```bash
.venv/bin/python automation-scripts/build_docs_data.py
```

### Audit Website Links
Verify that all 179 internal links and assets remain 100% valid:
```bash
.venv/bin/python automation-scripts/audit_website_links.py
```

Expected output:
```text
Auditing 8 HTML files in ...
Total internal links/assets checked: 179
SUCCESS: All internal links and asset references are valid!
```

---

## 5. Summary of Key Files

| File Path | Description |
| :--- | :--- |
| [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) | Website CI/CD GitHub Actions workflow for validating, compiling, auditing, and deploying the portal. |
| [`../automation-scripts/sync_releases_from_github.py`](../automation-scripts/sync_releases_from_github.py) | Python automation tool that syncs latest release tags, platform binaries, and checksums from GitHub into `site-config.json`. |
| [`../automation-scripts/sync_site_config.py`](../automation-scripts/sync_site_config.py) | Python tool that propagates configuration values into static HTML comment markers and attributes. |
| [`../automation-scripts/sync_docs_from_github.py`](../automation-scripts/sync_docs_from_github.py) | Python tool that pulls latest markdown files from GitHub repository main branch. |
| [`../automation-scripts/build_docs_data.py`](../automation-scripts/build_docs_data.py) | Deterministic Python generator script that compiles Markdown documents into JSON store. |
| [`../assets/js/docs-data.js`](../assets/js/docs-data.js) | Compiled JavaScript document data store loaded by the viewer. |
| [`../assets/js/docs-viewer.js`](../assets/js/docs-viewer.js) | Client-side viewer controller handling instant local rendering (Stale-While-Revalidate), live GitHub revalidation, TOC, and search. |
| [`../pyEGClamUI-Docs/`](../pyEGClamUI-Docs/) | The authoritative source Markdown documents suite (18 technical guides). |
