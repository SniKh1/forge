# Frontend / UI / Desktop Stack Pack

**Version**: v3.0  
**Updated**: 2026-03-12  
**Scope**: web frontends, design-system work, dashboards, landing pages, desktop shells, UI-heavy product flows

---

## 1. Purpose

当任务核心是下面这些内容时，加载这个 stack：
- React / Next.js / 现代 web UI
- page、component、design-system 的实现
- dashboard 和 product console 界面
- Tauri / Electron desktop frontend
- UI polish、交互质量和浏览器验证

这个 stack 主要与下面这些 role-pack 配对：
- `frontend-engineer`
- `ui-designer`
- `qa-strategist`
- `release-devex`

当这个 stack 生效时，推荐优先使用的 core skills：
- `frontend-design`
- `aesthetic`
- `web-frameworks`
- `ui-styling`
- `browser-use`
- `webapp-testing`
- `code-review`
- `security-review`

research / reference 优先级：
1. `context7`：framework 和 library 官方文档
2. `browser-use`：真实 session 的产品验证
3. `playwright` / `webapp-testing`：可重复的 UI 检查
4. `deepwiki`：开源 UI 和架构参考

---

## 2. Default Technology Choices

### 2.1 Framework Defaults

默认优先级：
- `Next.js 15+`：full-stack web product
- `React 19+`：SPA、component system、desktop shell
- `Vue 3.5+`：仅在 repo 已经是 Vue 主栈时继续使用
- `Astro`：静态优先的 marketing page
- `Svelte`：只有在性能或既有技术栈明确支持时才采用

规则：
- 除非 migration 本身就是任务目标，否则优先尊重现有 repo framework
- 不要轻易引入第二套路由 / 状态管理 / 表单体系
- 优先使用 framework-native pattern，而不是延续过时习惯

### 2.2 Styling Defaults

样式方案默认优先级：
1. `Tailwind CSS`
2. `CSS Modules`
3. CSS-in-JS 只在确实需要 runtime dynamic styling 时使用

component primitive 优先：
- 有 `shadcn/ui` 就优先用它
- `Radix UI` 用于 headless behavior primitive
- custom component 只在现有 system component 无法自然覆盖时再写

避免：
- 在同一块界面里混入多套 styling system
- 生产 UI 中出现 ad hoc inline style 蔓延
- 直接复制视觉样式却不适配当前 repo 的 design language

### 2.3 State and Data Defaults

默认优先：
1. local component state 处理局部问题
2. context 只处理窄范围跨树共享
3. `Zustand` 处理务实的 client global state
4. `TanStack Query` 处理 server-state 与 async cache

规则：
- server-state 和 client-state 要分开建模
- 不要用 global store 处理 form-local 或 widget-local state
- 当 route/layout 可以统一拥有数据加载时，不要让许多 sibling component 各自 fetch

---

## 3. Architecture and Component Rules

### 3.1 Component Architecture

必须遵守的约定：
- 当 component 同时承担太多职责时，要拆开 presentation 与 orchestration
- 一个 component 尽量只服务一个清晰的视觉责任
- 优先 composition，而不是不断扩大 prop surface
- 用 design token / reusable variant 替代重复 style branch

避免：
- 把数据加载、业务规则、布局、展示全部塞进一个 “god component”
- 明明可以 composition/context/局部重构，却还保留很深的 prop drilling
- 写一次性视觉 hack，却不说明为什么它是例外

### 3.2 File and Feature Structure

推荐结构：
- `components/ui`：primitive reusable UI
- `components/features` 或 `features/*`：面向产品的模块
- `hooks`：可复用的 client logic
- `lib`：helper、client adapter、formatter、utility contract
- `types` 或 colocated type module：责任明确即可

规则：
- feature boundary 稳定时，优先按 feature colocate
- 通用 utility 一旦被跨域复用，就移出 feature folder
- generated asset / config 与 authored UI logic 尽量分开

---

## 4. UX and Visual Quality Rules

### 4.1 Interaction and Visual Standards

任何有意义的 UI 工作，都要追求：
- 清晰 hierarchy
- 有节奏的 spacing
- 明确 primary action
- 足够的 accessible contrast
- 可感知的 loading / success / error / empty state

下面这些状态对前端任务来说属于必查项：
- empty state
- loading state
- error state
- focus / keyboard behavior
- 响应式表现是否覆盖目标范围

如果任务是用户真正会看到的 product UI，优先这样处理：
- 少做噪音装饰，多做表意清晰的 surface
- 先拉开 typography hierarchy，再考虑视觉效果
- 先保证 layout clarity，再加 animation
- 用有意义的 motion，避免通用模板化 micro-interaction

### 4.2 Browser Validation Defaults

在 product validation、登录态 admin page、dashboard、CMS、control panel 等场景：
- 默认优先用 `browser-use`，并读取 `core/tool-defaults.json` 中的共享默认值
- 默认复用真实浏览器 profile / cookies / cache
- 只有任务明确要求 isolation 时，才切到 `incognito`、`headless` 等模式

在下面这些情况，优先考虑 `playwright` / `webapp-testing`：
- 可重复性比真实 session 更重要
- 需要确定性的 screenshot 或 regression step
- 需要适配 CI 的 browser assertion

---

## 5. Desktop Frontend Rules

### 5.1 Desktop Shell Choice

默认优先级：
- `Tauri 2.x`：产品型 desktop shell
- `Electron`：只有当生态约束或 OS API 明确要求时才选

规则：
- 在 Tauri 中，保持 Rust / backend boundary 足够薄且明确
- 不要把大量 app logic 泄漏到 shell glue 中
- 只要可能，尽量保持 frontend code 可移植

做 Tauri 相关任务时：
- command 要尽量窄、可解释
- file/system action 要返回明确的 result / error
- asset / icon / config path 要考虑 packaging 场景
- desktop UI 仍然必须遵循和 web UI 一样的 component 与 verification discipline

### 5.2 Packaging and Release Awareness

只要动到 desktop UI 或 app metadata，就要显式考虑：
- icon chain
- build output per platform
- config path 假设是否成立
- 平台特定 UI 限制

如果改动触及 shell / config / packaging 敏感文件，就不能在不检查构建链路的情况下声称任务完成。

---

## 6. Security Defaults

始终强制：
- 不允许 client-side secret 暴露
- token、local storage、session data 要安全处理
- form 和 user input 要有 validation
- 渲染 HTML / markdown / user content 时保持谨慎
- auth state 与 permission gate 必须显式处理

当任务涉及下面这些内容时，优先进入 `security-review` 视角：
- authentication
- 嵌入式 HTML / markdown rendering
- upload flow
- privileged admin surface
- desktop file / local system access

---

## 7. Testing and Verification

### 7.1 Verification Strategy

对任何有意义的 frontend 工作，至少要覆盖：
- 改动界面的 visual/state review
- 变更路径的至少一条 regression check
- 有交互变化时的 keyboard / focus 检查
- 布局变化时的 responsive sanity check

按 repo 支持情况，优先使用：
- lint
- typecheck
- unit / component tests
- `playwright` / `webapp-testing`
- 对 packaging 敏感改动做 build verification

### 7.2 Verification Before Completion

在声称完成之前，至少运行 repo 里适用的子集：
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- 有针对性的浏览器验证

如果是 desktop surface，还需要额外验证：
- 当 shell / config / icon / bridge 文件改动时，检查 Tauri / Electron 的构建路径

如果是视觉类任务，完成说明里应至少提到：
- 检查了哪些 states
- 检查了哪些 breakpoints
- 检查了哪个 browser / runtime path

---

## 8. Delivery Checklist

对 frontend 任务来说，真正的“完成”至少能回答：
- 哪个 user surface 被改了
- 采用了什么 framework / state / data 方案，以及为什么
- loading / empty / error / responsive state 怎么处理的
- accessibility / keyboard / focus 怎么考虑的
- 做了哪些 visual validation
- 哪个经验值得进入 memory / instinct / learned skill

## 8.5 Collaboration Contract

- 与 `product-manager + product` 配合时，先把 acceptance criteria 映射成用户可见状态和交互。
- 与 `ui-designer + design` 配合时，先落实 hierarchy、state 和 handoff note，再谈视觉润色。
- 与 `qa-strategist + qa` 配合时，优先把 regression path 和 deterministic browser checks 跑通。
- 与 `release-devex + release` 配合时，显式检查 build、asset pipeline、desktop packaging sensitivity。

## 8.6 Do Not

- 不用多套 styling / state / form 体系把同一块 UI 做散。
- 不跳过 empty / loading / error / success state 就宣称界面完成。
- 不为了“更酷”牺牲可读性、响应式和 component consistency。
- 不在没跑 visual / runtime check 的情况下对用户界面改动给出完成结论。

---

## 9. Role Pairing Notes

### `frontend-engineer + frontend`
重点看实现质量、component maintainability 和 framework-appropriate architecture。

### `ui-designer + frontend`
重点看 hierarchy、交互细节、真实 session 验证和 design-system consistency。

### `qa-strategist + frontend`
重点推动 deterministic UI verification、regression 场景和 state coverage。

### `release-devex + frontend`
重点关注 build stability、asset pipeline、packaging sensitivity 和 environment-specific runtime behavior。
