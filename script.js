// ====== CONSTANTS ======
const UPSCALE_API = 'https://bintangapi.full.diskon.cloud/api/tools/upscale-img';
const REMOVEBG_API = 'https://bintangapi.full.diskon.cloud/api/tools/removebg';
const UPLOADCARE_KEY = '527f0f1c182a3ad64fd4';

// ====== STATE ======
let upscaleInputUrl = '';
let bgInputUrl = '';
let upscaleResultUrl = '';
let bgResultUrl = '';

// ====== DOM ======
const $ = id => document.getElementById(id);

// ====== PAGE ROUTER ======
function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = $('page-' + name);
  if (target) target.classList.add('active');

  // Update desktop tabs
  document.querySelectorAll('.nav-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.page === name);
  });
  // Update mobile tabs
  document.querySelectorAll('.mob-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.page === name);
  });

  // Re-render history when visiting that page
  if (name === 'history') renderHistory();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function closeMob() {
  $('mobNav').classList.remove('open');
}

// ====== THEME ======
let theme = localStorage.getItem('monpix-theme') || 'dark';
document.documentElement.setAttribute('data-theme', theme);

$('themeToggle').addEventListener('click', () => {
  theme = theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('monpix-theme', theme);
});

// ====== NAVBAR SCROLL ======
window.addEventListener('scroll', () => {
  $('navbar').classList.toggle('scrolled', window.scrollY > 10);
});

// ====== MOBILE MENU ======
$('menuBtn').addEventListener('click', () => {
  $('mobNav').classList.toggle('open');
});

// ====== TOAST ======
function toast(msg, type = 'info', dur = 3200) {
  const wrap = $('toastWrap');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  const icons = {
    success: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,
    error: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    info: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`
  };
  t.innerHTML = `${icons[type] || icons.info}<span>${msg}</span>`;
  wrap.appendChild(t);
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 300); }, dur);
}

// ====== UPLOADCARE ======
async function uploadToUploadcare(file) {
  const form = new FormData();
  form.append('UPLOADCARE_PUB_KEY', UPLOADCARE_KEY);
  form.append('UPLOADCARE_STORE', '1');
  form.append('file', file);
  const res = await fetch('https://upload.uploadcare.com/base/', { method: 'POST', body: form });
  if (!res.ok) throw new Error('Upload failed');
  const data = await res.json();
  return `https://ucarecdn.com/${data.file}/`;
}

// ====== DRAG DROP ======
function setupDrop(dropEl, fileInput, onUrl) {
  dropEl.addEventListener('click', e => {
    if (e.target.closest('.file-btn')) return;
    fileInput.click();
  });
  dropEl.addEventListener('dragover', e => { e.preventDefault(); dropEl.classList.add('drag-over'); });
  dropEl.addEventListener('dragleave', () => dropEl.classList.remove('drag-over'));
  dropEl.addEventListener('drop', async e => {
    e.preventDefault();
    dropEl.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) await handleFileUpload(file, dropEl, onUrl);
  });
  fileInput.addEventListener('change', async () => {
    if (fileInput.files[0]) await handleFileUpload(fileInput.files[0], dropEl, onUrl);
  });
}

async function handleFileUpload(file, dropEl, onUrl) {
  const inner = dropEl.querySelector('.drop-inner');
  const orig = inner.innerHTML;
  inner.innerHTML = `<div class="drop-ico"><div class="spin-ring" style="width:30px;height:30px"></div></div><p class="drop-title">Uploading...</p><p class="drop-sub">${file.name}</p>`;
  try {
    const url = await uploadToUploadcare(file);
    inner.innerHTML = `<div class="drop-ico" style="background:rgba(34,197,94,.1)"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg></div><p class="drop-title" style="color:#22c55e">Uploaded!</p><p class="drop-sub">${file.name}</p>`;
    onUrl(url);
    toast('Image uploaded!', 'success');
  } catch {
    inner.innerHTML = orig;
    toast('Upload failed. Try paste a URL instead.', 'error');
  }
}

// ====== BEFORE / AFTER ======
function initBA(containerId, maskId, lineId) {
  const c = $(containerId), mask = $(maskId), line = $(lineId);
  if (!c || !mask || !line) return;
  let dragging = false;

  function setPos(pct) {
    pct = Math.max(5, Math.min(95, pct));
    mask.style.right = (100 - pct) + '%';
    line.style.left = pct + '%';
  }

  function getX(e) {
    const rect = c.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    return ((cx - rect.left) / rect.width) * 100;
  }

  c.addEventListener('mousedown', e => { dragging = true; setPos(getX(e)); });
  c.addEventListener('touchstart', e => { dragging = true; setPos(getX(e)); }, { passive: true });
  window.addEventListener('mousemove', e => { if (dragging) setPos(getX(e)); });
  window.addEventListener('touchmove', e => { if (dragging) setPos(getX(e)); }, { passive: true });
  window.addEventListener('mouseup', () => dragging = false);
  window.addEventListener('touchend', () => dragging = false);

  setPos(50);
}

// ====== SLIDER ======
const upRes = $('upRes');
const upResLabel = $('upResLabel');

function syncSlider(slider) {
  const pct = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
  slider.style.setProperty('--pct', pct + '%');
}

upRes.addEventListener('input', () => {
  upResLabel.innerHTML = upRes.value + '&times;';
  syncSlider(upRes);
});
syncSlider(upRes);

// ====== UPSCALER ======
setupDrop($('upDrop'), $('upFile'), url => { upscaleInputUrl = url; $('upUrl').value = url; });
$('upUrl').addEventListener('input', () => { upscaleInputUrl = $('upUrl').value.trim(); });

async function runUpscale() {
  const url = upscaleInputUrl || $('upUrl').value.trim();
  if (!url) { toast('Please upload or enter an image URL', 'error'); return; }
  const res = parseInt(upRes.value);

  $('upResult').style.display = 'none';
  $('upRetry').style.display = 'none';
  $('upLoading').style.display = 'flex';
  $('upBtn').disabled = true;

  try {
    const r = await fetch(`${UPSCALE_API}?url=${encodeURIComponent(url)}&resolusi=${res}`);
    if (!r.ok) throw new Error(`API error ${r.status}`);
    const data = await r.json();
    const resultUrl = data.result || data.url || data.output || data.image;
    if (!resultUrl) throw new Error('No result URL returned');

    upscaleResultUrl = resultUrl;
    $('upBefore').src = url;
    $('upAfter').src = resultUrl;

    $('upLoading').style.display = 'none';
    $('upResult').style.display = 'flex';
    initBA('upBAC', 'upAfterMask', 'upLine');
    saveHistory('upscale', url, resultUrl, res + 'x');
    toast(`Upscaled ${res}× successfully!`, 'success');
  } catch (err) {
    $('upLoading').style.display = 'none';
    $('upRetry').style.display = 'flex';
    toast('Upscale failed: ' + err.message, 'error');
  }
  $('upBtn').disabled = false;
}

$('upBtn').addEventListener('click', runUpscale);
$('upRetry').addEventListener('click', runUpscale);
$('upCopy').addEventListener('click', () => navigator.clipboard.writeText(upscaleResultUrl).then(() => toast('URL copied!', 'success')).catch(() => toast('Failed to copy', 'error')));
$('upDown').addEventListener('click', () => downloadImg(upscaleResultUrl, 'monpix-upscaled.png'));
$('upFull').addEventListener('click', () => openFullscreen(upscaleResultUrl));

// ====== REMOVE BG ======
setupDrop($('bgDrop'), $('bgFile'), url => { bgInputUrl = url; $('bgUrl').value = url; });
$('bgUrl').addEventListener('input', () => { bgInputUrl = $('bgUrl').value.trim(); });

async function runRemoveBG() {
  const url = bgInputUrl || $('bgUrl').value.trim();
  if (!url) { toast('Please upload or enter an image URL', 'error'); return; }

  $('bgResult').style.display = 'none';
  $('bgRetry').style.display = 'none';
  $('bgLoading').style.display = 'flex';
  $('bgBtn').disabled = true;

  try {
    const r = await fetch(`${REMOVEBG_API}?url=${encodeURIComponent(url)}`);
    if (!r.ok) throw new Error(`API error ${r.status}`);
    const data = await r.json();
    const resultUrl = data.result || data.url || data.output || data.image;
    if (!resultUrl) throw new Error('No result URL returned');

    bgResultUrl = resultUrl;
    $('bgBefore').src = url;
    $('bgAfter').src = resultUrl;

    $('bgLoading').style.display = 'none';
    $('bgResult').style.display = 'flex';
    initBA('bgBAC', 'bgAfterMask', 'bgLine');
    saveHistory('removebg', url, resultUrl, '');
    toast('Background removed!', 'success');
  } catch (err) {
    $('bgLoading').style.display = 'none';
    $('bgRetry').style.display = 'flex';
    toast('Remove BG failed: ' + err.message, 'error');
  }
  $('bgBtn').disabled = false;
}

$('bgBtn').addEventListener('click', runRemoveBG);
$('bgRetry').addEventListener('click', runRemoveBG);
$('bgCopy').addEventListener('click', () => navigator.clipboard.writeText(bgResultUrl).then(() => toast('URL copied!', 'success')).catch(() => toast('Failed to copy', 'error')));
$('bgDown').addEventListener('click', () => downloadImg(bgResultUrl, 'monpix-nobg.png'));
$('bgFull').addEventListener('click', () => openFullscreen(bgResultUrl));

// ====== DOWNLOAD ======
function downloadImg(url, name) {
  const a = document.createElement('a');
  a.href = url; a.download = name; a.target = '_blank';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  toast('Download started!', 'success');
}

// ====== FULLSCREEN ======
function openFullscreen(url) {
  $('fsImg').src = url;
  $('fsModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
$('fsClose').addEventListener('click', () => { $('fsModal').classList.remove('open'); document.body.style.overflow = ''; });
$('fsModal').addEventListener('click', e => { if (e.target === $('fsModal')) { $('fsModal').classList.remove('open'); document.body.style.overflow = ''; } });

// ====== HISTORY ======
function saveHistory(type, inputUrl, resultUrl, meta) {
  const hist = JSON.parse(localStorage.getItem('monpix-history') || '[]');
  hist.unshift({ type, inputUrl, resultUrl, meta, date: Date.now() });
  if (hist.length > 30) hist.pop();
  localStorage.setItem('monpix-history', JSON.stringify(hist));
}

function renderHistory() {
  const hist = JSON.parse(localStorage.getItem('monpix-history') || '[]');
  const grid = $('histGrid');
  $('histCount').textContent = hist.length + ' item' + (hist.length !== 1 ? 's' : '');

  if (hist.length === 0) {
    grid.innerHTML = `<div class="hist-empty"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg><p>No history yet</p><span>Processed images will appear here</span></div>`;
    return;
  }

  grid.innerHTML = hist.map(item => {
    const cyan = item.type === 'removebg';
    const label = cyan ? 'BG Removed' : `Upscaled${item.meta ? ' ' + item.meta : ''}`;
    const d = new Date(item.date);
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const safeUrl = item.resultUrl.replace(/'/g, "\\'");
    return `<div class="hist-card">
      <img class="hist-thumb${cyan ? ' checker' : ''}" src="${item.resultUrl}" alt="Result" loading="lazy"/>
      <div class="hist-info">
        <div class="hist-type${cyan ? ' cyan' : ''}">${label}</div>
        <div class="hist-date">${dateStr}</div>
      </div>
      <div class="hist-actions">
        <button class="hist-btn${cyan ? ' cyan' : ''}" onclick="navigator.clipboard.writeText('${safeUrl}').then(()=>toast('Copied!','success'))">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copy
        </button>
        <button class="hist-btn${cyan ? ' cyan' : ''}" onclick="openFullscreen('${safeUrl}')">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>View
        </button>
      </div>
    </div>`;
  }).join('');
}

$('clearHist').addEventListener('click', () => {
  if (confirm('Clear all history?')) {
    localStorage.removeItem('monpix-history');
    renderHistory();
    toast('History cleared', 'info');
  }
});

// ====== INIT ======
showPage('home');
