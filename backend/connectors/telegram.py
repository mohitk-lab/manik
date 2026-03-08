"""
Telegram Bot connector for MANIK.AI.

Setup:
  1. Create a bot via @BotFather on Telegram → get token
  2. Set TELEGRAM_BOT_TOKEN in your .env
  3. Start the app — bot begins polling automatically

The bot runs as a background asyncio task alongside FastAPI.
"""

from __future__ import annotations

import asyncio
import logging
from typing import Callable, Awaitable

logger = logging.getLogger(__name__)

AgentFn = Callable[[str, str], Awaitable[str]]  # (message, from_user) -> reply


class TelegramConnector:
    """Wraps python-telegram-bot to forward messages through MANIK.AI agent."""

    def __init__(self, token: str, agent_fn: AgentFn):
        self.token = token
        self.agent_fn = agent_fn
        self._app = None
        self._task = None

    async def _handle_message(self, update, context):
        """Handle incoming Telegram text message."""
        try:
            from telegram import Update
            from telegram.ext import ContextTypes
            text = update.message.text or ""
            from_name = (
                update.message.from_user.first_name
                or update.message.from_user.username
                or "User"
            )
            chat_id = update.effective_chat.id

            logger.info(f"[Telegram] {from_name}: {text[:60]}")

            # Show typing indicator
            await context.bot.send_chat_action(chat_id=chat_id, action="typing")

            response = await self.agent_fn(text, from_name)

            # Telegram max 4096 chars per message
            if len(response) > 4000:
                chunks = [response[i : i + 4000] for i in range(0, len(response), 4000)]
                for chunk in chunks:
                    await update.message.reply_text(chunk)
            else:
                await update.message.reply_text(response)

        except Exception as exc:
            logger.error(f"[Telegram] Error handling message: {exc}")
            try:
                await update.message.reply_text(
                    "Kuch gadbad ho gayi — try again in a moment."
                )
            except Exception:
                pass

    async def start(self):
        """Initialize and start polling in background."""
        try:
            from telegram.ext import Application, MessageHandler, filters

            self._app = (
                Application.builder()
                .token(self.token)
                .build()
            )
            self._app.add_handler(
                MessageHandler(filters.TEXT & ~filters.COMMAND, self._handle_message)
            )

            await self._app.initialize()
            await self._app.start()
            await self._app.updater.start_polling(drop_pending_updates=True)
            logger.info("[Telegram] Bot started — polling for messages")

        except ImportError:
            logger.warning(
                "[Telegram] python-telegram-bot not installed. "
                "Run: pip install python-telegram-bot"
            )
        except Exception as exc:
            logger.error(f"[Telegram] Failed to start bot: {exc}")

    async def stop(self):
        """Stop the bot gracefully."""
        if self._app:
            try:
                await self._app.updater.stop()
                await self._app.stop()
                await self._app.shutdown()
                logger.info("[Telegram] Bot stopped")
            except Exception as exc:
                logger.error(f"[Telegram] Error stopping bot: {exc}")

    @property
    def is_running(self) -> bool:
        return (
            self._app is not None
            and self._app.updater is not None
            and self._app.updater.running
        )
