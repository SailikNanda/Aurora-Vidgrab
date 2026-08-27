
# 🌌 Aurora VidGrab

**Universal video & audio downloader with a premium dark UI.**
Paste any link — YouTube, Instagram, TikTok, X (Twitter), Facebook, Reddit and **1750+ more sites** (everything [yt-dlp](https://github.com/yt-dlp/yt-dlp) supports) — and grab it as **MP4 video** or **MP3 audio**.

Built with **Node.js + Express + yt-dlp + ffmpeg**, wrapped in a glassmorphic **Aurora Glass** UI with buttery animations and zero emoji — pure SVG icons.

![Aurora VidGrab](https://img.shields.io/badge/status-ready-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## ✨ Features

- **Universal**: video/audio from any site yt-dlp supports (1750+ extractors)
- **Video quality picker**: 480p / 720p / 1080p / Best
- **Audio mode**: converts to **MP3** via ffmpeg (with quality 0/VBR)
- **Live progress**: real-time percentage from the yt-dlp process
- **In-page preview** of the finished video
- **Open folder** & **clear downloads** helpers (cross-platform)
- **JSON-only API** — no surprise HTML errors
- **Animated Aurora Glass UI** — rotating aurora borders, shine sweeps, spring pops, SVG draw-in checkmark, `prefers-reduced-motion` respected
- **Cross-platform**: Works on macOS, Windows, and Linux
- Background-safe: downloading continues server-side even if you close the tab

## 🧰 Tech Stack

| Layer | Tech |
|---|---|
| Backend | Node.js, Express |
| Download engine | yt-dlp (Python) |
| Media processing | ffmpeg |
| Frontend | Vanilla JS + CSS (no framework, no build step) |

## 📦 Requirements

- **Node.js** ≥ 18
- **Python** ≥ 3.8 with `yt-dlp`
- **ffmpeg** on PATH (for MP3 conversion / format merging)

---

## 🚀 Quick Start

### Windows

```bash
git clone https://github.com/SailikNanda/aurora-vidgrab.git
cd aurora-vidgrab
npm install
```

**Install Python & Dependencies:**
1. Download Python 3.10+ from [python.org](https://www.python.org/downloads/windows/)
   - ✅ Check "Add Python to PATH" during installation
2. Install yt-dlp:
   ```bash
   pip install yt-dlp
   ```
3. Download & install ffmpeg from [ffmpeg.org](https://ffmpeg.org/download.html)
   - Add ffmpeg to PATH or use `setx YTDLP_PY "C:\Path\To\python.exe"`

**Start the server:**
```bash
npm start
# open http://localhost:4000
```

### macOS

```bash
git clone https://github.com/SailikNanda/aurora-vidgrab.git
cd aurora-vidgrab
npm install
```

**Install Python & Dependencies using Homebrew:**
```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Python 3 and ffmpeg
brew install python3 ffmpeg

# Install yt-dlp
pip3 install yt-dlp

# Verify installations
python3 --version
ffmpeg -version
yt-dlp --version
```

**Start the server:**
```bash
npm start
# open http://localhost:4000
```

**Note for M1/M2/M3 Macs:** The app auto-detects Homebrew installations at `/opt/homebrew/bin/python3`. No additional configuration needed!

### Linux

```bash
git clone https://github.com/SailikNanda/aurora-vidgrab.git
cd aurora-vidgrab
npm install
```

**Install Python & Dependencies (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install python3 python3-pip ffmpeg

# Install yt-dlp
pip3 install yt-dlp

# Verify installations
python3 --version
ffmpeg -version
yt-dlp --version
```

**Start the server:**
```bash
npm start
# open http://localhost:4000
```

---

## 🔧 Configuration (Environment Variables)

| Variable | Default | Purpose | Example |
|---|---|---|---|
| `PORT` | `4000` | HTTP port | `PORT=8080 npm start` |
| `YTDLP_PY` | Auto-detected | Python interpreter path | `YTDLP_PY=/usr/bin/python3 npm start` |
| `YTDLP_EXE` | *(empty)* | Direct yt-dlp executable (skips Python) | `YTDLP_EXE=/usr/local/bin/yt-dlp npm start` |

**Windows Example** — Custom Python path:
```batch
set YTDLP_PY=C:\Users\YourName\AppData\Local\Programs\Python\Python311\python.exe
npm start
```

**macOS Example** — Custom Python path:
```bash
export YTDLP_PY=/opt/homebrew/bin/python3
npm start
```

---

## 🌐 API Reference

| Endpoint | Method | Description | Payload |
|---|---|---|---|
| `/api/download` | POST | Start a single download | `{ url, format: "video"\|"audio", quality: "480"\|"720"\|"1080"\|"best" }` → `{ id }` |
| `/api/status/:id` | GET | Check download progress | Returns `{ status, percent, title, file, sizeMb, error }` |
| `/api/file/:name` | GET | Download the finished file | Returns the file binary |
| `/api/batch` | POST | Download multiple videos | `{ urls: [url1, url2, ...], format, quality }` → `{ batchId, total }` |
| `/api/batch/:batchId` | GET | Check batch progress | Returns all job statuses |
| `/api/open` | GET | Open downloads folder | Works on macOS (Finder), Windows (Explorer), Linux (file manager) |
| `/api/clean` | POST | Delete all downloads | Returns `{ removed: N }` |

---

## 📋 Troubleshooting

### "yt-dlp not found" Error
- **Windows**: Ensure Python is in PATH or set `YTDLP_PY` env var
- **macOS**: Run `brew install python3` then `pip3 install yt-dlp`
- **Linux**: Run `sudo apt install python3-pip` then `pip3 install yt-dlp`

### "ffmpeg not found" Error
- **Windows**: Download from [ffmpeg.org](https://ffmpeg.org/download.html), add to PATH
- **macOS**: Run `brew install ffmpeg`
- **Linux**: Run `sudo apt install ffmpeg`

### Python Not Detected on macOS M1/M2/M3
The app checks these paths automatically:
- `/opt/homebrew/bin/python3` (Homebrew on Apple Silicon)
- `/usr/local/bin/python3` (Homebrew on Intel)
- `/usr/bin/python3` (System Python)

If still not detected, set manually:
```bash
export YTDLP_PY=$(which python3)
npm start
```

### Port Already in Use
```bash
PORT=8080 npm start
```

---

## 🗺️ Roadmap

- [ ] Cookies support (`--cookies-from-browser`) for private/age-restricted content
- [ ] Playlist & batch downloads (in progress)
- [ ] Format picker (resolution/size preview before download)
- [ ] Download history & library page
- [ ] Telegram bot bridge
- [ ] AI assistant mode (natural-language "download this song" with voice)
- [ ] Native desktop app (Electron) for macOS & Windows

## ⚠️ Legal Notice

This tool is for **personal and educational use**. Downloading media may violate the terms of service of some platforms or copyright law in your jurisdiction. You are responsible for how you use it.

## 📄 License

[MIT](LICENSE) © Sailik Nanda
