use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Collection {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub color: Option<String>,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Folder {
    pub id: String,
    pub collection_id: String,
    pub name: String,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Request {
    pub id: String,
    pub collection_id: Option<String>,
    pub folder_id: Option<String>,
    pub name: Option<String>,
    pub method: String,
    pub url: String,
    pub headers: Vec<HttpHeader>,
    pub body: Option<String>,
    pub body_type: String,
    pub raw_content_type: Option<String>,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HttpHeader {
    pub key: String,
    pub value: String,
    pub enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Environment {
    pub id: String,
    pub name: String,
    pub is_global: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct EnvironmentVariable {
    pub id: i64,
    pub environment_id: String,
    pub key: String,
    pub value: String,
    pub var_type: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RequestHistory {
    pub id: String,
    pub request_id: Option<String>,
    pub request: RequestData,
    pub response: Option<ResponseData>,
    pub executed_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RequestData {
    pub method: String,
    pub url: String,
    pub headers: Vec<HttpHeader>,
    pub body: Option<String>,
    pub body_type: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResponseData {
    pub status: i64,
    pub status_text: String,
    pub headers: serde_json::Value,
    pub body: String,
    pub content_type: String,
    pub size: i64,
    pub time: i64,
}

// For creating collections
#[derive(Debug, Clone, Deserialize)]
pub struct CreateCollectionRequest {
    pub name: String,
    pub description: Option<String>,
    pub color: Option<String>,
}

// For creating folders
#[derive(Debug, Clone, Deserialize)]
pub struct CreateFolderRequest {
    pub collection_id: String,
    pub name: String,
}

// For creating requests
#[derive(Debug, Clone, Deserialize)]
pub struct CreateRequestRequest {
    pub collection_id: Option<String>,
    pub folder_id: Option<String>,
    pub name: Option<String>,
    pub method: String,
    pub url: String,
    pub headers: Vec<HttpHeader>,
    pub body: Option<String>,
    pub body_type: String,
    pub raw_content_type: Option<String>,
}

// For creating environments
#[derive(Debug, Clone, Deserialize)]
pub struct CreateEnvironmentRequest {
    pub name: String,
    pub is_global: bool,
}

// For adding history
#[derive(Debug, Clone, Deserialize)]
pub struct AddHistoryRequest {
    pub request: RequestData,
    pub response: Option<ResponseData>,
}

// For header presets
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct HeaderPreset {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub headers: Vec<HttpHeader>,
    pub is_builtin: i64,
    pub created_at: i64,
    pub updated_at: i64,
}

// For creating/updating header presets
#[derive(Debug, Clone, Deserialize)]
pub struct CreateHeaderPresetRequest {
    pub name: String,
    pub description: Option<String>,
    pub headers: Vec<HttpHeader>,
}
