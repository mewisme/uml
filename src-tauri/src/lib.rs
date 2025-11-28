use tauri::Manager;

mod files;
mod git;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let salt_path = app
                .path()
                .app_local_data_dir()
                .expect("Failed to get app local data dir")
                .join("salt");
            app.handle()
                .plugin(tauri_plugin_stronghold::Builder::with_argon2(&salt_path).build())?;
            Ok(())
        })
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            files::list_dir,
            files::read_file_content,
            files::write_file_content,
            files::create_directory,
            files::create_file,
            files::delete_node,
            files::rename_node,
            git::get_current_branch,
            git::get_all_branches,
            git::switch_branch,
            git::get_git_status,
            git::is_git_repo,
            git::init_git_repo,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
