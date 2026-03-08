"""
WhatsApp Cloud API connector for MANIK.AI.

Setup (Meta WhatsApp Business API — free 1000 conversations/month):
  1. Go to developers.facebook.com → Create App → WhatsApp
  2. Get Phone Number ID + Permanent Access Token
  3. Configure webhook URL: https://your-domain/api/whatsapp/webhook
  4. Set WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_ACCESS_TOKEN, WHATSAPP_VERIFY_TOKEN in .env

Webhook endpoints:
  GET  /api/whatsapp/webhook  → Meta verification challenge
  POST /api/whatsapp/webhook  → Incoming messages
"""

from __future__ import annotations

import asyncio
import logging
from typing import Callable, Awaitable

import requests

logger = logging.getLogger(__name__)

AgentFn = Callable[[str, str], Awaitable[str]]  # (message, from_number) -> reply


class WhatsAppConnector:
    """Handles WhatsApp Cloud API webhooks and sends replies."""

    GRAPH_API = "https://graph.facebook.com/v19.0"

    def __init__(
        self,
        phone_number_id: str,
        access_token: str,
        verify_token: str,
        agent_fn: AgentFn,
    ):
        self.phone_number_id = phone_number_id
        self.access_token = access_token
        self.verify_token = verify_token
        self.agent_fn = agent_fn
        self._messages_url = f"{self.GRAPH_API}/{phone_number_id}/messages"

    def verify_webhook(self, mode: str, token: str, challenge: str) -> str | None:
        """
        Verify the Meta webhook subscription.
        Returns the challenge string on success, None on failure.
        """
        if mode == "subscribe" and token == self.verify_token:
            logger.info("[WhatsApp] Webhook verified successfully")
            return challenge
        logger.warning("[WhatsApp] Webhook verification failed")
        return None

    async def handle_payload(self, payload: dict):
        """Parse incoming WhatsApp payload and dispatch to agent."""
        try:
            entries = payload.get("entry", [])
            for entry in entries:
                for change in entry.get("changes", []):
                    if change.get("field") != "messages":
                        continue
                    value = change.get("value", {})
                    messages = value.get("messages", [])

                    for msg in messages:
                        msg_type = msg.get("type")

                        if msg_type == "text":
                            text = msg["text"]["body"]
                            from_num = msg["from"]

                            logger.info(f"[WhatsApp] +{from_num}: {text[:60]}")

                            # Mark as read
                            await self._mark_read(msg["id"])

                            # Process through agent
                            response = await self.agent_fn(text, from_num)

                            await self._send_message(from_num, response)

                        elif msg_type == "audio":
                            from_num = msg["from"]
                            await self._send_message(
                                from_num,
                                "Audio messages abhi supported nahi hain. Text mein likhein."
                            )

        except Exception as exc:
            logger.error(f"[WhatsApp] Error handling payload: {exc}")

    async def _send_message(self, to: str, text: str):
        """Send a WhatsApp text message."""
        # WhatsApp 4096 char limit
        if len(text) > 4000:
            text = text[:3997] + "…"

        payload = {
            "messaging_product": "whatsapp",
            "to": to,
            "type": "text",
            "text": {"body": text, "preview_url": False},
        }
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json",
        }

        try:
            resp = await asyncio.to_thread(
                lambda: requests.post(
                    self._messages_url, json=payload, headers=headers, timeout=30
                )
            )
            if resp.status_code not in (200, 201):
                logger.error(f"[WhatsApp] Send error {resp.status_code}: {resp.text[:200]}")
        except Exception as exc:
            logger.error(f"[WhatsApp] Send failed: {exc}")

    async def _mark_read(self, message_id: str):
        """Mark a message as read (shows double blue ticks)."""
        payload = {
            "messaging_product": "whatsapp",
            "status": "read",
            "message_id": message_id,
        }
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json",
        }
        try:
            await asyncio.to_thread(
                lambda: requests.post(
                    self._messages_url, json=payload, headers=headers, timeout=10
                )
            )
        except Exception:
            pass  # Non-critical

    @property
    def is_configured(self) -> bool:
        return bool(self.phone_number_id and self.access_token and self.verify_token)
