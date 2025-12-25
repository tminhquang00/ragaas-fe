import {
    Project,
    CreateProjectRequest,
    CreateProjectResponse,
    ProjectListResponse,
    Document,
    DocumentProcessingResult,
    ProcessingConfig,
    DocumentListResponse,
    DocumentChunk,
    ConfluenceSyncRequest,
    ChatRequest,
    ChatResponse,
    StreamingChunk,
    ChatSession,
    SessionListResponse,
    ChatMessage,
    WidgetConfig,
    WidgetEmbedCode,
    ApiError,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export class RAGaaSClient {
    private baseUrl: string;
    private tenantId: string;

    constructor(tenantId: string, baseUrl: string = API_BASE_URL) {
        this.baseUrl = baseUrl;
        this.tenantId = tenantId;
    }

    setTenantId(tenantId: string) {
        this.tenantId = tenantId;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'X-User-ID': this.tenantId,
                ...options.headers,
            },
        });

        if (!response.ok) {
            const error: ApiError = await response.json().catch(() => ({
                detail: `HTTP ${response.status}: ${response.statusText}`,
            }));
            throw new Error(error.detail);
        }

        if (response.status === 204) {
            return undefined as T;
        }

        return response.json();
    }

    // ============ Projects ============

    async createProject(data: CreateProjectRequest): Promise<CreateProjectResponse> {
        return this.request('/api/v1/projects', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async createProjectFromConfig(configFile: File): Promise<CreateProjectResponse> {
        const formData = new FormData();
        formData.append('config_file', configFile);

        const response = await fetch(`${this.baseUrl}/api/v1/projects/from-config`, {
            method: 'POST',
            headers: { 'X-User-ID': this.tenantId },
            body: formData,
        });

        if (!response.ok) {
            const error: ApiError = await response.json();
            throw new Error(error.detail);
        }

        return response.json();
    }

    async validateConfig(configFile: File): Promise<{ valid: boolean; error?: string; config?: unknown }> {
        const formData = new FormData();
        formData.append('config_file', configFile);

        const response = await fetch(`${this.baseUrl}/api/v1/projects/validate-config`, {
            method: 'POST',
            headers: { 'X-User-ID': this.tenantId },
            body: formData,
        });

        return response.json();
    }

    async getConfigTemplate(provider: string = 'mongodb_atlas'): Promise<{ provider: string; template: string }> {
        return this.request(`/api/v1/projects/config-template?provider=${provider}`);
    }

    async getProject(projectId: string): Promise<Project> {
        return this.request(`/api/v1/projects/${projectId}`);
    }

    async listProjects(
        page: number = 1,
        pageSize: number = 20,
        status?: string
    ): Promise<ProjectListResponse> {
        let url = `/api/v1/projects?page=${page}&page_size=${pageSize}`;
        if (status) url += `&status=${status}`;
        return this.request(url);
    }

    async updateProject(projectId: string, data: Partial<Project>): Promise<Project> {
        return this.request(`/api/v1/projects/${projectId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteProject(projectId: string): Promise<void> {
        return this.request(`/api/v1/projects/${projectId}`, {
            method: 'DELETE',
        });
    }

    async activateProject(projectId: string): Promise<Project> {
        return this.request(`/api/v1/projects/${projectId}/activate`, {
            method: 'POST',
        });
    }

    async archiveProject(projectId: string): Promise<Project> {
        return this.request(`/api/v1/projects/${projectId}/archive`, {
            method: 'POST',
        });
    }

    async generateApiKey(
        projectId: string,
        name: string,
        scopes: string[] = ['read', 'write']
    ): Promise<{ key: string; key_id: string; name: string; scopes: string[] }> {
        return this.request(`/api/v1/projects/${projectId}/api-keys`, {
            method: 'POST',
            body: JSON.stringify({ name, scopes }),
        });
    }

    // ============ Documents ============

    async uploadDocument(
        projectId: string,
        file: File,
        config?: ProcessingConfig,
        customMetadata?: Record<string, unknown>
    ): Promise<DocumentProcessingResult> {
        const formData = new FormData();
        formData.append('file', file);
        if (config) {
            formData.append('processing_config', JSON.stringify(config));
        }
        if (customMetadata) {
            formData.append('custom_metadata', JSON.stringify(customMetadata));
        }

        const response = await fetch(
            `${this.baseUrl}/api/v1/projects/${projectId}/documents/upload`,
            {
                method: 'POST',
                headers: { 'X-User-ID': this.tenantId },
                body: formData,
            }
        );

        if (!response.ok) {
            const error: ApiError = await response.json();
            throw new Error(error.detail);
        }

        return response.json();
    }

    async syncConfluence(
        projectId: string,
        request: ConfluenceSyncRequest
    ): Promise<{ pages_ingested: number; documents: DocumentProcessingResult[] }> {
        return this.request(`/api/v1/projects/${projectId}/documents/confluence`, {
            method: 'POST',
            body: JSON.stringify(request),
        });
    }

    async getDocument(projectId: string, documentId: string): Promise<Document> {
        return this.request(`/api/v1/projects/${projectId}/documents/${documentId}`);
    }

    async listDocuments(
        projectId: string,
        page: number = 1,
        pageSize: number = 20,
        status?: string
    ): Promise<DocumentListResponse> {
        let url = `/api/v1/projects/${projectId}/documents?page=${page}&page_size=${pageSize}`;
        if (status) url += `&status=${status}`;
        return this.request(url);
    }

    async getDocumentChunks(
        projectId: string,
        documentId: string,
        skip: number = 0,
        limit: number = 50
    ): Promise<{ chunks: DocumentChunk[]; total: number }> {
        return this.request(
            `/api/v1/projects/${projectId}/documents/${documentId}/chunks?skip=${skip}&limit=${limit}`
        );
    }

    async deleteDocument(projectId: string, documentId: string): Promise<void> {
        return this.request(`/api/v1/projects/${projectId}/documents/${documentId}`, {
            method: 'DELETE',
        });
    }

    // ============ Chat ============

    async chat(projectId: string, request: ChatRequest): Promise<ChatResponse> {
        return this.request(`/api/v1/projects/${projectId}/chat`, {
            method: 'POST',
            body: JSON.stringify(request),
        });
    }

    async *streamChat(
        projectId: string,
        request: ChatRequest
    ): AsyncGenerator<StreamingChunk> {
        const response = await fetch(
            `${this.baseUrl}/api/v1/projects/${projectId}/chat/stream`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-ID': this.tenantId,
                },
                body: JSON.stringify(request),
            }
        );

        if (!response.ok) {
            const error: ApiError = await response.json();
            throw new Error(error.detail);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
            throw new Error('No response body');
        }

        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6).trim();
                    if (data === '[DONE]') return;
                    if (data) {
                        try {
                            yield JSON.parse(data);
                        } catch {
                            // Ignore parse errors for incomplete chunks
                        }
                    }
                }
            }
        }
    }

    // ============ Sessions ============

    async getSessions(
        projectId: string,
        page: number = 1,
        pageSize: number = 20,
        userId?: string
    ): Promise<SessionListResponse> {
        let url = `/api/v1/projects/${projectId}/sessions?page=${page}&page_size=${pageSize}`;
        if (userId) url += `&user_id=${userId}`;
        return this.request(url);
    }

    async getSession(projectId: string, sessionId: string): Promise<ChatSession> {
        return this.request(`/api/v1/projects/${projectId}/sessions/${sessionId}`);
    }

    async getSessionMessages(
        projectId: string,
        sessionId: string,
        limit: number = 50
    ): Promise<{ messages: ChatMessage[]; session_id: string }> {
        return this.request(
            `/api/v1/projects/${projectId}/sessions/${sessionId}/messages?limit=${limit}`
        );
    }

    async deleteSession(projectId: string, sessionId: string): Promise<void> {
        return this.request(`/api/v1/projects/${projectId}/sessions/${sessionId}`, {
            method: 'DELETE',
        });
    }

    // ============ Widget ============

    async getWidgetConfig(projectId: string): Promise<WidgetConfig> {
        return this.request(`/api/v1/projects/${projectId}/widget/config`);
    }

    async getEmbedCode(projectId: string, baseUrl?: string): Promise<WidgetEmbedCode> {
        let url = `/api/v1/projects/${projectId}/widget/embed-code`;
        if (baseUrl) url += `?base_url=${encodeURIComponent(baseUrl)}`;
        return this.request(url);
    }

    // ============ Health ============

    async healthCheck(): Promise<{ status: string; components: Record<string, string> }> {
        return this.request('/health');
    }
}

// Default client instance (will be configured with tenant ID later)
let apiClient: RAGaaSClient | null = null;

export const getApiClient = (tenantId?: string): RAGaaSClient => {
    if (!apiClient && tenantId) {
        apiClient = new RAGaaSClient(tenantId);
    }
    if (!apiClient) {
        throw new Error('API client not initialized. Please provide a tenant ID.');
    }
    if (tenantId && apiClient) {
        apiClient.setTenantId(tenantId);
    }
    return apiClient;
};

export const initializeApiClient = (tenantId: string): RAGaaSClient => {
    apiClient = new RAGaaSClient(tenantId);
    return apiClient;
};
