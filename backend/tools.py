import asyncio
import json
import os
import requests
from pathlib import Path

WORKSPACE = Path(__file__).parent / "workspace"
WORKSPACE.mkdir(exist_ok=True)

def _fn(name, description, properties, required=None):
    """Helper — build an OpenAI-format tool definition."""
    schema = {"type": "object", "properties": properties}
    if required:
        schema["required"] = required
    return {"type": "function", "function": {"name": name, "description": description, "parameters": schema}}


TOOL_DEFINITIONS = [
    _fn("write_file", "Write content to a file in the workspace. Use to save promo scripts, configs, templates, or any generated content.", {
        "path":    {"type": "string", "description": "Relative file path (e.g. 'scripts/bhojpuri_promo.txt')"},
        "content": {"type": "string", "description": "Text content to write"},
    }, required=["path", "content"]),

    _fn("read_file", "Read a file from the workspace.", {
        "path": {"type": "string", "description": "Relative file path to read"},
    }, required=["path"]),

    _fn("list_files", "List files in the workspace directory.", {
        "directory": {"type": "string", "description": "Relative directory path (default: '.')"},
    }),

    _fn("run_command", "Run a shell command in the workspace directory. Use for ffmpeg, python scripts, file operations, etc.", {
        "command": {"type": "string", "description": "Shell command to execute"},
    }, required=["command"]),

    _fn("elevenlabs_tts", "Generate voice audio using ElevenLabs TTS API. Saves an mp3 file to the workspace.", {
        "text":        {"type": "string", "description": "Text to convert to speech"},
        "voice_id":    {"type": "string", "description": "ElevenLabs voice ID"},
        "stability":   {"type": "number", "description": "Voice stability (0.0-1.0)"},
        "output_path": {"type": "string", "description": "Output file path relative to workspace (e.g. 'audio/promo_vo.mp3')"},
    }, required=["text", "voice_id", "output_path"]),

    _fn("web_search", "Search the web for information. Use for competitor intel, market data, show information, or any research.", {
        "query": {"type": "string", "description": "Search query"},
    }, required=["query"]),

    _fn("calendar_list_events", "List upcoming events from Google Calendar.", {
        "max_results": {"type": "integer", "description": "Max events to return (default 10)"},
        "calendar_id": {"type": "string",  "description": "Calendar ID (default: primary)"},
    }),

    _fn("calendar_create_event", "Create a new event in Google Calendar.", {
        "title":       {"type": "string", "description": "Event title/summary"},
        "start":       {"type": "string", "description": "Start datetime ISO 8601, e.g. '2025-03-15T10:00:00+05:30'"},
        "end":         {"type": "string", "description": "End datetime ISO 8601"},
        "description": {"type": "string", "description": "Event description (optional)"},
        "attendees":   {"type": "array",  "items": {"type": "string"}, "description": "List of attendee emails"},
    }, required=["title", "start", "end"]),

    _fn("gmail_list_emails", "List recent emails from Gmail inbox.", {
        "max_results": {"type": "integer", "description": "Max emails to return (default 10)"},
        "query":       {"type": "string",  "description": "Gmail search query, e.g. 'is:unread'"},
    }),

    _fn("gmail_send_email", "Send an email via Gmail.", {
        "to":      {"type": "string", "description": "Recipient email address"},
        "subject": {"type": "string", "description": "Email subject"},
        "body":    {"type": "string", "description": "Email body (plain text)"},
        "cc":      {"type": "string", "description": "CC email address (optional)"},
    }, required=["to", "subject", "body"]),
]


def _safe_path(relative_path: str) -> Path:
    """Resolve path relative to workspace, preventing directory traversal."""
    full = (WORKSPACE / relative_path).resolve()
    if not str(full).startswith(str(WORKSPACE.resolve())):
        raise ValueError(f"Path '{relative_path}' is outside workspace")
    return full


def tool_write_file(path: str, content: str) -> str:
    try:
        target = _safe_path(path)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(content, encoding="utf-8")
        return f"✓ Saved to workspace/{path} ({len(content)} chars)"
    except Exception as e:
        return f"✗ write_file error: {e}"


def tool_read_file(path: str) -> str:
    try:
        target = _safe_path(path)
        if not target.exists():
            return f"✗ File not found: workspace/{path}"
        content = target.read_text(encoding="utf-8")
        return f"Content of workspace/{path}:\n\n{content}"
    except Exception as e:
        return f"✗ read_file error: {e}"


def tool_list_files(directory: str = ".") -> str:
    try:
        target = _safe_path(directory)
        if not target.exists():
            return f"✗ Directory not found: workspace/{directory}"
        entries = []
        for p in sorted(target.rglob("*")):
            if p.name == ".gitkeep":
                continue
            rel = p.relative_to(WORKSPACE)
            entries.append(f"{'[DIR] ' if p.is_dir() else '      '}{rel}")
        if not entries:
            return "workspace/ is empty"
        return "workspace/\n" + "\n".join(entries)
    except Exception as e:
        return f"✗ list_files error: {e}"


BLOCKED_COMMANDS = [
    "rm -rf /", "rm -rf /*", "mkfs", "dd if=", ":(){", "fork bomb",
    "chmod -R 777 /", "shutdown", "reboot", "halt", "poweroff",
    "curl | sh", "curl | bash", "wget | sh", "wget | bash",
    "> /dev/sda", "mv / ", "rm -rf ~",
]


def _is_command_safe(command: str) -> bool:
    """Check command against blocklist."""
    cmd_lower = command.lower().strip()
    for blocked in BLOCKED_COMMANDS:
        if blocked in cmd_lower:
            return False
    # Block commands that try to escape workspace
    if ".." in command and ("/" in command or "\\" in command):
        return False
    return True


async def tool_run_command(command: str) -> str:
    if not _is_command_safe(command):
        return "✗ Command blocked: this command matches a dangerous pattern and has been rejected for safety."
    try:
        proc = await asyncio.create_subprocess_shell(
            command,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            cwd=str(WORKSPACE),
        )
        try:
            stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=30.0)
        except asyncio.TimeoutError:
            proc.kill()
            return "✗ Command timed out (30s limit)"
        output = []
        if stdout:
            output.append(stdout.decode("utf-8", errors="replace").strip())
        if stderr:
            output.append(f"[stderr] {stderr.decode('utf-8', errors='replace').strip()}")
        output.append(f"[exit code: {proc.returncode}]")
        return "\n".join(output) or "Command completed with no output"
    except Exception as e:
        return f"✗ run_command error: {e}"


async def tool_elevenlabs_tts(text: str, voice_id: str, output_path: str, stability: float = 0.5) -> str:
    api_key = os.environ.get("ELEVENLABS_API_KEY")
    if not api_key:
        return "✗ ELEVENLABS_API_KEY not set in environment"
    try:
        target = _safe_path(output_path)
        target.parent.mkdir(parents=True, exist_ok=True)
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
        headers = {"xi-api-key": api_key, "Content-Type": "application/json"}
        body = {
            "text": text,
            "model_id": "eleven_multilingual_v2",
            "voice_settings": {
                "stability": stability,
                "similarity_boost": 0.75,
                "style": 0.4,
            },
        }
        resp = await asyncio.to_thread(
            lambda: requests.post(url, json=body, headers=headers, timeout=60)
        )
        if resp.status_code != 200:
            return f"✗ ElevenLabs error {resp.status_code}: {resp.text[:200]}"
        target.write_bytes(resp.content)
        size_kb = len(resp.content) // 1024
        return f"✓ Audio saved to workspace/{output_path} ({size_kb}KB)"
    except Exception as e:
        return f"✗ elevenlabs_tts error: {e}"


async def tool_web_search(query: str) -> str:
    try:
        from duckduckgo_search import DDGS
        results = await asyncio.to_thread(
            lambda: list(DDGS().text(query, max_results=5))
        )
        if not results:
            return f"No results found for: {query}"
        formatted = [
            f"**{r['title']}**\n{r['href']}\n{r['body']}\n"
            for r in results
        ]
        return f"Search results for '{query}':\n\n" + "\n---\n".join(formatted)
    except Exception as e:
        return f"✗ web_search error: {e}"


# ── Google helpers ────────────────────────────────────────────────────────────

def _get_google_service(api: str, version: str):
    """Build a Google API service from env-var credentials."""
    try:
        from google.oauth2.credentials import Credentials
        from googleapiclient.discovery import build

        from config import GOOGLE_TOKEN_JSON, GOOGLE_CREDENTIALS_JSON
    except ImportError:
        return None, "✗ Google libraries not installed. Run: pip install google-api-python-client google-auth"

    if not GOOGLE_TOKEN_JSON:
        return None, (
            "✗ GOOGLE_TOKEN_JSON not set. "
            "Set it in .env (paste your token.json contents as a single-line JSON string). "
            "See docs/google-setup.md for OAuth2 setup instructions."
        )

    try:
        token_data = json.loads(GOOGLE_TOKEN_JSON)
        creds = Credentials.from_authorized_user_info(token_data)
        service = build(api, version, credentials=creds)
        return service, None
    except Exception as e:
        return None, f"✗ Google auth error: {e}"


def tool_calendar_list_events(max_results: int = 10, calendar_id: str = "primary") -> str:
    service, err = _get_google_service("calendar", "v3")
    if err:
        return err
    try:
        from datetime import datetime, timezone
        now = datetime.now(timezone.utc).isoformat()
        result = (
            service.events()
            .list(
                calendarId=calendar_id,
                timeMin=now,
                maxResults=max_results,
                singleEvents=True,
                orderBy="startTime",
            )
            .execute()
        )
        events = result.get("items", [])
        if not events:
            return "No upcoming events found."
        lines = []
        for e in events:
            start = e["start"].get("dateTime", e["start"].get("date", "?"))
            lines.append(f"• {e.get('summary','(no title)')} — {start}")
        return f"Upcoming {len(events)} events:\n" + "\n".join(lines)
    except Exception as exc:
        return f"✗ calendar_list_events error: {exc}"


def tool_calendar_create_event(
    title: str, start: str, end: str,
    description: str = "", attendees: list | None = None
) -> str:
    service, err = _get_google_service("calendar", "v3")
    if err:
        return err
    try:
        body = {
            "summary": title,
            "description": description,
            "start": {"dateTime": start, "timeZone": "Asia/Kolkata"},
            "end":   {"dateTime": end,   "timeZone": "Asia/Kolkata"},
        }
        if attendees:
            body["attendees"] = [{"email": a} for a in attendees]

        event = service.events().insert(calendarId="primary", body=body).execute()
        return f"✓ Event created: {event.get('summary')} — {event.get('htmlLink')}"
    except Exception as exc:
        return f"✗ calendar_create_event error: {exc}"


def tool_gmail_list_emails(max_results: int = 10, query: str = "") -> str:
    service, err = _get_google_service("gmail", "v1")
    if err:
        return err
    try:
        params = {"userId": "me", "maxResults": max_results}
        if query:
            params["q"] = query
        result = service.users().messages().list(**params).execute()
        messages = result.get("messages", [])
        if not messages:
            return "No emails found."

        lines = []
        for m in messages[:max_results]:
            msg = service.users().messages().get(
                userId="me", id=m["id"], format="metadata",
                metadataHeaders=["Subject", "From", "Date"]
            ).execute()
            headers = {h["name"]: h["value"] for h in msg.get("payload", {}).get("headers", [])}
            lines.append(
                f"• [{headers.get('Date','?')[:16]}] "
                f"From: {headers.get('From','?')[:40]} | "
                f"Subject: {headers.get('Subject','(no subject)')[:60]}"
            )
        return f"Found {len(lines)} emails:\n" + "\n".join(lines)
    except Exception as exc:
        return f"✗ gmail_list_emails error: {exc}"


def tool_gmail_send_email(to: str, subject: str, body: str, cc: str = "") -> str:
    service, err = _get_google_service("gmail", "v1")
    if err:
        return err
    try:
        import base64
        from email.mime.text import MIMEText

        msg = MIMEText(body)
        msg["to"] = to
        msg["subject"] = subject
        if cc:
            msg["cc"] = cc

        raw = base64.urlsafe_b64encode(msg.as_bytes()).decode()
        service.users().messages().send(userId="me", body={"raw": raw}).execute()
        return f"✓ Email sent to {to} — Subject: {subject}"
    except Exception as exc:
        return f"✗ gmail_send_email error: {exc}"


# ── Tool dispatcher ───────────────────────────────────────────────────────────

async def execute_tool(name: str, tool_input: dict) -> str:
    """Async dispatch for all tool calls."""
    if name == "write_file":
        return tool_write_file(tool_input["path"], tool_input["content"])
    elif name == "read_file":
        return tool_read_file(tool_input["path"])
    elif name == "list_files":
        return tool_list_files(tool_input.get("directory", "."))
    elif name == "run_command":
        return await tool_run_command(tool_input["command"])
    elif name == "elevenlabs_tts":
        return await tool_elevenlabs_tts(
            tool_input["text"],
            tool_input["voice_id"],
            tool_input["output_path"],
            tool_input.get("stability", 0.5),
        )
    elif name == "web_search":
        return await tool_web_search(tool_input["query"])
    elif name == "calendar_list_events":
        return await asyncio.to_thread(
            tool_calendar_list_events,
            tool_input.get("max_results", 10),
            tool_input.get("calendar_id", "primary"),
        )
    elif name == "calendar_create_event":
        return await asyncio.to_thread(
            tool_calendar_create_event,
            tool_input["title"],
            tool_input["start"],
            tool_input["end"],
            tool_input.get("description", ""),
            tool_input.get("attendees"),
        )
    elif name == "gmail_list_emails":
        return await asyncio.to_thread(
            tool_gmail_list_emails,
            tool_input.get("max_results", 10),
            tool_input.get("query", ""),
        )
    elif name == "gmail_send_email":
        return await asyncio.to_thread(
            tool_gmail_send_email,
            tool_input["to"],
            tool_input["subject"],
            tool_input["body"],
            tool_input.get("cc", ""),
        )
    else:
        return f"✗ Unknown tool: {name}"
