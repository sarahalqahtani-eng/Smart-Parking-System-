/* ==========================================================================
   Smart Parking — AI Analyzer Page
   ========================================================================== */

let currentImageBlob = null;

// Handle file selection
function handleFile(file) {
  if (!file || !file.type.startsWith('image/')) {
    showToast('Please upload an image file', 'error');
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    showToast('Image must be under 5MB', 'error');
    return;
  }
  currentImageBlob = file;

  const reader = new FileReader();
  reader.onload = (e) => {
    document.getElementById('ai-preview-img').src = e.target.result;
    analyzeImage(file);
  };
  reader.readAsDataURL(file);
}

// Send the image to the Flask backend and show result
async function analyzeImage(file) {
  // Show result panel with loading state
  document.getElementById('ai-result').classList.add('show');
  document.getElementById('ai-result-class').textContent = t('analyzing');
  document.getElementById('ai-result-class').className = 'ai-result-class';
  document.getElementById('confidence-value').textContent = '—';
  document.getElementById('confidence-fill').style.width = '0%';

  const formData = new FormData();
  formData.append('image', file);

  try {
   const resp = await fetch('/predict', {
  method: 'POST',
  body: formData,
});
    if (!resp.ok) throw new Error(`Backend returned ${resp.status}`);
    const result = await resp.json();
    // Expected response: { result: 'Empty' | 'Occupied', confidence: 0.0-1.0 }
    displayResult(result);
    await saveToHistory(result);
    await loadHistory();
  } catch (err) {
    console.error(err);
    showToast(t('ai_error'), 'error');
    document.getElementById('ai-result-class').textContent = '⚠';
  }
}

function displayResult(result) {
  const isAvail = (result.result || '').toLowerCase().includes('empty') ||
                  (result.result || '').toLowerCase().includes('available');
  const cls = isAvail ? 'available' : 'occupied';
  const labelKey = isAvail ? 'spot_available' : 'spot_occupied';

  const resultEl = document.getElementById('ai-result-class');
  resultEl.textContent = t(labelKey);
  resultEl.className = `ai-result-class ${cls}`;

  const conf = result.confidence !== undefined ? Math.round(result.confidence * 100) : 0;
  document.getElementById('confidence-value').textContent = `${conf}%`;
  const fill = document.getElementById('confidence-fill');
  fill.className = `confidence-fill ${cls}`;
  // Trigger animation
  requestAnimationFrame(() => { fill.style.width = `${conf}%`; });
}

// Save result to Supabase
async function saveToHistory(result) {
  try {
    const isAvail = (result.result || '').toLowerCase().includes('empty') ||
                    (result.result || '').toLowerCase().includes('available');
    await supabaseClient.from('ai_analysis').insert({
      image_url: null, // could upload to Supabase Storage if desired
      result: isAvail ? 'Empty' : 'Occupied',
      confidence: result.confidence || 0,
    });
  } catch (err) {
    console.warn('Could not save history:', err);
  }
}

// Load recent analyses from Supabase
async function loadHistory() {
  const { data, error } = await supabaseClient
    .from('ai_analysis')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(6);

  const container = document.getElementById('history-list');
  if (!container) return;

  if (error || !data || data.length === 0) {
    container.innerHTML = `<p style="color:var(--slate-500); text-align:center; padding:20px; grid-column:1/-1;">${t('ai_history_empty')}</p>`;
    return;
  }

  container.innerHTML = data.map(item => {
    const isAvail = (item.result || '').toLowerCase().includes('empty') ||
                    (item.result || '').toLowerCase().includes('available');
    const cls = isAvail ? 'available' : 'occupied';
    const conf = item.confidence ? Math.round(item.confidence * 100) : 0;
    const date = new Date(item.created_at).toLocaleString(CURRENT_LANG === 'ar' ? 'ar-SA' : 'en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    return `
      <div class="history-item">
        <div class="history-thumb ${cls}">${isAvail ? '🅿️' : '🚗'}</div>
        <div class="history-info">
          <div class="history-title ${cls}">${isAvail ? t('spot_available') : t('spot_occupied')}</div>
          <div class="history-meta">${conf}% · ${date}</div>
        </div>
      </div>
    `;
  }).join('');
}

// Init
function startAi() {
  initCommon('ai');

  const upload = document.getElementById('ai-upload');
  const input = document.getElementById('ai-file-input');

  input.addEventListener('change', (e) => {
    if (e.target.files[0]) handleFile(e.target.files[0]);
  });

  // Drag and drop
  ['dragenter', 'dragover'].forEach(ev => {
    upload.addEventListener(ev, (e) => {
      e.preventDefault();
      upload.classList.add('dragover');
    });
  });
  ['dragleave', 'drop'].forEach(ev => {
    upload.addEventListener(ev, (e) => {
      e.preventDefault();
      upload.classList.remove('dragover');
    });
  });
  upload.addEventListener('drop', (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  });

  document.getElementById('btn-analyze-another').addEventListener('click', () => {
    input.value = '';
    document.getElementById('ai-result').classList.remove('show');
    currentImageBlob = null;
  });

  loadHistory();
}

document.addEventListener('DOMContentLoaded', startAi);
