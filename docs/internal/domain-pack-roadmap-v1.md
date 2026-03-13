# Domain Pack Roadmap v1

## Purpose

这一阶段的目标，不是立刻把电商、视频创作、图像生成、工作流自动化全部做成完整生产方案，
而是先为 Forge 建立可持续扩展的领域 pack 骨架。

这些领域 pack 的定位是：
- 作为 `stack-pack` 使用
- 可与 `role-pack` 组合
- 为后续 skill / MCP / agent 推荐提供宿主层

## Why Domain Packs Exist

当前 Forge 的治理骨架已经能很好覆盖：
- developer
- product-manager
- ui-designer
- solution-architect
- qa-strategist
- release-devex

也已经覆盖通用开发栈：
- `frontend`
- `java`
- `python`
- `product`
- `design`
- `architecture`
- `qa`
- `release`

但如果后续要支持：
- 电商运营与店铺工作流
- 视频创作与内容生产
- 图像生成与视觉资产制作
- 工作流自动化与多工具编排

那么仅靠“开发栈”已经不够。

这些领域更像：
- 以业务目标为中心
- 以工具链和产出物为中心
- 以协同流程为中心

所以它们应该进入 `stack-pack` 体系，作为可挂载的领域 pack。

## First Draft Domain Packs

### `ecommerce`
适用问题：
- 商品、店铺、订单、支付、营销活动相关流程
- 电商后台与运营系统
- 店铺内容管理、用户触达、转化优化
- 电商前端与后台的协同界面

优先结合的 role-pack：
- `product-manager`
- `ui-designer`
- `developer`
- `qa-strategist`
- `release-devex`

### `video-creation`
适用问题：
- 视频脚本、镜头拆解、素材处理
- 剪辑流程、发布准备、内容复用
- 视频类内容工作流与审校

优先结合的 role-pack：
- `product-manager`
- `ui-designer`
- `developer`

### `image-generation`
适用问题：
- 图像生成、视觉风格迭代、素材资产管理
- 设计参考图、活动图、封面图、社媒图
- 图像生成工作流与 prompt 管理

优先结合的 role-pack：
- `ui-designer`
- `product-manager`
- `developer`

### `workflow-automation`
适用问题：
- 多步骤自动化
- MCP/tool orchestration
- 文档、浏览器、数据库、外部服务之间的串联
- 低重复劳动与运营流程自动化

优先结合的 role-pack：
- `solution-architect`
- `developer`
- `release-devex`

## Design Principles

所有 domain pack 都应遵守：
- 不替代 `global-core`
- 不替代 `role-pack`
- 只表达该领域内的默认工作方式、验证方式、工具优先级和交付约束
- 优先使用 Forge 已有 skill / MCP / agent 组合，不先引入过多新抽象

## Implementation Order

建议顺序：
1. `workflow-automation`
2. `image-generation`
3. `video-creation`
4. `ecommerce`

原因：
- `workflow-automation` 与当前 Forge 能力最接近，收益最快
- `image-generation` 次之，容易与现有 UI/设计链路合并
- `video-creation` 和 `ecommerce` 更偏业务场景，适合在基础治理更稳后扩展

## Deferred Scope

这份 v1 只负责：
- 建立 pack 草案
- 说明适用边界
- 给出推荐 skill / MCP / output shape 方向

暂不负责：
- 完整自动路由
- Desktop 中的单独安装器入口
- 社区扩展自动映射
- 行业专属 MCP 深度接入
