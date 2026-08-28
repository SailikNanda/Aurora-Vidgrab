const $ = (id) => document.getElementById(id);

const urlInput = $('url'), grabBtn = $('grab'), progressWrap = $('progressWrap');
const pBar = $('pBar'), pText = $('pText'), pPct = $('pPct');
const result = $('result'), errBox = $('errBox');
const resTitle = $('resTitle'), resMeta = $('resMeta');
const dlBtn = $('dlBtn'), vid = $('vid'), resPreview = $('resPreview');
const formatSeg = $('formatSeg'), quality = $('quality');
const spinner = grabBtn.querySelector('.btn-spinner'), label = grabBtn.querySelector('.btn-label');
const batchWrap = $('batchWrap'), batchList = $('batchList');
const batchOverall = $('batchOverall'), batchCount = $('batchCount');
const batchResult = $('batchResult'), batchFiles = $('batchFiles'), batchResMeta = $('batchResMeta');

let format = 'video';
let pollTimer = null, batchTimer = null;

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

function parseUrls() {
  return urlInput.value.split(/[\n,]+/).map((s) => s.trim()).filter((s) => /^https?:\/\//i.test(s));
}

const isPlaylist = (u) => /[?&]list=/.test(u);

grabBtn.addEventListener('click', async () => {
  const urls = parseUrls();
  if (!urls.length) { urlInput.focus(); showErr('Paste a link first'); return; }

  hideErr();
  result.classList.add('hidden'); resPreview.classList.add('hidden');
  batchResult.classList.add('hidden');

  if (urls.length === 1 && !isPlaylist(urls[0])) runSingle(urls[0]);
  else runBatch(urls);
});

/* ---------- single download ---------- */
async function runSingle(url) {
  setBusy(true);
  batchWrap.classList.add('hidden');
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
}

function poll(id) {
  clearTimeout(pollTimer);
  const doPoll = async () => {
    try {
      const j = await fetchJSON('/api/status/' + id);
      if (j.percent !== undefined) {
        pBar.style.width = j.percent + '%';
        pPct.textContent = Math.round(j.percent) + '%';
      }
      if (j.title) pText.textContent = j.title.slice(0, 60);

      if (j.status === 'done') {
        setBusy(false);
        progressWrap.classList.add('hidden');
        showResult(j);
      } else if (j.status === 'error') {
        setBusy(false);
        progressWrap.classList.add('hidden');
        showErr(j.error || 'Download failed. Try a different link.');
      } else {
        pollTimer = setTimeout(doPoll, 900);
      }
    } catch (e) {
      setBusy(false);
      progressWrap.classList.add('hidden');
      showErr(e.message || 'Connection problem. Is the server running?');
    }
  };
  pollTimer = setTimeout(doPoll, 900);
}

/* ---------- batch download ---------- */
function batchRow(i) {
  const row = document.createElement('div');
  row.className = 'b-row';

  const head = document.createElement('div');
  head.className = 'b-head';
  const name = document.createElement('span');
  name.className = 'b-name';
  name.textContent = 'Video ' + (i + 1) + ' — preparing…';
  const pct = document.createElement('span');
  pct.className = 'b-pct';
  pct.textContent = '0%';
  head.append(name, pct);

  const bar = document.createElement('div');
  bar.className = 'bar b-bar';
  const fill = document.createElement('div');
  fill.className = 'bar-fill b-bar-fill';
  bar.appendChild(fill);

  const errMsg = document.createElement('div');
  errMsg.className = 'b-err-msg';

  row.append(head, bar, errMsg);
  return row;
}

async function runBatch(urls) {
  setBusy(true);
  progressWrap.classList.add('hidden');
  batchWrap.classList.remove('hidden');
  batchList.innerHTML = '';
  urls.forEach((_, i) => batchList.appendChild(batchRow(i)));
  batchOverall.textContent = 'Preparing batch…';
  batchCount.textContent = '0/' + urls.length;

  try {
    const { batchId, total } = await fetchJSON('/api/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls, format, quality: quality.value })
    });
    if (total < urls.length) batchCount.textContent = '0/' + total;
    pollBatch(batchId, total);
  } catch (e) {
    setBusy(false);
    batchWrap.classList.add('hidden');
    showErr(e.message);
  }
}

function pollBatch(id, total) {
  clearTimeout(batchTimer);
  const doPoll = async () => {
    let j;
    try {
      j = await fetchJSON('/api/batch/' + id);
    } catch (e) {
      setBusy(false);
      batchWrap.classList.add('hidden');
      showErr(e.message);
      return;
    }

    let okN = 0, errN = 0;
    j.jobs.forEach((job, i) => {
      let row = batchList.children[i];
      if (!row) { row = batchRow(i); batchList.appendChild(row); }
      const fill = row.querySelector('.b-bar-fill');
      const pct = row.querySelector('.b-pct');
      const name = row.querySelector('.b-name');
      const errMsg = row.querySelector('.b-err-msg');

      if (job.status === 'done') {
        okN++;
        row.classList.add('b-done');
        pct.textContent = '\u2713';
        if (!row.dataset.sized) {
          name.textContent = (job.title || 'Video ' + (i + 1)) + '  \u00b7  ' + (job.sizeMb || '?') + ' MB';
          row.dataset.sized = '1';
        }
        errMsg.textContent = '';
      } else if (job.status === 'error') {
        errN++;
        row.classList.add('b-err');
        pct.textContent = '\u00d7';
        errMsg.textContent = job.error || 'Failed';
      } else {
        row.classList.remove('b-done', 'b-err');
        fill.style.width = Math.min(100, job.percent || 0) + '%';
        pct.textContent = Math.round(job.percent || 0) + '%';
        if (job.title) name.textContent = job.title.slice(0, 70);
        errMsg.textContent = '';
      }
    });

    const doneN = okN + errN;
    batchCount.textContent = doneN + '/' + j.total;
    batchOverall.textContent = j.done
      ? (errN ? 'Batch finished — ' + okN + ' saved, ' + errN + ' failed' : 'Batch complete')
      : 'Downloading… ' + (total ? Math.round((doneN / total) * 100) : 0) + '%';

    if (j.done) {
      setBusy(false);
      batchWrap.classList.add('hidden');
      if (okN) showBatchResult(j.jobs);
      if (errN && !okN) showErr('All downloads failed. Try different links.');
    } else {
      batchTimer = setTimeout(doPoll, 900);
    }
  };
  batchTimer = setTimeout(doPoll, 900);
}

function showBatchResult(jobs) {
  batchFiles.innerHTML = '';
  const ok = jobs.filter((j) => j.status === 'done');
  const totalMb = ok.reduce((a, j) => a + (j.sizeMb || 0), 0).toFixed(1);

  $('batchResTitle').textContent = ok.length + ' file' + (ok.length > 1 ? 's' : '') + ' saved';
  batchResMeta.textContent = (ok.length > 1 ? ok.length + ' files \u00b7 ' : '') + totalMb + ' MB total';

  ok.forEach((j) => {
    const row = document.createElement('div');
    row.className = 'b-file-row';

    const ico = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    ico.setAttribute('viewBox', '0 0 24 24');
    ico.setAttribute('fill', 'none');
    ico.setAttribute('stroke', 'currentColor');
    ico.setAttribute('stroke-width', '2');
    ico.setAttribute('stroke-linecap', 'round');
    ico.setAttribute('stroke-linejoin', 'round');
    ico.className = 'b-file-ico';
    const p1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p1.setAttribute('d', 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4');
    const p2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p2.setAttribute('d', 'M7 10l5 5 5-5');
    const p3 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p3.setAttribute('d', 'M12 15V3');
    ico.append(p1, p2, p3);
    row.appendChild(ico);

    const name = document.createElement('span');
    name.className = 'b-file-name';
    name.textContent = j.title || j.file;
    row.appendChild(name);

    const a = document.createElement('a');
    a.className = 'btn-primary small b-save';
    a.href = '/api/file/' + encodeURIComponent(j.file) + '?dl=1';
    a.setAttribute('download', j.file);
    a.textContent = 'Save';
    row.appendChild(a);

    batchFiles.appendChild(row);
  });

  batchResult.classList.remove('hidden');
}

/* ---------- shared ---------- */
function showResult(j) {
  const fname = encodeURIComponent(j.file);
  resTitle.textContent = j.title || j.file;
  const kb = j.format === 'audio' ? 'MP3 audio' : 'MP4 video';
  resMeta.textContent = (j.sizeMb ? j.sizeMb + ' MB \u00b7 ' : '') + kb;
  const badge = $('resBadge');
  if (badge) badge.classList.add('show');
  dlBtn.href = '/api/file/' + fname + '?dl=1';
  dlBtn.setAttribute('download', j.file);
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
  label.textContent = b ? 'Downloading\u2026' : 'Download';
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

/* paste button */
$('pasteBtn').addEventListener('click', async () => {
  try {
    const text = await navigator.clipboard.readText();
    if (text && /^https?:\/\//i.test(text.trim())) {
      urlInput.value = text.trim();
      hideErr();
    } else if (text) {
      showErr('Clipboard does not contain a valid URL');
    }
  } catch {
    showErr('Clipboard access denied — paste manually');
  }
});
$('pasteBtn').addEventListener('mouseenter', async () => {
  try {
    const text = await navigator.clipboard.readText();
    if (text && /^https?:\/\//i.test(text.trim())) $('pasteBtn').title = text.trim().slice(0, 60) + '\u2026';
  } catch { /* ok */ }
});