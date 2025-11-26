#[cfg(windows)]
use std::os::windows::process::CommandExt;
use std::process::Command;
use tauri::command;

#[cfg(windows)]
const CREATE_NO_WINDOW: u32 = 0x08000000;

fn set_creation_flags(cmd: &mut Command) {
    #[cfg(windows)]
    {
        cmd.creation_flags(CREATE_NO_WINDOW);
    }
}

#[command]
pub fn get_current_branch(working_dir: String) -> Result<String, String> {
    let mut cmd = Command::new("git");
    set_creation_flags(&mut cmd);
    let output = cmd
        .current_dir(&working_dir)
        .args(["branch", "--show-current"])
        .output()
        .map_err(|e| format!("Failed to execute git command: {}", e))?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    let branch = String::from_utf8_lossy(&output.stdout).trim().to_string();

    Ok(branch)
}

#[command]
pub fn get_all_branches(working_dir: String) -> Result<Vec<String>, String> {
    let mut cmd = Command::new("git");
    set_creation_flags(&mut cmd);
    let output = cmd
        .current_dir(&working_dir)
        .args(["branch", "--list"])
        .output()
        .map_err(|e| format!("Failed to execute git command: {}", e))?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    let branches: Vec<String> = String::from_utf8_lossy(&output.stdout)
        .lines()
        .map(|line| {
            // Remove the "* " prefix from current branch and trim whitespace
            line.trim_start_matches("* ").trim().to_string()
        })
        .filter(|line| !line.is_empty())
        .collect();

    Ok(branches)
}

#[command]
pub fn switch_branch(working_dir: String, branch: String) -> Result<String, String> {
    let mut cmd = Command::new("git");
    set_creation_flags(&mut cmd);
    let output = cmd
        .current_dir(&working_dir)
        .args(["checkout", &branch])
        .output()
        .map_err(|e| format!("Failed to execute git command: {}", e))?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    Ok(format!("Switched to branch '{}'", branch))
}

#[command]
pub fn get_git_status(
    working_dir: String,
) -> Result<std::collections::HashMap<String, String>, String> {
    let mut cmd = Command::new("git");
    set_creation_flags(&mut cmd);
    let output = cmd
        .current_dir(&working_dir)
        .args(["status", "--short", "--porcelain"])
        .output()
        .map_err(|e| format!("Failed to execute git command: {}", e))?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    let mut status_map = std::collections::HashMap::new();

    for line in String::from_utf8_lossy(&output.stdout).lines() {
        if line.len() < 4 {
            continue;
        }

        // Git status format: XY filename
        // X = index status, Y = working tree status
        let status_code = &line[0..2];
        let relative_path = line[3..].trim();

        // Convert relative path to absolute path
        let absolute_path = if working_dir.ends_with('/') {
            format!("{}{}", working_dir, relative_path)
        } else {
            format!("{}/{}", working_dir, relative_path)
        };

        // Determine the status based on the code
        let status = match status_code.trim() {
            "M" | " M" | "MM" => "modified",
            "A" | "AM" => "added",
            "D" | " D" => "deleted",
            "R" => "renamed",
            "C" => "copied",
            "??" => "untracked",
            _ => "unknown",
        };

        status_map.insert(absolute_path, status.to_string());
    }

    Ok(status_map)
}

#[command]
pub fn is_git_repo(working_dir: String) -> Result<bool, String> {
    let mut cmd = Command::new("git");
    set_creation_flags(&mut cmd);
    let output = cmd
        .current_dir(&working_dir)
        .args(["rev-parse", "--is-inside-work-tree"])
        .output()
        .map_err(|e| format!("Failed to execute git command: {}", e))?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    let is_repo = String::from_utf8_lossy(&output.stdout).trim() == "true";

    Ok(is_repo)
}

#[command]
pub fn init_git_repo(working_dir: String) -> Result<bool, String> {
    let mut cmd = Command::new("git");
    set_creation_flags(&mut cmd);
    let output = cmd
        .current_dir(&working_dir)
        .args(["init"])
        .output()
        .map_err(|e| format!("Failed to execute git command: {}", e))?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    Ok(output.status.success())
}
