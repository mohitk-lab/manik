"""
Smart Model Router — routes each query to the cheapest model tier
that can handle it well, saving token costs without sacrificing quality.

Tier logic:
  MINI     → simple Q&A, greetings, short factual answers       (~8x cheaper than POWER)
  STANDARD → coding help, analysis, creative writing, planning  (default)
  POWER    → multi-step agentic tasks, deep research, architecture (~5x more than STANDARD)
"""

from __future__ import annotations

import re
from config import MODEL_MINI, MODEL_STANDARD, MODEL_POWER, SMART_ROUTING

# ── Scoring signal tables ─────────────────────────────────────────────────────

# +2 each — signals complex, tool-heavy, multi-step tasks
POWER_SIGNALS = [
    "architecture", "architect", "design system", "build", "implement",
    "full pipeline", "daksh", "orchestrate", "multi-step", "automate",
    "integrate", "deploy", "docker", "infrastructure", "database",
    "debug", "fix bug", "refactor", "optimize", "performance",
    "research", "analyze in depth", "deep dive", "comprehensive",
    "bana do", "pura system", "end to end", "system design",
]

# +1 each — medium complexity
STANDARD_SIGNALS = [
    "code", "script", "function", "api", "class", "query",
    "analyze", "compare", "strategy", "plan", "outline",
    "write", "create", "generate", "explain how",
    "promo", "daksh", "pipeline", "whatsapp", "telegram",
    "calendar", "email", "gmail", "schedule",
    "bhojpuri", "haryanvi", "dialect", "regional",
    "likh", "banao", "samjhao", "batao detail",
]

# -2 each — signals simple, single-turn queries
SIMPLE_SIGNALS = [
    "kya hai", "what is", "define ", "hello", "hi ", "namaste",
    "thanks", "shukriya", "ok", "yes", "no", "haan", "nahi",
    "ek line mein", "briefly", "short answer", "quick question",
    "summarize briefly", "in one sentence", "ek sentence",
]


class SmartRouter:
    """Route a query to the optimal model tier."""

    TIERS = {
        "mini":     MODEL_MINI,
        "standard": MODEL_STANDARD,
        "power":    MODEL_POWER,
    }

    def route(
        self,
        message: str,
        history_len: int = 0,
        has_tools_predicted: bool = False,
    ) -> tuple[str, str]:
        """
        Returns (model_id, tier_name).
        tier_name is one of: "mini" | "standard" | "power"
        """
        if not SMART_ROUTING:
            return MODEL_STANDARD, "standard"

        msg_lower = message.lower()
        score = 0

        # ── Length scoring
        length = len(message)
        if length > 150:
            score += 1
        if length > 400:
            score += 1
        if length > 900:
            score += 2

        # ── Power signals (+2 per hit, max 3 hits counted)
        power_hits = sum(1 for s in POWER_SIGNALS if s in msg_lower)
        score += min(power_hits, 3) * 2

        # ── Standard signals (+1 per hit, max 3 hits)
        std_hits = sum(1 for s in STANDARD_SIGNALS if s in msg_lower)
        score += min(std_hits, 3)

        # ── Simple signals (−2 per hit)
        simple_hits = sum(1 for s in SIMPLE_SIGNALS if s in msg_lower)
        score -= simple_hits * 2

        # ── History depth (deep context → more complex)
        if history_len > 8:
            score += 1
        if history_len > 20:
            score += 2

        # ── Tool prediction
        if has_tools_predicted:
            score += 2

        # ── Route decision
        if score <= 0:
            return MODEL_MINI, "mini"
        elif score <= 5:
            return MODEL_STANDARD, "standard"
        else:
            return MODEL_POWER, "power"

    def tier_label(self, tier: str) -> str:
        labels = {"mini": "⚡ MINI", "standard": "◈ STD", "power": "◉ POWER"}
        return labels.get(tier, tier.upper())


smart_router = SmartRouter()
