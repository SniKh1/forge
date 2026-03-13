# External Registry Integration v1

## Purpose

Forge 目前已经有：
- canonical `skill-registry`
- `role-pack` / `stack-pack` / `domain pack`
- Desktop `community` 页面

下一步可以把 Forge 从“只消费本地 curated catalog”，升级成“可接入外部 skill / MCP registry 的可搜索入口”。

这条线的目标不是直接执行远程内容，而是：
- 发现（discover）
- 过滤（filter）
- 评估（evaluate）
- 显式安装（explicit install）

## Why Now

已有外部生态已经足够成熟，至少包括：
- `skills.sh`：公开 agent skills directory，支持搜索与 `npx skills add` 安装
- Official MCP Registry：官方 MCP server registry，支持标准化发现

Forge 适合把它们接进来，原因是：
- Forge 已有本地 canonical registry，可以作为“已安装 / 内置能力”的真值来源
- Forge Desktop 已有 `community` 页，可以扩成统一搜索入口
- `role-pack` / `stack-pack` / `domain pack` 已经建立，能够对外部条目做推荐排序而不是纯平铺

## Non-Goals

这一阶段不做：
- 自动执行任意远程 skill / MCP 的静默安装
- 自动信任所有第三方来源
- 直接把远端 registry 当作本地真值源
- 把 external entry 和 Forge built-ins 混成一个无来源边界的列表

## Recommended Model

Forge 应该采用三层 registry 模型：

1. `built-in`
- 来自 Forge 仓库自身
- 完全受 Forge 治理
- 可直接安装

2. `curated-external`
- 明确登记过的外部仓库或 registry 源
- 有来源标签与风险等级
- 可搜索、可预览、显式安装

3. `browse-only`
- 仅用于发现与跳转
- 默认不提供一键执行

## Proposed Data Files

### Source Registry
`core/registry-sources.json`

建议记录：
- `id`
- `name`
- `kind` (`skills` / `mcp` / `mixed`)
- `sourceType` (`directory` / `registry` / `github` / `npm`)
- `url`
- `trustLevel` (`official` / `curated` / `community` / `experimental`)
- `enabled`
- `browseOnly`
- `supportsSearch`

### External Skill Cache
`core/external-skill-catalog.json`

建议字段：
- `id`
- `sourceId`
- `name`
- `displayName`
- `summary`
- `url`
- `installMethod`
- `owner`
- `repo`
- `tags`
- `trustLevel`
- `recommendedByRole`
- `recommendedByStack`

### External MCP Cache
`core/external-mcp-catalog.json`

建议字段：
- `id`
- `sourceId`
- `name`
- `summary`
- `url`
- `serverType`
- `installMethod`
- `requiresKey`
- `trustLevel`
- `recommendedByRole`
- `recommendedByStack`

## Initial Sources

### Skills
- `skills.sh`
  - 适合作为 skills directory 的主要 discovery source
  - 支持搜索、排行榜、技能详情、CLI 安装
- `anthropics/skills`
- `ComposioHQ/awesome-claude-skills`
- `JimLiu/baoyu-skills`

### MCP
- Official MCP Registry
- `modelcontextprotocol/servers`
- 角色专项官方 MCP：
  - `Notion MCP`
  - `Linear MCP`
  - `Slack MCP`
  - `Figma Dev Mode MCP`
  - `GitHub MCP`

## Desktop UX Recommendation

Desktop `community` 页可以扩成三个子区：

1. `Forge 内置`
- 当前已有
- 可直接加入安装清单

2. `可信外部来源`
- 来自 `registry-sources.json`
- 可搜索、可预览、可显式安装
- 要显示来源与信任级别

3. `浏览入口`
- 只跳转外部站点
- 不做一键安装

### Search Behavior

搜索优先级建议：
1. `built-in` 结果
2. `curated-external` 结果
3. `browse-only` 来源

### Install Behavior

- `skills`
  - 先预览 `SKILL.md` / metadata
  - 明确选择安装到：
    - project
    - `~/.claude/skills`
    - `~/.codex/skills`
    - `~/.gemini/skills`
- `mcp`
  - 先展示 server summary / install method / key requirement
  - 再写入当前客户端配置
  - 默认不自动信任带执行命令的第三方 server

## Security Boundaries

必须保留这些边界：
- 不自动执行第三方 install 命令
- 不静默写入第三方 MCP command 到客户端配置
- 不把 external metadata 直接当作本地 canonical registry
- 任何带 `command`, `args`, `env` 的 MCP 都必须二次确认
- 任何 external skill 安装前必须展示来源、仓库、目标目录

## Role / Stack / Domain Aware Ranking

Forge 现有元数据已经足以做排序增强：
- `recommendedByRole`
- `recommendedByStack`
- `domain pack`

因此外部结果也应支持：
- 当前 `role-pack` 优先
- 当前 `stack-pack` 优先
- 当前 `domain pack` 优先

例如：
- `product-manager + ecommerce`
  - 优先显示 `Notion`, `Linear`, `Slack`, `GitHub`, `shopify` 相关 skill / MCP
- `ui-designer + image-generation`
  - 优先显示 `Figma`, `browser-use`, `aesthetic`, 图像工作流相关条目

## Implementation Order

### Phase A
- 新增 `registry-sources.json`
- 把 `skills.sh` 与 Official MCP Registry 作为 discovery source 记录进项目
- Desktop 先展示来源，不做真实安装

### Phase B
- 增加 catalog fetch/cache 脚本
- 生成 `external-skill-catalog.json` / `external-mcp-catalog.json`
- Desktop 接 searchable external list

### Phase C
- 做显式安装流程
- 支持安装到 project / runtime homes
- 对第三方 MCP 增加强确认

## Current Status

截至当前版本，第一版 external registry integration 已经落地：

### 已实现
- `core/registry-sources.json`
  - 定义 `skills.sh`、Official MCP Registry 以及 browse-only 来源
- Forge CLI external search
  - `external-search --kind skills --query ...`
  - `external-search --kind mcp --query ...`
- Forge CLI external install
  - `external-install-skill --client ...`
  - `external-install-mcp --client ...`
- Forge Desktop `community` 页
  - 可搜索 external skills
  - 可搜索 external MCP
  - 可把可安装条目直接安装进当前客户端配置
- local cache
  - external `skills` 与 `MCP` 搜索结果会写入 `.cache/external-registry`
  - 默认缓存 6 小时，可通过 `FORGE_BYPASS_EXTERNAL_CACHE=1` 绕过
- role / stack / domain aware 排序
  - external `skills` 会按当前 `role-pack + stack-pack` 推荐关系提权
  - external `MCP` 会按当前 `role-pack + stack-pack + domain pack` 推荐关系提权
  - `installable` 的 external `MCP` 会继续优先于 browse-only 条目
- MCP 去重
  - external `MCP` 搜索结果会按 canonical name 去重
  - 同名条目优先保留 `installable`，其次保留更高版本

### 当前安装边界
- external `skill`
  - 通过 `skills.sh` CLI 显式安装
  - 再同步到当前客户端的 runtime skill 目录
- external `MCP`
  - 当前只对可安全映射为 `npm + stdio` 的条目开放直接安装
  - 其他条目保持 `browse-only`

### 已补齐
- Desktop 内对 external MCP 安装前展示完整 `command / args / env / requiredSecrets` 二次确认

### 暂未实现
- external MCP 二次确认后的风险分级（例如 `official / curated / community` 对应不同提醒强度）

## Deferred Item Relationship

这条线与 `Windows release` 无直接耦合。
因此在当前阶段应：
- 继续把 `Windows packaging` 保持为 Deferred
- 把 registry integration 作为独立治理主线推进

## References

- `skills.sh` CLI docs: https://skills.sh/docs/cli
- `skills.sh` directory: https://skills.sh/
- Official MCP Registry: https://registry.modelcontextprotocol.io/
- MCP Registry preview blog: https://blog.modelcontextprotocol.io/posts/2025-09-08-mcp-registry-preview/
