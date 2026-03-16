# Python Stack Pack

**Version**: v3.0  
**Updated**: 2026-03-12  
**Scope**: FastAPI services, Django apps, Python backends, automation and data-heavy service work

---

## 1. Purpose

当任务核心是下面这些内容时，加载这个 stack：
- Python backend API
- FastAPI 或 Django service
- async IO 与 service orchestration
- 仍需生产纪律的数据处理 pipeline
- Python-first automation 或 internal service

这个 stack 主要与下面这些 role-pack 配对：
- `python-backend-engineer`
- `solution-architect`
- `qa-strategist`
- `release-devex`

当这个 stack 生效时，推荐优先使用的 core skills：
- `backend-development`
- `python-patterns`
- `python-testing`
- 如果是 Django，则补 `django-patterns` / `django-tdd` / `django-security` / `django-verification`
- `systematic-debugging`
- `code-review`

research / reference 优先级：
1. `context7`：framework 和 dependency 官方文档
2. `deepwiki`：开源实现参考
3. `GitHub MCP`：repository 和 PR 上下文

---

## 2. Default Technology Choices

### 2.1 Runtime and Package Management

默认优先级：
- Python `3.12+`
- `uv`：环境与依赖管理
- `ruff`：lint / format
- `pytest`：默认 test runner

避免：
- 不更新 lockfile 的临时 package install
- 在同一 repo 无理由混用多套 dependency manager
- 在核心 service path 中放任弱类型而不写 type hint

### 2.2 Framework Split

下面这些场景优先使用 `FastAPI`：
- 项目以 API 为主
- async IO 重要
- request / response contract 强依赖 typed schema
- OpenAPI generation 有价值

下面这些场景优先使用 `Django`：
- admin、ORM、auth、batteries-included workflow 很重要
- 应用偏 content-heavy 或 back-office
- 一体化 web stack 比分散拼装更合适

除非 repo 既有依赖就用 Flask，否则不建议把 Flask 作为新的 production 默认选择。

---

## 3. Service Architecture

推荐结构：
- `api` / router
- `schemas`
- `services`
- `repositories` 或 data access layer
- `models`
- `core` / settings / shared infra
- `tasks`：async / background workflow

规则：
- route handler 保持足够薄
- service layer 负责编排和业务规则
- persistence concern 要显式可见
- external integration 应拆成独立 adapter

不要：
- 把 business rule 隐进 route handler
- 默认把 ORM model 当公开 API contract
- 把 settings、IO、domain logic 混进 utility module

---

## 4. API, Validation, and Typing

### 4.1 Boundary Rules

始终优先：
- 明确的 request / response schema
- 在 boundary 做 input validation
- service function 使用 typed return value
- 对外错误使用 machine-readable response

FastAPI 默认：
- 用 Pydantic model 定义 request / response contract
- 用 dependency injection 管理 auth、DB session 和 cross-cutting concern
- 只有当下游栈真正是 async 时，才把 handler 做成 async

Django 默认：
- serializer / form 负责 validation
- model method 不是无关 orchestration 的垃圾桶
- 当 API 工作量明显上升时，优先用 DRF

### 4.2 Typing Rules

对非 trivial code，至少做到：
- function signature typed
- public service contract typed
- 核心路径尽量避免 `Any`
- 尽量用 typed alias / dataclass / pydantic model，少用 loose dict contract

---

## 5. Persistence, IO, and Background Work

默认选择：
- `SQLAlchemy 2.x`：FastAPI / service-oriented persistence
- Django ORM：Django-native project
- query 复杂后，再引入显式 repository / data-access helper

规则：
- transaction 必须足够显式，能让人推理它的边界
- 长任务应按需要移到 background execution
- retry、timeout、external IO policy 必须在代码中可见

避免：
- 在 async handler 里偷偷做 blocking IO
- 使用隐式 global session 或不可见的跨层 DB access
- data pipeline 没有 validation 或 schema boundary

如果存在 background work，至少说明：
- trigger condition
- retry policy
- idempotency expectation
- failure visibility

---

## 6. Security Defaults

始终强制：
- 所有 external input 做 validation
- secret 通过 env / secret store 管理
- authn / authz 放在正确边界处理
- SQL injection 通过 ORM binding 或安全参数化规避
- automation script 的 file/path handling 要安全
- 日志和 trace 要过滤敏感输出

当任务触及下面这些区域时，要进入 security-oriented review：
- login / token
- file upload / parsing
- webhook
- background task 与 external system 交互
- dynamic execution 或 shell interaction

---

## 7. Testing and Verification

### 7.1 Test Strategy

默认 testing pyramid：
- unit test：业务逻辑
- integration test：persistence 与 API boundary
- async test：只有 async code 真有意义时才补
- end-to-end check：关键用户流程

任何有意义的 feature work 至少要补：
- happy path
- 关键 failure path
- validation / auth path（如适用）
- bugfix 的 regression coverage

推荐工具：
- `pytest`
- `pytest-asyncio`
- `httpx`
- framework-native test client
- 在 infra 行为敏感时用 `Testcontainers` 或足够真实的 service fixture

### 7.2 Verification Before Completion

在声称完成前，至少运行 repo 适用子集：
- `uv run pytest`
- `pytest`
- `ruff check .`
- `ruff format --check .`
- 当 typing 有要求时跑 `mypy .`
- 如 repo 已配置，则补 framework-specific verification

如果是 Django 任务，还应额外确认：
- migration
- settings correctness
- auth / permission regression

---

## 8. Observability and Runtime Discipline

优先：
- structured logging
- 明确的 exception mapping
- request-heavy service 的 correlation ID
- deployable service 的 health / readiness check
- 对 external call 的 timeout / retry 行为保持可见

避免：
- 裸 `except Exception` 却不做重分类
- 在 hot path 留下 noisy debug log
- 在异步路径里把失败吞掉却不留下可追踪证据

---

## 9. Automation and Background Work Defaults

如果任务涉及 automation / agent / worker / cron / queue，至少补齐：
- trigger source
- state persistence
- retry / backoff policy
- idempotency
- timeout / cancellation
- human handoff 或 failure visibility

默认优先：
- 让 workflow state 可见
- 把 side effect 边界收口在明确 adapter 中
- 把 prompt / model / external tool 变化当成代码级风险来看待

---

## 10. Data and AI-Oriented Python Guidance

当 Python 任务偏 data / AI / automation 时，优先检查：
- schema 是否稳定
- 中间产物是否可追踪
- 长链路失败是否能定位到具体阶段
- 模型输出是否有校验或 guardrail
- 文件 / 文本 / API 输入是否有显式 boundary

不要：
- 把 agent / automation 流程写成一大段不可复用脚本
- 把 prompt、解析、业务规则、外部 IO 混在一起
- 在缺乏验证的情况下把 LLM 输出直接当最终事实

---

## 11. Role Mapping Notes

这个 stack 默认最适合：
- `python-backend-engineer`
- `ai-automation-engineer`
- `solution-architect`
- `qa-strategist`

如果任务更偏工作流编排、MCP、agent orchestration，建议叠加：
- `workflow-automation`
- `architecture`
- 默默吞掉 task failure
- 让 data script 在没有 traceability 的情况下修改状态

---

## 9. Delivery Checklist

对 Python 任务来说，真正的“完成”至少能回答：
- 为什么选这个 framework path
- validation / auth / IO boundary 怎么处理的
- sync vs async 行为是否正确
- 新增或更新了哪些 test
- 还剩哪些 release / runtime 风险
- 哪个经验值得进入 memory / instinct / learned skill

---

## 10. Role Pairing Notes

### `python-backend-engineer + python`
重点关注 explicit contract、framework-appropriate structure 和 testability。

### `solution-architect + python`
重点关注 service boundary、async realism、workflow orchestration 和 dependency clarity。

### `qa-strategist + python`
重点推动 regression coverage、validation/auth testing 和真实 integration check。

### `release-devex + python`
重点关注 environment reproducibility、lockfile、startup behavior、migration 和 operational visibility。
