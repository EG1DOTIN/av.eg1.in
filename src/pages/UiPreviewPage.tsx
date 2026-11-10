import React from 'react';
import { Container } from 'eg-web-core';
import { DesktopSimulator } from '../components';
import './UiPreviewPage.css';

/**
 * Desktop interface simulator preview page showcasing the Qt frontend inside the browser.
 *
 * @returns UiPreviewPage view component
 *
 * @example
 * ```tsx
 * <Route path="/ui-preview" element={<UiPreviewPage />} />
 * ```
 */
export const UiPreviewPage: React.FC = () => {
  return (
    <div className="av-ui-preview-page">
      <Container>
        {/* Header Hero */}
        <div className="av-ui-preview-header">
          <div className="section-tag av-ui-preview-tag">Interactive Preview</div>
          <h1 className="av-ui-preview-title">
            Desktop Interface Preview
          </h1>
          <p className="av-ui-preview-subtitle">
            Explore the desktop interface layout directly in your browser. Click through the tabs below to view the status dashboard, scan options, quarantine vault, and settings.
          </p>
        </div>

        {/* Desktop Simulator Container */}
        <div className="av-ui-preview-simulator-wrapper">
          <DesktopSimulator />
        </div>
      </Container>
    </div>
  );
};
