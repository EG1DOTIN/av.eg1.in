/**
 * pyEGClamUI Official Web Portal Scripts
 * Clean, lightweight, dependency-free Vanilla JS
 */

document.addEventListener('DOMContentLoaded', () => {
  // ========================================================================
  // GitHub Automated Release Synchronization Engine
  // ========================================================================
  const GH_REPO = 'EG1DOTIN/pyEGClamUI';
  const GH_CACHE_KEY = 'pyeg_gh_releases';
  const GH_CACHE_TIME_KEY = 'pyeg_gh_releases_time';
  const GH_CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes TTL

  function escapeHTML(str) {
    if (!str) return '';
    return String(str).replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }

  function formatReleaseDate(isoString) {
    if (!isoString) return '';
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  function formatBytes(bytes) {
    if (!bytes || isNaN(bytes)) return '';
    const mb = bytes / (1024 * 1024);
    return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
  }

  function findPlatformAssets(assets) {
    if (!Array.isArray(assets)) return {};
    let windowsExe = null;
    let windowsZip = null;
    let linuxTar = null;
    let macosZip = null;
    let checksums = null;

    assets.forEach((asset) => {
      const name = asset.name || '';
      const lower = name.toLowerCase();
      if (lower.endsWith('.exe')) {
        windowsExe = asset;
      } else if (lower.includes('windows') && lower.endsWith('.zip')) {
        windowsZip = asset;
      } else if (lower.includes('linux') && (lower.endsWith('.tar.gz') || lower.endsWith('.appimage') || lower.endsWith('.tgz'))) {
        linuxTar = asset;
      } else if ((lower.includes('macos') || lower.includes('darwin')) && (lower.endsWith('.zip') || lower.endsWith('.dmg'))) {
        macosZip = asset;
      } else if (lower.includes('sha256') || lower.includes('checksum')) {
        checksums = asset;
      }
    });

    return { windowsExe, windowsZip, linuxTar, macosZip, checksums };
  }

  function cleanMarkdownSummary(body) {
    if (!body) return '';
    const lines = body.split('\n');
    const contentLines = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      let clean = trimmed.replace(/^[\*\-\+]\s+/, '');
      clean = clean.replace(/[*_`]/g, '');
      if (clean) contentLines.push(clean);
      if (contentLines.length >= 2) break;
    }
    let summary = contentLines.join(' ');
    if (summary.length > 220) {
      summary = summary.substring(0, 217) + '...';
    }
    return summary;
  }

  function renderMarkdownToHtml(markdown) {
    if (!markdown) return '';
    let escaped = escapeHTML(markdown);

    escaped = escaped.replace(/^### (.*$)/gim, '<h4 style="font-size: var(--text-sm); font-weight: 700; color: var(--text-primary); margin: var(--space-4) 0 var(--space-1) 0;">$1</h4>');
    escaped = escaped.replace(/^## (.*$)/gim, '<h3 style="font-size: var(--text-base); font-weight: 700; color: var(--text-primary); margin: var(--space-5) 0 var(--space-2) 0;">$1</h3>');
    escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    escaped = escaped.replace(/`([^`]+)`/g, '<code>$1</code>');
    escaped = escaped.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
    escaped = escaped.replace(/@([a-zA-Z0-9_\-]+)/g, '<a href="https://github.com/$1" target="_blank" rel="noopener noreferrer">@$1</a>');

    const lines = escaped.split('\n');
    let inList = false;
    const result = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('* ') || line.startsWith('- ')) {
        if (!inList) {
          result.push('<ul style="margin: var(--space-2) 0; padding-left: 1.25rem; display: flex; flex-direction: column; gap: var(--space-1); line-height: 1.6;">');
          inList = true;
        }
        result.push(`<li>${line.substring(2)}</li>`);
      } else {
        if (inList) {
          result.push('</ul>');
          inList = false;
        }
        if (line) {
          if (!line.startsWith('<h') && !line.startsWith('</h')) {
            result.push(`<p style="margin: var(--space-2) 0; line-height: 1.6;">${line}</p>`);
          } else {
            result.push(line);
          }
        }
      }
    }
    if (inList) {
      result.push('</ul>');
    }

    return result.join('\n');
  }

  async function fetchGitHubReleases() {
    try {
      const cachedTime = localStorage.getItem(GH_CACHE_TIME_KEY);
      const cachedData = localStorage.getItem(GH_CACHE_KEY);
      if (cachedTime && cachedData && (Date.now() - Number(cachedTime) < GH_CACHE_TTL_MS)) {
        const parsed = JSON.parse(cachedData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {}

    try {
      const res = await fetch(`https://api.github.com/repos/${GH_REPO}/releases`, {
        headers: { 'Accept': 'application/vnd.github.v3+json' }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          try {
            localStorage.setItem(GH_CACHE_KEY, JSON.stringify(data));
            localStorage.setItem(GH_CACHE_TIME_KEY, String(Date.now()));
          } catch (e) {}
          return data;
        }
      }
    } catch (err) {
      console.debug('Live GitHub releases fetch fallback to cached/static data:', err);
    }

    try {
      const staleData = localStorage.getItem(GH_CACHE_KEY);
      if (staleData) {
        return JSON.parse(staleData);
      }
    } catch (e) {}

    return null;
  }

  function syncDownloadCards(latestRelease) {
    if (!latestRelease || !Array.isArray(latestRelease.assets)) return;
    const assets = findPlatformAssets(latestRelease.assets);

    // 1. Windows Installer (.exe)
    if (assets.windowsExe) {
      document.querySelectorAll('a[data-gh-download="windows-exe"]').forEach((el) => {
        el.href = assets.windowsExe.browser_download_url;
      });
      const sizeStr = formatBytes(assets.windowsExe.size);
      document.querySelectorAll('[data-gh-filename="windows"]').forEach((el) => {
        el.textContent = `${assets.windowsExe.name}${sizeStr ? ' \u2022 ' + sizeStr : ''}`;
      });
    }

    // 2. Windows Portable (.zip)
    if (assets.windowsZip) {
      document.querySelectorAll('a[data-gh-download="windows-zip"]').forEach((el) => {
        el.href = assets.windowsZip.browser_download_url;
      });
      if (!assets.windowsExe) {
        document.querySelectorAll('a[data-config="downloadWindows"]').forEach((el) => {
          el.href = assets.windowsZip.browser_download_url;
        });
        const sizeStr = formatBytes(assets.windowsZip.size);
        document.querySelectorAll('[data-gh-filename="windows"]').forEach((el) => {
          el.textContent = `${assets.windowsZip.name}${sizeStr ? ' \u2022 ' + sizeStr : ''}`;
        });
      }
    }

    // 3. Linux (.tar.gz / AppImage)
    if (assets.linuxTar) {
      document.querySelectorAll('a[data-gh-download="linux"], a[data-config="downloadLinux"]').forEach((el) => {
        el.href = assets.linuxTar.browser_download_url;
      });
      const sizeStr = formatBytes(assets.linuxTar.size);
      document.querySelectorAll('[data-gh-filename="linux"]').forEach((el) => {
        el.textContent = `${assets.linuxTar.name}${sizeStr ? ' \u2022 ' + sizeStr : ''}`;
      });
    }

    // 4. macOS (.zip / .dmg)
    if (assets.macosZip) {
      document.querySelectorAll('a[data-gh-download="macos"], a[data-config="downloadMacos"]').forEach((el) => {
        el.href = assets.macosZip.browser_download_url;
      });
      const sizeStr = formatBytes(assets.macosZip.size);
      document.querySelectorAll('[data-gh-filename="macos"]').forEach((el) => {
        el.textContent = `${assets.macosZip.name}${sizeStr ? ' \u2022 ' + sizeStr : ''}`;
      });
    }

    // 5. Checksums
    if (assets.checksums) {
      document.querySelectorAll('a[data-gh-download="checksums"]').forEach((el) => {
        el.href = assets.checksums.browser_download_url;
      });
    }
  }

  function syncReleasesFeed(releases) {
    const feedContainer = document.getElementById('githubReleasesFeed');
    if (!feedContainer || !Array.isArray(releases) || releases.length === 0) return;

    const cardsHtml = releases.map((rel, idx) => {
      const isLatest = idx === 0;
      const tag = rel.tag_name || '';
      const versionNumber = tag.replace(/^v/, '');
      const pubDate = formatReleaseDate(rel.published_at);
      const bodyHtml = renderMarkdownToHtml(rel.body || 'No release description provided.');

      let assetsHtml = '';
      if (Array.isArray(rel.assets) && rel.assets.length > 0) {
        const pills = rel.assets.map((asset) => {
          const lower = (asset.name || '').toLowerCase();
          const isExe = lower.endsWith('.exe');
          const isZip = lower.endsWith('.zip');
          const isTar = lower.endsWith('.tar.gz') || lower.endsWith('.appimage');
          const badgeClass = isExe ? 'badge-emerald' : (isZip || isTar ? 'badge-sky' : '');
          const sizeStr = formatBytes(asset.size);
          return `<a href="${escapeHTML(asset.browser_download_url)}" target="_blank" rel="noopener noreferrer" class="badge ${badgeClass}" style="text-decoration: none; padding: 4px 8px; display: inline-flex; align-items: center; gap: 4px;">
            <span>${escapeHTML(asset.name)}</span>
            ${sizeStr ? `<span style="opacity: 0.7; font-size: 0.65rem;">(${sizeStr})</span>` : ''}
          </a>`;
        }).join(' ');

        assetsHtml = `
          <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: var(--space-3) var(--space-4); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-3);">
            <span style="font-size: var(--text-xs); color: var(--text-muted); font-weight: 600;">Download Binaries (${escapeHTML(tag)}):</span>
            <div style="display: flex; flex-wrap: wrap; gap: var(--space-2);">
              ${pills}
            </div>
          </div>
        `;
      }

      return `
        <article class="feature-card" id="${escapeHTML(tag)}" style="border-color: ${isLatest ? 'rgba(0, 220, 130, 0.45)' : 'var(--border-subtle)'}; padding: var(--space-6); margin-bottom: var(--space-8); ${isLatest ? 'box-shadow: 0 4px 20px rgba(0, 220, 130, 0.08);' : ''}">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: var(--space-2); margin-bottom: var(--space-4); border-bottom: 1px solid var(--border-subtle); padding-bottom: var(--space-4);">
            <div>
              <div style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-1);">
                <h2 style="margin: 0; font-size: var(--text-xl); font-weight: 700; color: var(--text-primary);">
                  pyEGClamUI v${escapeHTML(versionNumber)}
                </h2>
                <span class="badge ${isLatest ? 'badge-emerald' : 'badge-sky'}">${isLatest ? 'Latest Release' : 'Release'}</span>
              </div>
              <div style="font-size: var(--text-xs); color: var(--text-muted);">
                Released: ${escapeHTML(pubDate)} &bull; ${rel.prerelease ? 'Pre-Release' : 'GitHub Official Release'}
              </div>
            </div>
            <div>
              <a href="${escapeHTML(rel.html_url)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">
                View on GitHub &rarr;
              </a>
            </div>
          </div>

          <div class="release-body" style="font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.7; margin-bottom: var(--space-5);">
            ${bodyHtml}
          </div>

          ${assetsHtml}
        </article>
      `;
    }).join('');

    feedContainer.innerHTML = cardsHtml;
  }

  // 0. Dynamic site-config.json Loader + Automated GitHub Sync
  async function loadDynamicConfig() {
    try {
      const response = await fetch('site-config.json?cache_bust=' + Date.now());
      let config = {};
      if (response.ok) {
        config = await response.json();
      }

      // Check GitHub releases first (with 15-minute caching)
      const releases = await fetchGitHubReleases();
      const latestRelease = releases && releases.length > 0 ? releases[0] : null;

      let activeVersion = config.project?.version;
      let activeReleaseDate = config.project?.releaseDate;

      if (latestRelease && latestRelease.tag_name) {
        activeVersion = latestRelease.tag_name.replace(/^v/, '');
        if (latestRelease.published_at) {
          activeReleaseDate = formatReleaseDate(latestRelease.published_at);
        }
      }

      if (activeVersion) {
        document.querySelectorAll('[data-config="version"]').forEach((el) => {
          el.textContent = activeVersion;
        });
      }

      if (activeReleaseDate) {
        document.querySelectorAll('[data-config="releaseDate"]').forEach((el) => {
          el.textContent = activeReleaseDate;
        });
      }

      // 2. Release Stage
      if (config.project?.releaseStage) {
        document.querySelectorAll('[data-config="releaseStage"]').forEach((el) => {
          el.textContent = config.project.releaseStage;
        });
      }

      // 3. GitHub App Repo Link
      if (config.github?.repo) {
        document.querySelectorAll('a[data-config="githubRepo"]').forEach((el) => {
          el.href = config.github.repo;
        });
      }

      // 3b. GitHub Website Repo Link
      if (config.github?.websiteRepo) {
        document.querySelectorAll('a[data-config="websiteRepo"]').forEach((el) => {
          el.href = config.github.websiteRepo;
        });
      }

      // 4. GitHub Issues Link
      if (config.github?.issues) {
        document.querySelectorAll('a[data-config="githubIssues"]').forEach((el) => {
          el.href = config.github.issues;
        });
      }

      // 5. GitHub Releases Link
      if (config.github?.releases) {
        document.querySelectorAll('a[data-config="githubReleases"]').forEach((el) => {
          el.href = config.github.releases;
        });
      }

      // 6. Contact URL
      if (config.contact?.url) {
        document.querySelectorAll('a[data-config="contactUrl"]').forEach((el) => {
          el.href = config.contact.url;
        });
      }

      // 7. Privacy Policy URL
      if (config.contact?.privacyPolicy) {
        document.querySelectorAll('a[data-config="privacyPolicy"]').forEach((el) => {
          el.href = config.contact.privacyPolicy;
        });
      }

      // 8. Official Site URL
      if (config.contact?.officialSite) {
        document.querySelectorAll('a[data-config="officialSite"]').forEach((el) => {
          el.href = config.contact.officialSite;
        });
      }

      // 9. Sync direct downloads with live GitHub release assets
      if (latestRelease) {
        syncDownloadCards(latestRelease);
      } else if (config.downloads) {
        if (config.downloads.windows) {
          document.querySelectorAll('a[data-config="downloadWindows"]').forEach((el) => {
            el.href = config.downloads.windows;
          });
        }
        if (config.downloads.linux) {
          document.querySelectorAll('a[data-config="downloadLinux"]').forEach((el) => {
            el.href = config.downloads.linux;
          });
        }
        if (config.downloads.macos) {
          document.querySelectorAll('a[data-config="downloadMacos"]').forEach((el) => {
            el.href = config.downloads.macos;
          });
        }
      }

      // 10. Sync Dynamic Releases Feed on updates.html if container present
      if (releases && releases.length > 0) {
        syncReleasesFeed(releases);
      }

      // 11. Generic HTML Comment Marker Fallbacks
      updateCommentMarkers(document.body, 'version', activeVersion);
      updateCommentMarkers(document.body, 'releaseDate', activeReleaseDate);
      updateCommentMarkers(document.body, 'releaseStage', config.project?.releaseStage);
      updateCommentMarkers(document.body, 'githubRepo', config.github?.repo);
      updateCommentMarkers(document.body, 'githubIssues', config.github?.issues);
      updateCommentMarkers(document.body, 'githubReleases', config.github?.releases);
      updateCommentMarkers(document.body, 'contactUrl', config.contact?.url);
      updateCommentMarkers(document.body, 'privacyPolicy', config.contact?.privacyPolicy);
      updateCommentMarkers(document.body, 'officialSite', config.contact?.officialSite);
      updateCommentMarkers(document.body, 'downloadWindows', config.downloads?.windows);
      updateCommentMarkers(document.body, 'downloadLinux', config.downloads?.linux);
      updateCommentMarkers(document.body, 'downloadMacos', config.downloads?.macos);
    } catch (err) {
      console.debug('Dynamic config load notice:', err);
    }
  }

  function updateCommentMarkers(root, key, value) {
    if (!root || !value) return;
    const startTag = `config:${key}`;
    const endTag = `/config:${key}`;

    const iterator = document.createNodeIterator(root, NodeFilter.SHOW_COMMENT);
    let node;
    const startNodes = [];

    while ((node = iterator.nextNode())) {
      if (node.nodeValue.trim() === startTag) {
        startNodes.push(node);
      }
    }

    startNodes.forEach((startNode) => {
      let current = startNode.nextSibling;
      let replaced = false;
      const nodesToRemove = [];
      while (current && !(current.nodeType === Node.COMMENT_NODE && current.nodeValue.trim() === endTag)) {
        if (!replaced) {
          if (current.nodeType === Node.TEXT_NODE) {
            current.nodeValue = value;
            replaced = true;
          } else if (current.nodeType === Node.ELEMENT_NODE) {
            current.textContent = value;
            replaced = true;
          }
        } else {
          nodesToRemove.push(current);
        }
        current = current.nextSibling;
      }
      nodesToRemove.forEach((n) => n.remove());
      if (!replaced && current) {
        const txt = document.createTextNode(value);
        startNode.parentNode.insertBefore(txt, current);
      }
    });
  }

  loadDynamicConfig();

  // 1. Mobile Menu Toggle
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      mobileToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
        navMenu.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Close menu when clicking any nav link
    navMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // 2. Copy Code Snippet to Clipboard
  const copyButtons = document.querySelectorAll('.copy-btn');
  copyButtons.forEach((btn) => {
    btn.addEventListener('click', async () => {
      const codeTarget = btn.getAttribute('data-clipboard-target');
      const targetEl = codeTarget ? document.querySelector(codeTarget) : btn.parentElement.querySelector('code');

      if (!targetEl) return;
      const textToCopy = targetEl.textContent.trim();

      try {
        await navigator.clipboard.writeText(textToCopy);
        const originalText = btn.innerHTML;
        btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!`;
        btn.style.color = '#00dc82';
        btn.style.borderColor = 'rgba(0, 220, 130, 0.4)';

        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.style.color = '';
          btn.style.borderColor = '';
        }, 2000);
      } catch (err) {
        console.error('Clipboard copy failed:', err);
      }
    });
  });

  // 3. Platform Switcher Tabs (Scoped per section)
  document.querySelectorAll('.platform-tabs').forEach((tabContainer) => {
    const tabs = tabContainer.querySelectorAll('.platform-tab-btn');
    const parentScope = tabContainer.closest('section') || document;
    const panels = parentScope.querySelectorAll('.platform-panel');

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const targetOS = tab.getAttribute('data-platform');

        tabs.forEach((t) => t.classList.remove('active'));
        panels.forEach((p) => p.classList.remove('active'));

        tab.classList.add('active');
        const activePanel = document.getElementById(`panel-${targetOS}`);
        if (activePanel) {
          activePanel.classList.add('active');
        }
      });
    });
  });

  // 4. "Under the Hood" Collapsible Details
  const hoodToggles = document.querySelectorAll('.hood-toggle');
  hoodToggles.forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const content = toggle.nextElementSibling;
      if (content && content.classList.contains('hood-content')) {
        const isShown = content.classList.toggle('active');
        toggle.setAttribute('aria-expanded', isShown);
      }
    });
  });

  // 5. FAQ Accordion Toggle
  const faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach((q) => {
    q.addEventListener('click', () => {
      const item = q.closest('.faq-item');
      if (item) {
        const wasActive = item.classList.contains('active');

        // Optional: close other open items
        document.querySelectorAll('.faq-item').forEach((i) => i.classList.remove('active'));

        if (!wasActive) {
          item.classList.add('active');
        }
      }
    });
  });

  // 6. Interactive Status Matrix Demo (Homepage)
  const demoButtons = document.querySelectorAll('.demo-state-btn');
  const statusShield = document.getElementById('demoStatusShield');
  const statusHeadline = document.getElementById('demoStatusHeadline');
  const statusSubheadline = document.getElementById('demoStatusSub');
  const demoDot = document.getElementById('demoStatusDot');
  const demoEngineVal = document.getElementById('demoEngineVal');
  const demoDbVal = document.getElementById('demoDbVal');
  const demoGuardVal = document.getElementById('demoGuardVal');

  if (demoButtons.length > 0 && statusShield) {
    demoButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        demoButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const state = btn.getAttribute('data-state');

        if (state === 'protected') {
          demoDot.style.backgroundColor = '#00dc82';
          demoDot.style.boxShadow = '0 0 10px #00dc82';
          statusHeadline.textContent = 'System Protected';
          statusSubheadline.textContent = 'Real-time protection is active and threat definitions are fresh.';
          demoEngineVal.innerHTML = '<span class="badge badge-emerald">Online</span> ClamAV 1.4+';
          demoDbVal.innerHTML = '<span class="badge badge-emerald">Up to date</span> Today';
          demoGuardVal.innerHTML = '<span class="badge badge-emerald">Active</span> 2 Folders Guarded';
        } else if (state === 'warning') {
          demoDot.style.backgroundColor = '#f59e0b';
          demoDot.style.boxShadow = '0 0 10px #f59e0b';
          statusHeadline.textContent = 'Action Recommended';
          statusSubheadline.textContent = 'Virus definitions are 6 days old. Click "Update" to refresh.';
          demoEngineVal.innerHTML = '<span class="badge badge-emerald">Online</span> ClamAV 1.4+';
          demoDbVal.innerHTML = '<span class="badge badge-alpha">Stale (6d)</span> Update Ready';
          demoGuardVal.innerHTML = '<span class="badge badge-emerald">Active</span> 2 Folders Guarded';
        } else if (state === 'quarantine') {
          demoDot.style.backgroundColor = '#ef4444';
          demoDot.style.boxShadow = '0 0 10px #ef4444';
          statusHeadline.textContent = 'Threat Isolated in Vault';
          statusSubheadline.textContent = 'Suspicious file safely neutralized into non-executable .quarantine container.';
          demoEngineVal.innerHTML = '<span class="badge badge-emerald">Online</span> ClamAV 1.4+';
          demoDbVal.innerHTML = '<span class="badge badge-emerald">Up to date</span> Today';
          demoGuardVal.innerHTML = '<span class="badge badge-alpha" style="color:#ef4444; border-color:rgba(239,68,68,0.3); background:rgba(239,68,68,0.1);">1 Threat In Vault</span>';
        }
      });
    });
  }

  // 7. Screenshot Lightbox Modal
  const galleryCards = document.querySelectorAll('.gallery-card');
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxCaption = document.getElementById('lightboxCaption');

  if (galleryCards.length > 0 && lightboxModal && lightboxImg) {
    galleryCards.forEach((card) => {
      card.addEventListener('click', () => {
        const fullSrc = card.getAttribute('data-full-src') || card.querySelector('img')?.src;
        const title = card.querySelector('.gallery-title')?.textContent || '';

        if (fullSrc) {
          lightboxImg.src = fullSrc;
          if (lightboxCaption) lightboxCaption.textContent = title;
          lightboxModal.classList.add('active');
        }
      });
    });

    const closeLightbox = () => lightboxModal.classList.remove('active');

    if (lightboxClose) {
      lightboxClose.addEventListener('click', closeLightbox);
    }

    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) {
        closeLightbox();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightboxModal.classList.contains('active')) {
        closeLightbox();
      }
    });
  }

  // ========================================================================
  // Notification Bell & Updates Balloon Dropdown
  // ========================================================================
  // Notification Bell & Updates Balloon Dropdown (Automated GitHub Sync)
  // ========================================================================
  const bellBtn = document.getElementById('notificationBellBtn');
  const dropdown = document.getElementById('notificationDropdown');
  const closeBtn = document.getElementById('notificationCloseBtn');
  const listContainer = document.getElementById('notificationList');
  const dot = document.getElementById('notificationDot');

  if (bellBtn && dropdown && listContainer) {
    let updatesLoaded = false;
    let latestSeenTag = '';

    // Check if the user has already opened and seen the latest notification
    async function updateUnreadState() {
      try {
        const releases = await fetchGitHubReleases();
        if (releases && releases.length > 0) {
          latestSeenTag = releases[0].tag_name || '';
          const lastSeen = localStorage.getItem('pyeg_seen_release');
          if (lastSeen === latestSeenTag && dot) {
            dot.classList.add('is-read');
          } else if (dot) {
            dot.classList.remove('is-read');
          }
        }
      } catch (e) {}
    }
    updateUnreadState();

    const defaultUpdates = [
      {
        id: "v3-1-0",
        title: "pyEGClamUI v3.1.0 Released",
        date: "October 3, 2026",
        badge: "Latest Release",
        badgeType: "emerald",
        summary: "Official Windows Inno Setup standalone installation suite, centric hidden process runner eliminating console flashes, non-blocking asynchronous GUI lifecycle eliminating UI freezes, and multi-OS CI/CD packaging.",
        link: "updates.html#v3-1-0"
      },
      {
        id: "v3-0-0",
        title: "pyEGClamUI v3.0.0 Released",
        date: "September 30, 2026",
        badge: "Release",
        badgeType: "sky",
        summary: "Major cross-platform release featuring ready-to-run standalone desktop binaries for Windows (.exe), Linux (AppImage & Tarball), and macOS (.dmg), automated PowerShell & Bash one-liner setup scripts, full native ClamAV engine control with live scan progress streaming, and a high-performance dark cybersecurity UI.",
        link: "updates.html#v3-0-0"
      },
      {
        id: "legacy-deprecation",
        title: "Legacy Versions Deprecation Notice",
        date: "September 2026",
        badge: "Deprecated",
        badgeType: "amber",
        summary: "All previous legacy projects and repositories—including EGClamNetAntivirus and EG-ClamNet-Antivirus-2—are officially deprecated, unsupported, and will be permanently removed from GitHub and version history soon. Please migrate to pyEGClamUI v3.0.0+.",
        link: "updates.html"
      }
    ];

    function renderUpdates(items) {
      if (!items || items.length === 0) {
        listContainer.innerHTML = '<div class="notification-empty">No new updates right now.</div>';
        return;
      }

      listContainer.innerHTML = items.map(item => {
        const badgeClass = item.badgeType === 'sky' ? 'badge-sky' : (item.badgeType === 'emerald' ? 'badge-emerald' : (item.badgeType === 'amber' ? 'badge-amber' : ''));
        return `
          <a href="${escapeHTML(item.link || 'updates.html')}" class="notification-item">
            <div class="notification-item-top">
              <span class="notification-item-title">${escapeHTML(item.title)}</span>
              ${item.badge ? `<span class="badge ${badgeClass}" style="font-size: 0.65rem; padding: 1px 6px;">${escapeHTML(item.badge)}</span>` : ''}
            </div>
            <p class="notification-item-desc">${escapeHTML(item.summary)}</p>
            <div class="notification-item-date">${escapeHTML(item.date)}</div>
          </a>
        `;
      }).join('');
    }

    async function loadNotifications() {
      if (updatesLoaded) return;

      // 1. Try to fetch dynamic updates directly from GitHub Releases
      try {
        const releases = await fetchGitHubReleases();
        if (releases && Array.isArray(releases) && releases.length > 0) {
          const items = releases.slice(0, 5).map((rel, idx) => {
            const isLatest = idx === 0;
            return {
              id: rel.tag_name,
              title: rel.name ? `pyEGClamUI ${rel.name}` : `pyEGClamUI ${rel.tag_name} Released`,
              date: formatReleaseDate(rel.published_at),
              badge: isLatest ? 'Latest Release' : '',
              badgeType: isLatest ? 'emerald' : 'sky',
              summary: cleanMarkdownSummary(rel.body) || `pyEGClamUI ${rel.tag_name} is now available on GitHub Releases with updated binaries.`,
              link: `updates.html#${rel.tag_name}`
            };
          });

          // Add legacy deprecation notice card
          items.push({
            id: "legacy-deprecation",
            title: "Legacy Versions Deprecation Notice",
            date: "September 2026",
            badge: "Deprecated",
            badgeType: "amber",
            summary: "All previous legacy projects—including EGClamNetAntivirus and EG-ClamNet-Antivirus-2—are officially deprecated and permanently removed. Please migrate to pyEGClamUI.",
            link: "updates.html"
          });

          renderUpdates(items);
          updatesLoaded = true;
          return;
        }
      } catch (err) {
        console.debug('GitHub releases notification fetch fallback:', err);
      }

      // 2. Offline / Network error fallback to built-in notification updates
      renderUpdates(defaultUpdates);
      updatesLoaded = true;
    }

    function openDropdown() {
      loadNotifications();
      dropdown.removeAttribute('hidden');
      bellBtn.setAttribute('aria-expanded', 'true');
      if (dot) {
        dot.classList.add('is-read');
      }
      try {
        if (latestSeenTag) {
          localStorage.setItem('pyeg_seen_release', latestSeenTag);
        }
      } catch (e) {}
    }

    function closeDropdown() {
      dropdown.setAttribute('hidden', '');
      bellBtn.setAttribute('aria-expanded', 'false');
    }

    bellBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isExpanded = bellBtn.getAttribute('aria-expanded') === 'true';
      if (isExpanded) {
        closeDropdown();
      } else {
        openDropdown();
      }
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeDropdown();
        bellBtn.focus();
      });
    }

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!dropdown.hasAttribute('hidden')) {
        const wrapper = bellBtn.closest('.notification-wrapper');
        if (wrapper && !wrapper.contains(e.target)) {
          closeDropdown();
        }
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !dropdown.hasAttribute('hidden')) {
        closeDropdown();
        bellBtn.focus();
      }
    });
  }

  // 7. Opt-In Visitor Analytics Tracker (Batched Firestore Telemetry)
  function initializeVisitorTracker() {
    if (!document.querySelector('script[src*="visitor-tracker.js"]')) {
      const script = document.createElement('script');
      script.src = 'assets/js/visitor-tracker.js';
      script.setAttribute('data-app', 'av.eg1.in');
      script.async = true;
      document.body.appendChild(script);
    }
  }
  initializeVisitorTracker();

  // Reopen consent banner handler (accessible from footer or settings)
  document.addEventListener('click', (e) => {
    const target = e.target.closest('#btnReopenConsent, .reopen-consent-btn');
    if (target) {
      e.preventDefault();
      if (window.EG1Tracker && typeof window.EG1Tracker.showConsentBanner === 'function') {
        window.EG1Tracker.showConsentBanner();
      }
    }
  });
});

