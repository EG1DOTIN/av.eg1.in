import React from 'react';
import { Container } from 'eg-web-core';
import { DesktopSimulator } from '../components';

export const UiPreviewPage: React.FC = () => {
  return (
    <div style={{ padding: '36px 0 72px' }}>
      <Container>
        {/* Header Hero */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div className="section-tag" style={{ margin: '0 auto 12px' }}>Interactive Preview</div>
          <h1
            style={{
              fontSize: 'clamp(2rem, 1.6rem + 1.8vw, 2.8rem)',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              marginBottom: '12px',
            }}
          >
            Desktop Interface Preview
          </h1>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: 'clamp(0.95rem, 0.9rem + 0.25vw, 1.1rem)',
              maxWidth: '720px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            Explore the desktop interface layout directly in your browser. Click through the tabs below to view the status dashboard, scan options, quarantine vault, and settings.
          </p>
        </div>

        {/* Desktop Simulator Container */}
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <DesktopSimulator />
        </div>
      </Container>
    </div>
  );
};
