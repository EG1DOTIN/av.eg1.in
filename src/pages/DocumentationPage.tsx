import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { sanitizeHtml, sanitizeUrl } from 'eg-web-core';
import { marked } from 'marked';
import './DocumentationPage.css';

interface DocItem {
  id: string;
  title: string;
  badge?: string;
  order?: number;
  filename?: string;
}

interface DocGroup {
  category: string;
  docs: DocItem[];
}

interface HeadingItem {
  level: number;
  title: string;
  slug: string;
}

interface DocumentDetail {
  id: string;
  title: string;
  category: string;
  badge?: string;
  order?: number;
  filename?: string;
  headings: HeadingItem[];
  content: string;
}

interface DocsData {
  version: string;
  defaultDoc: string;
  groups: DocGroup[];
  linkMap: Record<string, string>;
  documents: Record<string, DocumentDetail>;
}

declare global {
  interface Window {
    mermaid?: any;
  }
}

// SVG Icons
const ICON_NOTE = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const ALERT_SVG_STRINGS: Record<string, string> = {
  NOTE: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
  TIP: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6"></path><path d="M10 22h4"></path><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5.76.76 1.23 1.52 1.41 2.5h6.18z"></path></svg>`,
  IMPORTANT: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`,
  WARNING: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
  CAUTION: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`,
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const DocumentationPage: React.FC = () => {
  const [docsData, setDocsData] = useState<DocsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentDocId, setCurrentDocId] = useState<string>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeHeadingId, setActiveHeadingId] = useState<string>('');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [rawModalOpen, setRawModalOpen] = useState(false);
  const [rawCopied, setRawCopied] = useState(false);

  // Mermaid Fullscreen Modal
  const [mermaidModalOpen, setMermaidModalOpen] = useState(false);
  const [mermaidSvgHtml, setMermaidSvgHtml] = useState<string>('');
  const [diagramTitle, setDiagramTitle] = useState('Interactive Architecture Diagram');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });

  const contentRef = useRef<HTMLDivElement>(null);
  const mermaidPromiseRef = useRef<Promise<any> | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  }, []);

  // 1. Fetch Docs Data & Initial Routing
  useEffect(() => {
    fetch('data/docs-data.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load docs-data.json');
        return res.json();
      })
      .then((data: DocsData) => {
        setDocsData(data);
        setLoading(false);

        // Resolve initial route from URL search params or hash
        const params = new URLSearchParams(window.location.search);
        let initialDoc = params.get('doc');
        const hash = window.location.hash.replace(/^#/, '');

        if (!initialDoc && hash && data.linkMap[hash]) {
          initialDoc = data.linkMap[hash];
        }

        if (initialDoc && data.documents[initialDoc]) {
          setCurrentDocId(initialDoc);
        } else {
          setCurrentDocId(data.defaultDoc || 'overview');
        }

        // If target anchor was given, scroll to it
        if (hash && !data.linkMap[hash]) {
          setTimeout(() => {
            const el = document.getElementById(hash);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 400);
        }
      })
      .catch((err) => {
        console.warn('Documentation catalog load error:', err);
        setLoading(false);
      });
  }, []);

  // Listen for browser Back/Forward (popstate)
  useEffect(() => {
    const handlePopState = () => {
      if (!docsData) return;
      const params = new URLSearchParams(window.location.search);
      let doc = params.get('doc');
      const hash = window.location.hash.replace(/^#/, '');
      if (!doc && hash && docsData.linkMap[hash]) {
        doc = docsData.linkMap[hash];
      }
      if (doc && docsData.documents[doc]) {
        setCurrentDocId(doc);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [docsData]);

  // Navigate to Doc
  const navigateToDoc = useCallback((docId: string, targetAnchor = '') => {
    if (!docsData) return;
    const resolvedId = docsData.linkMap[docId] || docsData.linkMap[docId.toLowerCase()] || docId;
    if (!docsData.documents[resolvedId]) {
      console.warn(`Target document '${docId}' could not be resolved.`);
      return;
    }

    setCurrentDocId(resolvedId);
    setMobileDrawerOpen(false);

    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('doc', resolvedId);
    if (targetAnchor) {
      newUrl.hash = targetAnchor;
    } else {
      newUrl.hash = '';
    }
    window.history.pushState({ doc: resolvedId, anchor: targetAnchor }, '', newUrl.toString());

    if (targetAnchor) {
      setTimeout(() => {
        const el = document.getElementById(targetAnchor);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [docsData]);

  // Current Active Document
  const currentDoc = useMemo(() => {
    if (!docsData) return null;
    return docsData.documents[currentDocId] || docsData.documents[docsData.defaultDoc] || null;
  }, [docsData, currentDocId]);

  // Configure Marked & Render HTML
  const renderedHtml = useMemo(() => {
    if (!currentDoc || !docsData) return '';

    const renderer = new marked.Renderer();

    // Headings with Permalinks
    renderer.heading = function ({ tokens, depth }) {
      const text = this.parser.parseInline(tokens);
      const clean = text.replace(/<[^>]*>/g, '').trim();
      const slug = slugify(clean);
      return `
        <h${depth} id="${slug}">
          <span>${text}</span>
          <a href="#${slug}" class="header-anchor" aria-label="Permalink to ${clean}">#</a>
        </h${depth}>
      `;
    };

    // Custom Link Renderer
    renderer.link = function ({ href, title, tokens }) {
      const text = this.parser.parseInline(tokens);
      if (!href) return text;

      // Internal anchor
      if (href.startsWith('#')) {
        return `<a href="${href}" class="docs-internal-anchor">${text}</a>`;
      }

      // Check if link points to another markdown document
      const cleanHref = href.split('#')[0];
      const anchor = href.includes('#') ? href.split('#')[1] : '';

      const mappedId = docsData.linkMap[cleanHref] ||
        docsData.linkMap[cleanHref.toLowerCase()] ||
        docsData.linkMap[cleanHref.replace(/^\.\//, '')] ||
        docsData.linkMap[cleanHref.replace(/^\.\.\//, '')];

      if (mappedId) {
        return `<a href="javascript:void(0)" data-doc-target="${mappedId}" data-doc-anchor="${anchor}" class="docs-cross-link">${text}</a>`;
      }

      // GitHub repo source reference
      if (href.startsWith('src/') || href.startsWith('../src/') || href.startsWith('setup/') || href.startsWith('../setup/')) {
        const repoPath = href.replace(/^(\.\.\/)+/, '');
        const fullUrl = `https://github.com/EG1DOTIN/pyEGClamUI/blob/main/${repoPath}`;
        return `<a href="${fullUrl}" target="_blank" rel="noopener noreferrer" class="docs-source-link">${text} ↗</a>`;
      }

      // External Links
      const titleAttr = title ? ` title="${title}"` : '';
      return `<a href="${sanitizeUrl(href)}" target="_blank" rel="noopener noreferrer"${titleAttr}>${text}</a>`;
    };

    // Responsive Table
    renderer.table = function ({ header, rows }) {
      let headerHtml = '';
      header.forEach((cell) => {
        headerHtml += `<th>${this.parser.parseInline(cell.tokens)}</th>`;
      });
      let bodyHtml = '';
      rows.forEach((row) => {
        bodyHtml += '<tr>';
        row.forEach((cell) => {
          bodyHtml += `<td>${this.parser.parseInline(cell.tokens)}</td>`;
        });
        bodyHtml += '</tr>';
      });

      return `
        <div class="table-responsive-wrapper">
          <table>
            <thead><tr>${headerHtml}</tr></thead>
            <tbody>${bodyHtml}</tbody>
          </table>
        </div>
      `;
    };

    // Code Blocks & Mermaid
    renderer.code = function ({ text, lang }) {
      const language = (lang || '').trim().toLowerCase();

      if (language === 'mermaid') {
        return `
          <div class="mermaid-wrapper">
            <div class="mermaid-header">
              <span class="mermaid-header-title">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                <span>Architecture &amp; Flow Diagram</span>
              </span>
              <div class="mermaid-header-actions">
                <span class="mermaid-scroll-hint">↔ Scroll or Drag to Explore</span>
                <button class="mermaid-action-btn mermaid-expand-btn" aria-label="Expand Diagram Fullscreen">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <polyline points="9 21 3 21 3 15"></polyline>
                    <line x1="21" y1="3" x2="14" y2="10"></line>
                    <line x1="3" y1="21" x2="10" y2="14"></line>
                  </svg>
                  <span>Fullscreen</span>
                </button>
              </div>
            </div>
            <div class="mermaid-container" title="Click and drag to scroll diagram">
              <pre class="mermaid">${text}</pre>
            </div>
          </div>
        `;
      }

      const displayLang = language || 'CODE';
      const encodedCode = text
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
          <pre class="language-${language}"><code class="language-${language}">${encodedCode}</code></pre>
        </div>
      `;
    };

    let rawHtml = marked.parse(currentDoc.content, { renderer, gfm: true }) as string;

    // Transform GitHub Alert Callouts: [!NOTE], [!TIP], [!IMPORTANT], [!WARNING], [!CAUTION]
    rawHtml = rawHtml.replace(
      /<blockquote>\s*<p>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\](?:\s*<br\s*\/?>)?([\s\S]*?)<\/p>\s*<\/blockquote>/gi,
      (_, type, content) => {
        const t = type.toUpperCase();
        const iconSvg = ALERT_SVG_STRINGS[t] || ALERT_SVG_STRINGS.NOTE;
        return `
          <div class="docs-alert ${t.toLowerCase()}">
            <div class="docs-alert-icon">${iconSvg}</div>
            <div class="docs-alert-content">
              <div class="docs-alert-title">${t}</div>
              <div class="docs-alert-body">${content}</div>
            </div>
          </div>
        `;
      }
    );

    // Sanitize with eg-web-core sanitizer
    return sanitizeHtml(rawHtml);
  }, [currentDoc, docsData]);

  // Mermaid Lazy Loader Helper
  const ensureMermaidLoaded = useCallback(() => {
    if (typeof window.mermaid !== 'undefined') {
      return Promise.resolve(window.mermaid);
    }
    if (mermaidPromiseRef.current) {
      return mermaidPromiseRef.current;
    }
    mermaidPromiseRef.current = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'vendor/mermaid.min.js';
      script.async = true;
      script.onload = () => {
        if (typeof window.mermaid !== 'undefined') {
          try {
            window.mermaid.initialize({
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
                tertiaryColor: '#101015',
              },
              securityLevel: 'loose',
            });
          } catch (initErr) {
            console.warn('Mermaid initialization warning:', initErr);
          }
          resolve(window.mermaid);
        } else {
          mermaidPromiseRef.current = null;
          reject(new Error('Mermaid script loaded but window.mermaid undefined.'));
        }
      };
      script.onerror = (err) => {
        mermaidPromiseRef.current = null;
        reject(err);
      };
      document.head.appendChild(script);
    });
    return mermaidPromiseRef.current;
  }, []);

  // Post-render Effects: Mermaid initialization, Code copy handlers, Link handlers, TOC Scrollspy
  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    // 1. Mermaid on-demand rendering
    const mermaidNodes = container.querySelectorAll<HTMLElement>('.mermaid');
    if (mermaidNodes.length > 0) {
      ensureMermaidLoaded()
        .then((m) => {
          const currentNodes = container.querySelectorAll<HTMLElement>('.mermaid');
          if (currentNodes.length > 0 && typeof m.run === 'function') {
            m.run({ nodes: currentNodes });
          }
        })
        .catch((err) => {
          console.warn('Mermaid rendering notice:', err);
        });
    }

    // 2. Code Block Copy Handlers
    const copyButtons = container.querySelectorAll<HTMLButtonElement>('.code-copy-btn');
    copyButtons.forEach((btn) => {
      const handler = async (e: Event) => {
        e.preventDefault();
        const pre = btn.closest('.code-block-wrapper')?.querySelector('pre');
        if (!pre) return;
        const codeText = pre.innerText;
        try {
          await navigator.clipboard.writeText(codeText);
          const orig = btn.innerHTML;
          btn.innerHTML = `
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Copied!</span>
          `;
          btn.classList.add('copied');
          setTimeout(() => {
            btn.innerHTML = orig;
            btn.classList.remove('copied');
          }, 2000);
        } catch {
          showToast('Failed to copy code to clipboard.');
        }
      };
      btn.addEventListener('click', handler);
    });

    // 3. Delegate Cross-Doc & Internal Anchor Clicks
    const clickHandler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Cross doc link
      const crossLink = target.closest<HTMLAnchorElement>('[data-doc-target]');
      if (crossLink) {
        e.preventDefault();
        const docTarget = crossLink.getAttribute('data-doc-target');
        const anchor = crossLink.getAttribute('data-doc-anchor') || '';
        if (docTarget) navigateToDoc(docTarget, anchor);
        return;
      }

      // Internal anchor
      const internalAnchor = target.closest<HTMLAnchorElement>('.docs-internal-anchor, .header-anchor');
      if (internalAnchor) {
        const href = internalAnchor.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          const slug = href.replace(/^#/, '');
          const el = document.getElementById(slug);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
            window.history.pushState(null, '', href);
          }
        }
        return;
      }

      // Mermaid expand fullscreen button
      const expandBtn = target.closest<HTMLButtonElement>('.mermaid-expand-btn');
      if (expandBtn) {
        e.preventDefault();
        const wrapper = expandBtn.closest('.mermaid-wrapper');
        const svg = wrapper?.querySelector<SVGElement>('.mermaid-container svg');
        if (svg) {
          // Extract natural dimensions from viewBox or bounding box
          let width = 1000;
          let height = 600;
          const vb = (svg as SVGSVGElement).viewBox?.baseVal;
          if (vb && vb.width > 0 && vb.height > 0) {
            width = Math.round(vb.width);
            height = Math.round(vb.height);
          } else {
            const bcr = svg.getBoundingClientRect();
            if (bcr.width > 0 && bcr.height > 0) {
              width = Math.round(bcr.width);
              height = Math.round(bcr.height);
            }
          }

          // Create a cloned SVG with explicit width/height styles to prevent flexbox collapse
          const clonedSvg = svg.cloneNode(true) as SVGElement;
          const existingVb = svg.getAttribute('viewBox');
          clonedSvg.setAttribute('viewBox', existingVb || `0 0 ${width} ${height}`);
          clonedSvg.setAttribute('width', `${width}`);
          clonedSvg.setAttribute('height', `${height}`);
          clonedSvg.style.width = `${width}px`;
          clonedSvg.style.height = `${height}px`;
          clonedSvg.style.minWidth = `${width}px`;
          clonedSvg.style.maxWidth = 'none';
          clonedSvg.style.display = 'block';

          // Extract diagram title from wrapper header if present
          const titleEl = wrapper?.querySelector('.mermaid-header-title span');
          const customTitle = titleEl?.textContent?.trim() || 'Architecture & Flow Diagram';

          setMermaidSvgHtml(sanitizeHtml(clonedSvg.outerHTML));
          setDiagramTitle(customTitle);

          // Calculate initial fit zoom based on viewport
          const viewportW = Math.max(window.innerWidth * 0.85, 800);
          const viewportH = Math.max(window.innerHeight * 0.75, 500);
          const scaleX = viewportW / width;
          const scaleY = viewportH / height;
          const initialFit = Math.min(scaleX, scaleY, 1.2);
          const initialZoom = Number(Math.max(0.3, initialFit).toFixed(2));

          setZoomLevel(initialZoom);
          setPan({ x: 0, y: 0 });
          setMermaidModalOpen(true);
        }
        return;
      }
    };

    container.addEventListener('click', clickHandler);

    // 4. TOC Scrollspy using IntersectionObserver
    const headings = container.querySelectorAll<HTMLHeadingElement>('h2, h3');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveHeadingId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-80px 0px -70% 0px',
        threshold: 0,
      }
    );

    headings.forEach((h) => observer.observe(h));

    return () => {
      container.removeEventListener('click', clickHandler);
      observer.disconnect();
    };
  }, [renderedHtml, ensureMermaidLoaded, navigateToDoc, showToast]);

  // Share Link handler
  const handleShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast('Documentation link copied to clipboard!');
    } catch {
      showToast('Failed to copy link.');
    }
  };

  // Copy raw markdown
  const handleCopyRaw = async () => {
    if (!currentDoc) return;
    try {
      await navigator.clipboard.writeText(currentDoc.content);
      setRawCopied(true);
      showToast('Raw markdown copied to clipboard!');
      setTimeout(() => setRawCopied(false), 2000);
    } catch {
      showToast('Failed to copy raw markdown.');
    }
  };

  // Filtered Sidebar Docs
  const filteredGroups = useMemo(() => {
    if (!docsData) return [];
    if (!searchQuery.trim()) return docsData.groups;

    const q = searchQuery.toLowerCase().trim();
    return docsData.groups
      .map((g) => {
        const matchingDocs = g.docs.filter(
          (d) => d.title.toLowerCase().includes(q) || (d.badge && d.badge.toLowerCase().includes(q))
        );
        return {
          ...g,
          docs: matchingDocs,
        };
      })
      .filter((g) => g.docs.length > 0);
  }, [docsData, searchQuery]);

  // Total docs count
  const totalGuidesCount = useMemo(() => {
    if (!docsData) return 18;
    return Object.keys(docsData.documents).length;
  }, [docsData]);

  // Pan and Zoom Controls for Mermaid Modal (Zoom limit up to 600%)
  const handleZoomIn = () => setZoomLevel((z) => Math.min(Number((z + 0.25).toFixed(2)), 6.0));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(Number((z - 0.25).toFixed(2)), 0.2));
  const handleZoomReset = () => {
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPanning(true);
    panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPan({
      x: e.clientX - panStartRef.current.x,
      y: e.clientY - panStartRef.current.y,
    });
  };

  const handleMouseUp = () => setIsPanning(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoomLevel((z) => Math.min(Number((z + 0.15).toFixed(2)), 6.0));
    } else {
      setZoomLevel((z) => Math.max(Number((z - 0.15).toFixed(2)), 0.2));
    }
  };

  return (
    <div className="docs-page">
      <div className="docs-container">
        {/* Mobile Navigation Bar */}
        <div className="docs-mobile-bar">
          <button
            type="button"
            className="docs-mobile-trigger"
            onClick={() => setMobileDrawerOpen(true)}
            aria-label="Open Documentation Sidebar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
            <span>Browse Documentation</span>
          </button>
          <span className="badge" style={{ fontSize: '0.75rem' }}>
            {totalGuidesCount} Guides
          </span>
        </div>

        {/* Backdrop for Mobile Drawer */}
        <div
          className={`docs-backdrop ${mobileDrawerOpen ? 'drawer-open' : ''}`}
          onClick={() => setMobileDrawerOpen(false)}
        />

        {/* Left Column: Navigation Sidebar */}
        <aside
          className={`docs-sidebar ${mobileDrawerOpen ? 'drawer-open' : ''}`}
          aria-label="Documentation Navigation"
        >
          <div className="docs-drawer-close">
            <button
              type="button"
              className="docs-close-btn"
              onClick={() => setMobileDrawerOpen(false)}
              aria-label="Close sidebar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div className="docs-search-wrapper">
            <svg
              className="docs-search-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              className="docs-search-input"
              placeholder="Search guides &amp; topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Filter documentation"
            />
          </div>

          {/* Navigation Groups */}
          <nav>
            {filteredGroups.map((group) => (
              <div key={group.category} className="docs-nav-group">
                <div className="docs-nav-group-title">{group.category}</div>
                <ul className="docs-nav-list">
                  {group.docs.map((doc) => {
                    const isActive = doc.id === currentDocId;
                    return (
                      <li key={doc.id} className="docs-nav-item">
                        <button
                          type="button"
                          className={`docs-nav-link ${isActive ? 'active' : ''}`}
                          onClick={() => navigateToDoc(doc.id)}
                        >
                          <span>{doc.title}</span>
                          {doc.badge && <span className="docs-nav-link-badge">{doc.badge}</span>}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Center Column: Markdown Viewer */}
        <article className="docs-main-col">
          <div className="docs-card">
            {/* Header Toolbar */}
            <div className="docs-toolbar">
              <div className="docs-breadcrumbs">
                <a href="index.html">Home</a>
                <span className="docs-breadcrumbs-sep">/</span>
                <a href="documentation.html">Docs</a>
                <span className="docs-breadcrumbs-sep">/</span>
                <span>{currentDoc?.category || 'General'}</span>
                <span className="docs-breadcrumbs-sep">/</span>
                <span className="docs-breadcrumbs-current">
                  {currentDoc?.title || (loading ? 'Loading...' : 'Not Found')}
                </span>
              </div>

              <div className="docs-actions">
                <button
                  type="button"
                  className="docs-action-btn"
                  onClick={handleShareLink}
                  title="Copy link to this document"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                  </svg>
                  <span>Share Link</span>
                </button>

                <button
                  type="button"
                  className="docs-action-btn"
                  onClick={() => setRawModalOpen(true)}
                  title="View raw Markdown source"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="16 18 22 12 16 6"></polyline>
                    <polyline points="8 6 2 12 8 18"></polyline>
                  </svg>
                  <span>View Raw</span>
                </button>
              </div>
            </div>

            {/* Rendered Markdown Body */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                <p>Loading documentation content...</p>
              </div>
            ) : currentDoc ? (
              <div
                ref={contentRef}
                className="markdown-body"
                dangerouslySetInnerHTML={{ __html: renderedHtml }}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <h2 style={{ color: '#ef4444', marginBottom: '8px' }}>Document Not Found</h2>
                <p style={{ color: 'var(--text-secondary)' }}>The requested document could not be found.</p>
                <button
                  type="button"
                  onClick={() => navigateToDoc(docsData?.defaultDoc || 'overview')}
                  className="btn btn-secondary btn-sm"
                  style={{ marginTop: '16px' }}
                >
                  ← Return to Overview
                </button>
              </div>
            )}
          </div>
        </article>

        {/* Right Column: Table of Contents ("On This Page") */}
        <aside className="docs-toc-col" aria-label="On this page">
          <div className="docs-toc-title">On This Page</div>
          <ul className="docs-toc-list">
            {currentDoc && currentDoc.headings && currentDoc.headings.length > 0 ? (
              currentDoc.headings.map((h) => {
                const isActive = activeHeadingId === h.slug;
                return (
                  <li key={h.slug} className={`docs-toc-item level-${h.level}`}>
                    <a
                      href={`#${h.slug}`}
                      className={`docs-toc-link ${isActive ? 'active' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        const el = document.getElementById(h.slug);
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth' });
                          window.history.pushState(null, '', `#${h.slug}`);
                          setActiveHeadingId(h.slug);
                        }
                      }}
                    >
                      {h.title}
                    </a>
                  </li>
                );
              })
            ) : (
              <li className="docs-toc-item">
                <span className="docs-toc-link">No sections</span>
              </li>
            )}
          </ul>
        </aside>
      </div>

      {/* Raw Markdown Source Modal */}
      {rawModalOpen && (
        <div className="docs-modal-overlay" onClick={() => setRawModalOpen(false)}>
          <div className="docs-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="docs-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <span>Raw Markdown Source ({currentDoc?.filename || currentDoc?.id})</span>
              </div>
              <button
                type="button"
                className="docs-close-btn"
                onClick={() => setRawModalOpen(false)}
                aria-label="Close raw modal"
              >
                ✕
              </button>
            </div>
            <div className="docs-modal-body" style={{ padding: '16px' }}>
              <textarea
                style={{
                  width: '100%',
                  height: '420px',
                  backgroundColor: '#090d16',
                  color: '#e2e8f0',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '12px',
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  lineHeight: 1.5,
                  resize: 'none',
                }}
                readOnly
                value={currentDoc?.content || ''}
              />
            </div>
            <div className="docs-modal-footer">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setRawModalOpen(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleCopyRaw}
              >
                {rawCopied ? 'Copied!' : 'Copy Markdown'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Mermaid Diagram Zoom Modal */}
      {mermaidModalOpen && (
        <div
          className="docs-modal-overlay"
          onClick={() => setMermaidModalOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setMermaidModalOpen(false);
          }}
          tabIndex={0}
        >
          <div
            className="docs-modal-box"
            style={{ maxWidth: '95vw', height: '90vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="docs-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                <span>{diagramTitle}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    padding: '2px 8px',
                    background: 'var(--bg-subtle)',
                    borderRadius: '4px',
                  }}
                >
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleZoomIn}
                  title="Zoom In"
                >
                  +
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleZoomOut}
                  title="Zoom Out"
                >
                  -
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleZoomReset}
                  title="Reset Zoom"
                >
                  Reset
                </button>
                <button
                  type="button"
                  className="docs-close-btn"
                  onClick={() => setMermaidModalOpen(false)}
                  aria-label="Close diagram modal"
                >
                  ✕
                </button>
              </div>
            </div>
            <div
              className="docs-modal-body"
              style={{
                position: 'relative',
                overflow: 'hidden',
                cursor: isPanning ? 'grabbing' : 'grab',
                backgroundColor: '#0a0e17',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onWheel={handleWheel}
            >
              <div
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel})`,
                  transformOrigin: 'center center',
                  transition: isPanning ? 'none' : 'transform 0.1s ease-out',
                }}
                dangerouslySetInnerHTML={{ __html: mermaidSvgHtml }}
              />
            </div>
            <div className="docs-modal-footer">
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginRight: 'auto' }}>
                Tip: Click and drag to pan • Mouse wheel to zoom • Press Esc to close
              </span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setMermaidModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="docs-toast" role="status" aria-live="polite">
          {toastMessage}
        </div>
      )}
    </div>
  );
};
