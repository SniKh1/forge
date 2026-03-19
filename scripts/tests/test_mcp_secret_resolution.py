import sys
import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO_ROOT / "scripts"))

from forge_core import resolve_servers  # noqa: E402


class ResolveServersSecretTests(unittest.TestCase):
    def test_secret_backed_server_is_skipped_when_secret_missing(self):
        servers = resolve_servers("claude", include_optional=True, selected_servers=["bing-search", "trendradar"])
        self.assertNotIn("bing-search", servers)
        self.assertIn("trendradar", servers)

    def test_secret_backed_server_is_included_when_secret_present(self):
        servers = resolve_servers(
            "claude",
            include_optional=True,
            selected_servers=["bing-search"],
            secret_values={"BING_API_KEY": "test-key"},
        )
        self.assertIn("bing-search", servers)
        self.assertEqual(servers["bing-search"]["env"]["BING_API_KEY"], "test-key")


if __name__ == "__main__":
    unittest.main()
