use reqwest::{Client, Method, header::HeaderMap};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::time::{Duration, Instant};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HttpRequest {
    pub method: String,
    pub url: String,
    pub headers: Vec<HttpHeader>,
    pub body: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HttpHeader {
    pub key: String,
    pub value: String,
    pub enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HttpResponse {
    pub status: u16,
    pub status_text: String,
    pub headers: HashMap<String, String>,
    pub body: String,
    pub content_type: String,
    pub size: usize,
    pub time: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RequestResult {
    pub success: bool,
    pub response: Option<HttpResponse>,
    pub error: Option<String>,
}

fn parse_method(method: &str) -> Method {
    match method.to_uppercase().as_str() {
        "GET" => Method::GET,
        "POST" => Method::POST,
        "PUT" => Method::PUT,
        "DELETE" => Method::DELETE,
        "PATCH" => Method::PATCH,
        "HEAD" => Method::HEAD,
        "OPTIONS" => Method::OPTIONS,
        _ => Method::GET,
    }
}

#[tauri::command]
async fn execute_http_request(request: HttpRequest) -> Result<RequestResult, String> {
    let start = Instant::now();
    
    let client = Client::builder()
        .timeout(Duration::from_secs(30))
        .build()
        .map_err(|e| format!("Failed to build client: {}", e))?;

    let method = parse_method(&request.method);
    let mut req_builder = client.request(method, &request.url);

    let mut header_map = HeaderMap::new();
    for header in &request.headers {
        if header.enabled {
            if let Ok(name) = header.key.parse::<reqwest::header::HeaderName>() {
                if let Ok(value) = header.value.parse::<reqwest::header::HeaderValue>() {
                    header_map.insert(name, value);
                }
            }
        }
    }
    req_builder = req_builder.headers(header_map);

    if let Some(body) = &request.body {
        req_builder = req_builder.body(body.clone());
    }

    let response = match req_builder.send().await {
        Ok(resp) => resp,
        Err(e) => {
            return Ok(RequestResult {
                success: false,
                response: None,
                error: Some(format!("Request failed: {}", e)),
            });
        }
    };

    let time = start.elapsed().as_millis() as u64;
    let status = response.status();
    let status_text = status.canonical_reason().unwrap_or("Unknown").to_string();
    let content_type = response
        .headers()
        .get("content-type")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("application/octet-stream")
        .to_string();

    let mut headers = HashMap::new();
    for (key, value) in response.headers() {
        if let Ok(value_str) = value.to_str() {
            headers.insert(key.to_string(), value_str.to_string());
        }
    }

    let body_bytes = match response.bytes().await {
        Ok(bytes) => bytes,
        Err(e) => {
            return Ok(RequestResult {
                success: false,
                response: None,
                error: Some(format!("Failed to read response body: {}", e)),
            });
        }
    };

    let size = body_bytes.len();
    let body = String::from_utf8_lossy(&body_bytes).to_string();

    let http_response = HttpResponse {
        status: status.as_u16(),
        status_text,
        headers,
        body,
        content_type,
        size,
        time,
    };

    Ok(RequestResult {
        success: status.is_success(),
        response: Some(http_response),
        error: None,
    })
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, execute_http_request])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
