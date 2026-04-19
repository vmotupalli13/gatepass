# GatePass — Visitor Management System

Full-stack gated community visitor management app.

**Stack:** React + Vite + Tailwind CSS (frontend) · Node.js + Express + Socket.io (backend) · MongoDB Atlas (database) · JWT (auth)

---

## Quick Start

### Step 1 — Install Node.js (skip if you already have v18+)

Open Terminal and check:
```bash
node --version
```
Need **v18 or higher**. Download from: https://nodejs.org/en/download → click **LTS**.

---

### Step 2 — Get a free MongoDB database (takes 3 minutes)

1. Go to **https://mongodb.com** → sign up free → click **"Try Atlas Free"**
2. Create a free **M0** cluster (pick any region, no credit card needed)
3. When asked, create a **database user** (username + password — save these)
4. Under **Network Access** → click **"Add IP Address"** → **"Allow access from anywhere"** → Confirm
5. Click **Connect** → **Drivers** → copy the connection string. It looks like:
   ```
   mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Add your database name to the URI (before the `?`):
   ```
   mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/gatepass?retryWrites=true&w=majority
   ```

---

### Step 3 — Configure the .env file

Open the `.env` file in this folder and replace the MongoDB line:
```
MONGODB_URI=paste_your_connection_string_here
```
Leave everything else as-is.

---

### Step 4 — Run the app

```bash
bash start.sh
```

This will:
- Install all packages on first run (~1 minute)
- Seed 12 houses into the database automatically
- Start the backend on **http://localhost:5000**
- Start the frontend on **http://localhost:5173** (opens in browser)

---

## Manual start (same result)

```bash
npm install
npm run seed     # run once to add houses to DB
npm run dev      # starts both frontend + backend together
```

---

## Pages & Roles

| URL | Who uses it |
|-----|-------------|
| `/` | Landing page |
| `/visitor-form` | Visitors — no login needed |
| `/visitor-qr` | QR code entry pass |
| `/register` | Create admin / owner / security account |
| `/login` | Sign in |
| `/security` | Security guard dashboard (live QR scan) |
| `/owner` | House owner dashboard |
| `/admin` | Admin — full access |

---

## Stopping the app

Press **Ctrl + C** in the Terminal window.

---

## Requirements

| Tool | Minimum version |
|------|----------------|
| Node.js | **18** or higher |
| npm | 9 or higher |
| Browser | Chrome / Safari / Firefox (latest) |

---

## Troubleshooting

**`npm install` fails**
```bash
npm install --legacy-peer-deps
```

**Port already in use**
```bash
npm run dev -- --port 3000
```

**"Cannot connect to MongoDB"**
- Check your `MONGODB_URI` in `.env` — make sure username/password are correct
- Make sure you allowed access from anywhere in MongoDB Atlas Network Access

**Camera not working on QR scanner**
- Must run on `localhost` or `https://` — browsers block camera on plain http remote URLs
