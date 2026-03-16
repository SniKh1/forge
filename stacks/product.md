# Product Stack Pack

**Version**: v3.1
**Updated**: 2026-03-16
**Scope**: 产品规划、需求收束、优先级判断、验收标准、发布协同

---

## 1. Purpose

当任务核心是下面这些内容时，加载这个 stack：
- 需求澄清与范围收束
- roadmap / 优先级 / tradeoff 判断
- PRD / brief / acceptance criteria 编写
- rollout、dependency、风险说明
- 跨产品、设计、研发、测试、发布的对齐工作

这个 stack 主要与下面这些 role-pack 配对：
- `product-manager`
- `engineering-manager`
- `solution-architect`
- `release-devex`

优先 skills：
- `brainstorming`
- `doc-coauthoring`
- `internal-comms`
- `docs-seeker`
- `mcp-management`

优先 MCP：
- Notion
- Linear
- Atlassian / Rovo
- Slack
- GitHub

---

## 2. Default Working Model

默认工作顺序：
1. 重述用户问题
2. 明确 business goal / user outcome
3. 定义 in-scope / out-of-scope
4. 写 success criteria
5. 标注依赖、风险、未知项
6. 再进入 solution exploration

必须遵守：
- 不把模糊目标伪装成已经清楚的结论
- 不跳过验收标准直接进入实现
- 不把 tradeoff 藏在口头里，必须显式写出来
- 不输出只有漂亮话、没有执行价值的文档

---

## 3. Decision Framework

### 3.1 Scope Discipline

每个提案至少包含：
- 用户问题
- 目标用户
- 目标行为变化
- 成功指标
- 非目标项
- 最大风险

如果一个 feature 无法回答“为什么现在做”，就不应该进入执行。

### 3.2 Prioritization Defaults

优先用这几个维度评估：
- 用户价值
- 商业影响
- 工程成本
- 风险与可逆性
- 对现有 roadmap 的干扰程度

默认偏好：
- 优先做高价值、低耦合、可验证的小步交付
- 谨慎对待一次性大范围重写型提案
- 高不确定问题优先做 discovery / spike，而不是直接承诺 full delivery

---

## 4. Output Shape

默认产出应接近下面结构：
- 背景与问题定义
- 用户目标 / business goal
- scope / non-scope
- 方案概要
- acceptance criteria
- 风险与依赖
- rollout plan
- open questions / deferred decisions

短文档优先，除非复杂度要求更高。

---

## 5. Collaboration Rules

与 `ui-designer` 配合时：
- 先对齐 flow、状态和 success criteria
- 再讨论界面结构与视觉表达

与 `developer` / `frontend-engineer` / `backend-engineer` 配合时：
- 先写清约束、边界和验收标准
- 不把“你们看着做”当成需求交付

与 `qa-strategist` 配合时：
- 明确哪些路径必须回归
- 预先定义 failure 也算不算符合预期

与 `release-devex` / `platform-engineer` 配合时：
- 提前给 rollout、monitoring、support note
- 高风险改动要先讨论 rollback 或 mitigation

---

## 6. Validation Checklist

结束前至少自查：
- 用户问题是否被准确重述？
- 成功标准是否可验证？
- scope / out-of-scope 是否清楚？
- 是否写清依赖与风险？
- 研发 / 设计 / 测试是否能直接据此行动？

---

## 7. Anti-Patterns

避免：
- 用长文掩盖问题没想清楚
- 只有“愿景”没有执行入口
- 只有功能列表没有优先级
- 只有 happy path 没有失败与约束说明
- 在技术明显不支持时仍然强压不切实际承诺
