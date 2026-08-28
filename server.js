const express = require('express');
const { spawn, execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');
const readline = require('readline');

const PORT = process.env.PORT || 4000;
const APP = path.join(__dirname, 'public');
const DL_DIR = path.join(__dirname, 'downloads');

// yt-dlp lookup order:
//   1. YTDLP_EXE            - direct path to a yt-dlp executable (skips python probe)
//   2. YTDLP_PY             - python interpreter that has the yt_dlp module
//   3. common installs      - auto-probed Windows python installs (Python310/311/312…)
//   4. fallback             - 'python' (Windows) / 'python3' (macOS/Linux) from PATH
function findYtDlpPython() {
  const winPythons = Array.from({ length: 5 }, (_, i) => 14 - i) // 314..310
    .map((v) => path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'Python', `Python3${v}`, 'python.exe'));
  const candidates = [
    process.env.YTDLP_PY,
    ...(process.platform === 'win32' ? winPythons : ['python3']),
    'python'
  ].filter(Boolean);
  for (const c of candidates) {
    try { execFileSync(c, ['-c', 'import yt_dlp'], { stdio: 'pipe', windowsHide: true }); return c; } catch {}
  }
  return process.platform === 'win32' ? 'python' : 'python3';
}
const PY = findYtDlpPython();
const YTDLP_EXE = process.env.YTDLP_EXE || null;

if (!fs.existsSync(DL_DIR)) fs.mkdirSync(DL_DIR, { recursive: true });

const app = express();
app.use(express.json());
app.use(express.static(APP));
app.use('/downloads', express.static(DL_DIR, { fallthrough: true }));

// API routes always return JSON — never HTML error pages
app.use('/api', (req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

const jobs = new Map(); // id -> {status, percent, title, file, error}
let activeDownloads = 0;
const MAX_CONCURRENT = 3;

// Clean up old jobs to prevent memory leak (keep jobs for 24 hours)
setInterval(() => {
  const now = Date.now();
  for (const [id, job] of jobs.entries()) {
    if ((job.status === 'done' || job.status === 'error') && (now - job.createdAt > 24 * 60 * 60 * 1000)) {
      jobs.delete(id);
    }
  }
}, 60 * 60 * 1000); // Check every hour

function newJob(url, options, title) {
  const id = crypto.randomBytes(6).toString('hex');
  const job = {
    id, url, status: 'queued', percent: 0, title: title || '', file: null, error: null,
    format: options.format === 'audio' ? 'audio' : 'video',
    quality: options.quality || '1080',
    batchId: options.batchId || null,
    createdAt: Date.now()
  };
  jobs.set(id, job);
  return job;
}

function sizeMbOf(job) {
  if (!job.file) return null;
  try { return Math.round((fs.statSync(path.join(DL_DIR, job.file)).size / 1048576) * 10) / 10; } catch { return null; }
}

function runNextJob() {
  if (activeDownloads >= MAX_CONCURRENT) return;
  for (const job of jobs.values()) {
    if (job.status === 'queued') {
      runJob(job);
      if (activeDownloads >= MAX_CONCURRENT) break;
    }
  }
}

function runJob(job) {
  job.status = 'downloading';
  activeDownloads++;

  const finish = () => {
    activeDownloads--;
    runNextJob();
  };

  // forward slashes: backslash paths get mangled by yt-dlp template escaping on Windows
  const outTemplate = DL_DIR.replace(/\\/g, '/') + '/%(title).80s-%(id)s.%(ext)s';

  const baseArgs = ['--no-playlist', '--no-warnings', '--newline', '-o', outTemplate];
  const { cmd, args } = YTDLP_EXE
    ? { cmd: YTDLP_EXE, args: baseArgs }
    : { cmd: PY, args: ['-m', 'yt_dlp', ...baseArgs] };

  if (job.format === 'audio') {
    args.push('-x', '--audio-format', 'mp3', '--audio-quality', '0', '-f', 'bestaudio');
  } else {
    const res = job.quality === 'best' ? '' : `[height<=${parseInt(job.quality, 10) || 1080}]`;
    args.push('-f', `bv*${res}+ba/b${res}/b`, '-S', 'res:1080', '--merge-output-format', 'mp4');
  }
  args.push('--print', 'after_move:filepath', job.url);

  const child = spawn(cmd, args, { windowsHide: true });

  child.on('error', (err) => {
    job.status = 'error';
    if (!job.error) job.error = `Spawn error: ${err.message}. Is yt-dlp installed?`;
    finish();
  });

  const rl = readline.createInterface({ input: child.stdout });

  rl.on('line', (lineRaw) => {
    const line = lineRaw.toString();
    // progress:  [download]  12.3% of  12.5MiB at ...
    const m = line.match(/\[download\]\s+(\d+(?:\.\d+)?)%/);
    if (m) job.percent = Math.min(99, parseFloat(m[1]));
    // title
    const t = line.match(/\[info\]\s+([^:]+): Downloading/);
    if (t && !job.title) job.title = t[1];
    // final file path from --print after_move
    if (line.trim().endsWith('.mp4') || line.trim().endsWith('.mp3') || line.trim().endsWith('.m4a') || line.trim().endsWith('.webm') || line.trim().endsWith('.opus')) {
      const p = line.trim();
      if (fs.existsSync(p)) job.file = path.basename(p);
    }
  });

  child.stderr.on('data', (d) => {
    const s = d.toString();
    if (!job.error && /ERROR/i.test(s)) job.error = s.replace(/ERROR:\s*/i, '').split('\n')[0].slice(0, 300);
  });

  child.on('close', (code) => {
    if (job.status === 'error' && job.error && job.error.startsWith('Spawn error')) return; // already handled
    
    if (job.file && fs.existsSync(path.join(DL_DIR, job.file))) {
      job.percent = 100;
      job.status = 'done';
      if (!job.title) job.title = path.basename(job.file, path.extname(job.file)).replace(/-\w{11}$/, '');
    } else {
      job.status = 'error';
      if (!job.error) job.error = job.error || `Download failed (exit ${code}). Try another link.`;
    }
    finish();
  });
}

const MAX_PLAYLIST = 50; // videos per playlist
const MAX_TOTAL = 100;   // jobs per batch

// Expand a playlist URL to individual video URLs via yt-dlp flat-playlist JSON
function expandPlaylist(url) {
  return new Promise((resolve) => {
    const base = ['--flat-playlist', '--no-warnings', '-J', url];
    const { cmd, args } = YTDLP_EXE
      ? { cmd: YTDLP_EXE, args: base }
      : { cmd: PY, args: ['-m', 'yt_dlp', ...base] };
    const child = spawn(cmd, args, { windowsHide: true });
    let out = '';
    child.stdout.on('data', (d) => (out += d));
    child.on('error', () => resolve([]));
    child.on('close', () => {
      try {
        const j = JSON.parse(out);
        resolve((j.entries || []).slice(0, MAX_PLAYLIST).map((e) => {
          const u = e.url && /^https?:/i.test(e.url)
            ? e.url
            : e.id ? 'https://www.youtube.com/watch?v=' + e.id : null;
          return u ? { url: u, title: String(e.title || e.id || '').slice(0, 100) } : null;
        }).filter(Boolean));
      } catch { resolve([]); }
    });
    setTimeout(() => { try { child.kill(); } catch {} }, 30000);
  });
}

app.post('/api/batch', async (req, res) => {
  const raw = (Array.isArray(req.body.urls) ? req.body.urls : [])
    .map((u) => String(u || '').trim()).filter(Boolean);
  if (!raw.length) return res.status(400).json({ error: 'Paste at least one link' });
  const batchId = crypto.randomBytes(6).toString('hex');
  const jobsList = [];
  for (const u of raw) {
    try { const v = new URL(u); if (!/^https?:$/.test(v.protocol)) continue; } catch { continue; }
    let targets = [{ url: u, title: '' }];
    if (/[?&]list=/.test(u)) {
      targets = await expandPlaylist(u);
      if (!targets.length) continue; // unreadable / private / empty playlist
    }
    for (const t of targets) {
      if (jobsList.length >= MAX_TOTAL) break;
      jobsList.push(newJob(t.url, { ...req.body, batchId }, t.title));
      runNextJob();
    }
    if (jobsList.length >= MAX_TOTAL) break;
  }
  if (!jobsList.length) return res.status(400).json({ error: 'No downloadable links found. Private or empty playlists are not supported.' });
  res.json({ batchId, total: jobsList.length });
});

app.get('/api/batch/:batchId', (req, res) => {
  const items = [...jobs.values()].filter((j) => j.batchId === req.params.batchId);
  if (!items.length) return res.status(404).json({ error: 'Batch not found — the server may have restarted. Press Download again.' });
  const jobsOut = items.map((j) => ({
    id: j.id, status: j.status, percent: j.percent, title: j.title,
    file: j.file, format: j.format, error: j.error, sizeMb: sizeMbOf(j)
  }));
  res.json({
    batchId: req.params.batchId, total: jobsOut.length,
    done: jobsOut.every((j) => j.status === 'done' || j.status === 'error'),
    jobs: jobsOut
  });
});

app.post('/api/download', (req, res) => {
  const url = (req.body.url || '').trim();
  if (!url) return res.status(400).json({ error: 'URL required' });
  try {
    const u = new URL(url);
    if (!/^https?:$/.test(u.protocol)) throw new Error('bad protocol');
  } catch {
    return res.status(400).json({ error: 'Invalid URL. Paste a full link (https://...)' });
  }
  const job = newJob(url, req.body || {});
  runNextJob();
  res.json({ id: job.id });
});

app.get('/api/status/:id', (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found — the server may have restarted. Press Download again.' });
  res.json({
    id: job.id, status: job.status, percent: job.percent, title: job.title,
    file: job.file, format: job.format, error: job.error, sizeMb: sizeMbOf(job)
  });
});

app.get('/api/file/:name', (req, res) => {
  const name = path.basename(req.params.name);
  const p = path.join(DL_DIR, name);
  if (!fs.existsSync(p)) return res.status(404).send('File not found');
  res.download(p, name);
});

app.get('/api/open', (_req, res) => {
  // Cross-platform: open the download folder in the OS file manager
  //   - Windows: explorer
  //   - macOS:   open
  //   - Linux:   xdg-open
  const opener = process.platform === 'win32'
    ? 'explorer'
    : process.platform === 'darwin'
      ? 'open'
      : 'xdg-open';
  const child = spawn(opener, [DL_DIR], { windowsHide: true, stdio: 'ignore' });
  // Ignore spawn errors (e.g. missing opener) so the API still responds cleanly
  child.on('error', () => {});
  res.json({ ok: true });
});

app.get('/api/clean', (_req, res) => {
  let n = 0;
  fs.readdirSync(DL_DIR).forEach((f) => {
    const p = path.join(DL_DIR, f);
    if (fs.statSync(p).isFile()) { fs.unlinkSync(p); n++; }
  });
  res.json({ removed: n });
});

// JSON 404 for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// JSON error handler — never leak HTML errors
app.use((err, _req, res, _next) => {
  console.error('[server-err]', err.message);
  res.status(500).json({ error: err.message || 'Internal error' });
});

app.listen(PORT, () => console.log(`[Aurora VidGrab] running on http://localhost:${PORT}`));