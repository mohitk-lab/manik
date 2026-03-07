import os
import subprocess
import json
import requests
from pathlib import Path

WORKSPACE = Path(__file__).parent / "workspace"
WORKSPACE.mkdir(exist_ok=True)

TOOL_DEFINITIONS = [
    {
        "name": "write_file",
        "description": "Write content to a file in the workspace. Use this to save promo scripts, configs, templates, or any generated content.",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "Relative file path (e.g. 'scripts/bhojpuri_promo.txt')"},
                "content": {"type": "string", "description": "Text content to write"},
            },
            "required": ["path", "content"],
        },
    },
    {
        "name": "read_file",
        "description": "Read a file from the workspace.",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "Relative file path to read"},
            },
            "required": ["path"],
        },
    },
    {
        "name": "list_files",
        "description": "List files in the workspace directory.",
        "input_schema": {
            "type": "object",
            "properties": {
                "directory": {"type": "string", "description": "Relative directory path (default: '.')"},
            },
        },
    },
    {
        "name": "run_command",
        "description": "Run a shell command in the workspace directory. Use for ffmpeg, python scripts, file operations, etc.",
        "input_schema": {
            "type": "object",
            "properties": {
                "command": {"type": "string", "description": "Shell command to execute"},
            },
            "required": ["command"],
        },
    },
    {
        "name": "elevenlabs_tts",
        "description": "Generate voice audio using ElevenLabs TTS API. Saves an mp3 file to the workspace.",
        "input_schema": {
            "type": "object",
            "properties": {
                "text": {"type": "string", "description": "Text to convert to speech"},
                "voice_id": {"type": "string", "description": "ElevenLabs voice ID"},
                "stability": {"type": "number", "description": "Voice stability (0.0-1.0). Use 0.3-0.5 for action, 0.5-0.7 for drama, 0.6-0.8 for devotional"},
                "output_path": {"type": "string", "description": "Output file path relative to workspace (e.g. 'audio/promo_vo.mp3')"},
            },
            "required": ["text", "voice_id", "output_path"],
        },
    },
    {
        "name": "web_search",
        "description": "Search the web for information. Use for competitor intel (JioCinema, Zee5, MX Player), market data, show information, or any research.",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Search query"},
            },
            "required": ["query"],
        },
    },
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


def tool_run_command(command: str) -> str:
    try:
        result = subprocess.run(
            command,
            shell=True,
            cwd=str(WORKSPACE),
            capture_output=True,
            text=True,
            timeout=30,
        )
        output = []
        if result.stdout:
            output.append(result.stdout.strip())
        if result.stderr:
            output.append(f"[stderr] {result.stderr.strip()}")
        output.append(f"[exit code: {result.returncode}]")
        return "\n".join(output) or "Command completed with no output"
    except subprocess.TimeoutExpired:
        return "✗ Command timed out (30s limit)"
    except Exception as e:
        return f"✗ run_command error: {e}"


def tool_elevenlabs_tts(text: str, voice_id: str, output_path: str, stability: float = 0.5) -> str:
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
        resp = requests.post(url, json=body, headers=headers, timeout=60)
        if resp.status_code != 200:
            return f"✗ ElevenLabs error {resp.status_code}: {resp.text[:200]}"
        target.write_bytes(resp.content)
        size_kb = len(resp.content) // 1024
        return f"✓ Audio saved to workspace/{output_path} ({size_kb}KB)"
    except Exception as e:
        return f"✗ elevenlabs_tts error: {e}"


def tool_web_search(query: str) -> str:
    try:
        from duckduckgo_search import DDGS
        results = []
        with DDGS() as ddgs:
            for r in ddgs.text(query, max_results=5):
                results.append(f"**{r['title']}**\n{r['href']}\n{r['body']}\n")
        if not results:
            return f"No results found for: {query}"
        return f"Search results for '{query}':\n\n" + "\n---\n".join(results)
    except Exception as e:
        return f"✗ web_search error: {e}"


def execute_tool(name: str, tool_input: dict) -> str:
    """Dispatch tool calls by name."""
    if name == "write_file":
        return tool_write_file(tool_input["path"], tool_input["content"])
    elif name == "read_file":
        return tool_read_file(tool_input["path"])
    elif name == "list_files":
        return tool_list_files(tool_input.get("directory", "."))
    elif name == "run_command":
        return tool_run_command(tool_input["command"])
    elif name == "elevenlabs_tts":
        return tool_elevenlabs_tts(
            tool_input["text"],
            tool_input["voice_id"],
            tool_input["output_path"],
            tool_input.get("stability", 0.5),
        )
    elif name == "web_search":
        return tool_web_search(tool_input["query"])
    else:
        return f"✗ Unknown tool: {name}"
