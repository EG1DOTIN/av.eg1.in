# pyEGClamUI Web Portal Documentation

Welcome to the comprehensive architecture and developer documentation for the official **pyEGClamUI** web portal ([https://av.eg1.in](https://av.eg1.in)).

This directory contains page-wise specifications, design systems, data flow models, and maintenance standards for every page and component on the portal.

---

## 📚 Documentation Index

| Documentation File | Target Page / Area | Core Focus |
| :--- | :--- | :--- |
| [index-page.md](index-page.md) | [index.html](../index.html) | Portal landing page, hero value proposition, security highlights, CTA funnel |
| [ui-preview-page.md](ui-preview-page.md) | [ui-preview.html](../ui-preview.html) & [ui-preview.html](ui-preview.html) | Browser-based interactive desktop UI prototype, state matrix, modal simulations |
| [download-page.md](download-page.md) | [download.html](../download.html) | Multi-platform package manager installation, system prerequisites, release badge |
| [getting-started-page.md](getting-started-page.md) | [getting-started.html](../getting-started.html) | Operations manual, first-run wizard, quarantine management, troubleshooting |
| [updates-page.md](updates-page.md) | [updates.html](../updates.html) | Release history, version changelogs, platform binaries timeline |
| [how-to-use-page.md](how-to-use-page.md) | [how-to-use.html](../how-to-use.html) | Backward-compatible redirect alias pointing to Getting Started |
| [about-page.md](about-page.md) | [about.html](../about.html) | Open-source philosophy, Cisco ClamAV® trademark attribution, GPL-3.0, FAQ |
| [GITHUB_ACTIONS_DOCS_SYNC.md](GITHUB_ACTIONS_DOCS_SYNC.md) | [.github/workflows/deploy.yml](../.github/workflows/deploy.yml) | Documentation build automation, cross-repo webhook dispatch & CI/CD architecture |

---

## 🗺️ Portal Navigation & User Journey Map

```mermaid
flowchart TD
    Visitor["Web Visitor / Search Referral"] --> Home["Home Page (index.html)"]

    Home -->|"Explore UI"| Demo["UI Preview (ui-preview.html)"]
    Home -->|"Read Technical Specs"| Docs["Docs (documentation.html)"]
    Home -->|"Install App"| Download["Download (download.html)"]
    Home -->|"Setup Guide"| Guide["Getting Started (getting-started.html)"]
    Home -->|"Release Notes"| Updates["Updates (updates.html)"]
    Home -->|"Project Background"| About["About & FAQ (about.html)"]

    Demo -->|"Install local app"| Download
    Docs -->|"Get started"| Download
    Download -->|"Setup instructions"| Guide
    Updates -->|"Download package"| Download
    Guide -->|"Get support / FAQ"| About
```

---

## 🧱 Architectural System Structure

The portal is designed around a lightweight, zero-dependency Vanilla architecture ensuring high SEO performance, accessibility (a11y), and rapid client rendering.

```
av.eg1.in/
├── .github/workflows/
│   └── deploy.yml               # CI/CD docs sync, validation, link audit & Pages deploy
├── index.html                   # Landing page & value proposition
├── documentation.html           # Comprehensive technical documentation viewer
├── ui-preview.html              # Interactive desktop UI preview portal
├── download.html                # Platform downloads & package manager instructions
├── getting-started.html         # Step-by-step user walkthrough & guide
├── updates.html                 # Release history, changelogs & direct binaries
├── how-to-use.html              # Backward-compatible redirect to getting-started.html
├── about.html                   # Project overview, FAQ, trademark disclosures
├── site-config.json             # Single source of truth configuration
├── firebase.json                # Firebase Hosting configuration (av.eg1.in)
├── LICENSE                      # GNU General Public License v3.0 (GPL-3.0)
├── THIRD_PARTY_LICENSES.md      # Vendored third-party library notices & licenses
├── partials/                    # Modular reusable page components
│   ├── header.html              # Global navigation bar & brand header
│   └── footer.html              # Global legal notice, disclaimer & links
├── assets/
│   ├── css/
│   │   ├── style.css            # Primary portal stylesheet & tokens
│   │   ├── tokens.css           # Design tokens & color system
│   │   ├── docs.css             # Technical documentation layout stylesheet
│   │   └── desktop-preview.css  # Emulated native desktop window stylesheet
│   ├── js/
│   │   ├── main.js              # Client-side dynamic config injector & toggles
│   │   ├── desktop-preview.js   # Interactive desktop mockup simulation engine
│   │   ├── docs-data.js         # Compiled offline documentation data store
│   │   └── docs-viewer.js       # Client-side Markdown documentation controller
│   ├── data/
│   │   └── updates.json         # Release history and download packages schema
│   ├── vendor/                  # Offline runtime libraries (marked, prism, mermaid)
│   └── images/                  # Production brand logos, icons, and SEO cards
├── docs/                        # Architecture & page specifications
├── pyEGClamUI-Docs/             # Upstream application technical documentation suite (16 guides)
├── automation-scripts/          # Maintenance, audit, and build tools
│   ├── sync_site_config.py      # Synchronize version metadata from site-config.json
│   ├── sync_components.py       # Synchronize header/footer partials across pages
│   ├── build_docs_data.py       # Compile pyEGClamUI-Docs into assets/js/docs-data.js
│   ├── download_vendor_assets.py # Vendor offline runtime libraries
│   └── audit_website_links.py   # Zero-broken-link audit gate (100% verified)
└── gitignore/                   # Local media assets & maintenance scripts (gitignored)
    ├── media/                   # High-res screenshots, animated GIFs & videos
    └── python-scripts/          # Local media generation and maintenance scripts
```

---

## ⚙️ Global Configuration Model (`site-config.json`)

All version numbers, repository links, contact endpoints, and package commands are centralized in [site-config.json](../site-config.json). Dynamic updates are processed client-side via [assets/js/main.js](../assets/js/main.js), while static markers are synchronized by [automation-scripts/sync_site_config.py](../automation-scripts/sync_site_config.py).

```json
{
  "project": {
    "name": "pyEGClamUI",
    "version": "3.0.0",
    "releaseStage": "Beta Release",
    "tagline": "An Open-Source, Cross-Platform Desktop GUI for ClamAV",
    "license": "GNU GPL-3.0"
  },
  "github": {
    "repo": "https://github.com/EG1DOTIN/pyEGClamUI",
    "issues": "https://github.com/EG1DOTIN/pyEGClamUI/issues",
    "releases": "https://github.com/EG1DOTIN/pyEGClamUI/releases"
  },
  "contact": {
    "url": "https://www.eg1.in/contact",
    "privacyPolicy": "https://eg1.in/privacypolicy.html",
    "officialSite": "https://eg1.in"
  }
}
```

---

## 🎨 Global Design System Tokens

The color scheme is configured via CSS Custom Properties in [assets/css/style.css](../assets/css/style.css), adhering to the dark cybersecurity theme:

| Token Name | Value | Purpose |
| :--- | :--- | :--- |
| `--accent-sky` | `#38bdf8` | Primary interactive highlights, active tabs, buttons |
| `--accent-green` | `#00dc82` / `#22c55e` | Success states, protected shields, active badges |
| `--accent-amber` | `#eab308` | Warning state matrix, caution notifications |
| `--accent-red` | `#ef4444` | Threat detection alerts, engine offline warnings |
| `--bg-dark` | `#0c0d0e` | Portal background canvas |
| `--bg-card` | `#121417` | Card and container elevation background |
| `--border-color` | `#23272f` | Subtle container and component borders |
