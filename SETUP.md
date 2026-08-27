# Platform Setup Guide

This document provides step-by-step instructions for setting up Aurora VidGrab on different operating systems.

---

## 📱 macOS Setup

### Prerequisites Check
```bash
# Check Node.js
node --version  # Should be >= 18

# Check if Homebrew is installed
brew --version
```

### Step 1: Install Homebrew (if not already installed)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### Step 2: Install Python 3 and ffmpeg
```bash
brew install python3 ffmpeg
```

### Step 3: Install yt-dlp
```bash
pip3 install yt-dlp
```

### Step 4: Clone and Setup Aurora VidGrab
```bash
git clone https://github.com/SailikNanda/aurora-vidgrab.git
cd aurora-vidgrab
npm install
```

### Step 5: Start the Server
```bash
npm start
# Server runs at http://localhost:4000
```

### ✅ Verification
```bash
python3 --version      # Python 3.8+
ffmpeg -version        # ffmpeg version
yt-dlp --version       # yt-dlp version
node --version         # Node.js 18+
```

### 🍎 Apple Silicon (M1/M2/M3) Note
The app automatically detects Homebrew installations at `/opt/homebrew/bin/python3`. No special configuration needed!

If you encounter issues, manually specify:
```bash
export YTDLP_PY=/opt/homebrew/bin/python3
npm start
```

---

## 🪟 Windows Setup

### Prerequisites Check
```bash
# Check Node.js (run in PowerShell or Command Prompt)
node --version  # Should be >= 18
```

### Step 1: Install Python
1. Download from [python.org](https://www.python.org/downloads/windows/) (3.10+ recommended)
2. **IMPORTANT**: Check "Add Python to PATH" during installation
3. Verify installation:
   ```bash
   python --version
   ```

### Step 2: Install yt-dlp
```bash
pip install yt-dlp
```

Verify:
```bash
yt-dlp --version
```

### Step 3: Install ffmpeg
1. Download from [ffmpeg.org/download.html](https://ffmpeg.org/download.html)
2. Extract to a folder (e.g., `C:\ffmpeg`)
3. Add to PATH:
   - Open "Environment Variables" (search in Start menu)
   - Click "Edit the system environment variables"
   - Click "Environment Variables..." button
   - Under "System variables", click "New"
   - Variable name: `PATH`
   - Variable value: `C:\ffmpeg\bin` (or your ffmpeg path)
   - Click OK

4. Verify in new Command Prompt:
   ```bash
   ffmpeg -version
   ```

### Step 4: Clone and Setup Aurora VidGrab
```bash
git clone https://github.com/SailikNanda/aurora-vidgrab.git
cd aurora-vidgrab
npm install
```

### Step 5: Start the Server
```bash
npm start
# Server runs at http://localhost:4000
```

### ⚠️ If Python Not Detected
Set the environment variable manually:
```bash
# In Command Prompt (temporary - just for this session)
set YTDLP_PY=C:\Users\YourName\AppData\Local\Programs\Python\Python311\python.exe
npm start

# Or permanently set in Environment Variables (like ffmpeg setup above)
```

---

## 🐧 Linux Setup (Ubuntu/Debian)

### Prerequisites Check
```bash
# Check Node.js
node --version  # Should be >= 18

# Update package manager
sudo apt update
```

### Step 1: Install Python 3 and ffmpeg
```bash
sudo apt install python3 python3-pip ffmpeg
```

### Step 2: Install yt-dlp
```bash
pip3 install yt-dlp
```

### Step 3: Clone and Setup Aurora VidGrab
```bash
git clone https://github.com/SailikNanda/aurora-vidgrab.git
cd aurora-vidgrab
npm install
```

### Step 4: Start the Server
```bash
npm start
# Server runs at http://localhost:4000
```

### ✅ Verification
```bash
python3 --version      # Python 3.8+
ffmpeg -version        # ffmpeg version
yt-dlp --version       # yt-dlp version
node --version         # Node.js 18+
```

### 🔧 Other Linux Distributions
**Fedora/RHEL:**
```bash
sudo dnf install python3 python3-pip ffmpeg
pip3 install yt-dlp
```

**Arch Linux:**
```bash
sudo pacman -S python python-pip ffmpeg
pip install yt-dlp
```

---

## 🆘 Troubleshooting

### ❌ "yt-dlp: command not found" or "No module named yt_dlp"

**macOS:**
```bash
pip3 install yt-dlp
export YTDLP_PY=$(which python3)
npm start
```

**Windows:**
```bash
pip install yt-dlp
set YTDLP_PY=C:\Users\YourName\AppData\Local\Programs\Python\Python311\python.exe
npm start
```

**Linux:**
```bash
pip3 install --user yt-dlp
export YTDLP_PY=/usr/bin/python3
npm start
```

---

### ❌ "ffmpeg: command not found"

**macOS:**
```bash
brew install ffmpeg
```

**Windows:**
- Re-download ffmpeg and add to PATH (see Windows setup Step 3)
- Or use this direct command:
  ```bash
  $env:PATH += ";C:\ffmpeg\bin"
  ```

**Linux:**
```bash
sudo apt install ffmpeg  # Ubuntu/Debian
sudo dnf install ffmpeg  # Fedora
sudo pacman -S ffmpeg    # Arch
```

---

### ❌ Port 4000 Already in Use

Change the port:
```bash
PORT=8080 npm start
# Now runs at http://localhost:8080
```

---

### ❌ "Cannot find module 'express'"

Reinstall Node dependencies:
```bash
rm -rf node_modules package-lock.json  # macOS/Linux
# Or: rmdir /s node_modules & del package-lock.json  (Windows)
npm install
npm start
```

---

### ❌ Downloads Folder Not Opening

This is platform-specific:
- **macOS**: Uses `open` command (should work with Homebrew setup)
- **Windows**: Uses `explorer.exe` (should be available by default)
- **Linux**: Uses `xdg-open` (may need `xdg-utils` package)

If not working on Linux:
```bash
sudo apt install xdg-utils
```

---

## 🔄 Environment Variables Reference

```bash
# macOS/Linux
export PORT=4000
export YTDLP_PY=/opt/homebrew/bin/python3
export YTDLP_EXE=/usr/local/bin/yt-dlp  # Optional: direct yt-dlp executable
npm start

# Windows (Command Prompt)
set PORT=4000
set YTDLP_PY=C:\Users\YourName\AppData\Local\Programs\Python\Python311\python.exe
set YTDLP_EXE=C:\path\to\yt-dlp.exe
npm start

# Windows (PowerShell)
$env:PORT=4000
$env:YTDLP_PY="C:\Users\YourName\AppData\Local\Programs\Python\Python311\python.exe"
npm start
```

---

## 📞 Getting Help

If you encounter issues:
1. Check the [GitHub Issues](https://github.com/SailikNanda/aurora-vidgrab/issues)
2. Verify all prerequisites are installed (use verification commands above)
3. Try setting `YTDLP_PY` manually (see environment variables section)
4. Check that ports aren't blocked by firewall

---

**Happy downloading! 🎉**
