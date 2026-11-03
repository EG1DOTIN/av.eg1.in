import React, { useState, useEffect } from 'react';
import {
  ThemeProvider,
  Header,
  ConsentBanner,
  NavLinkItem,
  useVisitorTracker,
} from 'eg-web-core';
import { Logo, Footer } from './components';
import { AV_FIREBASE_CONFIG } from './config/firebase';
import { HomePage } from './pages/HomePage';
import { DownloadPage } from './pages/DownloadPage';
import { DocumentationPage } from './pages/DocumentationPage';
import { GettingStartedPage } from './pages/GettingStartedPage';
import { UiPreviewPage } from './pages/UiPreviewPage';
import { UpdatesPage } from './pages/UpdatesPage';
import { AboutPage } from './pages/AboutPage';

// Exact navigation items matching av.eg1.in/partials/header.html
const CLAMUI_NAV_LINKS: NavLinkItem[] = [
  { label: 'Home', href: 'index' },
  { label: 'Docs', href: 'documentation' },
  { label: 'UI Preview', href: 'ui-preview' },
  { label: 'Download', href: 'download' },
  { label: 'Getting Started', href: 'getting-started' },
  { label: 'About & FAQ', href: 'about' },
];

const cleanRoute = (path: string): string => {
  const raw = path.replace(/^\//, '').split('?')[0].split('#')[0].replace(/\.html$/, '');
  if (raw === 'how-to-use') return 'getting-started';
  if (raw === 'docs') return 'documentation';
  return raw || 'index';
};

export const App: React.FC = () => {
  // Opt-in anonymous telemetry writer (GDPR compliant, 50-record batched bucket)
  useVisitorTracker({
    appName: 'av.eg1.in',
    firebaseConfig: AV_FIREBASE_CONFIG,
  });

  const [currentPath, setCurrentPath] = useState<string>(() => {
    return cleanRoute(window.location.pathname);
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(cleanRoute(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      window.open(path, '_blank', 'noopener,noreferrer');
      return;
    }
    let target = path;
    if (target === 'how-to-use.html' || target === '/how-to-use.html' || target === 'how-to-use' || target === '/how-to-use') {
      target = 'getting-started';
    }

    const clean = cleanRoute(target);
    const query = path.includes('?') ? `?${path.split('?')[1]}` : '';
    const hash = path.includes('#') ? `#${path.split('#')[1]}` : '';
    const targetUrl = clean === 'index' ? '/' : `/${clean}`;
    window.history.pushState(null, '', `${targetUrl}${query}${hash}`);
    setCurrentPath(clean);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderCurrentPage = () => {
    const p = currentPath.split('?')[0].split('#')[0].toLowerCase().replace(/\.html$/, '');
    switch (p) {
      case 'download':
        return <DownloadPage onNavigate={navigateTo} />;
      case 'docs':
      case 'documentation':
        return <DocumentationPage />;
      case 'getting-started':
      case 'how-to-use':
        return <GettingStartedPage onNavigate={navigateTo} />;
      case 'ui-preview':
        return <UiPreviewPage />;
      case 'updates':
        return <UpdatesPage />;
      case 'about':
        return <AboutPage />;
      case 'index':
      case '':
      default:
        return <HomePage onNavigate={navigateTo} />;
    }
  };

  return (
    <ThemeProvider defaultTheme="clamui-dark" allowedThemes={['clamui-dark', 'light']}>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-canvas)', color: 'var(--text-primary)', transition: 'background-color 0.2s ease, color 0.2s ease' }}>
        {/* Universal Sticky Header with pyEGClamUI Preset & Vector Logo */}
        <Header
          preset="clamui"
          brandLogo={
            <Logo
              size={32}
              showText={true}
              onClick={() => navigateTo('index')}
            />
          }
          navLinks={CLAMUI_NAV_LINKS}
          currentPath={currentPath}
          githubUrl="https://github.com/EG1DOTIN/pyEGClamUI"
          showNotificationBell={true}
          notificationFetchUrl="/data/updates.json"
          notificationStorageKey="pyeg_seen_release"
          onNavigate={navigateTo}
        />

        {/* Dynamic Page Container */}
        <main style={{ flex: 1 }}>{renderCurrentPage()}</main>

        {/* 4-Column Universal Footer */}
        <Footer onNavigate={navigateTo} />

        {/* Telemetry Consent Banner with 1-Click Opt-Out */}
        <ConsentBanner privacyPolicyUrl="https://eg1.in/privacypolicy" />
      </div>
    </ThemeProvider>
  );
};

export default App;
