"""Tests for main.py — FastAPI endpoint integration tests."""

import pytest
from httpx import AsyncClient, ASGITransport


@pytest.fixture
async def client():
    from main import app
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


class TestHealthEndpoint:

    @pytest.mark.asyncio
    async def test_health_returns_ok(self, client):
        resp = await client.get("/api/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "ok"

    @pytest.mark.asyncio
    async def test_health_returns_version(self, client):
        resp = await client.get("/api/health")
        data = resp.json()
        assert "version" in data
        assert isinstance(data["version"], str)

    @pytest.mark.asyncio
    async def test_health_includes_models(self, client):
        resp = await client.get("/api/health")
        data = resp.json()
        assert "models" in data
        assert "mini" in data["models"]
        assert "standard" in data["models"]
        assert "power" in data["models"]


class TestConfigEndpoint:

    @pytest.mark.asyncio
    async def test_config_returns_skills(self, client):
        resp = await client.get("/api/config")
        assert resp.status_code == 200
        data = resp.json()
        assert "skills" in data
        assert isinstance(data["skills"], list)

    @pytest.mark.asyncio
    async def test_config_returns_quick_actions(self, client):
        resp = await client.get("/api/config")
        data = resp.json()
        assert "quick_actions" in data
        assert isinstance(data["quick_actions"], list)

    @pytest.mark.asyncio
    async def test_config_returns_smart_routing(self, client):
        resp = await client.get("/api/config")
        data = resp.json()
        assert "smart_routing" in data

    @pytest.mark.asyncio
    async def test_config_returns_agent(self, client):
        resp = await client.get("/api/config")
        data = resp.json()
        assert "agent" in data
        assert "name" in data["agent"]


class TestConfigReload:

    @pytest.mark.asyncio
    async def test_reload_returns_reloaded(self, client):
        resp = await client.post("/api/config/reload")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "reloaded"

    @pytest.mark.asyncio
    async def test_reload_returns_skills_count(self, client):
        resp = await client.post("/api/config/reload")
        data = resp.json()
        assert "skills" in data
        assert isinstance(data["skills"], int)


class TestConnectorsStatus:

    @pytest.mark.asyncio
    async def test_connectors_status_structure(self, client):
        resp = await client.get("/api/connectors/status")
        assert resp.status_code == 200
        data = resp.json()
        assert "telegram" in data
        assert "whatsapp" in data
        assert "google" in data

    @pytest.mark.asyncio
    async def test_telegram_has_configured_field(self, client):
        resp = await client.get("/api/connectors/status")
        data = resp.json()
        assert "configured" in data["telegram"]
        assert isinstance(data["telegram"]["configured"], bool)

    @pytest.mark.asyncio
    async def test_whatsapp_has_configured_field(self, client):
        resp = await client.get("/api/connectors/status")
        data = resp.json()
        assert "configured" in data["whatsapp"]
        assert isinstance(data["whatsapp"]["configured"], bool)

    @pytest.mark.asyncio
    async def test_google_has_configured_field(self, client):
        resp = await client.get("/api/connectors/status")
        data = resp.json()
        assert "configured" in data["google"]
        assert isinstance(data["google"]["configured"], bool)
