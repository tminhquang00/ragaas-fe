// API and Domain Types for RAG-as-a-Service

// ============ Projects ============

export interface LLMConfig {
  config_name: string;
  temperature?: number;
  max_tokens?: number;
}

export interface RetrievalConfig {
  retrieval_method: 'semantic' | 'hybrid' | 'bm25';
  top_k: number;
  similarity_threshold: number;
  chunk_size?: number;
  chunk_overlap?: number;
}

export interface ChatHistoryConfig {
  include_history: boolean;
  max_history_turns: number;
}

export interface PipelineConfig {
  type: 'simple_rag' | 'classify' | 'agentic' | 'routing' | 'agent' | 'custom';
  steps?: PipelineStep[];
  conditional_logic?: Record<string, unknown>;
  agent_config?: Record<string, unknown>;
  chat_history_config?: ChatHistoryConfig;
}

export interface PipelineStep {
  name: string;
  type?: 'retrieve' | 'classify' | 'generate' | 'transform' | 'filter' | 'tool_call' | 'parallel' | 'route' | 'agent';
  config?: Record<string, unknown>;
  branches?: Record<string, PipelineStep[]>;
}

export interface WidgetConfig {
  enabled: boolean;
  title?: string;
  welcome_message: string;
  primary_color: string;
  position: 'right' | 'left';
}

export interface ProjectConfig {
  llm_config: LLMConfig;
  retrieval_config: RetrievalConfig;
  pipeline_config: PipelineConfig;
  widget_config: WidgetConfig;
  system_prompt: string;
  user_prompt_template: string;
}

export type ProjectStatus = 'draft' | 'active' | 'archived';

export interface Project {
  project_id: string;
  tenant_id: string;
  owner_id: string | null;
  members: ProjectMember[];
  visibility: 'private' | 'public';
  name: string;
  description?: string;
  status: ProjectStatus;
  version: number;
  created_at: string;
  updated_at: string;
  config: ProjectConfig;
  endpoints?: string[];
  api_keys?: ApiKeyInfo[];
}

export interface ApiKeyInfo {
  key_id: string;
  name: string;
  scopes: string[];
  created_at: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  config?: Partial<ProjectConfig>;
}

export interface CreateProjectResponse {
  project: Project;
  api_key: string; // Only shown once!
}

export interface ProjectListResponse {
  projects: Project[];
  total: number;
  page: number;
  page_size: number;
}

// ============ Documents ============

export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Document {
  document_id: string;
  project_id: string;
  tenant_id: string;
  filename: string;
  file_type: string;
  file_size: number;
  processing_status: ProcessingStatus;
  processing_error?: string;
  chunks_count: number;
  vector_count: number;
  embedding_model?: string;
  custom_metadata?: Record<string, unknown>;
  upload_timestamp: string;
  last_updated: string;
}

export interface DocumentProcessingResult {
  document_id: string;
  status: 'success' | 'partial' | 'failed';
  chunks_created: number;
  vectors_stored: number;
  processing_time_ms: number;
  errors: string[];
  warnings: string[];
}

export interface ProcessingConfig {
  chunking_strategy: 'fixed_size' | 'semantic' | 'document_aware';
  chunk_size?: number;
  chunk_overlap?: number;
  image_handling: 'skip' | 'llm_describe' | 'embed_base64';
  image_prompt?: string;
}

export interface DocumentListResponse {
  documents: Document[];
  total: number;
  page: number;
  page_size: number;
}

export interface DocumentChunk {
  chunk_id: string;
  document_id: string;
  content: string;
  chunk_index: number;
  page_number?: number;
  section?: string;
  source_doc_name: string;
  source_position?: string;
}

export interface ConfluenceSyncRequest {
  url: string;
  token: string;
  include_children?: boolean;
  max_depth?: number;
  image_handling?: 'skip' | 'llm_describe' | 'embed_base64';
  image_prompt?: string;
}

export interface ConfluenceIngestResponse {
  task_id: string;
  message: string;
  status_url: string;
  total_pages: number;
}

// ============ Batch Upload ============

export interface BatchUploadResponse {
  task_id: string;
  message: string;
  status_url: string;
  total_files: number;
}

export interface UploadTaskResult {
  document_id: string;
  status: 'success' | 'partial' | 'failed';
  chunks_created: number;
  vectors_stored: number;
  processing_time_ms: number;
  errors: string[];
  warnings: string[];
}

export type UploadTaskStatusType = 'pending' | 'processing' | 'completed' | 'completed_with_errors' | 'failed';

export interface UploadTaskStatus {
  task_id: string;
  status: UploadTaskStatusType;
  total_files: number;
  processed_files: number;
  results: UploadTaskResult[];
  created_at: string;
  completed_at?: string;
  errors: string[];
}

// ============ Visual Grounding ============

export interface BoundingBox {
  l: number;  // left (0-1)
  t: number;  // top (0-1)
  r: number;  // right (0-1)
  b: number;  // bottom (0-1)
}

export type SourceType = 'pdf' | 'docx' | 'excel' | 'confluence' | 'text' | 'sharepoint';

// ============ SharePoint ============

export interface SharePointFileNode {
  name: string;
  type: 'file' | 'folder';
  id?: string;
  size?: number;
  lastModified?: string;
  quickXorHash?: string;
  mimeType?: string;
  children?: SharePointFileNode[];
}

export interface SharePointTokens {
  access_token: string;
  refresh_token?: string;
}

export interface SharePointListFilesRequest {
  sharepoint_url: string;
  folder_path?: string;
  deep_level?: number;
  supported_extensions?: string[];
}

export interface SharePointListFilesResponse {
  tree: SharePointFileNode;
  tokens: SharePointTokens;
}

export interface SharePointIngestRequest {
  sharepoint_url: string;
  file_ids: string[];
  sharepoint_paths?: string[];
  custom_metadata?: Record<string, unknown>;
  processing_config?: Partial<ProcessingConfig>;
}

export interface SharePointIngestResponse {
  task_id: string;
  message: string;
  status_url: string;
  total_files: number;
  tokens: SharePointTokens;
}

export interface SharePointCheckStatusRequest {
  sharepoint_url: string;
  file_ids: string[];
  stored_hashes: Record<string, string>;
}

export interface SharePointFileStatus {
  file_id: string;
  filename: string | null;
  current_hash: string | null;
  stored_hash: string;
  changed: boolean;
  exists: boolean;
}

export interface SharePointCheckStatusResponse {
  files: SharePointFileStatus[];
  tokens: SharePointTokens;
}

// ============ Chat ============

export interface ImageContent {
  data?: string; // base64
  url?: string;
  mime_type: string;
  detail?: 'auto' | 'low' | 'high';
}

export interface FileUpload {
  filename: string;
  data: string; // base64
  mime_type?: string;
}

export interface ChatRequest {
  query: string;
  session_id?: string;
  images?: ImageContent[];
  files?: FileUpload[];
  temperature?: number;
  top_k?: number;
  conversation_history?: ChatMessage[];
}

export interface SourceReference {
  document_id: string;
  document_name: string;
  chunk_id: string;
  page_number?: number;
  excerpt: string;
  relevance_score: number;
  position?: string;
  // Visual grounding fields
  source_type?: SourceType;
  // PDF visual grounding (legacy — normalized 0-1)
  bounding_box?: BoundingBox | null;
  page_image_url?: string | null;  // Pre-built URL for first page — use in <img src={...} />
  page_image_urls?: Record<number, string> | null;  // Per-page URLs — use when navigating pages
  source_url?: string;
  binary_hash?: string | null;

  // Structured visual grounding (new batch processor)
  bounding_box_points?: {        // Union bbox of chunk text in PDF points
      l: number;
      t: number;
      r: number;
      b: number;
      coord_origin: "BOTTOMLEFT" | "TOPLEFT";
      coord_system: "points";
  } | null;
  elements_detail?: ElementDetail[] | null;
  headings?: string[] | null;
  page_range?: [number, number] | null;
  hash_unique_id?: string | null;
  // Document-specific fields
  section?: string;
  sheet_name?: string;
  cell_range?: string;
}

export interface ChatResponse {
  response_id: string;
  query: string;
  answer: string;
  sources: SourceReference[];
  confidence_score: number;
  tokens_used: number;
  processing_time_ms: number;
  model: string;
  session_id: string;
  next_suggestions?: string[];
}

export interface StreamingChunk {
  chunk_id?: string;
  type: 'step_start' | 'step_end' | 'agent_action' | 'content' | 'source' | 'complete' | 'error';
  data: string;
  metadata?: Record<string, unknown>;
}

// Step progress for pipeline visualization
export interface StepProgress {
  name: string;
  step_type: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  duration_ms?: number;
}

// Agent action during agent execution
export interface AgentAction {
  step: string;
  action: string;
  tool?: string;
  input?: string;
}


// ============ Sessions ============

export interface ChatMessage {
  message_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  images?: ImageContent[];
  timestamp: string;
  tokens_used?: number;
  cost?: number;
  metadata?: Record<string, any>;
}

export interface ChatSession {
  session_id: string;
  project_id: string;
  tenant_id: string;
  user_id?: string;
  created_at: string;
  updated_at: string;
  title?: string;
  messages: ChatMessage[];
  custom_fields?: Record<string, any>;
}

export interface SessionListResponse {
  sessions: ChatSession[];
  total: number;
  page: number;
  page_size: number;
}

// ============ Widget ============

export interface ElementCoordinate {
    page_no: number;
    bbox: {
        left: number;
        top: number;
        right: number;
        bottom: number;
        coord_origin: 'BOTTOMLEFT' | 'TOPLEFT';
        original_unit: 'points' | 'EMU';
    };
    charspan?: [number, number] | null;
}

export interface ElementDetail {
    type: string;
    coordinates: ElementCoordinate[];
    content?: string;
    base64?: string;
    self_ref?: string;
}

export interface WidgetEmbedCode {
  iframe_url: string;
  iframe_html: string;
  script_html: string;
}

// ============ Errors ============

export interface ApiError {
  detail: string;
  error_type?: string;
}

// ============ App State ============

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  state: LoadingState;
  data?: T;
  error?: string;
}

// ============ Multi-User Sharing ============

export type ProjectRole = 'owner' | 'editor' | 'viewer';

export interface ProjectMember {
  user_id: string;
  role: ProjectRole;
  added_at: string;
  added_by: string | null;
}

export interface ShareProjectRequest {
  user_id: string;
  role: 'editor' | 'viewer';
}

export interface SetVisibilityRequest {
  visibility: 'private' | 'public';
}

export interface ProjectMemberResponse {
  user_id: string;
  role: ProjectRole;
  added_at: string;
  added_by: string | null;
}

export interface MigrationResult {
  migration: string;
  status: 'completed' | 'no_action_needed' | 'partial' | 'error';
  projects_found: number;
  projects_updated: number;
  projects_remaining: number;
  index_created: boolean;
  message: string;
  executed_at: string;
  executed_by: string;
}

export interface MigrationDryRunResult {
  migration: string;
  projects_needing_migration: number;
  total_projects: number;
  message: string;
}



/** Returns the calling user's role on a project (handles both new and legacy projects). */
export function getUserRole(project: Project, userId: string): ProjectRole | null {
  if (project.owner_id === userId || project.tenant_id === userId) {
    return 'owner';
  }
  const member = project.members?.find((m) => m.user_id === userId);
  if (member?.role) return member.role;
  if (project.visibility === 'public') return 'viewer';
  return null;
}

/** Returns true when the user's role is >= the required role in the hierarchy. */
export function hasPermission(
  project: Project,
  userId: string,
  requiredRole: ProjectRole
): boolean {
  const hierarchy: Record<ProjectRole, number> = { viewer: 1, editor: 2, owner: 3 };
  const role = getUserRole(project, userId);
  if (!role) return false;
  return hierarchy[role] >= hierarchy[requiredRole];
}

// ============ SQL Agent ============

export type DatabaseType = 'postgresql' | 'mysql' | 'sqlserver' | 'sqlite';
export type ConnectionStatus = 'connected' | 'disconnected' | 'error' | 'pending';

export interface DatabaseConnectionCreate {
  database_type: DatabaseType;
  connection_string: string;
  display_name?: string;
  include_tables?: string[] | null;
  exclude_tables?: string[] | null;
  max_result_rows?: number;       // 1-5000, default 500
  query_timeout_seconds?: number; // 5-120, default 30
}

export interface DatabaseConnectionResponse {
  enabled: boolean;
  database_type: DatabaseType;
  display_name: string;
  status: ConnectionStatus;
  include_tables: string[] | null;
  exclude_tables: string[] | null;
  max_result_rows: number;
  query_timeout_seconds: number;
  schema_introspected_at: string | null;
  table_count: number | null;
}

export interface ConnectionTestRequest {
  database_type: DatabaseType;
  connection_string: string;
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  latency_ms: number;
  tables_found: number | null;
}

export interface ColumnSchema {
  name: string;
  data_type: string;
  nullable: boolean;
  is_primary_key: boolean;
  is_foreign_key: boolean;
  foreign_key_target: string | null;
  comment: string | null;
}

export interface TableSchema {
  table_name: string;
  columns: ColumnSchema[];
  row_count_estimate: number | null;
  comment: string | null;
  sample_values: Record<string, any[]> | null;
}

export interface IntrospectResponse {
  tables: TableSchema[];
  introspected_at: string;
  table_count: number;
}

export interface QueryAuditEntry {
  tenant_id: string;
  project_id: string;
  session_id: string;
  message_id: string;
  user_query: string;
  sql_query: string;
  query_valid: boolean;
  execution_time_ms: number | null;
  row_count: number | null;
  error_message: string | null;
  generated_at: string;
  executed_at: string | null;
}

export interface AuditLogResponse {
  entries: QueryAuditEntry[];
  total: number;
  limit: number;
  offset: number;
}
