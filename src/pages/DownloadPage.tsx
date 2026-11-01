import React, { useState } from 'react';
import { Container, Button, Badge } from 'eg-web-core';
import { useGitHubRelease, formatBytes } from '../hooks';
import './DownloadPage.css';

type QuickInstallTab = 'quick-win' | 'quick-linux' | 'quick-macos' | 'quick-pip';
type PkgMgrTab = 'win-pkg' | 'linux-pkg' | 'mac-pkg' | 'source-pkg';

interface DownloadPageProps {
  onNavigate?: (path: string) => void;
}

export const DownloadPage: React.FC<DownloadPageProps> = ({ onNavigate }) => {
  const [quickTab, setQuickTab] = useState<QuickInstallTab>('quick-win');
  const [pkgTab, setPkgTab] = useState<PkgMgrTab>('win-pkg');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Dynamically synced GitHub release data
  const { version: releaseVersion, releaseStage, assets } = useGitHubRelease();

  const handleCopy = (code: string, id: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).then(() => {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2500);
      });
    }
  };

  return (
    <div className="download-page">
      {/* Hero / Title */}
      <section className="download-hero">
        <Container>
          <div className="hero-pill-badge" style={{ marginBottom: '20px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '9999px', background: '#10b981', color: '#042f2e' }}>
              {releaseStage}
            </span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>v{releaseVersion}</span>
          </div>

          <h1 className="hero-title" style={{ fontSize: 'clamp(2.2rem, 1.8rem + 2.2vw, 3.2rem)' }}>
            Download &amp; Installation
          </h1>
          <p className="hero-subtitle">
            Download standalone executable desktop packages or install via Python pip and system package managers.
          </p>
        </Container>
      </section>

      {/* Standalone Desktop Binaries */}
      <Container>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span className="section-tag">Direct Downloads</span>
          <h2 className="section-title">Standalone Desktop Binaries</h2>
          <p className="section-desc">
            Single-click packages with automated CI/CD builds for Windows, Linux, and macOS hosted on GitHub Releases.
          </p>
        </div>

        <div className="download-cards-grid">
          {/* Windows Card */}
          <div className="download-card windows">
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div className="card-icon-box" style={{ color: '#38bdf8', background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
                  </svg>
                </div>
                <Badge variant="primary">Installer + .ZIP</Badge>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>Windows</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
                Standalone native Windows Inno Setup installer suite or portable archive for Windows 10 &amp; 11 with bundled dependencies.
              </p>
            </div>

            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <a
                  href={assets.windowsExe?.browser_download_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none' }}
                >
                  <Button variant="primary" size="md" style={{ width: '100%', justifyContent: 'center' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Download Installer (.exe) &darr;
                  </Button>
                </a>
                <a
                  href={assets.windowsZip?.browser_download_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none' }}
                >
                  <Button variant="secondary" size="sm" style={{ width: '100%', justifyContent: 'center' }}>
                    Portable Package (.zip) &darr;
                  </Button>
                </a>
              </div>
              <div className="download-filename">
                {assets.windowsExe?.name} &bull; {formatBytes(assets.windowsExe?.size)}
              </div>
            </div>
          </div>

          {/* Linux Card */}
          <div className="download-card linux">
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div className="card-icon-box" style={{ color: '#00dc82', background: 'rgba(0, 220, 130, 0.12)', border: '1px solid rgba(0, 220, 130, 0.25)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.832-.41 1.684-.287 2.489a.424.424 0 00-.11.135c-.26.268-.45.6-.663.839-.199.199-.485.267-.797.4-.313.136-.658.269-.864.68-.09.189-.136.394-.132.602 0 .199.027.4.055.536.058.399.116.728.04.97-.249.68-.28 1.145-.106 1.484.174.334.535.47.94.601.81.2 1.91.135 2.774.6.926.466 1.866.67 2.616.47.526-.116.97-.464 1.208-.946.587-.003 1.23-.269 2.26-.334.699-.058 1.574.267 2.577.2.025.134.063.198.114.333l.003.003c.391.778 1.113 1.132 1.884 1.071.771-.06 1.592-.536 2.257-1.306.631-.765 1.683-1.084 2.378-1.503.348-.199.629-.469.649-.853.023-.4-.2-.811-.714-1.376v-.097l-.003-.003c-.17-.2-.25-.535-.338-.926-.085-.401-.182-.786-.492-1.046h-.003c-.059-.054-.123-.067-.188-.135a.357.357 0 00-.19-.064c.431-1.278.264-2.55-.173-3.694-.533-1.41-1.465-2.638-2.175-3.483-.796-1.005-1.576-1.957-1.56-3.368.026-2.152.236-6.133-3.544-6.139zm.529 3.405h.013c.213 0 .396.062.584.198.19.135.33.332.438.533.105.259.158.459.166.724 0-.02.006-.04.006-.06v.105a.086.086 0 01-.004-.021l-.004-.024a1.807 1.807 0 01-.15.706.953.953 0 01-.213.335.71.71 0 00-.088-.042c-.104-.045-.198-.064-.284-.133a1.312 1.312 0 00-.22-.066c.05-.06.146-.133.183-.198.053-.128.082-.264.088-.402v-.02a1.21 1.21 0 00-.061-.4c-.045-.134-.101-.2-.183-.333-.084-.066-.167-.132-.267-.132h-.016c-.093 0-.176.03-.262.132a.8.8 0 00-.205.334 1.18 1.18 0 00-.09.4v.019c.002.089.008.179.02.267-.193-.067-.438-.135-.607-.202a1.635 1.635 0 01-.018-.2v-.02a1.772 1.772 0 01.15-.768c.082-.22.232-.406.43-.533a.985.985 0 01.594-.2z" />
                  </svg>
                </div>
                <Badge variant="success">x86_64 .TAR.GZ</Badge>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>Linux</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
                Universal standalone archive for Ubuntu, Debian, Fedora, Arch Linux, and openSUSE.
              </p>
            </div>

            <div>
              <a
                href={assets.linuxTar?.browser_download_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <Button variant="secondary" size="md" style={{ width: '100%', justifyContent: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download Linux (.tar.gz) &darr;
                </Button>
              </a>
              <div className="download-filename">
                {assets.linuxTar?.name} &bull; {formatBytes(assets.linuxTar?.size)}
              </div>
            </div>
          </div>

          {/* macOS Card */}
          <div className="download-card macos">
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div className="card-icon-box" style={{ color: '#a855f7', background: 'rgba(168, 85, 247, 0.12)', border: '1px solid rgba(168, 85, 247, 0.25)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.4c.66-.82 1.11-1.96.99-3.1-.96.04-2.11.64-2.79 1.44-.59.69-1.11 1.83-.97 2.94 1.07.08 2.12-.56 2.77-1.28z" />
                  </svg>
                </div>
                <Badge variant="primary">Apple Silicon .ZIP</Badge>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>macOS</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
                Universal standalone package natively supporting Apple Silicon (M1/M2/M3/M4) architectures.
              </p>
            </div>

            <div>
              <a
                href={assets.macosZip?.browser_download_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <Button variant="secondary" size="md" style={{ width: '100%', justifyContent: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download macOS (.zip) &darr;
                </Button>
              </a>
              <div className="download-filename">
                {assets.macosZip?.name} &bull; {formatBytes(assets.macosZip?.size)}
              </div>
            </div>
          </div>
        </div>

        {/* CI/CD Release Pipeline Banner */}
        <div className="pipeline-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="pipeline-status-dot" />
            <div>
              <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Automated CI/CD Release Pipelines: </strong>
              <span style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
                Standalone executable binaries and SHA-256 checksums are continuously published to GitHub Releases via automated GitHub Actions pipelines.
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <a href={assets.checksums?.browser_download_url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                SHA256SUMS.txt
              </Button>
            </a>
            <a href="https://github.com/EG1DOTIN/pyEGClamUI/releases" target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" size="sm">
                All GitHub Releases &rarr;
              </Button>
            </a>
          </div>
        </div>
      </Container>

      {/* Automated Setup (One-Liners) */}
      <section style={{ background: 'rgba(255, 255, 255, 0.01)', borderTop: '1px solid rgba(255, 255, 255, 0.05)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', padding: '56px 0' }}>
        <Container>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <span className="section-tag">Automated Setup</span>
            <h2 className="section-title">Quick Install (One-Liners)</h2>
            <p className="section-desc">
              Want a fast, automated setup without manual steps? Run a single one-liner command to provision Python, configure an isolated virtual environment, check ClamAV, and set up desktop launchers automatically.
            </p>
          </div>

          <div className="platform-tabs" role="tablist">
            <button
              type="button"
              className={`platform-tab-btn ${quickTab === 'quick-win' ? 'active' : ''}`}
              onClick={() => setQuickTab('quick-win')}
              role="tab"
              aria-selected={quickTab === 'quick-win'}
            >
              Windows
            </button>
            <button
              type="button"
              className={`platform-tab-btn ${quickTab === 'quick-linux' ? 'active' : ''}`}
              onClick={() => setQuickTab('quick-linux')}
              role="tab"
              aria-selected={quickTab === 'quick-linux'}
            >
              Linux
            </button>
            <button
              type="button"
              className={`platform-tab-btn ${quickTab === 'quick-macos' ? 'active' : ''}`}
              onClick={() => setQuickTab('quick-macos')}
              role="tab"
              aria-selected={quickTab === 'quick-macos'}
            >
              macOS
            </button>
            <button
              type="button"
              className={`platform-tab-btn ${quickTab === 'quick-pip' ? 'active' : ''}`}
              onClick={() => setQuickTab('quick-pip')}
              role="tab"
              aria-selected={quickTab === 'quick-pip'}
            >
              Pip
            </button>
          </div>

          <div className="platform-panel" style={{ maxWidth: '820px', margin: '0 auto' }}>
            {quickTab === 'quick-win' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Windows (PowerShell 1-Liner)</div>
                  <Badge variant="success">PowerShell</Badge>
                </div>
                <div className="code-box">
                  <div className="code-box-content">
                    <code>powershell -ExecutionPolicy Bypass -Command "Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/EG1DOTIN/pyEGClamUI/main/setup/install.ps1' -OutFile setup.ps1; .\setup.ps1"</code>
                  </div>
                  <button
                    type="button"
                    className={`copy-btn ${copiedId === 'quick-win' ? 'copied' : ''}`}
                    onClick={() => handleCopy(`powershell -ExecutionPolicy Bypass -Command "Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/EG1DOTIN/pyEGClamUI/main/setup/install.ps1' -OutFile setup.ps1; .\\setup.ps1"`, 'quick-win')}
                  >
                    {copiedId === 'quick-win' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                  Automated bootstrap setup provisions Python, creates an isolated virtual environment (<code>.venv</code>), checks ClamAV binaries, and configures desktop shortcuts automatically.
                </p>
              </div>
            )}

            {quickTab === 'quick-linux' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Linux (Bash 1-Liner)</div>
                  <Badge variant="success">Universal Bash</Badge>
                </div>
                <div className="code-box">
                  <div className="code-box-content">
                    <code>curl -sSL https://raw.githubusercontent.com/EG1DOTIN/pyEGClamUI/main/setup/install.sh | bash</code>
                  </div>
                  <button
                    type="button"
                    className={`copy-btn ${copiedId === 'quick-linux' ? 'copied' : ''}`}
                    onClick={() => handleCopy('curl -sSL https://raw.githubusercontent.com/EG1DOTIN/pyEGClamUI/main/setup/install.sh | bash', 'quick-linux')}
                  >
                    {copiedId === 'quick-linux' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                  Provisions isolated virtual environment, checks ClamAV daemon (<code>clamd</code>), installs dependencies, and creates system application menu entries with icons.
                </p>
              </div>
            )}

            {quickTab === 'quick-macos' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>macOS (Terminal 1-Liner)</div>
                  <Badge variant="success">Universal Bash</Badge>
                </div>
                <div className="code-box">
                  <div className="code-box-content">
                    <code>curl -sSL https://raw.githubusercontent.com/EG1DOTIN/pyEGClamUI/main/setup/install.sh | bash</code>
                  </div>
                  <button
                    type="button"
                    className={`copy-btn ${copiedId === 'quick-macos' ? 'copied' : ''}`}
                    onClick={() => handleCopy('curl -sSL https://raw.githubusercontent.com/EG1DOTIN/pyEGClamUI/main/setup/install.sh | bash', 'quick-macos')}
                  >
                    {copiedId === 'quick-macos' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                  Supports Apple Silicon (M-series) and Intel architectures, configures environment paths, and integrates with the top Menu Bar.
                </p>
              </div>
            )}

            {quickTab === 'quick-pip' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Python Pip (Cross-Platform)</div>
                  <Badge variant="success">Universal PyPI</Badge>
                </div>
                <div className="code-box">
                  <div className="code-box-content">
                    <code>pip install pyegclamui</code>
                  </div>
                  <button
                    type="button"
                    className={`copy-btn ${copiedId === 'quick-pip' ? 'copied' : ''}`}
                    onClick={() => handleCopy('pip install pyegclamui', 'quick-pip')}
                  >
                    {copiedId === 'quick-pip' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                  Install directly from PyPI into your active Python environment. Launch anytime with <code>pyegclamui</code> or short alias <code>egclam</code>.
                </p>
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* Step-by-Step Package Managers */}
      <section style={{ padding: '64px 0' }}>
        <Container>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <span className="section-tag">Developer &amp; Manual Setup</span>
            <h2 className="section-title">Step-by-Step Package Managers</h2>
            <p className="section-desc">
              For developers, package maintainers, and custom deployments. Follow the manual workflow below: first install the ClamAV engine prerequisite, then install pyEGClamUI.
            </p>
          </div>

          {/* Prerequisite Card */}
          <div className="prerequisite-card">
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                Step 1 (Prerequisite): ClamAV Antivirus Engine
              </div>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                The desktop GUI operates alongside the open-source <strong>ClamAV</strong> engine. For step-by-step developer setup, ensure ClamAV is installed on your system using the commands in the tabs below before running pyEGClamUI.
              </p>
            </div>
          </div>

          {/* Package Manager Tabs */}
          <div className="platform-tabs" role="tablist">
            <button
              type="button"
              className={`platform-tab-btn ${pkgTab === 'win-pkg' ? 'active' : ''}`}
              onClick={() => setPkgTab('win-pkg')}
              role="tab"
            >
              Windows 10 / 11
            </button>
            <button
              type="button"
              className={`platform-tab-btn ${pkgTab === 'linux-pkg' ? 'active' : ''}`}
              onClick={() => setPkgTab('linux-pkg')}
              role="tab"
            >
              Linux Distributions
            </button>
            <button
              type="button"
              className={`platform-tab-btn ${pkgTab === 'mac-pkg' ? 'active' : ''}`}
              onClick={() => setPkgTab('mac-pkg')}
              role="tab"
            >
              macOS
            </button>
            <button
              type="button"
              className={`platform-tab-btn ${pkgTab === 'source-pkg' ? 'active' : ''}`}
              onClick={() => setPkgTab('source-pkg')}
              role="tab"
            >
              Source Code (Git)
            </button>
          </div>

          <div className="platform-panel" style={{ maxWidth: '820px', margin: '0 auto' }}>
            {pkgTab === 'win-pkg' && (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                    1. Install ClamAV Engine (via Windows Package Manager):
                  </div>
                  <div className="code-box">
                    <div className="code-box-content">
                      <code>winget install Cisco.ClamAV</code>
                    </div>
                    <button
                      type="button"
                      className={`copy-btn ${copiedId === 'pkg-win-clam' ? 'copied' : ''}`}
                      onClick={() => handleCopy('winget install Cisco.ClamAV', 'pkg-win-clam')}
                    >
                      {copiedId === 'pkg-win-clam' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                    2. Install via Python pip:
                  </div>
                  <div className="code-box">
                    <div className="code-box-content">
                      <code>pip install pyegclamui</code>
                    </div>
                    <button
                      type="button"
                      className={`copy-btn ${copiedId === 'pkg-win-pip' ? 'copied' : ''}`}
                      onClick={() => handleCopy('pip install pyegclamui', 'pkg-win-pip')}
                    >
                      {copiedId === 'pkg-win-pip' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div>
                  <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                    3. Launch the Application:
                  </div>
                  <div className="code-box">
                    <div className="code-box-content">
                      <code>pyegclamui</code>
                    </div>
                    <button
                      type="button"
                      className={`copy-btn ${copiedId === 'pkg-win-run' ? 'copied' : ''}`}
                      onClick={() => handleCopy('pyegclamui', 'pkg-win-run')}
                    >
                      {copiedId === 'pkg-win-run' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px', margin: 0 }}>
                    You can also use the short alias: <code>egclam</code>
                  </p>
                </div>
              </div>
            )}

            {pkgTab === 'linux-pkg' && (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                    Ubuntu / Debian / Linux Mint:
                  </div>
                  <div className="code-box">
                    <div className="code-box-content">
                      <code>sudo apt update &amp;&amp; sudo apt install -y clamav clamav-daemon &amp;&amp; pip install pyegclamui</code>
                    </div>
                    <button
                      type="button"
                      className={`copy-btn ${copiedId === 'pkg-deb' ? 'copied' : ''}`}
                      onClick={() => handleCopy('sudo apt update && sudo apt install -y clamav clamav-daemon && pip install pyegclamui', 'pkg-deb')}
                    >
                      {copiedId === 'pkg-deb' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                    Fedora / RHEL / CentOS:
                  </div>
                  <div className="code-box">
                    <div className="code-box-content">
                      <code>sudo dnf install -y clamav clamd clamav-update &amp;&amp; pip install pyegclamui</code>
                    </div>
                    <button
                      type="button"
                      className={`copy-btn ${copiedId === 'pkg-fedora' ? 'copied' : ''}`}
                      onClick={() => handleCopy('sudo dnf install -y clamav clamd clamav-update && pip install pyegclamui', 'pkg-fedora')}
                    >
                      {copiedId === 'pkg-fedora' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div>
                  <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                    Arch Linux / Manjaro:
                  </div>
                  <div className="code-box">
                    <div className="code-box-content">
                      <code>sudo pacman -S clamav &amp;&amp; pip install pyegclamui</code>
                    </div>
                    <button
                      type="button"
                      className={`copy-btn ${copiedId === 'pkg-arch' ? 'copied' : ''}`}
                      onClick={() => handleCopy('sudo pacman -S clamav && pip install pyegclamui', 'pkg-arch')}
                    >
                      {copiedId === 'pkg-arch' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {pkgTab === 'mac-pkg' && (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                    1. Install ClamAV via Homebrew:
                  </div>
                  <div className="code-box">
                    <div className="code-box-content">
                      <code>brew install clamav</code>
                    </div>
                    <button
                      type="button"
                      className={`copy-btn ${copiedId === 'pkg-mac-brew' ? 'copied' : ''}`}
                      onClick={() => handleCopy('brew install clamav', 'pkg-mac-brew')}
                    >
                      {copiedId === 'pkg-mac-brew' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div>
                  <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                    2. Install pyEGClamUI via Pip:
                  </div>
                  <div className="code-box">
                    <div className="code-box-content">
                      <code>pip install pyegclamui</code>
                    </div>
                    <button
                      type="button"
                      className={`copy-btn ${copiedId === 'pkg-mac-pip' ? 'copied' : ''}`}
                      onClick={() => handleCopy('pip install pyegclamui', 'pkg-mac-pip')}
                    >
                      {copiedId === 'pkg-mac-pip' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {pkgTab === 'source-pkg' && (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                    Clone and Install in Editable Mode:
                  </div>
                  <div className="code-box">
                    <div className="code-box-content">
                      <code>git clone https://github.com/EG1DOTIN/pyEGClamUI.git &amp;&amp; cd pyEGClamUI &amp;&amp; pip install -e .</code>
                    </div>
                    <button
                      type="button"
                      className={`copy-btn ${copiedId === 'pkg-git' ? 'copied' : ''}`}
                      onClick={() => handleCopy('git clone https://github.com/EG1DOTIN/pyEGClamUI.git && cd pyEGClamUI && pip install -e .', 'pkg-git')}
                    >
                      {copiedId === 'pkg-git' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <a href="https://github.com/EG1DOTIN/pyEGClamUI" target="_blank" rel="noopener noreferrer">
                    <Button variant="secondary" size="sm">
                      Open Repository on GitHub &rarr;
                    </Button>
                  </a>
                </div>

                <div style={{ textAlign: 'center', marginTop: '32px' }}>
                  <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                    Need daemon socket configuration, CLI headless usage, or cross-platform security hardening?
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => (onNavigate ? onNavigate('documentation.html') : (window.location.href = 'documentation.html'))}
                  >
                    Read ClamAV Setup &amp; Architecture Docs &rarr;
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* System Requirements Table */}
      <section style={{ padding: '64px 0', background: 'var(--bg-subtle)', borderTop: '1px solid var(--border-subtle)' }}>
        <Container style={{ maxWidth: '820px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <span className="section-tag">Specifications</span>
            <h2 className="section-title">System Requirements</h2>
          </div>

          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)' }}>
            <table className="requirements-table">
              <thead>
                <tr>
                  <th>Component</th>
                  <th>Minimum Requirement</th>
                  <th>Recommended</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Python</td>
                  <td>Python 3.9+</td>
                  <td style={{ color: 'var(--color-emerald)', fontWeight: 600 }}>Python 3.11 or 3.12</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Antivirus Backend</td>
                  <td>Cisco ClamAV 0.103+</td>
                  <td style={{ color: 'var(--color-emerald)', fontWeight: 600 }}>ClamAV 1.4+ / 1.5+</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>GUI Framework</td>
                  <td>PySide6 &ge; 6.5.0</td>
                  <td style={{ color: 'var(--color-emerald)', fontWeight: 600 }}>PySide6 6.7+</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Operating System</td>
                  <td>Windows 10, Linux (kernel 4.15+), macOS 12+</td>
                  <td style={{ color: 'var(--color-emerald)', fontWeight: 600 }}>Windows 11, Ubuntu 24.04, macOS 14+</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>License</td>
                  <td colSpan={2}>GNU General Public License v3.0 (GPL-3.0)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Container>
      </section>
    </div>
  );
};
