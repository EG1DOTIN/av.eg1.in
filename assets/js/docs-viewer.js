/**
 * pyEGClamUI Documentation Portal Controller
 * Dependency-free, accessible, high-performance Markdown & Architecture Viewer.
 */

document.addEventListener('DOMContentLoaded', () => {
  if (!window.DOCS_DATA) {
    console.error('Error: window.DOCS_DATA is not defined.');
    return;
  }

  // DOM Elements
  const navGroupsContainer = document.getElementById('docsNavGroups');
  const markdownContainer = document.getElementById('markdownContent');
  const tocList = document.getElementById('docsTocList');
  const searchInput = document.getElementById('docsSearchInput');
  const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
  const breadcrumbCategory = document.getElementById('breadcrumbCategory');
  const mobileToggleBtn = document.getElementById('docsMobileToggle');
  const mobileCloseBtn = document.getElementById('docsCloseDrawer');
  const sidebarEl = document.getElementById('docsSidebar');
  const backdropEl = document.getElementById('docsBackdrop');
  const copyPageLinkBtn = document.getElementById('copyPageLinkBtn');
  const viewRawBtn = document.getElementById('viewRawBtn');
  const rawModal = document.getElementById('rawModal');
  const rawCloseBtn = document.getElementById('rawCloseBtn');
  const rawModalCloseAction = document.getElementById('rawModalCloseAction');
  const rawCopyBtn = document.getElementById('rawCopyBtn');
  const rawTextarea = document.getElementById('rawTextarea');
  const toastEl = document.getElementById('docsToast');

  let currentDocId = '';
  let headingObserver = null;

  // GitHub Base URL fallback from site-config or default
  const GITHUB_REPO = 'https://github.com/EG1DOTIN/pyEGClamUI';

  // --------------------------------------------------------------------------
  // 1. Toast Notification Helper
  // --------------------------------------------------------------------------
  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('show');
    setTimeout(() => {
      toastEl.classList.remove('show');
    }, 2400);
  }

  // --------------------------------------------------------------------------
  // 2. Slug & Anchor Normalizer
  // --------------------------------------------------------------------------
  function slugify(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // --------------------------------------------------------------------------
  // 3. Configure Marked.js Parser
  // --------------------------------------------------------------------------
  function setupMarkedRenderer() {
    if (typeof marked === 'undefined') {
      console.error('marked.js is not loaded.');
      return;
    }

    const renderer = new marked.Renderer();

    // Custom Heading with Anchor link
    renderer.heading = function (text, level) {
      const cleanTitle = text.replace(/<[^>]*>/g, '').trim();
      const slug = slugify(cleanTitle);
      return `
        <h${level} id="${slug}">
          <span>${text}</span>
          <a href="#${slug}" class="header-anchor" aria-label="Permalink to ${cleanTitle}">#</a>
        </h${level}>
      `;
    };

    // Custom Link Renderer
    renderer.link = function (href, title, text) {
      if (!href) return text;

      // Handle internal anchor link on same page
      if (href.startsWith('#')) {
        return `<a href="${href}" class="docs-internal-anchor">${text}</a>`;
      }

      // Check if link points to another markdown document
      const cleanHref = href.split('#')[0];
      const anchor = href.includes('#') ? href.split('#')[1] : '';

      // Normalize match against our linkMap
      const mappedId = window.DOCS_DATA.linkMap[cleanHref] ||
                       window.DOCS_DATA.linkMap[cleanHref.toLowerCase()] ||
                       window.DOCS_DATA.linkMap[cleanHref.replace(/^\.\//, '')] ||
                       window.DOCS_DATA.linkMap[cleanHref.replace(/^\.\.\//, '')];

      if (mappedId) {
        return `<a href="javascript:void(0)" data-doc-target="${mappedId}" data-doc-anchor="${anchor}" class="docs-cross-link">${text}</a>`;
      }

      // Check if it's a repository source reference (e.g. src/..., setup/...)
      if (href.startsWith('src/') || href.startsWith('../src/') || href.startsWith('setup/') || href.startsWith('../setup/')) {
        const repoPath = href.replace(/^(\.\.\/)+/, '');
        const fullUrl = `${GITHUB_REPO}/blob/main/${repoPath}`;
        return `<a href="${fullUrl}" target="_blank" rel="noopener noreferrer" class="docs-source-link">${text} ↗</a>`;
      }

      // External Links
      const titleAttr = title ? ` title="${title}"` : '';
      return `<a href="${href}" target="_blank" rel="noopener noreferrer"${titleAttr}>${text}</a>`;
    };

    // Custom Image Renderer with Automatic Relative Path Resolution & Fallbacks
    renderer.image = function (href, title, text) {
      if (!href) return '';
      let resolvedSrc = href;

      // Handle relative Markdown asset paths
      if (!/^https?:\/\/|^\/\/|^data:/i.test(href)) {
        const cleanPath = href.replace(/^\.\//, '');

        if (cleanPath.startsWith('pyEGClamUI-Docs/')) {
          resolvedSrc = cleanPath;
        } else if (cleanPath.startsWith('assets/')) {
          resolvedSrc = cleanPath;
        } else if (cleanPath.startsWith('docs/')) {
          resolvedSrc = cleanPath;
        } else {
          resolvedSrc = 'pyEGClamUI-Docs/' + cleanPath;
        }
      }

      const altAttr = text ? ` alt="${text.replace(/"/g, '&quot;')}"` : '';
      const titleAttr = title ? ` title="${title.replace(/"/g, '&quot;')}"` : '';
      const fallbackSrc = href.startsWith('docs/')
        ? 'pyEGClamUI-Docs/' + href
        : (href.startsWith('pyEGClamUI-Docs/docs/') ? href.replace('pyEGClamUI-Docs/', '') : href);

      return `
        <figure class="docs-image-figure">
          <img src="${resolvedSrc}"${altAttr}${titleAttr} class="docs-image" loading="lazy" onerror="if(!this.dataset.triedFallback){this.dataset.triedFallback='1';this.src='${fallbackSrc}';}">
        </figure>
      `;
    };

    // Responsive Table Wrapper
    renderer.table = function (header, body) {
      return `
        <div class="table-responsive-wrapper">
          <table>
            <thead>${header}</thead>
            <tbody>${body}</tbody>
          </table>
        </div>
      `;
    };

    // Custom Code Block Renderer
    renderer.code = function (code, infostring) {
      const lang = (infostring || '').trim().toLowerCase();

      // Mermaid diagram block
      if (lang === 'mermaid') {
        return `
          <div class="mermaid-container">
            <pre class="mermaid">${code}</pre>
          </div>
        `;
      }

      const displayLang = lang || 'CODE';
      const encodedCode = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      return `
        <div class="code-block-wrapper">
          <div class="code-block-header">
            <span class="code-block-lang">${displayLang}</span>
            <button class="code-copy-btn" aria-label="Copy code block">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <span>Copy</span>
            </button>
          </div>
          <pre class="language-${lang}"><code class="language-${lang}">${encodedCode}</code></pre>
        </div>
      `;
    };

    if (typeof marked.use === 'function') {
      marked.use({
        renderer: renderer,
        gfm: true,
        breaks: false,
        pedantic: false,
      });
    } else {
      marked.setOptions({
        renderer: renderer,
        gfm: true,
        breaks: false,
        pedantic: false,
      });
    }
  }

  // --------------------------------------------------------------------------
  // 4. Transform GitHub Alert Callouts
  // --------------------------------------------------------------------------
  const ALERT_ICONS = {
    NOTE: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
    TIP: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6"></path><path d="M10 22h4"></path><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5.76.76 1.23 1.52 1.41 2.5h6.18z"></path></svg>`,
    IMPORTANT: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`,
    WARNING: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
    CAUTION: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`,
  };

  function transformAlertCallouts(container) {
    const blockquotes = container.querySelectorAll('blockquote');
    blockquotes.forEach((bq) => {
      const match = bq.innerHTML.match(/\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\](?:\s*<br\s*\/?>)?([\s\S]*)/i);
      if (match) {
        const type = match[1].toUpperCase();
        const content = match[2];
        const iconSvg = ALERT_ICONS[type] || ALERT_ICONS.NOTE;

        const alertDiv = document.createElement('div');
        alertDiv.className = `docs-alert docs-alert-${type.toLowerCase()}`;
        alertDiv.innerHTML = `
          <div class="docs-alert-icon">${iconSvg}</div>
          <div class="docs-alert-content">
            <div class="docs-alert-title">${type}</div>
            <div class="docs-alert-body">${content}</div>
          </div>
        `;
        bq.replaceWith(alertDiv);
      }
    });
  }

  // --------------------------------------------------------------------------
  // 5. Render Navigation Tree in Left Sidebar
  // --------------------------------------------------------------------------
  function renderNavTree() {
    if (!navGroupsContainer) return;

    let html = '';
    window.DOCS_DATA.groups.forEach((group) => {
      html += `
        <div class="docs-nav-group" data-nav-group="${group.category}">
          <div class="docs-nav-group-title">${group.category}</div>
          <ul class="docs-nav-list">
      `;

      group.docs.forEach((doc) => {
        html += `
          <li class="docs-nav-item">
            <a href="javascript:void(0)" class="docs-nav-link" data-doc-id="${doc.id}">
              <span>${doc.title}</span>
              ${doc.badge ? `<span class="docs-nav-link-badge">${doc.badge}</span>` : ''}
            </a>
          </li>
        `;
      });

      html += `
          </ul>
        </div>
      `;
    });

    navGroupsContainer.innerHTML = html;

    // Attach click events
    navGroupsContainer.querySelectorAll('.docs-nav-link').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('data-doc-id');
        navigateToDoc(targetId);
        closeMobileDrawer();
      });
    });
  }

  // --------------------------------------------------------------------------
  // 6. Build On-Page Table of Contents (TOC) & Scrollspy
  // --------------------------------------------------------------------------
  function buildOnPageTOC() {
    if (!tocList) return;
    tocList.innerHTML = '';

    if (headingObserver) {
      headingObserver.disconnect();
    }

    const headings = markdownContainer.querySelectorAll('h2, h3');
    if (headings.length === 0) {
      tocList.innerHTML = '<li class="docs-toc-item"><span class="docs-toc-link">No sections</span></li>';
      return;
    }

    let tocHtml = '';
    headings.forEach((heading) => {
      const level = heading.tagName.toLowerCase() === 'h2' ? 2 : 3;
      const title = heading.querySelector('span') ? heading.querySelector('span').textContent : heading.textContent;
      const id = heading.id;

      tocHtml += `
        <li class="docs-toc-item level-${level}">
          <a href="#${id}" class="docs-toc-link" data-toc-target="${id}">${title}</a>
        </li>
      `;
    });

    tocList.innerHTML = tocHtml;

    // Setup IntersectionObserver for active scrollspy
    const tocLinks = tocList.querySelectorAll('.docs-toc-link');

    headingObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          tocLinks.forEach((l) => {
            if (l.getAttribute('data-toc-target') === id) {
              l.classList.add('active');
            } else {
              l.classList.remove('active');
            }
          });
        }
      });
    }, {
      rootMargin: '-80px 0px -70% 0px',
      threshold: 0
    });

    headings.forEach((h) => headingObserver.observe(h));
  }

  // --------------------------------------------------------------------------
  // 6.5. Lazy-Load Mermaid.js (On-Demand Diagram Engine)
  // Saves ~3.3MB (800KB compressed) on initial documentation page load.
  // --------------------------------------------------------------------------
  let mermaidLoadingPromise = null;

  function ensureMermaidLoaded() {
    if (typeof mermaid !== 'undefined') {
      return Promise.resolve(window.mermaid);
    }
    if (mermaidLoadingPromise) {
      return mermaidLoadingPromise;
    }
    mermaidLoadingPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'assets/vendor/mermaid.min.js';
      script.async = true;
      script.onload = () => {
        if (typeof mermaid !== 'undefined') {
          try {
            mermaid.initialize({
              startOnLoad: false,
              theme: 'dark',
              themeVariables: {
                darkMode: true,
                background: '#0d0e12',
                primaryColor: '#1b1b24',
                primaryTextColor: '#f4f4f6',
                primaryBorderColor: '#00dc82',
                lineColor: '#38bdf8',
                secondaryColor: '#15151c',
                tertiaryColor: '#101015'
              },
              securityLevel: 'loose'
            });
          } catch (initErr) {
            console.warn('Mermaid initialization warning:', initErr);
          }
          resolve(window.mermaid);
        } else {
          mermaidLoadingPromise = null;
          reject(new Error('Mermaid script loaded but window.mermaid undefined.'));
        }
      };
      script.onerror = (err) => {
        mermaidLoadingPromise = null;
        reject(err);
      };
      document.head.appendChild(script);
    });
    return mermaidLoadingPromise;
  }

  // --------------------------------------------------------------------------
  // 7. Load & Render Selected Document
  // --------------------------------------------------------------------------
  async function loadDocument(docId, targetAnchor = '') {
    const docData = window.DOCS_DATA.documents[docId];
    if (!docData) {
      markdownContainer.innerHTML = `
        <div style="text-align: center; padding: var(--space-12) 0;">
          <h2 style="color: var(--color-crimson);">Document Not Found</h2>
          <p>The requested document <code>${docId}</code> could not be found.</p>
          <a href="javascript:void(0)" onclick="window.DOCS_VIEWER.navigate('${window.DOCS_DATA.defaultDoc}')" class="btn btn-secondary btn-sm" style="margin-top: 1rem;">
            ← Return to Overview
          </a>
        </div>
      `;
      return;
    }

    currentDocId = docId;

    // Update active state in left sidebar
    document.querySelectorAll('.docs-nav-link').forEach((link) => {
      if (link.getAttribute('data-doc-id') === docId) {
        link.classList.add('active');
        link.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      } else {
        link.classList.remove('active');
      }
    });

    // Update Breadcrumbs
    if (breadcrumbCurrent) breadcrumbCurrent.textContent = docData.title;
    if (breadcrumbCategory) breadcrumbCategory.textContent = docData.category;

    // Determine markdown content: try live fetch if on web server, fallback to bundled data
    let rawMarkdown = docData.content;
    if (window.location.protocol.startsWith('http')) {
      try {
        const fetchUrl = `pyEGClamUI-Docs/${docData.filename}?t=${Date.now()}`;
        const resp = await fetch(fetchUrl);
        if (resp.ok) {
          rawMarkdown = await resp.text();
        }
      } catch (err) {
        // Fallback silently to pre-bundled data
      }
    }

    // Parse Markdown to HTML
    const htmlContent = marked.parse(rawMarkdown);
    markdownContainer.innerHTML = htmlContent;

    // Post-Process: Transform GitHub Callout Alerts
    transformAlertCallouts(markdownContainer);

    // Post-Process: Code Syntax Highlighting via Prism
    if (typeof Prism !== 'undefined') {
      Prism.highlightAllUnder(markdownContainer);
    }

    // Post-Process: Lazy-load & Render Mermaid Diagrams on-demand
    // Saves ~3.3MB (800KB compressed) on initial doc page load
    const mermaidNodes = markdownContainer.querySelectorAll('.mermaid');
    if (mermaidNodes.length > 0) {
      ensureMermaidLoaded()
        .then((m) => {
          const currentNodes = markdownContainer.querySelectorAll('.mermaid');
          if (currentNodes.length > 0 && typeof m.run === 'function') {
            m.run({ nodes: currentNodes });
          }
        })
        .catch((mermaidErr) => {
          console.warn('Mermaid rendering notice:', mermaidErr);
        });
    }

    // Attach Copy Handlers to Code Blocks
    markdownContainer.querySelectorAll('.code-copy-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const pre = btn.closest('.code-block-wrapper').querySelector('pre');
        if (!pre) return;
        const codeText = pre.innerText;
        try {
          await navigator.clipboard.writeText(codeText);
          const originalText = btn.innerHTML;
          btn.innerHTML = `
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Copied!</span>
          `;
          btn.classList.add('copied');
          setTimeout(() => {
            btn.innerHTML = originalText;
            btn.classList.remove('copied');
          }, 2000);
        } catch (err) {
          showToast('Failed to copy code to clipboard.');
        }
      });
    });

    // Build Right Sidebar Table of Contents
    buildOnPageTOC();

    // Store raw markdown in modal textarea
    if (rawTextarea) {
      rawTextarea.value = rawMarkdown;
    }

    // Handle scroll: scroll to anchor if given, else scroll to top
    if (targetAnchor) {
      setTimeout(() => {
        const targetEl = document.getElementById(targetAnchor);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // --------------------------------------------------------------------------
  // 8. Navigation & Routing Handler
  // --------------------------------------------------------------------------
  function navigateToDoc(targetDoc, targetAnchor = '') {
    const resolvedId = window.DOCS_DATA.linkMap[targetDoc] ||
                       window.DOCS_DATA.linkMap[targetDoc.toLowerCase()] ||
                       targetDoc;

    if (!window.DOCS_DATA.documents[resolvedId]) {
      console.warn(`Target document '${targetDoc}' could not be resolved.`);
      return;
    }

    const newUrl = new URL(window.location);
    newUrl.searchParams.set('doc', resolvedId);
    if (targetAnchor) {
      newUrl.hash = targetAnchor;
    } else {
      newUrl.hash = '';
    }

    window.history.pushState({ doc: resolvedId, anchor: targetAnchor }, '', newUrl.toString());
    loadDocument(resolvedId, targetAnchor);
  }

  // Handle Internal Cross-Doc Link Clicks inside rendered markdown
  markdownContainer.addEventListener('click', (e) => {
    const crossLink = e.target.closest('[data-doc-target]');
    if (crossLink) {
      e.preventDefault();
      const target = crossLink.getAttribute('data-doc-target');
      const anchor = crossLink.getAttribute('data-doc-anchor') || '';
      navigateToDoc(target, anchor);
    }
  });

  // Handle Browser History (Back / Forward)
  window.addEventListener('popstate', () => {
    resolveCurrentRoute();
  });

  function resolveCurrentRoute() {
    const params = new URLSearchParams(window.location.search);
    let docId = params.get('doc');
    let anchor = window.location.hash.replace(/^#/, '');

    // Check if doc was specified via hash instead (e.g. #architecture)
    if (!docId && anchor && window.DOCS_DATA.linkMap[anchor]) {
      docId = window.DOCS_DATA.linkMap[anchor];
      anchor = '';
    }

    if (!docId || !window.DOCS_DATA.documents[docId]) {
      docId = window.DOCS_DATA.defaultDoc;
    }

    loadDocument(docId, anchor);
  }

  // --------------------------------------------------------------------------
  // 9. Sidebar Live Search & Filter
  // --------------------------------------------------------------------------
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const navGroups = navGroupsContainer.querySelectorAll('.docs-nav-group');

      navGroups.forEach((group) => {
        let hasVisibleDocs = false;
        const items = group.querySelectorAll('.docs-nav-item');

        items.forEach((item) => {
          const text = item.textContent.toLowerCase();
          if (!query || text.includes(query)) {
            item.style.display = '';
            hasVisibleDocs = true;
          } else {
            item.style.display = 'none';
          }
        });

        group.style.display = hasVisibleDocs ? '' : 'none';
      });
    });
  }

  // --------------------------------------------------------------------------
  // 10. Mobile Drawer Controls
  // --------------------------------------------------------------------------
  function openMobileDrawer() {
    if (sidebarEl) sidebarEl.classList.add('drawer-open');
    if (backdropEl) backdropEl.classList.add('drawer-open');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileDrawer() {
    if (sidebarEl) sidebarEl.classList.remove('drawer-open');
    if (backdropEl) backdropEl.classList.remove('drawer-open');
    document.body.style.overflow = '';
  }

  if (mobileToggleBtn) mobileToggleBtn.addEventListener('click', openMobileDrawer);
  if (mobileCloseBtn) mobileCloseBtn.addEventListener('click', closeMobileDrawer);
  if (backdropEl) backdropEl.addEventListener('click', closeMobileDrawer);

  // --------------------------------------------------------------------------
  // 11. Toolbar Action Handlers
  // --------------------------------------------------------------------------
  if (copyPageLinkBtn) {
    copyPageLinkBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(window.location.href);
        showToast('Documentation link copied to clipboard!');
      } catch (err) {
        showToast('Failed to copy link.');
      }
    });
  }

  // Raw Markdown Modal
  if (viewRawBtn && rawModal) {
    viewRawBtn.addEventListener('click', () => {
      rawModal.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  }

  function closeRawModal() {
    if (rawModal) {
      rawModal.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  if (rawCloseBtn) rawCloseBtn.addEventListener('click', closeRawModal);
  if (rawModalCloseAction) rawModalCloseAction.addEventListener('click', closeRawModal);
  if (rawModal) {
    rawModal.addEventListener('click', (e) => {
      if (e.target === rawModal) closeRawModal();
    });
  }

  if (rawCopyBtn && rawTextarea) {
    rawCopyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(rawTextarea.value);
        showToast('Raw markdown copied to clipboard!');
      } catch (err) {
        showToast('Failed to copy raw markdown.');
      }
    });
  }

  // Keyboard escape handler for modals/drawers
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeRawModal();
      closeMobileDrawer();
    }
  });

  // --------------------------------------------------------------------------
  // 12. Global Public Interface & Bootstrap
  // --------------------------------------------------------------------------
  window.DOCS_VIEWER = {
    navigate: navigateToDoc,
    load: loadDocument,
  };

  setupMarkedRenderer();
  renderNavTree();
  resolveCurrentRoute();
});
