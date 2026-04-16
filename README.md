# GatePass — Visitor Management System

Hi! The app will be running in under 5 minutes. Follow these steps:

---

## Step 1 — Install Node.js (skip if already installed)

Open **Terminal** (press `Cmd + Space`, type "Terminal", press Enter) and run:

```bash
node --version
```

- Shows **v18 or higher** → skip to Step 2
- Shows nothing / error → install Node.js:

**Option A — Official installer (easiest):**
Go to https://nodejs.org/en/download → click the **"LTS"** button → install → restart Terminal

**Option B — Homebrew (if you already use it):**
```bash
brew install node
```

---

## Step 2 — Run the app

### Option A — Using the script (recommended)

1. Open **Terminal**
2. Type `cd ` (with a space after cd), then **drag the project folder** from Finder into the Terminal window and press **Enter**
3. Run:
```bash
bash start.sh
```

The script will install packages on first run (~1 minute) and then open the app automatically at **http://localhost:5173**

---

### Option B — Manual (same result)

```bash
# In Terminal, inside the project folder:
npm install
npm run dev
```

Then open your browser at: **http://localhost:5173**

---

## Pages & roles

| URL | Who uses it |
|-----|-------------|
| `/` | Landing page — start here |
| `/visitor-form` | Visitors (no login needed) |
| `/visitor-qr` | QR code shown to visitor |
| `/register` | Create admin / owner / security account |
| `/login` | Sign in |
| `/security` | Security guard dashboard |
| `/owner` | House owner dashboard |
| `/admin` | Admin full access |

---

## Stopping the server

Press **Ctrl + C** in the Terminal window.

---

## Requirements

| Tool | Minimum version |
|------|----------------|
| Node.js | **18** or higher |
| npm | 9 or higher |
| Browser | Chrome / Safari / Firefox (latest) |

The database is already connected in the cloud — no extra setup needed.

---

## Troubleshooting

**`npm install` fails**
```bash
npm install --legacy-peer-deps
```

**Port 5173 already in use**
```bash
npm run dev -- --port 3000
```
Open http://localhost:3000

**"permission denied: start.sh"**
```bash
chmod +x start.sh && bash start.sh
```

**Blank white screen**
Open browser DevTools (`Cmd + Option + J`) → Console tab → read the error

**Camera not working on QR scanner**
Must be running on `localhost` — browsers block camera for plain http on remote URLs
