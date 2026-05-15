/* ==========================================================================
   Smart Parking — Home Page
   ========================================================================== */

const SPOT_NAMES = ['A1', 'A2', 'A3', 'A4'];

// Render the SVG map of the parking lot
function renderMap() {
  const canvas = document.getElementById('map-canvas');
  if (!canvas) return;

  // SVG drawing a top-down view of the lot:
  //  - University gate at top
  //  - Driving lane in the middle
  //  - 4 parking spots arranged below (2 left, 2 right)
  const svg = `
    <svg class="map-svg" viewBox="0 0 800 460" xmlns="http://www.w3.org/2000/svg">
      <!-- Background pattern -->
      <defs>
        <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="#BAE6FD" opacity="0.6"/>
        </pattern>
        <linearGradient id="laneGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="#475569"/>
          <stop offset="100%" stop-color="#334155"/>
        </linearGradient>
      </defs>

      <rect width="800" height="460" fill="url(#dots)"/>

      <!-- University building / gate area -->
      <rect x="280" y="20" width="240" height="60" rx="10" fill="#0EA5E9" opacity="0.15"/>
      <rect x="320" y="40" width="160" height="40" rx="8" fill="#0EA5E9"/>
      <text x="400" y="65" text-anchor="middle" fill="white" font-size="14" font-weight="700" font-family="Outfit">UNIVERSITY GATE</text>

      <!-- Gate opening -->
      <line x1="370" y1="80" x2="430" y2="80" stroke="#10B981" stroke-width="4" stroke-dasharray="6,4"/>

      <!-- Driving lane -->
      <rect x="350" y="90" width="100" height="340" fill="url(#laneGrad)" rx="4"/>
      <line x1="400" y1="100" x2="400" y2="420" stroke="white" stroke-width="2" stroke-dasharray="14,10" opacity="0.8"/>

      <!-- Parking spot A1 (top left) -->
      <g class="map-spot" data-spot="A1">
        <rect x="120" y="120" width="180" height="80" rx="6" stroke-width="3"/>
        <text x="210" y="166" font-size="22">A1</text>
      </g>

      <!-- Parking spot A2 (top right) -->
      <g class="map-spot" data-spot="A2">
        <rect x="500" y="120" width="180" height="80" rx="6" stroke-width="3"/>
        <text x="590" y="166" font-size="22">A2</text>
      </g>

      <!-- Parking spot A3 (bottom left) -->
      <g class="map-spot" data-spot="A3">
        <rect x="120" y="240" width="180" height="80" rx="6" stroke-width="3"/>
        <text x="210" y="286" font-size="22">A3</text>
      </g>

      <!-- Parking spot A4 (bottom right) -->
      <g class="map-spot" data-spot="A4">
        <rect x="500" y="240" width="180" height="80" rx="6" stroke-width="3"/>
        <text x="590" y="286" font-size="22">A4</text>
      </g>

      <!-- Decorative greenery -->
      <circle cx="60" cy="60" r="22" fill="#10B981" opacity="0.25"/>
      <circle cx="50" cy="50" r="14" fill="#10B981" opacity="0.4"/>
      <circle cx="740" cy="60" r="22" fill="#10B981" opacity="0.25"/>
      <circle cx="750" cy="50" r="14" fill="#10B981" opacity="0.4"/>
      <circle cx="60" cy="400" r="20" fill="#10B981" opacity="0.25"/>
      <circle cx="740" cy="400" r="20" fill="#10B981" opacity="0.25"/>
    </svg>

    <div class="map-legend">
      <div class="legend-item"><div class="legend-dot available"></div><span data-i18n="legend_available">Available</span></div>
      <div class="legend-item"><div class="legend-dot occupied"></div><span data-i18n="legend_occupied">Occupied</span></div>
      <div class="legend-item"><div class="legend-dot reserved"></div><span data-i18n="legend_reserved">Reserved</span></div>
    </div>
  `;
  canvas.innerHTML = svg;
  applyTranslations();
}

// Render the parking spots grid below the map
function renderSpotsGrid(spots) {
  const grid = document.getElementById('spots-grid');
  if (!grid) return;

  grid.innerHTML = spots.map(spot => {
    const isAvail = spot.status === 'available';
    const distanceLabel = spot.distance_value !== null && spot.distance_value !== undefined
      ? `${spot.distance_value.toFixed(0)} cm`
      : '—';
    return `
      <div class="spot-card ${isAvail ? 'available' : 'occupied'}">
        <div class="spot-card-header">
          <div>
            <div class="spot-name">${spot.spot_name}</div>
            <div class="spot-status">
              <span class="pulse"></span>
              ${isAvail ? t('spot_available') : t('spot_occupied')}
            </div>
          </div>
          <div class="spot-icon">${isAvail ? '🅿️' : '🚗'}</div>
        </div>
        <div class="spot-details">
          <span data-i18n="spot_distance">Distance</span>
          <span class="spot-distance">${distanceLabel}</span>
        </div>
      </div>
    `;
  }).join('');
  applyTranslations();
}

// Update map spot colors based on status
function updateMapColors(spots) {
  spots.forEach(spot => {
    const el = document.querySelector(`.map-spot[data-spot="${spot.spot_name}"]`);
    if (!el) return;
    el.classList.remove('available', 'occupied', 'reserved');
    el.classList.add(spot.status === 'available' ? 'available' : 'occupied');
  });
}
// Update the live indicator
function setLiveIndicator(connected) {
  const el = document.getElementById('live-indicator');
  if (!el) return;

  if (connected) {
    el.classList.remove('offline');

    el.innerHTML = `
      <div class="dot"></div>
      <span>Sensor Online</span>
    `;
  } else {
    el.classList.add('offline');

    el.innerHTML = `
      <div class="dot"></div>
      <span>Sensor Offline</span>
    `;
  }
}


// Ensure 4 demo spots exist in Supabase (creates them if missing)
async function ensureSpots() {
  const { data, error } = await supabaseClient
    .from('parking_spots')
    .select('*');

  if (error) {
    console.warn('Supabase read failed:', error.message);
    return SPOT_NAMES.map(name => ({
      spot_name: name,
      status: 'available',
      distance_value: null
    }));
  }

  const existing = new Set((data || []).map(s => s.spot_name));
  const toInsert = SPOT_NAMES.filter(n => !existing.has(n)).map(n => ({ spot_name: n, status: 'available' }));

  if (toInsert.length) {
    await supabaseClient.from('parking_spots').insert(toInsert);
    const { data: refreshed } = await supabaseClient.from('parking_spots').select('*');
    return enrichWithDistance(refreshed || []);
  }
  return enrichWithDistance(data);
}

function enrichWithDistance(spots) {
  // Attach last known distance value from local cache if present
  return spots.map(s => ({
    ...s,
    distance_value: window.__lastDistances?.[s.spot_name] ?? null
  })).sort((a, b) => a.spot_name.localeCompare(b.spot_name));
}

// Poll the ESP32 sensor and update Supabase
async function pollSensor(spots) {
  if (!CONFIG.ESP32_IP) {
    setLiveIndicator(false);
    return spots;
  }
  try {
    const body = await fetchEsp32('/status', 2500);
    // Parse: expect "Available, 42.5" or "Occupied, 8.3" or just "Available"
    const parts = body.split(',').map(p => p.trim());
    const sensorState = parts[0]; // "Available" / "Occupied"
    const distance = parts[1] ? parseFloat(parts[1]) : null;

    setLiveIndicator(true);

    // Update Spot A1 (the one connected to the real ESP32 sensor)
    const newStatus = sensorState.toLowerCase().includes('occupied') ? 'occupied' : 'available';

    window.__lastDistances = window.__lastDistances || {};
    window.__lastDistances['A1'] = distance;

    const a1 = spots.find(s => s.spot_name === 'A1');
    if (a1 && a1.status !== newStatus) {
      await supabaseClient
        .from('parking_spots')
        .update({ status: newStatus, sensor_status: 'detected', updated_at: new Date().toISOString() })
        .eq('spot_name', 'A1');

      // Log to iot_logs
      await supabaseClient.from('iot_logs').insert({
        parking_spot_id: a1.id,
        sensor_value: newStatus,
        distance_value: distance,
      });

      a1.status = newStatus;
    } else if (a1) {
      a1.distance_value = distance;
    }

    return spots;
  } catch (err) {
    setLiveIndicator(false);
    return spots;
  }
}

// Main loop
async function startHome() {
  initCommon('home');
  renderMap();

  let spots = await ensureSpots();
  renderSpotsGrid(spots);
  updateMapColors(spots);

  // Polling loop
  setInterval(async () => {
    spots = await pollSensor(spots);
    spots = enrichWithDistance(spots);
    renderSpotsGrid(spots);
    updateMapColors(spots);
    applyTranslations();
  }, CONFIG.POLL_INTERVAL);

  // If not configured, prompt
  if (!CONFIG.ESP32_IP) {
    showToast(t('esp32_not_configured'), 'error');
  }
}

document.addEventListener('DOMContentLoaded', startHome);
