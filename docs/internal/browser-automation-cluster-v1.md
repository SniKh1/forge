# Browser Automation Cluster v1

## Scope
本文件定义 `browser-use`、`browser`、`chrome-devtools` 这一组浏览器相关 skill 的主从关系、默认入口和使用边界。

## Canonical Entry
- primary：`browser-use`
- support：`browser`
- support：`chrome-devtools`

## Why `browser-use` is primary
`browser-use` 更贴近 Forge 当前真实工作流：
- developer / UI 场景需要复用真实浏览器 profile、cookies、cache 和登录态
- 需要跑真实用户路径，而不是只做低层 debugging
- 已经和 `core/tool-defaults.json` 的默认值对齐

因此，在没有明确反例时：
- 浏览器自动化默认入口是 `browser-use`
- 正常不先落到 `browser` 或 `chrome-devtools`

## Support Skill Boundaries
### `browser`
适合：
- 需要直接附着或控制 CDP / remote debugging
- 需要在页面上下文里执行临时 JavaScript
- 需要轻量脚本式浏览器操作，而不是完整用户流程

不适合：
- 真实登录态、真实用户路径、复用 profile 的主流程验证

### `chrome-devtools`
适合：
- network / performance / console / DOM 调试
- 更接近 DevTools 面板能力的排查
- 页面加载、请求、性能问题的低层分析

不适合：
- 作为默认浏览器自动化入口
- 代替 `browser-use` 承担真实业务流程验证

## Routing Rule
当需求命中下列语义时，优先路由到 `browser-use`：
- 登录态开发
- 后台联调
- 真实产品流程验证
- 表单填写
- 页面操作与数据提取
- 截图与流程回放

仅当任务明确需要更低层控制时，才显式切换：
- `browser`
- `chrome-devtools`

## Metadata Contract
在 `core/skill-overrides.json` 与 `core/skill-registry.json` 中：
- `overlapGroup = browser-automation`
- `browser-use.clusterRole = primary`
- `browser.clusterRole = support`
- `chrome-devtools.clusterRole = support`

## Follow-up
下一阶段可继续补：
- Desktop 中对浏览器簇的主从标记展示
- 按 `clusterRole` 调整安装弹窗默认排序
- 在规则路由中显式利用 `supportWhen`
