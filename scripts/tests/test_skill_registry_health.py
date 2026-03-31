import json
import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]
SKILLS_ROOT = REPO_ROOT / "skills"
SOURCE_REGISTRY_PATH = REPO_ROOT / "scripts" / "lib" / "skills-registry.json"
MODULES_PATH = REPO_ROOT / "scripts" / "lib" / "modules.json"
CORE_REGISTRY_PATH = REPO_ROOT / "core" / "skill-registry.json"


def collect_skill_paths(root: Path) -> dict[str, list[str]]:
    paths: dict[str, list[str]] = {}
    for skill_file in root.rglob("SKILL.md"):
        parent = skill_file.parent
        if parent.name == "learned":
            continue
        paths.setdefault(parent.name, []).append(parent.relative_to(root).as_posix())
    for skill_id in paths:
        paths[skill_id].sort()
    return paths


class SkillRegistryHealthTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source_registry = json.loads(SOURCE_REGISTRY_PATH.read_text(encoding="utf-8"))
        cls.modules = json.loads(MODULES_PATH.read_text(encoding="utf-8"))
        cls.core_registry = json.loads(CORE_REGISTRY_PATH.read_text(encoding="utf-8"))
        cls.repo_skill_paths = collect_skill_paths(SKILLS_ROOT)
        cls.repo_skill_ids = set(cls.repo_skill_paths)
        cls.canonical_ids = {skill["id"] for skill in cls.core_registry["skills"]}

    def expected_skill_file(self, skill_id: str) -> Path:
        meta = self.source_registry.get("skills", {}).get(skill_id, {})
        install_as = meta.get("install_as")
        relative_dir = Path(install_as) if isinstance(install_as, str) and install_as else Path(skill_id)
        return SKILLS_ROOT / relative_dir / "SKILL.md"

    def test_repo_has_no_duplicate_skill_ids(self):
        redundant_nested = sorted(
            path
            for skill_id, paths in self.repo_skill_paths.items()
            for path in paths
            if Path(path).parts[-2:] == (skill_id, skill_id)
        )
        self.assertEqual([], redundant_nested)

    def test_source_registry_entries_have_real_skill_files(self):
        missing = sorted(
            skill_id
            for skill_id in self.source_registry.get("skills", {})
            if not self.expected_skill_file(skill_id).is_file()
        )
        self.assertEqual([], missing)

    def test_module_skill_references_resolve_to_repo_files(self):
        declared = set()
        for module_def in self.modules.get("modules", {}).values():
            declared.update(module_def.get("skills", []))
        missing = sorted(
            skill_id
            for skill_id in declared
            if not self.expected_skill_file(skill_id).is_file()
        )
        self.assertEqual([], missing)

    def test_core_registry_source_paths_exist(self):
        missing = sorted(
            skill["id"]
            for skill in self.core_registry["skills"]
            if not (REPO_ROOT / skill["sourcePath"]).is_file()
        )
        self.assertEqual([], missing)

    def test_core_registry_matches_repo_skill_ids(self):
        self.assertEqual(sorted(self.repo_skill_ids), sorted(self.canonical_ids))


if __name__ == "__main__":
    unittest.main()
