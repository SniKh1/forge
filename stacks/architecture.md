# Architecture Stack Pack

## Scope
用于 service boundary、接口定义、数据流和系统设计决策。

## Defaults
- 先定义职责，再选技术。
- 优先保留明确边界和可替换 seams。
- 对 rejected alternatives 做显式记录。
- migration 与 compatibility 影响必须被看见。

## Preferred Skills
- `context-engineering`
- `backend-development`
- `docs-seeker`

## Recommended MCP
- context7
- deepwiki
- GitHub MCP

## Output Shape
- boundary map
- interface / contract notes
- data flow summary
- rejected alternatives
- migration / compatibility notes

## Validation Checklist
- 职责边界是否可执行，而不是抽象口号？
- 接口契约是否足够让实现层直接落地？
- 是否记录了 rejected alternatives 和 tradeoff？
- 是否考虑了 migration、compatibility、rollback？

## Collaboration Contract
- 与 `solution-architect` 绑定时，优先沉淀系统边界和替换点。
- 与 `developer` 结合时，输出必须能直接指导实现拆分。
- 与 `release` 结合时，显式说明版本、迁移和发布风险。
- 与 `qa` 结合时，说明哪些边界最值得做回归验证。
