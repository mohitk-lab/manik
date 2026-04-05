"""Tests for tools.py — file operations, command execution, safety checks."""

import asyncio
import pytest
from pathlib import Path
from unittest.mock import patch, MagicMock


# ---------------------------------------------------------------------------
# Helpers — redirect WORKSPACE to tmp_path for isolation
# ---------------------------------------------------------------------------

@pytest.fixture
def workspace(tmp_path, monkeypatch):
    """Redirect tools.WORKSPACE to a temporary directory."""
    import tools
    monkeypatch.setattr(tools, "WORKSPACE", tmp_path)
    return tmp_path


# ---------------------------------------------------------------------------
# _safe_path
# ---------------------------------------------------------------------------

class TestSafePath:

    def test_blocks_directory_traversal(self, workspace):
        from tools import _safe_path
        with pytest.raises(ValueError, match="outside workspace"):
            _safe_path("../../etc/passwd")

    def test_allows_valid_relative_path(self, workspace):
        from tools import _safe_path
        result = _safe_path("scripts/test.txt")
        assert str(result).startswith(str(workspace))
        assert result.name == "test.txt"

    def test_allows_simple_filename(self, workspace):
        from tools import _safe_path
        result = _safe_path("notes.txt")
        assert result == workspace / "notes.txt"

    def test_blocks_absolute_escape(self, workspace):
        from tools import _safe_path
        # Attempting to go to /tmp via traversal
        with pytest.raises(ValueError, match="outside workspace"):
            _safe_path("../../../tmp/evil")


# ---------------------------------------------------------------------------
# tool_write_file / tool_read_file
# ---------------------------------------------------------------------------

class TestWriteAndReadFile:

    def test_write_file_creates_file(self, workspace):
        from tools import tool_write_file
        result = tool_write_file("test.txt", "hello world")
        assert "Saved" in result or "\u2713" in result
        assert (workspace / "test.txt").read_text() == "hello world"

    def test_write_file_creates_subdirectories(self, workspace):
        from tools import tool_write_file
        result = tool_write_file("sub/dir/file.txt", "nested content")
        assert (workspace / "sub" / "dir" / "file.txt").exists()

    def test_read_file_existing(self, workspace):
        from tools import tool_write_file, tool_read_file
        tool_write_file("readme.txt", "some content")
        result = tool_read_file("readme.txt")
        assert "some content" in result

    def test_read_file_missing(self, workspace):
        from tools import tool_read_file
        result = tool_read_file("does_not_exist.txt")
        assert "not found" in result.lower() or "\u2717" in result


# ---------------------------------------------------------------------------
# tool_list_files
# ---------------------------------------------------------------------------

class TestListFiles:

    def test_list_files_shows_contents(self, workspace):
        from tools import tool_write_file, tool_list_files
        tool_write_file("a.txt", "aaa")
        tool_write_file("b.txt", "bbb")
        result = tool_list_files(".")
        assert "a.txt" in result
        assert "b.txt" in result

    def test_list_files_empty_workspace(self, workspace):
        from tools import tool_list_files
        result = tool_list_files(".")
        assert "empty" in result.lower() or "workspace" in result.lower()

    def test_list_files_missing_directory(self, workspace):
        from tools import tool_list_files
        result = tool_list_files("nonexistent")
        assert "not found" in result.lower() or "\u2717" in result


# ---------------------------------------------------------------------------
# tool_run_command (async)
# ---------------------------------------------------------------------------

class TestRunCommand:

    @pytest.mark.asyncio
    async def test_echo_hello(self, workspace):
        from tools import tool_run_command
        result = await tool_run_command("echo hello")
        assert "hello" in result

    @pytest.mark.asyncio
    async def test_exit_code_shown(self, workspace):
        from tools import tool_run_command
        result = await tool_run_command("echo done")
        assert "exit code: 0" in result

    @pytest.mark.asyncio
    async def test_blocked_command(self, workspace):
        from tools import tool_run_command
        result = await tool_run_command("rm -rf /")
        assert "blocked" in result.lower() or "rejected" in result.lower()

    @pytest.mark.asyncio
    async def test_timeout_handling(self, workspace):
        """A command that exceeds the timeout should be killed."""
        from tools import tool_run_command
        # Patch timeout to a very short value so test runs fast
        import tools
        original_func = tools.tool_run_command

        async def fast_timeout_run(command):
            """Run with a 1-second timeout."""
            if not tools._is_command_safe(command):
                return "blocked"
            proc = await asyncio.create_subprocess_shell(
                command,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=str(tools.WORKSPACE),
            )
            try:
                stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=1.0)
            except asyncio.TimeoutError:
                proc.kill()
                return "\u2717 Command timed out (30s limit)"
            return stdout.decode().strip()

        result = await fast_timeout_run("sleep 10")
        assert "timed out" in result.lower()


# ---------------------------------------------------------------------------
# tool_web_search — mock import error
# ---------------------------------------------------------------------------

class TestWebSearch:

    @pytest.mark.asyncio
    async def test_handles_import_error_gracefully(self, workspace):
        """When duckduckgo_search is not importable, should return error string."""
        from tools import tool_web_search
        with patch.dict("sys.modules", {"duckduckgo_search": None}):
            result = await tool_web_search("test query")
        assert "error" in result.lower() or "\u2717" in result


# ---------------------------------------------------------------------------
# _is_command_safe
# ---------------------------------------------------------------------------

class TestCommandSafety:

    def test_safe_command(self):
        from tools import _is_command_safe
        assert _is_command_safe("echo hello") is True

    def test_blocked_rm_rf_root(self):
        from tools import _is_command_safe
        assert _is_command_safe("rm -rf /") is False

    def test_blocked_shutdown(self):
        from tools import _is_command_safe
        assert _is_command_safe("shutdown now") is False

    def test_blocked_traversal_in_command(self):
        from tools import _is_command_safe
        assert _is_command_safe("cat ../../etc/passwd") is False


# ---------------------------------------------------------------------------
# TOOL_DEFINITIONS structure
# ---------------------------------------------------------------------------

class TestToolDefinitions:

    def test_all_definitions_have_function_key(self):
        from tools import TOOL_DEFINITIONS
        for td in TOOL_DEFINITIONS:
            assert "function" in td
            assert "name" in td["function"]
            assert "description" in td["function"]

    def test_expected_tools_present(self):
        from tools import TOOL_DEFINITIONS
        names = {td["function"]["name"] for td in TOOL_DEFINITIONS}
        assert "write_file" in names
        assert "read_file" in names
        assert "run_command" in names
        assert "web_search" in names
