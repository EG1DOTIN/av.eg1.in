import React, { useState } from 'react';
import { Container, Button, Badge } from 'eg-web-core';
import { useGitHubRelease } from '../hooks';
import './HomePage.css';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

type PlatformTab = 'windows' | 'linux' | 'macos' | 'pip';

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { version, releaseStage } = useGitHubRelease();
  const [activePlatform, setActivePlatform] = useState<PlatformTab>('windows');
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const handleCopy = (code: string, tabId: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).then(() => {
        setCopiedTab(tabId);
        setTimeout(() => setCopiedTab(null), 2500);
      });
    }
  };

  const capabilities = [
    {
      title: 'Engine Auto-Discovery',
      desc: 'Automatically detects installed ClamAV binaries across standard system paths and communicates directly with the local scanning service for fast performance.',
      badges: ['Auto-Detection', 'Local Daemon', 'CLI & GUI'],
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      ),
    },
    {
      title: 'Four Scan Profiles',
      desc: 'Choose between a Quick Scan of high-priority system areas most prone to infection, a Full System Scan of all drives, Custom drag-and-drop file scanning, or Windows active process memory scanning.',
      badges: ['Quick & Full Scan', 'Process Memory', 'Drag & Drop'],
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="22" y1="12" x2="18" y2="12" />
          <line x1="6" y1="12" x2="2" y2="12" />
          <line x1="12" y1="6" x2="12" y2="2" />
          <line x1="12" y1="22" x2="12" y2="18" />
        </svg>
      ),
    },
    {
      title: 'Real-Time Folder Guard',
      desc: 'Monitors up to two selected folders in real time (defaults to Downloads and Desktop, customizable in Settings) to inspect new files as they arrive.',
      badges: ['Up to 2 Folders', 'Custom Paths', 'Background Guard'],
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          <path d="M12 11v6" />
          <path d="M9 14l3 3 3-3" />
        </svg>
      ),
    },
    {
      title: 'Quarantine Management',
      desc: 'Detected files are securely moved to an isolated quarantine vault to prevent accidental execution, with options to safely restore or permanently delete them.',
      badges: ['Safe Vault', 'Review Threats', '1-Click Restore'],
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
    },
    {
      title: 'Virus Definition Updates',
      desc: 'Check for and download the latest virus signature updates directly through the interface using the official FreshClam utility.',
      badges: ['FreshClam', 'Status Indicator', 'One-Click Update'],
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
        </svg>
      ),
    },
    {
      title: 'Desktop & Tray Integration',
      desc: 'Runs unobtrusively in the background with Windows System Tray, macOS Menu Bar, and Linux application menu integration.',
      badges: ['System Tray', 'Cross-Platform', 'Offline-First'],
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      ),
    },
  ];

  const platformData = {
    windows: {
      title: 'Windows (PowerShell 1-Liner)',
      badge: 'PowerShell',
      code: `powershell -ExecutionPolicy Bypass -Command "Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/EG1DOTIN/pyEGClamUI/main/setup/install.ps1' -OutFile setup.ps1; .\\setup.ps1"`,
      note: 'Automated bootstrap setup provisions Python, creates an isolated virtual environment (.venv), checks ClamAV binaries, and configures desktop shortcuts automatically.',
    },
    linux: {
      title: 'Linux (Bash 1-Liner)',
      badge: 'Universal Bash',
      code: 'curl -sSL https://raw.githubusercontent.com/EG1DOTIN/pyEGClamUI/main/setup/install.sh | bash',
      note: 'Provisions isolated virtual environment, checks ClamAV daemon (clamd), installs dependencies, and creates system application menu entries with icons.',
    },
    macos: {
      title: 'macOS (Terminal 1-Liner)',
      badge: 'Universal Bash',
      code: 'curl -sSL https://raw.githubusercontent.com/EG1DOTIN/pyEGClamUI/main/setup/install.sh | bash',
      note: 'Supports Apple Silicon (M-series) and Intel architectures, configures environment paths, and integrates with the top Menu Bar.',
    },
    pip: {
      title: 'Python Pip (Cross-Platform)',
      badge: 'Universal PyPI',
      code: 'pip install pyegclamui',
      note: 'Install directly from PyPI into your active Python environment. Launch anytime with pyegclamui or short alias egclam.',
    },
  };

  return (
    <div style={{ paddingBottom: '72px' }}>
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'pyEGClamUI',
            operatingSystem: 'Windows 10/11, Linux, macOS',
            applicationCategory: 'SecurityApplication',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
            description: 'An open-source, cross-platform desktop graphical user interface for the ClamAV antivirus engine.',
            license: 'https://www.gnu.org/licenses/gpl-3.0.html',
            author: {
              '@type': 'Organization',
              name: 'EG1',
              url: 'https://eg1.in',
            },
          }),
        }}
      />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-glow-bg" aria-hidden="true" />
        <Container>
          <div className="hero-content">
            <div className="hero-pill-badge" onClick={() => onNavigate('updates')} role="button" tabIndex={0}>
              <span style={{ fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '9999px', background: '#10b981', color: '#042f2e' }}>
                {releaseStage}
              </span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>v{version}</span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>• Cross-Platform Desktop GUI for ClamAV</span>
            </div>

            <h1 className="hero-title">
              Desktop GUI for <span className="highlight">ClamAV</span>
            </h1>

            <p className="hero-subtitle">
              An open-source, cross-platform desktop graphical user interface for the ClamAV antivirus engine. Built with Python and PySide6 (Qt) for Windows, Linux, and macOS.
            </p>

            <div className="hero-actions">
              <Button variant="primary" size="lg" onClick={() => onNavigate('download')} id="btnHeroDownload">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download
              </Button>
              <Button variant="secondary" size="lg" onClick={() => onNavigate('ui-preview')} id="btnHeroExploreUi">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Explore UI Preview &rarr;
              </Button>
              <Button variant="outline" size="lg" onClick={() => onNavigate('updates')} id="btnHeroUpdates">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                  <circle cx="12" cy="12" r="9" />
                  <polyline points="12 7 12 12 15 15" />
                </svg>
                Updates
              </Button>
            </div>

            <div className="hero-role-note">
              <span>Free &amp; Open-Source (GNU GPL-3.0)</span>
              <span>&bull;</span>
              <span>Offline-First</span>
              <span>&bull;</span>
              <span>Zero Silent Tracking</span>
            </div>
          </div>
        </Container>
      </section>

      {/* Core Capabilities Grid */}
      <Container style={{ marginTop: '64px' }}>
        <div style={{ textAlign: 'center' }}>
          <span className="section-tag">Core Capabilities</span>
          <h2 className="section-title">Visual Control &amp; Core Capabilities</h2>
          <p className="section-desc">
            A clean desktop interface connecting you to the ClamAV engine with multiple scan modes, real-time folder monitoring, and quarantine isolation.
          </p>
        </div>

        <div className="capability-grid">
          {capabilities.map((c) => (
            <div key={c.title} className="capability-card">
              <div className="capability-icon-box">{c.icon}</div>
              <h3 className="capability-title">{c.title}</h3>
              <p className="capability-desc">{c.desc}</p>
              <div className="capability-pill-list">
                {c.badges.map((b) => (
                  <span key={b} className="capability-pill">
                    {b}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Container>

      {/* Bootstrap Installer Switcher */}
      <Container style={{ marginTop: '72px' }}>
        <div style={{ textAlign: 'center' }}>
          <span className="section-tag">Bootstrap Installer</span>
          <h2 className="section-title">Quick Installation</h2>
          <p className="section-desc">
            Automated bootstrap setup commands that provision Python, configure an isolated environment, check ClamAV, and set up desktop launchers automatically.
          </p>
        </div>

        {/* Platform Tabs */}
        <div className="platform-tabs" role="tablist">
          <button
            type="button"
            className={`platform-tab-btn ${activePlatform === 'windows' ? 'active' : ''}`}
            onClick={() => setActivePlatform('windows')}
            role="tab"
            aria-selected={activePlatform === 'windows'}
            id="tab-windows"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
            </svg>
            Windows
          </button>

          <button
            type="button"
            className={`platform-tab-btn ${activePlatform === 'linux' ? 'active' : ''}`}
            onClick={() => setActivePlatform('linux')}
            role="tab"
            aria-selected={activePlatform === 'linux'}
            id="tab-linux"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.832-.41 1.684-.287 2.489a.424.424 0 00-.11.135c-.26.268-.45.6-.663.839-.199.199-.485.267-.797.4-.313.136-.658.269-.864.68-.09.189-.136.394-.132.602 0 .199.027.4.055.536.058.399.116.728.04.97-.249.68-.28 1.145-.106 1.484.174.334.535.47.94.601.81.2 1.91.135 2.774.6.926.466 1.866.67 2.616.47.526-.116.97-.464 1.208-.946.587-.003 1.23-.269 2.26-.334.699-.058 1.574.267 2.577.2.025.134.063.198.114.333l.003.003c.391.778 1.113 1.132 1.884 1.071.771-.06 1.592-.536 2.257-1.306.631-.765 1.683-1.084 2.378-1.503.348-.199.629-.469.649-.853.023-.4-.2-.811-.714-1.376v-.097l-.003-.003c-.17-.2-.25-.535-.338-.926-.085-.401-.182-.786-.492-1.046h-.003c-.059-.054-.123-.067-.188-.135a.357.357 0 00-.19-.064c.431-1.278.264-2.55-.173-3.694-.533-1.41-1.465-2.638-2.175-3.483-.796-1.005-1.576-1.957-1.56-3.368.026-2.152.236-6.133-3.544-6.139zm.529 3.405h.013c.213 0 .396.062.584.198.19.135.33.332.438.533.105.259.158.459.166.724 0-.02.006-.04.006-.06v.105a.086.086 0 01-.004-.021l-.004-.024a1.807 1.807 0 01-.15.706.953.953 0 01-.213.335.71.71 0 00-.088-.042c-.104-.045-.198-.064-.284-.133a1.312 1.312 0 00-.22-.066c.05-.06.146-.133.183-.198.053-.128.082-.264.088-.402v-.02a1.21 1.21 0 00-.061-.4c-.045-.134-.101-.2-.183-.333-.084-.066-.167-.132-.267-.132h-.016c-.093 0-.176.03-.262.132a.8.8 0 00-.205.334 1.18 1.18 0 00-.09.4v.019c.002.089.008.179.02.267-.193-.067-.438-.135-.607-.202a1.635 1.635 0 01-.018-.2v-.02a1.772 1.772 0 01.15-.768c.082-.22.232-.406.43-.533a.985.985 0 01.594-.2z" />
            </svg>
            Linux
          </button>

          <button
            type="button"
            className={`platform-tab-btn ${activePlatform === 'macos' ? 'active' : ''}`}
            onClick={() => setActivePlatform('macos')}
            role="tab"
            aria-selected={activePlatform === 'macos'}
            id="tab-macos"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.4c.66-.82 1.11-1.96.99-3.1-.96.04-2.11.64-2.79 1.44-.59.69-1.11 1.83-.97 2.94 1.07.08 2.12-.56 2.77-1.28z" />
            </svg>
            macOS
          </button>

          <button
            type="button"
            className={`platform-tab-btn ${activePlatform === 'pip' ? 'active' : ''}`}
            onClick={() => setActivePlatform('pip')}
            role="tab"
            aria-selected={activePlatform === 'pip'}
            id="tab-pip"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 17 10 11 4 5" />
              <line x1="12" y1="19" x2="20" y2="19" />
            </svg>
            Pip
          </button>
        </div>

        {/* Platform Panels */}
        <div className="platform-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--text-primary)' }}>
              {platformData[activePlatform].title}
            </div>
            <Badge variant="success">{platformData[activePlatform].badge}</Badge>
          </div>

          <div className="code-box">
            <div className="code-box-content">
              <code>{platformData[activePlatform].code}</code>
            </div>
            <button
              type="button"
              className={`copy-btn ${copiedTab === activePlatform ? 'copied' : ''}`}
              onClick={() => handleCopy(platformData[activePlatform].code, activePlatform)}
              title="Copy command to clipboard"
            >
              {copiedTab === activePlatform ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '8px', margin: 0 }}>
            {platformData[activePlatform].note}
          </p>
        </div>
      </Container>
    </div>
  );
};
