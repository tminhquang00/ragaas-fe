import {
    Project,
    CreateProjectRequest,
    CreateProjectResponse,
    ProjectListResponse,
    Document,
    ProcessingConfig,
    DocumentListResponse,
    DocumentChunk,
    ConfluenceSyncRequest,
    ConfluenceIngestResponse,
    ChatRequest,
    ChatResponse,
    StreamingChunk,
    ChatSession,
    SessionListResponse,
    ChatMessage,
    WidgetConfig,
    WidgetEmbedCode,
    ApiError,
    BatchUploadResponse,
    UploadTaskStatus,
    BoundingBox,
    SharePointListFilesRequest,
    SharePointListFilesResponse,
    SharePointIngestRequest,
    SharePointIngestResponse,
    SharePointCheckStatusRequest,
    SharePointCheckStatusResponse,
    ProjectMemberResponse,
    ShareProjectRequest,
    SetVisibilityRequest,
    MigrationResult,
    MigrationDryRunResult,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export class RAGaaSClient {
    private baseUrl: string;
    private tenantId: string;
    private accessToken: string | null = null;

    constructor(tenantId: string, baseUrl: string = API_BASE_URL) {
        this.baseUrl = baseUrl;
        this.tenantId = tenantId;
    }

    setTenantId(tenantId: string) {
        this.tenantId = tenantId;
    }

    setAccessToken(token: string | null) {
        this.accessToken = token;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const authHeaders: Record<string, string> = this.accessToken
            ? { Authorization: `Bearer ${this.accessToken}` }
            : {};

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'X-User-ID': this.tenantId,
                ...authHeaders,
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

    // ============ Project Sharing ============

    async shareProject(
        projectId: string,
        request: ShareProjectRequest
    ): Promise<ProjectMemberResponse> {
        return this.request(`/api/v1/projects/${projectId}/members`, {
            method: 'POST',
            body: JSON.stringify(request),
        });
    }

    async listMembers(projectId: string): Promise<ProjectMemberResponse[]> {
        return this.request(`/api/v1/projects/${projectId}/members`);
    }

    async revokeMember(projectId: string, targetUserId: string): Promise<void> {
        return this.request(`/api/v1/projects/${projectId}/members/${encodeURIComponent(targetUserId)}`, {
            method: 'DELETE',
        });
    }

    async setVisibility(projectId: string, visibility: SetVisibilityRequest['visibility']): Promise<Project> {
        return this.request<Project>(`/api/v1/projects/${projectId}/visibility`, {
            method: 'PATCH',
            body: JSON.stringify({ visibility } satisfies SetVisibilityRequest),
        });
    }

    async checkMigration(): Promise<MigrationDryRunResult> {
        return this.request('/api/v1/admin/migrations/backfill-owners');
    }

    async runMigration(): Promise<MigrationResult> {
        return this.request('/api/v1/admin/migrations/backfill-owners', { method: 'POST' });
    }

    // ============ Documents ============

    /**
     * Upload multiple documents for batch processing.
     * Returns immediately with a task_id for polling progress.
     */
    async uploadDocuments(
        projectId: string,
        files: File[],
        config?: ProcessingConfig,
        customMetadata?: Record<string, unknown>
    ): Promise<BatchUploadResponse> {
        const formData = new FormData();
        // Append all files with the same field name 'files'
        for (const file of files) {
            formData.append('files', file);
        }
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

    /**
     * Get the status of a background ingestion task.
     */
    async getUploadTaskStatus(
        projectId: string,
        taskId: string
    ): Promise<UploadTaskStatus> {
        return this.request(`/api/v1/projects/${projectId}/documents/tasks/${taskId}`);
    }

    /**
     * Build a visual grounding URL for displaying a highlighted PDF page.
     */
    buildVisualGroundingUrl(
        binaryHash: string,
        pageNo: number,
        bbox: BoundingBox,
        highlightColor: string = 'blue',
        lineWidth: number = 3
    ): string {
        const params = new URLSearchParams({
            page_no: pageNo.toString(),
            bbox_l: bbox.l.toString(),
            bbox_t: bbox.t.toString(),
            bbox_r: bbox.r.toString(),
            bbox_b: bbox.b.toString(),
            highlight_color: highlightColor,
            line_width: lineWidth.toString(),
        });
        return `${this.baseUrl}/api/v1/page-highlight/${binaryHash}?${params.toString()}`;
    }

    async syncConfluence(
        projectId: string,
        request: ConfluenceSyncRequest
    ): Promise<ConfluenceIngestResponse> {
        return this.request(`/api/v1/projects/${projectId}/documents/confluence`, {
            method: 'POST',
            body: JSON.stringify(request),
        });
    }

    // ============ SharePoint ============

    /**
     * Browse the SharePoint document library tree.
     * Tokens from the response are returned so the caller can persist them
     * and pass them into the next SharePoint call (token rotation).
     */
    async listSharePointFiles(
        projectId: string,
        request: SharePointListFilesRequest,
        spAccessToken: string,
        spRefreshToken?: string
    ): Promise<SharePointListFilesResponse> {
        return this.request(`/api/v1/projects/${projectId}/sharepoint/list-files`, {
            method: 'POST',
            body: JSON.stringify(request),
            headers: {
                sharepointaccesstoken: spAccessToken,
                sprefreshtoken: spRefreshToken ?? '',
            },
        });
    }

    /**
     * Ingest selected SharePoint files into the RAG pipeline.
     * Returns a task_id (202 Accepted). Monitor progress with getUploadTaskStatus.
     */
    async ingestSharePoint(
        projectId: string,
        request: SharePointIngestRequest,
        spAccessToken: string,
        spRefreshToken?: string
    ): Promise<SharePointIngestResponse> {
        return this.request(`/api/v1/projects/${projectId}/sharepoint/ingest`, {
            method: 'POST',
            body: JSON.stringify(request),
            headers: {
                sharepointaccesstoken: spAccessToken,
                sprefreshtoken: spRefreshToken ?? '',
            },
        });
    }

    /**
     * Check whether SharePoint files have changed since last ingestion
     * by comparing quickXorHash values — without re-downloading.
     */
    async checkSharePointStatus(
        projectId: string,
        request: SharePointCheckStatusRequest,
        spAccessToken: string,
        spRefreshToken?: string
    ): Promise<SharePointCheckStatusResponse> {
        return this.request(`/api/v1/projects/${projectId}/sharepoint/check-status`, {
            method: 'POST',
            body: JSON.stringify(request),
            headers: {
                sharepointaccesstoken: spAccessToken,
                sprefreshtoken: spRefreshToken ?? '',
            },
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

    async searchSessions(
        projectId: string,
        query: string
    ): Promise<SessionListResponse> {
        return this.request(`/api/v1/projects/${projectId}/sessions/search?q=${encodeURIComponent(query)}`);
    }

    async createSession(projectId: string, data: { user_id?: string; title?: string; custom_fields?: Record<string, any> }): Promise<ChatSession> {
        return this.request(`/api/v1/projects/${projectId}/sessions`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getSession(projectId: string, sessionId: string): Promise<ChatSession> {
        return this.request(`/api/v1/projects/${projectId}/sessions/${sessionId}`);
    }

    async updateSession(projectId: string, sessionId: string, data: { title?: string; custom_fields?: Record<string, any> }): Promise<ChatSession> {
        return this.request(`/api/v1/projects/${projectId}/sessions/${sessionId}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
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

    async addSessionMessage(projectId: string, sessionId: string, data: { role: string; content: string; metadata?: Record<string, any> }): Promise<ChatMessage> {
        return this.request(`/api/v1/projects/${projectId}/sessions/${sessionId}/messages`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async deleteSession(projectId: string, sessionId: string): Promise<void> {
        return this.request(`/api/v1/projects/${projectId}/sessions/${sessionId}`, {
            method: 'DELETE',
        });
    }

    async clearSessionMessages(projectId: string, sessionId: string): Promise<void> {
        return this.request(`/api/v1/projects/${projectId}/sessions/${sessionId}/messages`, {
            method: 'DELETE',
        });
    }

    async deleteSessionMessage(projectId: string, sessionId: string, messageId: string): Promise<void> {
        return this.request(`/api/v1/projects/${projectId}/sessions/${sessionId}/messages/${messageId}`, {
            method: 'DELETE',
        });
    }

    async exportSession(projectId: string, sessionId: string): Promise<any> {
        return this.request(`/api/v1/projects/${projectId}/sessions/${sessionId}/export`);
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
