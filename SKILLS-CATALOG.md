# Forge - Skills Catalog

**Version**: 1.0
**Total Downloadable Skills**: 102
**Last Updated**: 2026-02-26

> 本目录列出所有可通过 `install-skills.sh` / `install-skills.ps1` 安装的 Skill。
> 安装命令：`bash ~/.claude/scripts/install-skills.sh` 或 `powershell ~/.claude/scripts/install-skills.ps1`

---

## Quick Start

```bash
# Interactive mode (recommended)
bash ~/.claude/scripts/install-skills.sh

# Install a preset
bash ~/.claude/scripts/install-skills.sh --preset fullstack

# Install specific modules
bash ~/.claude/scripts/install-skills.sh --modules frontend,backend,docs

# List all modules and presets
bash ~/.claude/scripts/install-skills.sh --list

# Show installed skills
bash ~/.claude/scripts/install-skills.sh --installed
```

---

## Role Presets

| Preset | Modules | Description |
|--------|---------|-------------|
| fullstack | core + frontend + backend + docs + testing + debugging | Full-stack development |
| frontend-dev | core + frontend + testing + docs | Frontend specialist |
| backend-dev | core + backend + testing + docs | Backend specialist |
| java-dev | core + backend + java + testing + docs | Java/Spring Boot developer |
| python-dev | core + backend + python + ai-ml + docs | Python developer |
| security-eng | core + security + testing + devops | Security engineer |
| devops-eng | core + devops + security + docs | DevOps engineer |
| all | core + all modules + extras | Everything |

---

## Module: core (26 skills, required)

Essential workflow skills, always installed.

| Skill | Source | Description |
|-------|--------|-------------|
| brainstorming | superpowers | Interactive requirement refinement before creative work |
| dispatching-parallel-agents | superpowers | Dispatch 2+ independent tasks for parallel execution |
| executing-plans | superpowers | Execute implementation plans with review checkpoints |
| finishing-a-development-branch | superpowers | Guide branch completion: merge, PR, or cleanup |
| receiving-code-review | superpowers | Handle code review feedback with technical rigor |
| requesting-code-review | superpowers | Request code review via code-reviewer subagent |
| subagent-driven-development | superpowers | Execute plans with independent tasks in current session |
| systematic-debugging-sp | superpowers | Four-phase debugging: diagnose before fixing |
| test-driven-development | superpowers | TDD workflow: write tests before implementation |
| using-git-worktrees | superpowers | Create isolated git worktrees for feature work |
| using-superpowers | superpowers | Establish how to find and use Skills |
| verification-before-completion-sp | superpowers | Run verification commands before claiming success |
| writing-plans | superpowers | Create multi-step task plans from specs |
| writing-skills | superpowers | Create, edit, and verify Skills |
| code-review | anthropics-skills | Code review feedback handling and task completion verification |
| context-engineering | anthropics-skills | Context engineering patterns |
| context7 | anthropics-skills | Search GitHub issues, PRs, and discussions across repositories |
| continuous-learning | ecc-skills | Extract reusable patterns from sessions as learned skills |
| continuous-learning-v2 | ecc-skills | Instinct-based learning with confidence scoring |
| sequential-thinking | anthropics-skills | Systematic step-by-step reasoning with revision support |
| iterative-retrieval | ecc-skills | Progressive context retrieval refinement |
| strategic-compact | ecc-skills | Manual context compaction at logical intervals |
| verification-loop | ecc-skills | Verification loop for task completion |
| eval-harness | ecc-skills | Formal evaluation framework for Claude Code sessions |
| coding-standards | ecc-skills | Universal coding standards for TypeScript, JavaScript, React |
| tdd-workflow | ecc-skills | Test-driven development with 80%+ coverage enforcement |

---

## Module: frontend (12 skills)

Frontend development, UI design, and web frameworks.

| Skill | Source | Description |
|-------|--------|-------------|
| frontend-design | anthropics-skills | Create distinctive, production-grade frontend interfaces |
| frontend-development | anthropics-skills | React/TypeScript patterns: Suspense, lazy loading, hooks |
| frontend-patterns | ecc-skills | React, Next.js, state management, performance optimization |
| aesthetic | anthropics-skills | Create aesthetically beautiful interfaces with proven design principles |
| ui-styling | anthropics-skills | shadcn/ui + Radix UI + Tailwind CSS styling toolkit |
| theme-factory | anthropics-skills | Styling artifacts with themes (slides, docs, landing pages) |
| web-frameworks | anthropics-skills | Next.js App Router, Server Components, RSC, SSR, SSG, ISR |
| web-artifacts-builder | anthropics-skills | Multi-component HTML artifacts with modern frontend tech |
| artifacts-builder | anthropics-skills | Elaborate claude.ai HTML artifacts creation suite |
| canvas-design | anthropics-skills | Visual art in .png and .pdf using design philosophy |
| algorithmic-art | anthropics-skills | Algorithmic art with p5.js, seeded randomness |
| brand-guidelines | anthropics-skills | Apply Anthropic brand colors and typography |

---

## Module: backend (6 skills)

Backend development, API design, and databases.

| Skill | Source | Description |
|-------|--------|-------------|
| backend-development | anthropics-skills | Build robust backend systems (Node.js, Python, Go, Rust) |
| backend-patterns | ecc-skills | Backend architecture, API design, database optimization |
| better-auth | anthropics-skills | Framework-agnostic TypeScript authentication framework |
| databases | anthropics-skills | MongoDB and PostgreSQL patterns and best practices |
| postgres-patterns | ecc-skills | PostgreSQL query optimization, schema design, indexing |
| clickhouse-io | ecc-skills | ClickHouse analytics and data engineering patterns |

---

## Module: java (6 skills)

Java/Spring Boot development, testing, and security.

| Skill | Source | Description |
|-------|--------|-------------|
| java-coding-standards | ecc-skills | Java coding standards for Spring Boot: naming, immutability, Optional |
| jpa-patterns | ecc-skills | JPA/Hibernate entity design, relationships, query optimization |
| springboot-patterns | ecc-skills | Spring Boot architecture, REST API, layered services |
| springboot-security | ecc-skills | Spring Security authn/authz, CSRF, secrets, rate limiting |
| springboot-tdd | ecc-skills | TDD for Spring Boot: JUnit 5, Mockito, MockMvc, Testcontainers |
| springboot-verification | ecc-skills | Verification loop: build, static analysis, tests, security scans |

---

## Module: python (7 skills)

Python/Django development, testing, and patterns.

| Skill | Source | Description |
|-------|--------|-------------|
| python-patterns | ecc-skills | Pythonic idioms, PEP 8, type hints, best practices |
| python-testing | ecc-skills | pytest, TDD, fixtures, mocking, parametrization, coverage |
| django-patterns | ecc-skills | Django architecture, DRF, ORM, caching, signals, middleware |
| django-security | ecc-skills | Django security: auth, CSRF, SQL injection, XSS prevention |
| django-tdd | ecc-skills | Django testing with pytest-django, factory_boy, mocking |
| django-verification | ecc-skills | Verification: migrations, linting, tests, security scans |
| google-adk-python | anthropics-skills | Google ADK Python Skill |

---

## Module: golang (2 skills)

Go development patterns and testing.

| Skill | Source | Description |
|-------|--------|-------------|
| golang-patterns | ecc-skills | Idiomatic Go patterns, conventions for robust applications |
| golang-testing | ecc-skills | Table-driven tests, subtests, benchmarks, fuzzing, coverage |

---

## Module: security (2 skills)

Security review and vulnerability scanning.

| Skill | Source | Description |
|-------|--------|-------------|
| security-review | ecc-skills | Security checks for auth, user input, secrets, API endpoints |
| security-scan | ecc-skills | Scan Claude Code config for vulnerabilities and misconfigurations |

---

## Module: devops (3 skills)

DevOps, deployment, and browser automation.

| Skill | Source | Description |
|-------|--------|-------------|
| devops | anthropics-skills | Deploy and manage cloud infrastructure (Cloudflare, Docker, etc.) |
| repomix | anthropics-skills | Package code repositories into single AI-friendly files |
| browser | anthropics-skills | Browser automation using Chrome DevTools Protocol (CDP) |

---

## Module: docs (11 skills)

Documentation, office formats, and media processing.

| Skill | Source | Description |
|-------|--------|-------------|
| doc-coauthoring | anthropics-skills | Structured workflow for co-authoring documentation |
| docs-seeker | anthropics-skills | Search technical docs via llms.txt, GitHub, parallel exploration |
| docx | anthropics-skills | Document creation, editing, tracked changes, formatting |
| pdf | anthropics-skills | PDF manipulation: extract, create, merge, split, annotate |
| pptx | anthropics-skills | Presentation creation, editing, and analysis |
| xlsx | anthropics-skills | Spreadsheet creation, formulas, formatting, data analysis |
| changelog-generator | anthropics-skills | Auto-create changelogs from git commits |
| internal-comms | anthropics-skills | Internal communications writing toolkit |
| media-processing | anthropics-skills | FFmpeg video/audio processing and ImageMagick manipulation |
| mermaidjs-v11 | anthropics-skills | Mermaid.js v11 diagrams and visualizations |
| nutrient-document-processing | ecc-skills | Process, convert, OCR, extract documents via Nutrient DWS API |

---

## Module: testing (3 skills)

Web app testing, browser DevTools, and C++ testing.

| Skill | Source | Description |
|-------|--------|-------------|
| webapp-testing | anthropics-skills | Test local web apps using Playwright |
| chrome-devtools | anthropics-skills | Browser automation, debugging, performance via Puppeteer CLI |
| cpp-testing | ecc-skills | C++ tests with GoogleTest/CTest, diagnosing flaky tests |

---

## Module: ai-ml (2 skills)

AI multimodal processing and NotebookLM integration.

| Skill | Source | Description |
|-------|--------|-------------|
| ai-multimodal | anthropics-skills | Process and generate multimedia content using Google Gemini API |
| notebooklm | notebooklm | Query Google NotebookLM notebooks for source-grounded answers |

---

## Module: mcp (2 skills)

MCP server building and management.

| Skill | Source | Description |
|-------|--------|-------------|
| mcp-builder | anthropics-skills | Guide for creating high-quality MCP servers |
| mcp-management | anthropics-skills | Manage MCP servers: discover, analyze, execute tools/prompts |

---

## Module: debugging (10 skills)

Advanced debugging and problem-solving techniques.

| Skill | Source | Description |
|-------|--------|-------------|
| debugging-systematic-debugging | anthropics-skills | Four-phase debugging: root cause investigation before fixes |
| debugging-defense-in-depth | anthropics-skills | Validate at every layer data passes through |
| debugging-root-cause-tracing | anthropics-skills | Trace bugs backward through call stack to find trigger |
| debugging-verification-before-completion | anthropics-skills | Run verification commands before claiming success |
| problem-solving-when-stuck | anthropics-skills | Dispatch to the right technique based on how you're stuck |
| problem-solving-collision-zone-thinking | anthropics-skills | Force unrelated concepts together for emergent properties |
| problem-solving-inversion-exercise | anthropics-skills | Flip core assumptions to reveal hidden constraints |
| problem-solving-meta-pattern-recognition | anthropics-skills | Spot patterns in 3+ domains to find universal principles |
| problem-solving-scale-game | anthropics-skills | Test at extremes to expose fundamental truths |
| problem-solving-simplification-cascades | anthropics-skills | Find one insight that eliminates multiple components |

---

## Module: extras (10 skills)

Standalone tools and niche skills.

| Skill | Source | Description |
|-------|--------|-------------|
| shopify | anthropics-skills | Build Shopify apps, extensions, themes with GraphQL/REST APIs |
| obsidian-skills | obsidian-skills | Obsidian vault management skills |
| planning-with-files | planning-with-files | File-based planning workflow |
| skill-prompt-generator | skill-prompt-generator | Generate skill prompts |
| slack-gif-creator | anthropics-skills | Create animated GIFs optimized for Slack |
| skill-creator | anthropics-skills | Guide for creating effective skills |
| template-skill | anthropics-skills | Skill template for creating new skills |
| claude-code | anthropics-skills | Claude Code agentic coding tool reference |
| configure-ecc | ecc-skills | Interactive Everything Claude Code installer |
| project-guidelines-example | ecc-skills | Project guidelines skill example |

---

## Sources

| Source ID | Repository | Type |
|-----------|-----------|------|
| anthropics-skills | anthropics/skills | GitHub Archive |
| superpowers | obra/superpowers | GitHub Archive |
| ecc-skills | affaan-m/everything-claude-code | GitHub Archive |
| obsidian-skills | kepano/obsidian-skills | Git Clone |
| notebooklm | PleasePrompto/notebooklm-skill | Git Clone |
| planning-with-files | OthmanAdi/planning-with-files | Git Clone |
| skill-prompt-generator | huangserva/skill-prompt-generator | Git Clone |
