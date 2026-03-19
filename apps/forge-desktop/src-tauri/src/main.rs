#![cfg_attr(all(target_os = "windows", not(debug_assertions)), windows_subsystem = "windows")]

mod models;
mod services;

use std::path::PathBuf;
use std::process::Command;

use tauri::AppHandle;

#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

#[cfg(target_os = "windows")]
const CREATE_NO_WINDOW: u32 = 0x08000000;

#[tauri::command]
async fn get_app_state(app: AppHandle) -> Result<models::ActionResult<models::AppStatePayload>, String> {
    services::get_app_state(&app)
}

#[tauri::command]
async fn install_client_config(
    app: AppHandle,
    payload: models::ActionPayload,
) -> Result<models::ActionResult<serde_json::Value>, String> {
    services::install_client_config(&app, payload)
}

#[tauri::command]
async fn repair_client_config(
    app: AppHandle,
    payload: models::ActionPayload,
) -> Result<models::ActionResult<serde_json::Value>, String> {
    services::repair_client_config(&app, payload)
}

#[tauri::command]
async fn verify_client_config(
    app: AppHandle,
    payload: models::ActionPayload,
) -> Result<models::ActionResult<serde_json::Value>, String> {
    services::verify_client_config(&app, payload)
}

#[tauri::command]
async fn bootstrap_official_client(
    app: AppHandle,
    client: String,
) -> Result<models::ActionResult<models::BootstrapResultData>, String> {
    services::bootstrap_official_client(&app, client)
}

#[tauri::command]
async fn load_builtin_mcp_secrets(
    app: AppHandle,
) -> Result<models::ActionResult<std::collections::HashMap<String, String>>, String> {
    services::load_builtin_mcp_secrets(&app)
}

#[tauri::command]
async fn save_builtin_mcp_secrets(
    app: AppHandle,
    values: std::collections::HashMap<String, String>,
) -> Result<models::ActionResult<std::collections::HashMap<String, String>>, String> {
    services::save_builtin_mcp_secrets(&app, values)
}

#[tauri::command]
async fn search_external_skills(
    app: AppHandle,
    query: String,
) -> Result<models::ActionResult<models::ExternalSearchPayload>, String> {
    services::search_external_skills(&app, query)
}

#[tauri::command]
async fn search_external_mcp(
    app: AppHandle,
    query: String,
) -> Result<models::ActionResult<models::ExternalSearchPayload>, String> {
    services::search_external_mcp(&app, query)
}

#[tauri::command]
async fn install_external_skill(
    app: AppHandle,
    payload: models::ExternalSkillInstallPayload,
) -> Result<models::ActionResult<serde_json::Value>, String> {
    services::install_external_skill(&app, payload)
}

#[tauri::command]
async fn install_external_mcp(
    app: AppHandle,
    payload: models::ExternalMcpInstallPayload,
) -> Result<models::ActionResult<serde_json::Value>, String> {
    services::install_external_mcp(&app, payload)
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
fn apply_windows_no_window(_command: &mut Command) {
    #[cfg(target_os = "windows")]
    _command.creation_flags(CREATE_NO_WINDOW);
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
                &format!("tell application \"Terminal\" to do script \"cd {}\"", escaped),
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

        Err("No supported terminal emulator found".into())
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
            get_app_state,
            install_client_config,
            repair_client_config,
            verify_client_config,
            bootstrap_official_client,
            load_builtin_mcp_secrets,
            save_builtin_mcp_secrets,
            search_external_skills,
            search_external_mcp,
            install_external_skill,
            install_external_mcp,
            open_terminal_here,
            open_target
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
