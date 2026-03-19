use crate::models::{
    ActionPayload, ActionResult, AppStatePayload, BootstrapResultData, DetectionItem, DoctorReport,
    ExternalMcpInstallPayload, ExternalRegistrySource, ExternalSearchPayload,
    ExternalSkillInstallPayload, RuntimeStatus, SupportItem,
};
use serde_json::{json, Value};
use std::collections::{BTreeMap, HashMap};
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use tauri::{AppHandle, Manager};

#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

#[cfg(target_os = "windows")]
const CREATE_NO_WINDOW: u32 = 0x08000000;

const CLIENTS: [&str; 3] = ["claude", "codex", "gemini"];
const EXTERNAL_CACHE_TTL_MS: u64 = 6 * 60 * 60 * 1000;

#[derive(Debug, Clone)]
struct ExecOutput {
    status: i32,
    stdout: String,
    stderr: String,
}

#[derive(Debug, Clone)]
struct DesktopPaths {
    repo_root: PathBuf,
    preview_root: PathBuf,
    cache_root: PathBuf,
}

pub fn get_app_state(app: &AppHandle) -> Result<ActionResult<AppStatePayload>, String> {
    let paths = desktop_paths(app)?;
    let report = build_doctor_report(&paths)?;
    let runtime = build_runtime_status(&paths);
    let summary = format!(
        "Preview runtime ready. Repo: {}. Preview home: {}.",
        paths.repo_root.display(),
        paths.preview_root.display()
    );

    Ok(ActionResult {
        ok: true,
        summary: summary.clone(),
        details: vec![
            format!("repo_root={}", paths.repo_root.display()),
            format!("preview_root={}", paths.preview_root.display()),
        ],
        warnings: runtime_warnings(&runtime),
        raw: summary,
        data: Some(AppStatePayload { report, runtime }),
    })
}

pub fn install_client_config(
    app: &AppHandle,
    payload: ActionPayload,
) -> Result<ActionResult<Value>, String> {
    let paths = desktop_paths(app)?;
    let output = match payload.client.as_str() {
        "claude" => install_claude_preview(&paths, &payload, false)?,
        "codex" | "gemini" => run_backend_install_script(&paths, &payload, false)?,
        other => return Err(format!("Unsupported client: {other}")),
    };
    Ok(action_from_exec(
        output.status == 0,
        format!("Installed {} preview configuration.", payload.client),
        output,
        None,
    ))
}

pub fn repair_client_config(
    app: &AppHandle,
    payload: ActionPayload,
) -> Result<ActionResult<Value>, String> {
    let paths = desktop_paths(app)?;
    let output = match payload.client.as_str() {
        "claude" => install_claude_preview(&paths, &payload, true)?,
        "codex" | "gemini" => run_backend_install_script(&paths, &payload, true)?,
        other => return Err(format!("Unsupported client: {other}")),
    };
    Ok(action_from_exec(
        output.status == 0,
        format!("Repaired {} preview configuration.", payload.client),
        output,
        None,
    ))
}

pub fn verify_client_config(
    app: &AppHandle,
    payload: ActionPayload,
) -> Result<ActionResult<Value>, String> {
    let paths = desktop_paths(app)?;
    let output = run_verify_script(&paths, payload.client.as_str())?;
    Ok(action_from_exec(
        output.status == 0,
        format!("Verified {} preview configuration.", payload.client),
        output,
        None,
    ))
}

pub fn bootstrap_official_client(
    _app: &AppHandle,
    client: String,
) -> Result<ActionResult<BootstrapResultData>, String> {
    let meta = official_client_meta(&client).ok_or_else(|| format!("Unsupported client: {client}"))?;
    let detected_before = command_exists(meta.command);
    if detected_before {
        let data = BootstrapResultData {
            client: client.clone(),
            detected: true,
            changed: false,
            package_name: meta.package_name.to_string(),
            command: meta.command.to_string(),
        };
        return Ok(ActionResult {
            ok: true,
            summary: format!("{client} is already installed."),
            details: vec![format!("command={}", meta.command)],
            warnings: vec![],
            raw: format!("{client} is already installed."),
            data: Some(data),
        });
    }

    if !command_exists("npm") && !cfg!(target_os = "windows") {
        return Ok(ActionResult {
            ok: false,
            summary: "npm is not available. Install Node.js with npm first.".into(),
            details: vec![],
            warnings: vec![],
            raw: "npm is not available. Install Node.js with npm first.".into(),
            data: Some(BootstrapResultData {
                client,
                detected: false,
                changed: false,
                package_name: meta.package_name.to_string(),
                command: meta.command.to_string(),
            }),
        });
    }

    let output = run_npm_global_install(meta.package_name)?;
    let detected_after = command_exists(meta.command);
    let ok = output.status == 0 && detected_after;
    Ok(action_from_exec(
        ok,
        if ok {
            format!("Installed official {client} client.")
        } else {
            format!("Failed to install official {client} client.")
        },
        output,
        Some(BootstrapResultData {
            client,
            detected: detected_after,
            changed: true,
            package_name: meta.package_name.to_string(),
            command: meta.command.to_string(),
        }),
    ))
}

pub fn load_builtin_mcp_secrets(
    app: &AppHandle,
) -> Result<ActionResult<HashMap<String, String>>, String> {
    let path = builtin_secrets_path(app)?;
    let values = if path.exists() {
        let text = fs::read_to_string(&path).map_err(|err| err.to_string())?;
        serde_json::from_str::<HashMap<String, String>>(&text).unwrap_or_default()
    } else {
        HashMap::new()
    };

    Ok(ActionResult {
        ok: true,
        summary: "Loaded built-in MCP secrets.".into(),
        details: vec![format!("path={}", path.display())],
        warnings: vec![],
        raw: serde_json::to_string_pretty(&values).unwrap_or_else(|_| "{}".into()),
        data: Some(values),
    })
}

pub fn save_builtin_mcp_secrets(
    app: &AppHandle,
    values: HashMap<String, String>,
) -> Result<ActionResult<HashMap<String, String>>, String> {
    let path = builtin_secrets_path(app)?;
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|err| err.to_string())?;
    }
    let normalized = normalize_secret_map(values);
    fs::write(
        &path,
        serde_json::to_string_pretty(&normalized).map_err(|err| err.to_string())?,
    )
    .map_err(|err| err.to_string())?;

    Ok(ActionResult {
        ok: true,
        summary: "Saved built-in MCP secrets.".into(),
        details: vec![format!("path={}", path.display())],
        warnings: vec![],
        raw: serde_json::to_string_pretty(&normalized).unwrap_or_else(|_| "{}".into()),
        data: Some(normalized),
    })
}

pub fn search_external_skills(
    app: &AppHandle,
    query: String,
) -> Result<ActionResult<ExternalSearchPayload>, String> {
    let paths = desktop_paths(app)?;
    let sources = load_registry_sources(&paths, "skills")?;
    let results = read_external_cache(&paths, "skills", &query).unwrap_or_else(|| {
        let data = search_external_skills_live(&query).unwrap_or_default();
        let _ = write_external_cache(&paths, "skills", &query, &serde_json::to_value(&data).unwrap_or(Value::Null));
        data
    });

    let payload = ExternalSearchPayload {
        kind: "skills".into(),
        query,
        sources,
        results,
    };
    Ok(ActionResult {
        ok: true,
        summary: "Loaded external skill search results.".into(),
        details: vec![],
        warnings: vec![],
        raw: serde_json::to_string_pretty(&payload).unwrap_or_default(),
        data: Some(payload),
    })
}

pub fn search_external_mcp(
    app: &AppHandle,
    query: String,
) -> Result<ActionResult<ExternalSearchPayload>, String> {
    let paths = desktop_paths(app)?;
    let sources = load_registry_sources(&paths, "mcp")?;
    let results = read_external_cache(&paths, "mcp", &query).unwrap_or_else(|| {
        let data = search_external_mcp_live(&paths, &query).unwrap_or_default();
        let _ = write_external_cache(&paths, "mcp", &query, &serde_json::to_value(&data).unwrap_or(Value::Null));
        data
    });

    let payload = ExternalSearchPayload {
        kind: "mcp".into(),
        query,
        sources,
        results,
    };
    Ok(ActionResult {
        ok: true,
        summary: "Loaded external MCP search results.".into(),
        details: vec![],
        warnings: vec![],
        raw: serde_json::to_string_pretty(&payload).unwrap_or_default(),
        data: Some(payload),
    })
}

pub fn install_external_skill(
    app: &AppHandle,
    payload: ExternalSkillInstallPayload,
) -> Result<ActionResult<Value>, String> {
    let paths = desktop_paths(app)?;
    let temp_root = unique_temp_dir("forge-ext-skill");
    fs::create_dir_all(&temp_root).map_err(|err| err.to_string())?;

    let output = run_command_capture(
        command_program("npx"),
        &["-y", "skills", "add", payload.source.as_str(), "--skill", payload.skill.as_str(), "--agent", "codex", "-y", "--copy"],
        &[],
        Some(&temp_root),
    )?;

    if output.status != 0 {
        let _ = fs::remove_dir_all(&temp_root);
        return Ok(action_from_exec(
            false,
            format!("Failed to install external skill {}.", payload.skill),
            output,
            None,
        ));
    }

    let installed_dir = temp_root.join(".agents").join("skills").join(&payload.skill);
    if !installed_dir.exists() {
        let _ = fs::remove_dir_all(&temp_root);
        return Ok(ActionResult {
            ok: false,
            summary: format!("Installed skill directory not found for {}.", payload.skill),
            details: vec![format!("expected={}", installed_dir.display())],
            warnings: vec![],
            raw: format!("Installed skill directory not found: {}", installed_dir.display()),
            data: None,
        });
    }

    let target_dir = preview_client_home(&paths.preview_root, &payload.client).join("skills").join(&payload.skill);
    copy_dir_full(&installed_dir, &target_dir)?;
    let _ = fs::remove_dir_all(&temp_root);

    Ok(ActionResult {
        ok: true,
        summary: format!("Installed external skill {}.", payload.skill),
        details: vec![format!("target_dir={}", target_dir.display())],
        warnings: vec![],
        raw: format!(
            "{}\n{}",
            output.stdout.trim(),
            target_dir.display()
        )
        .trim()
        .to_string(),
        data: Some(json!({
            "client": payload.client,
            "skill": payload.skill,
            "source": payload.source,
            "targetDir": target_dir,
        })),
    })
}

pub fn install_external_mcp(
    app: &AppHandle,
    payload: ExternalMcpInstallPayload,
) -> Result<ActionResult<Value>, String> {
    let paths = desktop_paths(app)?;
    let python = resolve_python_binary();
    let Some(python) = python else {
        return Ok(ActionResult {
            ok: false,
            summary: "Python runtime is not available.".into(),
            details: vec![],
            warnings: vec![],
            raw: "Python runtime is not available.".into(),
            data: None,
        });
    };

    let script = paths.repo_root.join("scripts").join("install-external-mcp.py");
    let args_json = serde_json::to_string(&payload.spec.args).map_err(|err| err.to_string())?;
    let env_json = serde_json::to_string(&payload.spec.env.unwrap_or_default()).map_err(|err| err.to_string())?;
    let claude_home = preview_client_home(&paths.preview_root, "claude");
    let codex_config = preview_client_home(&paths.preview_root, "codex").join("config.toml");
    let gemini_home = preview_client_home(&paths.preview_root, "gemini");

    let args = vec![
        script.display().to_string(),
        "--client".into(),
        payload.client.clone(),
        "--name".into(),
        payload.spec.name.clone(),
        "--command".into(),
        payload.spec.command.clone(),
        "--args-json".into(),
        args_json,
        "--env-json".into(),
        env_json,
        "--claude-home".into(),
        claude_home.display().to_string(),
        "--codex-config".into(),
        codex_config.display().to_string(),
        "--gemini-home".into(),
        gemini_home.display().to_string(),
    ];

    let output = run_command_capture(&python, &args.iter().map(String::as_str).collect::<Vec<_>>(), &preview_env(&paths.preview_root, &payload.client), None)?;
    Ok(action_from_exec(
        output.status == 0,
        format!("Installed external MCP {}.", payload.spec.name),
        output,
        Some(json!({
            "client": payload.client,
            "name": payload.spec.name,
        })),
    ))
}

fn desktop_paths(app: &AppHandle) -> Result<DesktopPaths, String> {
    let repo_root = resolve_repo_root(app)?;
    let preview_root = app
        .path()
        .app_data_dir()
        .map_err(|err| err.to_string())?
        .join("preview-home");
    let cache_root = app
        .path()
        .app_cache_dir()
        .map_err(|err| err.to_string())?
        .join("desktop-runtime");
    fs::create_dir_all(&preview_root).map_err(|err| err.to_string())?;
    fs::create_dir_all(&cache_root).map_err(|err| err.to_string())?;

    Ok(DesktopPaths {
        repo_root,
        preview_root,
        cache_root,
    })
}

fn resolve_repo_root(app: &AppHandle) -> Result<PathBuf, String> {
    for candidate in candidate_repo_roots(app) {
        if is_repo_root(&candidate) {
            return Ok(candidate);
        }
    }
    Err("Forge desktop resources not found.".into())
}

fn candidate_repo_roots(app: &AppHandle) -> Vec<PathBuf> {
    let mut candidates = Vec::new();
    if let Some(value) = std::env::var_os("FORGE_DESKTOP_REPO_ROOT") {
        candidates.push(PathBuf::from(value));
    }

    let source_root = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../..");
    if cfg!(debug_assertions) {
        candidates.push(source_root.clone());
    }

    if let Ok(resource_dir) = app.path().resource_dir() {
        candidates.push(resource_dir);
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

    if !cfg!(debug_assertions) {
        candidates.push(source_root);
    }
    candidates
}

fn is_repo_root(path: &Path) -> bool {
    path.join("core").join("mcp-servers.json").exists()
        && path.join("core").join("capability-matrix.json").exists()
        && path.join("scripts").join("forge_core.py").exists()
}

fn build_doctor_report(paths: &DesktopPaths) -> Result<DoctorReport, String> {
    let capability_matrix = read_json_value(&paths.repo_root.join("core").join("capability-matrix.json"))?;
    let detection = CLIENTS
        .iter()
        .map(|client| detect_client(&paths.preview_root, client))
        .collect::<Vec<_>>();
    let support = CLIENTS
        .iter()
        .map(|client| verify_support(paths, client))
        .collect::<Vec<_>>();

    Ok(DoctorReport {
        detection,
        capability_matrix,
        support,
    })
}

fn build_runtime_status(paths: &DesktopPaths) -> RuntimeStatus {
    RuntimeStatus {
        node_available: command_exists("node"),
        npm_available: command_exists("npm"),
        python_available: resolve_python_binary().is_some(),
        git_available: command_exists("git"),
        repo_root: paths.repo_root.display().to_string(),
        preview_root: paths.preview_root.display().to_string(),
        isolated: true,
    }
}

fn runtime_warnings(runtime: &RuntimeStatus) -> Vec<String> {
    let mut warnings = Vec::new();
    if !runtime.node_available {
        warnings.push("Node.js is not available; skills and some MCP runtimes may fail.".into());
    }
    if !runtime.python_available {
        warnings.push("Python is not available; MCP configuration helpers may fail.".into());
    }
    if !runtime.git_available {
        warnings.push("git is not available; some generated environments may be incomplete.".into());
    }
    warnings
}

fn detect_client(preview_root: &Path, client: &str) -> DetectionItem {
    let home = preview_client_home(preview_root, client);
    let marker = match client {
        "claude" => home.join("CLAUDE.md"),
        "codex" => home.join("AGENTS.md"),
        "gemini" => home.join("GEMINI.md"),
        _ => home.join(".unknown"),
    };

    let command_available = command_exists(client_command(client));
    DetectionItem {
        name: client.into(),
        home: home.display().to_string(),
        home_label: format!("Preview · {}", home.display()),
        detected: command_available,
        configured: marker.exists(),
        home_exists: home.exists(),
        command_available,
    }
}

fn verify_support(paths: &DesktopPaths, client: &str) -> SupportItem {
    match run_verify_script(paths, client) {
        Ok(output) => SupportItem {
            client: client.into(),
            ok: output.status == 0,
            exit_code: output.status,
            stdout: output.stdout,
            stderr: output.stderr,
        },
        Err(error) => SupportItem {
            client: client.into(),
            ok: false,
            exit_code: 1,
            stdout: String::new(),
            stderr: error,
        },
    }
}

fn run_verify_script(paths: &DesktopPaths, client: &str) -> Result<ExecOutput, String> {
    let script = verify_script_path(paths, client)?;
    let client_home = preview_client_home(&paths.preview_root, client);
    let mut env = preview_env(&paths.preview_root, client);
    match client {
        "claude" => {
            env.push(("CLAUDE_HOME".into(), client_home.display().to_string()));
        }
        "codex" => {
            env.push(("CODEX_HOME".into(), client_home.display().to_string()));
        }
        "gemini" => {
            env.push(("GEMINI_HOME".into(), client_home.display().to_string()));
        }
        _ => {}
    }

    run_script_capture(&script, &env)
}

fn verify_script_path(paths: &DesktopPaths, client: &str) -> Result<PathBuf, String> {
    let path = match client {
        "claude" => {
            if cfg!(target_os = "windows") {
                paths.repo_root.join("scripts").join("verify.ps1")
            } else {
                paths.repo_root.join("scripts").join("verify.sh")
            }
        }
        "codex" => {
            if cfg!(target_os = "windows") {
                paths.repo_root.join("codex").join("scripts").join("verify-codex.ps1")
            } else {
                paths.repo_root.join("codex").join("scripts").join("verify-codex.sh")
            }
        }
        "gemini" => {
            if cfg!(target_os = "windows") {
                paths.repo_root.join("gemini").join("scripts").join("verify-gemini.ps1")
            } else {
                paths.repo_root.join("gemini").join("scripts").join("verify-gemini.sh")
            }
        }
        _ => return Err(format!("Unsupported client: {client}")),
    };
    Ok(path)
}

fn install_claude_preview(
    paths: &DesktopPaths,
    payload: &ActionPayload,
    repair_mode: bool,
) -> Result<ExecOutput, String> {
    let claude_home = preview_client_home(&paths.preview_root, "claude");
    fs::create_dir_all(&claude_home).map_err(|err| err.to_string())?;

    let mode = if repair_mode { "incremental" } else { "full" };
    for file in ["CLAUDE.md", "CAPABILITIES.md", "USAGE-GUIDE.md", "AGENTS.md", "GUIDE.md"] {
        let src = paths.repo_root.join(file);
        let dest = claude_home.join(file);
        if src.exists() {
            copy_file_mode(&src, &dest, mode == "full")?;
        }
    }

    for dir in ["agents", "commands", "contexts", "rules", "stacks", "hooks", "scripts"] {
        let src = paths.repo_root.join(dir);
        let dest = claude_home.join(dir);
        if src.exists() {
            copy_dir_mode(&src, &dest, mode)?;
        }
    }

    ensure_settings_defaults(
        &paths.repo_root.join("settings.json.template"),
        &claude_home.join("settings.json.template"),
        &claude_home.join("settings.json"),
        mode,
    )?;
    render_hooks_template(&claude_home)?;
    ensure_claude_learning_dirs(&claude_home)?;

    if payload.components.iter().any(|item| item == "memory") {
        scaffold_workspace_memory(&claude_home, payload.cwd.as_deref().unwrap_or("."))?;
    } else {
        fs::create_dir_all(claude_home.join("skills").join("learned")).map_err(|err| err.to_string())?;
    }

    if payload.components.iter().any(|item| item == "skills") {
        sync_runtime_skills(paths, &claude_home.join("skills"), mode, &payload.skill_names)?;
    }

    let mut command_logs = Vec::new();
    if payload.components.iter().any(|item| item == "mcp") {
        if let Some(python) = resolve_python_binary() {
            let script = paths.repo_root.join("scripts").join("configure-claude-mcp.py");
            let mut args = vec![
                script.display().to_string(),
                "--claude-home".into(),
                claude_home.display().to_string(),
                "--install-uv".into(),
            ];
            if !payload.mcp_servers.is_empty() {
                args.push("--servers".into());
                args.push(payload.mcp_servers.join(","));
            }

            let output = run_command_capture(
                &python,
                &args.iter().map(String::as_str).collect::<Vec<_>>(),
                &[
                    ("FORGE_EXA_KEY".into(), String::new()),
                    (
                        "FORGE_SECRET_VALUES_BASE64".into(),
                        payload.secret_values_base64.clone().unwrap_or_default(),
                    ),
                ],
                None,
            )?;
            command_logs.push(output.stdout.clone());
            if output.status != 0 {
                return Ok(output);
            }
        } else {
            command_logs.push("Python runtime not available; skipped Claude MCP configuration.".into());
        }
    }

    let verify = run_verify_script(paths, "claude")?;
    let mut stdout = command_logs.join("\n");
    if !verify.stdout.trim().is_empty() {
        if !stdout.is_empty() {
            stdout.push('\n');
        }
        stdout.push_str(&verify.stdout);
    }

    Ok(ExecOutput {
        status: verify.status,
        stdout,
        stderr: verify.stderr,
    })
}

fn run_backend_install_script(
    paths: &DesktopPaths,
    payload: &ActionPayload,
    repair_mode: bool,
) -> Result<ExecOutput, String> {
    let script = backend_install_script(paths, payload.client.as_str())?;
    let install_mode = if repair_mode { "incremental" } else { "full" };
    let mut env = preview_env(&paths.preview_root, payload.client.as_str());
    env.extend(vec![
        ("FORGE_NONINTERACTIVE".into(), "1".into()),
        ("FORGE_SKIP_BACKUP".into(), if repair_mode { "1" } else { "0" }.into()),
        ("FORGE_INSTALL_MODE".into(), install_mode.into()),
        (
            "FORGE_LANG".into(),
            payload.lang.clone().unwrap_or_else(|| "zh".into()),
        ),
        ("FORGE_CONFIGURE_CODEX_MCP".into(), "1".into()),
        ("FORGE_COMPONENTS".into(), payload.components.join(",")),
        ("FORGE_MCP_SERVERS".into(), payload.mcp_servers.join(",")),
        ("FORGE_SKILLS".into(), payload.skill_names.join(",")),
        (
            "FORGE_SECRET_VALUES_BASE64".into(),
            payload.secret_values_base64.clone().unwrap_or_default(),
        ),
    ]);

    if payload.client == "codex" {
        env.push(("CODEX_HOME".into(), preview_client_home(&paths.preview_root, "codex").display().to_string()));
    }
    if payload.client == "gemini" {
        env.push(("GEMINI_HOME".into(), preview_client_home(&paths.preview_root, "gemini").display().to_string()));
    }

    run_script_capture(&script, &env)
}

fn backend_install_script(paths: &DesktopPaths, client: &str) -> Result<PathBuf, String> {
    let path = match client {
        "codex" => {
            if cfg!(target_os = "windows") {
                paths.repo_root.join("codex").join("scripts").join("backends").join("install-codex.ps1")
            } else {
                paths.repo_root.join("codex").join("scripts").join("backends").join("install-codex.sh")
            }
        }
        "gemini" => {
            if cfg!(target_os = "windows") {
                paths.repo_root.join("gemini").join("scripts").join("backends").join("install-gemini.ps1")
            } else {
                paths.repo_root.join("gemini").join("scripts").join("backends").join("install-gemini.sh")
            }
        }
        _ => return Err(format!("Unsupported backend install client: {client}")),
    };
    Ok(path)
}

fn sync_runtime_skills(
    paths: &DesktopPaths,
    target_skills_dir: &Path,
    mode: &str,
    selected_skills: &[String],
) -> Result<(), String> {
    fs::create_dir_all(target_skills_dir).map_err(|err| err.to_string())?;
    let node = resolve_node_binary()?;
    let script = paths.repo_root.join("scripts").join("sync-runtime-skills.cjs");
    let mut args = vec![
        script.display().to_string(),
        paths.repo_root.display().to_string(),
        target_skills_dir.display().to_string(),
        "--mode".into(),
        mode.into(),
    ];
    if !selected_skills.is_empty() {
        args.push("--selected".into());
        args.push(selected_skills.join(","));
    }
    let output = run_command_capture(&node, &args.iter().map(String::as_str).collect::<Vec<_>>(), &[], None)?;
    if output.status == 0 {
        Ok(())
    } else {
        Err(format!(
            "sync-runtime-skills failed: {}{}",
            output.stdout, output.stderr
        ))
    }
}

fn scaffold_workspace_memory(claude_home: &Path, cwd: &str) -> Result<(), String> {
    let project_dir = claude_home
        .join("projects")
        .join(workspace_slug(cwd))
        .join("memory");
    fs::create_dir_all(&project_dir).map_err(|err| err.to_string())?;
    let memory_path = project_dir.join("MEMORY.md");
    if !memory_path.exists() {
        fs::write(
            &memory_path,
            format!("# Workspace Memory\n\n- Workspace: `{cwd}`\n- Updated by: Forge Preview\n\n## Active Focus\n\n- (fill in current priorities)\n"),
        )
        .map_err(|err| err.to_string())?;
    }
    let project_memory_path = project_dir.join("PROJECT-MEMORY.md");
    if !project_memory_path.exists() {
        fs::write(
            &project_memory_path,
            "# Project Memory\n\n> Workspace summary and durable knowledge.\n\n## Overview\n\n- Scope:\n- Stack:\n- Current stage:\n",
        )
        .map_err(|err| err.to_string())?;
    }
    Ok(())
}

fn ensure_claude_learning_dirs(claude_home: &Path) -> Result<(), String> {
    for dir in [
        claude_home.join("homunculus").join("instincts").join("personal"),
        claude_home.join("homunculus").join("instincts").join("inherited"),
        claude_home.join("sessions"),
        claude_home.join("skills").join("learned"),
    ] {
        fs::create_dir_all(dir).map_err(|err| err.to_string())?;
    }
    Ok(())
}

fn ensure_settings_defaults(
    template_src: &Path,
    template_dest: &Path,
    settings_dest: &Path,
    mode: &str,
) -> Result<(), String> {
    if !template_src.exists() {
        return Ok(());
    }

    copy_file_mode(template_src, template_dest, true)?;
    let template_value = read_json_value(template_src)?;
    if mode == "full" || !settings_dest.exists() {
        fs::write(
            settings_dest,
            serde_json::to_string_pretty(&template_value).map_err(|err| err.to_string())?,
        )
        .map_err(|err| err.to_string())?;
        return Ok(());
    }

    let current_value = read_json_value(settings_dest).unwrap_or_else(|_| json!({}));
    let mut next = current_value.as_object().cloned().unwrap_or_default();
    let template = template_value.as_object().cloned().unwrap_or_default();

    if !next.contains_key("permissions") {
        if let Some(value) = template.get("permissions") {
            next.insert("permissions".into(), value.clone());
        }
    }
    if !next.contains_key("env") {
        if let Some(value) = template.get("env") {
            next.insert("env".into(), value.clone());
        }
    }

    fs::write(
        settings_dest,
        serde_json::to_string_pretty(&Value::Object(next)).map_err(|err| err.to_string())?,
    )
    .map_err(|err| err.to_string())?;
    Ok(())
}

fn render_hooks_template(claude_home: &Path) -> Result<(), String> {
    let template = claude_home.join("hooks").join("hooks.json.template");
    if !template.exists() {
        return Ok(());
    }
    let content = fs::read_to_string(&template).map_err(|err| err.to_string())?;
    let rendered = content.replace("{{CLAUDE_HOME}}", &claude_home.display().to_string().replace('\\', "\\\\"));
    fs::write(claude_home.join("hooks").join("hooks.json"), rendered).map_err(|err| err.to_string())?;
    Ok(())
}

fn load_registry_sources(paths: &DesktopPaths, kind: &str) -> Result<Vec<ExternalRegistrySource>, String> {
    let value = read_json_value(&paths.repo_root.join("core").join("registry-sources.json"))?;
    let items = value
        .get(kind)
        .and_then(Value::as_array)
        .cloned()
        .unwrap_or_default();

    items
        .into_iter()
        .map(|item| serde_json::from_value::<ExternalRegistrySource>(item).map_err(|err| err.to_string()))
        .collect()
}

fn search_external_skills_live(query: &str) -> Result<Vec<Value>, String> {
    let mut args = vec!["-y", "skills", "find"];
    if !query.trim().is_empty() {
        args.push(query);
    }
    let output = run_command_capture(command_program("npx"), &args, &[], None)?;
    if output.status != 0 {
        return Err(format!("skills search failed: {}{}", output.stdout, output.stderr));
    }

    Ok(parse_skills_find_output(&output.stdout))
}

fn search_external_mcp_live(paths: &DesktopPaths, query: &str) -> Result<Vec<Value>, String> {
    let mut url = format!("{}?limit=20", mcp_registry_api_url(paths)?);
    if !query.trim().is_empty() {
        url.push_str("&search=");
        url.push_str(&urlencoding::encode(query));
    }

    let response = ureq::get(&url)
        .set("accept", "application/json")
        .set("user-agent", "forge-desktop-preview/0.4.x")
        .call()
        .map_err(|err| err.to_string())?;
    let payload: Value = response.into_json().map_err(|err| err.to_string())?;
    let items = payload
        .get("servers")
        .and_then(Value::as_array)
        .cloned()
        .unwrap_or_default();

    Ok(dedupe_mcp_entries(
        items.into_iter().map(normalize_mcp_entry).collect::<Vec<_>>(),
    ))
}

fn mcp_registry_api_url(paths: &DesktopPaths) -> Result<String, String> {
    let value = read_json_value(&paths.repo_root.join("core").join("registry-sources.json"))?;
    value
        .get("mcp")
        .and_then(Value::as_array)
        .and_then(|items| items.iter().find(|item| item.get("id").and_then(Value::as_str) == Some("official-mcp-registry")))
        .and_then(|item| item.get("api"))
        .and_then(Value::as_str)
        .map(str::to_string)
        .ok_or_else(|| "Official MCP registry API source not found".to_string())
}

fn parse_skills_find_output(output: &str) -> Vec<Value> {
    let lines = strip_ansi(output)
        .lines()
        .map(str::trim)
        .filter(|line| !line.is_empty())
        .map(String::from)
        .collect::<Vec<_>>();

    let mut results = Vec::new();
    for index in 0..lines.len() {
        let line = &lines[index];
        let mut parts = line.split_whitespace().collect::<Vec<_>>();
        if parts.len() < 3 || !parts[0].contains('/') || !parts[0].contains('@') {
            continue;
        }

        let Some((source, skill)) = parts[0].split_once('@') else {
            continue;
        };
        let installs = parts.get(1).copied().unwrap_or_default();
        let url_line = lines
            .get(index + 1)
            .filter(|next| next.starts_with("└ "))
            .map(|next| next.trim_start_matches("└ ").trim().to_string())
            .unwrap_or_default();
        results.push(json!({
            "id": format!("{source}@{skill}"),
            "source": source,
            "skill": skill,
            "title": skill,
            "installs": installs,
            "url": url_line,
            "description": format!("来自 {source} 的外部 skill，可安装到当前客户端 skill 目录。"),
            "sourceLabel": "skills.sh",
            "trust": "curated-external",
            "kind": "skills",
            "installable": true,
        }));
        parts.clear();
    }
    results
}

fn normalize_mcp_entry(entry: Value) -> Value {
    let server = entry.get("server").cloned().unwrap_or(Value::Null);
    let official_status = entry
        .get("_meta")
        .and_then(|meta| meta.get("io.modelcontextprotocol.registry/official"))
        .and_then(|official| official.get("status"))
        .and_then(Value::as_str)
        .unwrap_or("unknown");
    let install_spec = build_npm_install_spec(&server);
    json!({
        "id": format!(
            "{}@{}",
            server.get("name").and_then(Value::as_str).unwrap_or("unknown"),
            server.get("version").and_then(Value::as_str).unwrap_or("latest")
        ),
        "name": server.get("name").and_then(Value::as_str).unwrap_or("unknown"),
        "title": server.get("title").and_then(Value::as_str).unwrap_or_else(|| server.get("name").and_then(Value::as_str).unwrap_or("unknown")),
        "description": server.get("description").and_then(Value::as_str).unwrap_or(""),
        "url": server
            .get("repository")
            .and_then(|repo| repo.get("url"))
            .and_then(Value::as_str)
            .or_else(|| server.get("websiteUrl").and_then(Value::as_str))
            .or_else(|| server.get("remotes").and_then(Value::as_array).and_then(|items| items.first()).and_then(|item| item.get("url")).and_then(Value::as_str))
            .unwrap_or(""),
        "sourceLabel": "Official MCP Registry",
        "kind": "mcp",
        "trust": "curated-external",
        "officialStatus": official_status,
        "installable": install_spec.is_some(),
        "installReason": if install_spec.is_some() { "npm-stdio" } else { "browse-only" },
        "requiredSecrets": install_spec
            .as_ref()
            .and_then(|item| item.get("requiredSecrets"))
            .cloned()
            .unwrap_or_else(|| json!([])),
        "installSpec": install_spec,
    })
}

fn build_npm_install_spec(server: &Value) -> Option<Value> {
    let packages = server.get("packages")?.as_array()?;
    for package in packages {
        let transport = package.get("transport")?.get("type")?.as_str()?;
        let registry_type = package.get("registryType")?.as_str()?;
        let runtime_hint = package.get("runtimeHint").and_then(Value::as_str).unwrap_or("npx");
        if transport == "stdio" && registry_type == "npm" && runtime_hint == "npx" {
            let identifier = package.get("identifier")?.as_str()?.to_string();
            let version = package
                .get("version")
                .and_then(Value::as_str)
                .map(|value| format!("@{value}"))
                .unwrap_or_default();
            let env = package
                .get("environmentVariables")
                .and_then(Value::as_array)
                .map(|items| {
                    let mut map = BTreeMap::new();
                    for item in items {
                        if let Some(name) = item.get("name").and_then(Value::as_str) {
                            map.insert(name.to_string(), String::new());
                        }
                    }
                    map
                })
                .unwrap_or_default();
            let required_secrets = package
                .get("environmentVariables")
                .and_then(Value::as_array)
                .map(|items| {
                    items
                        .iter()
                        .filter_map(|item| item.get("name").and_then(Value::as_str).map(str::to_string))
                        .collect::<Vec<_>>()
                })
                .unwrap_or_default();
            return Some(json!({
                "name": sanitize_name(server.get("name").and_then(Value::as_str).unwrap_or("unknown")),
                "transport": "stdio",
                "command": "npx",
                "args": ["-y", format!("{identifier}{version}")],
                "env": env,
                "requiredSecrets": required_secrets,
                "packageIdentifier": identifier,
            }));
        }
    }
    None
}

fn dedupe_mcp_entries(items: Vec<Value>) -> Vec<Value> {
    let mut grouped: BTreeMap<String, Value> = BTreeMap::new();
    for item in items {
        let key = sanitize_name(
            item.get("name")
                .and_then(Value::as_str)
                .or_else(|| item.get("title").and_then(Value::as_str))
                .or_else(|| item.get("id").and_then(Value::as_str))
                .unwrap_or("unknown"),
        );
        if let Some(current) = grouped.get(&key) {
            let current_installable = current.get("installable").and_then(Value::as_bool).unwrap_or(false);
            let next_installable = item.get("installable").and_then(Value::as_bool).unwrap_or(false);
            if !current_installable && next_installable {
                grouped.insert(key, item);
                continue;
            }
            if current_installable == next_installable {
                let current_id = current.get("id").and_then(Value::as_str).unwrap_or_default();
                let next_id = item.get("id").and_then(Value::as_str).unwrap_or_default();
                if compare_version_parts(version_parts(next_id), version_parts(current_id)) > 0 {
                    grouped.insert(key, item);
                }
            }
        } else {
            grouped.insert(key, item);
        }
    }
    grouped.into_values().collect()
}

fn version_parts(id: &str) -> Vec<i32> {
    let version = id.rsplit('@').next().unwrap_or_default();
    version
        .split('.')
        .filter_map(|item| item.parse::<i32>().ok())
        .collect()
}

fn compare_version_parts(left: Vec<i32>, right: Vec<i32>) -> i32 {
    let max = left.len().max(right.len());
    for index in 0..max {
        let a = *left.get(index).unwrap_or(&0);
        let b = *right.get(index).unwrap_or(&0);
        if a != b {
            return a - b;
        }
    }
    0
}

fn read_external_cache(paths: &DesktopPaths, kind: &str, query: &str) -> Option<Vec<Value>> {
    let file = external_cache_path(paths, kind, query);
    let text = fs::read_to_string(file).ok()?;
    let payload: Value = serde_json::from_str(&text).ok()?;
    let cached_at = payload.get("cachedAt").and_then(Value::as_u64)?;
    if now_millis().saturating_sub(cached_at) > EXTERNAL_CACHE_TTL_MS {
        return None;
    }
    payload
        .get("data")
        .and_then(Value::as_array)
        .cloned()
}

fn write_external_cache(
    paths: &DesktopPaths,
    kind: &str,
    query: &str,
    data: &Value,
) -> Result<(), String> {
    let file = external_cache_path(paths, kind, query);
    if let Some(parent) = file.parent() {
        fs::create_dir_all(parent).map_err(|err| err.to_string())?;
    }
    let payload = json!({
        "kind": kind,
        "query": query,
        "cachedAt": now_millis(),
        "data": data,
    });
    fs::write(file, serde_json::to_string_pretty(&payload).map_err(|err| err.to_string())?)
        .map_err(|err| err.to_string())
}

fn external_cache_path(paths: &DesktopPaths, kind: &str, query: &str) -> PathBuf {
    paths.cache_root
        .join("external-registry")
        .join(format!("{}-{}.json", sanitize_name(kind), sanitize_name(query)))
}

fn builtin_secrets_path(app: &AppHandle) -> Result<PathBuf, String> {
    Ok(app
        .path()
        .app_config_dir()
        .map_err(|err| err.to_string())?
        .join("builtin-mcp-secrets.json"))
}

fn action_from_exec<T: serde::Serialize>(
    ok: bool,
    summary: String,
    output: ExecOutput,
    data: Option<T>,
) -> ActionResult<T> {
    let raw = combine_output(&output);
    ActionResult {
        ok,
        summary,
        details: vec![format!("exit_code={}", output.status)],
        warnings: vec![],
        raw,
        data,
    }
}

fn combine_output(output: &ExecOutput) -> String {
    [output.stdout.trim(), output.stderr.trim()]
        .into_iter()
        .filter(|item| !item.is_empty())
        .collect::<Vec<_>>()
        .join("\n")
}

fn read_json_value(path: &Path) -> Result<Value, String> {
    let text = fs::read_to_string(path).map_err(|err| err.to_string())?;
    serde_json::from_str(&text).map_err(|err| err.to_string())
}

fn preview_client_home(preview_root: &Path, client: &str) -> PathBuf {
    preview_root.join(format!(".{client}"))
}

fn preview_env(preview_root: &Path, client: &str) -> Vec<(String, String)> {
    let mut env = vec![
        ("HOME".into(), preview_root.display().to_string()),
        ("USERPROFILE".into(), preview_root.display().to_string()),
        ("FORGE_DESKTOP_PREVIEW".into(), "1".into()),
    ];
    if client == "codex" {
        env.push(("CODEX_HOME".into(), preview_client_home(preview_root, "codex").display().to_string()));
    }
    if client == "gemini" {
        env.push(("GEMINI_HOME".into(), preview_client_home(preview_root, "gemini").display().to_string()));
    }
    if client == "claude" {
        env.push(("CLAUDE_HOME".into(), preview_client_home(preview_root, "claude").display().to_string()));
    }
    env
}

fn run_npm_global_install(package_name: &str) -> Result<ExecOutput, String> {
    #[cfg(target_os = "windows")]
    {
        return run_command_capture(
            "cmd",
            &["/C", "npm.cmd", "install", "-g", package_name],
            &[],
            None,
        );
    }

    #[cfg(not(target_os = "windows"))]
    {
        run_command_capture("npm", &["install", "-g", package_name], &[], None)
    }
}

fn command_program<'a>(command: &'a str) -> &'a str {
    #[cfg(target_os = "windows")]
    {
        if command == "npx" {
            return "npx.cmd";
        }
        if command == "npm" {
            return "npm.cmd";
        }
    }
    command
}

fn official_client_meta(client: &str) -> Option<OfficialClientMeta> {
    match client {
        "claude" => Some(OfficialClientMeta {
            package_name: "@anthropic-ai/claude-code",
            command: "claude",
        }),
        "codex" => Some(OfficialClientMeta {
            package_name: "@openai/codex",
            command: "codex",
        }),
        "gemini" => Some(OfficialClientMeta {
            package_name: "@google/gemini-cli",
            command: "gemini",
        }),
        _ => None,
    }
}

struct OfficialClientMeta {
    package_name: &'static str,
    command: &'static str,
}

fn command_exists(command: &str) -> bool {
    #[cfg(target_os = "windows")]
    let probe = ("where.exe", vec![command]);
    #[cfg(not(target_os = "windows"))]
    let probe = ("which", vec![command]);

    run_command_capture(probe.0, &probe.1, &[], None)
        .map(|output| output.status == 0 && !output.stdout.trim().is_empty())
        .unwrap_or(false)
}

fn resolve_python_binary() -> Option<String> {
    if command_exists("python3") {
        return Some(command_program("python3").into());
    }
    if command_exists("python") {
        return Some(command_program("python").into());
    }
    None
}

fn resolve_node_binary() -> Result<String, String> {
    if command_exists("node") {
        Ok(command_program("node").into())
    } else {
        Err("Node.js runtime not found. Install Node.js 18+.".into())
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

fn run_script_capture(script: &Path, env: &[(String, String)]) -> Result<ExecOutput, String> {
    #[cfg(target_os = "windows")]
    {
        let script_arg = script.display().to_string();
        run_command_capture(
            "powershell",
            &["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", &script_arg],
            env,
            None,
        )
    }

    #[cfg(not(target_os = "windows"))]
    {
        let script_arg = script.display().to_string();
        run_command_capture("bash", &[&script_arg], env, None)
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

fn apply_windows_no_window(_command: &mut Command) {
    #[cfg(target_os = "windows")]
    _command.creation_flags(CREATE_NO_WINDOW);
}

fn copy_file_mode(src: &Path, dest: &Path, overwrite: bool) -> Result<(), String> {
    if dest.exists() && !overwrite {
        return Ok(());
    }
    if let Some(parent) = dest.parent() {
        fs::create_dir_all(parent).map_err(|err| err.to_string())?;
    }
    fs::copy(src, dest).map_err(|err| err.to_string())?;
    Ok(())
}

fn copy_dir_mode(src: &Path, dest: &Path, mode: &str) -> Result<(), String> {
    if mode == "full" {
        copy_dir_full(src, dest)
    } else {
        copy_dir_incremental(src, dest)
    }
}

fn copy_dir_full(src: &Path, dest: &Path) -> Result<(), String> {
    if dest.exists() {
        fs::remove_dir_all(dest).map_err(|err| err.to_string())?;
    }
    copy_dir_recursive(src, dest, true)
}

fn copy_dir_incremental(src: &Path, dest: &Path) -> Result<(), String> {
    copy_dir_recursive(src, dest, false)
}

fn copy_dir_recursive(src: &Path, dest: &Path, overwrite: bool) -> Result<(), String> {
    fs::create_dir_all(dest).map_err(|err| err.to_string())?;
    for entry in fs::read_dir(src).map_err(|err| err.to_string())? {
        let entry = entry.map_err(|err| err.to_string())?;
        let src_path = entry.path();
        let dest_path = dest.join(entry.file_name());
        if entry.file_type().map_err(|err| err.to_string())?.is_dir() {
            copy_dir_recursive(&src_path, &dest_path, overwrite)?;
        } else if overwrite || !dest_path.exists() {
            copy_file_mode(&src_path, &dest_path, true)?;
        }
    }
    Ok(())
}

fn normalize_secret_map(values: HashMap<String, String>) -> HashMap<String, String> {
    values
        .into_iter()
        .map(|(key, value)| (key.trim().to_string(), value.trim().to_string()))
        .filter(|(key, value)| !key.is_empty() && !value.is_empty())
        .collect()
}

fn workspace_slug(cwd: &str) -> String {
    let mut slug = cwd.replace([':', '\\', '/'], "-");
    while slug.contains("--") {
        slug = slug.replace("--", "-");
    }
    slug.trim_start_matches('-').to_string()
}

fn strip_ansi(value: &str) -> String {
    let bytes = value.as_bytes();
    let mut result = String::new();
    let mut index = 0;
    while index < bytes.len() {
        if bytes[index] == 0x1B {
            index += 1;
            if index < bytes.len() && bytes[index] == b'[' {
                index += 1;
                while index < bytes.len() {
                    let byte = bytes[index];
                    index += 1;
                    if (0x40..=0x7E).contains(&byte) {
                        break;
                    }
                }
            }
            continue;
        }
        result.push(bytes[index] as char);
        index += 1;
    }
    result
}

fn sanitize_name(value: &str) -> String {
    let lower = value.trim().to_lowercase();
    let mut sanitized = String::new();
    let mut last_dash = false;
    for ch in lower.chars() {
        if ch.is_ascii_alphanumeric() {
            sanitized.push(ch);
            last_dash = false;
        } else if !last_dash {
            sanitized.push('-');
            last_dash = true;
        }
    }
    sanitized.trim_matches('-').chars().take(64).collect::<String>()
}

fn now_millis() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or(Duration::from_secs(0))
        .as_millis() as u64
}

fn unique_temp_dir(prefix: &str) -> PathBuf {
    std::env::temp_dir().join(format!("{prefix}-{}", now_millis()))
}
