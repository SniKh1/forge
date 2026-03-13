# Forge Skill Governance v2

**Updated**: 2026-03-12  
**Scope**: 第二轮治理清单，重点解决“哪些 skill 真冗余、哪些只是层级不清、哪些 role/stack 仍然缺少约束”

## Executive Summary

当前 Forge 的 skill 体系已经完成了第一阶段基础治理：
- 有 canonical `skill-registry`
- 有 `layer` 分类
- 有 `overlapGroup`
- 有 `recommendedByRole` / `recommendedByStack`
- Desktop 也已经能消费这些 metadata

但第二轮检查暴露出 3 个更具体的问题：

1. **仓库层并没有大量 exact duplicate skill id**  
   也就是说，repo 本身不需要立刻大删。

2. **运行时层（尤其是 `~/.codex/skills`）已经存在重复 skill 安装**  
   这些重复会带来触发歧义和阅读噪音。

3. **`developer` 角色曾经覆盖过宽，但现在已经完成第一轮收口**  
   当前 registry 里，`developer` 已从 112 个推荐 skill 收口到 28 个，更接近“核心开发默认能力包”。

## Current Numbers

### Repo skill registry
- total skills: `118`
- layer distribution:
  - `core`: `13`
  - `extended`: `20`
  - `specialized`: `84`
  - `experimental`: `1`

### Installed Codex skills
- total installed skills: `125`
- duplicated installed ids: `6`

## Repo-Level Judgment

仓库层当前判断：
- **不适合立刻大删**
- 更适合继续做：
  - 主次化
  - 精准路由
  - 角色收口
  - 运行时去重

换句话说，当前最主要的问题不是“repo 里有 118 个 skill”，而是：
- 哪些 skill 默认会被看见
- 哪些 skill 真正有主入口
- 哪些 skill 在运行时被重复安装
- 哪些 role/stack 还没有足够强的引导力

## Runtime-Level Duplicate Skills

在 `~/.codex/skills` 中，当前发现这些重复安装：

- `skill-creator`
  - `.system/skill-creator`
  - `skill-creator`
- `docx`
  - `document-skills/docx`
  - `docx`
- `pdf`
  - `document-skills/pdf`
  - `pdf`
- `pptx`
  - `document-skills/pptx`
  - `pptx`
- `xlsx`
  - `document-skills/xlsx`
  - `xlsx`
- `verification-before-completion`
  - `superpowers/verification-before-completion`
  - `verification-before-completion`

### Governance Decision

这些重复目前先**记录，不立即清除**，原因是：
- 还需要确认安装器是否仍依赖这些目录结构
- 需要先定义 runtime 去重策略，再做清理

### Target Direction

后续应建立一条运行时规则：
- repo registry 只保留单一 canonical id
- installer 在同步到客户端时避免重复落盘
- Desktop / catalog 只展示 canonical entry

## Role Coverage Snapshot

当前 `recommendedByRole` 覆盖数量：

- `developer`: `28`
- `ui-designer`: `8`
- `solution-architect`: `6`
- `product-manager`: `6`
- `release-devex`: `5`
- `qa-strategist`: `4`

### Current Judgment

第一轮收口已经生效：
- `developer` 不再默认吞掉大多数 `specialized` skill
- role-pack 的分层意义开始变清楚
- 非 `developer` 角色的推荐链也更可读

### Governance Decision

下一阶段不再是“继续大砍 `developer`”，而是：
- 保持当前收口结果
- 继续观察是否还有误挂到 `developer` 的 stack/domain skill
- 把更多 specialized domain skill 压到：
  - stack 推荐
  - role 推荐
  - 或 explicit selection

## Stack Coverage Snapshot

当前 `recommendedByStack` 覆盖数量：

- `frontend`: `19`
- `java`: `18`
- `python`: `14`
- `release`: `12`
- `architecture`: `9`
- `design`: `9`
- `product`: `6`
- `qa`: `6`

### Judgment

这说明 stack 层已经比 role 层更接近合理状态。  
后续重点不是继续加很多 stack，而是：
- 继续补 `product / design / qa / release` 的深度
- 让 role-pack 更清楚地依赖 stack-pack
- 把 specialized skill 的推荐更多地压到 stack 上，而不是全落进 `developer`

## Second-Wave Governance Targets

### Priority A — 收口 `developer`
目标：
- 缩小 `developer` 默认推荐面
- 保留真正高频：
  - `brainstorming`
  - `systematic-debugging`
  - `code-review`
  - `self-improving-agent`
  - `backend-development` / `frontend-design`
  - `tdd-workflow`
  - `security-review`
- 其余 specialized skill 尽量迁移到 stack / role 或 explicit install

### Priority B — 运行时去重
目标：
- 为 installer 增加 runtime de-dup 规则
- 为 Desktop catalog 增加 canonical id 显示
- 在 Codex / Claude / Gemini 安装器中避免重复同步 skill

当前设计文档：
- `docs/internal/runtime-skill-dedup-v1.md`

### Priority C — 继续补角色深度
第一波 role-pack 已经建立，但还缺第二层精细能力：
- `product-manager`
  - 增加 PRD、brief、验收标准模板化约束
- `ui-designer`
  - 增加 design critique / implementation review 的更细规则
- `qa-strategist`
  - 增加 risk matrix 与 regression 模板
- `release-devex`
  - 增加 packaging / diagnostics / rollback 模板

### Priority D — 第二阶段 role/domain packs
这些进入下一阶段 backlog：
- `research-analyst`
- `security-operator`
- `ecommerce-operator`
- `video-creator`
- `image-workflow-designer`
- `automation-orchestrator`

### Priority E — 第二阶段 domain stacks
这些不应先塞回全局规则，而应作为后续 stack-pack：
- `ecommerce`
- `video-creation`
- `image-generation`
- `workflow-automation`

## Near-Term Recommendations

下一步不建议做“大删 skill”。

更稳的顺序是：
1. 把 runtime skill 去重策略落进 installer / verify
2. 把 `product / design / qa / release` 再补深一轮
3. 检查 Desktop 是否需要隐藏非推荐 specialized skill
4. 再开始决定哪些 specialized skill 真需要 merge / remove

## Decision

当前阶段的结论：
- **Repo skills 先保留，不做大规模删除**
- **运行时重复安装是下一轮最明确的治理入口**
- **`developer` role-pack 已完成第一轮收口，但仍需持续观察**
- **后续新增能力优先走 `role-pack + stack-pack`，不要再把新规则堆回 global-core**
