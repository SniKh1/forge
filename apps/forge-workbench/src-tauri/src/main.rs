#![cfg_attr(all(target_os = "windows", not(debug_assertions)), windows_subsystem = "windows")]

use serde::Serialize;
use std::path::{Path, PathBuf};
use std::process::Command;

#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

#[cfg(target_os = "windows")]
const CREATE_NO_WINDOW: u32 = 0x08000000;

const CLIENTS: [&str; 3] = ["claude", "codex", "gemini"];

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

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct DiagnosticClientStatus {
    client: String,
    home: String,
    detected: bool,
    configured: bool,
    home_exists: bool,
    command_available: bool,
    verify_ok: bool,
    verify_exit_code: i32,
    stdout: String,
    stderr: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct DiagnosticsSnapshot {
    repo_root: String,
    node_available: bool,
    npm_available: bool,
    python_available: bool,
    git_available: bool,
    clients: Vec<DiagnosticClientStatus>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct VerifyActionResult {
    client: String,
    ok: bool,
    exit_code: i32,
    stdout: String,
    stderr: String,
}

struct ExecOutput {
    status: i32,
    stdout: String,
    stderr: String,
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

fn repo_root() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("..")
        .join("..")
        .join("..")
        .canonicalize()
        .unwrap_or_else(|_| PathBuf::from("."))
}

fn command_exists(command: &str) -> bool {
    #[cfg(target_os = "windows")]
    let output = run_command_capture("where.exe", &[command], &[], None);
    #[cfg(not(target_os = "windows"))]
    let output = run_command_capture("which", &[command], &[], None);

    output
        .map(|item| item.status == 0 && !item.stdout.trim().is_empty())
        .unwrap_or(false)
}

fn user_home_dir() -> PathBuf {
    #[cfg(target_os = "windows")]
    {
        std::env::var_os("USERPROFILE")
            .map(PathBuf::from)
            .unwrap_or_else(|| PathBuf::from("."))
    }

    #[cfg(not(target_os = "windows"))]
    {
        std::env::var_os("HOME")
            .map(PathBuf::from)
            .unwrap_or_else(|| PathBuf::from("."))
    }
}

fn client_home(client: &str) -> PathBuf {
    match client {
        "claude" => user_home_dir().join(".claude"),
        "codex" => user_home_dir().join(".codex"),
        "gemini" => user_home_dir().join(".gemini"),
        _ => user_home_dir(),
    }
}

fn client_command(client: &str) -> &str {
    match client {
        "claude" => "claude",
        "codex" => "codex",
        "gemini" => "gemini",
        _ => client,
    }
}

fn client_marker_path(client: &str, home: &Path) -> PathBuf {
    match client {
        "claude" => home.join("CLAUDE.md"),
        "codex" => home.join("AGENTS.md"),
        "gemini" => home.join("GEMINI.md"),
        _ => home.join(".unknown"),
    }
}

fn verify_script_path(root: &Path, client: &str) -> Result<PathBuf, String> {
    let path = match client {
        "claude" => {
            if cfg!(target_os = "windows") {
                root.join("scripts").join("verify.ps1")
            } else {
                root.join("scripts").join("verify.sh")
            }
        }
        "codex" => {
            if cfg!(target_os = "windows") {
                root.join("codex").join("scripts").join("verify-codex.ps1")
            } else {
                root.join("codex").join("scripts").join("verify-codex.sh")
            }
        }
        "gemini" => {
            if cfg!(target_os = "windows") {
                root.join("gemini").join("scripts").join("verify-gemini.ps1")
            } else {
                root.join("gemini").join("scripts").join("verify-gemini.sh")
            }
        }
        _ => return Err(format!("Unsupported client: {client}")),
    };
    Ok(path)
}

fn client_runtime_env(client: &str) -> Vec<(String, String)> {
    let home = client_home(client).display().to_string();
    match client {
        "claude" => vec![("CLAUDE_HOME".into(), home)],
        "codex" => vec![("CODEX_HOME".into(), home)],
        "gemini" => vec![("GEMINI_HOME".into(), home)],
        _ => vec![],
    }
}

fn run_command_capture(
    command: &str,
    args: &[&str],
    env: &[(String, String)],
    cwd: Option<&Path>,
) -> Result<ExecOutput, String> {
    let mut cmd = Command::new(command);
    cmd.args(args);
    if let Some(cwd) = cwd {
        cmd.current_dir(cwd);
    }
    for (key, value) in env {
        cmd.env(key, value);
    }
    #[cfg(target_os = "windows")]
    {
        cmd.env("PYTHONUTF8", "1");
        cmd.env("PYTHONIOENCODING", "utf-8");
    }
    apply_windows_no_window(&mut cmd);
    let output = cmd.output().map_err(|err| err.to_string())?;
    Ok(ExecOutput {
        status: output.status.code().unwrap_or(1),
        stdout: String::from_utf8_lossy(&output.stdout).to_string(),
        stderr: String::from_utf8_lossy(&output.stderr).to_string(),
    })
}

fn run_verify_script(root: &Path, client: &str) -> Result<ExecOutput, String> {
    let script = verify_script_path(root, client)?;
    let env = client_runtime_env(client);
    #[cfg(target_os = "windows")]
    {
        let script_arg = script.display().to_string();
        run_command_capture(
            "powershell",
            &["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", &script_arg],
            &env,
            None,
        )
    }

    #[cfg(not(target_os = "windows"))]
    {
        let script_arg = script.display().to_string();
        run_command_capture("bash", &[&script_arg], &env, None)
    }
}

fn detect_client(root: &Path, client: &str) -> DiagnosticClientStatus {
    let home = client_home(client);
    let marker = client_marker_path(client, &home);
    let command_available = command_exists(client_command(client));
    let verify_result = run_verify_script(root, client);
    let (verify_ok, verify_exit_code, stdout, stderr) = match verify_result {
        Ok(output) => (
            output.status == 0,
            output.status,
            output.stdout,
            output.stderr,
        ),
        Err(error) => (false, 1, String::new(), error),
    };

    DiagnosticClientStatus {
        client: client.to_string(),
        home: home.display().to_string(),
        detected: command_available,
        configured: marker.exists(),
        home_exists: home.exists(),
        command_available,
        verify_ok,
        verify_exit_code,
        stdout,
        stderr,
    }
}

#[tauri::command]
fn get_shell_snapshot() -> ShellSnapshot {
    let repo_root = repo_root();

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
fn get_diagnostics_snapshot() -> DiagnosticsSnapshot {
    let root = repo_root();
    let clients = CLIENTS
        .iter()
        .map(|client| detect_client(&root, client))
        .collect::<Vec<_>>();

    DiagnosticsSnapshot {
        repo_root: root.display().to_string(),
        node_available: command_exists("node"),
        npm_available: command_exists("npm"),
        python_available: command_exists("python") || command_exists("python3"),
        git_available: command_exists("git"),
        clients,
    }
}

#[tauri::command]
fn verify_client(client: String) -> Result<VerifyActionResult, String> {
    let root = repo_root();
    let output = run_verify_script(&root, &client)?;
    Ok(VerifyActionResult {
        client,
        ok: output.status == 0,
        exit_code: output.status,
        stdout: output.stdout,
        stderr: output.stderr,
    })
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
            get_diagnostics_snapshot,
            verify_client,
            open_target,
            open_terminal_here
        ])
        .run(tauri::generate_context!())
        .expect("error while running Forge Workbench");
}
