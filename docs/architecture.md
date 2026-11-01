# Architecture & Desktop Simulator — pyEGClamUI Portal

This document outlines the architecture, desktop simulator state machine, GitHub releases synchronization engine, and documentation rendering pipeline powering [`av.eg1.in`](../).

---

## 🏗️ Architectural Topology

```mermaid
flowchart TD
    subgraph Client["Browser Runtime & UI Engine"]
        Main["main.tsx"] --> App["App.tsx (Routing & Telemetry)"]
        App --> Header["Header (preset='av')"]
        App --> PageSwitcher["Page Switcher (7 Pages)"]
        App --> Footer["Footer (preset='av')"]
    end

    subgraph DesktopEngine["Desktop Simulation Engine"]
        Sim["DesktopSimulator.tsx"]
        StateMachine["3-Tier Status Matrix (Secure, Warning, Critical)"]
        ScanModal["Simulated Scan Engine (Progress & Threat Detection)"]
        Sim --> StateMachine
        Sim --> ScanModal
    end

    subgraph DocsEngine["Documentation Ingestion Engine"]
        DocsViewer["DocsViewer.tsx"]
        TOC["Dynamic Table of Contents"]
        Search["Client-side Search Index"]
        Markdown["MarkdownViewer.tsx + DOMPurify"]
        DocsViewer --> TOC & Search & Markdown
    end

    subgraph SyncEngine["Live GitHub Synchronization"]
        Releases["DownloadPage.tsx"]
        GitHubAPI["GitHub API (EG1DOTIN/pyEGClamUI)"]
        Cache["Local Memory Cache & Fallback Store"]
        Releases --> GitHubAPI
        GitHubAPI --> Cache
    end

    PageSwitcher --> Sim
    PageSwitcher --> DocsViewer
    PageSwitcher --> Releases
```

---

## 1. Desktop UI Simulator State Machine (`DesktopSimulator`)

The desktop simulator provides a live, interactive web representation of the native PyQt interface:

```mermaid
stateDiagram-v2
    [*] --> Secure: Initial State (ClamAV Daemon Running)
    
    Secure --> Warning: Database Outdated / Definitions Expired
    Warning --> Critical: Threat Detected / Scan Interrupted
    Critical --> Scanning: User Launches Scan
    Secure --> Scanning: Quick Scan / Full Scan
    Warning --> Scanning: Update & Scan
    
    Scanning --> Secure: 0 Threats Found
    Scanning --> Critical: Threats Quarantined / Detected
```

### State Matrix Properties
- **Secure (`state: 'secure'`)**: Green badge, shield checkmark, status "System Protected", ClamAV daemon running.
- **Warning (`state: 'warning'`)**: Amber badge, warning icon, status "Database Updates Available", prompt to run `freshclam`.
- **Critical (`state: 'critical'`)**: Red badge, alert icon, status "Threat Detected", prompt to inspect quarantine.

---

## 2. Live GitHub Releases Synchronization

The download engine on [`DownloadPage.tsx`](../src/pages/DownloadPage.tsx) keeps platform installers synchronized with GitHub:
1. **API Dispatch**: Requests `https://api.github.com/repos/EG1DOTIN/pyEGClamUI/releases/latest`.
2. **Asset Resolution**: Categorizes binary assets dynamically:
   - **Debian / Ubuntu**: `.deb` package
   - **Red Hat / Fedora**: `.rpm` package
   - **Generic Linux**: `.tar.gz` tarball
   - **Checksums**: Reads accompanying `SHA256SUMS` file to render verified verification hashes.
3. **Graceful Fallback**: If GitHub rate limits occur, falls back to pre-packaged release metadata without disrupting the user experience.

---

## 3. Documentation Ingestion Engine (`DocumentationPage`)

- Ingests 17+ technical Markdown guides covering setup, configuration, CLI usage, and troubleshooting.
- Interactive [`DocsViewer`](https://github.com/EG1DOTIN/eg-web-core/blob/main/docs/domain-modules.md) provides real-time search, table of contents navigation, and copyable code blocks.
- All Markdown is pre-sanitized through `DOMPurify` to ensure absolute immunity from XSS vulnerabilities.
