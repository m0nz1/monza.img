/* MonPix — script.js */
'use strict';

const API_UPSCALE  = 'https://bintangapi.full.diskon.cloud/api/tools/upscale-img';
const API_REMOVEBG = 'https://bintangapi.full.diskon.cloud/api/tools/removebg';
const UC_KEY       = '527f0f1c182a3ad64fd4';
const HISTORY_KEY  = 'monpix_history';
const THEME_KEY    = 'monpix_theme';
const COUNT_KEY    = 'monpix_count';

const state = {
  upscaleUrl: null, upscaleResult: null,
  bgUrl: null, bgResult: null,
  upscaleBusy: false, bgBusy: false,
};

const $ = (s) => document.querySelector(s);
const show = (el) => el && el.classList.remove('hidden');
const hide = (el) => el && el.classList.add('hidden');

/* ── THEME ── */
function initTheme() {
  const t = localStorage.getItem(THEME_KEY) || 'dark';
  document.documentElement.setAttribute('data-theme', t);
}
$('#themeToggle').addEventListener('click', () => {
  const cur = document.documentElement.getAttribute('data-theme');
  const next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem(THEME_KEY, next);
});

/* ── TOAST ── */
function toast(msg, type = 'info') {
  const icons = {
    success: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    error:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    info:    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
  };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span class="t-ico ${type}">${icons[type]}</span><span>${msg}</span>`;
  $('#toastWrap').appendChild(el);
  const remove = () => { el.classList.add('exit'); el.addEventListener('animationend', () => el.remove(), {once:true}); };
  const t = setTimeout(remove, 3500);
  el.addEventListener('click', () => { clearTimeout(t); remove(); });
}

/* ── COUNT ── */
function getCount() { return parseInt(localStorage.getItem(COUNT_KEY) || '0', 10); }
function bumpCount() {
  const n = getCount() + 1;
  localStorage.setItem(COUNT_KEY, n);
  renderCount(n);
}
function renderCount(n) {
  n = n ?? getCount();
  ['#processedCount','#footerCount'].forEach(s => { const el=$(s); if(el) el.textContent=n; });
}

/* ── PROGRESS ── */
function makeProgress(fillId, pctId, labelId, steps) {
  const fill = $(`#${fillId}`), pct = $(`#${pctId}`), lbl = $(`#${labelId}`);
  let cur = 0, si = 0;
  const iv = setInterval(() => {
    if (si < steps.length) {
      if (cur < steps[si].p) {
        cur = Math.min(cur + 1, steps[si].p);
        fill.style.width = cur + '%';
        if (pct) pct.textContent = cur + '%';
        if (lbl && steps[si]) lbl.textContent = steps[si].msg;
      } else si++;
    }
  }, 55);
  return {
    done() { clearInterval(iv); fill.style.width = '100%'; if(pct) pct.textContent='100%'; },
    stop() { clearInterval(iv); }
  };
}

/* ── DOWNLOAD ── */
async function dlImage(url, name) {
  try {
    const r = await fetch(url);
    const blob = await r.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name || 'monpix.png';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast('Download started!', 'success');
  } catch { window.open(url,'_blank'); toast('Opened in new tab — right-click to save.','info'); }
}

/* ── COPY URL ── */
async function copyUrl(url) {
  try { await navigator.clipboard.writeText(url); toast('URL copied!', 'success'); }
  catch { toast('Could not copy URL.', 'error'); }
}

/* ── MODAL ── */
let _modalUrl = null;
function openModal(url) {
  _modalUrl = url;
  $('#modalImg').src = url;
  show($('#modal'));
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  hide($('#modal'));
  document.body.style.overflow = '';
}
$('#modalClose').addEventListener('click', closeModal);
$('#modal').addEventListener('click', e => { if(e.target===$('#modal')) closeModal(); });
$('#modalDL').addEventListener('click', () => { if(_modalUrl) dlImage(_modalUrl,'monpix-preview.png'); });
document.addEventListener('keydown', e => { if(e.key==='Escape') closeModal(); });

/* ── BEFORE/AFTER SLIDER ── */
function initBA(sliderId, handleId, clipId) {
  const slider = $(`#${sliderId}`), handle = $(`#${handleId}`), clip = $(`#${clipId}`);
  if (!slider) return;
  let drag = false;
  const set = (x) => {
    const r = slider.getBoundingClientRect();
    let p = ((x - r.left) / r.width) * 100;
    p = Math.max(2, Math.min(98, p));
    clip.style.width = p + '%';
    handle.style.left = p + '%';
  };
  handle.addEventListener('mousedown', e => { drag=true; e.preventDefault(); });
  handle.addEventListener('touchstart', () => drag=true, {passive:true});
  document.addEventListener('mousemove', e => { if(drag) set(e.clientX); });
  document.addEventListener('touchmove', e => { if(drag&&e.touches[0]) set(e.touches[0].clientX); }, {passive:true});
  document.addEventListener('mouseup', () => drag=false);
  document.addEventListener('touchend', () => drag=false);
  slider.addEventListener('click', e => set(e.clientX));
}

/* ── UPLOADCARE ── */
function ucUpload(file) {
  return new Promise((resolve, reject) => {
    const data = new FormData();
    data.append('UPLOADCARE_PUB_KEY', UC_KEY);
    data.append('UPLOADCARE_STORE', '1');
    data.append('file', file);
    fetch('https://upload.uploadcare.com/base/', { method:'POST', body: data })
      .then(r => r.json())
      .then(json => {
        if (json.file) resolve(`https://ucarecdn.com/${json.file}/`);
        else reject(new Error('Upload failed'));
      })
      .catch(reject);
  });
}

/* ── EXTRACT RESULT URL ── */
function extractUrl(data) {
  if (typeof data === 'string' && data.startsWith('http')) return data;
  if (data.result && typeof data.result === 'string') return data.result;
  if (data.url) return data.url;
  if (data.data) {
    if (data.data.url) return data.data.url;
    if (data.data.result) return data.data.result;
  }
  if (data.output) return data.output;
  return null;
}

/* ── HISTORY ── */
function getHistory() { try { return JSON.parse(localStorage.getItem(HISTORY_KEY)||'[]'); } catch { return []; } }
function saveHistory(item) {
  const h = getHistory();
  h.unshift(item);
  if (h.length > 30) h.pop();
  localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
  renderHistory();
}
function renderHistory() {
  const grid = $('#histGrid'), empty = $('#histEmpty');
  const h = getHistory();
  const countEl = $('#histCount');
  if (countEl) countEl.textContent = `${h.length} item${h.length!==1?'s':''}`;
  Array.from(grid.querySelectorAll('.history-item')).forEach(el => el.remove());
  if (!h.length) { show(empty); return; }
  hide(empty);
  h.forEach((item, idx) => {
    const d = document.createElement('div');
    d.className = 'history-item';
    d.style.animationDelay = (idx * 0.05) + 's';
    const typeLabel = item.type === 'upscale' ? `Upscale ${item.level}×` : 'Remove BG';
    d.innerHTML = `
      <img class="history-thumb" src="${item.resultUrl}${item.type==='removebg'?'':'-/resize/300x/'}" alt="Result" loading="lazy"/>
      <div class="history-meta">
        <span class="history-type ${item.type}">${typeLabel}</span>
        <span class="history-time">${timeAgo(item.ts)}</span>
        <div class="history-acts">
          <button class="icon-btn" onclick="openModal('${item.resultUrl}')" title="View">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
          <button class="icon-btn" onclick="dlImage('${item.resultUrl}','monpix-${item.type}-${idx}.png')" title="Download">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </button>
        </div>
      </div>`;
    grid.appendChild(d);
  });
}
function timeAgo(ts) {
  const d = Date.now() - ts;
  if (d < 60000) return 'Just now';
  if (d < 3600000) return Math.floor(d/60000) + 'm ago';
  if (d < 86400000) return Math.floor(d/3600000) + 'h ago';
  return new Date(ts).toLocaleDateString();
}
$('#clearHistBtn').addEventListener('click', () => {
  localStorage.removeItem(HISTORY_KEY);
  renderHistory();
  toast('History cleared.', 'info');
});

/* ── SETUP FILE INPUT ── */
function setupUpload(zoneId, idleId, previewWrapId, previewImgId, removeId, pickBtnId, fileInputId, onUrl) {
  const zone = $(`#${zoneId}`), idle = $(`#${idleId}`), prevWrap = $(`#${previewWrapId}`);
  const prevImg = $(`#${previewImgId}`), removeBtn = $(`#${removeId}`);
  const pickBtn = $(`#${pickBtnId}`), fileInput = $(`#${fileInputId}`);

  let uploading = false;

  async function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) { toast('Please select an image file.','error'); return; }
    if (file.size > 10*1024*1024) { toast('File too large. Max 10MB.','error'); return; }
    if (uploading) return;
    uploading = true;
    toast('Uploading image...','info');
    try {
      const url = await ucUpload(file);
      // Show preview with Uploadcare resize transform
      prevImg.src = url + '-/resize/600x/';
      hide(idle); show(prevWrap);
      onUrl(url);
      toast('Image ready!','success');
    } catch(e) {
      toast('Upload failed: ' + e.message,'error');
    } finally { uploading = false; }
  }

  pickBtn.addEventListener('click', e => { e.stopPropagation(); fileInput.click(); });
  fileInput.addEventListener('change', e => { if(e.target.files[0]) handleFile(e.target.files[0]); fileInput.value=''; });
  zone.addEventListener('click', () => { if(!prevWrap.classList.contains('hidden')) return; fileInput.click(); });
  zone.addEventListener('keydown', e => { if(e.key==='Enter'||e.key===' '){ e.preventDefault(); fileInput.click(); } });
  removeBtn.addEventListener('click', e => { e.stopPropagation(); show(idle); hide(prevWrap); prevImg.src=''; onUrl(null); });

  // Drag & drop
  ['dragenter','dragover'].forEach(ev => zone.addEventListener(ev, e => { e.preventDefault(); zone.classList.add('drag-over'); }));
  ['dragleave','drop'].forEach(ev => zone.addEventListener(ev, () => zone.classList.remove('drag-over')));
  zone.addEventListener('drop', e => { e.preventDefault(); const f=e.dataTransfer.files[0]; if(f) handleFile(f); });
}

/* ── UPSCALER ── */
let _upscaleRetryFn = null;

setupUpload('upscaleZone','upscaleIdle','upscalePreviewWrap','upscalePreviewImg','upscaleRemove','upscalePickBtn','upscaleFileInput', (url) => {
  state.upscaleUrl = url;
  $('#upscaleBtn').disabled = !url;
});

$('#resSlider').addEventListener('input', () => { $('#resVal').textContent = $('#resSlider').value + '×'; });

async function runUpscale() {
  if (!state.upscaleUrl || state.upscaleBusy) return;
  const level = parseInt($('#resSlider').value, 10);
  const origUrl = state.upscaleUrl;

  state.upscaleBusy = true;
  $('#upscaleBtn').disabled = true;
  hide($('#upscaleControls')); hide($('#upscaleResult')); hide($('#upscaleError'));
  show($('#upscaleProgress'));
  setTimeout(() => { if(state.upscaleBusy) show($('#upscaleSkeleton')); }, 700);

  const prog = makeProgress('upscaleFill','upscalePct','upscaleLabel',[
    {p:10,msg:'Uploading to server...'},
    {p:28,msg:'Analyzing image...'},
    {p:52,msg:'Running AI upscaler...'},
    {p:78,msg:'Enhancing resolution...'},
    {p:93,msg:'Finalizing output...'},
  ]);

  _upscaleRetryFn = runUpscale;

  try {
    const resp = await fetch(`${API_UPSCALE}?url=${encodeURIComponent(origUrl)}&resolusi=${level}`);
    if (!resp.ok) throw new Error(`Server error ${resp.status}`);
    const data = await resp.json();
    prog.done();

    const resultUrl = extractUrl(data);
    if (!resultUrl) throw new Error('No result URL returned');
    state.upscaleResult = resultUrl;

    setTimeout(() => {
      hide($('#upscaleProgress')); hide($('#upscaleSkeleton'));
      $('#upscaleBefore').src = origUrl + '-/resize/800x/';
      $('#upscaleAfter').src  = resultUrl;
      // Reset slider to 50%
      const clip=$('#upscaleClip'), handle=$('#upscaleHandle');
      if(clip) clip.style.width='50%';
      if(handle) handle.style.left='50%';
      show($('#upscaleResult'));
      show($('#upscaleControls'));
      state.upscaleBusy = false;
      saveHistory({type:'upscale', level, resultUrl, originalUrl:origUrl, ts:Date.now()});
      bumpCount();
      toast(`Upscaled ${level}× successfully!`, 'success');
    }, 350);

  } catch(err) {
    prog.stop();
    hide($('#upscaleProgress')); hide($('#upscaleSkeleton'));
    show($('#upscaleControls'));
    $('#upscaleErrMsg').textContent = err.message || 'Something went wrong.';
    show($('#upscaleError'));
    state.upscaleBusy = false;
    $('#upscaleBtn').disabled = false;
    toast('Upscale failed: ' + err.message, 'error');
  }
}

$('#upscaleBtn').addEventListener('click', runUpscale);
$('#upscaleRetry').addEventListener('click', () => { hide($('#upscaleError')); show($('#upscaleControls')); runUpscale(); });
$('#upscaleAnother').addEventListener('click', () => {
  state.upscaleUrl = null; state.upscaleResult = null;
  show($('#upscaleIdle')); hide($('#upscalePreviewWrap'));
  hide($('#upscaleResult')); hide($('#upscaleError'));
  show($('#upscaleControls'));
  $('#upscaleBtn').disabled = true;
  $('#upscalePreviewImg').src = '';
});
$('#upscaleDL').addEventListener('click', () => { if(state.upscaleResult) dlImage(state.upscaleResult,'monpix-upscaled.png'); });
$('#upscaleCopy').addEventListener('click', () => { if(state.upscaleResult) copyUrl(state.upscaleResult); });
$('#upscaleFS').addEventListener('click', () => { if(state.upscaleResult) openModal(state.upscaleResult); });

/* ── REMOVE BG ── */
setupUpload('bgZone','bgIdle','bgPreviewWrap','bgPreviewImg','bgRemove','bgPickBtn','bgFileInput', (url) => {
  state.bgUrl = url;
  $('#bgBtn').disabled = !url;
});

async function runRemoveBg() {
  if (!state.bgUrl || state.bgBusy) return;
  const origUrl = state.bgUrl;

  state.bgBusy = true;
  $('#bgBtn').disabled = true;
  hide($('#bgResult')); hide($('#bgError'));
  show($('#bgProgress'));
  setTimeout(() => { if(state.bgBusy) show($('#bgSkeleton')); }, 700);

  const prog = makeProgress('bgFill','bgPct','bgLabel',[
    {p:10,msg:'Uploading image...'},
    {p:30,msg:'Detecting subject...'},
    {p:58,msg:'Removing background...'},
    {p:82,msg:'Refining edges...'},
    {p:94,msg:'Generating PNG...'},
  ]);

  try {
    const resp = await fetch(`${API_REMOVEBG}?url=${encodeURIComponent(origUrl)}`);
    if (!resp.ok) throw new Error(`Server error ${resp.status}`);
    const data = await resp.json();
    prog.done();

    const resultUrl = extractUrl(data);
    if (!resultUrl) throw new Error('No result URL returned');
    state.bgResult = resultUrl;

    setTimeout(() => {
      hide($('#bgProgress')); hide($('#bgSkeleton'));
      $('#bgBefore').src = origUrl + '-/resize/800x/';
      $('#bgAfter').src  = resultUrl;
      const clip=$('#bgClip'), handle=$('#bgHandle');
      if(clip) clip.style.width='50%';
      if(handle) handle.style.left='50%';
      show($('#bgResult'));
      state.bgBusy = false;
      saveHistory({type:'removebg', resultUrl, originalUrl:origUrl, ts:Date.now()});
      bumpCount();
      toast('Background removed!', 'success');
    }, 350);

  } catch(err) {
    prog.stop();
    hide($('#bgProgress')); hide($('#bgSkeleton'));
    $('#bgErrMsg').textContent = err.message || 'Something went wrong.';
    show($('#bgError'));
    state.bgBusy = false;
    $('#bgBtn').disabled = false;
    toast('Remove BG failed: ' + err.message, 'error');
  }
}

$('#bgBtn').addEventListener('click', runRemoveBg);
$('#bgRetry').addEventListener('click', () => { hide($('#bgError')); runRemoveBg(); });
$('#bgAnother').addEventListener('click', () => {
  state.bgUrl = null; state.bgResult = null;
  show($('#bgIdle')); hide($('#bgPreviewWrap'));
  hide($('#bgResult')); hide($('#bgError'));
  $('#bgBtn').disabled = true;
  $('#bgPreviewImg').src = '';
});
$('#bgDL').addEventListener('click', () => { if(state.bgResult) dlImage(state.bgResult,'monpix-nobg.png'); });
$('#bgCopy').addEventListener('click', () => { if(state.bgResult) copyUrl(state.bgResult); });
$('#bgFS').addEventListener('click', () => { if(state.bgResult) openModal(state.bgResult); });

/* ── NAVBAR SCROLL ── */
window.addEventListener('scroll', () => {
  const nav = $('#navbar');
  if (window.scrollY > 50) nav.style.background = document.documentElement.getAttribute('data-theme')==='dark'
    ? 'rgba(7,7,13,.9)' : 'rgba(244,243,255,.92)';
  else nav.style.background = '';
}, {passive:true});

/* ── SCROLL REVEAL ── */
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('visible'); observer.unobserve(e.target); }});
}, {threshold:0.07, rootMargin:'0px 0px -36px 0px'});
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

/* ── PWA ── */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(()=>{}));
}

/* ── INIT ── */
initTheme();
renderCount();
renderHistory();
initBA('upscaleBA','upscaleHandle','upscaleClip');
initBA('bgBA','bgHandle','bgClip');

/* Expose for history inline onclick */
window.openModal = openModal;
window.dlImage = dlImage;

console.log('%cMonPix ✦','color:#7c3aed;font-size:20px;font-weight:bold');
