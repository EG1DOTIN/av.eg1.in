import React, { useState, useEffect } from 'react';
import { useGitHubRelease } from '../hooks';
import './DesktopSimulator.css';

export type AntivirusStatus = 'protected' | 'warning' | 'danger';
export type ActiveTab = 'Status' | 'Scan' | 'Quarantine' | 'Settings' | 'About';

interface QuarantineItem {
  id: string;
  date: string;
  threat: string;
  path: string;
  sha256: string;
}

const INITIAL_QUARANTINE_ITEMS: QuarantineItem[] = [
  {
    id: 'q1',
    date: '2026-09-24 14:10',
    threat: 'Win.Test.EICAR_HDB-1',
    path: 'Downloads/eicar.com',
    sha256: '44d88612fea8a8f36de82e1278abb02f3d98d8cb...',
  },
  {
    id: 'q2',
    date: '2026-09-23 18:42',
    threat: 'Trojan.Agent.Suspicious',
    path: 'Desktop/unknown_setup.exe',
    sha256: '8f434346648f6b96df89dda901c5176b10a6d839...',
  },
];

const SCAN_PATHS = [
  'System/ApplicationData/runtime_cache.bin',
  'usr/lib/clamav/signatures.cvd',
  'System/Library/CoreServices/SystemVersion.plist',
  'AppData/Local/Temp/sess_update_stream.tmp',
  'Windows/System32/drivers/etc/hosts',
  'home/user/.local/share/mime/packages',
  'ProgramFiles/CommonFiles/Services/socket_broker.dll',
  'usr/bin/python3.11',
  'var/log/clamav/freshclam.log',
  'Library/Preferences/com.apple.security.plist',
];

export interface DesktopSimulatorProps {
  initialTab?: ActiveTab;
  initialStatus?: AntivirusStatus;
  version?: string;
}

export const DesktopSimulator: React.FC<DesktopSimulatorProps> = ({
  initialTab = 'Status',
  initialStatus = 'protected',
  version: propVersion,
}) => {
  const { version: hookVersion } = useGitHubRelease();
  const displayVersion = propVersion || hookVersion || '3.2.0';
  const [activeTab, setActiveTab] = useState<ActiveTab>(initialTab);
  const [status, setStatus] = useState<AntivirusStatus>(initialStatus);

  // Scan modal state
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [scanType, setScanType] = useState('Quick Scan');
  const [scannedFilesCount, setScannedFilesCount] = useState(1482);
  const [scanElapsedSecs, setScanElapsedSecs] = useState(12);
  const [currentPathIndex, setCurrentPathIndex] = useState(0);

  // Quarantine state
  const [quarantineItems, setQuarantineItems] = useState<QuarantineItem[]>(INITIAL_QUARANTINE_ITEMS);
  const [selectedQuarantineId, setSelectedQuarantineId] = useState<string | null>('q1');

  // Settings state
  const [folderGuardEnabled, setFolderGuardEnabled] = useState(true);
  const [telemetryEnabled, setTelemetryEnabled] = useState(false);
  const [showPayloadModal, setShowPayloadModal] = useState(false);

  // Global Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsScanModalOpen(false);
        setShowPayloadModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Live Scan Ticker Timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isScanModalOpen) {
      interval = setInterval(() => {
        setScannedFilesCount((prev) => prev + Math.floor(Math.random() * 25) + 5);
        setScanElapsedSecs((prev) => prev + 1);
        setCurrentPathIndex((prev) => (prev + 1) % SCAN_PATHS.length);
      }, 400);
    }
    return () => clearInterval(interval);
  }, [isScanModalOpen]);

  const handleOpenScan = (type: string) => {
    setScanType(type);
    setScannedFilesCount(1482);
    setScanElapsedSecs(0);
    setIsScanModalOpen(true);
  };

  const handleCloseScan = () => {
    setIsScanModalOpen(false);
  };

  const handleRestoreQuarantine = () => {
    if (!selectedQuarantineId) return;
    setQuarantineItems((prev) => prev.filter((item) => item.id !== selectedQuarantineId));
    setSelectedQuarantineId(null);
  };

  const handleDeleteQuarantine = () => {
    if (!selectedQuarantineId) return;
    setQuarantineItems((prev) => prev.filter((item) => item.id !== selectedQuarantineId));
    setSelectedQuarantineId(null);
  };

  const getSubheaderForScan = (type: string) => {
    if (type === 'Quick Scan') return 'Target: High-Priority System Areas';
    if (type === 'Full System Scan') return 'Target: Entire System & Storage Media';
    if (type === 'Memory Scan') return 'Target: Active System Memory & Running Processes';
    return 'Target: User-Selected Locations';
  };

  return (
    <div className="desktop-window-wrapper">
      {/* Top Prototype Controls Toolbar */}
      <div className="preview-toolbar">
        <div className="title-badge">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
          </svg>
          <span>Interactive Prototype Controls</span>
        </div>

        <div className="controls">
          <span style={{ color: 'var(--app-text-secondary)', fontSize: '12px', marginRight: '4px' }}>
            Simulate Status:
          </span>
          <button
            type="button"
            className={`toolbar-btn ${status === 'protected' ? 'active' : ''}`}
            onClick={() => setStatus('protected')}
            id="btn-state-protected"
          >
            🟢 Protected
          </button>
          <button
            type="button"
            className={`toolbar-btn ${status === 'warning' ? 'active' : ''}`}
            onClick={() => setStatus('warning')}
            id="btn-state-warning"
          >
            🟡 At Risk
          </button>
          <button
            type="button"
            className={`toolbar-btn ${status === 'danger' ? 'active' : ''}`}
            onClick={() => setStatus('danger')}
            id="btn-state-danger"
          >
            🔴 Engine Offline
          </button>
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => handleOpenScan('Quick Scan')}
            id="btn-preview-scan-modal"
          >
            ⚡ Preview Scan Dialog
          </button>
        </div>
      </div>

      {/* Main Desktop Window Frame */}
      <div className="desktop-window" id="mainWindow">
        {/* Native Windows Titlebar */}
        <div className="window-titlebar">
          <div className="window-title">
            <img src="assets/images/egav.svg" alt="pyEGClamUI Logo" width="18" height="18" />
            <span id="desktopWindowTitle">pyEGClamUI - {activeTab}</span>
          </div>

          <div className="window-controls">
            <button type="button" className="win-btn" title="Minimize" aria-label="Minimize">
              <svg width="10" height="10" viewBox="0 0 10 1">
                <rect width="10" height="1" fill="currentColor" />
              </svg>
            </button>
            <button type="button" className="win-btn" title="Maximize" aria-label="Maximize">
              <svg width="10" height="10" viewBox="0 0 10 10">
                <path d="M0,0v10h10V0H0z M9,9H1V1h8V9z" fill="currentColor" />
              </svg>
            </button>
            <button type="button" className="win-btn close" title="Close" aria-label="Close">
              <svg width="10" height="10" viewBox="0 0 10 10">
                <path d="M1,0L0,1l4,4L0,9l1,1l4-4l4,4l1-1L6,5l4-4L9,0L5,4L1,0z" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>

        {/* Window Body with QTabWidget */}
        <div className="window-body">
          {/* Tab Bar Header */}
          <nav className="tab-header" role="tablist">
            <button
              type="button"
              className={`tab-btn ${activeTab === 'Status' ? 'active' : ''}`}
              role="tab"
              aria-selected={activeTab === 'Status'}
              onClick={() => setActiveTab('Status')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
              </svg>
              Status
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'Scan' ? 'active' : ''}`}
              role="tab"
              aria-selected={activeTab === 'Scan'}
              onClick={() => setActiveTab('Scan')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 2v2h1v14a4 4 0 0 0 4 4 4 4 0 0 0 4-4V4h1V2H7zm4 13.5V5h2v10.5a2 2 0 1 1-2 0z" />
              </svg>
              Scan
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'Quarantine' ? 'active' : ''}`}
              role="tab"
              aria-selected={activeTab === 'Quarantine'}
              onClick={() => setActiveTab('Quarantine')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12z" />
              </svg>
              Quarantine
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'Settings' ? 'active' : ''}`}
              role="tab"
              aria-selected={activeTab === 'Settings'}
              onClick={() => setActiveTab('Settings')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
              </svg>
              Settings
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'About' ? 'active' : ''}`}
              role="tab"
              aria-selected={activeTab === 'About'}
              onClick={() => setActiveTab('About')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
              </svg>
              About
            </button>
          </nav>

          {/* TAB PANE 0: STATUS */}
          <section className={`tab-pane ${activeTab === 'Status' ? 'active' : ''}`} role="tabpanel">
            <div className="tab-status-content">
              {/* 3-Tier Status Banner */}
              <div className={`banner-card ${status}`} id="statusBanner">
                <div className="banner-left">
                  <svg className="banner-icon" viewBox="0 0 64 64" fill="none">
                    {status === 'protected' && (
                      <>
                        <path
                          d="M32 6 L52 14 V34 C52 48 32 58 32 58 C32 58 12 48 12 34 V14 Z"
                          fill="rgba(34, 197, 94, 0.12)"
                          stroke="#22c55e"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M22 32 L29 39 L43 25"
                          stroke="#22c55e"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </>
                    )}
                    {status === 'warning' && (
                      <>
                        <path
                          d="M32 6 L52 14 V34 C52 48 32 58 32 58 C32 58 12 48 12 34 V14 Z"
                          fill="rgba(234, 179, 8, 0.12)"
                          stroke="#eab308"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M32 20 V34 M32 42 V44"
                          stroke="#eab308"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </>
                    )}
                    {status === 'danger' && (
                      <>
                        <path
                          d="M32 6 L52 14 V34 C52 48 32 58 32 58 C32 58 12 48 12 34 V14 Z"
                          fill="rgba(239, 68, 68, 0.12)"
                          stroke="#ef4444"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M24 24 L40 40 M40 24 L24 40"
                          stroke="#ef4444"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </>
                    )}
                  </svg>
                  <div>
                    <div className="banner-title">
                      {status === 'protected' && 'System Protected'}
                      {status === 'warning' && 'System at Risk'}
                      {status === 'danger' && 'Engine Not Detected'}
                    </div>
                    <div className="banner-sub">
                      {status === 'protected' && 'Real-time protection is active. Virus signatures are up-to-date.'}
                      {status === 'warning' && 'Real-Time Guard is disabled. Files are not automatically monitored.'}
                      {status === 'danger' && 'ClamAV was not found in PATH or configured folders. Please configure engine.'}
                    </div>
                  </div>
                </div>

                {status === 'protected' && (
                  <button type="button" className="app-btn app-btn-primary">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                    </svg>
                    Check for Updates
                  </button>
                )}
                {status === 'warning' && (
                  <button type="button" className="app-btn app-btn-primary" onClick={() => setStatus('protected')}>
                    Enable Real-Time Guard
                  </button>
                )}
                {status === 'danger' && (
                  <button type="button" className="app-btn app-btn-danger" onClick={() => setActiveTab('Settings')}>
                    Configure Engine...
                  </button>
                )}
              </div>

              {/* Engine & Signature Details Group Box */}
              <div className="group-box">
                <span className="group-box-title">ClamAV Engine &amp; Signature Details</span>
                <div className="engine-info-list">
                  <div className="engine-info-item">
                    <span className="label">Engine Version:</span>
                    <span className="val">ClamAV 1.4.1 (x64)</span>
                    {status === 'danger' ? (
                      <span className="engine-badge" style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)', backgroundColor: 'rgba(239, 68, 68, 0.15)' }}>
                        ✕ Offline
                      </span>
                    ) : (
                      <span className="engine-badge">● Online</span>
                    )}
                  </div>
                  <div className="engine-info-item">
                    <span className="label">Signature Database:</span>
                    <span className="val">Up-to-date (Daily: 28,130, Main: 62, Bytecode: 335)</span>
                    <span className="engine-badge">● Fresh</span>
                  </div>
                  <div className="engine-info-item">
                    <span className="label">Clamd Daemon Socket:</span>
                    <span className="val">Connected (Local Socket Daemon - Active)</span>
                    <span className="engine-badge">⚡ Accelerated</span>
                  </div>
                  <div className="engine-info-item">
                    <span className="label">Smart 2-Folder Guard:</span>
                    <span className="val">Active (Downloads &amp; Desktop surveillance)</span>
                    <span className="engine-badge">🛡️ Debounced (1.5s)</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* TAB PANE 1: SCAN */}
          <section className={`tab-pane ${activeTab === 'Scan' ? 'active' : ''}`} role="tabpanel">
            <div className="tab-scan-content">
              <div className="scan-header">
                <h2>Select Scan Method</h2>
                <p>Choose the inspection depth that matches your needs. All scans run asynchronously without freezing the app.</p>
              </div>

              <div className="scan-cards-grid">
                {/* Quick Scan */}
                <div className="scan-card">
                  <svg className="scan-card-icon" viewBox="0 0 64 64" fill="none">
                    <path d="M33 7 L17 33 H31 L26 56 L49 28 H35 Z" fill="#38bdf8" />
                  </svg>
                  <div className="scan-card-title">Quick Scan</div>
                  <div className="scan-card-desc">
                    Fast, lightweight check of high-priority system areas in under a minute.
                  </div>
                  <button type="button" className="app-btn app-btn-primary" onClick={() => handleOpenScan('Quick Scan')}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                    Run Quick Scan
                  </button>
                </div>

                {/* Full System Scan */}
                <div className="scan-card">
                  <svg className="scan-card-icon" viewBox="0 0 64 64" fill="none" stroke="#38bdf8" strokeWidth="2.5">
                    <rect x="13" y="11" width="38" height="11" rx="3" />
                    <circle cx="45" cy="16.5" r="1.5" fill="#38bdf8" />
                    <rect x="13" y="26" width="38" height="11" rx="3" />
                    <circle cx="45" cy="31.5" r="1.5" fill="#38bdf8" />
                    <rect x="13" y="41" width="38" height="11" rx="3" />
                    <circle cx="45" cy="46.5" r="1.5" fill="#38bdf8" />
                  </svg>
                  <div className="scan-card-title">Full System Scan</div>
                  <div className="scan-card-desc">
                    Comprehensive deep scan across your entire computer for total protection.
                  </div>
                  <button type="button" className="app-btn app-btn-primary" onClick={() => handleOpenScan('Full System Scan')}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <ellipse cx="12" cy="5" rx="9" ry="3" />
                      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                    </svg>
                    Run Full Scan
                  </button>
                </div>

                {/* Custom Scan */}
                <div className="scan-card">
                  <svg className="scan-card-icon" viewBox="0 0 64 64" fill="none" stroke="#38bdf8" strokeWidth="2.5">
                    <path d="M12 20 H26 L31 25 H51 V46 H12 Z" strokeLinejoin="round" />
                    <circle cx="38" cy="35" r="9" />
                    <line x1="45" y1="42" x2="53" y2="50" strokeLinecap="round" />
                  </svg>
                  <div className="scan-card-title">Custom Scan</div>
                  <div className="scan-card-desc">
                    Target specific files, folders, or external drives of your choice.
                  </div>
                  <button type="button" className="app-btn app-btn-primary" onClick={() => handleOpenScan('Custom Scan')}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="3" />
                    </svg>
                    Select &amp; Scan
                  </button>
                </div>

                {/* Memory Scan */}
                <div className="scan-card">
                  <svg className="scan-card-icon" viewBox="0 0 64 64" fill="none" stroke="#38bdf8" strokeWidth="2.5">
                    <rect x="18" y="18" width="28" height="28" rx="4" />
                    <circle cx="32" cy="32" r="3" fill="#38bdf8" />
                    <line x1="24" y1="18" x2="24" y2="10" />
                    <line x1="32" y1="18" x2="32" y2="10" />
                    <line x1="40" y1="18" x2="40" y2="10" />
                    <line x1="24" y1="46" x2="24" y2="54" />
                    <line x1="32" y1="46" x2="32" y2="54" />
                    <line x1="40" y1="46" x2="40" y2="54" />
                    <line x1="18" y1="24" x2="10" y2="24" />
                    <line x1="18" y1="32" x2="10" y2="32" />
                    <line x1="18" y1="40" x2="10" y2="40" />
                    <line x1="46" y1="24" x2="54" y2="24" />
                    <line x1="46" y1="32" x2="54" y2="32" />
                    <line x1="46" y1="40" x2="54" y2="40" />
                  </svg>
                  <div className="scan-card-title">Memory Scan</div>
                  <div className="scan-card-desc">
                    Detects hidden, active threats currently running in system memory.
                  </div>
                  <button type="button" className="app-btn app-btn-primary" onClick={() => handleOpenScan('Memory Scan')}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="4" y="4" width="16" height="16" rx="2" />
                      <rect x="9" y="9" width="6" height="6" />
                      <line x1="9" y1="1" x2="9" y2="4" />
                      <line x1="15" y1="1" x2="15" y2="4" />
                      <line x1="9" y1="20" x2="9" y2="23" />
                      <line x1="15" y1="20" x2="15" y2="23" />
                    </svg>
                    Scan Memory
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* TAB PANE 2: QUARANTINE */}
          <section className={`tab-pane ${activeTab === 'Quarantine' ? 'active' : ''}`} role="tabpanel">
            <div className="tab-quarantine-content">
              <div className="quarantine-header">
                <h2>Isolated Threats Vault</h2>
                <span className="badge-count">{quarantineItems.length} Items in Vault</span>
              </div>

              <div className="table-container">
                <table className="q-table">
                  <thead>
                    <tr>
                      <th>Date Quarantined</th>
                      <th>Threat Classification</th>
                      <th>Original Path</th>
                      <th>SHA-256 Fingerprint</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quarantineItems.map((item) => (
                      <tr
                        key={item.id}
                        className={selectedQuarantineId === item.id ? 'selected' : ''}
                        onClick={() => setSelectedQuarantineId(item.id)}
                      >
                        <td>{item.date}</td>
                        <td className="threat-tag">{item.threat}</td>
                        <td>{item.path}</td>
                        <td>
                          <code>{item.sha256}</code>
                        </td>
                      </tr>
                    ))}
                    {quarantineItems.length === 0 && (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                          ✓ Quarantine vault is clean. No active isolated threats.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="quarantine-actions">
                <div style={{ fontSize: '12px', color: 'var(--app-text-secondary)' }}>
                  Detected threats are moved to an isolated vault to prevent accidental execution.
                </div>
                <div className="action-right">
                  <button
                    type="button"
                    className="app-btn app-btn-success"
                    onClick={handleRestoreQuarantine}
                    disabled={!selectedQuarantineId}
                    style={{ opacity: selectedQuarantineId ? 1 : 0.5 }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="1 4 1 10 7 10" />
                      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                    </svg>
                    Restore File
                  </button>
                  <button
                    type="button"
                    className="app-btn app-btn-danger"
                    onClick={handleDeleteQuarantine}
                    disabled={!selectedQuarantineId}
                    style={{ opacity: selectedQuarantineId ? 1 : 0.5 }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    Delete Permanently
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* TAB PANE 3: SETTINGS */}
          <section className={`tab-pane ${activeTab === 'Settings' ? 'active' : ''}`} role="tabpanel">
            <div className="tab-settings-container">
              <div className="settings-scroll-area">
                <div className="settings-grid">
                  {/* Col 1: Real-Time Folder Guard */}
                  <div className="group-box">
                    <span className="group-box-title">Real-Time Folder Guard</span>
                    <label className="form-check" style={{ marginTop: '6px', fontWeight: 600 }}>
                      <input
                        type="checkbox"
                        checked={folderGuardEnabled}
                        onChange={(e) => setFolderGuardEnabled(e.target.checked)}
                      />
                      <span>Enable Folder Guard</span>
                    </label>
                    <p style={{ fontSize: '11.5px', color: 'var(--app-text-secondary)', marginBottom: '12px' }}>
                      Monitors up to two selected folders for new or modified files. Defaults to Downloads and Desktop (customizable).
                    </p>

                    <div style={{ marginBottom: '8px' }}>
                      <div style={{ fontSize: '12px', color: 'var(--app-text-secondary)', marginBottom: '4px' }}>
                        Guarded Folder 1 (Default: Downloads):
                      </div>
                      <input type="text" className="input-text" value="Downloads (Default Guard)" readOnly />
                    </div>

                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--app-text-secondary)', marginBottom: '4px' }}>
                        Guarded Folder 2 (Default: Desktop):
                      </div>
                      <input type="text" className="input-text" value="Desktop (Default Guard)" readOnly />
                    </div>
                  </div>

                  {/* Col 2: Privacy & Telemetry */}
                  <div className="group-box">
                    <span className="group-box-title">Privacy &amp; Diagnostics (100% Opt-In)</span>
                    <label className="form-check" style={{ marginTop: '6px', fontWeight: 600 }}>
                      <input
                        type="checkbox"
                        checked={telemetryEnabled}
                        onChange={(e) => setTelemetryEnabled(e.target.checked)}
                      />
                      <span>Send Anonymous Diagnostics (Disabled by default)</span>
                    </label>
                    <p style={{ fontSize: '11.5px', color: 'var(--app-text-secondary)', marginBottom: '10px' }}>
                      Strictly offline-first. When reporting GitHub issues, the application automatically strips and masks personal user directories (e.g. personal username folders are masked as <code>~</code>).
                    </p>

                    <div className="sub-options-box" style={{ opacity: telemetryEnabled ? 1 : 0.5 }}>
                      <label className="form-check">
                        <input type="checkbox" disabled={!telemetryEnabled} defaultChecked />
                        <span>ClamAV Engine Version &amp; Platform OS</span>
                      </label>
                      <label className="form-check">
                        <input type="checkbox" disabled={!telemetryEnabled} defaultChecked />
                        <span>General Scan Counts &amp; Threat Totals</span>
                      </label>
                      <label className="form-check">
                        <input type="checkbox" disabled={!telemetryEnabled} />
                        <span>Crash Traceback Logs (Path-Redacted)</span>
                      </label>
                    </div>

                    <button
                      type="button"
                      className="app-btn"
                      style={{ width: '100%', fontSize: '12px' }}
                      onClick={() => setShowPayloadModal(true)}
                    >
                      Preview Exact JSON Payload
                    </button>
                  </div>
                </div>
              </div>

              <div className="settings-bottom-bar">
                <span style={{ fontSize: '12px', color: 'var(--app-text-secondary)' }}>
                  Configuration stored securely on your local device &bull; Offline-first
                </span>
                <button type="button" className="app-btn app-btn-primary">
                  Save Changes
                </button>
              </div>
            </div>
          </section>

          {/* TAB PANE 4: ABOUT */}
          <section className={`tab-pane ${activeTab === 'About' ? 'active' : ''}`} role="tabpanel">
            <div className="tab-about-content">
              <div className="about-title">pyEGClamUI</div>
              <div className="about-version">Version {displayVersion} &bull; Open Source Security</div>
              <p className="about-desc">
                An open-source, cross-platform desktop graphical user interface for the ClamAV antivirus engine. Built with Python 3.9+ and PySide6 (Qt) under the GNU General Public License v3.0 (GPL-3.0).
              </p>

              <div className="disclaimer-card">
                <strong>ClamAV® Trademark Notice:</strong> ClamAV® is a registered trademark of Cisco Systems, Inc. pyEGClamUI is an independent open-source project and is not affiliated with, endorsed by, or sponsored by Cisco Systems, Inc.
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Live Scan Dialog Modal Simulation */}
      <div className={`modal-overlay ${isScanModalOpen ? 'open' : ''}`} id="scanModal">
        <div className="modal-box">
          {/* Modal Titlebar */}
          <div className="window-titlebar">
            <div className="window-title">
              <img src="assets/images/egav.svg" alt="pyEGClamUI Logo" width="16" height="16" />
              <span>pyEGClamUI - {scanType}</span>
            </div>
            <div className="window-controls">
              <button type="button" className="win-btn close" onClick={handleCloseScan} title="Close" aria-label="Close Dialog">
                <svg width="10" height="10" viewBox="0 0 10 10">
                  <path d="M1,0L0,1l4,4L0,9l1,1l4-4l4,4l1-1L6,5l4-4L9,0L5,4L1,0z" fill="currentColor" />
                </svg>
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--app-accent-sky)', marginBottom: '2px' }}>
                Running {scanType}...
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--app-text-secondary)' }}>
                {getSubheaderForScan(scanType)}
              </p>
            </div>

            {/* Indeterminate Progress Bar */}
            <div className="progress-bar-container">
              <div className="progress-bar-indeterminate" />
            </div>

            {/* Live Path Ticker */}
            <div
              style={{
                fontSize: '12px',
                fontFamily: 'monospace',
                color: 'var(--app-text-secondary)',
                background: 'var(--app-bg-card)',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid var(--app-border-color)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              Scanning: <span style={{ color: '#f8fafc' }}>{SCAN_PATHS[currentPathIndex]}</span>
            </div>

            {/* Counters Row */}
            <div className="stats-card-row">
              <div className="stats-card-item">
                Scanned Files: <span style={{ color: 'var(--app-accent-sky)' }}>{scannedFilesCount.toLocaleString()}</span>
              </div>
              <div className="stats-card-item" style={{ color: 'var(--app-accent-green)' }}>
                Threats: 0
              </div>
              <div className="stats-card-item" style={{ color: 'var(--app-text-secondary)' }}>
                Elapsed: {scanElapsedSecs}s
              </div>
            </div>

            {/* Modal Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
              <button type="button" className="app-btn app-btn-danger" onClick={handleCloseScan}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                Stop Scan
              </button>
              <button type="button" className="app-btn" onClick={handleCloseScan}>
                Close Dialog
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* JSON Payload Preview Modal Simulation */}
      {showPayloadModal && (
        <div className="modal-overlay open" onClick={() => setShowPayloadModal(false)}>
          <div className="modal-box" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
            <div className="window-titlebar">
              <div className="window-title">
                <img src="assets/images/egav.svg" alt="pyEGClamUI Logo" width="16" height="16" />
                <span>Exact Opt-In Diagnostics JSON Payload</span>
              </div>
              <div className="window-controls">
                <button type="button" className="win-btn close" onClick={() => setShowPayloadModal(false)} title="Close">
                  <svg width="10" height="10" viewBox="0 0 10 10">
                    <path d="M1,0L0,1l4,4L0,9l1,1l4-4l4,4l1-1L6,5l4-4L9,0L5,4L1,0z" fill="currentColor" />
                  </svg>
                </button>
              </div>
            </div>
            <div style={{ padding: '20px' }}>
              <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '12px' }}>
                pyEGClamUI adheres to strict zero-silent-tracking principles. This is the exact, unredacted JSON format sent only when opted-in:
              </p>
              <pre
                style={{
                  background: '#090d16',
                  padding: '14px',
                  borderRadius: '8px',
                  border: '1px solid #313338',
                  color: '#38bdf8',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  overflowX: 'auto',
                }}
              >
{JSON.stringify(
  {
    schema: 'pyegclamui.diagnostics.v1',
    timestamp: new Date().toISOString(),
    engine: {
      version: 'ClamAV 1.4.1',
      platform: 'x86_64-linux-gnu',
      signatures_fresh: true,
    },
    metrics: {
      total_scans_performed: 42,
      threats_isolated: 2,
    },
    privacy_redaction_verified: true,
  },
  null,
  2
)}
              </pre>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" className="app-btn app-btn-primary" onClick={() => setShowPayloadModal(false)}>
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
