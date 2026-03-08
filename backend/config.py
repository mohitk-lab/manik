"""
Centralized configuration — reads .env files and exports typed constants.
All backend modules should import from here, not from os.environ directly.
"""

import os
from pathlib import Path

from dotenv import load_dotenv

# Load .env from repo root, then backend/ as fallback
load_dotenv(Path(__file__).parent.parent / ".env")
load_dotenv(Path(__file__).parent / ".env")

# ── Model Config ──────────────────────────────────────────────────────────────
OPENROUTER_API_KEY: str = os.environ.get("OPENROUTER_API_KEY", "")

# Smart switching tier models (override via env vars)
MODEL_MINI:     str = os.environ.get("MODEL_MINI",     "anthropic/claude-haiku-4.5")
MODEL_STANDARD: str = os.environ.get("MODEL_STANDARD", "anthropic/claude-sonnet-4.6")
MODEL_POWER:    str = os.environ.get("MODEL_POWER",    "anthropic/claude-opus-4.6")

# Set SMART_ROUTING=false to always use MODEL_STANDARD
SMART_ROUTING: bool = os.environ.get("SMART_ROUTING", "true").lower() == "true"

MAX_TOKENS: int = int(os.environ.get("MAX_TOKENS", "4096"))

# ── CORS ─────────────────────────────────────────────────────────────────────
FRONTEND_URL: str = os.environ.get("FRONTEND_URL", "")

# ── Messaging Connectors ──────────────────────────────────────────────────────
TELEGRAM_BOT_TOKEN: str = os.environ.get("TELEGRAM_BOT_TOKEN", "")

WHATSAPP_PHONE_NUMBER_ID: str = os.environ.get("WHATSAPP_PHONE_NUMBER_ID", "")
WHATSAPP_ACCESS_TOKEN:    str = os.environ.get("WHATSAPP_ACCESS_TOKEN", "")
WHATSAPP_VERIFY_TOKEN:    str = os.environ.get("WHATSAPP_VERIFY_TOKEN", "manik-ai-verify")

# ── Google Integration ────────────────────────────────────────────────────────
# Paste the full JSON as a string (or set GOOGLE_CREDENTIALS_FILE to a file path)
GOOGLE_CREDENTIALS_JSON: str = os.environ.get("GOOGLE_CREDENTIALS_JSON", "")
GOOGLE_TOKEN_JSON:        str = os.environ.get("GOOGLE_TOKEN_JSON", "")

# ── ElevenLabs ────────────────────────────────────────────────────────────────
ELEVENLABS_API_KEY: str = os.environ.get("ELEVENLABS_API_KEY", "")
