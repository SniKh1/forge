import type { WorkbenchSection } from '../domain/model';

export const navigation: Array<{ id: WorkbenchSection; title: string; summary: string }> = [
  { id: 'overview', title: '总览', summary: '看当前目标、里程碑和整体推进情况。' },
  { id: 'workspaces', title: '工作空间', summary: '按团队场景组织客户端、角色与交付流。' },
  { id: 'roles-stacks', title: '角色与 Stack', summary: '用主角色和主能力域重写产品信息架构。' },
  { id: 'skills-prompts', title: 'Skills 与 Prompt', summary: '把能力层从文案包升级成任务包。' },
  { id: 'tools', title: '工具层', summary: '让 MCP 和外部能力成为工作流依赖层。' },
  { id: 'diagnostics', title: '诊断', summary: '承接验证、修复、环境和证据面板。' },
  { id: 'release', title: '发布', summary: '面向交付负责人组织版本与风险闭环。' },
  { id: 'settings', title: '策略', summary: '沉淀语言、原则和当前 rewrite 约束。' },
];
