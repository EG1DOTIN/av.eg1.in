import React, { useState } from 'react';
import { Container } from 'eg-web-core';
import './AboutPage.css';

export const AboutPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Can I use it alongside Windows Defender or other security tools?',
      a: 'Yes. It operates entirely as a standard user-space desktop application without installing system kernel drivers or intercepting network traffic. It coexists smoothly alongside Windows Defender, macOS Gatekeeper, or third-party antivirus suites as an on-demand, secondary scanner.',
    },
    {
      q: 'Do I need an active internet connection to scan files?',
      a: 'No. All file and memory scanning operations execute completely offline on your local machine using locally stored virus signature databases. An internet connection is only required when checking for and downloading definition updates via FreshClam.',
    },
    {
      q: 'What data or telemetry does the application collect?',
      a: 'Zero data is collected or transmitted by default. Anonymous diagnostic metrics (such as OS platform and ClamAV version) are strictly 100% opt-in. You can preview the exact JSON payload anytime in the Settings tab before choosing whether to share it.',
    },
    {
      q: 'Is it affiliated with Cisco or ClamAV?',
      a: 'No. It is an independent open-source desktop interface and is not affiliated with, endorsed by, or sponsored by Cisco Systems, Inc. ClamAV® is a registered trademark of Cisco Systems, Inc.',
    },
    {
      q: 'Does pyEGClamUI include the ClamAV virus scanner itself?',
      a: 'pyEGClamUI is a desktop graphical user interface and orchestration layer. On Linux and macOS, it connects to your system ClamAV package (installed via apt, dnf, pacman, or brew). On Windows, the installer can automatically provision Cisco ClamAV.',
    },
  ];

  return (
    <div className="about-page">
      <Container>
        <div className="about-container-narrow">
          {/* Header Hero */}
          <section className="about-header">
            <div className="section-tag">Project Overview</div>
            <h1 className="hero-title" style={{ fontSize: 'clamp(2rem, 1.6rem + 1.8vw, 2.8rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>
              About <span style={{ color: '#00dc82' }}>pyEGClam</span><span style={{ color: '#38bdf8' }}>UI</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
              Background details, architecture overview, open-source licensing, and answers to common questions.
            </p>
          </section>

          {/* Project Background & Mission */}
          <section className="about-mission-card">
            <h2 className="about-mission-title">Project Background &amp; Mission</h2>
            <p className="about-mission-text">
              <strong style={{ color: 'var(--text-primary)' }}>pyEGClamUI</strong> provides a native, responsive graphical user interface for ClamAV, for running scans, managing isolated threats, and updating virus definition databases across Windows, Linux, and macOS—without adding commercial bloatware, advertisements, or background tracking.
            </p>
            <p className="about-mission-text">
              The project is independently maintained and published by <a href="https://eg1.in" target="_blank" rel="noopener noreferrer">EG1 (eg1.in)</a> under the <strong>GNU General Public License v3.0 (GPL-3.0)</strong>. Both the desktop application and this website are fully open source.
            </p>

            {/* Source Repositories Grid */}
            <div className="repo-grid">
              <div className="repo-card">
                <div className="repo-card-top">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#00dc82' }}>
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  <span className="repo-card-title">Desktop GUI Application</span>
                </div>
                <p className="repo-card-desc">
                  Python &amp; PySide6 GUI source code, scanner engines, and packaging suites.
                </p>
                <a
                  href="https://github.com/EG1DOTIN/pyEGClamUI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  EG1DOTIN/pyEGClamUI &rarr;
                </a>
              </div>

              <div className="repo-card">
                <div className="repo-card-top">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#38bdf8' }}>
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  <span className="repo-card-title">Web Portal &amp; Documentation</span>
                </div>
                <p className="repo-card-desc">
                  Website source code, interactive browser prototype, and deployment workflows.
                </p>
                <a
                  href="https://github.com/EG1DOTIN/av.eg1.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  EG1DOTIN/av.eg1.in &rarr;
                </a>
              </div>
            </div>
          </section>

          {/* Frequently Asked Questions */}
          <section className="faq-section">
            <div className="faq-header">
              <div className="section-tag">Frequently Asked Questions</div>
              <h2 className="faq-title">Answers to Common Questions</h2>
            </div>

            <div className="faq-list">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div key={index} className={`faq-item ${isOpen ? 'open' : ''}`}>
                    <button
                      type="button"
                      className="faq-question"
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      aria-expanded={isOpen}
                    >
                      <span>{faq.q}</span>
                      <svg
                        className="faq-chevron"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </button>
                    {isOpen && <div className="faq-answer">{faq.a}</div>}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Community & Contact */}
          <section className="community-card">
            <div className="section-tag">Community &amp; Support</div>
            <h2 className="community-title">Report Issues &amp; Feedback</h2>
            <p className="community-desc">
              Have a question, feedback, or a bug to report? Connect with the project via GitHub or the EG1 Contact Page:
            </p>
            <div className="community-actions">
              <a
                href="https://github.com/EG1DOTIN/pyEGClamUI/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span>GitHub Issues</span>
              </a>
              <a
                href="https://www.eg1.in/contact"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                EG1 Contact Form (eg1.in) &rarr;
              </a>
            </div>
          </section>

          {/* Trademark & Legal Notice */}
          <div className="legal-card">
            <strong>Trademark Disclaimer:</strong> ClamAV® is a registered trademark of Cisco Systems, Inc. <span style={{ color: '#00dc82', fontWeight: 600 }}>pyEGClamUI</span> is an independent open-source project and is not affiliated with, endorsed by, or sponsored by Cisco Systems, Inc.
          </div>
        </div>
      </Container>
    </div>
  );
};
