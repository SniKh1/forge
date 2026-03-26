import { describe, expect, it } from 'vitest';
import {
  buildRecommendedMcpIds,
  buildRoleOptions,
  buildSkillComposition,
  buildSkillOptions,
  buildStackOptions,
} from './platform-vm';

describe('platform multi-select composition', () => {
  it('builds role options for multiple selected roles', () => {
    const options = buildRoleOptions(['frontend-engineer', 'solution-architect']);

    expect(options.find((role) => role.id === 'frontend-engineer')?.selected).toBe(true);
    expect(options.find((role) => role.id === 'solution-architect')?.selected).toBe(true);
  });

  it('unions recommended stacks across selected roles', () => {
    const stacks = buildStackOptions(
      ['frontend-engineer', 'solution-architect'],
      ['frontend-web', 'design-system', 'system-architecture', 'workflow-automation']
    );

    const recommendedIds = stacks.recommended.map((stack) => stack.id);

    expect(recommendedIds).toContain('frontend-web');
    expect(recommendedIds).toContain('design-system');
    expect(recommendedIds).toContain('system-architecture');
    expect(recommendedIds.length).toBeGreaterThanOrEqual(3);
  });

  it('aggregates skills from multiple roles and stacks', () => {
    const composition = buildSkillComposition({
      client: 'codex',
      roleIds: ['frontend-engineer', 'solution-architect'],
      stackIds: ['frontend-web', 'design-system', 'system-architecture'],
      extraSkillIds: ['code-review'],
    });

    expect(composition.selectedSkillIds.length).toBeGreaterThan(6);
    expect(composition.selectedSkillIds).toContain('frontend-design');
    expect(composition.selectedSkillIds).toContain('code-review');
    expect(composition.manualIncludedCount).toBeGreaterThanOrEqual(1);
  });

  it('marks optional skills selectable and supports full selection of visible optional skills', () => {
    const skillOptions = buildSkillOptions({
      client: 'codex',
      roleIds: ['frontend-engineer'],
      stackIds: ['frontend-web', 'design-system'],
      extraSkillIds: [],
    });

    expect(skillOptions.optional.length).toBeGreaterThan(0);
    expect(skillOptions.optional.some((skill) => skill.locked)).toBe(false);

    const allVisibleOptionalIds = skillOptions.optional.map((skill) => skill.id);
    const composition = buildSkillComposition({
      client: 'codex',
      roleIds: ['frontend-engineer'],
      stackIds: ['frontend-web', 'design-system'],
      extraSkillIds: allVisibleOptionalIds,
    });

    for (const skillId of allVisibleOptionalIds) {
      expect(composition.selectedSkillIds).toContain(skillId);
    }
  });

  it('unions recommended MCP ids across selected roles and stacks', () => {
    const mcpIds = buildRecommendedMcpIds(
      ['frontend-engineer', 'solution-architect'],
      ['frontend-web', 'design-system', 'system-architecture']
    );

    expect(new Set(mcpIds).size).toBe(mcpIds.length);
    expect(mcpIds.length).toBeGreaterThan(0);
  });
});
