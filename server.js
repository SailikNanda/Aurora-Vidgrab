const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const readline = require('readline');

const PORT = process.env.PORT || 4000;
const APP = path.join(__dirname, 'public');
const DL_DIR = path.join(__dirname, 'downloads');

// yt-dlp lookup order:
//   1. YTDLP_EXE - direct path to a yt-dlp executable
//   2. YTDLP_PY  - python interpreter that has the yt_dlp module
//   3. fallback  - 'python' (Windows) / 'python3' (macOS/Linux) from PATH
const PY = process.env.YTDLP_PY || (process.platform === 'win32' ? 'python' : 'python3');
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

const jobs = new Map(); // id -> {status, percent, title, file, error, isAudio}

function newJob(url, options) {
  const id = crypto.randomBytes(6).toString('hex');
  const job = {
    id, url, status: 'queued', percent: 0, title: '', file: null, error: null,
    format: options.format === 'audio' ? 'audio' : 'video',
    quality: options.quality || '1080',
    createdAt: Date.now()
  };
  jobs.set(id, job);
  return job;
}

function runJob(job) {
  job.status = 'downloading';
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
    if (job.file && fs.existsSync(path.join(DL_DIR, job.file))) {
      job.percent = 100;
      job.status = 'done';
      if (!job.title) job.title = path.basename(job.file, path.extname(job.file));
    } else {
      job.status = 'error';
      if (!job.error) job.error = job.error || `Download failed (exit ${code}). Try another link.`;
    }
  });
}

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
  runJob(job);
  res.json({ id: job.id });
});

app.get('/api/status/:id', (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found — the server may have restarted. Press Download again.' });
  let sizeMb = null;
  if (job.file) {
    try { sizeMb = Math.round((fs.statSync(path.join(DL_DIR, job.file)).size / 1048576) * 10) / 10; } catch {}
  }
  res.json({
    id: job.id, status: job.status, percent: job.percent, title: job.title,
    file: job.file, format: job.format, error: job.error, sizeMb
  });
});

app.get('/api/file/:name', (req, res) => {
  const name = path.basename(req.params.name);
  const p = path.join(DL_DIR, name);
  if (!fs.existsSync(p)) return res.status(404).send('File not found');
  res.download(p, name);
});

app.get('/api/open', (_req, res) => {
  spawn('explorer.exe', [DL_DIR], { windowsHide: true });
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