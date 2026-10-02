/**
 * pyEGClamUI Official Web Portal Scripts
 * Clean, lightweight, dependency-free Vanilla JS
 */

document.addEventListener('DOMContentLoaded', () => {
  // 0. Dynamic site-config.json Loader (fetches and applies config at runtime)
  async function loadDynamicConfig() {
    try {
      const response = await fetch('site-config.json?cache_bust=' + Date.now());
      if (!response.ok) return;
      const config = await response.json();

      // 1. Version: Check GitHub Releases API first, fallback to site-config.json
      let activeVersion = config.project?.version;
      try {
        const ghResponse = await fetch('https://api.github.com/repos/EG1DOTIN/pyEGClamUI/releases/latest', {
          headers: { 'Accept': 'application/vnd.github.v3+json' }
        });
        if (ghResponse.ok) {
          const ghRelease = await ghResponse.json();
          if (ghRelease && ghRelease.tag_name) {
            // Strip leading 'v' if present (e.g. 'v3.0.0' -> '3.0.0')
            activeVersion = ghRelease.tag_name.replace(/^v/, '');
          }
        }
      } catch (ghErr) {
        // Network offline or rate limit: fallback silently to site-config.json
        console.debug('GitHub releases fetch fallback to site-config:', ghErr);
      }

      if (activeVersion) {
        document.querySelectorAll('[data-config="version"]').forEach((el) => {
          el.textContent = activeVersion;
        });
      }

      // 2. Release Stage
      if (config.project && config.project.releaseStage) {
        document.querySelectorAll('[data-config="releaseStage"]').forEach((el) => {
          el.textContent = config.project.releaseStage;
        });
      }

      // 3. GitHub Repo Link
      if (config.github && config.github.repo) {
        document.querySelectorAll('a[data-config="githubRepo"]').forEach((el) => {
          el.href = config.github.repo;
        });
      }

      // 4. GitHub Issues Link
      if (config.github && config.github.issues) {
        document.querySelectorAll('a[data-config="githubIssues"]').forEach((el) => {
          el.href = config.github.issues;
        });
      }

      // 5. GitHub Releases Link
      if (config.github && config.github.releases) {
        document.querySelectorAll('a[data-config="githubReleases"]').forEach((el) => {
          el.href = config.github.releases;
        });
      }

      // 6. Contact URL
      if (config.contact && config.contact.url) {
        document.querySelectorAll('a[data-config="contactUrl"]').forEach((el) => {
          el.href = config.contact.url;
        });
      }

      // 7. Privacy Policy URL
      if (config.contact && config.contact.privacyPolicy) {
        document.querySelectorAll('a[data-config="privacyPolicy"]').forEach((el) => {
          el.href = config.contact.privacyPolicy;
        });
      }

      // 8. Official Site URL
      if (config.contact && config.contact.officialSite) {
        document.querySelectorAll('a[data-config="officialSite"]').forEach((el) => {
          el.href = config.contact.officialSite;
        });
      }

      // 9. Platform Direct Download URLs
      if (config.downloads) {
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

      // 10. Generic HTML Comment Marker Fallbacks
      updateCommentMarkers(document.body, 'version', activeVersion || config.project?.version);
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
      // In local file:// mode without a web server, static HTML provides fallback
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
  const bellBtn = document.getElementById('notificationBellBtn');
  const dropdown = document.getElementById('notificationDropdown');
  const closeBtn = document.getElementById('notificationCloseBtn');
  const listContainer = document.getElementById('notificationList');
  const dot = document.getElementById('notificationDot');

  if (bellBtn && dropdown && listContainer) {
    let updatesLoaded = false;

    // Fallback updates in case of offline/local file:// fetch restrictions
    const defaultUpdates = [
      {
        id: "v3-0-0",
        title: "pyEGClamUI v3.0.0 Released",
        date: "September 30, 2026",
        badge: "Latest Release",
        badgeType: "emerald",
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
      try {
        const res = await fetch('assets/data/updates.json?t=' + Date.now());
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.updates)) {
            renderUpdates(data.updates);
            updatesLoaded = true;
            return;
          }
        }
      } catch (err) {
        console.debug('Falling back to built-in notification updates list:', err);
      }
      renderUpdates(defaultUpdates);
      updatesLoaded = true;
    }

    // Check if the user has already opened and seen the latest notification
    try {
      const lastSeen = localStorage.getItem('pyeg_seen_update');
      if (lastSeen === 'v3-0-0' && dot) {
        dot.classList.add('is-read');
      }
    } catch (e) {
      // localStorage disabled or private browsing
    }

    function openDropdown() {
      loadNotifications();
      dropdown.removeAttribute('hidden');
      bellBtn.setAttribute('aria-expanded', 'true');
      if (dot) {
        dot.classList.add('is-read');
      }
      try {
        localStorage.setItem('pyeg_seen_update', 'v3-0-0');
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
});
