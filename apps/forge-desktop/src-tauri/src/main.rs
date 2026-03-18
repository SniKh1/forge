#![cfg_attr(all(target_os = "windows", not(debug_assertions)), windows_subsystem = "windows")]

use std::path::PathBuf;
use std::process::Command;

use tauri::{AppHandle, Manager};

#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

#[cfg(target_os = "windows")]
const CREATE_NO_WINDOW: u32 = 0x08000000;

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

fn source_repo_root() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../..")
}

fn candidate_repo_roots(app: &AppHandle) -> Vec<PathBuf> {
    let mut candidates = Vec::new();

    if let Ok(resource_dir) = app.path().resource_dir() {
        candidates.push(resource_dir.clone());
        candidates.push(resource_dir.join("_up_"));
    }

    if let Ok(exe_path) = std::env::current_exe() {
        if let Some(exe_dir) = exe_path.parent() {
            candidates.push(exe_dir.to_path_buf());
            candidates.push(exe_dir.join("resources"));
            if let Some(parent) = exe_dir.parent() {
                candidates.push(parent.to_path_buf());
                candidates.push(parent.join("resources"));
            }
        }
    }

    candidates.push(source_repo_root());
    candidates
}

fn resolve_repo_root(app: &AppHandle) -> Result<PathBuf, String> {
    let candidates = candidate_repo_roots(app);
    for candidate in &candidates {
        let cli_path = candidate.join("packages/forge-cli/bin/forge.js");
        if cli_path.exists() {
            return Ok(candidate.clone());
        }
    }

    let searched = candidates
        .iter()
        .map(|path| path.display().to_string())
        .collect::<Vec<_>>()
        .join(", ");
    Err(format!(
        "Forge CLI bundle not found. Searched roots: {}",
        searched
    ))
}

fn apply_windows_no_window(_command: &mut Command) {
    #[cfg(target_os = "windows")]
    _command.creation_flags(CREATE_NO_WINDOW);
}

fn command_from_probe(command: &str, args: &[&str]) -> Option<PathBuf> {
    let output = Command::new(command).args(args).output().ok()?;
    if !output.status.success() {
        return None;
    }

    String::from_utf8_lossy(&output.stdout)
        .lines()
        .map(str::trim)
        .find(|line| !line.is_empty())
        .map(PathBuf::from)
}

fn resolve_node_binary() -> Result<PathBuf, String> {
    let mut searched = Vec::new();

    let mut direct = Command::new("node");
    direct.arg("--version");
    apply_windows_no_window(&mut direct);
    if let Ok(output) = direct.output() {
        if output.status.success() {
            return Ok(PathBuf::from("node"));
        }
    }
    searched.push("PATH:node".to_string());

    #[cfg(target_os = "windows")]
    {
        if let Some(path) = command_from_probe("where.exe", &["node"]) {
            return Ok(path);
        }
        searched.push("where.exe node".to_string());

        let mut candidates = Vec::new();
        if let Some(value) = std::env::var_os("FORGE_NODE_PATH") {
            candidates.push(PathBuf::from(value));
        }
        if let Some(value) = std::env::var_os("NVM_SYMLINK") {
            candidates.push(PathBuf::from(value).join("node.exe"));
        }
        if let Some(value) = std::env::var_os("NVM_HOME") {
            candidates.push(PathBuf::from(value).join("node.exe"));
        }
        if let Some(value) = std::env::var_os("VOLTA_HOME") {
            candidates.push(PathBuf::from(value).join("bin/node.exe"));
        }
        if let Some(value) = std::env::var_os("ProgramFiles") {
            candidates.push(PathBuf::from(value).join("nodejs/node.exe"));
        }
        if let Some(value) = std::env::var_os("LOCALAPPDATA") {
            candidates.push(PathBuf::from(value.clone()).join("Programs/nodejs/node.exe"));
            candidates.push(PathBuf::from(value).join("Volta/bin/node.exe"));
        }
        if let Some(value) = std::env::var_os("APPDATA") {
            candidates.push(PathBuf::from(value).join("npm/node.exe"));
        }

        for candidate in candidates {
            searched.push(candidate.display().to_string());
            if candidate.exists() {
                return Ok(candidate);
            }
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        if let Some(path) = command_from_probe("which", &["node"]) {
            return Ok(path);
        }
        searched.push("which node".to_string());

        let candidates = [
            "/opt/homebrew/bin/node",
            "/usr/local/bin/node",
            "/usr/bin/node",
            "/opt/local/bin/node",
        ];
        for candidate in candidates {
            let path = PathBuf::from(candidate);
            searched.push(path.display().to_string());
            if path.exists() {
                return Ok(path);
            }
        }
    }

    Err(format!(
        "Node.js runtime not found. Install Node.js 18+ or set FORGE_NODE_PATH. Searched: {}",
        searched.join(", ")
    ))
}

#[tauri::command]
async fn run_forge_cli(
    app: AppHandle,
    args: Vec<String>,
    cwd: Option<String>,
) -> Result<String, String> {
    let current_dir = resolve_cwd(cwd);
    let repo_root = resolve_repo_root(&app)?;
    let cli_path = repo_root.join("packages/forge-cli/bin/forge.js");
    let node_binary = resolve_node_binary()?;

    if !cli_path.exists() {
        return Err(format!("Forge CLI not found: {}", cli_path.display()));
    }

    let cache_dir = app.path().app_cache_dir().ok().map(|dir| dir.join("forge-cli"));

    tauri::async_runtime::spawn_blocking(move || {
        let mut command = Command::new(&node_binary);
        command
            .arg(&cli_path)
            .args(args)
            .current_dir(current_dir)
            .env("FORGE_REPO_ROOT", &repo_root);

        if let Some(cache_dir) = cache_dir {
            command.env("FORGE_CACHE_ROOT", cache_dir);
        }

        apply_windows_no_window(&mut command);

        let output = command.output().map_err(|err| {
            format!(
                "Failed to launch Forge CLI via {}: {}",
                node_binary.display(),
                err
            )
        })?;

        let stdout = String::from_utf8_lossy(&output.stdout);
        let stderr = String::from_utf8_lossy(&output.stderr);

        if output.status.success() {
            Ok(stdout.to_string())
        } else {
            Err(format!("{}{}", stdout, stderr))
        }
    })
    .await
    .map_err(|err| err.to_string())?
}

#[tauri::command]
fn open_terminal_here(cwd: String) -> Result<(), String> {
    let cwd = resolve_cwd(Some(cwd));
    let cwd_str = cwd.to_string_lossy().to_string();

    #[cfg(target_os = "macos")]
    {
        let escaped = shell_escape::escape(cwd_str.into());
        Command::new("osascript")
            .args([
                "-e",
                &format!(
                    "tell application \"Terminal\" to do script \"cd {}\"",
                    escaped
                ),
                "-e",
                "tell application \"Terminal\" to activate",
            ])
            .output()
            .map_err(|err| err.to_string())?;
        return Ok(());
    }

    #[cfg(target_os = "windows")]
    {
        Command::new("cmd")
            .args(["/C", "start", "cmd", "/K", &format!("cd /d {}", cwd_str)])
            .output()
            .map_err(|err| err.to_string())?;
        return Ok(());
    }

    #[cfg(target_os = "linux")]
    {
        let commands = [
            ("x-terminal-emulator", vec!["--working-directory", &cwd_str]),
            ("gnome-terminal", vec!["--working-directory", &cwd_str]),
            ("konsole", vec!["--workdir", &cwd_str]),
        ];

        for (program, args) in commands {
            if Command::new(program).args(args).output().is_ok() {
                return Ok(());
            }
        }

        return Err("No supported terminal emulator found".into());
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
        .invoke_handler(tauri::generate_handler![run_forge_cli, open_terminal_here, open_target])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
