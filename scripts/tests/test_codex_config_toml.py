import os
import shutil
import subprocess
import sys
import textwrap
import unittest
import uuid
from contextlib import contextmanager
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]
TMP_ROOT = REPO_ROOT / ".tmp-tests"
sys.path.insert(0, str(REPO_ROOT / "scripts"))

from forge_core import dump_toml_document  # noqa: E402


@contextmanager
def workspace_tempdir():
    TMP_ROOT.mkdir(exist_ok=True)
    temp_dir = TMP_ROOT / str(uuid.uuid4())
    temp_dir.mkdir()
    try:
        yield temp_dir
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)


def write_codex_stub(temp_dir: Path) -> Path:
    stub_path = temp_dir / ("codex.cmd" if os.name == "nt" else "codex")
    if os.name == "nt":
        stub_path.write_text("@echo off\r\nexit /b 0\r\n", encoding="utf-8")
    else:
        stub_path.write_text("#!/bin/sh\nexit 0\n", encoding="utf-8")
        stub_path.chmod(0o755)
    return stub_path


class CodexTomlDumpTests(unittest.TestCase):
    def test_dump_preserves_nested_tables(self):
        rendered = dump_toml_document(
            {
                "model": "gpt-5",
                "model_providers": {
                    "custom": {
                        "name": "custom",
                        "wire_api": "responses",
                        "requires_openai_auth": True,
                        "base_url": "http://127.0.0.1:15721/v1",
                    }
                },
                "mcp_servers": {
                    "memory": {
                        "command": "npx",
                        "args": ["-y", "@modelcontextprotocol/server-memory"],
                    }
                },
            }
        )

        self.assertIn('[model_providers.custom]', rendered)
        self.assertNotIn('model_providers = "', rendered)
        self.assertIn('[mcp_servers.memory]', rendered)

    def test_configure_script_keeps_model_provider_as_table(self):
        config = textwrap.dedent(
            """
            model = "gpt-5"

            [model_providers.custom]
            name = "custom"
            wire_api = "responses"
            requires_openai_auth = true
            base_url = "http://127.0.0.1:15721/v1"
            """
        ).strip() + "\n"

        with workspace_tempdir() as temp_dir:
            config_path = temp_dir / "config.toml"
            config_path.write_text(config, encoding="utf-8")
            env = os.environ.copy()
            env["CODEX_BIN"] = str(write_codex_stub(temp_dir))

            proc = subprocess.run(
                [
                    "python3",
                    str(REPO_ROOT / "codex/scripts/configure-codex-mcp.py"),
                    "--config",
                    str(config_path),
                    "--servers",
                    "memory",
                ],
                cwd=REPO_ROOT,
                capture_output=True,
                text=True,
                check=True,
                env=env,
            )

            self.assertRegex(proc.stdout, r"(WROTE|UPDATED)")
            rendered = config_path.read_text(encoding="utf-8")
            self.assertIn('[model_providers.custom]', rendered)
            self.assertNotIn('model_providers = "', rendered)


if __name__ == "__main__":
    unittest.main()
