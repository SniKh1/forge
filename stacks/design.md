# Design Stack Pack

**Version**: v3.1
**Updated**: 2026-03-16
**Scope**: UI/UX 结构、组件系统、交互行为、视觉规范、设计验收

---

## 1. Purpose

当任务核心是下面这些内容时，加载这个 stack：
- 页面与组件的信息结构
- 交互细节与状态设计
- 设计系统与组件一致性
- 视觉层级、排版、间距与反馈
- 对现有实现做设计 review / visual QA

这个 stack 主要与下面这些 role-pack 配对：
- `ui-designer`
- `frontend-engineer`
- `full-stack-engineer`
- `qa-strategist`

优先 skills：
- `frontend-design`
- `aesthetic`
- `ui-styling`
- `browser-use`
- `web-design-guidelines`

优先 MCP：
- Figma MCP
- GitHub MCP

---

## 2. Default Working Model

默认顺序：
1. 先理顺 hierarchy
2. 再理顺 flow
3. 然后补齐状态面
4. 最后做视觉 refinement

必须显式检查：
- empty
- loading
- error
- success
- focus / keyboard
- 响应式表现

---

## 3. Design Quality Baseline

任何有意义的设计工作都要保证：
- hierarchy 一眼可读
- primary action 明确
- 组件 pattern 稳定
- spacing 有节奏
- 状态反馈可感知
- 交互变化不是突然出现/突然消失

默认偏好：
- 少量高质量 pattern，优于大量一次性样式
- 动画要解释状态变化，而不是只为“看起来动了”
- UI 建议必须能落到实现，不停留在抽象评价

---

## 4. Component and System Rules

优先：
- 基于现有 design language 做延展
- 用组件和 token 沉淀规范
- 保持命名、层级和 spacing 规则可复用

避免：
- 为了新鲜感不断发明新组件
- 把视觉反馈和业务状态脱钩
- 组件外观一致，但交互节奏完全不同
- 只修主状态，不修边界状态

---

## 5. Interaction Rules

交互默认要求：
- 按钮、输入框、下拉框、弹窗都要有进入和反馈节奏
- 搜索、加载、验证、安装这类动作要能被用户感知
- 弹层要考虑遮罩、层级、定位和关闭路径
- 表单布局要保证高度、对齐和密度一致

动画默认原则：
- 先慢一点、顺一点，再谈存在感
- 页面切换与模块切换优先使用有方向感的过渡
- 局部反馈优先用 opacity / translate / scale 的轻量组合

---

## 6. Browser Validation Defaults

优先使用：
- `browser-use`：真实 session、真实缓存、真实登录态回看
- `playwright`：可重复截图、E2E 流程、回归验证

适用场景：
- 真实产品流设计回看
- implementation review
- 视觉一致性检查
- 交互细节复验

---

## 7. Collaboration Rules

与 `product-manager` 配合时：
- 先对齐目标 flow 和 success criteria
- 再细化布局和状态

与 `frontend-engineer` / `developer` 配合时：
- 优先输出可实现约束，而不是纯审美意见
- 明确哪些点属于必须一致，哪些可以工程折中

与 `qa-strategist` 配合时：
- 标记需要回归的交互点
- 明确视觉/交互验收的最低标准

---

## 8. Validation Checklist

结束前至少自查：
- hierarchy 是否清晰？
- 状态是否齐全？
- 是否复用了已有 pattern？
- 动画是否帮助理解状态变化？
- 实现团队是否能直接据此落地？
