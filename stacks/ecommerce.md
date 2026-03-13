# Ecommerce Stack Pack

## Scope
用于商品、店铺、订单、支付、营销活动、用户转化和电商后台相关工作。

## Defaults
- 先围绕业务目标和关键转化路径思考，而不是先堆功能。
- 先明确商品、订单、支付、营销、客服这些核心对象之间的边界。
- 所有页面和流程默认都要考虑运营可用性与异常处理。
- 电商类任务优先关注真实业务流程是否可跑通，而不是只关注页面是否“能打开”。

## Typical Inputs
- 店铺后台需求
- 商品管理、订单管理、库存管理需求
- 营销活动、优惠券、会员体系、转化路径需求
- 电商前台购买流程与后台运营流程联动问题

## Preferred Skills
- `brainstorming`
- `frontend-design`
- `backend-development`
- `better-auth`
- `browser-use`
- `webapp-testing`
- `code-review`

## Recommended MCP / Tools
优先使用通用协作与系统能力：
- `GitHub MCP`
- `browser-use`
- `playwright`
- `memory`
- `mcp-management`

如果后续接入行业工具，再单独补到这个 pack 里，不在 v1 里预设过多外部依赖。

## Output Shape
- 电商流程 brief
- 核心对象边界（商品/订单/支付/营销）
- 前后台联动说明
- 风险与异常路径
- 运营 handoff note

## Validation Checklist
- 关键转化路径是否完整？
- 是否覆盖下单、支付、退款、库存、活动等异常路径？
- 后台操作是否考虑运营可用性？
- 是否区分用户侧流程与运营侧流程？

## Collaboration Contract
- 与 `product-manager + product` 配合时，先定义转化目标和关键路径。
- 与 `ui-designer + design` 配合时，先对齐前台与后台的状态差异。
- 与 `developer + frontend/java/python` 配合时，优先明确对象边界和异常处理。
- 与 `qa-strategist + qa` 配合时，重点覆盖交易与订单相关高风险路径。
