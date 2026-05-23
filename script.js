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
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.toggle('active', t.dataset.page === name));
  document.querySelectorAll('.mob-tab').forEach(t => t.classList.toggle('active', t.dataset.page === name));
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

// ====== NAVBAR ======
window.addEventListener('scroll', () => {
  $('navbar').classList.toggle('scrolled', window.scrollY > 10);
});
$('menuBtn').addEventListener('click', () => $('mobNav').classList.toggle('open'));

// ====== TOAST ======
function toast(msg, type = 'info', dur = 4000) {
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

// ====== SAFE FETCH (dengan error CORS yang jelas) ======
async function safeFetch(url) {
  try {
    const r = await fetch(url);
    if (!r.ok) {
      let errText = '';
      try { errText = await r.text(); } catch {}
      throw new Error(`Server error ${r.status}${errText ? ': ' + errText.slice(0, 80) : ''}`);
    }
    return r;
  } catch (e) {
    if (e.name === 'TypeError' && e.message.toLowerCase().includes('fetch')) {
      throw new Error('Failed to connect ke API. Kemungkinan CORS — buka file ini pakai Live Server / http-server, bukan buka langsung dari folder.');
    }
    throw e;
  }
}

// ====== UPLOADCARE ======
async function uploadToUploadcare(file) {
  const form = new FormData();
  form.append("UPLOADCARE_PUB_KEY", UPLOADCARE_KEY);
  form.append("UPLOADCARE_STORE", "auto");
  form.append("file", file);

  const res = await fetch("https://upload.uploadcare.com/base/", { method: "POST", body: form });
  if (!res.ok) throw new Error("Upload gagal: HTTP " + res.status);

  const data = await res.json();
  console.log("[Uploadcare]", data);

  if (!data.file) throw new Error("Upload gagal, tidak ada file ID. Coba lagi.");

  const fileUrl = "https://ucarecdn.com/" + data.file + "/";

  // Verify CDN accessible
  await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = resolve;
    img.onerror = () => reject(new Error("File terupload tapi CDN belum siap, coba lagi sebentar."));
    img.src = fileUrl;
  });

  return fileUrl;
}

// ====== DRAG DROP ======
function setupDrop(dropEl, fileInput, onUrl) {
  dropEl.addEventListener('click', e => { if (!e.target.closest('.file-btn')) fileInput.click(); });
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
    toast('Gambar berhasil diupload!', 'success');
  } catch (err) {
    inner.innerHTML = orig;
    toast('Upload gagal: ' + err.message, 'error');
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

// ====== HELPER: parse result URL ======
// API langsung return gambar (bukan JSON), jadi URL-nya langsung dipakai
function buildUpscaleUrl(imageUrl, resolusi) {
  return `${UPSCALE_API}?url=${encodeURIComponent(imageUrl)}&resolusi=${resolusi}`;
}
function buildRemoveBGUrl(imageUrl) {
  return `${REMOVEBG_API}?url=${encodeURIComponent(imageUrl)}`;
}

// ====== UPSCALER ======
setupDrop($('upDrop'), $('upFile'), url => { upscaleInputUrl = url; $('upUrl').value = url; });
$('upUrl').addEventListener('input', () => { upscaleInputUrl = $('upUrl').value.trim(); });

async function runUpscale() {
  const url = (upscaleInputUrl || $('upUrl').value).trim();
  if (!url) { toast('Upload gambar atau masukkan URL dulu', 'error'); return; }
  const res = parseInt(upRes.value);

  $('upResult').style.display = 'none';
  $('upRetry').style.display = 'none';
  $('upLoading').style.display = 'flex';
  $('upBtn').disabled = true;

  try {
    const resultUrl = buildUpscaleUrl(url, res);

    // Step 1: validasi input
    $('upLoading').querySelector('.load-sub').textContent = 'Memvalidasi gambar input...';
    await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = () => reject(new Error('URL gambar input tidak valid atau tidak bisa diakses.'));
      img.src = url;
    });

    // Step 2: proses AI
    $('upLoading').querySelector('.load-title').textContent = 'AI sedang memproses...';
    $('upLoading').querySelector('.load-sub').textContent = `Upscaling ${res}× — ini bisa 5–30 detik`;
    await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = () => reject(new Error('API gagal memproses gambar. Coba lagi.'));
      img.src = resultUrl;
    });

    upscaleResultUrl = resultUrl;
    $('upBefore').src = url;
    $('upAfter').src = resultUrl;

    $('upLoading').style.display = 'none';
    // Reset teks loading untuk next kali
    $('upLoading').querySelector('.load-title').textContent = 'Processing with AI...';
    $('upLoading').querySelector('.load-sub').textContent = 'Enhancing image resolution';
    $('upResult').style.display = 'flex';
    initBA('upBAC', 'upAfterMask', 'upLine');
    saveHistory('upscale', url, resultUrl, res + 'x');
    toast(`Upscale ${res}× berhasil!`, 'success');
  } catch (err) {
    $('upLoading').style.display = 'none';
    $('upLoading').querySelector('.load-title').textContent = 'Processing with AI...';
    $('upLoading').querySelector('.load-sub').textContent = 'Enhancing image resolution';
    $('upRetry').style.display = 'flex';
    console.error('[MonPix Upscale Error]', err);
    toast(err.message, 'error', 7000);
  }
  $('upBtn').disabled = false;
}

$('upBtn').addEventListener('click', runUpscale);
$('upRetry').addEventListener('click', runUpscale);
$('upCopy').addEventListener('click', () => navigator.clipboard.writeText(upscaleResultUrl).then(() => toast('URL disalin!', 'success')).catch(() => toast('Gagal copy', 'error')));
$('upDown').addEventListener('click', () => downloadImg(upscaleResultUrl, 'monpix-upscaled.png'));
$('upFull').addEventListener('click', () => openFullscreen(upscaleResultUrl));

// ====== REMOVE BG ======
setupDrop($('bgDrop'), $('bgFile'), url => { bgInputUrl = url; $('bgUrl').value = url; });
$('bgUrl').addEventListener('input', () => { bgInputUrl = $('bgUrl').value.trim(); });

async function runRemoveBG() {
  const url = (bgInputUrl || $('bgUrl').value).trim();
  if (!url) { toast('Upload gambar atau masukkan URL dulu', 'error'); return; }

  $('bgResult').style.display = 'none';
  $('bgRetry').style.display = 'none';
  $('bgLoading').style.display = 'flex';
  $('bgBtn').disabled = true;

  try {
    const resultUrl = buildRemoveBGUrl(url);

    $('bgLoading').querySelector('.load-sub').textContent = 'Memvalidasi gambar input...';
    await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = () => reject(new Error('URL gambar input tidak valid atau tidak bisa diakses.'));
      img.src = url;
    });

    $('bgLoading').querySelector('.load-title').textContent = 'AI sedang memproses...';
    $('bgLoading').querySelector('.load-sub').textContent = 'Menghapus background — ini bisa 5–30 detik';
    await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = () => reject(new Error('API gagal memproses gambar. Coba lagi.'));
      img.src = resultUrl;
    });

    bgResultUrl = resultUrl;
    $('bgBefore').src = url;
    $('bgAfter').src = resultUrl;

    $('bgLoading').style.display = 'none';
    $('bgLoading').querySelector('.load-title').textContent = 'Removing background...';
    $('bgLoading').querySelector('.load-sub').textContent = 'AI is analyzing your image';
    $('bgResult').style.display = 'flex';
    initBA('bgBAC', 'bgAfterMask', 'bgLine');
    saveHistory('removebg', url, resultUrl, '');
    toast('Background berhasil dihapus!', 'success');
  } catch (err) {
    $('bgLoading').style.display = 'none';
    $('bgLoading').querySelector('.load-title').textContent = 'Removing background...';
    $('bgLoading').querySelector('.load-sub').textContent = 'AI is analyzing your image';
    $('bgRetry').style.display = 'flex';
    console.error('[MonPix RemoveBG Error]', err);
    toast(err.message, 'error', 7000);
  }
  $('bgBtn').disabled = false;
}

$('bgBtn').addEventListener('click', runRemoveBG);
$('bgRetry').addEventListener('click', runRemoveBG);
$('bgCopy').addEventListener('click', () => navigator.clipboard.writeText(bgResultUrl).then(() => toast('URL disalin!', 'success')).catch(() => toast('Gagal copy', 'error')));
$('bgDown').addEventListener('click', () => downloadImg(bgResultUrl, 'monpix-nobg.png'));
$('bgFull').addEventListener('click', () => openFullscreen(bgResultUrl));

// ====== DOWNLOAD ======
function downloadImg(url, name) {
  const a = document.createElement('a');
  a.href = url; a.download = name; a.target = '_blank';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  toast('Download dimulai!', 'success');
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
    grid.innerHTML = `<div class="hist-empty"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg><p>Belum ada history</p><span>Gambar yang diproses akan muncul di sini</span></div>`;
    return;
  }

  grid.innerHTML = hist.map(item => {
    const cyan = item.type === 'removebg';
    const label = cyan ? 'BG Removed' : `Upscaled${item.meta ? ' ' + item.meta : ''}`;
    const d = new Date(item.date);
    const dateStr = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    const safeUrl = item.resultUrl.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    return `<div class="hist-card">
      <img class="hist-thumb${cyan ? ' checker' : ''}" src="${item.resultUrl}" alt="Result" loading="lazy"/>
      <div class="hist-info">
        <div class="hist-type${cyan ? ' cyan' : ''}">${label}</div>
        <div class="hist-date">${dateStr}</div>
      </div>
      <div class="hist-actions">
        <button class="hist-btn${cyan ? ' cyan' : ''}" onclick="navigator.clipboard.writeText('${safeUrl}').then(()=>toast('Disalin!','success'))">
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
  if (confirm('Hapus semua history?')) {
    localStorage.removeItem('monpix-history');
    renderHistory();
    toast('History dihapus', 'info');
  }
});

// ====== INIT ======
showPage('home');
