export const forgeDomainMcpMatrix = {
  "version": "1.0",
  "updated": "2026-03-13",
  "stacks": {
    "frontend": {
      "recommendedRoles": [
        "ui-designer",
        "frontend-engineer",
        "qa-strategist",
        "solution-architect",
        "developer"
      ],
      "recommendedMcp": [
        {
          "id": "figma-mcp",
          "label": "Figma MCP Server",
          "type": "official-remote-or-desktop",
          "why": "在 React/Next 与 Vue/Nuxt 双主栈下都保持设计稿、组件规范和实现闭环。",
          "source": "https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server"
        },
        {
          "id": "github-mcp",
          "label": "GitHub MCP Server",
          "type": "official-remote-or-local",
          "why": "对照 repo 事实来决定当前前端 lane 应该走 React/Next 还是 Vue/Nuxt，并追踪实现与回归。",
          "source": "https://github.com/github/github-mcp-server"
        },
        {
          "id": "chrome-devtools-mcp",
          "label": "Chrome DevTools MCP",
          "type": "official-remote-or-local",
          "why": "为前端工作提供 network、console、a11y、trace、memory 级别的浏览器证据。",
          "source": "https://github.com/ChromeDevTools/chrome-devtools-mcp"
        }
      ],
      "recommendedLocalTools": [
        {
          "id": "browser-use",
          "label": "browser-use",
          "why": "用于真实产品流与真实登录态验证，适合确认用户路径是否成立。"
        },
        {
          "id": "playwright",
          "label": "Playwright",
          "why": "用于可重复截图、回归与关键路径验证，适合确定性检查。"
        },
        {
          "id": "chrome-devtools-mcp",
          "label": "Chrome DevTools MCP",
          "why": "用于 DevTools 级别调试，适合分析浏览器行为而不是只做流程点击。"
        }
      ]
    },
    "ecommerce": {
      "recommendedRoles": [
        "product-manager",
        "ui-designer",
        "frontend-engineer",
        "java-backend-engineer",
        "python-backend-engineer",
        "qa-strategist",
        "platform-engineer",
        "release-devex",
        "engineering-manager"
      ],
      "recommendedMcp": [
        {
          "id": "github-mcp",
          "label": "GitHub MCP Server",
          "type": "official-remote-or-local",
          "why": "Track implementation, storefront/backend issues, and release coordination for ecommerce flows.",
          "source": "https://github.com/github/github-mcp-server"
        },
        {
          "id": "slack-mcp",
          "label": "Slack MCP",
          "type": "official-hosted",
          "why": "Useful for campaign coordination, support escalation, and post-release follow-up.",
          "source": "https://slack.com/help/articles/48855576908307-Guide-to-the-Slack-MCP-server"
        }
      ],
      "recommendedLocalTools": [
        {
          "id": "browser-use",
          "label": "browser-use",
          "why": "Validate real storefront, logged-in operator console, and conversion paths with cached sessions."
        },
        {
          "id": "playwright",
          "label": "Playwright",
          "why": "Use deterministic browser checks for checkout, admin, and regression-sensitive flows."
        },
        {
          "id": "chrome-devtools-mcp",
          "label": "Chrome DevTools MCP",
          "why": "Debug checkout runtime issues, browser console problems, performance regressions, and a11y gaps in storefront flows."
        }
      ]
    },
    "video-creation": {
      "recommendedRoles": [
        "product-manager",
        "ui-designer",
        "frontend-engineer",
        "ai-automation-engineer"
      ],
      "recommendedMcp": [
        {
          "id": "github-mcp",
          "label": "GitHub MCP Server",
          "type": "official-remote-or-local",
          "why": "Useful when video workflows include code, automation, or asset pipeline changes.",
          "source": "https://github.com/github/github-mcp-server"
        }
      ],
      "recommendedLocalTools": [
        {
          "id": "ai-multimodal",
          "label": "ai-multimodal",
          "why": "Analyze audio, images, and video structure when drafting or refining content workflows."
        },
        {
          "id": "media-processing",
          "label": "media-processing",
          "why": "Handle transcoding, clipping, screenshots, and reusable media pipeline tasks."
        }
      ]
    },
    "image-generation": {
      "recommendedRoles": [
        "ui-designer",
        "product-manager",
        "frontend-engineer",
        "ai-automation-engineer"
      ],
      "recommendedMcp": [
        {
          "id": "figma-mcp",
          "label": "Figma MCP Server",
          "type": "official-remote-or-desktop",
          "why": "Useful when generated assets need to align with interface or campaign design sources.",
          "source": "https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server"
        },
        {
          "id": "github-mcp",
          "label": "GitHub MCP Server",
          "type": "official-remote-or-local",
          "why": "Useful when image generation ties into product surfaces, repos, or asset automation.",
          "source": "https://github.com/github/github-mcp-server"
        }
      ],
      "recommendedLocalTools": [
        {
          "id": "ai-multimodal",
          "label": "ai-multimodal",
          "why": "Primary local capability for prompt-driven image generation and multimodal analysis."
        },
        {
          "id": "media-processing",
          "label": "media-processing",
          "why": "Prepare sizes, crops, and derivative assets after generation."
        },
        {
          "id": "chrome-devtools-mcp",
          "label": "Chrome DevTools MCP",
          "why": "Useful when generated assets must be validated inside real product surfaces for rendering, layout, or performance behavior."
        }
      ]
    },
    "workflow-automation": {
      "recommendedRoles": [
        "solution-architect",
        "python-backend-engineer",
        "ai-automation-engineer",
        "platform-engineer",
        "release-devex",
        "qa-strategist"
      ],
      "recommendedMcp": [
        {
          "id": "github-mcp",
          "label": "GitHub MCP Server",
          "type": "official-remote-or-local",
          "why": "Useful for automating issue, PR, and repo-centric workflow steps.",
          "source": "https://github.com/github/github-mcp-server"
        }
      ],
      "recommendedToolMcp": [
        {
          "id": "memory",
          "label": "memory",
          "type": "tooling",
          "why": "Keep multi-step workflows stateful across sessions and agents."
        },
        {
          "id": "fetch",
          "label": "fetch",
          "type": "tooling",
          "why": "Useful for integrating remote docs, APIs, and web-based workflow steps."
        },
        {
          "id": "browser-use",
          "label": "browser-use",
          "type": "tooling",
          "why": "Useful for browser steps inside end-to-end or operator workflow automation."
        }
      ]
    }
  }
} as const;
