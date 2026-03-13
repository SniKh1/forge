# Forge Capability Roadmap

## Purpose

Forge 正在从“开发者优先的 capability pack”，升级成一套可被 Claude、Codex、Gemini 共享的多角色、多 stack 协同框架。

这份 roadmap 是当前治理路线的内部真值来源。

## Current Pain Points

当前主要问题有：
- 全局路由文档里混入了过多 developer 和 stack 细节。
- `frontend` 明显比 `java`、`python` 更成熟，非 developer 角色几乎是空白。
- skill 数量很多，但结构偏平，导致路由噪音和语义重叠。
- Forge 学习系统更偏工具/流程模式，缺少明确的 problem -> root cause -> fix 知识沉淀。
- `browser-use` 已支持真实浏览器流程，但这条偏好以前没有被全局编码。
- hooks 文档明显比真实 hook template 和执行行为要薄。
- release automation 仍有 Windows packaging 的延期问题，不应该阻塞当前治理工作。

## Target Architecture

Forge 最终应稳定在四层结构：

1. `global-core`
   - task grading
   - collaboration 与 agent orchestration
   - memory 与 learning policy
   - verification 与 completion rules
   - security boundaries
   - default tool behavior
2. `role-pack`
   - 某类 worker 默认怎么工作
   - 会产出什么交付物
   - 偏好哪些 MCP / skills
3. `stack-pack`
   - 某个技术栈或领域内的约束
   - toolchain 选择
   - 交付与验证方式
4. `skill`
   - 局部任务级能力说明与执行指引

## Governance Principles

- 全局层只保留跨角色、跨 stack 都成立的规则。
- developer 相关默认行为尽量移到 `developer` role-pack。
- 语言、框架、领域细节尽量移到 stack-pack。
- 在 layer 和 overlap 治理完成前，不做大规模 skill 删除。
- 优先维护一套记忆系统；`self-improving-agent` 应增强 Forge memory，而不是 fork 一套新真值系统。
- browser automation 默认优先真实浏览器 / profile，只有明确要求隔离时才切 isolation。

## Phase Plan

### P0 — Governance Foundation
- 增加内部 roadmap 和 TODO
- 引入 `roles/` 并扩展 `stacks/`
- 生成 skill registry，并为 overlap 补 metadata
- 发布第一版 skill audit，明确 layer 与 overlap ownership
- 按新结构重写 `CLAUDE.md`、`AGENTS.md`、Codex template、Gemini template
- 让 hook 文档和 hook 行为重新对齐

### P1 — Core Role Packs
- `developer`
- `product-manager`
- `ui-designer`
- `solution-architect`
- `qa-strategist`
- `release-devex`

### P2 — Expanded Stack Packs
- `product`
- `design`
- `architecture`
- `qa`
- `release`
- enrich `frontend`
- enrich `java`
- enrich `python`
- 为 `product` / `design` / `qa` / `release` 增加 output shape、validation checklist、collaboration contract

### P3 — Unified Learning
- problem-solution record structure
- machine-readable promotion rules
- hook checkpoints for observation + session learning
- 已完成 `self-improving-agent`、project memory、instincts、learned outputs 的 canonical target 对齐
- 已补齐 reviewed record -> promotion suggestion 的 Claude / Codex 运行时入口
- 已补齐 transcript-aware heuristic extraction v2（优先自动提炼 `problem / rootCause / chosenFix / verification`，并识别空语义 transcript）
- 已补齐 role / stack update proposal generation（输出 `md + json` 草案，不自动改 pack）
- 已补齐 role / stack patch draft v1（按 `Default Skills / Trigger Cues / Validation Checklist / Collaboration Contract` 等 section 生成可 review 的插入片段）
- 已补齐 file-aware patch hint：能识别目标 pack 文件中的真实 section 变体（例如 `Verification Before Completion`、`Delivery Checklist`、带编号 heading），并输出更贴近文件现状的插入提示
- 已补齐更高语义贴合度的 patch draft：`Default Skills / Preferred Skills / Collaboration Contract` 现在会附带更贴近具体 role-pack / stack-pack 的用途说明与协同语义。
- 下一步集中在更高质量的 semantic extraction，以及让 domain pack 也输出更细的专属 patch 建议。

### P4 — Desktop / Catalog Alignment
- 先选 role-pack，再选 stack-pack
- skill catalog 改为由 registry 自动生成
- role-aware MCP / skill recommendations
- Desktop 社区与安装流程可消费 role-pack / stack-pack 推荐结果

### P4.5 — Runtime Skill Hygiene
- canonical skill id 统一从 `skill-registry` 输出
- installer 增加 duplicate detection 与 canonical sync
- Desktop 只展示 canonical entry
- 运行时去重设计说明见 `docs/internal/runtime-skill-dedup-v1.md`
- 第二轮 skill 收敛判断见 `docs/internal/skill-rationalization-v2.md`
- 浏览器类主从治理见 `docs/internal/browser-automation-cluster-v1.md`
- 学习类主从治理见 `docs/internal/learning-cluster-v1.md`
- 评审类主从治理见 `docs/internal/review-cluster-v1.md`
- 规划类主从治理见 `docs/internal/planning-cluster-v1.md`
- UI 类主从治理见 `docs/internal/ui-cluster-v1.md`
- 测试类主从治理见 `docs/internal/testing-cluster-v1.md`

### P5 — Domain Packs
- 初版草案见 `docs/internal/domain-pack-roadmap-v1.md`
- `ecommerce`
- `video-creation`
- `image-generation`
- `workflow-automation`
- 推荐映射见 `docs/internal/domain-pack-skill-map-v1.md`
- 后续再补 role-aware MCP / skill recommendation 与 Desktop 集成

### P5.5 — External Registry Integration
- 已接入 `skills.sh` 作为 external skill discovery source（第一版）
- 已接入 Official MCP Registry 作为 external MCP discovery source（第一版）
- 已落地 `registry-sources.json`、CLI searchable integration、Desktop searchable integration
- 已落地 external catalog cache（repo-local `.cache/external-registry`）
- 已按当前 `role-pack / stack-pack / domain pack` 增强 external 搜索排序
- 已补齐 external MCP 安装前二次确认（展示 `command / args / env / requiredSecrets`）
- 保持 `built-in / curated-external / browse-only` 三层来源边界
- 不自动信任或静默执行第三方 install command
- 方案文档见 `docs/internal/external-registry-integration-v1.md`

## Deferred: Release / Windows Packaging

Windows release automation 明确标记为当前治理工作的延期项。

状态：
- Deferred
- 不阻塞当前 capability refactor

恢复处理入口：
- `apps/forge-desktop/src-tauri/icons/`
- `apps/forge-desktop/src-tauri/tauri.conf.json`
- `.github/workflows/release.yml`
