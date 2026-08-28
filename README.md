<div align="center">
  <h1>🌌 Aurora VidGrab</h1>
  <p><strong>Universal video & audio downloader with a premium dark UI.</strong></p>

  <p>
    <a href="https://github.com/SailikNanda/Aurora-Vidgrab/stargazers"><img src="https://img.shields.io/github/stars/SailikNanda/Aurora-Vidgrab?style=for-the-badge&color=5e6ad2&logo=github" alt="Stars"></a>
    <a href="https://github.com/SailikNanda/Aurora-Vidgrab/issues"><img src="https://img.shields.io/github/issues/SailikNanda/Aurora-Vidgrab?style=for-the-badge&color=7170ff" alt="Issues"></a>
    <a href="https://github.com/SailikNanda/Aurora-Vidgrab/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-828fff?style=for-the-badge" alt="License"></a>
  </p>

  <p>Paste any link — YouTube, Instagram, TikTok, X (Twitter), Facebook, Reddit and <strong>1750+ more sites</strong> (everything yt-dlp supports) — and grab it as <strong>MP4 video</strong> or <strong>MP3 audio</strong>, right in the browser.</p>
</div>

---

## ✨ Features

- 🌍 **Universal**: video/audio from any site yt-dlp supports (1750+ extractors)
- ⚙️ **Video quality picker**: 480p / 720p / 1080p / Best
- 🎵 **Audio mode**: converts to MP3 via ffmpeg (with quality 0/VBR)
- 🚀 **Live progress**: real-time percentage and smart concurrent batch downloading
- 📺 **In-page preview** of the finished video
- 📂 **Open folder** & **clear downloads** helpers
- 🎨 **Animated Aurora Glass UI** — rotating aurora borders, shine sweeps, spring pops, pure SVG icons

---

## 🖥️ Supported Platforms

Aurora VidGrab runs perfectly across all major operating systems.

<p align="center">
  <img src="https://img.shields.io/badge/Windows-0078D6?style=for-the-badge&logo=windows&logoColor=white" alt="Windows" />
  <img src="https://img.shields.io/badge/macOS-000000?style=for-the-badge&logo=apple&logoColor=white" alt="macOS" />
  <img src="https://img.shields.io/badge/Linux-FCC624?style=for-the-badge&logo=linux&logoColor=black" alt="Linux" />
</p>

## 📦 Requirements & Installation

You will need **Node.js (≥ 18)**, **Python (≥ 3.8)**, and **ffmpeg**. Choose your platform below for easy installation instructions:

### <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/windows8/windows8-original.svg" height="24" align="absmiddle" /> Windows

1. Install [Node.js](https://nodejs.org/) (LTS version)
2. Install [Python](https://www.python.org/downloads/) (Make sure to check *"Add Python to PATH"* during install)
3. Install ffmpeg (e.g., open terminal and run `winget install ffmpeg` or via [chocolatey](https://chocolatey.org): `choco install ffmpeg`)
4. Install yt-dlp: `pip install yt-dlp`

### <img src="https://upload.wikimedia.org/wikipedia/commons/3/31/Apple_logo_white.svg" height="24" align="absmiddle" /> macOS
*The easiest way is via [Homebrew](https://brew.sh).*

```bash
# Install Node.js, Python, and ffmpeg
brew install node python ffmpeg

# Install yt-dlp
pip3 install yt-dlp
```
*(If you don't use Homebrew, you can manually download [Node.js](https://nodejs.org/) and [Python](https://www.python.org/downloads/) from their official websites).*

### <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/linux/linux-original.svg" height="24" align="absmiddle" /> Linux (Debian/Ubuntu)

```bash
sudo apt update
# Install Node.js, npm, Python, and ffmpeg
sudo apt install nodejs npm python3 python3-pip ffmpeg

# Install yt-dlp
pip3 install --user yt-dlp
```

---

## 🚀 Quick Start

Once you have the requirements installed, run these commands in your terminal:

```bash
git clone https://github.com/SailikNanda/Aurora-Vidgrab.git
cd Aurora-Vidgrab
npm install
npm start
```
Now, open [http://localhost:4000](http://localhost:4000) in your browser! 🎉

### Configuration (env vars)

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `4000` | HTTP port |
| `YTDLP_PY` | `python` / `python3` | Python interpreter that has the `yt_dlp` module |
| `YTDLP_EXE` | *(empty)* | Use a yt-dlp executable directly (e.g. `yt-dlp.exe`) instead of `python -m yt_dlp` |

---

## 🔌 API Documentation

| Endpoint | Method | Description |
|---|---|---|
| `/api/download` | POST | `{ url, format: "video"\|"audio", quality: "480"\|"720"\|"1080"\|"best" }` → `{ id }` |
| `/api/status/:id` | GET | Returns `{ status, percent, title, file, sizeMb, error }` |
| `/api/file/:name` | GET | Download the finished file directly |
| `/api/open` | GET | Open the download folder in the OS file manager (Explorer / Finder / xdg-open) |
| `/api/clean` | POST | Delete all downloaded files |

---

## ⭐️ Show your support

If you like this project, please consider giving it a **Star** ⭐️ on GitHub to show your support! It helps the project grow and reach more developers.

## 🗺️ Roadmap

- [ ] Cookies support (`--cookies-from-browser`) for private/age-restricted content
- [ ] Format picker (resolution/size preview before download)
- [ ] Download history & library page
- [ ] Telegram bot bridge
- [ ] AI assistant mode (natural-language "download this song" with voice)

## ⚠️ Legal Notice

This tool is for **personal and educational use**. Downloading media may violate the terms of service of some platforms or copyright law in your jurisdiction. You are responsible for how you use it. The project does not host any media — downloads happen peer-to-peer from the platform's own servers via yt-dlp.

## 📄 License

[MIT](LICENSE) © Sailik Nanda