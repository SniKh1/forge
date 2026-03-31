import subprocess
import sys
import tempfile
import textwrap
import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO_ROOT / "scripts"))

from forge_core import dump_toml_document  # noqa: E402


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

        with tempfile.TemporaryDirectory() as td:
            config_path = Path(td) / "config.toml"
            config_path.write_text(config, encoding="utf-8")

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
            )

            self.assertRegex(proc.stdout, r"(WROTE|UPDATED)")
            rendered = config_path.read_text(encoding="utf-8")
            self.assertIn('[model_providers.custom]', rendered)
            self.assertNotIn('model_providers = "', rendered)


if __name__ == "__main__":
    unittest.main()
