import { invoke } from '@tauri-apps/api/core';
import type { ShellSnapshot } from '../domain/model';
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
