# 前端/桌面端/UI 开发规范

**版本**：v2.0
**更新日期**：2026-02-02
**适用范围**：Web 前端、桌面端应用、UI/UX 设计

---

## 一、Web 前端技术栈

### 1.1 框架选择

| 框架 | 场景 | 特点 |
|------|------|------|
| Next.js 15+ | Web 应用首选 | App Router, RSC, PPR, Turbopack |
| React 19+ | SPA/组件库 | Actions, use hook, Server Components |
| Vue 3.5+ | 轻量项目 | Vapor Mode, Composition API |
| Astro 5+ | 静态站点 | 零 JS 默认, View Transitions |
| Svelte 5+ | 高性能需求 | Runes, 编译时优化 |

### 1.2 样式方案

| 方案 | 场景 | 优先级 |
|------|------|--------|
| Tailwind CSS | 首选方案 | 1 |
| CSS Modules | 需要样式隔离 | 2 |
| styled-components | 动态样式需求 | 3 |

### 1.3 UI 组件库

| 库 | 用途 |
|-----|------|
| shadcn/ui | 首选，高度可定制 |
| Radix UI | 无样式原语组件 |
| Headless UI | 无样式交互组件 |

### 1.4 状态管理优先级

1. `useState/useReducer` - 组件内状态
2. `Context` - 跨组件共享
3. `Zustand` - 全局状态
4. `TanStack Query` - 服务端状态
5. `Jotai/Recoil` - 原子化状态

---

## 二、React 19 新特性（必用）

### 2.1 Actions 与表单处理

```tsx
// useActionState - 管理表单提交状态
import { useActionState } from 'react'

async function submitForm(prevState: State, formData: FormData) {
  'use server'
  const name = formData.get('name')
  // 服务端处理逻辑
  return { success: true, message: `Hello ${name}` }
}

function Form() {
  const [state, formAction, isPending] = useActionState(submitForm, null)

  return (
    <form action={formAction}>
      <input name="name" disabled={isPending} />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Submitting...' : 'Submit'}
      </button>
      {state?.message && <p>{state.message}</p>}
    </form>
  )
}
```

### 2.2 useOptimistic - 乐观更新

```tsx
import { useOptimistic, useState } from 'react'

function LikeButton({ initialLikes }: { initialLikes: number }) {
  const [likes, setLikes] = useState(initialLikes)
  const [optimisticLikes, addOptimisticLike] = useOptimistic(
    likes,
    (state, _) => state + 1
  )

  async function handleLike() {
    addOptimisticLike(null)
    try {
      const newLikes = await likePost()
      setLikes(newLikes)
    } catch (error) {
      // 乐观状态自动回滚
    }
  }

  return <button onClick={handleLike}>{optimisticLikes} Likes</button>
}
```

### 2.3 use Hook - 资源读取

```tsx
import { use, Suspense } from 'react'

// 读取 Promise
function Comments({ commentsPromise }: { commentsPromise: Promise<Comment[]> }) {
  const comments = use(commentsPromise)
  return comments.map(c => <p key={c.id}>{c.text}</p>)
}

// 读取 Context（可在条件语句中使用）
function Theme({ isEnabled }: { isEnabled: boolean }) {
  if (isEnabled) {
    const theme = use(ThemeContext)
    return <div className={theme}>Themed content</div>
  }
  return <div>Default content</div>
}
```

### 2.4 Server Components 与 Server Actions

```tsx
// Server Component (默认)
async function ProductList() {
  const products = await db.products.findMany()
  return (
    <ul>
      {products.map(p => <li key={p.id}>{p.name}</li>)}
    </ul>
  )
}

// Server Action
async function addToCart(productId: string) {
  'use server'
  await db.cart.add({ productId, userId: getCurrentUser() })
  revalidatePath('/cart')
}

// Client Component 调用 Server Action
'use client'
function AddButton({ productId }: { productId: string }) {
  return (
    <button onClick={() => addToCart(productId)}>
      Add to Cart
    </button>
  )
}
```

---

## 三、组件设计规范

### 3.1 Props 结构

```typescript
// 顺序：必需 → 可选 → 事件
interface ButtonProps {
  // 必需属性
  children: React.ReactNode

  // 可选属性
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string

  // 事件处理
  onClick?: () => void
  onFocus?: () => void
}
```

### 3.2 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件 | PascalCase | `UserProfile` |
| Hooks | use 前缀 | `useDebounce` |
| 工具函数 | camelCase | `formatDate` |
| 常量 | UPPER_SNAKE | `MAX_RETRY_COUNT` |
| 类型 | PascalCase | `UserData` |

### 3.3 文件组织

```
src/
├── components/
│   ├── ui/           # 基础 UI 组件
│   └── features/     # 业务组件
├── hooks/            # 自定义 Hooks
├── lib/              # 工具函数
├── types/            # 类型定义
└── styles/           # 全局样式
```

---

## 四、桌面端开发规范

### 4.1 框架选择

| 框架 | 场景 | 特点 |
|------|------|------|
| Tauri 2.0 | **首选** | Rust 后端，移动端支持，体积小 |
| Electron 33+ | 功能完整 | 生态成熟，体积较大 |
| Neutralino 5+ | 超轻量 | 简单应用 |

### 4.2 Tauri 2.0 最佳实践（首选）

**核心特性**：
- 移动端支持（iOS/Android）
- 插件系统重构
- Swift/Kotlin 原生绑定
- 更强的安全模型

**架构**：
```
前端（React/Vue/Svelte）
        ↓ invoke
Rust 后端（Commands）
        ↓
原生 API / 插件
```

**Rust 命令示例**：
```rust
#[tauri::command]
async fn greet(name: &str) -> Result<String, String> {
    Ok(format!("Hello, {}!", name))
}

// 注册命令
fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

**前端调用**：
```typescript
import { invoke } from '@tauri-apps/api/core'

const greeting = await invoke<string>('greet', { name: 'World' })
```

**移动端初始化**：
```bash
# 初始化移动端支持
tauri android init
tauri ios init

# 开发运行
tauri android dev
tauri ios dev
```

### 4.3 Electron 最佳实践

**进程架构**：
```
主进程 (main) ←IPC→ 渲染进程 (renderer)
       ↑
    preload（安全桥接）
```

**安全配置**：
```javascript
const win = new BrowserWindow({
  webPreferences: {
    nodeIntegration: false,
    contextIsolation: true,
    preload: path.join(__dirname, 'preload.js')
  }
})
```

### 4.4 跨平台注意事项

| 平台 | 注意事项 |
|------|----------|
| Windows | 路径用 `\\`，注册表操作，UAC 权限 |
| macOS | 签名公证，沙盒权限，.app 打包 |
| Linux | 多发行版测试，依赖管理 |

---

## 五、UI 设计规范

### 5.1 视觉层次

| 原则 | 说明 |
|------|------|
| 大小 | 大元素优先吸引注意力 |
| 对比 | 高对比度提升可读性 |
| 排版 | 用字重、大小、样式建立层次 |
| 布局 | F 型（网页）、Z 型（落地页） |
| 留白 | 减少认知负担 |

### 5.2 排版规范

**字体选择**：
- 最多 2-3 种字体
- 禁止：Inter、Roboto、Arial（过于通用）
- 推荐：特色字体配合正文字体

**字号层次**：
```css
--text-xs: 0.75rem;   /* 12px */
--text-sm: 0.875rem;  /* 14px */
--text-base: 1rem;    /* 16px */
--text-lg: 1.125rem;  /* 18px */
--text-xl: 1.25rem;   /* 20px */
--text-2xl: 1.5rem;   /* 24px */
```

### 5.3 颜色规范

**颜色心理学**：
| 颜色 | 含义 |
|------|------|
| 蓝色 | 信任、安全、冷静 |
| 红色 | 紧迫、激情、兴奋 |
| 绿色 | 成功、自然、成长 |
| 橙色 | 活力、友好、创意 |

**对比度要求**（WCAG AA）：
- 正文文字：4.5:1
- 大号文字：3:1

### 5.4 微交互规范

**时长指南**：
| 类型 | 时长 |
|------|------|
| 微交互 | 150-300ms |
| 按钮响应 | < 16ms |
| 标准动画 | 200-500ms |
| UI 动效 | 0.5-2s |

**缓动曲线**：
| 曲线 | 用途 |
|------|------|
| ease-out | 元素进入（首选） |
| ease-in | 元素离开 |
| spring | 强调效果（慎用） |

### 5.5 美学原则

**禁止**：
- Inter/Roboto/Arial 等通用字体
- 紫色渐变白底（AI 风格）
- 千篇一律的布局

**推荐**：
- 特色字体搭配
- 独特配色方案
- CSS 变量主题系统

---

## 六、无障碍规范

### 6.1 基本要求

- WCAG 2.1 AA 标准
- 语义化 HTML 优先
- 键盘导航支持
- 屏幕阅读器兼容

### 6.2 检查清单

- [ ] 图片有 alt 文本
- [ ] 表单有 label 关联
- [ ] 焦点状态可见
- [ ] 色盲友好配色
- [ ] 动画可关闭

---

## 七、性能优化

### 7.1 核心指标

| 指标 | 目标 |
|------|------|
| LCP | < 2.5s |
| FID | < 100ms |
| CLS | < 0.1 |

### 7.2 优化策略

- 图片懒加载
- 代码分割
- 预加载关键资源
- 动画使用 transform/opacity

---

## 八、相关 Skill

| Skill | 用途 |
|-------|------|
| frontend-design | 前端界面开发 |
| aesthetic | UI/UX 美学设计 |
| web-frameworks | Next.js/React 开发 |
| ui-styling | shadcn/ui + Tailwind |

---

## 更新记录

- **v2.0** (2026-02-02) - React 19 & Tauri 2.0 更新
  - 升级 React 到 19+，新增 Actions、useOptimistic、use hook
  - 升级 Tauri 到 2.0，新增移动端支持
  - 新增 Server Components 与 Server Actions 规范
  - 更新 Next.js 到 15+，新增 PPR、Turbopack
  - 更新框架版本要求

- **v1.0** (2026-02-02) - 初始版本
  - Web 前端技术栈规范
  - 桌面端开发规范
  - UI 设计规范
  - 无障碍规范
  - 性能优化指南
