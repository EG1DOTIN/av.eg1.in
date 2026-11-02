import React from 'react';
import { sanitizeUrl, Container } from 'eg-web-core';
import { Logo } from './Logo';
import './Footer.css';

export interface FooterProps {
  /** Callback for client-side navigation */
  onNavigate?: (href: string) => void;
  /** Extra CSS classes */
  className?: string;
  /** Inline style overrides */
  style?: React.CSSProperties;
}

/**
 * Universal 4-Column Footer Component for av.eg1.in.
 * Achieves 100% exact layout, content, and design parity with `av.eg1.in/partials/footer.html`:
 * - Column 1: Official Logo + Bio
 * - Column 2: Navigation (Home, Docs, Features, UI Preview, Download, Getting Started, Updates)
 * - Column 3: Resources (About & FAQ, Release History, GitHub Repo, Issues, Releases, ClamAV Official)
 * - Column 4: Organization (EG1, Contact, Privacy Policy, Consent Reopen, GPL-3.0 License)
 * - Bottom Bar: Cisco Systems, Inc. ClamAV® trademark disclaimer and copyright
 * - Interactive Consent reopen trigger (#btnReopenConsent)
 *
 * @example
 * ```tsx
 * <Footer onNavigate={(path) => navigateTo(path)} />
 * ```
 */
export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  className = '',
  style = {},
}) => {
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('http://') || href.startsWith('https://')) {
      return;
    }
    if (href === '#' || href.startsWith('#')) {
      return;
    }
    if (onNavigate) {
      e.preventDefault();
      onNavigate(href);
    }
  };

  const handleReopenConsent = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('show_consent_banner'));
      const tracker = (window as unknown as { AnalyticsTracker?: { showConsentBanner: () => void } }).AnalyticsTracker;
      if (tracker?.showConsentBanner) {
        tracker.showConsentBanner();
      }
    }
  };

  return (
    <footer className={`av-site-footer ${className}`} style={style}>
      <Container>
        <div className="av-footer-grid">
          {/* Column 1: Brand Info */}
          <div>
            <div style={{ marginBottom: '0.5rem' }}>
              <Logo
                size={24}
                showText={true}
                onClick={onNavigate ? () => onNavigate('index.html') : undefined}
              />
            </div>
            <p className="av-footer-brand-desc">
              An open-source, cross-platform desktop graphical user interface for the ClamAV antivirus engine.
            </p>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <div className="av-footer-col-title">Navigation</div>
            <ul className="av-footer-links">
              <li>
                <a href="index.html" onClick={(e) => handleLinkClick(e, 'index.html')}>
                  Home
                </a>
              </li>
              <li>
                <a href="documentation.html" onClick={(e) => handleLinkClick(e, 'documentation.html')}>
                  Docs
                </a>
              </li>
              <li>
                <a href="documentation.html#features" onClick={(e) => handleLinkClick(e, 'documentation.html#features')}>
                  Features
                </a>
              </li>
              <li>
                <a href="ui-preview.html" onClick={(e) => handleLinkClick(e, 'ui-preview.html')}>
                  UI Preview
                </a>
              </li>
              <li>
                <a href="download.html" onClick={(e) => handleLinkClick(e, 'download.html')}>
                  Download
                </a>
              </li>
              <li>
                <a href="getting-started.html" onClick={(e) => handleLinkClick(e, 'getting-started.html')}>
                  Getting Started
                </a>
              </li>
              <li>
                <a href="updates.html" onClick={(e) => handleLinkClick(e, 'updates.html')}>
                  Updates
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div>
            <div className="av-footer-col-title">Resources</div>
            <ul className="av-footer-links">
              <li>
                <a href="about.html" onClick={(e) => handleLinkClick(e, 'about.html')}>
                  About &amp; FAQ
                </a>
              </li>
              <li>
                <a href="updates.html" onClick={(e) => handleLinkClick(e, 'updates.html')}>
                  Release History
                </a>
              </li>
              <li>
                <a
                  href={sanitizeUrl('https://github.com/EG1DOTIN/pyEGClamUI')}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-config="githubRepo"
                >
                  Desktop App Repo
                </a>
              </li>
              <li>
                <a
                  href={sanitizeUrl('https://github.com/EG1DOTIN/av.eg1.in')}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-config="websiteRepo"
                >
                  Website Source Repo
                </a>
              </li>
              <li>
                <a
                  href={sanitizeUrl('https://github.com/EG1DOTIN/pyEGClamUI/issues')}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-config="githubIssues"
                >
                  GitHub Issues
                </a>
              </li>
              <li>
                <a
                  href={sanitizeUrl('https://github.com/EG1DOTIN/pyEGClamUI/releases')}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-config="githubReleases"
                >
                  Releases
                </a>
              </li>
              <li>
                <a
                  href={sanitizeUrl('https://www.clamav.net/')}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ClamAV Official
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Organization */}
          <div>
            <div className="av-footer-col-title">Organization</div>
            <ul className="av-footer-links">
              <li>
                <a
                  href={sanitizeUrl('https://eg1.in')}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-config="officialSite"
                >
                  EG1 (eg1.in)
                </a>
              </li>
              <li>
                <a
                  href={sanitizeUrl('https://www.eg1.in/contact')}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-config="contactUrl"
                >
                  Contact EG1
                </a>
              </li>
              <li>
                <a
                  href={sanitizeUrl('https://eg1.in/privacypolicy.html')}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-config="privacyPolicy"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <button
                  type="button"
                  id="btnReopenConsent"
                  onClick={handleReopenConsent}
                >
                  Cookie &amp; Analytics Consent
                </button>
              </li>
              <li>
                <a
                  href={sanitizeUrl('https://www.gnu.org/licenses/gpl-3.0.html')}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GPL-3.0 License
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Disclaimers and Copyright */}
        <div className="av-footer-bottom">
          <p className="av-trademark-notice">
            <strong>Trademark Disclaimer:</strong> ClamAV® is a registered trademark of Cisco Systems, Inc.{' '}
            <span className="av-product-highlight">pyEGClamUI</span> is an independent open-source project and is
            not affiliated with, endorsed by, or sponsored by Cisco Systems, Inc.
          </p>
          <div className="av-footer-copyright">
            &copy; 2026{' '}
            <a href={sanitizeUrl('https://eg1.in')} target="_blank" rel="noopener noreferrer">
              EG1 (eg1.in)
            </a>
            .
          </div>
        </div>
      </Container>
    </footer>
  );
};

// Aliases for compatibility
export const EGClamUIFooter = Footer;
export const ClamUiFooter = Footer;
