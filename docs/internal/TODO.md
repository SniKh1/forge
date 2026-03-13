# Forge Internal TODO

## P0 — Governance Foundation
- [x] 把全局路由文档收口到跨角色规则
- [x] 增加 role-pack 和第一阶段 stack-pack
- [x] 从仓库 skills 生成 canonical skill registry
- [x] 给全部 skill 补 layer + overlap metadata
- [x] 让 hook 文档与 hook template 对齐
- [x] 把默认 `browser-use` 行为编码成 real-browser-first
- [x] 引入 problem-solution memory 结构
- [x] 发布第一版 skill audit（`docs/internal/skill-audit-v1.md`）

## P1 — Role Packs
- [x] developer
- [x] product-manager
- [x] ui-designer
- [x] solution-architect
- [x] qa-strategist
- [x] release-devex

## P1 — Stack Packs
- [x] frontend refresh
- [x] java enrichment
- [x] python enrichment
- [x] product
- [x] design
- [x] architecture
- [x] qa
- [x] release

## P1 — Learning and Memory
- [x] 真正把 `self-improving-agent` 完整并入 Forge memory layout
- [x] 定义 problem-solution log schema
- [x] 明确 promotion rules：memory -> instinct -> learned skill -> role/stack update
- [x] 基于 reviewed records 实现 promotion suggestion tooling
- [x] 增加 transcript-aware extraction（自动提炼 `rootCause / chosenFix / verification`）
- [x] 提升 transcript-aware extraction 质量（更强语义抽取与去噪）
- [ ] 继续提升 transcript semantic extraction（更强根因/验证精度与更多 transcript 结构兼容）
- [x] 为 role-pack / stack-pack 生成更自动的 update proposal 草案
- [x] 让 update proposal 草案输出更接近可直接合并的 role / stack patch
- [x] 继续提升 patch draft 质量（更精准的 section 映射与更少噪音）
- [x] 继续提升 patch draft 的语义贴合度（减少泛化 bullet，增强 role/stack 特异性）
- [ ] 继续提升 patch draft 的领域适配度（让 domain pack 也输出更细的专属建议）

## P2 — Desktop / Catalog
## P2.5 — External Registry Integration
- [x] 将 `skills.sh` 作为外部 skill discovery source 接入第一版实现
- [x] 将 Official MCP Registry 作为外部 MCP discovery source 接入第一版实现
- [x] 新增 `core/registry-sources.json` 并实现第一版 source registry
- [x] 在 Forge Desktop `community` 页加入 external skill / MCP 搜索入口
- [x] 明确 third-party skill / MCP 的 trust boundary 与显式安装流程
- [x] 增加 external catalog cache，降低每次搜索都走远端 CLI / registry API 的开销
- [x] 为 external search 增加 role-pack / stack-pack / domain pack 排序增强
- [x] 为 external MCP 安装补强二次确认 UI（展示 `command / args / env / requiredSecrets`）

- [x] 从 skill registry 生成 desktop skill catalog
- [x] 在 Forge Desktop 中加入 role-pack 与 stack-pack 选择
- [x] 定义 role-aware MCP recommendation matrix
- [x] 把 role-aware MCP recommendations 接进 Forge Desktop
- [x] 按 `core / support / specialized / experimental` 分层展示可安装 skill
- [x] 按层级整理社区页的角色推荐 Skills 展示
- [x] 把第二阶段 domain packs 接进 Forge Desktop 的 stack 选择与推荐显示
- [x] 给第二阶段 domain packs 增加 MCP / tool recommendation，并接入 Forge Desktop

## P1.5 — Second-Wave Governance
- [x] 收口 `developer` 的推荐面，减少对 specialized skill 的默认吞入
- [x] 设计 runtime skill 去重策略（Claude / Codex / Gemini）
- [x] 明确 canonical skill id 与安装器去重规则
- [x] 继续补深 `product` / `design` / `qa` / `release` 角色与 stack 约束
- [x] 继续补深 `developer` / `solution-architect` / `architecture` / `frontend` 约束
- [x] 发布第二轮 skill rationalization 清单
- [x] 为 browser automation cluster 发布主从治理说明，并写回 registry metadata
- [x] 为 learning cluster 发布主从治理说明，并写回 registry metadata
- [x] 为 review cluster 发布主从治理说明，并写回 registry metadata
- [x] 为 planning cluster 发布主从治理说明，并写回 registry metadata
- [x] 为 UI cluster 发布主从治理说明，并写回 registry metadata
- [x] 为 testing cluster 发布主从治理说明，并写回 registry metadata

## P2 — Domain Expansion
- [x] 发布第二阶段领域 pack 草案（`docs/internal/domain-pack-roadmap-v1.md`）
- [x] ecommerce
- [x] video-creation
- [x] image-generation
- [x] workflow-automation
- [x] 把领域 pack 接入 `skill-registry` 与 `role-mcp-matrix` 推荐关系

## P3 — Deferred Release Work
- [ ] 恢复 Windows packaging in release workflow
- [ ] 校验 MSI / Wix 所需的 icon chain
- [ ] 在治理稳定后重新跑 release matrix
