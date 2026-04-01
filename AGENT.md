# Forge Agent Entry

**Version**: v5.0  
**Updated**: 2026-04-01

<!-- 
  通用入口文件：
  - Codex 使用此文件作为主入口
  - Claude 在没有 CLAUDE.md 时回退到此文件
  - Gemini 在没有 GEMINI.md 时回退到此文件
  - 详见 docs/MULTI-CLIENT-ENTRY.md
-->

这是 Forge 的通用入口文件，适用于所有 AI 客户端。

## Source of Truth

核心规则来源：
- `rules/global-core.md` - 全局核心规则
- `rules/learning-memory.md` - 学习与记忆策略
- `rules/agents.md` - Agent 编排规则
- `rules/security.md` - 安全边界
- `rules/testing.md` - 测试要求
- `rules/hooks.md` - Hooks 策略
- `roles/*.md` - 角色定义
- `stacks/*.md` - 技术栈约束
- `core/skill-registry.json` - Skill 注册表

## Default Behavior

### Role and Stack Selection
- 默认 role: `roles/developer.md`
- 根据任务推断 stack:
  - frontend/UI/desktop → `stacks/frontend.md`
  - Java/Spring → `stacks/java.md`
  - Python/FastAPI/Django → `stacks/python.md`

### Agent Routing
- 复杂规划 → `planner`
- 架构决策 → `architect`
- 新功能/bugfix → `tdd-guide`
- 代码审查 → `code-reviewer`
- 安全审查 → `security-reviewer`
- 构建失败 → `build-error-resolver`
- E2E 测试 → `e2e-runner`

### Task Grading
- simple → 直接执行
- medium → inspect → 方案 → 执行
- complex → RESEARCH → PLAN → EXECUTE → REVIEW

### Verification
- 必须有验证证据才能声称完成
- 完成前移除 debug residue
- 重要改动需要 review

### Security
- 禁止 hardcoded secrets
- 验证所有用户输入
- 无明确要求时不做破坏性操作

详细规则请参考 `rules/` 目录。
