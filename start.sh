#!/usr/bin/env bash
set -e

BOLD="\033[1m"; GREEN="\033[0;32m"; RED="\033[0;31m"; YELLOW="\033[0;33m"; RESET="\033[0m"

echo ""
echo -e "${BOLD}=============================================${RESET}"
echo -e "${BOLD}  GatePass — Visitor Management System      ${RESET}"
echo -e "${BOLD}=============================================${RESET}"
echo ""

# ── Node.js check ────────────────────────────────────────────
if ! command -v node &>/dev/null; then
  echo -e "${RED}[ERROR] Node.js not installed.${RESET}"
  echo "  Install from: https://nodejs.org/en/download (choose LTS)"
  exit 1
fi

NODE_VER=$(node --version | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VER" -lt 18 ]; then
  echo -e "${RED}[ERROR] Node.js $(node --version) is too old. Need v18+.${RESET}"
  echo "  Update from: https://nodejs.org/en/download"
  exit 1
fi
echo -e "${GREEN}[OK]${RESET} Node.js $(node --version)"

# ── Install dependencies ──────────────────────────────────────
if [ ! -d "node_modules" ]; then
  echo -e "\n${YELLOW}Installing dependencies (~1 min, needs internet)...${RESET}\n"
  npm install
  echo -e "\n${GREEN}[OK]${RESET} Dependencies installed!"
else
  echo -e "${GREEN}[OK]${RESET} Dependencies present"
fi

# ── Check .env ────────────────────────────────────────────────
if grep -q "your_mongodb_connection_string" .env 2>/dev/null; then
  echo ""
  echo -e "${RED}[ACTION REQUIRED] MongoDB URI not set in .env${RESET}"
  echo ""
  echo "  1. Go to https://mongodb.com/atlas/database → create free M0 cluster"
  echo "  2. Get the connection string (looks like mongodb+srv://...)"
  echo "  3. Open the .env file and replace:"
  echo "       MONGODB_URI=your_mongodb_connection_string"
  echo "     with your actual connection string"
  echo ""
  echo "  Then run: bash start.sh again"
  echo ""
  exit 1
fi

# ── Seed houses (once) ────────────────────────────────────────
echo -e "\n${YELLOW}Seeding houses into database (skipped if already done)...${RESET}"
node server/seeds/houses.js || echo "(seed skipped or already done)"

# ── Open browser after delay ─────────────────────────────────
(sleep 4 && open "http://localhost:5173") &

# ── Start both servers ────────────────────────────────────────
echo ""
echo -e "${BOLD}Starting GatePass...${RESET}"
echo -e "  Frontend → ${GREEN}http://localhost:5173${RESET} (or 5174 if 5173 is busy)"
echo -e "  Backend  → ${GREEN}http://localhost:5001${RESET}"
echo ""
echo "  Press Ctrl+C to stop."
echo ""

npm run dev
