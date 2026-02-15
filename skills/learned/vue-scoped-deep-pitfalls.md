---
id: vue-scoped-deep-pitfalls
trigger: "when using Vue scoped CSS with :deep() to style child components"
confidence: 0.85
domain: "vue-css"
source: "session-observation"
---

# Vue Scoped CSS :deep() 使用陷阱与最佳实践

## 核心问题

Vue scoped CSS 编译时给选择器添加 `[data-v-xxx]` 属性。`:deep()` 会移除子元素的 scoped 约束，但与复杂选择器组合时行为可能不符合预期。

## 危险模式

### 1. :deep() + :not() 组合

```css
/* 危险：编译后 :not() 的匹配范围可能超出预期 */
.parent :deep(> :not(.child-class)) {
  display: none;
}
```

scoped 编译后，`.child-class` 可能带有 `[data-v-xxx]` 属性选择器，而实际 DOM 中的子元素可能没有这个属性（因为它们来自第三方组件），导致 `:not()` 匹配到不该匹配的元素。

### 2. :deep() + 通配选择器

```css
/* 危险：可能影响所有后代 */
.parent :deep(*) { ... }
```

## 安全模式

### 1. 属性选择器精确匹配

```css
/* 安全：精确匹配特定属性 */
.parent :deep(span[aria-hidden]) { ... }
.parent :deep(input[type="number"]) { ... }
```

### 2. 类名直接匹配

```css
/* 安全：直接匹配子组件的类名 */
.parent :deep(.form-input) { width: auto; }
.parent :deep(.base-select) { flex: 1; }
```

### 3. 覆盖固定宽度组件

当共享组件有固定宽度（如 `width: 200px; flex-shrink: 0`），在窄容器中通过 `:deep()` 覆盖：

```css
.narrow-container :deep(.fixed-width-element) {
  width: auto;
  flex: 1;
  min-width: 0;  /* 关键：允许 flex 子项收缩到 0 */
}
```

## 证据

- HeadlessUI Switch 的 `:deep(> :not(.toggle-thumb))` 导致 toggle thumb 被隐藏
- 改为 `:deep(span[aria-hidden])` 后问题解决
- ProxyForm 的 200px 固定宽度输入框通过 `:deep(.form-input)` 成功覆盖为弹性布局
