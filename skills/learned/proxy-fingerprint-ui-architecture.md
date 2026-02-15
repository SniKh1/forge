---
id: proxy-fingerprint-ui-architecture
trigger: "when building proxy or fingerprint configuration UI in Social Hub"
confidence: 0.85
domain: "social-hub-architecture"
source: "session-observation"
---

# Social Hub 代理与指纹 UI 架构模式

## 双层代理配置

项目中代理配置存在两个层级，UI 需要分别处理：

### 1. 全局代理（SettingsView）

- 位置：设置页 > 代理设置
- 存储：`settingsStore.globalProxy`（Pinia 持久化）
- 含义：控制新建会话时是否自动继承代理配置，不是实时控制所有会话
- UI 模式：toggle 卡片 + 置灰表单
  - toggle 关闭时，表单 `opacity: 0.45; pointer-events: none`
  - toggle 本身不能被置灰区域包含，否则用户无法操作

### 2. 会话级代理（RightPanel env 面板）

- 位置：右侧面板 > 环境配置 > 代理设置
- 存储：通过 IPC 读写 `window.electron.env.load/save`
- 含义：单个会话的独立代理，优先级高于全局
- UI 模式：section header 内嵌 toggle + 置灰表单体

### 代理优先级

```
会话级代理（enabled）→ 全局代理（enabled）→ 直连
```

## ProxyForm 组件复用

`ProxyForm.vue` 是共享组件，在两个场景中复用：

- 全局设置页（宽内容区，200px 固定宽度输入框正常）
- 右侧面板（窄面板，需要 `:deep()` 覆盖固定宽度）

### 窄面板适配方案

不修改 ProxyForm 本身，通过父组件 `:deep()` 覆盖：

```css
.env-form-body :deep(.form-input) {
  width: auto;
  flex: 1;
  min-width: 0;
}
.env-form-body :deep(.form-row .base-select) {
  width: auto;
  flex: 1;
  min-width: 0;
}
.env-form-body :deep(.form-label) {
  min-width: 40px;
  font-size: 0.75rem;
}
```

面板在 env 模式下扩展宽度：`320px → 380px`（通过 `.env-expanded` class）

## 指纹配置 UI

指纹配置项：browserVersion, os, userAgent, webrtc, geolocation, resolution, font

- 文本项用 `<input>` + `v-model`
- 枚举项用 `<BaseSelect>` + `@update:model-value`
- 条件显示：`resolutionMode === 'custom'` 时展开宽高输入
- "随机生成"按钮一键填充所有指纹字段

## 铁律（来自 CLAUDE.md）

代理和指纹的所有控制权归 Electron 层，与平台代码完全解耦：
1. 不修改任何平台代码来实现代理或指纹
2. `ViewManager.createView()` 是唯一注入入口
3. 所有平台共享同一套 `ProxyResolver` + `FingerprintService`
