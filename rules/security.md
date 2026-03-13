# Security Guidelines

## Mandatory Security Checks

任何准备提交的改动，至少都要过一遍这份清单：
- [ ] 没有 hardcoded secrets（API key、password、token）
- [ ] 所有 user input 都做了 validation
- [ ] SQL injection 有参数化保护
- [ ] XSS 风险点做了 sanitized HTML / safe rendering
- [ ] CSRF protection 已启用或已说明边界
- [ ] authentication / authorization 已验证
- [ ] 关键 endpoint 有 rate limiting 策略
- [ ] error message 不泄漏敏感信息

## Secret Management

```typescript
// NEVER: Hardcoded secrets
const apiKey = "sk-proj-xxxxx"

// ALWAYS: Environment variables
const apiKey = process.env.OPENAI_API_KEY

if (!apiKey) {
  throw new Error('OPENAI_API_KEY not configured')
}
```

## Security Response Protocol

一旦发现 security issue：
1. 先停止继续扩散问题
2. 进入 **security-reviewer** 视角
3. 先修 CRITICAL 问题，再继续其他工作
4. 如有泄漏，立刻 rotate 暴露的 secret
5. 回看整个 codebase，确认没有同类问题残留
