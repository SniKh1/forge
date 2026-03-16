# Java / Spring Stack Pack

**Version**: v3.0  
**Updated**: 2026-03-12  
**Scope**: Spring Boot services, Java backends, service APIs, integration-heavy systems

---

## 1. Purpose

当任务核心是下面这些内容时，加载这个 stack：
- Java backend service
- Spring Boot API
- domain / service 分层
- 基于 JPA 的 relational persistence 或 SQL-first 工作流
- 对测试和验证要求较高的关键业务系统

这个 stack 主要与下面这些 role-pack 配对：
- `java-backend-engineer`
- `solution-architect`
- `qa-strategist`
- `release-devex`

当这个 stack 生效时，推荐优先使用的 core skills：
- `backend-development`
- `springboot-patterns`
- `jpa-patterns`
- `springboot-security`
- `springboot-tdd`
- `springboot-verification`
- `systematic-debugging`
- `code-review`

research / reference 优先级：
1. `context7`：Spring / Java 官方文档
2. `deepwiki`：开源实现参考
3. `GitHub MCP`：repo 范围的代码、PR 和上下文

---

## 2. Default Technology Choices

### 2.1 Runtime and Build

默认优先级：
- Java `21 LTS`
- Spring Boot `3.3+`
- Gradle `8.x` + Kotlin DSL
- Maven `3.9+` 只在 repo 已经标准化使用时继续沿用

避免：
- 没有明确批准就把 preview Java feature 放进稳定生产路径
- 在同一个 service 里混用 Gradle 和 Maven 习惯
- 明明应该用 configuration properties class，却仍用 untyped map 配置

### 2.2 Service Architecture

推荐的 service 结构：
- `controller` / `api`
- `application` / `service`
- `domain`
- `repository`
- `infrastructure`
- `config`
- `exception`

规则：
- controller 只处理 HTTP boundary
- service 负责业务编排和 transaction boundary
- repository 只专注 persistence，不吞掉 business rule
- infrastructure adapter 尽量与 domain contract 隔离

不要：
- 把 orchestration logic 写进 controller
- 直接把 JPA entity 当公开 API contract 暴露出去
- 把 persistence concern 混进 DTO mapper 或 validator

---

## 3. API and Domain Rules

### 3.1 API Defaults

除非明确需要 GraphQL 或 event-driven 设计，否则默认使用 REST。

必须遵守：
- request / response DTO 明确建模
- validation 放在 boundary
- error response shape 稳定可预测
- list endpoint 需要考虑 pagination
- 对 retry 或 external callback 要考虑 idempotency

推荐 response model：
- 业务 payload + machine-readable error code
- 不要把原始 exception message 直接暴露给客户端

### 3.2 Domain Modeling

优先：
- 可行时尽量使用 immutable DTO / record
- aggregate 和 boundary 要清楚
- 用 enum / value object 代替 stringly typed state
- 复杂度上升时，区分 write-model 和 read-model

适合使用 record 的地方：
- response model
- request DTO
- internal value carrier

避免：
- 巨大的 “service util” 类
- anemic domain，导致所有规则散落在 controller 和 repository
- 生命周期分支过多、字段高度可变的 god entity

---

## 4. Persistence and Data Access

默认选择：
- `Spring Data JPA`：标准 CRUD 和 domain persistence
- `JOOQ` 或显式 SQL：当 query correctness 和 SQL 控制力更重要时
- `MyBatis`：只有 repo 已经标准化时继续使用

### 4.1 JPA Rules

优先：
- 显式决定 fetch strategy
- transaction method 保持边界清楚
- repository method 与真实 use-case 对齐
- query-heavy 改动要同时考虑 index 与说明

避免：
- controller serialization 阶段才暴露 lazy loading 惊喜
- 留下没验证过的 N+1 query
- 用大而泛的 repository inheritance 隐藏行为复杂度

### 4.2 Schema and Migration Rules

所有 schema 变更都应使用 versioned migration。

对于 data migration，至少要补齐：
- forward plan
- rollback 或 mitigation plan
- rerun 时的 idempotency 判断
- 涉及大表时的 production safety note

---

## 5. Security Defaults

这个 stack 默认必须高标准对待 security。

始终强制：
- 用 Bean Validation 做输入校验
- 在正确边界处理 authentication / authorization
- secret 必须走 env / vault / config，禁止 hardcode
- cookie-based flow 要明确说明 CSRF posture
- SQL injection 通过参数化查询或 ORM binding 规避
- 对 user-visible field 做安全输出与错误处理

当任务涉及下面这些区域时，优先使用 `springboot-security`：
- login
- roles / permissions
- token flow
- filter / interceptor
- session policy
- headers / CORS / rate limits

---

## 6. Testing and Verification

### 6.1 Test Strategy

默认 testing pyramid：
- unit test：业务逻辑
- slice test：controller / repository boundary
- integration test：真实 wiring 与 persistence
- Testcontainers：对基础设施行为敏感的路径

对任何有意义的 feature work，至少要补：
- happy path
- 关键 failure path
- validation / auth path（如适用）
- bugfix 对应的 regression test

推荐同时使用：
- `springboot-tdd`
- `springboot-verification`
- `code-review`

### 6.2 Verification Before Completion

在声称完成前，至少运行 repo 适用子集：
- `./gradlew test`
- `./gradlew build`
- `./gradlew check`
- 如已配置则补 static analysis
- 对 logging、secret、debug residue 做 focused manual diff review

如果改动触及 schema、auth、cache 或 async processing，完成说明里必须显式提到这些区域的验证结果。

---

## 7. Observability and Operations

优先：
- structured log
- 清晰的 error code 与 correlation identifier
- actuator / health endpoint（如适用）
- 高风险路径的 metrics
- 对 external call 的 retry / timeout policy 做显式说明

避免：
- 在 hot path 留大量 noisy info log
- 记录 secret、token 或 PII
- 吞掉 integration error 却返回模糊成功结果

---

## 8. Integration and Resilience Defaults

凡是涉及外部依赖或跨服务协作，至少补齐：
- timeout policy
- retry policy
- idempotency expectation
- 降级或 fallback 行为
- failure visibility

如果任务包含 MQ / event / async integration，必须显式说明：
- producer / consumer boundary
- ordering / deduplication 假设
- poison message 或失败重试策略
- replay / backfill 影响

---

## 9. Performance and Data Discipline

优先检查：
- query shape 是否与真实 use-case 对齐
- 是否存在 N+1、全表扫描、过宽 DTO
- 大对象序列化是否可控
- cache 是否真的有命中价值，而不是徒增一致性复杂度

涉及大表、重查询、批量任务时，完成说明里至少要提到：
- index 假设
- 数据量级
- 最坏路径风险
- 上线后要观察的指标

---

## 10. Role Mapping Notes

这个 stack 默认最适合：
- `java-backend-engineer`
- `solution-architect`
- `qa-strategist`
- `release-devex`

如果任务核心更偏平台治理、构建链路或发布系统，应叠加：
- `release`
- `architecture`

如果任务核心更偏业务流程自动化，应额外叠加：
- `workflow-automation`

---

## 8. Delivery Checklist

对 Java / Spring 任务来说，真正的“完成”至少能回答：
- 哪一层被修改了，以及为什么
- validation / auth / data boundary 怎么处理的
- 新增或更新了哪些 test
- query / transaction 行为有没有验证
- 是否存在 migration 或 rollout 风险
- 哪个经验值得进入 memory / instinct / learned skill

---

## 9. Role Pairing Notes

### `java-backend-engineer + java`
重点关注 correctness、test、repository boundary 和 transaction scope。

### `solution-architect + java`
重点关注 module boundary、domain ownership、sync vs async 设计和 persistence tradeoff。

### `qa-strategist + java`
重点推动 regression coverage、integration realism 以及 auth / validation / migration 风险验证。

### `release-devex + java`
重点关注 build reproducibility、migration safety、config drift、health check 和 rollback note。
