import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]
SHELL_INSTALLER = REPO_ROOT / "codex" / "scripts" / "backends" / "install-codex.sh"
POWERSHELL_INSTALLER = REPO_ROOT / "codex" / "scripts" / "backends" / "install-codex.ps1"


class CodexBackendSkillSyncModeTests(unittest.TestCase):
    def test_unix_backend_forwards_selection_mode_to_sync_runtime_skills(self) -> None:
        content = SHELL_INSTALLER.read_text(encoding="utf-8")

        self.assertIn('SKILL_SYNC_MODE="${FORGE_SKILL_SYNC_MODE:-selected}"', content)
        self.assertIn('"--selection-mode" "$SKILL_SYNC_MODE"', content)

    def test_windows_backend_still_forwards_selection_mode_to_sync_runtime_skills(self) -> None:
        content = POWERSHELL_INSTALLER.read_text(encoding="utf-8")

        self.assertIn('$SkillSyncMode = if ($env:FORGE_SKILL_SYNC_MODE)', content)
        self.assertIn('"--selection-mode", $SkillSyncMode', content)


if __name__ == "__main__":
    unittest.main()
