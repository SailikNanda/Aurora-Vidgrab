const $ = (id) => document.getElementById(id);

const urlInput = $('url'), grabBtn = $('grab'), progressWrap = $('progressWrap');
const pBar = $('pBar'), pText = $('pText'), pPct = $('pPct');
const result = $('result'), errBox = $('errBox');
const resTitle = $('resTitle'), resMeta = $('resMeta');
const dlBtn = $('dlBtn'), vid = $('vid'), resPreview = $('resPreview');
const formatSeg = $('formatSeg'), quality = $('quality');
const spinner = grabBtn.querySelector('.btn-spinner'), label = grabBtn.querySelector('.btn-label');

let format = 'video';
let pollTimer = null;
let currentFile = null;

formatSeg.querySelectorAll('.seg-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    formatSeg.querySelectorAll('.seg-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    format = btn.dataset.format;
    quality.disabled = format === 'audio';
    if (format === 'audio') quality.value = '1080';
  });
});

async function fetchJSON(url, opts) {
  const r = await fetch(url, opts);
  const j = await r.json();
  if (!r.ok) throw new Error(j.error || 'Request failed');
  return j;
}

grabBtn.addEventListener('click', async () => {
  const url = urlInput.value.trim();
  if (!url) { urlInput.focus(); showErr('First paste a link'); return; }
  if (!/^https?:\/\//i.test(url)) { showErr('Link must start with http:// or https://'); return; }

  hideErr(); result.classList.add('hidden'); resPreview.classList.add('hidden');
  currentFile = null;
  setBusy(true);
  progressWrap.classList.remove('hidden');
  pBar.style.width = '0%'; pPct.textContent = '0%'; pText.textContent = 'Connecting…';

  try {
    const { id } = await fetchJSON('/api/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, format, quality: quality.value })
    });
    poll(id);
  } catch (e) {
    setBusy(false); showErr(e.message);
  }
});

function poll(id) {
  clearInterval(pollTimer);
  pollTimer = setInterval(async () => {
    try {
      const j = await fetchJSON('/api/status/' + id);
      if (j.percent !== undefined) {
        pBar.style.width = j.percent + '%';
        pPct.textContent = Math.round(j.percent) + '%';
      }
      if (j.title) pText.textContent = j.title.slice(0, 60);

      if (j.status === 'done') {
        clearInterval(pollTimer);
        setBusy(false);
        progressWrap.classList.add('hidden');
        showResult(j);
      } else if (j.status === 'error') {
        clearInterval(pollTimer);
        setBusy(false);
        progressWrap.classList.add('hidden');
        showErr(j.error || 'Download failed. Try a different link.');
      }
    } catch (e) {
      // network/non-JSON reply — stop polling and tell the user instead of hanging forever
      clearInterval(pollTimer);
      setBusy(false);
      progressWrap.classList.add('hidden');
      showErr(e.message || 'Connection problem. Is the server running?');
    }
  }, 900);
}

function showResult(j) {
  const fname = encodeURIComponent(j.file);
  resTitle.textContent = j.title || j.file;
  const kb = j.format === 'audio' ? 'MP3 audio' : 'MP4 video';
  resMeta.textContent = (j.sizeMb ? j.sizeMb + ' MB · ' : '') + kb;
  const badge = $('resBadge');
  if (badge) badge.classList.add('show');
  dlBtn.href = '/api/file/' + fname + '?dl=1';
  dlBtn.setAttribute('download', j.file);
  currentFile = j.file;
  result.classList.remove('hidden');

  if (j.format === 'video') {
    vid.src = '/downloads/' + fname;
    vid.load();
    resPreview.classList.remove('hidden');
  }
}

function setBusy(b) {
  grabBtn.disabled = b;
  spinner.classList.toggle('hidden', !b);
  label.textContent = b ? 'Downloading…' : 'Download';
  const ico = grabBtn.querySelector('.btn-ico');
  if (ico) ico.classList.toggle('downloading', b);
}

function showErr(msg) {
  $('errMsg').textContent = msg;
  errBox.classList.remove('hidden');
}
function hideErr() { errBox.classList.add('hidden'); }

$('openBtn').addEventListener('click', () => fetch('/api/open').catch(() => {}));
$('cleanBtn').addEventListener('click', async () => {
  if (!confirm('Delete all downloaded files from the server?')) return;
  try {
    const j = await fetchJSON('/api/clean', { method: 'POST' });
    alert('Removed ' + j.removed + ' file(s)');
  } catch (e) { showErr(e.message); }
});

urlInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') grabBtn.click(); });