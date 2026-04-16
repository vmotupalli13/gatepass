#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
#  GatePass — Setup & Launch (macOS / Linux)
#  Double-click in Finder won't work directly; see README.md
#  To run: open Terminal, drag this file into it, press Enter
# ─────────────────────────────────────────────────────────────

set -e  # Stop on any error

BOLD="\033[1m"
GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[0;33m"
RESET="\033[0m"

echo ""
echo -e "${BOLD}=============================================${RESET}"
echo -e "${BOLD}  GatePass — Visitor Management System      ${RESET}"
echo -e "${BOLD}=============================================${RESET}"
echo ""

# ── 1. Check Node.js ────────────────────────────────────────
if ! command -v node &>/dev/null; then
  echo -e "${RED}[ERROR] Node.js is not installed.${RESET}"
  echo ""
  echo "  Install it using one of these methods:"
  echo ""
  echo "  Option A — Official installer (easiest):"
  echo "    https://nodejs.org/en/download  → click LTS"
  echo ""
  echo "  Option B — Homebrew:"
  echo "    brew install node"
  echo ""
  echo "  After installing, re-run this script."
  echo ""
  exit 1
fi

NODE_VERSION=$(node --version | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo -e "${RED}[ERROR] Node.js version is too old.${RESET}"
  echo "  You have: $(node --version)"
  echo "  Required: v18 or higher"
  echo ""
  echo "  Update from: https://nodejs.org/en/download"
  echo ""
  exit 1
fi

echo -e "${GREEN}[OK]${RESET} Node.js $(node --version) found"

# ── 2. Check npm ─────────────────────────────────────────────
if ! command -v npm &>/dev/null; then
  echo -e "${RED}[ERROR] npm not found. Reinstall Node.js.${RESET}"
  exit 1
fi
echo -e "${GREEN}[OK]${RESET} npm $(npm --version) found"

# ── 3. Install dependencies ──────────────────────────────────
if [ ! -d "node_modules" ]; then
  echo ""
  echo -e "${YELLOW}Installing dependencies — takes ~1 minute on first run...${RESET}"
  echo "(Internet connection required)"
  echo ""
  npm install
  echo ""
  echo -e "${GREEN}[OK]${RESET} Dependencies installed!"
else
  echo -e "${GREEN}[OK]${RESET} Dependencies already installed"
fi

# ── 4. Open browser after a short delay ──────────────────────
(sleep 3 && open "http://localhost:5173") &

# ── 5. Start the dev server ──────────────────────────────────
echo ""
echo -e "${BOLD}Starting GatePass...${RESET}"
echo ""
echo -e "  App URL:  ${GREEN}http://localhost:5173${RESET}"
echo ""
echo "  Press Ctrl+C to stop the server."
echo ""

npm run dev
