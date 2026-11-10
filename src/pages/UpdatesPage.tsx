import React, { useEffect } from 'react';
import { Container } from 'eg-web-core';
import { useGitHubRelease, GitHubRelease, GitHubAssetItem, formatReleaseDate, formatBytes } from '../hooks';
import './UpdatesPage.css';

function findAsset(assets: GitHubAssetItem[] | undefined, filter: string, filter2?: string): GitHubAssetItem | undefined {
  if (!Array.isArray(assets)) return undefined;
  return assets.find((a) => {
    const name = (a.name || '').toLowerCase();
    if (filter2) {
      return name.includes(filter) && name.includes(filter2);
    }
    return name.includes(filter);
  });
}

function parseReleaseHighlights(body?: string): string[] {
  if (!body) return [];
  const lines = body.split('\n');
  const highlights: string[] = [];
  let inHighlights = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    if (line.toLowerCase().includes("what's new") || line.toLowerCase().includes('key highlights') || line.toLowerCase().includes('highlights')) {
      inHighlights = true;
      continue;
    }
    if (inHighlights && line.startsWith('## ') && !line.toLowerCase().includes('highlight')) {
      break;
    }
    if ((inHighlights || highlights.length === 0) && (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('### '))) {
      const clean = line.replace(/^[#\-\*]+\s*/, '').replace(/[*_`]/g, '').trim();
      if (clean && clean.length > 8 && !clean.toLowerCase().includes('what changed')) {
        highlights.push(clean);
        if (highlights.length >= 5) break;
      }
    }
  }

  return highlights;
}

/**
 * Updates and release history timeline for pyEGClamUI powered by GitHub Releases.
 *
 * @returns UpdatesPage view component
 *
 * @example
 * ```tsx
 * <Route path="/updates" element={<UpdatesPage />} />
 * ```
 */
export const UpdatesPage: React.FC = () => {
  const { version: latestVersion, releaseDate, assets, releases } = useGitHubRelease();

  useEffect(() => {
    try {
      localStorage.setItem('pyeg_seen_release', latestVersion);
      localStorage.setItem('eg_seen_updates_av', Date.now().toString());
    } catch {}
  }, [latestVersion]);

  return (
    <div className="updates-page">
      <Container>
        {/* Header Hero */}
        <section className="updates-header">
          <div className="section-tag">Product Releases &amp; Changelogs</div>
          <h1 className="page-title" style={{ fontSize: 'clamp(2rem, 1.6rem + 1.8vw, 2.8rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>
            Updates &amp; Release History
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '640px', margin: '0 auto', lineHeight: 1.6 }}>
            Track continuous updates, standalone binary releases, changelogs, and packaging milestones for pyEGClamUI directly synced from GitHub.
          </p>
        </section>

        {/* Releases Feed */}
        <div id="githubReleasesFeed" className="updates-feed">
          {releases && releases.length > 0 ? (
            releases.map((rel: GitHubRelease, idx: number) => {
              const isLatest = idx === 0;
              const tag = rel.tag_name || '';
              const versionNumber = tag.replace(/^v/, '');
              const pubDate = formatReleaseDate(rel.published_at);
              const highlights = parseReleaseHighlights(rel.body);

              const winExe = findAsset(rel.assets, 'setup') || findAsset(rel.assets, '.exe');
              const winZip = findAsset(rel.assets, 'windows', '.zip');
              const linTar = findAsset(rel.assets, 'linux') || findAsset(rel.assets, '.tar.gz');
              const macZip = findAsset(rel.assets, 'macos') || findAsset(rel.assets, 'darwin');
              const chk = findAsset(rel.assets, 'sha256') || findAsset(rel.assets, 'checksum');

              return (
                <article key={rel.id || tag} className={`release-card ${isLatest ? 'latest' : ''}`} id={tag}>
                  <div className="release-card-top">
                    <div>
                      <div className="release-title-row">
                        <h2 className="release-title">pyEGClamUI v{versionNumber}</h2>
                        <span className={`badge ${isLatest ? 'badge-emerald' : 'badge-sky'}`}>
                          {isLatest ? 'Latest Release' : (rel.prerelease ? 'Pre-Release' : 'Release')}
                        </span>
                      </div>
                      <div className="release-meta">
                        Released: {pubDate} &bull; {rel.name || `Release ${tag}`}
                      </div>
                    </div>
                    <div>
                      <a
                        href={rel.html_url || `https://github.com/EG1DOTIN/pyEGClamUI/releases/tag/${tag}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary btn-sm"
                      >
                        View on GitHub &rarr;
                      </a>
                    </div>
                  </div>

                  {highlights.length > 0 && (
                    <>
                      <h3 className="release-highlights-title">Key Highlights in v{versionNumber}:</h3>
                      <ul className="release-highlights-list">
                        {highlights.map((h, i) => (
                          <li key={i}>{h}</li>
                        ))}
                      </ul>
                    </>
                  )}

                  <div className="release-downloads-bar">
                    <span className="release-downloads-label">Download Binaries (v{versionNumber}):</span>
                    <div className="release-chips">
                      {winExe && (
                        <a href={winExe.browser_download_url} className="release-chip emerald" target="_blank" rel="noopener noreferrer">
                          Windows Setup ({formatBytes(winExe.size)})
                        </a>
                      )}
                      {winZip && (
                        <a href={winZip.browser_download_url} className="release-chip sky" target="_blank" rel="noopener noreferrer">
                          Windows ZIP ({formatBytes(winZip.size)})
                        </a>
                      )}
                      {linTar && (
                        <a href={linTar.browser_download_url} className="release-chip sky" target="_blank" rel="noopener noreferrer">
                          Linux Tarball ({formatBytes(linTar.size)})
                        </a>
                      )}
                      {macZip && (
                        <a href={macZip.browser_download_url} className="release-chip sky" target="_blank" rel="noopener noreferrer">
                          macOS ({formatBytes(macZip.size)})
                        </a>
                      )}
                      {chk && (
                        <a href={chk.browser_download_url} className="release-chip neutral" target="_blank" rel="noopener noreferrer">
                          SHA256 Checksums
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <>
              {/* Fallback Latest Release: v3.2.0 */}
              <article className="release-card latest" id="v3-2-0">
                <div className="release-card-top">
                  <div>
                    <div className="release-title-row">
                      <h2 className="release-title">pyEGClamUI v{latestVersion}</h2>
                      <span className="badge badge-emerald">Latest Release</span>
                    </div>
                    <div className="release-meta">
                      Released: {releaseDate} &bull; Adaptive Dual-Tier GUI &amp; Hardware Universality
                    </div>
                  </div>
                  <div>
                    <a
                      href={`https://github.com/EG1DOTIN/pyEGClamUI/releases/tag/v${latestVersion}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                    >
                      View on GitHub &rarr;
                    </a>
                  </div>
                </div>

                <h3 className="release-highlights-title">Key Highlights in v{latestVersion}:</h3>
                <ul className="release-highlights-list">
                  <li>
                    <strong>Deterministic Dual-Tier Adaptive GUI:</strong> Automatically engages Modern Qt6 Suite on &ge; 4.0 GB RAM or pyEGClamUI Lite (Tkinter, ~15 MB RSS) on 32-bit CPUs and low-spec systems.
                  </li>
                  <li>
                    <strong>ClamAV RAM-Adaptive Provisioning:</strong> Prevents system Out-Of-Memory (OOM) crashes on &lt; 4.0 GB systems by using on-demand <code>clamscan</code> (0 MB idle RAM) while using resident <code>clamd</code> sockets on high-spec workstations.
                  </li>
                  <li>
                    <strong>Pre-Flight Engine Guards:</strong> Eliminates false-clean scan reports on missing binaries and enforces signature database freshness checks.
                  </li>
                  <li>
                    <strong>Standardized CLI Command Wrappers:</strong> Direct PATH executables (<code>pyegclamui</code>, <code>pyegclamui-lite</code>, <code>pyegclamui-scan</code>, <code>pyegclamui-setup</code>).
                  </li>
                  <li>
                    <strong>Universal Multi-OS Packaging:</strong> Standalone Windows Inno Setup installer (<code>pyEGClamUI-v3.2.0-Windows-Setup.exe</code>), Linux tarballs, macOS bundles, and Alpine/openSUSE package manager support.
                  </li>
                </ul>

                <div className="release-downloads-bar">
                  <span className="release-downloads-label">Download Binaries (v{latestVersion}):</span>
                  <div className="release-chips">
                    {assets.windowsExe && (
                      <a href={assets.windowsExe.browser_download_url} className="release-chip emerald" target="_blank" rel="noopener noreferrer">
                        Windows Setup (.exe)
                      </a>
                    )}
                    {assets.windowsZip && (
                      <a href={assets.windowsZip.browser_download_url} className="release-chip sky" target="_blank" rel="noopener noreferrer">
                        Windows (.zip)
                      </a>
                    )}
                    {assets.linuxTar && (
                      <a href={assets.linuxTar.browser_download_url} className="release-chip sky" target="_blank" rel="noopener noreferrer">
                        Linux (.tar.gz)
                      </a>
                    )}
                    {assets.macosZip && (
                      <a href={assets.macosZip.browser_download_url} className="release-chip sky" target="_blank" rel="noopener noreferrer">
                        macOS (.zip)
                      </a>
                    )}
                    {assets.checksums && (
                      <a href={assets.checksums.browser_download_url} className="release-chip neutral" target="_blank" rel="noopener noreferrer">
                        Checksums
                      </a>
                    )}
                  </div>
                </div>
              </article>

              {/* Fallback Release: v3.1.0 */}
              <article className="release-card" id="v3-1-0">
                <div className="release-card-top">
                  <div>
                    <div className="release-title-row">
                      <h2 className="release-title">pyEGClamUI v3.1.0</h2>
                      <span className="badge badge-sky">Release</span>
                    </div>
                    <div className="release-meta">
                      Released: October 2026 &bull; Performance &amp; Non-Blocking GUI Suite
                    </div>
                  </div>
                  <div>
                    <a
                      href="https://github.com/EG1DOTIN/pyEGClamUI/releases/tag/v3.1.0"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                    >
                      View on GitHub &rarr;
                    </a>
                  </div>
                </div>

                <h3 className="release-highlights-title">Key Highlights in v3.1.0:</h3>
                <ul className="release-highlights-list">
                  <li>
                    <strong>Native Inno Setup Windows Suite:</strong> Standalone installer with bundled Python runtime, ClamAV provisioning, and self-elevating ClamD service activator.
                  </li>
                  <li>
                    <strong>Centric Hidden Process Foundation:</strong> Eliminates console window flashes across scans, updates, and engine commands using <code>CREATE_NO_WINDOW</code>.
                  </li>
                  <li>
                    <strong>Non-Blocking Asynchronous GUI Lifecycle:</strong> Offloads heavy engine audits and health checks to background worker threads, permanently eliminating UI freezes.
                  </li>
                  <li>
                    <strong>In-Memory TTL Caching:</strong> Instant tab switching via 6-second caching in engine detector and 0.5s socket connect timeouts.
                  </li>
                </ul>
              </article>

              {/* Fallback Release: v3.0.0 */}
              <article className="release-card" id="v3-0-0">
                <div className="release-card-top">
                  <div>
                    <div className="release-title-row">
                      <h2 className="release-title">pyEGClamUI v3.0.0</h2>
                      <span className="badge badge-sky">Release</span>
                    </div>
                    <div className="release-meta">
                      Released: September 2026 &bull; Initial Production Release
                    </div>
                  </div>
                  <div>
                    <a
                      href="https://github.com/EG1DOTIN/pyEGClamUI/releases/tag/v3.0.0"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                    >
                      View on GitHub &rarr;
                    </a>
                  </div>
                </div>

                <h3 className="release-highlights-title">Key Highlights in v3.0.0:</h3>
                <ul className="release-highlights-list">
                  <li>
                    <strong>Cross-Platform:</strong> Runs natively on Windows 10/11, Linux, and macOS.
                  </li>
                  <li>
                    <strong>Engine Auto-Discovery:</strong> Automatically detects <code>clamscan</code>, <code>clamd</code>, and <code>freshclam</code> across system PATH.
                  </li>
                  <li>
                    <strong>ClamAV Daemon Integration:</strong> Communicates via Unix domain socket or TCP socket using standard <code>INSTREAM</code> chunk framing.
                  </li>
                  <li>
                    <strong>Multiple Scan Modes:</strong> Quick scan, full system scan, custom folder scan, and process memory scan.
                  </li>
                </ul>
              </article>
            </>
          )}
        </div>

        {/* Milestones & Packaging Architecture */}
        <section className="milestones-section">
          <div className="section-tag">Milestones</div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '6px', marginBottom: '16px' }}>
            Packaging &amp; Integration Milestones
          </h2>

          <article className="milestone-card">
            <div className="milestone-title-row">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 className="milestone-title">Automated Multi-Platform CI/CD Packaging Pipeline</h3>
                  <span className="badge badge-sky">Packaging</span>
                </div>
                <div className="milestone-date">September 2026 &bull; GitHub Actions Build Automation</div>
              </div>
            </div>
            <p className="milestone-desc">
              Established automated GitHub Actions CI/CD workflows to compile, package, and release signed native executables and checksums for all major desktop platforms:
            </p>
            <ul className="milestone-list">
              <li>
                <strong>Windows 10 / 11:</strong> Standalone executable installer and portable ZIP packages.
              </li>
              <li>
                <strong>Linux:</strong> Universal AppImage and portable tarballs compatible across Ubuntu, Debian, Fedora, Arch, and Linux Mint.
              </li>
              <li>
                <strong>macOS:</strong> Universal DMG image natively supporting Apple Silicon (M1/M2/M3/M4) and Intel x86_64 architectures.
              </li>
            </ul>
          </article>
        </section>

        {/* Previous Versions Deprecation Notice */}
        <section className="deprecation-card">
          <div className="deprecation-header">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <h2 className="deprecation-title">Previous Versions Deprecated</h2>
          </div>
          <p className="deprecation-text">
            All previous projects and repositories—including <code>EGClamNetAntivirus</code> and <code>EG-ClamNet-Antivirus-2</code>—are <strong>deprecated, unsupported, not maintained and permanently removed from GitHub and version history</strong>.
          </p>
          <p className="deprecation-text">
            If you are using older version, please migrate to <strong><i>pyEGClamUI</i></strong> latest version, which replaces all previous iterations with a stable and production-ready cross-platform codebase.
          </p>
        </section>

        {/* GitHub Release History Card */}
        <section className="gh-history-card">
          <h2 className="gh-history-title">GitHub Release History</h2>
          <p className="gh-history-desc">
            Access full changelogs, tagged release milestones, commit logs, compiled binary artifacts, SHA-256 checksums, and source code archives directly on GitHub.
          </p>
          <a
            href="https://github.com/EG1DOTIN/pyEGClamUI/releases"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            Explore GitHub Releases &rarr;
          </a>
        </section>
      </Container>
    </div>
  );
};
