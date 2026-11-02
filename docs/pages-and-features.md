# Pages & Features Guide — pyEGClamUI Portal

Comprehensive guide to each application page and view implemented in [`av.eg1.in`](../src/pages/).

---

## 🗺️ Page Implementation Matrix

| File | Route | Focus | Key Features |
| :--- | :--- | :--- | :--- |
| [`HomePage.tsx`](../src/pages/HomePage.tsx) | `/`, `index.html` | Hero, Status & Download | Hero showcase, interactive status teaser, quick download links |
| [`DocumentationPage.tsx`](../src/pages/DocumentationPage.tsx) | `documentation.html` | 17+ Technical Guides | Sidebar navigation, instant client search, Markdown rendering |
| [`UiPreviewPage.tsx`](../src/pages/UiPreviewPage.tsx) | `ui-preview.html` | Qt Desktop Simulator | Full interactive PyQt simulator, status toggles, simulated scan |
| [`DownloadPage.tsx`](../src/pages/DownloadPage.tsx) | `download.html` | Live GitHub Releases | Platform-specific packages (.deb, .rpm, .tar.gz), SHA-256 hashes |
| [`GettingStartedPage.tsx`](../src/pages/GettingStartedPage.tsx) | `getting-started.html` | Installation & Setup | ClamAV daemon installation, initial signature update, first scan |
| [`UpdatesPage.tsx`](../src/pages/UpdatesPage.tsx) | `updates.html` | Release Changelog | Chronological releases, changelog items, security updates |
| [`AboutPage.tsx`](../src/pages/AboutPage.tsx) | `about.html` | Project Vision | Open-source philosophy, system architecture, team & credits |

---

## 1. Home Page (`HomePage.tsx`)

The central landing page introducing the pyEGClamUI antivirus suite:
- **Hero Banner**: Highlighting the open-source ClamAV graphical user interface.
- **Interactive Status Teaser**: Embedded compact status widget reflecting ClamAV engine readiness.
- **Quick Platform Download Cards**: Direct access to `.deb`, `.rpm`, and `.tar.gz` downloads.

---

## 2. Documentation Portal (`DocumentationPage.tsx`)

Comprehensive guide repository powered by [`DocsViewer`](https://github.com/EG1DOTIN/eg-web-core/blob/main/docs/domain-modules.md):
- **17+ Ingested Guides**: Ingested from technical documentation covering Installation, CLI flags, Daemon setup, Quarantine management, and Troubleshooting.
- **Instant Client-Side Search**: Filters guides and subsections in real time.
- **Table of Contents**: Auto-generated outline allowing quick jumping between headings.

---

## 3. UI Preview Simulator (`UiPreviewPage.tsx`)

Full-featured in-browser desktop preview:
- **PyQt UI Simulation**: Recreates the pyEGClamUI native interface using pure CSS and React.
- **Status Toggles**: Allows testing how the interface looks and responds when the system is *Secure*, *Outdated*, or *Infected*.
- **Mock Scanner**: Simulates file scanning progress with scan logs, percentage indicators, and clean/infected verdicts.

---

## 4. Download Center (`DownloadPage.tsx`)

Real-time release acquisition:
- **Live GitHub Integration**: Pulls latest releases and assets from GitHub repository `EG1DOTIN/pyEGClamUI`.
- **Platform Selectors**: Categorizes `.deb` for Debian/Ubuntu, `.rpm` for Fedora/RHEL/openSUSE, and `.tar.gz` source archives.
- **Integrity Verification**: Displays verified SHA-256 checksums alongside one-click copy commands.

---

## 5. Getting Started (`GettingStartedPage.tsx`)

Step-by-step onboarding:
- **Prerequisite Setup**: Instructions for installing ClamAV and ClamAV daemon.
- **Signature Updating**: Command guide for configuring `freshclam`.
- **First Scan Walkthrough**: Guidance on running the initial full system scan.

---

## 6. Updates & Changelog (`UpdatesPage.tsx`)

Platform evolution history:
- Displays tagged release history, new feature announcements, performance enhancements, and ClamAV compatibility updates.

---

## 7. About Page (`AboutPage.tsx`)

Mission, architecture, and open-source licensing:
- Explains the architectural design bridging Python/Qt with the low-level `clamd` UNIX socket.
- Open-source credits, GPL licensing disclosures, and community contribution guide.
