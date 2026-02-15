---
id: headlessui-switch-tailwind-v4
trigger: "when using HeadlessUI Switch component with Tailwind CSS v4 and Vue scoped styles"
confidence: 0.9
domain: "vue-css"
source: "session-observation"
---

# HeadlessUI Switch + Tailwind v4 + Vue Scoped CSS 陷阱

## 问题

HeadlessUI v1.7 的 `<Switch>` 组件内部会渲染一个 `<span aria-hidden="true">` 用于 sr-only 文本。在 Tailwind CSS v4 中，由于不再内置 `sr-only` 工具类的全局样式，这个 span 会变成一个可见的白点，覆盖在 toggle 上方。

## 错误修复方式（踩过的坑）

```css
/* 错误：:not() 选择器在 scoped CSS 编译后行为不可预测 */
/* 可能意外隐藏 .toggle-thumb 元素 */
.base-toggle :deep(> :not(.toggle-thumb)) {
  /* sr-only styles */
}
```

Vue scoped CSS 编译时会给选择器添加 `[data-v-xxx]` 属性，`:not()` 伪类与 `:deep()` 组合后，选择器的实际匹配范围可能超出预期，导致 thumb 元素也被隐藏。

## 正确修复方式

```css
/* 精确匹配 HeadlessUI 渲染的 aria-hidden span */
.base-toggle :deep(span[aria-hidden]) {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border-width: 0 !important;
}
```

## 关键原则

1. Vue scoped `:deep()` 中避免使用 `:not()` 选择器 — 编译后行为不可控
2. 用属性选择器 `span[aria-hidden]` 精确定位 HeadlessUI 内部元素
3. Toggle off 状态背景色不要复用 `--color-border`（太浅，与白色背景几乎不可区分），应使用专用变量 `--color-toggle-off`

## 证据

- 3 次修复尝试，前 2 次失败
- `:deep(> :not(.toggle-thumb))` 导致 toggle 完全不可见
- `var(--color-border)` (#e2e8f0) 作为 off 背景色在白色卡片上不可见
