"""Tests for plugin_loader.py — config loading, skill/tool filtering."""

import pytest
from unittest.mock import patch


class TestGetSkills:

    def test_returns_a_list(self):
        from plugin_loader import get_skills
        result = get_skills()
        assert isinstance(result, list)


class TestGetQuickActions:

    def test_returns_a_list(self):
        from plugin_loader import get_quick_actions
        result = get_quick_actions()
        assert isinstance(result, list)


class TestGetAgentName:

    def test_returns_a_string(self):
        from plugin_loader import get_agent_name
        result = get_agent_name()
        assert isinstance(result, str)
        assert len(result) > 0  # should at least be "MANIK.AI"


class TestGetPersonalityExtra:

    def test_returns_a_string(self):
        from plugin_loader import get_personality_extra
        result = get_personality_extra()
        assert isinstance(result, str)


class TestGetActiveToolDefinitions:

    def _make_tool(self, name: str) -> dict:
        return {
            "type": "function",
            "function": {
                "name": name,
                "description": f"Test tool {name}",
                "parameters": {"type": "object", "properties": {}},
            },
        }

    def test_all_tools_enabled_when_no_config(self):
        """When tools config is empty, all tools should be returned."""
        import plugin_loader
        all_tools = [self._make_tool("a"), self._make_tool("b"), self._make_tool("c")]
        with patch.object(plugin_loader, "config", {}):
            result = plugin_loader.get_active_tool_definitions(all_tools)
        assert len(result) == 3

    def test_filters_disabled_tools(self):
        """Tools marked enabled=false in config should be filtered out."""
        import plugin_loader
        all_tools = [self._make_tool("a"), self._make_tool("b"), self._make_tool("c")]
        fake_config = {
            "tools": {
                "a": {"enabled": True},
                "b": {"enabled": False},
                "c": {"enabled": True},
            }
        }
        with patch.object(plugin_loader, "config", fake_config):
            result = plugin_loader.get_active_tool_definitions(all_tools)
        result_names = [t["function"]["name"] for t in result]
        assert "a" in result_names
        assert "b" not in result_names
        assert "c" in result_names

    def test_defaults_to_enabled_if_not_listed(self):
        """Tools not mentioned in config should default to enabled."""
        import plugin_loader
        all_tools = [self._make_tool("a"), self._make_tool("unlisted")]
        fake_config = {
            "tools": {
                "a": {"enabled": True},
                # "unlisted" is not in config
            }
        }
        with patch.object(plugin_loader, "config", fake_config):
            result = plugin_loader.get_active_tool_definitions(all_tools)
        result_names = [t["function"]["name"] for t in result]
        assert "unlisted" in result_names


class TestReload:

    def test_reload_does_not_crash(self):
        """reload() should not raise even if config file is missing."""
        from plugin_loader import reload
        # Should not raise
        reload()


class TestGetSmartRoutingConfig:

    def test_returns_dict(self):
        from plugin_loader import get_smart_routing_config
        result = get_smart_routing_config()
        assert isinstance(result, dict)
