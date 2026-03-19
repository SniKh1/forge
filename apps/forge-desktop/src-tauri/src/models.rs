use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DetectionItem {
    pub name: String,
    pub home: String,
    pub home_label: String,
    pub detected: bool,
    pub configured: bool,
    pub home_exists: bool,
    pub command_available: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SupportItem {
    pub client: String,
    pub ok: bool,
    pub exit_code: i32,
    pub stdout: String,
    pub stderr: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DoctorReport {
    pub detection: Vec<DetectionItem>,
    pub capability_matrix: Value,
    pub support: Vec<SupportItem>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RuntimeStatus {
    pub node_available: bool,
    pub npm_available: bool,
    pub python_available: bool,
    pub git_available: bool,
    pub repo_root: String,
    pub preview_root: String,
    pub isolated: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppStatePayload {
    pub report: DoctorReport,
    pub runtime: RuntimeStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ActionPayload {
    pub client: String,
    pub cwd: Option<String>,
    pub lang: Option<String>,
    pub components: Vec<String>,
    pub mcp_servers: Vec<String>,
    pub skill_names: Vec<String>,
    pub secret_values_base64: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ActionResult<T = Value> {
    pub ok: bool,
    pub summary: String,
    pub details: Vec<String>,
    pub warnings: Vec<String>,
    pub raw: String,
    pub data: Option<T>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BootstrapResultData {
    pub client: String,
    pub detected: bool,
    pub changed: bool,
    pub package_name: String,
    pub command: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExternalRegistrySource {
    pub id: String,
    pub name: String,
    pub kind: String,
    pub r#type: String,
    pub url: String,
    pub trust: String,
    pub note: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExternalSearchPayload {
    pub kind: String,
    pub query: String,
    pub sources: Vec<ExternalRegistrySource>,
    pub results: Vec<Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExternalSkillInstallPayload {
    pub client: String,
    pub source: String,
    pub skill: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExternalMcpInstallSpec {
    pub name: String,
    pub transport: String,
    pub command: String,
    pub args: Vec<String>,
    pub env: Option<HashMap<String, String>>,
    pub required_secrets: Option<Vec<String>>,
    pub package_identifier: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExternalMcpInstallPayload {
    pub client: String,
    pub spec: ExternalMcpInstallSpec,
}
