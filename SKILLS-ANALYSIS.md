# Forge Skills 全面分析报告

**生成日期**：2026-02-25
**Skills 总数**：1254 个
**分析目标**：功能分类、冗余识别、权重评估、清理建议

---

## 一、总体概览

当前全局安装了 1254 个 skill，来源包括 everything-claude-code、davila7/claude-code-templates、vercel-labs/agent-skills 等多个仓库。按功能领域可分为以下 **18 个大类**：

| 序号 | 类别 | 数量(估) | 日常开发权重 |
|------|------|----------|-------------|
| 1 | 前端/UI/设计 | ~80 | ★★★★★ |
| 2 | 后端/API | ~60 | ★★★★★ |
| 3 | AI/ML/LLM | ~120 | ★★★★☆ |
| 4 | 安全/渗透测试 | ~80 | ★★★☆☆ |
| 5 | DevOps/部署/云 | ~90 | ★★★★☆ |
| 6 | 数据库 | ~40 | ★★★★☆ |
| 7 | 测试/QA | ~40 | ★★★★★ |
| 8 | 代码质量/重构 | ~30 | ★★★★★ |
| 9 | Agent/自主代理开发 | ~40 | ★★★★☆ |
| 10 | SaaS 工具自动化 | ~100 | ★★☆☆☆ |
| 11 | 文档/写作 | ~40 | ★★★☆☆ |
| 12 | 生物信息学/科学计算 | ~100 | ★☆☆☆☆ |
| 13 | 营销/SEO/商业 | ~50 | ★★☆☆☆ |
| 14 | 特定语言/框架 | ~80 | ★★★☆☆ |
| 15 | Git/版本控制 | ~20 | ★★★★★ |
| 16 | 上下文/记忆管理 | ~15 | ★★★★☆ |
| 17 | Skill/Plugin 元工具 | ~15 | ★★☆☆☆ |
| 18 | 其他/杂项 | ~50 | ★☆☆☆☆ |

> 权重说明：★★★★★ = 几乎每天用到，★☆☆☆☆ = 极少场景才需要

---

## 二、各类别详细分析

### 2.1 前端/UI/设计（~80 个）

**核心 skill（推荐保留）：**

| Skill | 功能 | 权重 |
|-------|------|------|
| `frontend-design` | 前端设计总入口，UI/组件设计指导 | ★★★★★ |
| `aesthetic` | 美学设计原则，视觉层次/配色/微交互 | ★★★★★ |
| `web-frameworks` | React/Vue/Next.js 等框架最佳实践 | ★★★★★ |
| `ui-styling` | CSS/Tailwind/样式系统 | ★★★★☆ |
| `theme-factory` | 主题系统创建 | ★★★☆☆ |
| `responsive-design` | 响应式设计 | ★★★★☆ |
| `design-to-code` | 设计稿转代码 | ★★★★☆ |
| `core-web-vitals` | Web 性能指标优化 | ★★★★☆ |
| `tailwind-patterns` | Tailwind CSS 模式 | ★★★★☆ |
| `react-best-practices` | React 最佳实践 | ★★★★★ |
| `react-patterns` | React 设计模式 | ★★★★☆ |
| `react-state-management` | React 状态管理 | ★★★★☆ |
| `nextjs-best-practices` | Next.js 最佳实践 | ★★★★☆ |
| `nextjs-app-router-patterns` | Next.js App Router 模式 | ★★★★☆ |

**冗余组（功能重叠，建议合并/保留一个）：**

| 冗余组 | 包含的 skill | 建议保留 |
|--------|-------------|---------|
| React 开发 | `react-best-practices`, `react-dev`, `react-patterns`, `react-ui-patterns`, `react-nextjs-development`, `react-modernization`, `react-useeffect` | `react-best-practices` + `react-patterns` |
| Angular | `angular-best-practices`, `angular-migration`, `angular-state-management`, `angular-ui-patterns` | 除非用 Angular，否则全部可删 |
| 设计系统 | `design-system-patterns`, `design-system-starter`, `ui-design-system`, `radix-ui-design-system`, `stitch-ui-design` | `design-system-patterns` |
| 无障碍 | `accessibility`, `accessibility-auditor`, `accessibility-compliance`, `accessibility-compliance-accessibility-audit`, `wcag-audit-patterns`, `screen-reader-testing` | `accessibility` + `wcag-audit-patterns` |
| Figma | `figma`, `figma-automation`, `figma-implement-design` | `figma-implement-design` |
| 移动端设计 | `mobile-design`, `mobile-android-design`, `mobile-ios-design` | `mobile-design` |

**低价值 skill（可考虑删除）：**
- `3d-web-experience` — 3D Web 体验，极少用到
- `algorithmic-art` — 算法艺术/生成艺术
- `canvas-design` — Canvas 绘图设计
- `scroll-experience` — 滚动体验设计
- `interactive-portfolio` — 交互式作品集
- `shader-programming-glsl` — GLSL 着色器编程
- `avalonia-*`（3个）— Avalonia UI 框架，除非做 .NET 桌面开发

---

### 2.2 后端/API（~60 个）

**核心 skill（推荐保留）：**

| Skill | 功能 | 权重 |
|-------|------|------|
| `backend-development` | 后端开发总入口 | ★★★★★ |
| `api-design-principles` | REST/GraphQL API 设计原则 | ★★★★★ |
| `api-patterns` | API 设计模式，REST vs GraphQL vs tRPC | ★★★★☆ |
| `architecture` | 架构决策框架 | ★★★★★ |
| `architecture-patterns` | Clean/Hexagonal/DDD 架构模式 | ★★★★☆ |
| `microservices-patterns` | 微服务设计模式 | ★★★★☆ |
| `auth-implementation-patterns` | JWT/OAuth2/Session 认证模式 | ★★★★★ |
| `better-auth` | 认证实现最佳实践 | ★★★★☆ |
| `error-handling-patterns` | 错误处理模式 | ★★★★★ |
| `graphql` | GraphQL 开发 | ★★★☆☆ |
| `nestjs-expert` | NestJS 框架专家 | ★★★☆☆ |
| `fastapi-endpoint` | FastAPI 端点开发 | ★★★☆☆ |
| `cqrs-implementation` | CQRS 模式实现 | ★★★☆☆ |
| `event-sourcing-architect` | 事件溯源架构 | ★★★☆☆ |

**冗余组：**

| 冗余组 | 包含的 skill | 建议保留 |
|--------|-------------|---------|
| 后端模式 | `backend-development`, `backend-dev-guidelines`, `backend-patterns`, `backend-development-feature-development`, `cc-skill-backend-patterns` | `backend-development` + `backend-patterns` |
| API 文档 | `api-documentation`, `api-documentation-generator`, `openapi-spec-generation`, `openapi-to-typescript` | `api-documentation` + `openapi-spec-generation` |
| API 安全 | `api-security-best-practices`, `api-security-testing`, `api-fuzzing-bug-bounty`, `api-fuzzing-for-bug-bounty` | `api-security-best-practices` |
| DDD | `domain-driven-design`, `ddd-context-mapping`, `ddd-strategic-design`, `ddd-tactical-patterns` | `domain-driven-design`（已包含全部） |
| FastAPI | `fastapi-endpoint`, `fastapi-router-py`, `fastapi-templates`, `python-fastapi-development` | `fastapi-endpoint` |
| 架构 | `architecture`, `architecture-decision-records`, `architecture-patterns`, `architect-review`, `senior-architect`, `software-architecture`, `c4-architecture`, `c4-architecture-c4-architecture` | `architecture` + `architecture-patterns` |

**低价值 skill：**
- `dotnet-backend`, `dotnet-backend-patterns` — 除非用 .NET
- `laravel-expert`, `laravel-security-audit` — 除非用 Laravel/PHP
- `moodle-external-api-development` — Moodle 平台专用
- `saga-orchestration` — 极少场景
- `projection-patterns` — 投影模式，非常小众

---

### 2.3 AI/ML/LLM（~120 个）

这是数量最多的类别，涵盖从 LLM 应用开发到模型训练、量化、评估的完整链路。

**核心 skill（推荐保留）：**

| Skill | 功能 | 权重 |
|-------|------|------|
| `ai-ml` | AI/ML 工作流总入口 | ★★★★★ |
| `ai-multimodal` | Gemini 多模态处理（音频/图像/视频/文档） | ★★★★☆ |
| `rag-implementation` | RAG 检索增强生成实现 | ★★★★★ |
| `rag-engineer` | RAG 工程师专家 | ★★★★☆ |
| `langchain` | LangChain 框架 | ★★★★☆ |
| `langgraph` | LangGraph 多 Agent 编排 | ★★★★☆ |
| `prompt-engineering` | 提示工程 | ★★★★★ |
| `transformers` | HuggingFace Transformers | ★★★★☆ |
| `embedding-strategies` | 嵌入策略 | ★★★★☆ |
| `llm-evaluation` | LLM 评估 | ★★★☆☆ |
| `constitutional-ai` | 宪法 AI 安全对齐 | ★★★☆☆ |

**冗余组：**

| 冗余组 | 包含的 skill | 建议保留 |
|--------|-------------|---------|
| 提示工程 | `prompt-engineering`, `prompt-engineer`, `prompt-engineering-patterns`, `prompt-library`, `prompt-caching`, `senior-prompt-engineer` | `prompt-engineering` |
| LLM 应用 | `llm-app-patterns`, `llm-application-dev-ai-assistant`, `llm-application-dev-langchain-agent`, `llm-application-dev-prompt-optimize`, `ai-product`, `ai-wrapper-product` | `llm-app-patterns` + `ai-product` |
| LLM 评估 | `llm-evaluation`, `eval-harness`, `evaluating-code-models`, `evaluating-llms-harness`, `evaluation` | `llm-evaluation` + `eval-harness` |
| RAG | `rag-engineer`, `rag-implementation`, `hybrid-search-implementation`, `similarity-search-patterns` | `rag-implementation` |
| Agent 框架 | `crewai`, `crewai-multi-agent`, `autogpt-agents`, `langchain`, `langgraph`, `langchain-architecture`, `dspy` | 按实际使用保留 |

**模型量化/训练类（除非做模型训练，否则全部低价值）：**
- `awq-quantization`, `gptq`, `gguf-quantization`, `hqq-quantization`, `quantizing-models-bitsandbytes` — 量化工具
- `axolotl`, `unsloth`, `llama-factory`, `fine-tuning-with-trl`, `peft-fine-tuning` — 微调框架
- `grpo-rl-training`, `simpo-training`, `slime-rl-training`, `miles-rl-training`, `verl-rl-training`, `openrlhf-training`, `torchforge-rl-training` — RL 训练
- `deepspeed`, `pytorch-fsdp`, `pytorch-lightning`, `distributed-llm-pretraining-torchtitan`, `training-llms-megatron` — 分布式训练
- `moe-training`, `model-merging`, `model-pruning`, `knowledge-distillation`, `speculative-decoding` — 模型优化
- `mamba-architecture`, `rwkv-architecture`, `nanogpt` — 特定架构
- `llama-cpp`, `tensorrt-llm`, `sglang`, `serving-llms-vllm` — 推理部署
- `nemo-curator`, `nemo-evaluator-sdk`, `nemo-guardrails` — NVIDIA NeMo 系列

> 以上约 35 个 skill，除非你在做模型训练/部署，否则建议全部移除。

---

### 2.4 安全/渗透测试（~80 个）

**核心 skill（推荐保留）：**

| Skill | 功能 | 权重 |
|-------|------|------|
| `security-review` | 安全审查总入口 | ★★★★★ |
| `security-best-practices` | 安全最佳实践 | ★★★★★ |
| `security-audit` | 安全审计 | ★★★★☆ |
| `secrets-management` | 密钥管理 | ★★★★☆ |
| `security-threat-model` | 威胁建模 | ★★★☆☆ |
| `pentest-checklist` | 渗透测试清单 | ★★★☆☆ |

**冗余组：**

| 冗余组 | 包含的 skill | 建议保留 |
|--------|-------------|---------|
| 安全审查 | `security-review`, `security-audit`, `security-best-practices`, `cc-skill-security-review`, `security-compliance`, `security-compliance-compliance-check` | `security-review` + `security-best-practices` |
| 安全扫描 | `security-scanning-security-dependencies`, `security-scanning-security-hardening`, `security-scanning-tools`, `scanning-tools`, `vulnerability-scanner`, `sast-configuration` | `security-scanning-tools` |
| XSS/注入 | `cross-site-scripting-and-html-injection-testing`, `xss-html-injection`, `html-injection-testing`, `sql-injection-testing` | `xss-html-injection` + `sql-injection-testing` |
| 渗透测试 | `pentest-checklist`, `pentest-commands`, `ethical-hacking-methodology`, `red-team-tactics`, `red-team-tools`, `red-team-tools-and-methodology` | `pentest-checklist` |
| 文件遍历 | `file-path-traversal`, `file-path-traversal-testing` | 保留一个 |
| IDOR | `idor-testing`, `idor-vulnerability-testing` | 保留一个 |
| 认证测试 | `broken-authentication`, `broken-authentication-testing` | 保留一个 |

**低价值 skill（除非专职安全工程师）：**
- `active-directory-attacks` — AD 域攻击
- `aws-penetration-testing`, `cloud-penetration-testing` — 云渗透
- `metasploit-framework` — Metasploit 框架
- `shodan-reconnaissance`, `shodan-reconnaissance-and-pentesting` — Shodan 侦察（冗余）
- `sqlmap-database-penetration-testing`, `sqlmap-database-pentesting` — SQLMap（冗余）
- `smtp-penetration-testing`, `ssh-penetration-testing` — 协议渗透
- `wordpress-penetration-testing` — WordPress 渗透
- `linux-privilege-escalation`, `windows-privilege-escalation`, `privilege-escalation-methods` — 提权技术
- `wireshark-analysis`, `wireshark-network-traffic-analysis` — 抓包分析（冗余）
- `memory-forensics` — 内存取证
- `anti-reversing-techniques`, `binary-analysis-patterns`, `protocol-reverse-engineering` — 逆向工程

---

### 2.5 DevOps/部署/云（~90 个）

**核心 skill：**

| Skill | 功能 | 权重 |
|-------|------|------|
| `devops` | DevOps 总入口 | ★★★★★ |
| `docker-expert` | Docker 容器化 | ★★★★★ |
| `kubernetes-deployment` | K8s 部署 | ★★★★☆ |
| `cloudflare-deploy` | Cloudflare 部署 | ★★★☆☆ |
| `vercel-deploy` | Vercel 部署 | ★★★★☆ |
| `github-actions-creator` | GitHub Actions CI/CD | ★★★★★ |
| `terraform-infrastructure` | Terraform IaC | ★★★★☆ |
| `grafana-dashboards` | 监控仪表盘 | ★★★☆☆ |
| `prometheus-configuration` | Prometheus 监控 | ★★★☆☆ |

**冗余组：**

| 冗余组 | 包含的 skill | 建议保留 |
|--------|-------------|---------|
| Vercel | `vercel-deploy`, `vercel-deploy-claimable`, `vercel-deployment`, `vercel-automation`, `vercel-composition-patterns`, `vercel-react-best-practices` | `vercel-deploy` |
| Terraform | `terraform-infrastructure`, `terraform-aws-modules`, `terraform-module-library`, `terraform-skill` | `terraform-infrastructure` |
| Railway | `railway-*`（12个） | `railway-deploy` + `railway-new` |
| GitHub Actions | `github-actions-creator`, `github-actions-templates`, `github-automation`, `github-workflow-automation` | `github-actions-creator` |
| K8s | `kubernetes-deployment`, `k8s-manifest-generator`, `k8s-security-policies`, `helm-chart-scaffolding` | `kubernetes-deployment` |

---

### 2.6 测试/QA（~40 个）

**核心 skill：**

| Skill | 功能 | 权重 |
|-------|------|------|
| `tdd-workflow` | TDD 工作流 | ★★★★★ |
| `test-driven-development` | 测试驱动开发 | ★★★★★ |
| `playwright` | Playwright E2E 测试 | ★★★★★ |
| `vitest` | Vitest 单元测试 | ★★★★★ |
| `e2e-testing` | E2E 测试总入口 | ★★★★☆ |
| `test-writer` | 自动生成测试 | ★★★★☆ |
| `qa-test-planner` | QA 测试计划 | ★★★☆☆ |

**冗余组：**

| 冗余组 | 包含的 skill | 建议保留 |
|--------|-------------|---------|
| TDD | `tdd-workflow`, `test-driven-development`, `tdd-workflows-tdd-cycle`, `tdd-workflows-tdd-green`, `tdd-workflows-tdd-red`, `tdd-workflows-tdd-refactor` | `tdd-workflow` |
| E2E | `e2e-testing`, `e2e-testing-patterns`, `e2e-studio-tests`, `playwright`, `playwright-e2e-builder`, `playwright-skill` | `playwright` + `e2e-testing` |
| 测试模式 | `testing-patterns`, `testing-qa`, `javascript-testing-patterns`, `python-testing-patterns` | `testing-patterns` |

---

### 2.7 数据库（~40 个）

**核心 skill：**

| Skill | 功能 | 权重 |
|-------|------|------|
| `databases` | 数据库总入口 | ★★★★★ |
| `database-design` | 数据库设计 | ★★★★★ |
| `postgresql` | PostgreSQL 开发 | ★★★★★ |
| `prisma-expert` | Prisma ORM | ★★★★☆ |
| `database-migration` | 数据库迁移 | ★★★★☆ |
| `sql-optimization-patterns` | SQL 优化 | ★★★★☆ |

**冗余组：**

| 冗余组 | 包含的 skill | 建议保留 |
|--------|-------------|---------|
| PostgreSQL | `postgresql`, `postgresql-optimization`, `postgresql-table-design`, `postgres-best-practices`, `postgres-schema-design`, `supabase-postgres-best-practices` | `postgresql` |
| 数据库迁移 | `database-migration`, `database-migrations-migration-observability`, `database-migrations-sql-migrations` | `database-migration` |
| 数据库设计 | `database`, `database-design`, `database-schema-designer`, `databases` | `databases` + `database-design` |
| 向量数据库 | `vector-database-engineer`, `vector-index-tuning`, `pinecone`, `chroma`, `faiss`, `qdrant-vector-search` | 按实际使用保留 |

---

### 2.8 代码质量/重构（~30 个）

**核心 skill：**

| Skill | 功能 | 权重 |
|-------|------|------|
| `code-review` | 代码审查 | ★★★★★ |
| `clean-code` | 整洁代码原则 | ★★★★★ |
| `coding-standards` | 编码标准 | ★★★★☆ |
| `lint-and-validate` | 代码检查与验证 | ★★★★☆ |
| `performance` | 性能优化 | ★★★★☆ |

**冗余组：**

| 冗余组 | 包含的 skill | 建议保留 |
|--------|-------------|---------|
| 代码审查 | `code-review`, `code-review-ai-ai-review`, `code-review-checklist`, `code-review-excellence`, `code-reviewer`, `comprehensive-review-full-review`, `comprehensive-review-pr-enhance`, `peer-review`, `receiving-code-review`, `requesting-code-review`, `fix-review`, `codex-review` | `code-review` + `code-review-checklist` |
| 重构 | `code-refactoring-context-restore`, `code-refactoring-refactor-clean`, `code-refactoring-tech-debt`, `codebase-cleanup-deps-audit`, `codebase-cleanup-refactor-clean`, `codebase-cleanup-tech-debt` | `code-refactoring-refactor-clean` |
| 调试 | `debugger`, `debugging`, `debugging-strategies`, `debugging-toolkit-smart-debug`, `systematic-debugging`, `error-debugging-error-analysis`, `error-debugging-error-trace`, `error-debugging-multi-agent-review`, `error-diagnostics-error-analysis`, `error-diagnostics-error-trace`, `error-diagnostics-smart-debug`, `error-resolver`, `parallel-debugging`, `distributed-debugging-debug-trace` | `systematic-debugging` + `error-resolver` |
| 编码标准 | `coding-standards`, `cc-skill-coding-standards`, `best-practices`, `clean-code` | `clean-code` + `coding-standards` |

---

### 2.9 SaaS 工具自动化（~100 个）

这是数量第二多的类别，大部分通过 Rube MCP (Composio) 实现。除非你日常使用对应的 SaaS 工具，否则绝大多数无用。

**完整列表（按字母排序）：**

| Skill | 对应工具 | 建议 |
|-------|---------|------|
| `activecampaign-automation` | ActiveCampaign | 按需 |
| `airtable-automation` | Airtable | 按需 |
| `amplitude-automation` | Amplitude | 按需 |
| `asana-automation` | Asana | 按需 |
| `bamboohr-automation` | BambooHR | 按需 |
| `basecamp-automation` | Basecamp | 按需 |
| `bitbucket-automation` | Bitbucket | 按需 |
| `box-automation` | Box | 按需 |
| `brevo-automation` | Brevo | 按需 |
| `cal-com-automation` | Cal.com | 按需 |
| `calendly-automation` | Calendly | 按需 |
| `canva-automation` | Canva | 按需 |
| `clickup-automation` | ClickUp | 按需 |
| `close-automation` | Close CRM | 按需 |
| `coda-automation` | Coda | 按需 |
| `confluence-automation` | Confluence | 按需 |
| `convertkit-automation` | ConvertKit | 按需 |
| `datadog-automation` | Datadog | 按需 |
| `discord-automation` | Discord | 按需 |
| `docusign-automation` | DocuSign | 按需 |
| `dropbox-automation` | Dropbox | 按需 |
| `freshdesk-automation` | Freshdesk | 按需 |
| `freshservice-automation` | Freshservice | 按需 |
| `gmail-automation` | Gmail | 按需 |
| `google-analytics-automation` | Google Analytics | 按需 |
| `google-calendar-automation` | Google Calendar | 按需 |
| `google-drive-automation` | Google Drive | 按需 |
| `googlesheets-automation` | Google Sheets | 按需 |
| `hubspot-automation` | HubSpot | 按需 |
| `instagram-automation` | Instagram | 按需 |
| `intercom-automation` | Intercom | 按需 |
| `jira-automation` | Jira | 按需 |
| `klaviyo-automation` | Klaviyo | 按需 |
| `linkedin-automation` | LinkedIn | 按需 |
| `mailchimp-automation` | Mailchimp | 按需 |
| `make-automation` | Make (Integromat) | 按需 |
| `microsoft-teams-automation` | Teams | 按需 |
| `miro-automation` | Miro | 按需 |
| `mixpanel-automation` | Mixpanel | 按需 |
| `monday-automation` | Monday.com | 按需 |
| `notion-automation` | Notion | 按需 |
| `one-drive-automation` | OneDrive | 按需 |
| `outlook-automation` | Outlook | 按需 |
| `outlook-calendar-automation` | Outlook Calendar | 按需 |
| `pagerduty-automation` | PagerDuty | 按需 |
| `pipedrive-automation` | Pipedrive | 按需 |
| `posthog-automation` | PostHog | 按需 |
| `postmark-automation` | Postmark | 按需 |
| `reddit-automation` | Reddit | 按需 |
| `render-automation` | Render | 按需 |
| `salesforce-automation` | Salesforce | 按需 |
| `segment-automation` | Segment | 按需 |
| `sendgrid-automation` | SendGrid | 按需 |
| `sentry-automation` | Sentry | 按需 |
| `shopify-automation` | Shopify | 按需 |
| `slack-automation` | Slack | 按需 |
| `square-automation` | Square | 按需 |
| `stripe-automation` | Stripe | 按需 |
| `supabase-automation` | Supabase | 按需 |
| `telegram-automation` | Telegram | 按需 |
| `tiktok-automation` | TikTok | 按需 |
| `todoist-automation` | Todoist | 按需 |
| `trello-automation` | Trello | 按需 |
| `twilio-communications` | Twilio | 按需 |
| `twitter-automation` | Twitter/X | 按需 |
| `vercel-automation` | Vercel | 按需 |
| `webflow-automation` | Webflow | 按需 |
| `whatsapp-automation` | WhatsApp | 按需 |
| `wrike-automation` | Wrike | 按需 |
| `youtube-automation` | YouTube | 按需 |
| `zendesk-automation` | Zendesk | 按需 |
| `zoho-crm-automation` | Zoho CRM | 按需 |
| `zoom-automation` | Zoom | 按需 |

> **建议**：以上约 60+ 个 SaaS 自动化 skill，除非你日常使用对应工具，否则建议全部移除。保留你实际用的即可（如 `jira-automation`、`slack-automation`、`notion-automation`）。

---

### 2.10 生物信息学/科学计算（~100 个）

除非你从事生物/化学/医药领域开发，否则这是最大的"无用"类别。

**数据库类（约 25 个）：**
- `alphafold-database`, `brenda-database`, `chembl-database`, `clinicaltrials-database`
- `clinpgx-database`, `clinvar-database`, `drugbank-database`, `ena-database`
- `ensembl-database`, `fda-database`, `gene-database`, `gwas-database`
- `hmdb-database`, `kegg-database`, `metabolomics-workbench-database`
- `openalex-database`, `opentargets-database`, `pdb-database`, `pubchem-database`
- `pubmed-database`, `reactome-database`, `string-database`, `uniprot-database`, `uspto-database`

**Python 工具库类（约 40 个）：**
- `anndata`, `arboreto`, `biopython`, `bioservices`, `biomni`
- `cobrapy`, `datamol`, `deepchem`, `deeptools`, `diffdock`
- `esm`, `etetoolkit`, `geniml`, `gget`, `gtars`
- `histolab`, `lamindb`, `matchms`, `medchem`, `molfeat`
- `pathml`, `pydeseq2`, `pydicom`, `pyhealth`, `pylabrobot`
- `pymatgen`, `pyopenms`, `pysam`, `pytdc`, `rdkit`
- `scanpy`, `scikit-bio`, `scikit-survival`, `scvi-tools`
- `torchdrug`, `zarr-python`

**其他科学计算：**
- `astropy`, `cellxgene-census`, `cirq`, `fluidsim`
- `neurokit2`, `neuropixels-analysis`, `pennylane`, `qiskit`, `qutip`
- `simpy`, `sympy`, `pymc-bayesian-modeling`, `pymoo`

> **建议**：除非你从事生物/化学/医药/物理领域，否则以上约 100 个 skill 建议全部移除。

---

### 2.11 营销/SEO/商业（~50 个）

**核心 skill（如果做产品）：**

| Skill | 功能 | 权重 |
|-------|------|------|
| `seo` | SEO 总入口 | ★★★☆☆ |
| `product-strategist` | 产品策略 | ★★★☆☆ |
| `pricing-strategy` | 定价策略 | ★★☆☆☆ |
| `analytics-tracking` | 数据追踪 | ★★★☆☆ |

**冗余组：**

| 冗余组 | 包含的 skill | 建议保留 |
|--------|-------------|---------|
| SEO | `seo`, `seo-audit`, `seo-fundamentals`, `seo-optimizer`, `seo-review`, `roier-seo`, `programmatic-seo`, `schema-markup` | `seo` |
| CRO | `form-cro`, `page-cro`, `popup-cro`, `onboarding-cro`, `paywall-upgrade-cro`, `signup-flow-cro` | 按需保留一个 |
| 内容创作 | `content-creator`, `content-research-writer`, `copywriting`, `copy-editing`, `social-content` | `content-creator` |

---

### 2.12 Azure SDK 专用（~30 个）

除非你在 Azure 平台开发，否则全部低价值：

- `azure-ai-anomalydetector-java`
- `azure-ai-contentsafety-java`, `azure-ai-contentsafety-ts`
- `azure-ai-document-intelligence-ts`
- `azure-ai-formrecognizer-java`
- `azure-ai-projects-py`, `azure-ai-projects-ts`
- `azure-ai-translation-ts`
- `azure-ai-vision-imageanalysis-java`
- `azure-ai-voicelive-py`
- `azure-appconfiguration-ts`
- `azure-communication-*`（5个）
- `azure-cosmos-db-py`
- `azure-data-tables-java`
- `azure-eventgrid-java`
- `azure-eventhub-java`, `azure-eventhub-ts`
- `azure-functions`, `azure-identity-*`, `azure-keyvault-*`, `azure-security-*`
- `azure-messaging-*`, `azure-monitor-*`, `azure-search-*`
- `azure-servicebus-ts`, `azure-storage-blob-java`, `azure-web-pubsub-ts`
- `azure-mgmt-mongodbatlas-dotnet`, `azure-microsoft-playwright-testing-ts`
- `azd-deployment`, `agents-v2-py`, `hosted-agents-v2-py`

> **建议**：除非你在 Azure 平台开发，否则以上约 30 个 skill 建议全部移除。

---

## 三、冗余 Skill 汇总

以下是功能严重重叠的 skill 组，每组只需保留 1-2 个即可。

| # | 冗余组 | 重复数量 | 建议保留 | 可删除数 |
|---|--------|---------|---------|---------|
| 1 | 代码审查 | 12 | `code-review`, `code-review-checklist` | 10 |
| 2 | 调试/错误诊断 | 14 | `systematic-debugging`, `error-resolver` | 12 |
| 3 | TDD 工作流 | 6 | `tdd-workflow` | 5 |
| 4 | 提示工程 | 6 | `prompt-engineering` | 5 |
| 5 | React 开发 | 7 | `react-best-practices`, `react-patterns` | 5 |
| 6 | 后端模式 | 5 | `backend-development`, `backend-patterns` | 3 |
| 7 | 架构设计 | 8 | `architecture`, `architecture-patterns` | 6 |
| 8 | API 文档 | 4 | `api-documentation`, `openapi-spec-generation` | 2 |
| 9 | API 安全/模糊测试 | 4 | `api-security-best-practices` | 3 |
| 10 | DDD | 4 | `domain-driven-design` | 3 |
| 11 | PostgreSQL | 6 | `postgresql` | 5 |
| 12 | 安全审查 | 6 | `security-review`, `security-best-practices` | 4 |
| 13 | 安全扫描 | 6 | `security-scanning-tools` | 5 |
| 14 | XSS/注入 | 4 | `xss-html-injection`, `sql-injection-testing` | 2 |
| 15 | E2E 测试 | 6 | `playwright`, `e2e-testing` | 4 |
| 16 | Vercel 部署 | 6 | `vercel-deploy` | 5 |
| 17 | GitHub Actions | 4 | `github-actions-creator` | 3 |
| 18 | Terraform | 4 | `terraform-infrastructure` | 3 |
| 19 | Railway | 12 | `railway-deploy`, `railway-new` | 10 |
| 20 | 无障碍 | 6 | `accessibility`, `wcag-audit-patterns` | 4 |
| 21 | SEO | 8 | `seo` | 7 |
| 22 | LLM 评估 | 5 | `llm-evaluation`, `eval-harness` | 3 |
| 23 | FastAPI | 4 | `fastapi-endpoint` | 3 |
| 24 | 编码标准 | 4 | `clean-code`, `coding-standards` | 2 |

> **冗余总计**：24 组冗余，涉及约 140 个 skill，可精简掉约 105 个。

---

## 四、清理建议（按优先级）

### 4.1 第一优先级：删除不相关领域（约 250 个）

这些 skill 与日常软件开发完全无关，删除后零影响：

| 类别 | 数量 | 说明 |
|------|------|------|
| 生物信息学/科学计算 | ~100 | 除非从事生物/化学/医药领域 |
| Azure SDK 专用 | ~30 | 除非在 Azure 平台开发 |
| 不使用的 SaaS 自动化 | ~50 | 只保留你实际用的工具 |
| 模型训练/量化 | ~35 | 除非做 LLM 训练部署 |
| 游戏引擎 | ~5 | `godot-*`, `unity-*`, `unreal-*`, `bevy-*` |
| 区块链/Web3 | ~5 | `solidity-*`, `nft-*`, `defi-*`, `web3-*` |

### 4.2 第二优先级：合并冗余（约 105 个）

参考第三章冗余汇总表，每组只保留建议的 1-2 个 skill。

### 4.3 第三优先级：评估不常用框架（约 50 个）

根据你的技术栈决定是否保留：

| 如果你不用... | 可删除 |
|--------------|--------|
| Angular | `angular-*`（4个） |
| Laravel/PHP | `laravel-*`（2个）, `wordpress-*`（4个） |
| .NET | `dotnet-*`（2个）, `avalonia-*`（3个） |
| Go | `go-*`（3个）, `dbos-golang` |
| Rust | `rust-*`（2个）, `systems-programming-rust-project` |
| Swift | `swiftui-expert-skill` |
| Haskell | `haskell-pro` |
| Kotlin | `kotlin-coroutines-expert` |
| Shopify | `shopify-*`（4个） |
| Remotion | `remotion-*`（2个）, `add-expert`, `add-sfx` |

---

## 五、推荐保留核心 Skill 列表（约 150 个）

清理后建议保留的核心 skill，按领域分组：

**前端/UI（15 个）：**
`frontend-design`, `aesthetic`, `web-frameworks`, `ui-styling`, `theme-factory`, `responsive-design`, `design-to-code`, `core-web-vitals`, `tailwind-patterns`, `react-best-practices`, `react-patterns`, `react-state-management`, `nextjs-best-practices`, `nextjs-app-router-patterns`, `mui`

**后端/API（15 个）：**
`backend-development`, `backend-patterns`, `api-design-principles`, `api-patterns`, `architecture`, `architecture-patterns`, `microservices-patterns`, `auth-implementation-patterns`, `better-auth`, `error-handling-patterns`, `graphql`, `nestjs-expert`, `fastapi-endpoint`, `cqrs-implementation`, `event-sourcing-architect`

**AI/ML/LLM（15 个）：**
`ai-ml`, `ai-multimodal`, `rag-implementation`, `langchain`, `langgraph`, `prompt-engineering`, `transformers`, `embedding-strategies`, `llm-evaluation`, `constitutional-ai`, `llm-app-patterns`, `ai-product`, `dspy`, `crewai`, `langfuse`

**安全（8 个）：**
`security-review`, `security-best-practices`, `security-audit`, `secrets-management`, `security-threat-model`, `pentest-checklist`, `api-security-best-practices`, `xss-html-injection`

**DevOps/部署（10 个）：**
`devops`, `docker-expert`, `kubernetes-deployment`, `vercel-deploy`, `cloudflare-deploy`, `github-actions-creator`, `terraform-infrastructure`, `grafana-dashboards`, `prometheus-configuration`, `railway-deploy`

**测试/QA（6 个）：**
`tdd-workflow`, `playwright`, `vitest`, `e2e-testing`, `test-writer`, `testing-patterns`

**数据库（6 个）：**
`databases`, `database-design`, `postgresql`, `prisma-expert`, `database-migration`, `sql-optimization-patterns`

**代码质量/重构（8 个）：**
`code-review`, `code-review-checklist`, `clean-code`, `coding-standards`, `systematic-debugging`, `error-resolver`, `lint-and-validate`, `performance`

**Agent 开发（8 个）：**
`agent-development`, `agent-tool-builder`, `autonomous-agent-patterns`, `agent-memory-systems`, `agent-orchestration-multi-agent-optimize`, `mcp-builder`, `mcp-management`, `computer-use-agents`

**Git/版本控制（5 个）：**
`commit`, `create-pr`, `git-advanced-workflows`, `using-git-worktrees`, `address-github-comments`

**文档/写作（5 个）：**
`doc-coauthoring`, `api-documentation`, `documentation`, `technical-writer`, `crafting-effective-readmes`

**上下文/记忆管理（5 个）：**
`context-engineering`, `context-optimization`, `context-window-management`, `continuous-learning`, `conversation-memory`

**语言专项（10 个）：**
`typescript-expert`, `python-expert`, `javascript-mastery`, `python-patterns`, `python-testing-patterns`, `async-python-patterns`, `modern-javascript-patterns`, `python-type-safety`, `python-design-patterns`, `python-error-handling`

**实用工具（10 个）：**
`browser`, `chrome-devtools`, `media-processing`, `find-skills`, `skill-creator`, `sequential-thinking`, `context7`, `repomix`, `firecrawl-scraper`, `excalidraw`

---

## 六、总结

| 指标 | 数值 |
|------|------|
| 当前总数 | 1254 个 |
| 建议保留核心 | ~150 个 |
| 冗余可删除 | ~105 个 |
| 不相关领域可删除 | ~250 个 |
| 按需保留（SaaS/框架） | ~150 个 |
| 清理后预计总数 | 300-400 个 |

