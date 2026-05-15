/* ==========================================================================
   Smart Parking — Common Components
   ========================================================================== */

// Render the intro animation overlay (only on first visit per session)
function renderIntro() {
  if (sessionStorage.getItem('intro_shown')) return;
  sessionStorage.setItem('intro_shown', '1');
  const overlay = document.createElement('div');
  overlay.className = 'intro-overlay';
  overlay.innerHTML = `<img class="intro-logo" src="assets/logo.jpeg?v=100" alt="Al Yamamah University">`;
  document.body.prepend(overlay);
  setTimeout(() => overlay.remove(), 3000);
}

// Render the sticky header with logo and navigation
function renderHeader(activePage) {
  const header = document.createElement('header');
  header.className = 'header';
  header.innerHTML = `
    <div class="header-inner">
      <a href="index.html" class="header-logo">
        <img src="assets/logo.jpeg?v=100" alt="Al Yamamah University">
      </a>
      <nav class="header-nav">
        <a href="index.html" class="nav-link ${activePage === 'home' ? 'active' : ''}" data-i18n="nav_home">Home</a>
        <a href="reservation.html" class="nav-link ${activePage === 'reservation' ? 'active' : ''}" data-i18n="nav_reservation">Reservation</a>
        <a href="ai-analyzer.html" class="nav-link ${activePage === 'ai' ? 'active' : ''}" data-i18n="nav_ai">AI Analyzer</a>
      </nav>
      <div style="display:flex; align-items:center; gap:10px;">
        <button class="settings-trigger" id="open-settings" title="Settings" aria-label="Settings">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
        <button class="lang-toggle" id="lang-toggle">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
          <span data-i18n="lang_toggle">AR</span>
        </button>
      </div>
    </div>
  `;
  document.body.prepend(header);

  document.getElementById('lang-toggle').addEventListener('click', () => {
    setLanguage(CURRENT_LANG === 'en' ? 'ar' : 'en');
  });

  document.getElementById('open-settings').addEventListener('click', openSettings);
}

// Render footer
function renderFooter() {
  const footer = document.createElement('footer');
  footer.className = 'footer';
  footer.innerHTML = `<span data-i18n="footer">Smart Parking System · Al Yamamah University</span> · &copy; 2026`;
  document.body.appendChild(footer);
}

// Settings modal — for ESP32 IP and AI backend URL
function renderSettingsModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'settings-modal';
  modal.innerHTML = `
    <div class="modal">
      <h2 class="modal-title" data-i18n="settings_title">Connection Settings</h2>
      <p class="modal-subtitle" data-i18n="settings_subtitle">Configure your endpoints.</p>

      <div class="form-group">
        <label class="form-label" data-i18n="esp32_ip_label">ESP32 IP Address</label>
        <input type="text" class="form-input" id="esp32-ip-input"
               value="${CONFIG.ESP32_IP}"
               data-i18n-ph="esp32_ip_ph"
               placeholder="e.g. 192.168.1.42">
      </div>

      <div class="form-group">
        <label class="form-label" data-i18n="ai_backend_label">AI Backend URL</label>
        <input type="text" class="form-input" id="ai-backend-input"
               value="${CONFIG.AI_BACKEND_URL}"
               data-i18n-ph="ai_backend_ph"
               placeholder="e.g. http://localhost:5000">
      </div>

      <div class="btn-group">
        <button class="btn btn-outline" id="cancel-settings" data-i18n="cancel">Cancel</button>
        <button class="btn btn-primary" id="save-settings" data-i18n="save">Save</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('cancel-settings').addEventListener('click', closeSettings);
  document.getElementById('save-settings').addEventListener('click', () => {
    const ip = document.getElementById('esp32-ip-input').value.trim();
    const ai = document.getElementById('ai-backend-input').value.trim();
    saveSettings(ip, ai);
    closeSettings();
    showToast(t('settings_saved'), 'success');
    // refresh page so polling restarts with new config
    setTimeout(() => location.reload(), 700);
  });
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeSettings();
  });
}

function openSettings() {
  document.getElementById('settings-modal').classList.add('show');
}

function closeSettings() {
  document.getElementById('settings-modal').classList.remove('show');
}

// Toast notification
function showToast(message, type = 'default') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ESP32 helper — try to fetch with a timeout
async function fetchEsp32(path, timeoutMs = 3000) {
  const url = esp32Url(path);
  if (!url) throw new Error('ESP32 not configured');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resp = await fetch(url, { signal: controller.signal });
    return await resp.text();
  } finally {
    clearTimeout(timeout);
  }
}

// Initialize common UI elements on every page
function initCommon(activePage) {
  renderIntro();
  renderHeader(activePage);
  renderSettingsModal();
  renderFooter();
  // Apply current language
  document.documentElement.lang = CURRENT_LANG;
  document.body.dir = CURRENT_LANG === 'ar' ? 'rtl' : 'ltr';
  applyTranslations();
}
