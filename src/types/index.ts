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

export interface PipelineConfig {
  type: 'simple_rag' | 'agentic' | 'routing' | 'agent' | 'custom';
  steps?: PipelineStep[];
}

export interface PipelineStep {
  name: string;
  config?: Record<string, unknown>;
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
  chunk_id: string;
  type: 'content' | 'source' | 'metadata' | 'complete';
  data: string;
  metadata?: Record<string, unknown>;
}

// ============ Sessions ============

export interface ChatMessage {
  message_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  images?: ImageContent[];
  timestamp: string;
  tokens_used?: number;
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
}

export interface SessionListResponse {
  sessions: ChatSession[];
  total: number;
  page: number;
  page_size: number;
}

// ============ Widget ============

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
