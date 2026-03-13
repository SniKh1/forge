# Design Stack Pack

## Scope
用于 UI/UX 结构、组件系统、交互行为和视觉打磨。

## Defaults
- 先把 hierarchy 和 user flow 理顺，再补 style。
- 对 empty / loading / error / success state 做显式检查。
- 优先沉淀少量可复用 pattern，而不是不断发明新样式。
- 设计反馈要尽量贴近实现，不要停留在抽象评价。

## Preferred Skills
- `frontend-design`
- `aesthetic`
- `ui-styling`
- `browser-use`

## Recommended MCP
- Figma Dev Mode MCP
- Playwright
- GitHub

## Browser Validation Default
- 做 visual QA、设计回看、登录态产品流检查时，优先使用 `core/tool-defaults.json` 里的浏览器默认值。
- 在需要真实状态的设计验证场景下，先复用真实浏览器 profile，再考虑 isolation。

## Output Shape
- 信息架构说明
- 页面/组件层级说明
- 状态设计（empty / loading / error / success）
- handoff note（开发实现时最容易偏掉的点）

## Validation Checklist
- hierarchy 是否一眼可读？
- 交互状态是否齐全？
- 是否复用了已有 pattern，而不是重新发明组件？
- 视觉建议是否能直接落到实现层？

## Collaboration Contract
- 与 `developer + frontend` 配合时，优先输出可实现的结构与状态约束。
- 与 `product-manager` 配合时，先对齐 flow 和 success criteria，再细化视觉。
- 与 `qa-strategist` 配合时，明确哪些视觉/交互点需要回归验证。
