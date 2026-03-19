use std::fs;
use std::path::{Path, PathBuf};

fn walk_and_remove_stale_files(dir: &Path, names: &[&str], depth: usize) {
    if depth == 0 || !dir.exists() {
        return;
    }

    let entries = match fs::read_dir(dir) {
        Ok(entries) => entries,
        Err(_) => return,
    };

    for entry in entries.flatten() {
        let path = entry.path();
        if path.is_dir() {
            walk_and_remove_stale_files(&path, names, depth - 1);
            continue;
        }

        let file_name = path.file_name().and_then(|name| name.to_str()).unwrap_or("");
        if names.iter().any(|name| *name == file_name) {
            let _ = fs::remove_file(&path);
        }
    }
}

fn cleanup_stale_resource_scripts() {
    let out_dir = match std::env::var_os("OUT_DIR") {
        Some(value) => PathBuf::from(value),
        None => return,
    };

    let profile_dir = match out_dir.ancestors().nth(3) {
        Some(path) => path.to_path_buf(),
        None => return,
    };

    walk_and_remove_stale_files(
        &profile_dir,
        &["sync-runtime-skills.js", "check-runtime-skill-duplicates.js"],
        8,
    );
}

fn main() {
    println!("cargo:rerun-if-changed=src/main.rs");
    println!("cargo:rerun-if-changed=../../../scripts");
    println!("cargo:rerun-if-changed=../../../packages/forge-cli");
    cleanup_stale_resource_scripts();
    tauri_build::build()
}
