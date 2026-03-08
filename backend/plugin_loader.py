"""
Plugin Loader — reads manik.config.yaml and provides:
  - skills list (for frontend)
  - active tool definitions (filtered by enabled flag)
  - quick actions
  - agent config

Usage:
    from plugin_loader import config, get_active_tool_definitions, get_skills
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)

_CONFIG_PATH = Path(__file__).parent.parent / "manik.config.yaml"

# ── Load config ───────────────────────────────────────────────────────────────

def _load() -> dict:
    try:
        import yaml
        with open(_CONFIG_PATH, "r", encoding="utf-8") as f:
            return yaml.safe_load(f) or {}
    except ImportError:
        logger.warning("PyYAML not installed — using defaults. pip install pyyaml")
        return {}
    except FileNotFoundError:
        logger.warning(f"manik.config.yaml not found at {_CONFIG_PATH} — using defaults")
        return {}
    except Exception as exc:
        logger.error(f"Failed to load manik.config.yaml: {exc} — using defaults")
        return {}


config: dict = _load()


def reload():
    """Hot-reload config at runtime (e.g. after editing manik.config.yaml)."""
    global config
    config = _load()
    logger.info("[plugin_loader] Config reloaded")


# ── Skills ────────────────────────────────────────────────────────────────────

def get_skills() -> list[dict]:
    """Return skill list from config (for frontend /api/config endpoint)."""
    return config.get("skills", [])


def get_quick_actions() -> list[dict]:
    return config.get("quick_actions", [])


# ── Tool filtering ────────────────────────────────────────────────────────────

def get_active_tool_definitions(all_tool_definitions: list[dict]) -> list[dict]:
    """
    Filter tool definitions based on enabled flags in manik.config.yaml.
    If a tool is not listed in config, it defaults to enabled=true.
    """
    tools_config: dict = config.get("tools", {})
    if not tools_config:
        return all_tool_definitions  # nothing configured → all enabled

    active = []
    for tool in all_tool_definitions:
        # OpenAI format: {"type":"function","function":{"name":...}}
        name = tool.get("function", {}).get("name") or tool.get("name", "")
        tool_cfg = tools_config.get(name, {})
        # Default to enabled if not specified
        if isinstance(tool_cfg, dict):
            enabled = tool_cfg.get("enabled", True)
        else:
            enabled = bool(tool_cfg)
        if enabled:
            active.append(tool)

    disabled = [t["name"] for t in all_tool_definitions if t not in active]
    if disabled:
        logger.info(f"[plugin_loader] Disabled tools: {disabled}")

    return active


# ── Agent config ──────────────────────────────────────────────────────────────

def get_personality_extra() -> str:
    return config.get("agent", {}).get("personality_extra", "") or ""


def get_agent_name() -> str:
    return config.get("agent", {}).get("name", "MANIK.AI")


def get_smart_routing_config() -> dict:
    return config.get("smart_routing", {})
