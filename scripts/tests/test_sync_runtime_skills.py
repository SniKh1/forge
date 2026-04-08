import json
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]
SCRIPT_PATH = REPO_ROOT / "scripts" / "sync-runtime-skills.cjs"


def write_skill(root: Path, skill_id: str) -> None:
    skill_dir = root / "skills" / skill_id
    skill_dir.mkdir(parents=True, exist_ok=True)
    (skill_dir / "SKILL.md").write_text(f"# {skill_id}\n", encoding="utf-8")


class SyncRuntimeSkillsTests(unittest.TestCase):
    def setUp(self) -> None:
        self._tempdir = tempfile.TemporaryDirectory()
        self.root = Path(self._tempdir.name)
        self.repo_root = self.root / "repo"
        self.target_dir = self.root / "client-skills"
        (self.repo_root / "core").mkdir(parents=True, exist_ok=True)
        (self.repo_root / "skills").mkdir(parents=True, exist_ok=True)

        for skill_id in ("alpha", "beta", "gamma"):
            write_skill(self.repo_root, skill_id)

        registry = {
            "generatedAt": "2026-04-01T00:00:00.000Z",
            "totalSkills": 3,
            "skills": [
                {"id": "alpha", "relativeSkillDir": "skills/alpha"},
                {"id": "beta", "relativeSkillDir": "skills/beta"},
                {"id": "gamma", "relativeSkillDir": "skills/gamma"},
            ],
        }
        (self.repo_root / "core" / "skill-registry.json").write_text(
            json.dumps(registry),
            encoding="utf-8",
        )

    def tearDown(self) -> None:
        self._tempdir.cleanup()

    def run_sync(self, *args: str) -> dict:
        if shutil.which("node") is None:
            self.skipTest("node is required for sync-runtime-skills tests")

        command = [
            "node",
            str(SCRIPT_PATH),
            str(self.repo_root),
            str(self.target_dir),
            *args,
        ]
        completed = subprocess.run(
            command,
            check=True,
            capture_output=True,
            text=True,
        )
        return json.loads(completed.stdout)

    def installed_skill_ids(self) -> list[str]:
        if not self.target_dir.exists():
            return []
        return sorted(
            path.name
            for path in self.target_dir.iterdir()
            if path.is_dir() and (path / "SKILL.md").exists()
        )

    def test_selected_mode_installs_only_requested_subset(self) -> None:
        result = self.run_sync("--mode", "full", "--selection-mode", "selected", "--selected", "alpha,gamma")

        self.assertEqual(result["selectionMode"], "selected")
        self.assertEqual(result["libraryCount"], 3)
        self.assertEqual(self.installed_skill_ids(), ["alpha", "gamma"])

    def test_full_library_mode_ignores_selected_filter(self) -> None:
        result = self.run_sync("--mode", "full", "--selection-mode", "full-library", "--selected", "alpha")

        self.assertEqual(result["selectionMode"], "full-library")
        self.assertEqual(result["libraryCount"], 3)
        self.assertEqual(self.installed_skill_ids(), ["alpha", "beta", "gamma"])


if __name__ == "__main__":
    unittest.main()
