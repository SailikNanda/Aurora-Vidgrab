# 🌌 Aurora VidGrab

**Universal video & audio downloader with a premium dark UI.**
Paste any link — YouTube, Instagram, TikTok, X (Twitter), Facebook, Reddit and **1750+ more sites** (everything [yt-dlp](https://github.com/yt-dlp/yt-dlp) supports) — and grab it as **MP4 video** or **MP3 audio**, right in the browser.

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
- **Open folder** & **clear downloads** helpers
- **JSON-only API** — no surprise HTML errors
- **Animated Aurora Glass UI** — rotating aurora borders, shine sweeps, spring pops, SVG draw-in checkmark, `prefers-reduced-motion` respected
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
- **Python** ≥ 3.8 with `yt-dlp`: `pip install yt-dlp`
- **ffmpeg** on PATH (for MP3 conversion / format merging)

## 🚀 Quick Start

```bash
git clone https://github.com/SailikNanda/aurora-vidgrab.git
cd aurora-vidgrab
npm install
npm start
# open http://localhost:4000
```

### Configuration (env vars)

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `4000` | HTTP port |
| `YTDLP_PY` | `python` / `python3` | Python interpreter that has the `yt_dlp` module |
| `YTDLP_EXE` | *(empty)* | Use a yt-dlp executable directly (e.g. `yt-dlp.exe`) instead of `python -m yt_dlp` |

Example — Windows with a specific Python:

```bat
set YTDLP_PY=C:\Path\To\python.exe
npm start
```

## 🔌 API

| Endpoint | Method | Description |
|---|---|---|
| `/api/download` | POST | `{ url, format: "video"\|"audio", quality: "480"\|"720"\|"1080"\|"best" }` → `{ id }` |
| `/api/status/:id` | GET | `{ status, percent, title, file, sizeMb, error }` |
| `/api/file/:name` | GET | Download the finished file |
| `/api/open` | GET | Open the download folder in Explorer/Finder |
| `/api/clean` | POST | Delete all downloaded files |

## 🗺️ Roadmap

- [ ] Cookies support (`--cookies-from-browser`) for private/age-restricted content
- [ ] Playlist & batch downloads
- [ ] Format picker (resolution/size preview before download)
- [ ] Download history & library page
- [ ] Telegram bot bridge
- [ ] AI assistant mode (natural-language "download this song" with voice)

## ⚠️ Legal Notice

This tool is for **personal and educational use**. Downloading media may violate the terms of service of some platforms or copyright law in your jurisdiction. You are responsible for how you use it. The project does not host any media — downloads happen peer-to-peer from the platform's own servers via yt-dlp.

## 📄 License

[MIT](LICENSE) © Sailik Nanda