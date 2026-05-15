/* ==========================================================================
   Smart Parking — Reservation Page
   ========================================================================== */

let selectedSpot = null;
let allSpots = [];
let currentReservation = null;
let gatePollInterval = null;

// Load spots from Supabase and render selector buttons
async function loadSpotSelector() {
  const { data, error } = await supabaseClient.from('parking_spots').select('*');
  if (error) {
    console.warn('Supabase read failed:', error.message);
  }
  allSpots = (data || []).sort((a, b) => a.spot_name.localeCompare(b.spot_name));

  const container = document.getElementById('spot-selector');
  if (!container) return;

  if (!allSpots.length) {
    container.innerHTML = `<p style="color:var(--slate-500); text-align:center; padding:20px;">No spots configured. Visit the home page first.</p>`;
    return;
  }

  container.innerHTML = allSpots.map(spot => {
    const isOccupied = spot.status === 'occupied';
    return `
      <div class="spot-option ${isOccupied ? 'disabled' : ''}"
           data-spot="${spot.spot_name}"
           data-spot-id="${spot.id}">
        <div class="spot-option-label">${spot.spot_name}</div>
        <div class="spot-option-status">
          ${isOccupied ? t('spot_occupied') : t('spot_available')}
        </div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.spot-option:not(.disabled)').forEach(el => {
    el.addEventListener('click', () => {
      container.querySelectorAll('.spot-option').forEach(s => s.classList.remove('selected'));
      el.classList.add('selected');
      selectedSpot = {
        name: el.dataset.spot,
        id: parseInt(el.dataset.spotId, 10)
      };
    });
  });
}

// Submit reservation
async function submitReservation(e) {
  e.preventDefault();

  const name = document.getElementById('full-name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const plate = document.getElementById('plate').value.trim();
  const duration = parseInt(document.getElementById('duration').value, 10);

  if (!name || !phone || !plate || !selectedSpot) {
    showToast(t('fill_all_fields'), 'error');
    return;
  }

  const now = new Date();
  const endTime = new Date(now.getTime() + duration * 60 * 1000);

  const { data, error } = await supabaseClient
    .from('reservations')
    .insert({
      parking_spot_id: selectedSpot.id,
      reservation_status: 'active',
      start_time: now.toISOString(),
      end_time: endTime.toISOString(),
      user_name: name,
      user_phone: phone,
      user_plate: plate,
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    showToast('Failed to save reservation: ' + error.message, 'error');
    return;
  }

  currentReservation = data;
  showToast(t('reservation_success'), 'success');
  showGateControl();
}

// Show the gate control section
function showGateControl() {
  document.getElementById('reservation-form-section').style.display = 'none';
  document.getElementById('gate-control-section').style.display = 'block';
  document.getElementById('gate-spot-name').textContent = selectedSpot.name;

  pollGateStatus();
  gatePollInterval = setInterval(pollGateStatus, 2000);
}

// Poll the ESP32 gate status
async function pollGateStatus() {
  if (!CONFIG.ESP32_IP) {
    setGateStatus(null);
    return;
  }
  try {
    const body = await fetchEsp32('/gate-status', 2500);
    const isOpen = body.trim().toLowerCase().includes('open');
    setGateStatus(isOpen);
  } catch (err) {
    setGateStatus(null);
  }
}

// Update gate UI
function setGateStatus(isOpen) {
  const display = document.getElementById('gate-status-display');
  const icon = document.getElementById('gate-icon-large');
  if (!display) return;

  if (isOpen === null) {
    display.textContent = '—';
    icon.textContent = '⏳';
    return;
  }
  display.textContent = isOpen ? t('gate_open') : t('gate_locked');
  icon.textContent = isOpen ? '🔓' : '🔒';
}

// Send open/lock command
async function sendGateCommand(command) {
  if (!CONFIG.ESP32_IP) {
    showToast(t('esp32_not_configured'), 'error');
    return;
  }

  // Log to gate_commands
  if (currentReservation) {
    await supabaseClient.from('gate_commands').insert({
      parking_spot_id: selectedSpot.id,
      command,
      status: 'pending',
    });
  }

  try {
    await fetchEsp32(command === 'open' ? '/open' : '/lock', 4000);
    showToast(command === 'open' ? '🔓 Gate opening...' : '🔒 Gate locking...', 'success');

    // Mark the command as executed
    setTimeout(pollGateStatus, 500);

    // Update parking_spots is_gate_open flag
    if (selectedSpot) {
      await supabaseClient
        .from('parking_spots')
        .update({ is_gate_open: command === 'open', updated_at: new Date().toISOString() })
        .eq('id', selectedSpot.id);
    }
  } catch (err) {
    showToast('Failed to reach ESP32. Check the IP in settings.', 'error');
  }
}

// Init
async function startReservation() {
  initCommon('reservation');
  await loadSpotSelector();

  document.getElementById('reservation-form').addEventListener('submit', submitReservation);
  document.getElementById('btn-open').addEventListener('click', () => sendGateCommand('open'));
  document.getElementById('btn-lock').addEventListener('click', () => sendGateCommand('lock'));
  document.getElementById('btn-new-reservation').addEventListener('click', () => {
    if (gatePollInterval) clearInterval(gatePollInterval);
    document.getElementById('reservation-form-section').style.display = 'block';
    document.getElementById('gate-control-section').style.display = 'none';
    document.getElementById('reservation-form').reset();
    selectedSpot = null;
    currentReservation = null;
    loadSpotSelector();
  });
}

document.addEventListener('DOMContentLoaded', startReservation);
