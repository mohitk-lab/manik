# CLAUDE.md — MANIK.AI

## What is this project?

MANIK.AI is a free, open-source, self-hosted autonomous AI agent. It connects AI intelligence to messaging apps (WhatsApp, Telegram), manages Google Calendar/Gmail, executes file operations and shell commands, generates voice audio via ElevenLabs, performs web searches, and auto-detects user intent to apply contextual "skills" across 18 specialized domains. Smart model routing minimizes token costs by choosing the optimal Claude model tier per query.

## Tech Stack

- **Frontend:** React 18 + Vite 6, component-based architecture, inline CSS-in-JS, SSE streaming
- **Backend:** Python 3.11, FastAPI, Uvicorn (async)
- **AI Models:** OpenRouter API (OpenAI-compatible) — Claude Haiku, Sonnet, Opus
- **Messaging:** python-telegram-bot, WhatsApp Cloud API (Meta Graph API v19.0)
- **Google:** google-api-python-client (Calendar v3, Gmail v1)
- **Audio:** ElevenLabs TTS API
- **Search:** DuckDuckGo Search
- **Desktop:** Electron
- **Testing:** pytest + pytest-asyncio (backend), Vitest + Testing Library (frontend)
- **Linting:** Ruff (Python), ESLint (JavaScript)
- **Deploy:** Vercel (frontend), Render (backend), Docker (self-hosted)

## Project Structure

```
├── src/
│   ├── App.jsx              # Root component — state management, SSE streaming, routing
│   ├── main.jsx             # React DOM bootstrap
│   ├── constants.js         # Shared constants — SKILLS, QUICK_ACTIONS, TIER_STYLE, detectSkills
│   ├── components/
│   │   ├── Header.jsx       # Logo + navigation tabs
│   │   ├── ChatView.jsx     # Message list, welcome screen, quick actions
│   │   ├── SkillsPanel.jsx  # Skill registry grid
│   │   ├── ConnectTab.jsx   # Connector setup guides
│   │   ├── BrainTab.jsx     # Stats, knowledge tree, identity
│   │   └── InputBar.jsx     # Text input + send button
│   └── __tests__/
│       ├── App.test.jsx     # Component rendering tests
│       └── constants.test.js # detectSkills logic tests
├── backend/
│   ├── main.py              # FastAPI app — agentic loop, retry logic, request tracing, webhooks
│   ├── config.py            # Centralized env var loading
│   ├── smart_router.py      # LLM tier selection: score-based mini/standard/power routing
│   ├── plugin_loader.py     # YAML config loader, tool filtering, hot-reload
│   ├── tools.py             # 10 tool implementations with command safety checks
│   ├── Dockerfile           # Python 3.11-slim backend container
│   ├── requirements.txt     # Python deps (core + testing + linting)
│   ├── pytest.ini           # Pytest config
│   ├── ruff.toml            # Ruff linter config
│   ├── connectors/
│   │   ├── telegram.py      # Telegram bot polling + message handling
│   │   └── whatsapp.py      # WhatsApp Cloud API webhook handler
│   └── tests/
│       ├── conftest.py      # Test fixtures + path setup
│       ├── test_smart_router.py  # Router tier selection tests
│       ├── test_tools.py         # Tool execution + safety tests
│       ├── test_plugin_loader.py # Config loading tests
│       └── test_api.py           # API endpoint tests
├── .eslintrc.json           # ESLint config
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
    ├── deploy.yml           # CI tests + lint → deploy to Vercel + Render
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
3. OpenRouter API called with exponential backoff retry (max 3 retries)
4. Message history auto-truncated to prevent unbounded token growth (max 40 messages / ~50K chars)
5. If tool calls returned: execute tools (with safety checks), append results, loop (max 12 iterations)
6. All events streamed via SSE (model_selected, text, tool_use, tool_result, done)
7. Each request tagged with a unique ID for structured log tracing

### Smart Model Routing
- Score-based routing using keyword signals and message characteristics
- Power signals (+2): "architecture", "implement", "daksh", "debug", "research"
- Standard signals (+1): "code", "script", "promo", "analyze", "create"
- Simple signals (-2): "what is", "hello", "thanks", "briefly"
- Score <= 0: mini, 1-5: standard, >5: power

### Security
- **Workspace isolation:** All file operations confined to `backend/workspace/` with path traversal prevention
- **Command safety:** `run_command` tool blocks dangerous shell commands (rm -rf /, fork bombs, etc.)
- **Input validation:** WhatsApp webhook payloads validated before processing
- **CORS:** Restricted to known frontend origins (localhost, Vercel URL)

## Testing

### Backend (pytest)
```bash
cd backend && pytest tests/ -v      # Run all 66+ tests
pytest tests/test_smart_router.py   # Test routing logic
pytest tests/test_tools.py          # Test tool execution + safety
pytest tests/test_api.py            # Test API endpoints
```

### Frontend (Vitest)
```bash
npm test                            # Run all 9+ tests
npm run test:watch                  # Watch mode
```

### Linting
```bash
# Python
cd backend && ruff check .

# JavaScript
npm run lint
```

## Coding Conventions

- **Python:** `snake_case` for functions (e.g., `tool_write_file`), async/await for all I/O, `asyncio.to_thread()` for CPU-bound ops
- **React:** `camelCase` for variables (e.g., `sendMessage`), hooks for state, inline CSS-in-JS
- **Components:** Each view in its own file under `src/components/`, shared constants in `src/constants.js`
- **Environment variables:** `UPPER_SNAKE_CASE`
- **Tool names:** lowercase (e.g., `elevenlabs_tts`)
- **Skill IDs:** lowercase (e.g., `promo`, `architect`, `daksh`)
- **Line length:** 120 chars (Python, configured in ruff.toml)

## Useful Commands

```bash
# Local dev
./setup.sh                    # First-time setup
./start.sh                    # Start both servers
npm run dev                   # Frontend only
npm run electron:dev          # Desktop app

# Testing
cd backend && pytest tests/ -v  # Backend tests
npm test                        # Frontend tests

# Linting
cd backend && ruff check .    # Python lint
npm run lint                  # JS lint

# Docker
docker compose up -d          # Start all services
docker compose down           # Stop all services

# Backend health check
curl http://localhost:8000/api/health

# Hot-reload config
curl -X POST http://localhost:8000/api/config/reload
```

## CI/CD

- **Push to main/master** runs tests (backend + frontend) and lint checks before deploying
- **PRs** trigger test + lint jobs only (no deploy)
- **Frontend** deploys to Vercel via `npx vercel deploy --prod`
- **Backend** deploys to Render via deploy hook
- **Deploy only runs if all tests and lint pass**
- PRs labeled `auto-merge` are automatically squash-merged

## Important Notes for AI Assistants

- Frontend uses component-based architecture: `App.jsx` handles state/streaming, views are in `src/components/`
- Shared constants (SKILLS, QUICK_ACTIONS, TIER_STYLE, detectSkills) live in `src/constants.js`
- Backend uses OpenAI-compatible message format (system/user/assistant/tool roles) routed through OpenRouter
- API calls have retry logic with exponential backoff — don't add redundant retries
- `run_command` tool has a command blocklist — update `BLOCKED_COMMANDS` in `tools.py` if needed
- Message history is auto-truncated (40 messages / ~50K chars) — no manual truncation needed
- `manik.config.yaml` is the master configuration file for skills, tools, and quick actions — it's hot-reloadable
- The Vite dev server proxies `/api` requests to `localhost:8000` (configured in `vite.config.js`)
- nginx config disables buffering for `/api` routes to support SSE streaming
- Docker health checks use `curl` against `/api/health` every 30s
- The workspace directory (`backend/workspace/`) is the only writable area for tool file operations
- **Always run tests before pushing:** `pytest tests/ -v` (backend) and `npm test` (frontend)
