import asyncio
import json
import logging
from typing import AsyncGenerator

from openai import AsyncOpenAI
from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from config import (
    OPENROUTER_API_KEY,
    MAX_TOKENS,
    FRONTEND_URL,
    TELEGRAM_BOT_TOKEN,
    WHATSAPP_PHONE_NUMBER_ID,
    WHATSAPP_ACCESS_TOKEN,
    WHATSAPP_VERIFY_TOKEN,
)
from plugin_loader import (
    get_skills, get_quick_actions, get_active_tool_definitions,
    get_personality_extra, get_agent_name, reload as reload_config,
)
from smart_router import smart_router
from tools import TOOL_DEFINITIONS, execute_tool

logging.basicConfig(level=logging.INFO, format="%(levelname)s  %(name)s  %(message)s")
logger = logging.getLogger("manik.ai")

# ── FastAPI App ───────────────────────────────────────────────────────────────

app = FastAPI(title="MANIK.AI", version="2.0.0")

_cors_origins = ["http://localhost:5173", "http://127.0.0.1:5173", "app://.", "file://"]
if FRONTEND_URL:
    _cors_origins.append(FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── OpenRouter client (OpenAI-compatible) ─────────────────────────────────────

client = AsyncOpenAI(
    api_key=OPENROUTER_API_KEY,
    base_url="https://openrouter.ai/api/v1",
    default_headers={
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "MANIK.AI",
    },
)

# ── System Prompt ─────────────────────────────────────────────────────────────

MANIK_SYSTEM_PROMPT = """You are MANIK.AI — a free, open-source, self-hosted autonomous AI agent built by Manik (Mohit Kumar), Senior Promo Editor at Stage OTT, India's dialect-first streaming platform.

## WHAT YOU ARE
You are NOT a generic assistant. You are an autonomous agent that:
- Connects AI intelligence to messaging apps (WhatsApp, Telegram) to automate real tasks
- Manages calendars, inbox, and file systems automatically
- Uses smart model switching to minimize token costs without losing quality
- Runs entirely locally — no data leaves the user's machine unless explicitly sent

## YOUR IDENTITY
- You think in systems and competitive moats
- You speak Hinglish naturally (Hindi-English mix)
- You ARE Manik's brain externalized — his thinking patterns, instincts, architecture mindset

## YOUR TOOLS
Use tools proactively — don't describe, DO:
- write_file / read_file / list_files: Save and retrieve content from workspace
- run_command: Execute shell commands (ffmpeg, python, etc.)
- elevenlabs_tts: Generate actual voice audio for promo scripts
- web_search: Search for competitor intel, market data, research
- calendar_list_events / calendar_create_event: Manage Google Calendar
- gmail_list_emails / gmail_send_email: Manage Gmail inbox

## SMART SWITCHING
You automatically run on the cheapest model that can handle each task:
- MINI tier: Simple Q&A, greetings, factual lookups
- STANDARD tier: Coding, creative writing, analysis, planning
- POWER tier: Complex multi-step agentic tasks, deep research, system architecture

## YOUR SKILL DOMAINS
1. PROMO SCRIPTWRITING — Bhojpuri, Haryanvi, Rajasthani, Gujarati, Marathi
2. AI TOOL ARCHITECTURE — React, FastAPI, Claude, Gemini, FFmpeg, MLX-Whisper
3. DAKSH ORCHESTRATOR — Full pipeline from brief to broadcast
4. REGIONAL LANGUAGE CO-WRITING — 5 dialects, raw + polished variants
5. ELEVENLABS VOICE — SSML, batch VO, dialect voice matching
6. REMOTION VIDEO ENGINE — Programmatic renders, React compositions
7. CREATIVE DIRECTION — Mani Ratnam, Rajamouli, Kashyap aesthetics
8. COMPETITOR INTELLIGENCE — JioCinema, Zee5, MX Player, Ullu
9. McKINSEY RESEARCH — Pyramid Principle, MECE, TAM/SAM/SOM
10. CONTENT CALENDAR — Festival alignment, sprint planning, Google Calendar
11. ASSET PIPELINE — MLX-Whisper, CLIP, ChromaDB, natural language search
12. MOTION & PROMO — After Effects MOGRT, DaVinci Fusion
13. OKR & STRATEGY — Board decks, investor pitches, QBR
14. VIDEO ANALYSIS — Hook detection, metadata, content tagging
15. MESSAGING AUTOMATION — WhatsApp + Telegram bot workflows
16. INBOX AUTOMATION — Gmail read/reply/organize via AI
17. SMART ROUTING — Auto cost-optimization across model tiers
18. SCRIPT CONVERTER — Auto-convert to 4 dialects

## STAGE OTT CONTEXT
Shows: Jaan Legi Sonam, JholaChhap, Psycho Girlfriend, Saanwari, Punarjanam, Dheeth
Audience: Tier 2/3 India — 200M+ households

## COMMUNICATION STYLE
Hinglish naturally. Direct, no fluff. Systems thinker.
Remember: You ARE Manik's brain externalized. Think like him. Build like him. Use your tools."""

# ── Models ────────────────────────────────────────────────────────────────────

class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[Message]
    system_extra: str = ""


def sse(event: dict) -> str:
    return f"data: {json.dumps(event, ensure_ascii=False)}\n\n"


# ── Agentic Loop (streaming) ──────────────────────────────────────────────────

async def agentic_loop(request: ChatRequest) -> AsyncGenerator[str, None]:
    # Build system prompt
    system = MANIK_SYSTEM_PROMPT
    extra = get_personality_extra()
    if extra:
        system += f"\n\n{extra}"
    if request.system_extra:
        system += f"\n\n{request.system_extra}"

    # OpenAI-format messages (system message first)
    messages = [{"role": "system", "content": system}]
    messages += [{"role": m.role, "content": m.content} for m in request.messages]

    # Smart routing
    last_user_msg = next(
        (m.content for m in reversed(request.messages) if m.role == "user"), ""
    )
    model, tier = smart_router.route(last_user_msg, len(messages))
    logger.info(f"[router] tier={tier} model={model}")
    yield sse({"type": "model_selected", "tier": tier, "model": model})

    active_tools = get_active_tool_definitions(TOOL_DEFINITIONS)

    iteration = 0
    max_iterations = 12
    total_tokens = 0

    while iteration < max_iterations:
        iteration += 1

        response = await client.chat.completions.create(
            model=model,
            max_tokens=MAX_TOKENS,
            messages=messages,
            tools=active_tools,
            tool_choice="auto",
        )

        choice = response.choices[0]
        msg = choice.message

        if response.usage:
            total_tokens += (response.usage.prompt_tokens or 0) + (response.usage.completion_tokens or 0)

        # Yield text content
        if msg.content:
            yield sse({"type": "text", "content": msg.content})

        # Build assistant message for history
        assistant_msg: dict = {"role": "assistant", "content": msg.content or ""}
        if msg.tool_calls:
            assistant_msg["tool_calls"] = [tc.model_dump() for tc in msg.tool_calls]
        messages.append(assistant_msg)

        # Stop if no tool calls
        if not msg.tool_calls or choice.finish_reason == "stop":
            break

        # Execute tool calls
        for tc in msg.tool_calls:
            fn_name = tc.function.name
            try:
                fn_args = json.loads(tc.function.arguments)
            except json.JSONDecodeError:
                fn_args = {}

            yield sse({"type": "tool_use", "name": fn_name, "input": fn_args, "tool_use_id": tc.id})

            result = await execute_tool(fn_name, fn_args)

            yield sse({"type": "tool_result", "name": fn_name, "result": result, "tool_use_id": tc.id})

            # Append tool result in OpenAI format
            messages.append({
                "role": "tool",
                "tool_call_id": tc.id,
                "content": result,
            })

    yield sse({"type": "done", "tier": tier, "model": model, "tokens": total_tokens})


# ── Simple agent for messaging connectors ────────────────────────────────────

async def run_agent_simple(message: str, from_user: str = "User") -> str:
    request = ChatRequest(
        messages=[Message(role="user", content=message)],
        system_extra=(
            f"[Via messaging app, from: {from_user}] "
            "Keep response under 1000 chars — concise, mobile-friendly."
        ),
    )
    parts: list[str] = []
    async for chunk in agentic_loop(request):
        if chunk.startswith("data: "):
            try:
                event = json.loads(chunk[6:])
                if event.get("type") == "text":
                    parts.append(event["content"])
            except json.JSONDecodeError:
                pass
    return "".join(parts) or "Kuch samajh nahi aaya — please rephrase."


# ── Connector instances ───────────────────────────────────────────────────────

telegram_connector = None
whatsapp_connector = None


# ── Lifecycle ─────────────────────────────────────────────────────────────────

@app.on_event("startup")
async def startup():
    global telegram_connector, whatsapp_connector

    if TELEGRAM_BOT_TOKEN:
        from connectors.telegram import TelegramConnector
        telegram_connector = TelegramConnector(TELEGRAM_BOT_TOKEN, run_agent_simple)
        asyncio.create_task(telegram_connector.start())
        logger.info("[startup] Telegram bot task scheduled")
    else:
        logger.info("[startup] Telegram not configured (set TELEGRAM_BOT_TOKEN)")

    if WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN:
        from connectors.whatsapp import WhatsAppConnector
        whatsapp_connector = WhatsAppConnector(
            WHATSAPP_PHONE_NUMBER_ID,
            WHATSAPP_ACCESS_TOKEN,
            WHATSAPP_VERIFY_TOKEN,
            run_agent_simple,
        )
        logger.info("[startup] WhatsApp connector ready")
    else:
        logger.info("[startup] WhatsApp not configured")


@app.on_event("shutdown")
async def shutdown():
    if telegram_connector:
        await telegram_connector.stop()


# ── API Routes ────────────────────────────────────────────────────────────────

@app.post("/api/chat")
async def chat(request: ChatRequest):
    return StreamingResponse(
        agentic_loop(request),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "version": "2.0.0",
        "smart_routing": True,
        "models": {
            "mini":     smart_router.TIERS["mini"],
            "standard": smart_router.TIERS["standard"],
            "power":    smart_router.TIERS["power"],
        },
    }


@app.get("/api/config")
async def get_config():
    return {
        "agent":         {"name": get_agent_name()},
        "skills":        get_skills(),
        "quick_actions": get_quick_actions(),
        "smart_routing": smart_router.TIERS,
    }


@app.post("/api/config/reload")
async def reload_cfg():
    reload_config()
    return {"status": "reloaded", "skills": len(get_skills())}


@app.get("/api/connectors/status")
async def connectors_status():
    import config as cfg
    return {
        "telegram": {
            "configured": bool(TELEGRAM_BOT_TOKEN),
            "running": telegram_connector.is_running if telegram_connector else False,
        },
        "whatsapp": {
            "configured": bool(WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN),
        },
        "google": {
            "configured": bool(cfg.GOOGLE_TOKEN_JSON),
        },
    }


@app.get("/api/whatsapp/webhook")
async def whatsapp_verify(
    hub_mode: str = Query(None, alias="hub.mode"),
    hub_verify_token: str = Query(None, alias="hub.verify_token"),
    hub_challenge: str = Query(None, alias="hub.challenge"),
):
    if not whatsapp_connector:
        raise HTTPException(503, "WhatsApp not configured")
    challenge = whatsapp_connector.verify_webhook(
        hub_mode or "", hub_verify_token or "", hub_challenge or ""
    )
    if challenge is None:
        raise HTTPException(403, "Verification failed")
    return int(challenge)


@app.post("/api/whatsapp/webhook")
async def whatsapp_message(request: Request):
    if not whatsapp_connector:
        raise HTTPException(503, "WhatsApp not configured")
    payload = await request.json()
    asyncio.create_task(whatsapp_connector.handle_payload(payload))
    return {"status": "ok"}
