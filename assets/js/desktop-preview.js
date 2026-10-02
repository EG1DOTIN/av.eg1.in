/**
 * pyEGClamUI Desktop UI Interactive Preview Logic
 * Manages tab switching, status state matrix, scan modals, and quarantine tables
 */

// Tab switching
function switchAppTab(index, btnElement) {
  const container = btnElement.closest('.desktop-window') || document;
  const tabButtons = container.querySelectorAll('.tab-btn');
  const tabPanes = container.querySelectorAll('.tab-pane');

  tabButtons.forEach(btn => {
    btn.classList.remove('active');
    btn.setAttribute('aria-selected', 'false');
  });
  tabPanes.forEach(pane => pane.classList.remove('active'));

  btnElement.classList.add('active');
  btnElement.setAttribute('aria-selected', 'true');
  if (tabPanes[index]) {
    tabPanes[index].classList.add('active');
  }

  // Update native window titlebar to match active tab: pyEGClamUI - <Tab-Name>
  const tabName = btnElement.textContent.trim();
  const titleSpan = container.querySelector('#desktopWindowTitle') || document.getElementById('desktopWindowTitle');
  if (titleSpan && tabName) {
    titleSpan.textContent = `pyEGClamUI - ${tabName}`;
  }
}

// Status Banner 3-Tier State Matrix Switcher
function setAppStatusState(state) {
  const banner = document.getElementById('statusBanner');
  const shieldPath = document.getElementById('shieldPath');
  const checkmark = document.getElementById('shieldCheckmark');
  const title = document.getElementById('bannerTitle');
  const sub = document.getElementById('bannerSubtitle');
  const btn = document.getElementById('bannerActionBtn');
  const btnText = document.getElementById('bannerBtnText');
  const badgeEngine = document.getElementById('badgeEngine');

  if (!banner) return;

  // Update active toolbar button styling if toolbar present
  const btnProtected = document.getElementById('btn-state-protected');
  const btnWarning = document.getElementById('btn-state-warning');
  const btnDanger = document.getElementById('btn-state-danger');

  if (btnProtected) btnProtected.classList.toggle('active', state === 'protected');
  if (btnWarning) btnWarning.classList.toggle('active', state === 'warning');
  if (btnDanger) btnDanger.classList.toggle('active', state === 'danger');

  banner.className = 'banner-card ' + state;

  if (state === 'protected') {
    if (shieldPath) {
      shieldPath.setAttribute('stroke', '#22c55e');
      shieldPath.setAttribute('fill', 'rgba(34, 197, 94, 0.12)');
    }
    if (checkmark) {
      checkmark.setAttribute('d', 'M22 32 L29 39 L43 25');
      checkmark.setAttribute('stroke', '#22c55e');
    }
    if (title) title.innerText = 'System Protected';
    if (sub) sub.innerText = 'Real-time protection is active. Virus signatures are up-to-date.';
    if (btn) btn.className = 'app-btn app-btn-primary';
    if (btnText) btnText.innerText = 'Check for Updates';
    if (badgeEngine) {
      badgeEngine.innerHTML = '● Online';
      badgeEngine.style.color = '#22c55e';
      badgeEngine.style.borderColor = 'rgba(34, 197, 94, 0.3)';
      badgeEngine.style.backgroundColor = 'rgba(34, 197, 94, 0.15)';
    }
  } else if (state === 'warning') {
    if (shieldPath) {
      shieldPath.setAttribute('stroke', '#eab308');
      shieldPath.setAttribute('fill', 'rgba(234, 179, 8, 0.12)');
    }
    if (checkmark) {
      checkmark.setAttribute('d', 'M32 20 V34 M32 42 V44');
      checkmark.setAttribute('stroke', '#eab308');
    }
    if (title) title.innerText = 'System at Risk';
    if (sub) sub.innerText = 'Real-Time Guard is disabled. Files are not automatically monitored.';
    if (btn) btn.className = 'app-btn app-btn-primary';
    if (btnText) btnText.innerText = 'Enable Real-Time Guard';
    if (badgeEngine) {
      badgeEngine.innerHTML = '● Online';
      badgeEngine.style.color = '#22c55e';
    }
  } else if (state === 'danger') {
    if (shieldPath) {
      shieldPath.setAttribute('stroke', '#ef4444');
      shieldPath.setAttribute('fill', 'rgba(239, 68, 68, 0.12)');
    }
    if (checkmark) {
      checkmark.setAttribute('d', 'M24 24 L40 40 M40 24 L24 40');
      checkmark.setAttribute('stroke', '#ef4444');
    }
    if (title) title.innerText = 'Engine Not Detected';
    if (sub) sub.innerText = 'ClamAV was not found in PATH or configured folders. Please configure engine.';
    if (btn) btn.className = 'app-btn app-btn-danger';
    if (btnText) btnText.innerText = 'Configure Engine...';
    if (badgeEngine) {
      badgeEngine.innerHTML = '✕ Offline';
      badgeEngine.style.color = '#ef4444';
      badgeEngine.style.borderColor = 'rgba(239, 68, 68, 0.3)';
      badgeEngine.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
    }
  }
}

// Quarantine row selection
function selectQuarantineRow(rowElement) {
  const table = rowElement.closest('table');
  if (!table) return;
  const rows = table.querySelectorAll('tbody tr');
  rows.forEach(r => r.classList.remove('selected'));
  rowElement.classList.add('selected');
}

// Toggle Telemetry granular checkboxes
function toggleTelemetrySub(enabled) {
  const widget = document.getElementById('telemSubWidget');
  if (!widget) return;
  widget.style.opacity = enabled ? '1' : '0.5';
  const inputs = widget.querySelectorAll('input[type="checkbox"]');
  inputs.forEach(input => input.disabled = !enabled);
}

// Modal Scan Dialog Demo
let scanTimer = null;
let scanFilesCount = 1482;
let scanSeconds = 12;

function openScanModal(scanType = 'Quick Scan') {
  const modal = document.getElementById('scanModal');
  if (!modal) return;
  const sub = document.getElementById('modalWindowSubtitle');
  const header = document.getElementById('modalScanHeader');
  const subheader = document.getElementById('modalScanSubheader');
  if (sub) sub.innerText = `pyEGClamUI - ${scanType}`;
  if (header) header.innerText = `Running ${scanType}...`;
  if (subheader) {
    if (scanType === 'Quick Scan') subheader.innerText = 'Target: High-Priority System Areas';
    else if (scanType === 'Full System Scan') subheader.innerText = 'Target: Entire System & Storage Media';
    else if (scanType === 'Memory Scan') subheader.innerText = 'Target: Active System Memory & Running Processes';
    else subheader.innerText = 'Target: User-Selected Locations';
  }
  modal.classList.add('open');

  // Start realistic counter ticker
  if (scanTimer) clearInterval(scanTimer);
  scanTimer = setInterval(() => {
    scanFilesCount += Math.floor(Math.random() * 25) + 5;
    scanSeconds += 1;
    const fileCounter = document.getElementById('scannedFilesCounter');
    const elapsedCounter = document.getElementById('modalElapsedCounter');
    if (fileCounter) fileCounter.innerText = scanFilesCount.toLocaleString();
    if (elapsedCounter) elapsedCounter.innerText = `Elapsed: ${scanSeconds}s`;
  }, 400);
}

function closeScanModal() {
  const modal = document.getElementById('scanModal');
  if (modal) modal.classList.remove('open');
  if (scanTimer) {
    clearInterval(scanTimer);
    scanTimer = null;
  }
}

// One-time demo Guest ID generator
function generateDemoGuestId(btn) {
  const input = document.getElementById('demoUserIdInput');
  if (!input) return;
  const randDigits = Math.floor(10000000 + Math.random() * 90000000);
  input.value = 'Guest' + randDigits;
  btn.disabled = true;
  btn.title = 'Guest ID already generated';
  btn.style.opacity = '0.5';
  btn.style.cursor = 'not-allowed';
}

// Global Escape listener to close scan modal
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeScanModal();
  }
});
