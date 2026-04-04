use sqlx::{sqlite::SqlitePoolOptions, Pool, Sqlite};
use tauri::AppHandle;
use tauri::Manager;

pub mod commands;
pub mod models;

pub struct Database {
    pub pool: Pool<Sqlite>,
}

impl Database {
    pub async fn new(app_handle: &AppHandle) -> Result<Self, sqlx::Error> {
        let app_dir = app_handle.path().app_data_dir().expect("Failed to get app data directory");

        std::fs::create_dir_all(&app_dir).expect("Failed to create app data directory");

        let db_path = app_dir.join("rune_api.db");
        let database_url = format!("sqlite:{}?mode=rwc", db_path.to_str().unwrap());

        let pool = SqlitePoolOptions::new().max_connections(5).connect(&database_url).await?;

        // Run migrations
        Self::run_migrations(&pool).await?;

        Ok(Self { pool })
    }

    async fn run_migrations(pool: &Pool<Sqlite>) -> Result<(), sqlx::Error> {
        // Create tables if they don't exist
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS collections (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                color TEXT,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            )
            "#,
        )
        .execute(pool)
        .await?;

        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS folders (
                id TEXT PRIMARY KEY,
                collection_id TEXT NOT NULL,
                name TEXT NOT NULL,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL,
                FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE
            )
            "#,
        )
        .execute(pool)
        .await?;

        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS requests (
                id TEXT PRIMARY KEY,
                collection_id TEXT,
                folder_id TEXT,
                name TEXT,
                method TEXT NOT NULL,
                url TEXT NOT NULL,
                headers TEXT NOT NULL DEFAULT '[]',
                body TEXT,
                body_type TEXT NOT NULL DEFAULT 'none',
                raw_content_type TEXT,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL,
                FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
                FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE
            )
            "#,
        )
        .execute(pool)
        .await?;

        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS environments (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                is_global INTEGER NOT NULL DEFAULT 0
            )
            "#,
        )
        .execute(pool)
        .await?;

        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS environment_variables (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                environment_id TEXT NOT NULL,
                key TEXT NOT NULL,
                value TEXT NOT NULL DEFAULT '',
                type TEXT NOT NULL DEFAULT 'default',
                FOREIGN KEY (environment_id) REFERENCES environments(id) ON DELETE CASCADE
            )
            "#,
        )
        .execute(pool)
        .await?;

        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS request_history (
                id TEXT PRIMARY KEY,
                request_id TEXT,
                request_method TEXT NOT NULL,
                request_url TEXT NOT NULL,
                request_headers TEXT NOT NULL DEFAULT '[]',
                request_body TEXT,
                request_body_type TEXT NOT NULL DEFAULT 'none',
                response_status INTEGER,
                response_status_text TEXT,
                response_headers TEXT NOT NULL DEFAULT '{}',
                response_body TEXT,
                response_content_type TEXT,
                response_size INTEGER,
                response_time INTEGER,
                executed_at INTEGER NOT NULL
            )
            "#,
        )
        .execute(pool)
        .await?;

        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS header_presets (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                headers TEXT NOT NULL DEFAULT '[]',
                is_builtin INTEGER NOT NULL DEFAULT 0,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            )
            "#,
        )
        .execute(pool)
        .await?;

        // Insert default presets if table is empty
        let count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM header_presets")
            .fetch_one(pool)
            .await?;

        if count == 0 {
            let now = chrono::Utc::now().timestamp_millis();
            let presets = vec![
                ("json_api", "JSON API", "Content-Type: application/json, Accept: application/json", "[{\"key\":\"Content-Type\",\"value\":\"application/json\",\"enabled\":true},{\"key\":\"Accept\",\"value\":\"application/json\",\"enabled\":true}]"),
                ("auth_bearer", "Auth Bearer", "Authorization header with Bearer token", "[{\"key\":\"Authorization\",\"value\":\"Bearer {{token}}\",\"enabled\":true}]"),
                ("form_data", "Form Data", "Content-Type for multipart/form-data", "[{\"key\":\"Content-Type\",\"value\":\"multipart/form-data\",\"enabled\":true}]"),
            ];

            for (id, name, desc, headers) in presets {
                sqlx::query(
                    "INSERT INTO header_presets (id, name, description, headers, is_builtin, created_at, updated_at) VALUES (?, ?, ?, ?, 1, ?, ?)"
                )
                .bind(id)
                .bind(name)
                .bind(desc)
                .bind(headers)
                .bind(now)
                .bind(now)
                .execute(pool)
                .await?;
            }
        }

        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS app_settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            )
            "#,
        )
        .execute(pool)
        .await?;

        Ok(())
    }
}
