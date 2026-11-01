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
  { label: 'Home', href: 'index.html' },
  { label: 'Docs', href: 'documentation.html' },
  { label: 'UI Preview', href: 'ui-preview.html' },
  { label: 'Download', href: 'download.html' },
  { label: 'Getting Started', href: 'getting-started.html' },
  { label: 'About & FAQ', href: 'about.html' },
];

export const App: React.FC = () => {
  // Opt-in anonymous telemetry writer (GDPR compliant, 50-record batched bucket)
  useVisitorTracker({
    appName: 'av.eg1.in',
    firebaseConfig: AV_FIREBASE_CONFIG,
  });

  const [currentPath, setCurrentPath] = useState<string>(() => {
    const raw = window.location.pathname.replace(/^\//, '');
    if (raw === 'how-to-use.html' || raw === 'how-to-use') {
      return 'getting-started.html';
    }
    return raw || 'index.html';
  });

  useEffect(() => {
    const handlePopState = () => {
      const raw = window.location.pathname.replace(/^\//, '');
      if (raw === 'how-to-use.html' || raw === 'how-to-use') {
        setCurrentPath('getting-started.html');
      } else {
        setCurrentPath(raw || 'index.html');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    // Smooth legacy route redirect
    let target = path;
    if (target === 'how-to-use.html' || target === '/how-to-use.html' || target === 'how-to-use' || target === '/how-to-use') {
      target = 'getting-started.html';
    }

    const cleanPath = target.startsWith('/') ? target : `/${target}`;
    window.history.pushState(null, '', cleanPath);
    const normalized = target.replace(/^\//, '');
    setCurrentPath(normalized || 'index.html');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderCurrentPage = () => {
    const p = currentPath.split('?')[0].split('#')[0].toLowerCase();
    switch (p) {
      case 'download.html':
      case 'download':
        return <DownloadPage onNavigate={navigateTo} />;
      case 'documentation.html':
      case 'docs':
      case 'documentation':
        return <DocumentationPage />;
      case 'getting-started.html':
      case 'getting-started':
      case 'how-to-use.html':
      case 'how-to-use':
        return <GettingStartedPage onNavigate={navigateTo} />;
      case 'ui-preview.html':
      case 'ui-preview':
        return <UiPreviewPage />;
      case 'updates.html':
      case 'updates':
        return <UpdatesPage />;
      case 'about.html':
      case 'about':
        return <AboutPage />;
      case 'index.html':
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
              onClick={() => navigateTo('index.html')}
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
        <ConsentBanner privacyPolicyUrl="https://eg1.in/privacypolicy.html" />
      </div>
    </ThemeProvider>
  );
};

export default App;
