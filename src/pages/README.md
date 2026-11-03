# pyEGClamUI Pages Directory (`src/pages/`)

This directory houses the page controllers for the `av.eg1.in` web portal.

---

## 📑 Pages Inventory & Route Mapping

| Page File | Clean URL Route | Capabilities & Architecture |
|---|---|---|
| [`HomePage.tsx`](file:///home/gautam/AntigravityProjects/EG1-LIVE-WEBSITES/AV-WEBSITE/av.eg1.in/src/pages/HomePage.tsx) | `/` or `/index` | Hero banner with live version badge, 3-tier protection matrix simulator, fast platform download buttons |
| [`DocumentationPage.tsx`](file:///home/gautam/AntigravityProjects/EG1-LIVE-WEBSITES/AV-WEBSITE/av.eg1.in/src/pages/DocumentationPage.tsx) | `/documentation` or `/docs` | Ingested technical docs browser: sidebar navigation, instant search, syntax highlighting, fullscreen zoomable Mermaid diagrams, breadcrumbs |
| [`DownloadPage.tsx`](file:///home/gautam/AntigravityProjects/EG1-LIVE-WEBSITES/AV-WEBSITE/av.eg1.in/src/pages/DownloadPage.tsx) | `/download` | Multi-OS binaries (Windows `.exe`/`.zip`, Linux `.tar.gz`, macOS `.zip`), terminal install commands (`winget`, `pip`, `brew`, `apt`), SHA-256 integrity checksums |
| [`UiPreviewPage.tsx`](file:///home/gautam/AntigravityProjects/EG1-LIVE-WEBSITES/AV-WEBSITE/av.eg1.in/src/pages/UiPreviewPage.tsx) | `/ui-preview` | Interactive procedural desktop GUI emulator allowing users to test scan animations, engine detections, and dark mode in-browser |
| [`GettingStartedPage.tsx`](file:///home/gautam/AntigravityProjects/EG1-LIVE-WEBSITES/AV-WEBSITE/av.eg1.in/src/pages/GettingStartedPage.tsx) | `/getting-started` | 3-step quickstart: ClamAV prerequisites, installation methods, and initial signature database sync (`freshclam`) |
| [`UpdatesPage.tsx`](file:///home/gautam/AntigravityProjects/EG1-LIVE-WEBSITES/AV-WEBSITE/av.eg1.in/src/pages/UpdatesPage.tsx) | `/updates` | Live GitHub release feed with parsed feature highlights, published dates, and binary asset download chips |
| [`AboutPage.tsx`](file:///home/gautam/AntigravityProjects/EG1-LIVE-WEBSITES/AV-WEBSITE/av.eg1.in/src/pages/AboutPage.tsx) | `/about` | Project mission, GPL-3.0 licensing compliance, Cisco ClamAV trademark disclaimer, FAQ |

---

## 🔄 Client-Side Routing Architecture
1. In `src/App.tsx`, `cleanRoute()` converts raw paths into clean route tokens (e.g., `documentation.html` $\rightarrow$ `documentation`, `how-to-use` $\rightarrow$ `getting-started`).
2. Browser `window.history.pushState` always receives clean paths (`/download`, `/documentation`, `/updates`).

