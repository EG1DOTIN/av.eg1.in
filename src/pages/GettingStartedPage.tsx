import React from 'react';
import { Container, Button } from 'eg-web-core';
import './GettingStartedPage.css';

interface GettingStartedPageProps {
  onNavigate?: (path: string) => void;
}

export const GettingStartedPage: React.FC<GettingStartedPageProps> = ({ onNavigate }) => {
  const navigateTo = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.location.href = path;
    }
  };

  return (
    <div className="getting-started-page" style={{ paddingBottom: '72px' }}>
      <Container>
        {/* Header Hero */}
        <section className="gs-header" style={{ textAlign: 'center', padding: '36px 0 32px' }}>
          <div className="section-tag" style={{ margin: '0 auto 12px' }}>Quick Start Guide</div>
          <h1 className="gs-title" style={{ fontSize: 'clamp(2rem, 1.6rem + 1.8vw, 2.8rem)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '12px' }}>
            Getting Started
          </h1>
          <p className="gs-subtitle" style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.95rem, 0.9rem + 0.25vw, 1.1rem)', maxWidth: '720px', margin: '0 auto', lineHeight: 1.6 }}>
            A straightforward guide to launching the interface, updating definitions, running scans, and managing quarantined files.
          </p>
        </section>

        {/* 4-Step Walkthrough */}
        <section style={{ padding: '24px 0 48px' }}>
          <div className="step-list" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '860px', margin: '0 auto' }}>
            {/* Step 1 */}
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-content">
                <h2 className="step-title">Launch the Interface &amp; Verify Engine Detection</h2>
                <p className="step-desc">
                  When you launch the app (by clicking its desktop shortcut or running <code>pyegclamui</code> / <code>egclam</code> from your terminal), it automatically checks for installed <code>clamscan</code>, <code>clamd</code>, and <code>freshclam</code> binaries. If ClamAV is not yet detected, the built-in wizard will guide you through linking or installing the engine.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-content">
                <h2 className="step-title">Update Virus Definitions</h2>
                <p className="step-desc">
                  Keep your virus definitions current for up-to-date detection. On the <strong>Status Tab</strong>, check the <em>Virus Definitions</em> card. If an update is needed, click <strong>"Check for Updates"</strong> to download the latest signatures directly using FreshClam.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-content">
                <h2 className="step-title">Run a Scan</h2>
                <p className="step-desc">
                  Navigate to the <strong>Scan Tab</strong> and choose the appropriate scan profile:
                </p>
                <ul className="step-bullets">
                  <li>
                    <strong>Quick Scan:</strong> Fast inspection of high-priority system areas most prone to infection.
                  </li>
                  <li>
                    <strong>Full System Scan:</strong> Comprehensive scan across all connected drive partitions.
                  </li>
                  <li>
                    <strong>Custom Drag &amp; Drop:</strong> Drag any file or folder directly into the window to inspect it.
                  </li>
                  <li>
                    <strong>Memory Scan (Windows):</strong> Inspects active running processes in system memory.
                  </li>
                </ul>
              </div>
            </div>

            {/* Step 4 */}
            <div className="step-card">
              <div className="step-number">4</div>
              <div className="step-content">
                <h2 className="step-title">Configure Real-Time Folder Guard</h2>
                <p className="step-desc">
                  Open the <strong>Settings Tab</strong> to enable <em>Real-Time Protection</em>. By default, it monitors up to two selected folders (defaults to Downloads and Desktop) to scan new files as they arrive. You can customize either folder path to point to any directory on your system.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Quarantine & Bug Reporting Split Grid */}
        <section style={{ padding: '0 0 48px' }}>
          <div className="split-grid" style={{ maxWidth: '860px', margin: '0 auto' }}>
            {/* Managing Quarantined Files */}
            <div className="guide-box">
              <div className="guide-icon-box">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h3 className="guide-title">Managing Quarantined Files</h3>
              <p className="guide-desc">
                When a suspicious file is detected, it is securely moved into an isolated quarantine vault to prevent accidental execution.
              </p>
              <ul className="guide-bullets">
                <li>
                  &bull; <strong>To Restore:</strong> Select the file in the Quarantine Tab and click <em>"Restore Selected"</em> to safely return it to its original location.
                </li>
                <li>
                  &bull; <strong>To Delete to Trash:</strong> Send the file to your system Recycle Bin / Trash.
                </li>
                <li>
                  &bull; <strong>To Purge Permanently:</strong> Permanently delete the file from your disk.
                </li>
              </ul>
            </div>

            {/* Privacy-Preserving Issue Reporting */}
            <div className="guide-box">
              <div className="guide-icon-box emerald">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 className="guide-title">Privacy-Preserving Issue Reporting</h3>
              <p className="guide-desc">
                If you encounter an issue, the application protects your privacy when asking for help:
              </p>
              <ul className="guide-bullets">
                <li>
                  &bull; <strong>Automatic Path Redaction:</strong> When copying an error report to file a GitHub issue, personal paths and usernames are automatically masked (<code>~</code>) so your private files and identity are never exposed.
                </li>
                <li>
                  &bull; <strong>Inspect Before Sending:</strong> You can always review diagnostic information before copying or sharing.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Need Deeper Technical Documentation CTA */}
        <section className="cta-card" style={{ maxWidth: '860px', margin: '0 auto', textAlign: 'center' }}>
          <h2 className="cta-title">Need Deep Technical Architecture?</h2>
          <p className="cta-desc">
            Explore engine architecture diagrams, Real-Time Guard kernel event watchdog models, daemon socket streaming, and CLI references in our technical documentation.
          </p>
          <div className="cta-actions">
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigateTo('documentation.html')}
            >
              Explore Docs &rarr;
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigateTo('download.html')}
            >
              Download Binaries
            </Button>
          </div>
        </section>
      </Container>
    </div>
  );
};
