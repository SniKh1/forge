#![cfg_attr(all(target_os = "windows", not(debug_assertions)), windows_subsystem = "windows")]

use serde::Serialize;
use std::path::PathBuf;
use std::process::Command;

#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

#[cfg(target_os = "windows")]
const CREATE_NO_WINDOW: u32 = 0x08000000;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct ShellSnapshot {
    repo_root: String,
    client_count: usize,
    role_count: usize,
    stack_count: usize,
    skill_count: usize,
    primary_skill_count: usize,
}

fn default_working_dir() -> PathBuf {
    #[cfg(target_os = "windows")]
    let home_var = "USERPROFILE";
    #[cfg(not(target_os = "windows"))]
    let home_var = "HOME";

    std::env::var_os(home_var)
        .map(PathBuf::from)
        .filter(|path| path.exists())
        .or_else(|| std::env::current_dir().ok())
        .unwrap_or_else(|| PathBuf::from("."))
}

fn resolve_cwd(cwd: Option<String>) -> PathBuf {
    cwd.map(PathBuf::from)
        .filter(|path| !path.as_os_str().is_empty() && path.exists())
        .unwrap_or_else(default_working_dir)
}

#[allow(dead_code)]
fn apply_windows_no_window(command: &mut Command) {
    #[cfg(target_os = "windows")]
    command.creation_flags(CREATE_NO_WINDOW);
}

#[tauri::command]
fn get_shell_snapshot() -> ShellSnapshot {
    let repo_root = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("..")
        .join("..")
        .join("..")
        .canonicalize()
        .unwrap_or_else(|_| PathBuf::from("."));

    ShellSnapshot {
        repo_root: repo_root.display().to_string(),
        client_count: 3,
        role_count: 8,
        stack_count: 10,
        skill_count: 110,
        primary_skill_count: 36,
    }
}

#[tauri::command]
fn open_terminal_here(cwd: String) -> Result<(), String> {
    let cwd = resolve_cwd(Some(cwd));
    let cwd_str = cwd.to_string_lossy().to_string();

    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .args(["-a", "Terminal", cwd_str.as_str()])
            .output()
            .map_err(|err| err.to_string())?;
        return Ok(());
    }

    #[cfg(target_os = "windows")]
    {
        let mut command = Command::new("cmd");
        command.args(["/C", "start", "cmd", "/K", &format!("cd /d {}", cwd_str)]);
        apply_windows_no_window(&mut command);
        command.output().map_err(|err| err.to_string())?;
        return Ok(());
    }

    #[cfg(target_os = "linux")]
    {
        Command::new("x-terminal-emulator")
            .args(["--working-directory", cwd_str.as_str()])
            .output()
            .map_err(|err| err.to_string())?;
        return Ok(());
    }
}

#[tauri::command]
fn open_target(target: String) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .arg(target)
            .output()
            .map_err(|err| err.to_string())?;
        return Ok(());
    }

    #[cfg(target_os = "windows")]
    {
        let mut command = Command::new("cmd");
        command.args(["/C", "start", "", &target]);
        apply_windows_no_window(&mut command);
        command.output().map_err(|err| err.to_string())?;
        return Ok(());
    }

    #[cfg(target_os = "linux")]
    {
        Command::new("xdg-open")
            .arg(target)
            .output()
            .map_err(|err| err.to_string())?;
        return Ok(());
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_shell_snapshot,
            open_target,
            open_terminal_here
        ])
        .run(tauri::generate_context!())
        .expect("error while running Forge Workbench");
}
