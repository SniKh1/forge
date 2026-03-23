import { invoke } from '@tauri-apps/api/core';
import type { DiagnosticsSnapshot, ShellSnapshot, VerifyActionResult } from '../domain/model';
import { emptySnapshot } from '../domain/seed';

export function isTauriRuntime() {
  return typeof window !== 'undefined' && Boolean((window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__);
}

export async function getShellSnapshot(): Promise<ShellSnapshot> {
  if (!isTauriRuntime()) {
    return {
      ...emptySnapshot,
      repoRoot: 'preview-mode',
    };
  }

  try {
    return await invoke<ShellSnapshot>('get_shell_snapshot');
  } catch {
    return {
      ...emptySnapshot,
      repoRoot: 'snapshot-unavailable',
    };
  }
}

export async function openTarget(target: string) {
  if (!isTauriRuntime()) return;
  await invoke('open_target', { target });
}

export async function openTerminalHere(cwd: string) {
  if (!isTauriRuntime()) return;
  await invoke('open_terminal_here', { cwd });
}

export async function getDiagnosticsSnapshot(): Promise<DiagnosticsSnapshot> {
  if (!isTauriRuntime()) {
    return {
      repoRoot: 'preview-mode',
      nodeAvailable: true,
      npmAvailable: true,
      pythonAvailable: true,
      gitAvailable: true,
      clients: [
        {
          client: 'claude',
          home: '~/.claude',
          detected: true,
          configured: true,
          homeExists: true,
          commandAvailable: true,
          verifyOk: true,
          verifyExitCode: 0,
          stdout: 'Preview mode diagnostics.',
          stderr: '',
        },
        {
          client: 'codex',
          home: '~/.codex',
          detected: true,
          configured: true,
          homeExists: true,
          commandAvailable: true,
          verifyOk: true,
          verifyExitCode: 0,
          stdout: 'Preview mode diagnostics.',
          stderr: '',
        },
        {
          client: 'gemini',
          home: '~/.gemini',
          detected: true,
          configured: true,
          homeExists: true,
          commandAvailable: true,
          verifyOk: true,
          verifyExitCode: 0,
          stdout: 'Preview mode diagnostics.',
          stderr: '',
        },
      ],
    };
  }

  return invoke<DiagnosticsSnapshot>('get_diagnostics_snapshot');
}

export async function verifyClient(client: 'claude' | 'codex' | 'gemini'): Promise<VerifyActionResult> {
  if (!isTauriRuntime()) {
    return {
      client,
      ok: true,
      exitCode: 0,
      stdout: 'Preview mode verification finished.',
      stderr: '',
    };
  }

  return invoke<VerifyActionResult>('verify_client', { client });
}
