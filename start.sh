#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# MANIK.AI — Start Script (runs backend + frontend together)
# Usage: ./start.sh
# ═══════════════════════════════════════════════════════════════
set -e

CYAN="\033[36m"
GREEN="\033[32m"
YELLOW="\033[33m"
BOLD="\033[1m"
RESET="\033[0m"

# Check .env exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠ .env not found. Run ./setup.sh first${RESET}"
    exit 1
fi

# Check for API key
if ! grep -q "OPENROUTER_API_KEY=sk-or\|OPENROUTER_API_KEY=sk-" .env 2>/dev/null; then
    echo -e "${YELLOW}⚠ OPENROUTER_API_KEY not set in .env${RESET}"
    echo -e "  Get a free key at ${CYAN}openrouter.ai${RESET}"
fi

echo -e "\n${BOLD}${CYAN}Starting MANIK.AI...${RESET}\n"

# Activate venv if present
if [ -d "backend/.venv" ]; then
    source backend/.venv/bin/activate
fi

# Start backend in background
echo -e "${GREEN}▶${RESET} Backend  → ${CYAN}http://localhost:8000${RESET}"
cd backend && uvicorn main:app --host 0.0.0.0 --reload --port 8000 &
BACKEND_PID=$!
cd ..

# Wait for backend to be ready
echo -n "  Waiting for backend"
for i in {1..20}; do
    if curl -sf http://localhost:8000/api/health > /dev/null 2>&1; then
        echo -e " ${GREEN}ready${RESET}"
        break
    fi
    echo -n "."
    sleep 1
done

# Start frontend
echo -e "${GREEN}▶${RESET} Frontend → ${CYAN}http://localhost:5173${RESET}"
echo ""
echo -e "  ${BOLD}Press Ctrl+C to stop both services${RESET}\n"

npm run dev -- --host 0.0.0.0 &
FRONTEND_PID=$!

# Wait and handle Ctrl+C
trap "echo ''; echo 'Stopping...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM
wait
