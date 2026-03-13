export const forgeDomainMcpMatrix = {
  "version": "1.0",
  "updated": "2026-03-13",
  "stacks": {
    "ecommerce": {
      "recommendedRoles": [
        "product-manager",
        "ui-designer",
        "developer",
        "qa-strategist",
        "release-devex"
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
        }
      ]
    },
    "video-creation": {
      "recommendedRoles": [
        "product-manager",
        "ui-designer",
        "developer"
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
        "developer"
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
        }
      ]
    },
    "workflow-automation": {
      "recommendedRoles": [
        "solution-architect",
        "developer",
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
