import json
import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]
SKILLS_ROOT = REPO_ROOT / "skills"
SOURCE_REGISTRY_PATH = REPO_ROOT / "scripts" / "lib" / "skills-registry.json"
MODULES_PATH = REPO_ROOT / "scripts" / "lib" / "modules.json"
CORE_REGISTRY_PATH = REPO_ROOT / "core" / "skill-registry.json"


def collect_skill_ids(root: Path) -> set[str]:
    ids: set[str] = set()
    for skill_file in root.rglob("SKILL.md"):
        parent = skill_file.parent
        if parent.name == "learned":
            continue
        ids.add(parent.name)
    return ids


class SkillRegistryHealthTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source_registry = json.loads(SOURCE_REGISTRY_PATH.read_text(encoding="utf-8"))
        cls.modules = json.loads(MODULES_PATH.read_text(encoding="utf-8"))
        cls.core_registry = json.loads(CORE_REGISTRY_PATH.read_text(encoding="utf-8"))
        cls.repo_skill_ids = collect_skill_ids(SKILLS_ROOT)
        cls.canonical_ids = {skill["id"] for skill in cls.core_registry["skills"]}

    def skill_exists(self, skill_id: str) -> bool:
        if skill_id in self.repo_skill_ids or skill_id in self.canonical_ids:
            return True
        meta = self.source_registry.get("skills", {}).get(skill_id, {})
        install_as = meta.get("install_as")
        if isinstance(install_as, str) and install_as:
            return Path(install_as).name in self.repo_skill_ids or Path(install_as).name in self.canonical_ids
        return False

    def test_source_registry_entries_resolve_to_real_skills(self):
        missing = sorted(
            skill_id
            for skill_id in self.source_registry.get("skills", {})
            if not self.skill_exists(skill_id)
        )
        self.assertEqual([], missing)

    def test_module_skill_references_resolve_to_real_skills(self):
        declared = set()
        for module_def in self.modules.get("modules", {}).values():
            declared.update(module_def.get("skills", []))
        missing = sorted(skill_id for skill_id in declared if not self.skill_exists(skill_id))
        self.assertEqual([], missing)


if __name__ == "__main__":
    unittest.main()
