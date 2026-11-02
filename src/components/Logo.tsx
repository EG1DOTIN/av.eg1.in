import React, { useState } from 'react';
import './Logo.css';

export interface LogoProps {
  /** Logo emblem size in pixels (default: 32) */
  size?: number;
  /** Whether to render the brand text label 'pyEGClamUI' (default: true) */
  showText?: boolean;
  /** Optional version badge string (e.g., 'v3.1.0' or 'Beta') */
  versionBadge?: string;
  /** Custom click handler */
  onClick?: (e: React.MouseEvent) => void;
  /** Extra CSS classes */
  className?: string;
  /** Inline style overrides */
  style?: React.CSSProperties;
}

/**
 * pyEGClamUI Brand Shield Logo Component.
 * Exact 1:1 parity with av.eg1.in branding specifications:
 * - Official cyber-security SVG shield emblem with emerald glow (#00dc82)
 * - Brand typography: pyEGClam with emerald-accented 'UI'
 * - High-fidelity Vector SVG fallback in case binary asset cannot load
 * - Fully configurable sizing and optional version pill badge
 *
 * @example
 * ```tsx
 * <Logo size={32} showText versionBadge="v3.1.0" />
 * ```
 */
export const Logo: React.FC<LogoProps> = ({
  size = 32,
  showText = true,
  versionBadge,
  onClick,
  className = '',
  style = {},
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className={`av-brand-link ${className}`}
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      <div className="av-logo-shield" style={{ width: size, height: size }}>
        {!imgError ? (
          <img
            src="/assets/images/egav.svg"
            alt="pyEGClamUI Official Logo"
            className="av-logo-img"
            width={size}
            height={size}
            onError={() => setImgError(true)}
          />
        ) : (
          /* High-fidelity Vector SVG fallback matching egav.svg shield silhouette */
          <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            className="av-logo-img"
          >
            <path
              d="M12 2L3 6V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V6L12 2Z"
              fill="url(#av-shield-grad)"
              stroke="#00dc82"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 12L11 14L15 10"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <defs>
              <linearGradient id="av-shield-grad" x1="12" y1="2" x2="12" y2="23" gradientUnits="userSpaceOnUse">
                <stop stopColor="#10b981" stopOpacity="0.85" />
                <stop offset="1" stopColor="#0284c7" stopOpacity="0.9" />
              </linearGradient>
            </defs>
          </svg>
        )}
      </div>

      {showText && (
        <span className="av-brand-name" style={{ fontSize: `${Math.max(16, Math.round(size * 0.58))}px` }}>
          pyEGClam<span className="av-brand-accent">UI</span>
        </span>
      )}

      {versionBadge && (
        <span className="av-version-badge">
          {versionBadge}
        </span>
      )}
    </div>
  );
};

// Aliases for compatibility
export const EGClamUILogo = Logo;
export const ClamUiLogo = Logo;
