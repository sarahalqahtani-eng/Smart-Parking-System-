/* ==========================================================================
   Smart Parking — Configuration
   ========================================================================== */

const CONFIG = {
  // Supabase
  SUPABASE_URL: 'https://suebmzkudabpuoesdxxf.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1ZWJtemt1ZGFicHVvZXNkeHhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0MTAwOTAsImV4cCI6MjA5Mzk4NjA5MH0.xxNrBL0vwJmhhngcqlVX9kbne3ilNAQ1iwwtUgGO7Ds',

  // ESP32 (configurable — saved to localStorage)
  // The user must enter the ESP32 local IP via the settings modal.
  ESP32_IP: localStorage.getItem('esp32_ip') || '',

  // AI backend (Flask app running locally)
  AI_BACKEND_URL: localStorage.getItem('ai_backend_url') || 'http://localhost:5000',

  // Polling interval for sensor (in milliseconds)
  POLL_INTERVAL: 2000,

  // Distance threshold (cm) — below this, the spot is considered occupied
  OCCUPIED_DISTANCE: 15,
};

// Initialize Supabase client (loaded from CDN in HTML)
const supabaseClient = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

// Helper to update settings dynamically
function saveSettings(esp32Ip, aiBackendUrl) {
  if (esp32Ip !== undefined) {
    localStorage.setItem('esp32_ip', esp32Ip);
    CONFIG.ESP32_IP = esp32Ip;
  }
  if (aiBackendUrl !== undefined) {
    localStorage.setItem('ai_backend_url', aiBackendUrl);
    CONFIG.AI_BACKEND_URL = aiBackendUrl;
  }
}

// ESP32 URL builder
function esp32Url(path) {
  if (!CONFIG.ESP32_IP) return null;
  const ip = CONFIG.ESP32_IP.replace(/^https?:\/\//, '').replace(/\/$/, '');
  return `http://${ip}${path.startsWith('/') ? path : '/' + path}`;
}
