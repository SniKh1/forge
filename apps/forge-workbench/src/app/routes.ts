import type { WorkbenchSection } from '../domain/model';

export const navigation: Array<{ id: WorkbenchSection; title: string }> = [
  { id: 'overview', title: '总览' },
  { id: 'workspaces', title: '工作空间' },
  { id: 'roles-stacks', title: '角色与栈包' },
  { id: 'skills-prompts', title: 'Skills 与 Prompt' },
  { id: 'tools', title: '工具层' },
  { id: 'diagnostics', title: '诊断' },
  { id: 'release', title: '发布' },
  { id: 'settings', title: '设置' },
];
