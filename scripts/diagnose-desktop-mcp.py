#!/usr/bin/env python3
"""
诊断并修复 Forge Desktop 的 MCP 安装问题

问题：桌面端安装 MCP 后，Claude 无法识别
原因：配置格式或路径不匹配
"""

import json
import sys
from pathlib import Path

def main():
    print("=== Forge Desktop MCP 安装诊断 ===\n")

    # 1. 检查配置文件
    claude_home = Path.home() / ".claude"
    mcp_json = claude_home / ".mcp.json"
    claude_json = Path.home() / ".claude.json"

    print("1. 检查配置文件:")
    print(f"   ~/.claude/.mcp.json: {'✓ 存在' if mcp_json.exists() else '✗ 不存在'}")
    print(f"   ~/.claude.json: {'✓ 存在' if claude_json.exists() else '✗ 不存在'}")

    # 2. 检查 .mcp.json 格式
    if mcp_json.exists():
        try:
            with open(mcp_json, 'r', encoding='utf-8') as f:
                mcp_data = json.load(f)

            print(f"\n2. .mcp.json 内容:")
            if 'mcpServers' in mcp_data:
                servers = mcp_data['mcpServers']
                print(f"   找到 {len(servers)} 个 MCP 服务器:")
                for name in list(servers.keys())[:5]:
                    print(f"   - {name}")
                if len(servers) > 5:
                    print(f"   ... 还有 {len(servers) - 5} 个")

                # 检查格式问题
                print(f"\n3. 格式检查:")
                format_ok = True
                for name, config in servers.items():
                    if 'command' not in config:
                        print(f"   ✗ {name}: 缺少 'command' 字段")
                        format_ok = False
                    if 'args' not in config:
                        print(f"   ✗ {name}: 缺少 'args' 字段")
                        format_ok = False

                if format_ok:
                    print("   ✓ 所有 MCP 格式正确")
            else:
                print("   ✗ 缺少 'mcpServers' 字段")
        except Exception as e:
            print(f"   ✗ 读取失败: {e}")

    # 3. 同步到 .claude.json
    print(f"\n4. 同步到全局配置:")
    if mcp_json.exists() and claude_json.exists():
        try:
            with open(mcp_json, 'r', encoding='utf-8') as f:
                mcp_data = json.load(f)
            with open(claude_json, 'r', encoding='utf-8') as f:
                claude_data = json.load(f)

            # 合并 MCP 配置
            if 'mcpServers' in mcp_data:
                claude_data['mcpServers'] = mcp_data['mcpServers']

                with open(claude_json, 'w', encoding='utf-8') as f:
                    json.dump(claude_data, f, indent=2, ensure_ascii=False)

                print(f"   ✓ 已同步 {len(mcp_data['mcpServers'])} 个 MCP 到 ~/.claude.json")
            else:
                print("   ✗ .mcp.json 中没有 mcpServers")
        except Exception as e:
            print(f"   ✗ 同步失败: {e}")

    print("\n=== 诊断完成 ===")
    print("\n建议:")
    print("1. 重启 Claude Code CLI")
    print("2. 运行 'claude' 然后输入 '/mcp' 验证")
    print("3. 如果还有问题，检查 Python 脚本权限")

if __name__ == '__main__':
    main()
