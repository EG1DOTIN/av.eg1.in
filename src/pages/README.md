# pyEGClamUI Pages Directory (`src/pages/`)

This directory houses the page controllers for the `av.eg1.in` web portal.

---

## 📑 Pages Inventory & Route Mapping

| Page File | Clean URL Route | Capabilities & Architecture |
|---|---|---|
| [`HomePage.tsx`](./HomePage.tsx) | `/` or `/index` | Hero banner with live version badge, 3-tier protection matrix simulator, fast platform download buttons |
| [`DocumentationPage.tsx`](./DocumentationPage.tsx) | `/documentation` or `/docs` | Ingested technical docs browser: sidebar navigation, instant search, syntax highlighting, fullscreen zoomable Mermaid diagrams, breadcrumbs |
| [`DownloadPage.tsx`](./DownloadPage.tsx) | `/download` | Multi-OS binaries (Windows `.exe`/`.zip`, Linux `.tar.gz`, macOS `.zip`), terminal install commands (`winget`, `pip`, `brew`, `apt`), SHA-256 integrity checksums |
| [`UiPreviewPage.tsx`](./UiPreviewPage.tsx) | `/ui-preview` | Interactive procedural desktop GUI emulator allowing users to test scan animations, engine detections, and dark mode in-browser |
| [`GettingStartedPage.tsx`](./GettingStartedPage.tsx) | `/getting-started` | 3-step quickstart: ClamAV prerequisites, installation methods, and initial signature database sync (`freshclam`) |
| [`UpdatesPage.tsx`](./UpdatesPage.tsx) | `/updates` | Live GitHub release feed with parsed feature highlights, published dates, and binary asset download chips |
| [`AboutPage.tsx`](./AboutPage.tsx) | `/about` | Project mission, GPL-3.0 licensing compliance, Cisco ClamAV trademark disclaimer, FAQ |

---

## 🔄 Client-Side Routing Architecture
1. In `src/App.tsx`, `cleanRoute()` converts raw paths into clean route tokens (e.g., `documentation.html` $\rightarrow$ `documentation`, `how-to-use` $\rightarrow$ `getting-started`).
2. Browser `window.history.pushState` always receives clean paths (`/download`, `/documentation`, `/updates`).

