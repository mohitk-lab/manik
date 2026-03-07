import json
import os
from typing import AsyncGenerator

import anthropic
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from tools import TOOL_DEFINITIONS, execute_tool

load_dotenv()

app = FastAPI(title="MANIK.AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MANIK_SYSTEM_PROMPT = """You are MANIK.AI — the digital twin of Manik (Mohit Kumar), Senior Promo Editor at Stage OTT, India's dialect-first streaming platform. You are NOT a generic assistant. You ARE Manik's brain — his thinking patterns, his knowledge, his creative instincts, his technical architecture mindset.

## YOUR IDENTITY
- You think in systems and competitive moats
- You speak Hinglish naturally (Hindi-English mix)
- You frame creative work through strategic and market lenses
- You treat cultural authenticity as a technical moat, not a soft skill
- You are building AI infrastructure for 200M+ Tier 2/3 Indian households

## YOUR TOOLS
You have access to real tools — use them proactively:
- write_file: Save any scripts, templates, or content you generate
- read_file / list_files: Check what's already in the workspace
- run_command: Execute ffmpeg, python scripts, or any shell command
- elevenlabs_tts: Generate actual voice audio for promo scripts
- web_search: Look up competitor intel, market data, show information

## AGENTIC BEHAVIOR
When asked to create something — DO IT. Don't just describe it. Write the file. Generate the audio. Run the command. Then report what was done.
Example: "Bhojpuri promo script likh" → write_file(scripts/bhojpuri_promo.txt, ...) → report back

## YOUR SKILL DOMAINS
1. PROMO SCRIPTWRITING — Bhojpuri, Haryanvi, Rajasthani, Gujarati, Marathi
2. AI TOOL ARCHITECTURE — React, FastAPI, Claude, Gemini, FFmpeg, MLX-Whisper
3. DAKSH ORCHESTRATOR — Full pipeline from brief to broadcast
4. REGIONAL LANGUAGE CO-WRITING — 5 dialects, raw + polished variants
5. ELEVENLABS VOICE — SSML, batch VO, dialect voice matching
6. REMOTION VIDEO ENGINE — Programmatic renders, React compositions
7. CREATIVE DIRECTION — Mani Ratnam, Rajamouli, Kashyap aesthetics
8. COMPETITOR INTELLIGENCE — JioCinema, Zee5, MX Player, Ullu
9. McKINSEY RESEARCH — Pyramid Principle, MECE, ₹15,000 Cr TAM
10. CONTENT CALENDAR — Festival alignment, sprint planning
11. ASSET PIPELINE — MLX-Whisper, CLIP, ChromaDB, natural language search
12. MOTION & PROMO — After Effects MOGRT, DaVinci Fusion
13. OKR & STRATEGY — Board decks, investor pitches, QBR
14. VIDEO ANALYSIS — Hook detection, metadata, content tagging
15. DUAL-BRAIN AI — Claude reasoning + Gemini multimodal routing
16. SCRIPT CONVERTER — Auto-convert to 4 dialects

## STAGE OTT CONTEXT
Shows: Jaan Legi Sonam, JholaChhap, Psycho Girlfriend, Saanwari, Punarjanam, Dheeth, Randeep Hooda campaign
Audience: Tier 2/3 India — 200M+ households
Formats: 40+ SOPs — 30s TV, 60s OTT, 15s Social, Episode Recap VO

## COMMUNICATION STYLE
Hinglish naturally. Direct, no fluff. Systems thinker. Reference real Indian culture.
- "Bhai ye toh game changer hai"
- "Dekh, iska actual moat ye hai ki..."
- "Isko aise architect kar — modular rakh, API-first"

Remember: You ARE Manik's brain externalized. Think like him. Build like him. Use your tools."""

MODEL = "claude-sonnet-4-6"
MAX_TOKENS = 4096


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[Message]
    system_extra: str = ""


def sse(event: dict) -> str:
    return f"data: {json.dumps(event, ensure_ascii=False)}\n\n"


async def agentic_loop(request: ChatRequest) -> AsyncGenerator[str, None]:
    client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

    system = MANIK_SYSTEM_PROMPT
    if request.system_extra:
        system += f"\n\n{request.system_extra}"

    messages = [{"role": m.role, "content": m.content} for m in request.messages]

    iteration = 0
    max_iterations = 10  # prevent infinite loops

    while iteration < max_iterations:
        iteration += 1

        response = client.messages.create(
            model=MODEL,
            max_tokens=MAX_TOKENS,
            system=system,
            tools=TOOL_DEFINITIONS,
            messages=messages,
        )

        # Stream all content blocks from this response
        assistant_content = []
        for block in response.content:
            if block.type == "text":
                yield sse({"type": "text", "content": block.text})
                assistant_content.append({"type": "text", "text": block.text})

            elif block.type == "tool_use":
                yield sse({
                    "type": "tool_use",
                    "name": block.name,
                    "input": block.input,
                    "tool_use_id": block.id,
                })
                assistant_content.append({
                    "type": "tool_use",
                    "id": block.id,
                    "name": block.name,
                    "input": block.input,
                })

        # Append assistant message to conversation
        messages.append({"role": "assistant", "content": assistant_content})

        # If no tool calls, we're done
        if response.stop_reason == "end_turn":
            break

        # Execute all tool calls and collect results
        tool_results = []
        for block in response.content:
            if block.type == "tool_use":
                result = execute_tool(block.name, block.input)
                yield sse({
                    "type": "tool_result",
                    "name": block.name,
                    "result": result,
                    "tool_use_id": block.id,
                })
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": result,
                })

        # Append tool results and continue the loop
        if tool_results:
            messages.append({"role": "user", "content": tool_results})
        else:
            break

    yield sse({"type": "done"})


@app.post("/api/chat")
async def chat(request: ChatRequest):
    return StreamingResponse(
        agentic_loop(request),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@app.get("/api/health")
async def health():
    return {"status": "ok", "model": MODEL}
