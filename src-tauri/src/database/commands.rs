use crate::database::models::*;
use crate::database::Database;
use base64::engine::general_purpose::STANDARD as BASE64;
use base64::Engine;
use serde_json;
use sqlx::{Pool, Row, Sqlite};
use tauri::State;

const SECRET_PREFIX: &str = "enc:v1:";

fn xor_cipher(data: &[u8], key: &[u8]) -> Vec<u8> {
    if key.is_empty() {
        return data.to_vec();
    }

    data.iter()
        .enumerate()
        .map(|(i, b)| b ^ key[i % key.len()])
        .collect()
}

async fn get_or_create_secret_key(pool: &Pool<Sqlite>) -> Result<Vec<u8>, String> {
    let existing: Option<String> = sqlx::query_scalar("SELECT value FROM app_settings WHERE key = ?")
        .bind("secret_encryption_key")
        .fetch_optional(pool)
        .await
        .map_err(|e| e.to_string())?;

    if let Some(value) = existing {
        return Ok(value.into_bytes());
    }

    let generated = uuid::Uuid::new_v4().to_string();
    sqlx::query("INSERT INTO app_settings (key, value) VALUES (?, ?)")
        .bind("secret_encryption_key")
        .bind(&generated)
        .execute(pool)
        .await
        .map_err(|e| e.to_string())?;

    Ok(generated.into_bytes())
}

fn encrypt_secret_value(value: &str, key: &[u8]) -> String {
    if value.is_empty() {
        return String::new();
    }

    let encrypted = xor_cipher(value.as_bytes(), key);
    format!("{}{}", SECRET_PREFIX, BASE64.encode(encrypted))
}

fn decrypt_secret_value(value: &str, key: &[u8]) -> String {
    if let Some(encoded) = value.strip_prefix(SECRET_PREFIX) {
        if let Ok(bytes) = BASE64.decode(encoded) {
            if let Ok(decrypted) = String::from_utf8(xor_cipher(&bytes, key)) {
                return decrypted;
            }
        }
    }

    value.to_string()
}

// Collection Commands
#[tauri::command]
pub async fn get_collections(db: State<'_, Database>) -> Result<Vec<Collection>, String> {
    sqlx::query_as::<_, Collection>("SELECT * FROM collections ORDER BY updated_at DESC")
        .fetch_all(&db.pool)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_collection(
    db: State<'_, Database>,
    req: CreateCollectionRequest,
) -> Result<Collection, String> {
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().timestamp_millis();

    sqlx::query(
        "INSERT INTO collections (id, name, description, color, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .bind(&id)
    .bind(&req.name)
    .bind(&req.description)
    .bind(&req.color)
    .bind(now)
    .bind(now)
    .execute(&db.pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(Collection {
        id,
        name: req.name,
        description: req.description,
        color: req.color,
        created_at: now,
        updated_at: now,
    })
}

#[tauri::command]
pub async fn update_collection(
    db: State<'_, Database>,
    id: String,
    req: CreateCollectionRequest,
) -> Result<(), String> {
    let now = chrono::Utc::now().timestamp_millis();

    sqlx::query(
        "UPDATE collections SET name = ?, description = ?, color = ?, updated_at = ? WHERE id = ?",
    )
    .bind(&req.name)
    .bind(&req.description)
    .bind(&req.color)
    .bind(now)
    .bind(&id)
    .execute(&db.pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn delete_collection(db: State<'_, Database>, id: String) -> Result<(), String> {
    sqlx::query("DELETE FROM collections WHERE id = ?")
        .bind(&id)
        .execute(&db.pool)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

// Folder Commands
#[tauri::command]
pub async fn get_folders(
    db: State<'_, Database>,
    collection_id: String,
) -> Result<Vec<Folder>, String> {
    sqlx::query_as::<_, Folder>(
        "SELECT * FROM folders WHERE collection_id = ? ORDER BY updated_at DESC",
    )
    .bind(&collection_id)
    .fetch_all(&db.pool)
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_folder(
    db: State<'_, Database>,
    req: CreateFolderRequest,
) -> Result<Folder, String> {
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().timestamp_millis();

    sqlx::query(
        "INSERT INTO folders (id, collection_id, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)"
    )
    .bind(&id)
    .bind(&req.collection_id)
    .bind(&req.name)
    .bind(now)
    .bind(now)
    .execute(&db.pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(Folder {
        id,
        collection_id: req.collection_id,
        name: req.name,
        created_at: now,
        updated_at: now,
    })
}

#[tauri::command]
pub async fn delete_folder(db: State<'_, Database>, id: String) -> Result<(), String> {
    sqlx::query("DELETE FROM folders WHERE id = ?")
        .bind(&id)
        .execute(&db.pool)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

// Request Commands
#[tauri::command]
pub async fn get_requests(
    db: State<'_, Database>,
    collection_id: Option<String>,
    folder_id: Option<String>,
) -> Result<Vec<Request>, String> {
    let rows = if let Some(fid) = folder_id {
        sqlx::query("SELECT * FROM requests WHERE folder_id = ? ORDER BY updated_at DESC")
            .bind(&fid)
            .fetch_all(&db.pool)
            .await
            .map_err(|e| e.to_string())?
    } else if let Some(cid) = collection_id {
        sqlx::query(
            "SELECT * FROM requests WHERE collection_id = ? AND folder_id IS NULL ORDER BY updated_at DESC"
        )
        .bind(&cid)
        .fetch_all(&db.pool)
        .await
        .map_err(|e| e.to_string())?
    } else {
        sqlx::query("SELECT * FROM requests ORDER BY updated_at DESC")
            .fetch_all(&db.pool)
            .await
            .map_err(|e| e.to_string())?
    };

    let mut requests = Vec::new();
    for row in rows {
        let headers_json: String = row.get("headers");
        let headers: Vec<HttpHeader> = serde_json::from_str(&headers_json).unwrap_or_default();

        requests.push(Request {
            id: row.get("id"),
            collection_id: row.get("collection_id"),
            folder_id: row.get("folder_id"),
            name: row.get("name"),
            method: row.get("method"),
            url: row.get("url"),
            headers,
            body: row.get("body"),
            body_type: row.get("body_type"),
            raw_content_type: row.get("raw_content_type"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        });
    }

    Ok(requests)
}

#[tauri::command]
pub async fn create_request(
    db: State<'_, Database>,
    req: CreateRequestRequest,
) -> Result<Request, String> {
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().timestamp_millis();
    let headers_json = serde_json::to_string(&req.headers).map_err(|e| e.to_string())?;

    sqlx::query(
        "INSERT INTO requests (id, collection_id, folder_id, name, method, url, headers, body, body_type, raw_content_type, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(&id)
    .bind(&req.collection_id)
    .bind(&req.folder_id)
    .bind(&req.name)
    .bind(&req.method)
    .bind(&req.url)
    .bind(&headers_json)
    .bind(&req.body)
    .bind(&req.body_type)
    .bind(&req.raw_content_type)
    .bind(now)
    .bind(now)
    .execute(&db.pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(Request {
        id,
        collection_id: req.collection_id,
        folder_id: req.folder_id,
        name: req.name,
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: req.body,
        body_type: req.body_type,
        raw_content_type: req.raw_content_type,
        created_at: now,
        updated_at: now,
    })
}

#[tauri::command]
pub async fn update_request(
    db: State<'_, Database>,
    id: String,
    req: CreateRequestRequest,
) -> Result<(), String> {
    let now = chrono::Utc::now().timestamp_millis();
    let headers_json = serde_json::to_string(&req.headers).map_err(|e| e.to_string())?;

    sqlx::query(
        "UPDATE requests SET name = ?, method = ?, url = ?, headers = ?, body = ?, body_type = ?, raw_content_type = ?, updated_at = ? WHERE id = ?"
    )
    .bind(&req.name)
    .bind(&req.method)
    .bind(&req.url)
    .bind(&headers_json)
    .bind(&req.body)
    .bind(&req.body_type)
    .bind(&req.raw_content_type)
    .bind(now)
    .bind(&id)
    .execute(&db.pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn delete_request(db: State<'_, Database>, id: String) -> Result<(), String> {
    sqlx::query("DELETE FROM requests WHERE id = ?")
        .bind(&id)
        .execute(&db.pool)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

// Environment Commands
#[tauri::command]
pub async fn get_environments(db: State<'_, Database>) -> Result<Vec<Environment>, String> {
    sqlx::query_as::<_, Environment>("SELECT * FROM environments ORDER BY name")
        .fetch_all(&db.pool)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_environment(
    db: State<'_, Database>,
    req: CreateEnvironmentRequest,
) -> Result<Environment, String> {
    let id = uuid::Uuid::new_v4().to_string();

    sqlx::query("INSERT INTO environments (id, name, is_global) VALUES (?, ?, ?)")
        .bind(&id)
        .bind(&req.name)
        .bind(if req.is_global { 1 } else { 0 })
        .execute(&db.pool)
        .await
        .map_err(|e| e.to_string())?;

    Ok(Environment {
        id,
        name: req.name,
        is_global: if req.is_global { 1 } else { 0 },
    })
}

#[tauri::command]
pub async fn delete_environment(db: State<'_, Database>, id: String) -> Result<(), String> {
    sqlx::query("DELETE FROM environments WHERE id = ?")
        .bind(&id)
        .execute(&db.pool)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn get_environment_variables(
    db: State<'_, Database>,
    environment_id: String,
) -> Result<Vec<EnvironmentVariable>, String> {
    let mut variables = sqlx::query_as::<_, EnvironmentVariable>(
        "SELECT * FROM environment_variables WHERE environment_id = ?",
    )
    .bind(&environment_id)
    .fetch_all(&db.pool)
    .await
    .map_err(|e| e.to_string())?;

    let key = get_or_create_secret_key(&db.pool).await?;
    variables.iter_mut().for_each(|var| {
        if var.var_type == "secret" {
            var.value = decrypt_secret_value(&var.value, &key);
        }
    });

    Ok(variables)
}

#[tauri::command]
pub async fn set_environment_variables(
    db: State<'_, Database>,
    environment_id: String,
    variables: Vec<EnvironmentVariable>,
) -> Result<(), String> {
    let key = get_or_create_secret_key(&db.pool).await?;
    let mut tx = db.pool.begin().await.map_err(|e| e.to_string())?;

    sqlx::query("DELETE FROM environment_variables WHERE environment_id = ?")
        .bind(&environment_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

    for var in variables {
        let stored_value = if var.var_type == "secret" {
            encrypt_secret_value(&var.value, &key)
        } else {
            var.value
        };

        sqlx::query(
            "INSERT INTO environment_variables (environment_id, key, value, type) VALUES (?, ?, ?, ?)"
        )
        .bind(&environment_id)
        .bind(&var.key)
        .bind(&stored_value)
        .bind(&var.var_type)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;
    }

    tx.commit().await.map_err(|e| e.to_string())?;

    Ok(())
}

// History Commands
#[tauri::command]
pub async fn get_history(
    db: State<'_, Database>,
    limit: i64,
) -> Result<Vec<RequestHistory>, String> {
    let rows = sqlx::query("SELECT * FROM request_history ORDER BY executed_at DESC LIMIT ?")
        .bind(limit)
        .fetch_all(&db.pool)
        .await
        .map_err(|e| e.to_string())?;

    let mut history = Vec::new();
    for row in rows {
        let request_headers_json: String = row.get("request_headers");
        let request_headers: Vec<HttpHeader> =
            serde_json::from_str(&request_headers_json).unwrap_or_default();

        let request = RequestData {
            method: row.get("request_method"),
            url: row.get("request_url"),
            headers: request_headers,
            body: row.get("request_body"),
            body_type: row.get("request_body_type"),
        };

        let response_status: Option<i64> = row.get("response_status");
        let response = if let Some(status) = response_status {
            let response_headers_json: String = row.get("response_headers");
            let response_headers: serde_json::Value =
                serde_json::from_str(&response_headers_json).unwrap_or_default();

            Some(ResponseData {
                status,
                status_text: row.get("response_status_text"),
                headers: response_headers,
                body: row.get("response_body"),
                content_type: row.get("response_content_type"),
                size: row.get("response_size"),
                time: row.get("response_time"),
            })
        } else {
            None
        };

        history.push(RequestHistory {
            id: row.get("id"),
            request_id: row.get("request_id"),
            request,
            response,
            executed_at: row.get("executed_at"),
        });
    }

    Ok(history)
}

#[tauri::command]
pub async fn add_history(db: State<'_, Database>, req: AddHistoryRequest) -> Result<(), String> {
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().timestamp_millis();

    let request_headers_json =
        serde_json::to_string(&req.request.headers).map_err(|e| e.to_string())?;

    if let Some(response) = req.response {
        let response_headers_json =
            serde_json::to_string(&response.headers).map_err(|e| e.to_string())?;

        sqlx::query(
            "INSERT INTO request_history (id, request_method, request_url, request_headers, request_body, request_body_type, 
             response_status, response_status_text, response_headers, response_body, response_content_type, response_size, response_time, executed_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        )
        .bind(&id)
        .bind(&req.request.method)
        .bind(&req.request.url)
        .bind(&request_headers_json)
        .bind(&req.request.body)
        .bind(&req.request.body_type)
        .bind(response.status)
        .bind(&response.status_text)
        .bind(&response_headers_json)
        .bind(&response.body)
        .bind(&response.content_type)
        .bind(response.size)
        .bind(response.time)
        .bind(now)
        .execute(&db.pool)
        .await
        .map_err(|e| e.to_string())?;
    } else {
        sqlx::query(
            "INSERT INTO request_history (id, request_method, request_url, request_headers, request_body, request_body_type, executed_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?)"
        )
        .bind(&id)
        .bind(&req.request.method)
        .bind(&req.request.url)
        .bind(&request_headers_json)
        .bind(&req.request.body)
        .bind(&req.request.body_type)
        .bind(now)
        .execute(&db.pool)
        .await
        .map_err(|e| e.to_string())?;
    }

    Ok(())
}

#[tauri::command]
pub async fn clear_history(db: State<'_, Database>) -> Result<(), String> {
    sqlx::query("DELETE FROM request_history")
        .execute(&db.pool)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn delete_history_entry(db: State<'_, Database>, id: String) -> Result<(), String> {
    sqlx::query("DELETE FROM request_history WHERE id = ?")
        .bind(&id)
        .execute(&db.pool)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

// Header Preset Commands
#[tauri::command]
pub async fn get_header_presets(db: State<'_, Database>) -> Result<Vec<HeaderPreset>, String> {
    let rows = sqlx::query("SELECT * FROM header_presets ORDER BY is_builtin DESC, name")
        .fetch_all(&db.pool)
        .await
        .map_err(|e| e.to_string())?;

    let mut presets = Vec::new();
    for row in rows {
        let headers_json: String = row.get("headers");
        let headers: Vec<HttpHeader> = serde_json::from_str(&headers_json).unwrap_or_default();

        presets.push(HeaderPreset {
            id: row.get("id"),
            name: row.get("name"),
            description: row.get("description"),
            headers,
            is_builtin: row.get("is_builtin"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        });
    }

    Ok(presets)
}

#[tauri::command]
pub async fn create_header_preset(
    db: State<'_, Database>,
    req: CreateHeaderPresetRequest,
) -> Result<HeaderPreset, String> {
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().timestamp_millis();
    let headers_json = serde_json::to_string(&req.headers).map_err(|e| e.to_string())?;

    sqlx::query(
        "INSERT INTO header_presets (id, name, description, headers, is_builtin, created_at, updated_at) VALUES (?, ?, ?, ?, 0, ?, ?)"
    )
    .bind(&id)
    .bind(&req.name)
    .bind(&req.description)
    .bind(&headers_json)
    .bind(now)
    .bind(now)
    .execute(&db.pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(HeaderPreset {
        id,
        name: req.name,
        description: req.description,
        headers: req.headers,
        is_builtin: 0,
        created_at: now,
        updated_at: now,
    })
}

#[tauri::command]
pub async fn update_header_preset(
    db: State<'_, Database>,
    id: String,
    req: CreateHeaderPresetRequest,
) -> Result<(), String> {
    let now = chrono::Utc::now().timestamp_millis();
    let headers_json = serde_json::to_string(&req.headers).map_err(|e| e.to_string())?;

    sqlx::query(
        "UPDATE header_presets SET name = ?, description = ?, headers = ?, updated_at = ? WHERE id = ? AND is_builtin = 0"
    )
    .bind(&req.name)
    .bind(&req.description)
    .bind(&headers_json)
    .bind(now)
    .bind(&id)
    .execute(&db.pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn delete_header_preset(db: State<'_, Database>, id: String) -> Result<(), String> {
    // Only delete non-builtin presets
    sqlx::query("DELETE FROM header_presets WHERE id = ? AND is_builtin = 0")
        .bind(&id)
        .execute(&db.pool)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_xor_cipher_basic() {
        let data = b"hello";
        let key = b"key";
        let encrypted = xor_cipher(data, key);
        assert_ne!(encrypted, data.to_vec());
        
        let decrypted = xor_cipher(&encrypted, key);
        assert_eq!(decrypted, data.to_vec());
    }

    #[test]
    fn test_xor_cipher_empty_key() {
        let data = b"hello";
        let key = b"";
        let result = xor_cipher(data, key);
        assert_eq!(result, data.to_vec());
    }

    #[test]
    fn test_xor_cipher_longer_key() {
        let data = b"hi";
        let key = b"longer_key";
        let encrypted = xor_cipher(data, key);
        let decrypted = xor_cipher(&encrypted, key);
        assert_eq!(decrypted, data.to_vec());
    }

    #[test]
    fn test_encrypt_secret_value_basic() {
        let key = b"testkey123";
        let value = "secret_password";
        let encrypted = encrypt_secret_value(value, key);
        
        assert!(encrypted.starts_with(SECRET_PREFIX));
        assert_ne!(encrypted, value);
    }

    #[test]
    fn test_encrypt_secret_value_empty() {
        let key = b"testkey";
        let encrypted = encrypt_secret_value("", key);
        assert_eq!(encrypted, "");
    }

    #[test]
    fn test_decrypt_secret_value_roundtrip() {
        let key = b"mysecretkey";
        let original = "my_secret_value_123";
        
        let encrypted = encrypt_secret_value(original, key);
        let decrypted = decrypt_secret_value(&encrypted, key);
        
        assert_eq!(decrypted, original);
    }

    #[test]
    fn test_decrypt_secret_value_without_prefix() {
        let key = b"testkey";
        let value = "plain_text";
        
        let result = decrypt_secret_value(value, key);
        assert_eq!(result, value);
    }

    #[test]
    fn test_decrypt_secret_value_invalid_base64() {
        let key = b"testkey";
        let invalid = format!("{}!!!invalid_base64!!!", SECRET_PREFIX);
        
        let result = decrypt_secret_value(&invalid, key);
        assert_eq!(result, invalid);
    }

    #[test]
    fn test_encrypt_decrypt_unicode() {
        let key = b"unicode_key";
        let value = "日本語テスト🔐";
        
        let encrypted = encrypt_secret_value(value, key);
        let decrypted = decrypt_secret_value(&encrypted, key);
        
        assert_eq!(decrypted, value);
    }

    #[test]
    fn test_secret_prefix_constant() {
        assert_eq!(SECRET_PREFIX, "enc:v1:");
    }
}
