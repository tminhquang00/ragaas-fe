export interface LLMConfig {
    config_name: string;
    weak_llm_config_name: string;
    temperature?: number;
    max_tokens?: number;
}

export interface RetrievalConfig {
    retrieval_method: 'semantic' | 'hybrid' | 'bm25';
    top_k: number;
    metadata_filters?: Record<string, any>;
    min_score: number;
    dynamic_top_k: boolean;
    dynamic_top_k_config: Record<string, number>;
    iterative_retrieval: boolean;
    max_retrieval_passes: number;
    quality_threshold: number;
    multi_query_retrieval: boolean;
    num_query_variations: number;
    history_aware_retrieval: boolean;
    expand_to_page: boolean;
    max_expanded_chunks?: number;
}

export interface ChunkingConfig {
    strategy: 'docling' | 'fixed_size' | 'semantic' | 'document_aware';
    chunk_size: number;
    chunk_overlap: number;
    min_chunk_size: number;
    respect_sentence_boundaries: boolean;
}

export interface VectorDatabaseConfig {
    provider: 'mongodb_atlas' | 'weaviate' | 'qdrant';
    config: Record<string, any>;
    embedding_model: string;
    embedding_dimension: number;
    index_name_pattern: string;
    metadata: Record<string, any>;
}

export interface PipelineStep {
    name: string;
    type: 'retrieve' | 'classify' | 'generate' | 'transform' | 'filter' | 'tool_call' | 'parallel';
    config: Record<string, any>;
}

export interface ChatHistoryConfig {
    include_history: boolean;
    max_history_turns: number;
}

export interface PipelineConfig {
    type: 'simple_rag' | 'classify' | 'agentic' | 'routing' | 'agent' | 'custom';
    steps: PipelineStep[];
    conditional_logic?: Record<string, any>;
    agent_config?: Record<string, any>;
    chat_history_config: ChatHistoryConfig;
}

export interface WidgetConfig {
    enabled: boolean;
    title?: string;
    welcome_message: string;
    primary_color: string;
    position: 'right' | 'left';
    allowed_origins: string[];
}

export interface ProjectConfig {
    llm_config: LLMConfig;
    retrieval_config: RetrievalConfig;
    chunking_config: ChunkingConfig;
    vector_db_config: VectorDatabaseConfig;
    pipeline_config: PipelineConfig;
    widget_config: WidgetConfig;
    system_prompt: string;
    user_prompt_template: string;
    max_context_tokens: number;
    temperature: number;
    top_p: number;
    stream_response: boolean;
}
