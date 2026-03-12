use std::path::PathBuf;
use std::process::Command;

#[tauri::command]
fn run_forge_cli(args: Vec<String>, cwd: Option<String>) -> Result<String, String> {
    let current_dir = cwd
        .map(PathBuf::from)
        .unwrap_or_else(|| std::env::current_dir().unwrap_or_else(|_| PathBuf::from(".")));

    let repo_root = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../..");
    let cli_path = repo_root.join("packages/forge-cli/bin/forge.js");

    let output = Command::new("node")
        .arg(cli_path)
        .args(args)
        .current_dir(current_dir)
        .output()
        .map_err(|err| err.to_string())?;

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
    #[cfg(target_os = "macos")]
    {
        let escaped = shell_escape::escape(cwd.into());
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
            .args(["/C", "start", "cmd", "/K", &format!("cd /d {}", cwd)])
            .output()
            .map_err(|err| err.to_string())?;
        return Ok(());
    }

    #[cfg(target_os = "linux")]
    {
        let commands = [
            ("x-terminal-emulator", vec!["--working-directory", &cwd]),
            ("gnome-terminal", vec!["--working-directory", &cwd]),
            ("konsole", vec!["--workdir", &cwd]),
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
        Command::new("cmd")
            .args(["/C", "start", "", &target])
            .output()
            .map_err(|err| err.to_string())?;
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
