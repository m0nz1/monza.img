/* ============================================================
   MonPix — AI Image Tools
   script.js
   ============================================================ */

'use strict';

/* ── Constants ── */
const API_UPSCALE = 'https://bintangapi.full.diskon.cloud/api/tools/upscale-img';
const API_REMOVEBG = 'https://bintangapi.full.diskon.cloud/api/tools/removebg';
const UC_PUBLIC_KEY = '527f0f1c182a3ad64fd4';
const HISTORY_KEY = 'monpix_history';
const THEME_KEY = 'monpix_theme';
const COUNT_KEY = 'monpix_count';

/* ── State ── */
const state = {
  upscaleUrl: null,
  upscaleResultUrl: null,
  bgUrl: null,
  bgResultUrl: null,
  processing: { upscale: false, bg: false },
};

/* ── DOM Helpers ── */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);
const show = (el) => el && el.classList.remove('hidden');
const hide = (el) => el && el.classList.add('hidden');
const isHidden = (el) => el && el.classList.contains('hidden');

/* ═══════════════════════════════════════════
   THEME
═══════════════════════════════════════════ */
function initTheme() {
  const saved = localStorage.getItem(THEME_KEY) || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem(THEME_KEY, next);
}

/* ═══════════════════════════════════════════
   TOAST NOTIFICATIONS
═══════════════════════════════════════════ */
function toast(message, type = 'info', duration = 3500) {
  const container = $('#toastContainer');
  const icons = {
    success: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    error: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    info: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  };
  const el = document.createElement('div');
  el.className = `toast toast-left ${type}`;
  el.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span>${message}</span>`;
  container.appendChild(el);

  const remove = () => {
    el.classList.add('toast-exit');
    el.addEventListener('animationend', () => el.remove(), { once: true });
  };
  const timer = setTimeout(remove, duration);
  el.addEventListener('click', () => { clearTimeout(timer); remove(); });
}

/* ═══════════════════════════════════════════
   COUNTER
═══════════════════════════════════════════ */
function getCount() { return parseInt(localStorage.getItem(COUNT_KEY) || '0', 10); }
function incrementCount() {
  const n = getCount() + 1;
  localStorage.setItem(COUNT_KEY, n);
  updateCountUI(n);
  return n;
}
function updateCountUI(n) {
  const count = n !== undefined ? n : getCount();
  const el = $('#processedCount');
  const el2 = $('#footerCount');
  if (el) el.textContent = count;
  if (el2) el2.textContent = count;
}

/* ═══════════════════════════════════════════
   PROGRESS BAR
═══════════════════════════════════════════ */
function simulateProgress(fillId, pctId, labelId, steps) {
  const fill = $(`#${fillId}`);
  const pct = $(`#${pctId}`);
  const label = $(`#${labelId}`);
  let current = 0;
  let stepIdx = 0;
  const stepMessages = steps || [
    { pct: 10, msg: 'Uploading image...' },
    { pct: 30, msg: 'Connecting to AI...' },
    { pct: 55, msg: 'Processing with AI...' },
    { pct: 80, msg: 'Enhancing quality...' },
    { pct: 95, msg: 'Finalizing...' },
  ];

  const interval = setInterval(() => {
    if (stepIdx < stepMessages.length) {
      const target = stepMessages[stepIdx].pct;
      if (current < target) {
        current = Math.min(current + 1, target);
        fill.style.width = current + '%';
        if (pct) pct.textContent = current + '%';
        if (label && stepMessages[stepIdx]) label.textContent = stepMessages[stepIdx].msg;
      } else {
        stepIdx++;
      }
    }
  }, 60);

  return {
    complete: () => {
      clearInterval(interval);
      fill.style.width = '100%';
      if (pct) pct.textContent = '100%';
    },
    stop: () => clearInterval(interval),
  };
}

/* ═══════════════════════════════════════════
   DOWNLOAD
═══════════════════════════════════════════ */
async function downloadImage(url, filename) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename || 'monpix-result.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    toast('Download started!', 'success');
  } catch {
    // Fallback: open in new tab
    window.open(url, '_blank');
    toast('Opened in new tab — right-click to save.', 'info');
  }
}

/* ═══════════════════════════════════════════
   COPY URL
═══════════════════════════════════════════ */
async function copyUrl(url) {
  try {
    await navigator.clipboard.writeText(url);
    toast('URL copied to clipboard!', 'success');
  } catch {
    toast('Could not copy URL.', 'error');
  }
}

/* ═══════════════════════════════════════════
   FULLSCREEN MODAL
═══════════════════════════════════════════ */
let modalDownloadUrl = null;

function openModal(url) {
  const overlay = $('#modalOverlay');
  const img = $('#modalImg');
  img.src = url;
  modalDownloadUrl = url;
  overlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const overlay = $('#modalOverlay');
  overlay.classList.add('hidden');
  document.body.style.overflow = '';
}

/* ═══════════════════════════════════════════
   BEFORE / AFTER SLIDER
═══════════════════════════════════════════ */
function initBASlider(sliderId, handleId, afterWrapId) {
  const slider = $(`#${sliderId}`);
  const handle = $(`#${handleId}`);
  const afterWrap = $(`#${afterWrapId}`);
  if (!slider || !handle || !afterWrap) return;

  let dragging = false;

  function setPosition(x) {
    const rect = slider.getBoundingClientRect();
    let pct = ((x - rect.left) / rect.width) * 100;
    pct = Math.max(2, Math.min(98, pct));
    afterWrap.style.width = pct + '%';
    handle.style.left = pct + '%';
  }

  handle.addEventListener('mousedown', (e) => { dragging = true; e.preventDefault(); });
  handle.addEventListener('touchstart', (e) => { dragging = true; }, { passive: true });

  document.addEventListener('mousemove', (e) => { if (dragging) setPosition(e.clientX); });
  document.addEventListener('touchmove', (e) => {
    if (dragging && e.touches[0]) setPosition(e.touches[0].clientX);
  }, { passive: true });
  document.addEventListener('mouseup', () => { dragging = false; });
  document.addEventListener('touchend', () => { dragging = false; });

  slider.addEventListener('click', (e) => setPosition(e.clientX));
}

/* ═══════════════════════════════════════════
   UPLOADCARE
═══════════════════════════════════════════ */
function initUploadcare() {
  // Upscaler
  const upscaleWidget = uploadcare.Widget('#upscaleUploadcare');
  upscaleWidget.onChange((file) => {
    if (file) {
      file.done((info) => {
        state.upscaleUrl = info.cdnUrl;
        showUpscalePreview(info.cdnUrl);
        $('#upscaleBtn').disabled = false;
      }).fail(() => {
        toast('Upload failed. Please try again.', 'error');
      });
    }
  });

  // BG Remover
  const bgWidget = uploadcare.Widget('#bgUploadcare');
  bgWidget.onChange((file) => {
    if (file) {
      file.done((info) => {
        state.bgUrl = info.cdnUrl;
        showBgPreview(info.cdnUrl);
        $('#bgBtn').disabled = false;
      }).fail(() => {
        toast('Upload failed. Please try again.', 'error');
      });
    }
  });

  // Custom upload buttons
  $('#upscaleUploadBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    upscaleWidget.openDialog();
  });

  $('#bgUploadBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    bgWidget.openDialog();
  });

  // Drop zone click
  $('#upscaleDropZone').addEventListener('click', (e) => {
    if (e.target.closest('.preview-remove')) return;
    if (!isHidden($('#upscalePreview'))) return;
    upscaleWidget.openDialog();
  });

  $('#bgDropZone').addEventListener('click', (e) => {
    if (e.target.closest('.preview-remove')) return;
    if (!isHidden($('#bgPreview'))) return;
    bgWidget.openDialog();
  });

  return { upscaleWidget, bgWidget };
}

/* ═══════════════════════════════════════════
   DRAG & DROP
═══════════════════════════════════════════ */
function initDragDrop(dropZoneId, widgetInstance, onFile) {
  const zone = $(`#${dropZoneId}`);
  if (!zone) return;

  ['dragenter', 'dragover'].forEach((ev) => {
    zone.addEventListener(ev, (e) => {
      e.preventDefault();
      zone.classList.add('drag-over');
    });
  });

  ['dragleave', 'drop'].forEach((ev) => {
    zone.addEventListener(ev, (e) => {
      zone.classList.remove('drag-over');
    });
  });

  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files.length) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      toast('Please drop an image file.', 'error');
      return;
    }
    // Upload via Uploadcare programmatically
    const upload = uploadcare.fileFrom('object', file);
    upload.done((info) => {
      onFile(info.cdnUrl);
    }).fail(() => {
      toast('Upload failed. Please try again.', 'error');
    });
  });
}

/* ═══════════════════════════════════════════
   PREVIEW HELPERS
═══════════════════════════════════════════ */
function showUpscalePreview(url) {
  const inner = $('#upscaleUploadInner');
  const preview = $('#upscalePreview');
  const img = $('#upscalePreviewImg');
  img.src = url + '-/resize/600x/';
  hide(inner);
  show(preview);
}

function showBgPreview(url) {
  const inner = $('#bgUploadInner');
  const preview = $('#bgPreview');
  const img = $('#bgPreviewImg');
  img.src = url + '-/resize/600x/';
  hide(inner);
  show(preview);
}

function resetUpscale() {
  state.upscaleUrl = null;
  state.upscaleResultUrl = null;
  show($('#upscaleUploadInner'));
  hide($('#upscalePreview'));
  hide($('#upscaleResult'));
  hide($('#upscaleError'));
  hide($('#upscaleProgress'));
  hide($('#upscaleSkeleton'));
  show($('#upscaleControls'));
  $('#upscaleBtn').disabled = true;
  $('#upscalePreviewImg').src = '';
}

function resetBg() {
  state.bgUrl = null;
  state.bgResultUrl = null;
  show($('#bgUploadInner'));
  hide($('#bgPreview'));
  hide($('#bgResult'));
  hide($('#bgError'));
  hide($('#bgProgress'));
  hide($('#bgSkeleton'));
  $('#bgBtn').disabled = true;
  $('#bgPreviewImg').src = '';
}

/* ═══════════════════════════════════════════
   HISTORY
═══════════════════════════════════════════ */
function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch { return []; }
}

function saveHistory(item) {
  const history = getHistory();
  history.unshift(item);
  if (history.length > 30) history.pop();
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  const grid = $('#historyGrid');
  const empty = $('#historyEmpty');
  const countEl = $('#historyCount');
  const history = getHistory();

  if (countEl) countEl.textContent = `${history.length} item${history.length !== 1 ? 's' : ''}`;

  // Remove all except empty placeholder
  Array.from(grid.querySelectorAll('.history-item')).forEach((el) => el.remove());

  if (!history.length) {
    show(empty);
    return;
  }
  hide(empty);

  history.forEach((item, idx) => {
    const div = document.createElement('div');
    div.className = 'history-item';
    div.style.animationDelay = `${idx * 0.06}s`;
    div.innerHTML = `
      <img class="history-thumb" src="${item.resultUrl + '-/resize/300x/'}" alt="Result" loading="lazy" />
      <div class="history-meta">
        <span class="history-type ${item.type}">${item.type === 'upscale' ? 'Upscale ' + item.level + '×' : 'Remove BG'}</span>
        <span class="history-time">${formatTime(item.ts)}</span>
        <div class="history-actions">
          <button class="btn-icon" onclick="openModal('${item.resultUrl}')" aria-label="View">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
          <button class="btn-icon" onclick="downloadImage('${item.resultUrl}', 'monpix-${item.type}-${idx}.png')" aria-label="Download">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </button>
        </div>
      </div>`;
    grid.appendChild(div);
  });
}

function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
  renderHistory();
  toast('History cleared.', 'info');
}

function formatTime(ts) {
  const diff = Date.now() - ts;
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
  if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
  return new Date(ts).toLocaleDateString();
}

/* ═══════════════════════════════════════════
   AI UPSCALER
═══════════════════════════════════════════ */
async function runUpscale() {
  if (!state.upscaleUrl || state.processing.upscale) return;
  const level = parseInt($('#resolutionSlider').value, 10);
  const originalUrl = state.upscaleUrl;

  state.processing.upscale = true;
  $('#upscaleBtn').disabled = true;

  // Show progress
  hide($('#upscaleControls'));
  show($('#upscaleProgress'));
  hide($('#upscaleResult'));
  hide($('#upscaleError'));

  const prog = simulateProgress('upscaleProgressFill', 'upscaleProgressPct', 'upscaleProgressLabel', [
    { pct: 10, msg: 'Uploading to server...' },
    { pct: 25, msg: 'Analyzing image...' },
    { pct: 50, msg: 'Running AI upscaler...' },
    { pct: 75, msg: 'Enhancing resolution...' },
    { pct: 92, msg: 'Finalizing output...' },
  ]);

  // Show skeleton after short delay
  setTimeout(() => {
    if (state.processing.upscale) {
      show($('#upscaleSkeleton'));
    }
  }, 800);

  try {
    const url = `${API_UPSCALE}?url=${encodeURIComponent(originalUrl)}&resolusi=${level}`;
    const response = await fetch(url);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    prog.complete();

    // Extract result URL
    let resultUrl = null;
    if (data.result) resultUrl = data.result;
    else if (data.url) resultUrl = data.url;
    else if (data.data && data.data.url) resultUrl = data.data.url;
    else if (data.data && data.data.result) resultUrl = data.data.result;
    else if (typeof data === 'string' && data.startsWith('http')) resultUrl = data;

    if (!resultUrl) throw new Error('No result URL in response');

    state.upscaleResultUrl = resultUrl;

    // Update UI after brief pause
    setTimeout(() => {
      hide($('#upscaleProgress'));
      hide($('#upscaleSkeleton'));

      $('#upscaleBeforeImg').src = originalUrl + '-/resize/800x/';
      $('#upscaleAfterImg').src = resultUrl;

      // Reset BA slider to 50%
      const afterWrap = $('#upscaleAfterWrap');
      const handle = $('#upscaleHandle');
      if (afterWrap) afterWrap.style.width = '50%';
      if (handle) handle.style.left = '50%';

      show($('#upscaleResult'));
      state.processing.upscale = false;

      // Save history
      saveHistory({ type: 'upscale', level, resultUrl, originalUrl, ts: Date.now() });
      incrementCount();
      toast(`Image upscaled ${level}× successfully!`, 'success');
    }, 400);

  } catch (err) {
    prog.stop();
    hide($('#upscaleProgress'));
    hide($('#upscaleSkeleton'));
    show($('#upscaleControls'));
    show($('#upscaleError'));
    $('#upscaleErrorMsg').textContent = err.message || 'Something went wrong. Please try again.';
    state.processing.upscale = false;
    $('#upscaleBtn').disabled = false;
    toast('Upscale failed. ' + (err.message || ''), 'error');
    console.error('Upscale error:', err);
  }
}

/* ═══════════════════════════════════════════
   AI REMOVE BACKGROUND
═══════════════════════════════════════════ */
async function runRemoveBg() {
  if (!state.bgUrl || state.processing.bg) return;
  const originalUrl = state.bgUrl;

  state.processing.bg = true;
  $('#bgBtn').disabled = true;

  show($('#bgProgress'));
  hide($('#bgResult'));
  hide($('#bgError'));

  const prog = simulateProgress('bgProgressFill', 'bgProgressPct', 'bgProgressLabel', [
    { pct: 10, msg: 'Uploading image...' },
    { pct: 30, msg: 'Detecting subject...' },
    { pct: 55, msg: 'Removing background...' },
    { pct: 80, msg: 'Refining edges...' },
    { pct: 93, msg: 'Generating PNG...' },
  ]);

  setTimeout(() => {
    if (state.processing.bg) show($('#bgSkeleton'));
  }, 800);

  try {
    const url = `${API_REMOVEBG}?url=${encodeURIComponent(originalUrl)}`;
    const response = await fetch(url);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    prog.complete();

    let resultUrl = null;
    if (data.result) resultUrl = data.result;
    else if (data.url) resultUrl = data.url;
    else if (data.data && data.data.url) resultUrl = data.data.url;
    else if (data.data && data.data.result) resultUrl = data.data.result;
    else if (typeof data === 'string' && data.startsWith('http')) resultUrl = data;

    if (!resultUrl) throw new Error('No result URL in response');

    state.bgResultUrl = resultUrl;

    setTimeout(() => {
      hide($('#bgProgress'));
      hide($('#bgSkeleton'));

      $('#bgBeforeImg').src = originalUrl + '-/resize/800x/';
      $('#bgAfterImg').src = resultUrl;

      const afterWrap = $('#bgAfterWrap');
      const handle = $('#bgHandle');
      if (afterWrap) afterWrap.style.width = '50%';
      if (handle) handle.style.left = '50%';

      show($('#bgResult'));
      state.processing.bg = false;

      saveHistory({ type: 'removebg', resultUrl, originalUrl, ts: Date.now() });
      incrementCount();
      toast('Background removed successfully!', 'success');
    }, 400);

  } catch (err) {
    prog.stop();
    hide($('#bgProgress'));
    hide($('#bgSkeleton'));
    show($('#bgError'));
    $('#bgErrorMsg').textContent = err.message || 'Something went wrong. Please try again.';
    state.processing.bg = false;
    $('#bgBtn').disabled = false;
    toast('Remove BG failed. ' + (err.message || ''), 'error');
    console.error('RemoveBG error:', err);
  }
}

/* ═══════════════════════════════════════════
   NAVBAR SCROLL
═══════════════════════════════════════════ */
function initNavbarScroll() {
  const nav = $('#navbar');
  let lastY = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > 60) {
      nav.style.background = document.documentElement.getAttribute('data-theme') === 'dark'
        ? 'rgba(7,7,13,0.88)'
        : 'rgba(245,244,255,0.92)';
    } else {
      nav.style.background = '';
    }
    lastY = y;
  }, { passive: true });
}

/* ═══════════════════════════════════════════
   SCROLL REVEAL
═══════════════════════════════════════════ */
function initScrollReveal() {
  const els = $$('.tool-section, .section-header, .glass-card');
  els.forEach((el) => el.classList.add('reveal'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  els.forEach((el) => observer.observe(el));
}

/* ═══════════════════════════════════════════
   PAGE TRANSITION
═══════════════════════════════════════════ */
function pageEnter() {
  const pt = $('#pageTransition');
  pt.classList.add('active');
  setTimeout(() => pt.classList.remove('active'), 600);
}

/* ═══════════════════════════════════════════
   PWA
═══════════════════════════════════════════ */
function initPWA() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
  }
}

/* ═══════════════════════════════════════════
   SLIDER LABEL
═══════════════════════════════════════════ */
function initSlider() {
  const slider = $('#resolutionSlider');
  const label = $('#resolutionValue');
  if (!slider || !label) return;
  slider.addEventListener('input', () => {
    label.textContent = slider.value + '×';
  });
}

/* ═══════════════════════════════════════════
   EVENT LISTENERS
═══════════════════════════════════════════ */
function bindEvents(widgets) {
  const { upscaleWidget, bgWidget } = widgets;

  // Theme
  $('#themeToggle').addEventListener('click', toggleTheme);

  // Upscale
  $('#upscaleBtn').addEventListener('click', runUpscale);
  $('#upscaleRetry').addEventListener('click', resetUpscale);
  $('#upscaleRetryBtn').addEventListener('click', () => {
    hide($('#upscaleError'));
    show($('#upscaleControls'));
    runUpscale();
  });
  $('#upscaleRemoveImg').addEventListener('click', (e) => {
    e.stopPropagation();
    resetUpscale();
  });
  $('#upscaleDownload').addEventListener('click', () => {
    if (state.upscaleResultUrl) downloadImage(state.upscaleResultUrl, 'monpix-upscaled.png');
  });
  $('#upscaleCopyUrl').addEventListener('click', () => {
    if (state.upscaleResultUrl) copyUrl(state.upscaleResultUrl);
  });
  $('#upscaleFullscreen').addEventListener('click', () => {
    if (state.upscaleResultUrl) openModal(state.upscaleResultUrl);
  });

  // BG Remove
  $('#bgBtn').addEventListener('click', runRemoveBg);
  $('#bgRetry').addEventListener('click', resetBg);
  $('#bgRetryBtn').addEventListener('click', () => {
    hide($('#bgError'));
    runRemoveBg();
  });
  $('#bgRemoveImg').addEventListener('click', (e) => {
    e.stopPropagation();
    resetBg();
  });
  $('#bgDownload').addEventListener('click', () => {
    if (state.bgResultUrl) downloadImage(state.bgResultUrl, 'monpix-nobg.png');
  });
  $('#bgCopyUrl').addEventListener('click', () => {
    if (state.bgResultUrl) copyUrl(state.bgResultUrl);
  });
  $('#bgFullscreen').addEventListener('click', () => {
    if (state.bgResultUrl) openModal(state.bgResultUrl);
  });

  // History
  $('#clearHistory').addEventListener('click', clearHistory);

  // Modal
  $('#modalClose').addEventListener('click', closeModal);
  $('#modalOverlay').addEventListener('click', (e) => {
    if (e.target === $('#modalOverlay')) closeModal();
  });
  $('#modalDownload').addEventListener('click', () => {
    if (modalDownloadUrl) downloadImage(modalDownloadUrl, 'monpix-preview.png');
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // Drag drop
  initDragDrop('upscaleDropZone', upscaleWidget, (url) => {
    state.upscaleUrl = url;
    showUpscalePreview(url);
    $('#upscaleBtn').disabled = false;
    toast('Image ready to upscale!', 'success');
  });

  initDragDrop('bgDropZone', bgWidget, (url) => {
    state.bgUrl = url;
    showBgPreview(url);
    $('#bgBtn').disabled = false;
    toast('Image ready for BG removal!', 'success');
  });

  // Keyboard accessibility for upload zones
  ['upscaleDropZone', 'bgDropZone'].forEach((id) => {
    const zone = $(`#${id}`);
    zone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        zone.click();
      }
    });
  });
}

/* ═══════════════════════════════════════════
   INIT
═══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // Theme
  initTheme();

  // Page enter animation
  pageEnter();

  // Count
  updateCountUI();

  // Slider label
  initSlider();

  // Uploadcare
  const widgets = initUploadcare();

  // Events
  bindEvents(widgets);

  // Before/After Sliders
  initBASlider('upscaleSlider', 'upscaleHandle', 'upscaleAfterWrap');
  initBASlider('bgSlider', 'bgHandle', 'bgAfterWrap');

  // History
  renderHistory();

  // Navbar scroll
  initNavbarScroll();

  // Scroll reveal
  initScrollReveal();

  // PWA
  initPWA();

  console.log('%cMonPix ✦ AI Image Tools', 'color:#7c3aed;font-size:18px;font-weight:bold;');
  console.log('%cBuilt with precision. Powered by AI.', 'color:#06b6d4;');
});

/* Make these globally accessible for history item buttons */
window.openModal = openModal;
window.downloadImage = downloadImage;
