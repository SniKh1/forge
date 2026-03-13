# Forge Runtime Skill De-dup v1

**Updated**: 2026-03-12  
**Scope**: 运行时 skill 同步与客户端目录去重策略  
**Status**: v1 landed; duplicate detection 已接入 `verify`，installer-side canonical sync 已落第一版

## Why This Exists

仓库层的 `skills/` 现在已经有 canonical registry，可读性和治理入口都已经建立。  
但在运行时目录里，尤其是 `~/.codex/skills`，仍然存在重复安装：

- `skill-creator`
- `docx`
- `pdf`
- `pptx`
- `xlsx`
- `verification-before-completion`

这些重复不是“功能真的不同”，而是：
- 目录布局历史不同
- `.system` / `document-skills` / `superpowers` 和根目录版本并存
- 安装器曾经按路径拷贝，而不是按 canonical id 同步

## Goals

运行时去重要达成 3 个目标：

1. **客户端只看到一个 canonical entry**
2. **Desktop / registry / installer 使用同一套 canonical id**
3. **保留兼容性，不因为去重直接破坏旧路径引用**

## Canonical Rules

### 1. Canonical source

单一事实来源：
- `core/skill-registry.json`

每个 skill 的 canonical id 由 registry 决定。  
installer、Desktop catalog、客户端同步逻辑都必须读取这份文件。

### 2. Canonical path selection

当同一 id 在仓库里存在多个目录时：

优先级如下：

1. 直接位于 `skills/<id>/`
2. 更短的相对路径
3. 明确标记为 `.system` 的路径只在“系统保留 skill”场景下优先
4. `document-skills/*`、`superpowers/*` 这类历史分组路径不再作为默认落盘目标

### 3. Client sync behavior

同步到：
- `~/.claude/skills`
- `~/.codex/skills`
- `~/.gemini/skills`

时应遵守：

- 一个 canonical id 只能落一个目录
- 如果发现旧路径仍存在：
  - 不立即强删
  - 先记录迁移计划
  - 可以选择建立兼容链接或保留只读兼容副本

## Installer Rules

安装器后续要改成：

1. 读取 `core/skill-registry.json`
2. 按 canonical id 计算目标路径
3. 同步前扫描客户端现有 skills
4. 如发现重复：
  - 输出 warning
  - 只更新 canonical 目录
  - 旧目录进入 migration report

### Deferred cleanup

真正删除旧重复目录，不在当前阶段做。  
原因：
- 需要先确认旧目录是否仍被某些脚本或用户习惯引用
- 需要先验证 Claude / Codex / Gemini 的扫描行为

## Desktop Rules

Forge Desktop 后续只展示：
- canonical id
- canonical title
- canonical summary

不展示：
- 运行时重复副本
- 历史路径差异

如果检测到客户端存在重复安装，后续应在高级诊断页提示：
- duplicated ids
- canonical path
- legacy path candidates

## Implementation Phases

### Phase A
- registry 已成为 canonical source
- Desktop 已从 registry 读 skill catalog

### Phase B
- installer 改为 canonical sync
- verify 脚本增加 duplicate detection

Current state:
- duplicate detection 已接入 Claude / Codex / Gemini 的 `verify`
- 安装器已按 `core/skill-registry.json` 同步 canonical skill
- `document-skills` 这类非 skill 顶层容器目录会在安装时被清理
- `.system` 这类宿主保留目录暂不自动清理

### Phase C
- Desktop 增加 duplicate warning
- 提供迁移 / 清理建议

### Phase D
- 在确认无兼容风险后，再删除 legacy duplicate paths

## Deferred Scope

以下内容暂不在本阶段处理：
- 自动删除客户端旧 skill 目录
- release/action 层面的技能目录去重
- Windows packaging 相关回归
