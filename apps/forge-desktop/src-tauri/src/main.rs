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

fn bundled_repo_root(app: &AppHandle) -> Option<PathBuf> {
    let resource_dir = app.path().resource_dir().ok()?;
    let cli_path = resource_dir.join("packages/forge-cli/bin/forge.js");
    if cli_path.exists() {
        Some(resource_dir)
    } else {
        None
    }
}

fn resolve_repo_root(app: &AppHandle) -> PathBuf {
    bundled_repo_root(app).unwrap_or_else(source_repo_root)
}

fn apply_windows_no_window(_command: &mut Command) {
    #[cfg(target_os = "windows")]
    _command.creation_flags(CREATE_NO_WINDOW);
}

#[tauri::command]
fn run_forge_cli(app: AppHandle, args: Vec<String>, cwd: Option<String>) -> Result<String, String> {
    let current_dir = resolve_cwd(cwd);
    let repo_root = resolve_repo_root(&app);
    let cli_path = repo_root.join("packages/forge-cli/bin/forge.js");

    if !cli_path.exists() {
        return Err(format!("Forge CLI not found: {}", cli_path.display()));
    }

    let mut command = Command::new("node");
    command
        .arg(&cli_path)
        .args(args)
        .current_dir(current_dir)
        .env("FORGE_REPO_ROOT", &repo_root);

    if let Ok(cache_dir) = app.path().app_cache_dir() {
        command.env("FORGE_CACHE_ROOT", cache_dir.join("forge-cli"));
    }

    apply_windows_no_window(&mut command);

    let output = command.output().map_err(|err| {
        if err.kind() == std::io::ErrorKind::NotFound {
            "Node.js runtime not found. Install Node.js 18+ to use Forge desktop actions.".to_string()
        } else {
            err.to_string()
        }
    })?;

    let stdout = String::from_utf8_lossy(&output.stdout);
    let stderr = String::from_utf8_lossy(&output.stderr);

    if output.status.success() {
        Ok(stdout.to_string())
    } else {
        Err(format!("{}{}", stdout, stderr))
    }
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
