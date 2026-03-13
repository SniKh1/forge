# Forge Skill Rationalization v2

**Updated**: 2026-03-13  
**Scope**: 第二轮 skill 治理，不直接删除，先明确保留、降级、合并和实验边界  
**Source of truth**: `core/skill-registry.json`

## Current Snapshot

当前 registry 中共有 `118` 个 skill：

- `core`: 13
- `extended`: 20
- `specialized`: 84
- `experimental`: 1

其中：

- `85` 个 skill 当前没有 `recommendedByRole`
- `76` 个 skill 当前没有 `recommendedByStack`
- `76` 个 skill 当前没有 `primaryFor`

这不等于这些 skill 没价值。  
它更准确地说明：Forge 现在已经完成“治理骨架”，但第二轮需要把大量 specialized skill 从“默认存在”进一步区分为：

1. 值得保留但低频
2. 应该只在特定场景显式调用
3. 语义重叠，应由主 skill 接管
4. 真正可以进入删除/归档候选

## Decision Rules

### A. 继续保留为核心

满足以下任一条件：
- 已经承担主路由职责
- 已经在 role-pack / stack-pack 中被明确依赖
- 没有它就会让核心工作流失真

典型代表：
- `brainstorming`
- `frontend-design`
- `aesthetic`
- `backend-development`
- `browser-use`
- `code-review`
- `systematic-debugging`
- `tdd-workflow`
- `self-improving-agent`
- `devops`
- `mcp-management`
- `security-review`
- `doc-coauthoring`

### B. 保留，但降级为 support / explicit use

满足以下模式：
- 不是主路由
- 只在特定阶段补充主 skill
- 可以通过 role/stack 推荐被显式带出，而不该默认吞进 developer

典型代表：
- `browser`
- `chrome-devtools`
- `ui-styling`
- `web-design-guidelines`
- `receiving-code-review`
- `requesting-code-review`
- `writing-plans`
- `context7`
- `docs-seeker`
- `changelog-generator`
- `webapp-testing`
- `writing-skills`
- `skill-creator`

### C. 保留为 specialized inventory

这类 skill 不该高频触发，但应保留为明确的专业能力仓库。

典型代表：
- document/file 类：
  - `docx`
  - `pdf`
  - `pptx`
  - `xlsx`
- language/framework 类：
  - `django-*`
  - `springboot-*`
  - `golang-*`
  - `cpp-*`
  - `swift-*`
- domain/tool 类：
  - `shopify`
  - `clickhouse-io`
  - `media-processing`
  - `ai-multimodal`
  - `algorithmic-art`

### D. 合并/收口候选

这些不是立刻删除，而是下一轮需要决定“由谁接管”。

#### Browser automation cluster
- 主：`browser-use`
- support：`browser`
- support：`chrome-devtools`

动作建议：
- `browser-use` 继续作为默认浏览器自动化入口
- `browser` / `chrome-devtools` 仅在需要更低层控制或 DevTools 调试时显式调用
- 正式治理说明见：`docs/internal/browser-automation-cluster-v1.md`

#### Learning cluster
- 主：`self-improving-agent`
- support：`continuous-learning`
- support：`continuous-learning-v2`

动作建议：
- 继续把学习写入 Forge 统一 memory
- `continuous-learning*` 不再作为默认高频路由，只保留为学习链补充能力
- 正式治理说明见：`docs/internal/learning-cluster-v1.md`

#### Review cluster
- 主：`code-review`
- support：`receiving-code-review`
- support：`requesting-code-review`

动作建议：
- `code-review` 继续作为统一 review 入口
- 其余两个视作子场景 skill，不再抢主路由
- 正式治理说明见：`docs/internal/review-cluster-v1.md`

#### Planning cluster
- 主：`brainstorming`
- support：`writing-plans`

动作建议：
- `brainstorming` 继续负责前置问题建模
- `writing-plans` 只在已经进入多步骤执行时强化
- 正式治理说明见：`docs/internal/planning-cluster-v1.md`

#### UI cluster
- 主：`frontend-design`
- 主：`aesthetic`
- support：`ui-styling`
- support：`web-design-guidelines`
- experimental：`ui-ux-pro-max`

动作建议：
- `frontend-design + aesthetic` 继续作为 UI 主组合
- `ui-styling` 和 `web-design-guidelines` 保留为 support
- `ui-ux-pro-max` 暂留 experimental，不进入默认主路径
- 正式治理说明见：`docs/internal/ui-cluster-v1.md`

## High-Noise Buckets

下面这些组最容易制造“skill 很多，但默认路由过吵”的体验：

### 1. Problem-solving micro-skills
- `collision-zone-thinking`
- `inversion-exercise`
- `meta-pattern-recognition`
- `scale-game`
- `simplification-cascades`
- `when-stuck`

判断：
- 这些有方法论价值
- 但不应直接平铺为日常默认 skill

建议：
- 保留为 specialized/problem-solving toolset
- 后续可以考虑收敛成一个更明确的“problem-solving kit”入口

### 2. Artifact / document duplication pressure
- `artifacts-builder`
- `web-artifacts-builder`
- `docx`
- `pdf`
- `pptx`
- `xlsx`

判断：
- 有些是明确独立能力
- `artifacts-builder` / `web-artifacts-builder` 的边界后续值得再审

### 3. Template / example / installer helper noise
- `template-skill`
- `project-guidelines-example`
- `configure-ecc`
- `find-skills`

判断：
- 这类更像 authoring / onboarding tooling
- 不应在 Forge 主路由里占高权重

## Candidate Actions (Next Wave)

### Wave 1 — 先做，不删文件
- 把 high-noise bucket 标记得更明确
- 继续减少 specialized skill 对 `developer` 的默认污染
- 在 Desktop 中把 support / specialized / experimental 展示更分层

### Wave 2 — 收主从，不急着删
- 给 `browser` / `chrome-devtools` / `continuous-learning*` / `requesting-code-review` / `receiving-code-review` 增加更清晰的 support 标识
- 检查 `artifacts-builder` / `web-artifacts-builder` 是否需要主次化

### Wave 3 — 真正删除候选
只有满足以下条件才进入删除候选：
- 没有 role 推荐
- 没有 stack 推荐
- 不属于 language/domain specialized inventory
- 与已有主 skill 明显重复
- 连内部治理文档也无法说明它为什么还存在

当前最接近这一条件的候选：
- `template-skill`
- `project-guidelines-example`

## Recommended Next Step

下一步不建议直接删。  
更合理的是先做一份“**support / specialized / experimental 的 Desktop 展示与安装策略**”，这样用户会先感受到系统更清楚，再决定哪些 skill 真的要退出主仓库。


#### Testing cluster
- 主：`tdd-workflow`
- support：`test-driven-development`
- support：`webapp-testing`
- support：语言/框架 testing skill（`python-testing`、`springboot-tdd`、`django-tdd`、`golang-testing`）

动作建议：
- `tdd-workflow` 继续作为 testing 主入口
- `webapp-testing` 保留为 Web UI / browser / E2E support
- 各语言 testing skill 保留为 stack-aware support
- 正式治理说明见：`docs/internal/testing-cluster-v1.md`
