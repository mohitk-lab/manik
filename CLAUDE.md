# CLAUDE.md — MANIK.AI

## What is this project?

MANIK.AI is a free, open-source, self-hosted autonomous AI agent. It connects AI intelligence to messaging apps (WhatsApp, Telegram), manages Google Calendar/Gmail, executes file operations and shell commands, generates voice audio via ElevenLabs, performs web searches, and auto-detects user intent to apply contextual "skills" across 18 specialized domains. Smart model routing minimizes token costs by choosing the optimal Claude model tier per query.

## Tech Stack

- **Frontend:** React 18 + Vite 6, inline CSS-in-JS, SSE streaming
- **Backend:** Python 3.11, FastAPI, Uvicorn (async)
- **AI Models:** OpenRouter API (OpenAI-compatible) — Claude Haiku, Sonnet, Opus
- **Messaging:** python-telegram-bot, WhatsApp Cloud API (Meta Graph API v19.0)
- **Google:** google-api-python-client (Calendar v3, Gmail v1)
- **Audio:** ElevenLabs TTS API
- **Search:** DuckDuckGo Search
- **Desktop:** Electron
- **Deploy:** Vercel (frontend), Render (backend), Docker (self-hosted)

## Project Structure

```
├── src/
│   ├── App.jsx              # Main React component — chat UI, skills tab, streaming SSE
│   └── main.jsx             # React DOM bootstrap
├── backend/
│   ├── main.py              # FastAPI app — agentic loop, tool execution, messaging webhooks
│   ├── config.py            # Centralized env var loading
│   ├── smart_router.py      # LLM tier selection: score-based mini/standard/power routing
│   ├── plugin_loader.py     # YAML config loader, tool filtering, hot-reload
│   ├── tools.py             # 10 tool implementations (file, command, ElevenLabs, web, calendar, gmail)
│   ├── Dockerfile           # Python 3.11-slim backend container
│   └── connectors/
│       ├── telegram.py      # Telegram bot polling + message handling
│       └── whatsapp.py      # WhatsApp Cloud API webhook handler
├── electron/
│   └── main.js              # Electron desktop app wrapper
├── manik.config.yaml        # Master config — 18 skills, tools enable/disable, quick actions
├── .env.example             # Template for all secrets (API keys, tokens)
├── docker-compose.yml       # Backend + frontend orchestration with health checks
├── Dockerfile.frontend      # Multi-stage: Node 20 build → nginx alpine
├── nginx.conf               # SPA routing + API proxying (SSE-compatible)
├── vercel.json              # Vercel deploy config
├── render.yaml              # Render deploy config
├── setup.sh / setup.bat     # One-command local setup
├── start.sh / start.bat     # Start backend + frontend concurrently
└── .github/workflows/
    ├── deploy.yml           # Auto-deploy to Vercel + Render on push to main
    └── auto-merge.yml       # Auto-merge PRs labeled "auto-merge"
```

## Development Setup

### Prerequisites
- Python 3.7+
- Node.js 16+

### Quick Start
```bash
chmod +x setup.sh && ./setup.sh   # Creates venv, installs deps, creates .env
# Edit .env — add OPENROUTER_API_KEY (required)
./start.sh                         # Frontend: localhost:5173, Backend: localhost:8000
```

### Docker
```bash
cp .env.example .env && nano .env  # Add API keys
docker compose up -d               # Frontend: localhost:3000, Backend: localhost:8000
```

### Electron Desktop
```bash
npm run electron:dev
```

## Environment Variables

**Required:** `OPENROUTER_API_KEY`

**Optional:**
- `SMART_ROUTING` (default: `true`) — enable/disable model tier routing
- `MODEL_MINI`, `MODEL_STANDARD`, `MODEL_POWER` — override default Claude models
- `MAX_TOKENS` (default: `4096`)
- `ELEVENLABS_API_KEY` — voice generation
- `TELEGRAM_BOT_TOKEN` — Telegram bot
- `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_VERIFY_TOKEN` — WhatsApp
- `GOOGLE_CREDENTIALS_JSON`, `GOOGLE_TOKEN_JSON` — Google Calendar/Gmail
- `FRONTEND_URL` — for backend CORS
- `VITE_API_URL` — backend URL for frontend

See `.env.example` for full documentation.

## Key Architecture

### Agentic Loop
1. User sends message -> frontend detects applicable skills
2. Smart router selects model tier (mini/standard/power) based on message complexity
3. OpenRouter API called with OpenAI-compatible message format
4. If tool calls returned: execute tools, append results to history, loop (max 12 iterations)
5. All events streamed via SSE (model_selected, text, tool_use, tool_result, done)

### Smart Model Routing
- Score-based routing using keyword signals and message characteristics
- Power signals (+2): "architecture", "implement", "daksh", "debug", "research"
- Standard signals (+1): "code", "script", "promo", "analyze", "create"
- Simple signals (-2): "what is", "hello", "thanks", "briefly"
- Score <= 0: mini, 1-5: standard, >5: power

### Workspace Isolation
- All file operations confined to `backend/workspace/`
- Path traversal prevention via `.resolve()` checks

## Coding Conventions

- **Python:** `snake_case` for functions (e.g., `tool_write_file`), async/await for all I/O, `asyncio.to_thread()` for CPU-bound ops
- **React:** `camelCase` for variables (e.g., `sendMessage`), hooks for state, inline CSS-in-JS
- **Environment variables:** `UPPER_SNAKE_CASE`
- **Tool names:** lowercase (e.g., `elevenlabs_tts`)
- **Skill IDs:** lowercase (e.g., `promo`, `architect`, `daksh`)
- **No test framework** configured — manual testing via health endpoints and UI

## Useful Commands

```bash
# Local dev
./setup.sh                    # First-time setup
./start.sh                    # Start both servers
npm run dev                   # Frontend only
npm run electron:dev          # Desktop app

# Docker
docker compose up -d          # Start all services
docker compose down           # Stop all services

# Backend health check
curl http://localhost:8000/api/health

# Hot-reload config
curl -X POST http://localhost:8000/api/config/reload
```

## CI/CD

- **Push to main/master** triggers GitHub Actions deploy workflow
- **Frontend** deploys to Vercel via `npx vercel deploy --prod`
- **Backend** deploys to Render via deploy hook
- PRs labeled `auto-merge` are automatically squash-merged

## Important Notes for AI Assistants

- The frontend is a single large component (`src/App.jsx`) — all UI state lives in React hooks
- Backend uses OpenAI-compatible message format (system/user/assistant/tool roles) routed through OpenRouter
- `manik.config.yaml` is the master configuration file for skills, tools, and quick actions — it's hot-reloadable
- The Vite dev server proxies `/api` requests to `localhost:8000` (configured in `vite.config.js`)
- nginx config disables buffering for `/api` routes to support SSE streaming
- Docker health checks use `curl` against `/api/health` every 30s
- The workspace directory (`backend/workspace/`) is the only writable area for tool file operations
