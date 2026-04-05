"""Tests for smart_router.py — SmartRouter tier routing logic."""

import pytest
from unittest.mock import patch


class TestSmartRouterSimpleGreetings:
    """Simple greetings should route to mini tier (score <= 0)."""

    def test_hello_routes_to_mini(self):
        from smart_router import SmartRouter
        router = SmartRouter()
        _, tier = router.route("hello")
        assert tier == "mini"

    def test_hi_routes_to_mini(self):
        from smart_router import SmartRouter
        router = SmartRouter()
        _, tier = router.route("hi there")
        assert tier == "mini"

    def test_kya_hai_routes_to_mini(self):
        from smart_router import SmartRouter
        router = SmartRouter()
        _, tier = router.route("kya hai bhai")
        assert tier == "mini"

    def test_namaste_routes_to_mini(self):
        from smart_router import SmartRouter
        router = SmartRouter()
        _, tier = router.route("namaste")
        assert tier == "mini"

    def test_thanks_routes_to_mini(self):
        from smart_router import SmartRouter
        router = SmartRouter()
        _, tier = router.route("thanks")
        assert tier == "mini"


class TestSmartRouterStandardTier:
    """Coding / analysis queries should route to standard tier."""

    def test_python_function_routes_to_standard(self):
        from smart_router import SmartRouter
        router = SmartRouter()
        _, tier = router.route("write a python function to sort a list")
        assert tier == "standard"

    def test_create_api_endpoint_routes_to_standard(self):
        from smart_router import SmartRouter
        router = SmartRouter()
        _, tier = router.route("create an api endpoint for user login")
        assert tier == "standard"

    def test_explain_code_routes_to_standard(self):
        from smart_router import SmartRouter
        router = SmartRouter()
        _, tier = router.route("explain how this script works")
        assert tier == "standard"


class TestSmartRouterPowerTier:
    """Complex multi-step queries should route to power tier."""

    def test_full_pipeline_architecture_docker(self):
        from smart_router import SmartRouter
        router = SmartRouter()
        _, tier = router.route(
            "build a full pipeline architecture with docker deployment and database integration"
        )
        assert tier == "power"

    def test_system_design_and_deploy(self):
        from smart_router import SmartRouter
        router = SmartRouter()
        _, tier = router.route(
            "design system architecture, implement the backend, and deploy with docker"
        )
        assert tier == "power"

    def test_deep_research_comprehensive(self):
        from smart_router import SmartRouter
        router = SmartRouter()
        _, tier = router.route(
            "research and analyze in depth the comprehensive infrastructure for orchestrating multi-step automation"
        )
        assert tier == "power"


class TestSmartRouterDisabled:
    """When SMART_ROUTING is False, always return standard."""

    def test_disabled_returns_standard_for_greeting(self):
        from smart_router import SmartRouter
        import smart_router as sr_module
        router = SmartRouter()
        with patch.object(sr_module, "SMART_ROUTING", False):
            model, tier = router.route("hello")
        assert tier == "standard"

    def test_disabled_returns_standard_for_complex(self):
        from smart_router import SmartRouter
        import smart_router as sr_module
        router = SmartRouter()
        with patch.object(sr_module, "SMART_ROUTING", False):
            model, tier = router.route(
                "build a full pipeline architecture with docker deployment"
            )
        assert tier == "standard"


class TestSmartRouterEdgeCases:
    """Edge cases: empty, very long, deep history."""

    def test_empty_message(self):
        from smart_router import SmartRouter
        router = SmartRouter()
        model, tier = router.route("")
        # Empty message has score 0, should be mini
        assert tier == "mini"

    def test_very_long_message_gets_score_boost(self):
        from smart_router import SmartRouter
        router = SmartRouter()
        # >900 chars should get +2 from length plus +1 from >150 and +1 from >400
        long_msg = "a " * 500  # 1000 chars
        model_short, tier_short = router.route("test")
        model_long, tier_long = router.route(long_msg)
        # The long message should score higher than a plain short message
        # Score for long: +1 (>150) +1 (>400) +2 (>900) = 4, so standard
        assert tier_long in ("standard", "power")

    def test_history_len_over_20_boosts_score(self):
        from smart_router import SmartRouter
        router = SmartRouter()
        # A neutral short message with no signals and history_len=0 -> mini
        _, tier_no_history = router.route("test", history_len=0)
        # Same message but with deep history -> score gets +1 (>8) +2 (>20) = +3
        _, tier_deep_history = router.route("test", history_len=25)
        assert tier_no_history == "mini"
        assert tier_deep_history == "standard"

    def test_tools_predicted_boosts_score(self):
        from smart_router import SmartRouter
        router = SmartRouter()
        _, tier_no_tools = router.route("test", has_tools_predicted=False)
        _, tier_tools = router.route("test", has_tools_predicted=True)
        assert tier_no_tools == "mini"
        assert tier_tools == "standard"

    def test_route_returns_model_and_tier(self):
        from smart_router import SmartRouter
        router = SmartRouter()
        result = router.route("hello")
        assert isinstance(result, tuple)
        assert len(result) == 2
        model, tier = result
        assert isinstance(model, str)
        assert tier in ("mini", "standard", "power")


class TestSmartRouterTierLabel:
    """Test the tier_label helper."""

    def test_mini_label(self):
        from smart_router import SmartRouter
        router = SmartRouter()
        assert "MINI" in router.tier_label("mini")

    def test_standard_label(self):
        from smart_router import SmartRouter
        router = SmartRouter()
        assert "STD" in router.tier_label("standard")

    def test_power_label(self):
        from smart_router import SmartRouter
        router = SmartRouter()
        assert "POWER" in router.tier_label("power")

    def test_unknown_label(self):
        from smart_router import SmartRouter
        router = SmartRouter()
        assert router.tier_label("unknown") == "UNKNOWN"
