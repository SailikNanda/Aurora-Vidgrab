<div align="center">
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original.svg" alt="Node.js" width="55" />
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/python/python-original.svg" alt="Python" width="55" />
  
  <br />
  
  <h1>🌌 Aurora VidGrab</h1>
  <p><strong>Premium Universal Video & Audio Downloader</strong></p>

  <p>
    <a href="https://github.com/SailikNanda/Aurora-Vidgrab/stargazers"><img src="https://img.shields.io/github/stars/SailikNanda/Aurora-Vidgrab?style=for-the-badge&color=5e6ad2&logo=github&label=Stars" alt="Stars"></a>
    <a href="https://github.com/SailikNanda/Aurora-Vidgrab/network/members"><img src="https://img.shields.io/github/forks/SailikNanda/Aurora-Vidgrab?style=for-the-badge&color=7170ff&logo=github" alt="Forks"></a>
    <a href="https://github.com/SailikNanda/Aurora-Vidgrab/issues"><img src="https://img.shields.io/github/issues/SailikNanda/Aurora-Vidgrab?style=for-the-badge&color=828fff&logo=github" alt="Issues"></a>
    <a href="https://github.com/SailikNanda/Aurora-Vidgrab/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-10b981?style=for-the-badge&logo=opensourceinitiative&logoColor=white" alt="License"></a>
  </p>

  <p><em>Download media from <b>1750+ sites</b> including YouTube, Instagram, TikTok, and X, wrapped in a buttery-smooth Aurora Glass UI.</em></p>
</div>

<br />

> **Note:** If you find this project useful, please consider giving it a ⭐ **Star** on GitHub to show your support!

---

## 🚀 Why Aurora VidGrab?

Aurora VidGrab combines the raw power of **yt-dlp** and **ffmpeg** with a sleek, modern **Node.js** backend and a beautiful **Glassmorphism** frontend. No databases, no bloat—just paste a link and download.

<table>
<tr>
<td>

### 🎨 Premium UI
- **Aurora Glass:** Rotating borders, shine sweeps, spring pops.
- **Zero Emoji UI:** Pure, crisp SVG icons.
- **Responsive:** Works beautifully on mobile and desktop.
- **Live Preview:** Watch your downloaded video right in the browser.

</td>
<td>

### ⚡ Under the Hood
- **1750+ Sites:** YouTube, Instagram Reels, TikTok, Reddit, etc.
- **Smart Queueing:** Concurrent batch downloading without crashing.
- **Memory Safe:** Auto-cleanup of old jobs and files.
- **API First:** Pure JSON API, no messy HTML errors.

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/yt--dlp-FF0000?style=for-the-badge&logo=youtube&logoColor=white" />
  <img src="https://img.shields.io/badge/FFmpeg-007808?style=for-the-badge&logo=ffmpeg&logoColor=white" />
  <img src="https://img.shields.io/badge/Vanilla_JS-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" />
</p>

---

## 📦 Requirements & Installation

Aurora VidGrab runs perfectly across all major operating systems. You will need **Node.js (≥ 18)**, **Python (≥ 3.8)**, and **ffmpeg**. 

Choose your platform below:

<details>
<summary><h3><img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/windows8/windows8-original.svg" height="24" align="absmiddle" /> Windows Installation</h3></summary>

1. Install [Node.js](https://nodejs.org/) (LTS version)
2. Install [Python](https://www.python.org/downloads/) (Make sure to check *"Add Python to PATH"* during install)
3. Install ffmpeg (e.g., open terminal and run `winget install ffmpeg` or via [chocolatey](https://chocolatey.org): `choco install ffmpeg`)
4. Install yt-dlp: `pip install yt-dlp`

</details>

<details>
<summary><h3><img src="https://upload.wikimedia.org/wikipedia/commons/3/31/Apple_logo_white.svg" height="24" align="absmiddle" /> macOS Installation</h3></summary>

*The easiest way is via [Homebrew](https://brew.sh).*

```bash
# Install Node.js, Python, and ffmpeg
brew install node python ffmpeg

# Install yt-dlp
pip3 install yt-dlp
```
*(If you don't use Homebrew, you can manually download [Node.js](https://nodejs.org/) and [Python](https://www.python.org/downloads/) from their official websites).*

</details>

<details>
<summary><h3><img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/linux/linux-original.svg" height="24" align="absmiddle" /> Linux (Debian/Ubuntu) Installation</h3></summary>

```bash
sudo apt update
# Install Node.js, npm, Python, and ffmpeg
sudo apt install nodejs npm python3 python3-pip ffmpeg

# Install yt-dlp
pip3 install --user yt-dlp
```
</details>

---

## 💻 Running the App

Once you have the requirements installed, setting up the server takes seconds:

```bash
# 1. Clone the repository
git clone https://github.com/SailikNanda/Aurora-Vidgrab.git

# 2. Enter the directory
cd Aurora-Vidgrab

# 3. Install dependencies
npm install

# 4. Start the server
npm start
```
🎉 **Boom!** Open [http://localhost:4000](http://localhost:4000) in your browser and start downloading!

---

## 🔌 API Endpoints

Building your own frontend? Use our clean JSON API.

<details>
<summary><strong>View API Documentation</strong></summary>

<br/>

| Endpoint | Method | Description |
|---|---|---|
| `/api/download` | POST | Body: `{ url, format: "video"\|"audio", quality: "480"\|"720"\|"1080"\|"best" }`. Returns Job ID. |
| `/api/batch` | POST | Body: `{ urls: ["url1", "url2"], ... }`. Submits multiple jobs at once. |
| `/api/status/:id` | GET | Returns live progress: `{ status, percent, title, file, sizeMb, error }` |
| `/api/file/:name` | GET | Directly stream or download the finished media file |
| `/api/open` | GET | Opens the native OS file explorer to the downloads folder |
| `/api/clean` | POST | Instantly deletes all downloaded files from the server disk |

</details>

---

## 🗺️ Roadmap

- [ ] Cookies support (`--cookies-from-browser`) for private/age-restricted content
- [ ] Format picker (resolution/size preview before download)
- [ ] Download history & library page
- [ ] Telegram bot bridge
- [ ] AI assistant mode (natural-language "download this song" with voice)

---

## ⚠️ Legal Notice

This tool is for **personal and educational use**. Downloading media may violate the terms of service of some platforms or copyright law in your jurisdiction. You are responsible for how you use it. The project does not host any media — downloads happen peer-to-peer from the platform's own servers via `yt-dlp`.

---
<div align="center">
  <p>Built with ❤️ by <b>Sailik Nanda</b></p>
  <p>Distributed under the <a href="LICENSE">MIT License</a>.</p>
</div>