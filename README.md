# pyEGClamUI Official Web Portal (`av.eg1.in`)

Official source code repository for the **pyEGClamUI** web portal ([https://av.eg1.in](https://av.eg1.in)).

pyEGClamUI is an open-source, cross-platform desktop graphical user interface for the ClamAV® antivirus engine.

---

## 🌐 Live Website

- **Official Portal**: [https://av.eg1.in](https://av.eg1.in)
- **Author/Developer**: [https://eg1.in](https://eg1.in)
- **Application Source Code Repository**: [https://github.com/EG1DOTIN/pyEGClamUI](https://github.com/EG1DOTIN/pyEGClamUI)

---

## 📁 Repository Structure

```
av.eg1.in/
├── .github/workflows/
│   └── deploy.yml               # CI/CD docs sync, validation, link audit & Pages deploy
├── index.html                   # Portal landing page & value proposition
├── documentation.html           # Comprehensive technical documentation viewer
├── ui-preview.html              # In-browser interactive desktop UI preview
├── download.html                # Platform downloads & package manager instructions
├── getting-started.html         # Step-by-step user guide & operations manual
├── updates.html                 # Release history, changelogs & direct binaries
├── how-to-use.html              # Backward-compatible redirect to getting-started.html
├── about.html                   # Project overview, FAQ, and licensing
├── site-config.json             # Single source of truth configuration
├── firebase.json                # Firebase Hosting configuration (av.eg1.in)
├── LICENSE                      # GNU General Public License v3.0 (GPL-3.0)
├── THIRD_PARTY_LICENSES.md      # Vendored third-party library notices & licenses
├── partials/                    # Modular reusable page components
│   ├── header.html              # Master global navigation bar
│   └── footer.html              # Master footer with trademark attribution
├── assets/
│   ├── css/
│   │   ├── style.css            # Primary portal stylesheet & design system
│   │   ├── tokens.css           # Design tokens & color system
│   │   ├── docs.css             # Technical documentation layout stylesheet
│   │   └── desktop-preview.css  # Native desktop window emulation stylesheet
│   ├── js/
│   │   ├── main.js              # Client-side dynamic config injector & navigation
│   │   ├── visitor-tracker.js   # Opt-in batched visitor analytics tracker
│   │   ├── desktop-preview.js   # Interactive desktop mockup simulation engine
│   │   ├── docs-data.js         # Compiled offline documentation data store
│   │   └── docs-viewer.js       # Client-side Markdown documentation controller
│   ├── data/
│   │   └── updates.json         # Release history and download packages schema
│   ├── vendor/                  # Offline runtime libraries (marked, prism, mermaid)
│   └── images/                  # Official SVGs, icons, and OpenGraph assets
├── docs/                        # Portal architecture & page-wise documentation
│   ├── README.md                # Documentation index & navigation map
│   ├── GITHUB_ACTIONS_DOCS_SYNC.md # CI/CD documentation sync architecture
│   ├── index-page.md            # Home page architecture
│   ├── ui-preview-page.md       # Interactive preview architecture
│   ├── download-page.md         # Download page & package manager architecture
│   ├── getting-started-page.md  # Operations manual & onboarding architecture
│   ├── updates-page.md          # Updates & releases timeline architecture
│   ├── how-to-use-page.md       # Operational workflow & redirect architecture
│   ├── about-page.md            # About & FAQ page architecture
│   └── ui-preview.html          # Standalone prototype testing container
├── pyEGClamUI-Docs/             # Upstream application technical documentation suite (16 guides)
├── gitignore/                   # Local media assets & generation scripts (gitignored)
│   ├── media/                   # Marketing banners, screenshots, GIFs, and videos
│   └── python-scripts/          # Local media generation and maintenance scripts
└── automation-scripts/          # Maintenance, audit, and build tools
    ├── sync_site_config.py      # Synchronize version metadata from site-config.json
    ├── sync_components.py       # Synchronize header/footer partials across pages
    ├── build_docs_data.py       # Compile pyEGClamUI-Docs into assets/js/docs-data.js
    ├── download_vendor_assets.py # Vendor offline runtime libraries
    └── audit_website_links.py   # Audit internal links & assets (0 broken links)
```

---

## 🛠️ Technology Stack of this website portal

- **Markup**: Semantic HTML5 with accessible attributes (`aria-*`, `role`).
- **Styling**: Vanilla CSS3 with CSS Custom Properties, modern Flexbox, and CSS Grid layouts.
- **Interactivity**: Vanilla JavaScript (ES6+) with zero external runtime libraries or frameworks.
- **Icons & Graphics**: Pure SVG vectors for resolution independence and performance.
- **Automation**: Python 3.10+ scripts for component templating, link integrity auditing, and asset generation.

---

## 💻 Local Development Setup

To serve and preview the website locally without any build step:

```bash
# Clone the website repository
git clone https://github.com/EG1DOTIN/av.eg1.in.git
cd av.eg1.in

# Start a local HTTP server
python -m http.server 5501
```

Once running, navigate to `http://localhost:5501` in any modern web browser.

---

## ⚙️ Maintenance & Automation Workflows

All maintenance and auditing scripts are housed in [`automation-scripts/`](automation-scripts/):

### 1. Update Version Numbers & Metadata
Modify metadata in [`site-config.json`](site-config.json), then propagate updates across all pages:
```bash
python automation-scripts/sync_site_config.py
```

### 2. Synchronize Header & Footer Partials
Modify [`partials/header.html`](partials/header.html) or [`partials/footer.html`](partials/footer.html), then update all HTML files:
```bash
python automation-scripts/sync_components.py
```

### 3. Compile Documentation Store
Compile technical documents from `pyEGClamUI-Docs/` into `assets/js/docs-data.js`:
```bash
python automation-scripts/build_docs_data.py
```

### 4. Verify Link Integrity
Audit all internal relative links, script sources, and image tags:
```bash
python automation-scripts/audit_website_links.py
```

*(Note: One-time media and asset generator tools reside in `gitignore/` and are excluded from version control).*

---

## 📜 Trademark & Open-Source Attribution

- **Trademark Notice**: ClamAV® is a registered trademark of Cisco Systems, Inc. pyEGClamUI is an independent open-source frontend and is not affiliated with, endorsed by, or sponsored by Cisco Systems, Inc.
- **Project License**: The pyEGClamUI project and web portal are licensed under the [GNU General Public License v3.0 (GPL-3.0)](LICENSE).
- **Third-Party Libraries**: Vendored client-side runtime libraries (`marked`, `prism`, `mermaid`) are licensed under permissive open-source licenses (MIT). See [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md) for full copyright notices and license texts.
