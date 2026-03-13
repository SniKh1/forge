# Testing Requirements

## Minimum Test Coverage: 80%

默认测试结构至少覆盖三层：
1. **Unit Tests**：函数、工具、组件等局部逻辑
2. **Integration Tests**：API endpoint、database operation、模块协作边界
3. **E2E Tests**：关键用户流程（通常用 Playwright）

## Test-Driven Development

默认 workflow：
1. 先写 test（RED）
2. 运行 test，确认它先 FAIL
3. 写最小实现（GREEN）
4. 再跑 test，确认它 PASS
5. 做必要 refactor（IMPROVE）
6. 检查 coverage（80%+）

## Troubleshooting Test Failures

测试失败时，先收敛问题，不要急着乱改：
1. 进入 **tdd-guide** 视角
2. 检查 test isolation 是否被破坏
3. 检查 mock / fixture 是否正确
4. 优先修实现，而不是随意改 test（除非 test 本身就是错的）

## Agent Support

- **tdd-guide**：用于新功能、bug 修复和重构时的 TDD 主流程
- **e2e-runner**：用于 Playwright E2E 测试和关键流程验证
