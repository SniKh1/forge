import { invoke } from '@tauri-apps/api/core';

export type Client = 'claude' | 'codex' | 'gemini' | 'opencode';

export type DetectionItem = {
  name: Client;
  home: string;
  homeLabel: string;
  detected: boolean;
  configured: boolean;
  homeExists?: boolean;
  commandAvailable?: boolean;
};

export type SupportItem = {
  client: Client;
  ok: boolean;
  exitCode: number;
  stdout?: string;
  stderr?: string;
};

export type DoctorReport = {
  detection: DetectionItem[];
  capabilityMatrix: { capabilities: Record<string, Record<Client, string>> };
  support: SupportItem[];
};

export type RuntimeStatus = {
  nodeAvailable: boolean;
  npmAvailable: boolean;
  pythonAvailable: boolean;
  gitAvailable: boolean;
  repoRoot: string;
  runtimeCacheRoot: string;
  isolated: boolean;
};

export type InstalledClientState = {
  mcpServers: string[];
  skills: string[];
};

export type AppStatePayload = {
  report: DoctorReport;
  runtime: RuntimeStatus;
  installed: Record<string, InstalledClientState>;
};

export type ActionPayload = {
  client: string;
  cwd?: string;
  lang?: string;
  roleTitle?: string;
  stackIds?: string[];
  components: string[];
  mcpServers: string[];
  skillNames: string[];
  skillSyncMode?: 'selected' | 'full-library';
  secretValuesBase64?: string | null;
};

export type ActionResult<T> = {
  ok: boolean;
  summary: string;
  details: string[];
  warnings: string[];
  raw: string;
  data?: T | null;
};

export type BootstrapResultData = {
  client: string;
  detected: boolean;
  changed: boolean;
  packageName: string;
  command: string;
};

export type ExternalRegistrySource = {
  id: string;
  name: string;
  kind: 'skills' | 'mcp';
  type: string;
  url: string;
  trust: string;
  note: string;
};

export type ExternalSearchPayload = {
  kind: 'skills' | 'mcp';
  query: string;
  sources: ExternalRegistrySource[];
  results: unknown[];
};

export type ExternalSkillInstallPayload = {
  client: string;
  source: string;
  skill: string;
};

export type ExternalMcpInstallSpec = {
  name: string;
  transport: 'stdio';
  command: string;
  args: string[];
  env?: Record<string, string>;
  requiredSecrets?: string[];
  packageIdentifier?: string;
};

export type ExternalMcpInstallPayload = {
  client: string;
  spec: ExternalMcpInstallSpec;
};

export function isTauriRuntime() {
  return typeof window !== 'undefined' && Boolean((window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__);
}

function fallbackActionResult<T>(message: string, data?: T | null): ActionResult<T> {
  return {
    ok: false,
    summary: message,
    details: [],
    warnings: [],
    raw: message,
    data: data ?? null,
  };
}

async function invokeAction<T>(command: string, args?: Record<string, unknown>): Promise<ActionResult<T>> {
  try {
    return await invoke<ActionResult<T>>(command, args);
  } catch (error) {
    if (typeof error === 'string') {
      return fallbackActionResult<T>(error);
    }
    if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
      return fallbackActionResult<T>(error.message);
    }
    return fallbackActionResult<T>(`Failed to invoke ${command}.`);
  }
}

export async function getAppState() {
  return invokeAction<AppStatePayload>('get_app_state');
}

export async function installClientConfig(payload: ActionPayload) {
  return invokeAction('install_client_config', { payload });
}

export async function repairClientConfig(payload: ActionPayload) {
  return invokeAction('repair_client_config', { payload });
}

export async function verifyClientConfig(payload: ActionPayload) {
  return invokeAction('verify_client_config', { payload });
}

export async function bootstrapOfficialClient(client: string) {
  return invokeAction<BootstrapResultData>('bootstrap_official_client', { client });
}

export async function loadBuiltinMcpSecrets() {
  return invokeAction<Record<string, string>>('load_builtin_mcp_secrets');
}

export async function saveBuiltinMcpSecrets(values: Record<string, string>) {
  return invokeAction<Record<string, string>>('save_builtin_mcp_secrets', { values });
}

export async function searchExternalSkills(query: string) {
  return invokeAction<ExternalSearchPayload>('search_external_skills', { query });
}

export async function searchExternalMcp(query: string) {
  return invokeAction<ExternalSearchPayload>('search_external_mcp', { query });
}

export async function installExternalSkill(payload: ExternalSkillInstallPayload) {
  return invokeAction('install_external_skill', { payload });
}

export async function installExternalMcp(payload: ExternalMcpInstallPayload) {
  return invokeAction('install_external_mcp', { payload });
}

export async function openTerminalHere(cwd: string) {
  return invoke('open_terminal_here', { cwd });
}

export async function openTarget(target: string) {
  return invoke('open_target', { target });
}
