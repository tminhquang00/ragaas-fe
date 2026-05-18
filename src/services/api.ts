import {
    Project,
    CreateProjectRequest,
    CreateProjectResponse,
    ProjectListResponse,
    Document,
    ProcessingConfig,
    DocumentListResponse,
    DocumentChunk,
    TemplateCategory,
    ConfluenceSyncRequest,
    ConfluenceIngestResponse,
    ChatRequest,
    ChatResponse,
    StreamingChunk,
    ChatSession,
    SessionListResponse,
    SessionMessagesResponse,
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
    ProjectMemberListResponse,
    ShareProjectRequest,
    SetVisibilityRequest,
    MigrationResult,
    MigrationDryRunResult,
    DatabaseConnectionCreate,
    DatabaseConnectionResponse,
    ConnectionTestRequest,
    ConnectionTestResult,
    IntrospectResponse,
    AuditLogResponse,
    QuotaStatus,
    BundleSize,
    QuotaRequest,
    QuotaRequestStatus,
    AdminProjectListResponse,
    QuotaRequestListResponse,
    QuotaApprovalResponse,
    TemplateListResponse,
    CreateFromTemplateRequest,
    PipelineBuilderMetadata,
    PipelineGraphResponse,
    SaveGraphRequest,
    ValidateStepRequest,
    ValidateStepResponse,
    ProjectSummaryListResponse,
    PdfBackend,
    PdfBackendResponse,
    PipelineTraceResponse,
    MCPServerConfig,
    MCPServerListResponse,
    MCPServerPatchRequest,
    MCPServerTestResult,
    LLMModelsResponse,
    DashboardOverview,
    DashboardActivityResponse,
    DashboardGranularity,
    DashboardRange,
    PipelineHealthResponse,
    TopProjectsMetric,
    TopProjectsResponse,
    EvalDataset,
    EvalCase,
    EvalRun,
    EvalCaseResult,
    EvalRunDiff,
    CreateDatasetRequest,
    UpdateDatasetRequest,
    StartRunRequest,
    SyntheticGenerationRequest,
    SyntheticGenerationResponse,
    ProjectBlueprint,
    InstantiateBlueprintRequest,
    InstantiateBlueprintResponse,
} from '../types';

/** Thrown by API methods when the server returns a non-2xx status. Carries the HTTP status code so callers can distinguish e.g. 429 from 500. */
export class ApiHttpError extends Error {
    readonly status: number;
    constructor(status: number, message: string) {
        super(message);
        this.status = status;
        this.name = 'ApiHttpError';
    }
}

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

    private getAuthHeaders(): Record<string, string> {
        return this.accessToken
            ? { Authorization: `Bearer ${this.accessToken}` }
            : {};
    }

    private async getErrorDetail(response: Response): Promise<string> {
        const error: ApiError = await response.json().catch(() => ({
            detail: `HTTP ${response.status}: ${response.statusText}`,
        }));

        return error.detail;
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
                ...this.getAuthHeaders(),
                ...options.headers,
            },
        });

        if (!response.ok) {
            throw new ApiHttpError(response.status, await this.getErrorDetail(response));
        }

        if (response.status === 204) {
            return undefined as T;
        }

        return response.json();
    }

    // ============ Projects ============

    async listTemplates(params?: {
        category?: TemplateCategory;
        page?: number;
        page_size?: number;
    }): Promise<TemplateListResponse> {
        const q = new URLSearchParams();
        if (params?.category) q.set('category', params.category);
        if (params?.page) q.set('page', String(params.page));
        if (params?.page_size) q.set('page_size', String(params.page_size));
        const qs = q.toString();
        return this.request(`/api/v1/projects/templates${qs ? `?${qs}` : ''}`);
    }

    async createProjectFromTemplate(request: CreateFromTemplateRequest): Promise<CreateProjectResponse> {
        return this.request('/api/v1/projects/from-template', {
            method: 'POST',
            body: JSON.stringify(request),
        });
    }

    async listProjectBlueprints(params?: {
        page?: number;
        page_size?: number;
    }): Promise<ProjectBlueprint[]> {
        const q = new URLSearchParams();
        if (params?.page) q.set('page', String(params.page));
        if (params?.page_size) q.set('page_size', String(params.page_size));
        const qs = q.toString();
        return this.request(`/api/v1/project-blueprints${qs ? `?${qs}` : ''}`);
    }

    async getProjectBlueprint(blueprintId: string, version: string): Promise<ProjectBlueprint> {
        return this.request(
            `/api/v1/project-blueprints/${encodeURIComponent(blueprintId)}/${encodeURIComponent(version)}`
        );
    }

    async instantiateProjectBlueprint(
        blueprintId: string,
        version: string,
        request: InstantiateBlueprintRequest
    ): Promise<InstantiateBlueprintResponse> {
        return this.request(
            `/api/v1/project-blueprints/${encodeURIComponent(blueprintId)}/${encodeURIComponent(version)}/instantiate`,
            {
                method: 'POST',
                body: JSON.stringify(request),
            }
        );
    }

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

    async getProjectLLMModels(projectId: string): Promise<LLMModelsResponse> {
        return this.request(`/api/v1/projects/${projectId}/llm-models`);
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

    async listMembers(
        projectId: string,
        page: number = 1,
        pageSize: number = 20
    ): Promise<ProjectMemberListResponse> {
        return this.request(`/api/v1/projects/${projectId}/members?page=${page}&page_size=${pageSize}`);
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

    // ============ PDF Backend ============

    /**
     * Read the project's current PDF ingestion backend, plus the catalog of
     * available backends with capability metadata (speed, visual grounding,
     * table structure support, recommended use). Used to render the selector.
     */
    async getPdfBackend(projectId: string): Promise<PdfBackendResponse> {
        return this.request(`/api/v1/projects/${projectId}/pdf-backend`);
    }

    /**
     * Switch the project's PDF ingestion backend. Only affects PDFs ingested
     * after the change — existing chunks are NOT re-processed.
     */
    async updatePdfBackend(
        projectId: string,
        pdfBackend: PdfBackend
    ): Promise<PdfBackendResponse> {
        return this.request(`/api/v1/projects/${projectId}/pdf-backend`, {
            method: 'PATCH',
            body: JSON.stringify({ pdf_backend: pdfBackend }),
        });
    }

    // ============ Chat ============

    async chat(projectId: string, request: ChatRequest): Promise<ChatResponse> {
        return this.request(`/api/v1/projects/${projectId}/chat`, {
            method: 'POST',
            body: JSON.stringify(request),
        });
    }

    async getPipelineTrace(traceId: string): Promise<PipelineTraceResponse> {
        const response = await fetch(
            `${this.baseUrl}/api/v1/traces/${encodeURIComponent(traceId)}`,
            {
                headers: {
                    Accept: 'application/json',
                    'X-User-ID': this.tenantId,
                    ...this.getAuthHeaders(),
                },
            }
        );

        if (!response.ok) {
            throw new ApiHttpError(response.status, await this.getErrorDetail(response));
        }

        return response.json();
    }

    async *streamChat(
        projectId: string,
        request: ChatRequest
    ): AsyncGenerator<StreamingChunk> {
        const parseSseData = (event: string): string => {
            const dataLines = event
                .split(/\r?\n/)
                .filter((line) => line.startsWith('data:'))
                .map((line) => line.slice(5).replace(/^ /, ''));

            return dataLines.join('\n').trim();
        };

        const response = await fetch(
            `${this.baseUrl}/api/v1/projects/${projectId}/chat/stream`,
            {
                method: 'POST',
                headers: {
                    Accept: 'text/event-stream',
                    'Content-Type': 'application/json',
                    'X-User-ID': this.tenantId,
                    ...this.getAuthHeaders(),
                },
                body: JSON.stringify(request),
            }
        );

        if (!response.ok) {
            throw new ApiHttpError(response.status, await this.getErrorDetail(response));
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
            throw new Error('No response body');
        }

        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                buffer += decoder.decode();
                break;
            }

            buffer += decoder.decode(value, { stream: true });
            const events = buffer.split(/\r?\n\r?\n/);
            buffer = events.pop() || '';

            for (const event of events) {
                const data = parseSseData(event);
                if (data === '[DONE]') return;
                if (!data) continue;

                try {
                    yield JSON.parse(data);
                } catch {
                    // Ignore malformed non-terminal events; the stream can continue.
                }
            }
        }

        const data = parseSseData(buffer);
        if (data && data !== '[DONE]') {
            try {
                yield JSON.parse(data);
            } catch {
                // Ignore a trailing malformed event.
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
        query: string,
        page: number = 1,
        pageSize: number = 20
    ): Promise<SessionListResponse> {
        return this.request(
            `/api/v1/projects/${projectId}/sessions/search?q=${encodeURIComponent(query)}&page=${page}&page_size=${pageSize}`
        );
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
        limit: number = 50,
        beforeMessageId?: string
    ): Promise<SessionMessagesResponse> {
        const q = new URLSearchParams({ limit: String(limit) });
        if (beforeMessageId) q.set('before_message_id', beforeMessageId);
        return this.request(`/api/v1/projects/${projectId}/sessions/${sessionId}/messages?${q.toString()}`);
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

    // ============ SQL Agent ============

    async getDatabaseConnection(projectId: string): Promise<DatabaseConnectionResponse> {
        return this.request(`/api/v1/projects/${projectId}/database-connection`);
    }

    async saveDatabaseConnection(
        projectId: string,
        data: DatabaseConnectionCreate
    ): Promise<DatabaseConnectionResponse> {
        return this.request(`/api/v1/projects/${projectId}/database-connection`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteDatabaseConnection(projectId: string): Promise<void> {
        return this.request(`/api/v1/projects/${projectId}/database-connection`, {
            method: 'DELETE',
        });
    }

    async testDatabaseConnection(
        projectId: string,
        data: ConnectionTestRequest
    ): Promise<ConnectionTestResult> {
        return this.request(`/api/v1/projects/${projectId}/database-connection/test`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async introspectSchema(projectId: string): Promise<IntrospectResponse> {
        return this.request(`/api/v1/projects/${projectId}/database-connection/introspect`, {
            method: 'POST',
        });
    }

    async getQueryAuditLog(
        projectId: string,
        params?: { session_id?: string; limit?: number; offset?: number }
    ): Promise<AuditLogResponse> {
        const query = new URLSearchParams();
        if (params?.session_id) query.set('session_id', params.session_id);
        if (params?.limit != null) query.set('limit', String(params.limit));
        if (params?.offset != null) query.set('offset', String(params.offset));
        const qs = query.toString();
        return this.request(
            `/api/v1/projects/${projectId}/database-connection/audit-log${qs ? `?${qs}` : ''}`
        );
    }

    // ============ MCP Servers ============

    async listMcpServers(
        projectId: string,
        page: number = 1,
        pageSize: number = 20
    ): Promise<MCPServerListResponse> {
        return this.request(`/api/v1/projects/${projectId}/mcp-servers?page=${page}&page_size=${pageSize}`);
    }

    async createMcpServer(
        projectId: string,
        data: MCPServerConfig
    ): Promise<MCPServerConfig> {
        return this.request(`/api/v1/projects/${projectId}/mcp-servers`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateMcpServer(
        projectId: string,
        name: string,
        data: MCPServerConfig
    ): Promise<MCPServerConfig> {
        return this.request(`/api/v1/projects/${projectId}/mcp-servers/${encodeURIComponent(name)}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async patchMcpServer(
        projectId: string,
        name: string,
        data: MCPServerPatchRequest
    ): Promise<MCPServerConfig> {
        return this.request(`/api/v1/projects/${projectId}/mcp-servers/${encodeURIComponent(name)}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async deleteMcpServer(projectId: string, name: string): Promise<void> {
        return this.request(`/api/v1/projects/${projectId}/mcp-servers/${encodeURIComponent(name)}`, {
            method: 'DELETE',
        });
    }

    async testMcpServer(
        projectId: string,
        data: MCPServerConfig
    ): Promise<MCPServerTestResult> {
        return this.request(`/api/v1/projects/${projectId}/mcp-servers/test`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    /**
     * Probe whether the platform has configured the `app_service_principal`
     * Azure AD app registration (SQL_AZURE_TENANT_ID / CLIENT_ID / SECRET env vars).
     * A 503 means it is NOT configured; any other response means it IS configured
     * (the test request itself may fail to connect to the dummy server — that is expected).
     */
    async checkAppServicePrincipalAvailable(projectId: string): Promise<boolean> {
        try {
            const response = await fetch(
                `${this.baseUrl}/api/v1/projects/${projectId}/database-connection/test`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-User-ID': this.tenantId,
                        ...(this.accessToken ? { Authorization: `Bearer ${this.accessToken}` } : {}),
                    },
                    body: JSON.stringify({
                        database_type: 'sqlserver',
                        auth_type: 'app_service_principal',
                        azure_server: 'probe',
                        azure_database: 'probe',
                    }),
                }
            );
            // 503 = platform env vars not configured
            return response.status !== 503;
        } catch {
            return false;
        }
    }

    // ============ Quota ============

    async getQuotaStatus(projectId: string): Promise<QuotaStatus> {
        return this.request(`/api/v1/projects/${projectId}/quota`);
    }

    async requestExtraBundle(
        projectId: string,
        bundleSize: BundleSize,
        userMessage?: string
    ): Promise<QuotaRequest> {
        return this.request(`/api/v1/projects/${projectId}/quota/request-extra`, {
            method: 'POST',
            body: JSON.stringify({ bundle_size: bundleSize, user_message: userMessage }),
        });
    }

    // ============ Admin ============

    async adminListProjects(params?: {
        page?: number;
        page_size?: number;
        status?: string;
    }): Promise<AdminProjectListResponse> {
        const q = new URLSearchParams();
        if (params?.page) q.set('page', String(params.page));
        if (params?.page_size) q.set('page_size', String(params.page_size));
        if (params?.status) q.set('status', params.status);
        const qs = q.toString();
        return this.request(`/api/v1/admin/projects${qs ? `?${qs}` : ''}`);
    }

    async adminListQuotaRequests(params?: {
        page?: number;
        page_size?: number;
        status?: QuotaRequestStatus;
    }): Promise<QuotaRequestListResponse> {
        const q = new URLSearchParams();
        if (params?.page) q.set('page', String(params.page));
        if (params?.page_size) q.set('page_size', String(params.page_size));
        if (params?.status) q.set('status', params.status);
        const qs = q.toString();
        return this.request(`/api/v1/admin/quota-requests${qs ? `?${qs}` : ''}`);
    }

    async adminApproveQuotaRequest(
        requestId: string,
        adminNote?: string
    ): Promise<QuotaApprovalResponse> {
        return this.request(`/api/v1/admin/quota-requests/${requestId}/approve`, {
            method: 'POST',
            body: JSON.stringify({ admin_note: adminNote }),
        });
    }

    async adminRejectQuotaRequest(
        requestId: string,
        adminNote?: string
    ): Promise<QuotaRequest> {
        return this.request(`/api/v1/admin/quota-requests/${requestId}/reject`, {
            method: 'POST',
            body: JSON.stringify({ admin_note: adminNote }),
        });
    }

    /** Probe whether the current user has admin access. Returns true if the admin endpoint responds with 200. */
    async probeAdminAccess(): Promise<boolean> {
        try {
            await this.request('/api/v1/admin/quota-requests?page_size=1');
            return true;
        } catch {
            return false;
        }
    }

    // ============ Project Summary (for cross-project picker) ============

    async getProjectsSummary(params?: {
        q?: string;
        page?: number;
        page_size?: number;
    }): Promise<ProjectSummaryListResponse> {
        const query = new URLSearchParams();
        if (params?.q) query.set('q', params.q);
        if (params?.page) query.set('page', String(params.page));
        if (params?.page_size) query.set('page_size', String(params.page_size));
        const qs = query.toString();
        return this.request(`/api/v1/projects/summary${qs ? `?${qs}` : ''}`);
    }

    // ============ Pipeline Builder ============

    async getPipelineMetadata(): Promise<PipelineBuilderMetadata> {
        return this.request('/api/v1/pipeline/metadata');
    }

    async getPipelineGraph(projectId: string): Promise<PipelineGraphResponse> {
        return this.request(`/api/v1/projects/${projectId}/pipeline/graph`);
    }

    async savePipelineGraph(projectId: string, request: SaveGraphRequest): Promise<PipelineGraphResponse> {
        return this.request(`/api/v1/projects/${projectId}/pipeline/graph`, {
            method: 'PUT',
            body: JSON.stringify(request),
        });
    }

    async validateStep(request: ValidateStepRequest): Promise<ValidateStepResponse> {
        return this.request('/api/v1/pipeline/validate-step', {
            method: 'POST',
            body: JSON.stringify(request),
        });
    }

    // ============ Dashboard ============

    /**
     * Aggregate overview for the dashboard landing page: lifetime + range-scoped
     * KPIs with period-over-period deltas, plus capped recent-projects and
     * recent-sessions lists. See docs/dashboard-api-spec.md.
     */
    async getDashboardOverview(range: DashboardRange = '30d'): Promise<DashboardOverview> {
        return this.request(`/api/v1/dashboard/overview?range=${range}`);
    }

    /**
     * Activity time series for the dashboard chart. Server returns gap-filled
     * points and echoes the actual `granularity` used.
     */
    async getDashboardActivity(
        range: DashboardRange = '30d',
        granularity?: DashboardGranularity
    ): Promise<DashboardActivityResponse> {
        const params = new URLSearchParams({ range });
        if (granularity) params.set('granularity', granularity);
        return this.request(`/api/v1/dashboard/activity?${params.toString()}`);
    }

    /**
     * Top N projects ranked by the chosen `metric` within the range.
     * Server clamps `limit` to 10.
     */
    async getTopProjects(
        range: DashboardRange = '30d',
        metric: TopProjectsMetric = 'sessions',
        limit: number = 5
    ): Promise<TopProjectsResponse> {
        const params = new URLSearchParams({
            range,
            metric,
            limit: String(limit),
        });
        return this.request(`/api/v1/dashboard/top-projects?${params.toString()}`);
    }

    /** Last 24h pipeline health rollup (success/error/latency). */
    async getPipelineHealth(): Promise<PipelineHealthResponse> {
        return this.request('/api/v1/dashboard/pipeline-health');
    }

    // ============ Evaluation Framework ============
    // All evaluation endpoints require the caller to be a project owner.
    // See docs/features/evaluation-frontend.md.

    async listEvalDatasets(
        projectId: string,
        skip: number = 0,
        limit: number = 100
    ): Promise<EvalDataset[]> {
        return this.request(
            `/api/v1/projects/${projectId}/eval/datasets?skip=${skip}&limit=${limit}`
        );
    }

    async createEvalDataset(
        projectId: string,
        data: CreateDatasetRequest
    ): Promise<EvalDataset> {
        return this.request(`/api/v1/projects/${projectId}/eval/datasets`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateEvalDataset(
        projectId: string,
        datasetId: string,
        data: UpdateDatasetRequest
    ): Promise<EvalDataset> {
        return this.request(`/api/v1/projects/${projectId}/eval/datasets/${datasetId}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async deleteEvalDataset(projectId: string, datasetId: string): Promise<void> {
        return this.request(`/api/v1/projects/${projectId}/eval/datasets/${datasetId}`, {
            method: 'DELETE',
        });
    }

    /**
     * Upload a CSV or JSON file of cases to a dataset. Browser sets the
     * multipart boundary, so we omit Content-Type.
     */
    async uploadEvalCases(
        projectId: string,
        datasetId: string,
        file: File
    ): Promise<EvalCase[]> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(
            `${this.baseUrl}/api/v1/projects/${projectId}/eval/datasets/${datasetId}/cases:upload`,
            {
                method: 'POST',
                headers: {
                    'X-User-ID': this.tenantId,
                    ...this.getAuthHeaders(),
                },
                body: formData,
            }
        );

        if (!response.ok) {
            throw new ApiHttpError(response.status, await this.getErrorDetail(response));
        }
        return response.json();
    }

    async generateSyntheticEvalCases(
        projectId: string,
        datasetId: string,
        targetCount: number
    ): Promise<SyntheticGenerationResponse> {
        const body: SyntheticGenerationRequest = { target_count: targetCount };
        return this.request(
            `/api/v1/projects/${projectId}/eval/datasets/${datasetId}/cases:generate-synthetic`,
            {
                method: 'POST',
                body: JSON.stringify(body),
            }
        );
    }

    async listEvalCases(
        projectId: string,
        datasetId: string,
        skip: number = 0,
        limit: number = 100
    ): Promise<EvalCase[]> {
        return this.request(
            `/api/v1/projects/${projectId}/eval/datasets/${datasetId}/cases?skip=${skip}&limit=${limit}`
        );
    }

    async deleteEvalCase(
        projectId: string,
        datasetId: string,
        caseId: string
    ): Promise<void> {
        return this.request(
            `/api/v1/projects/${projectId}/eval/datasets/${datasetId}/cases/${caseId}`,
            { method: 'DELETE' }
        );
    }

    async startEvalRun(projectId: string, request: StartRunRequest): Promise<EvalRun> {
        return this.request(`/api/v1/projects/${projectId}/eval/runs`, {
            method: 'POST',
            body: JSON.stringify({ triggered_via: 'ui', ...request }),
        });
    }

    async getEvalRun(projectId: string, runId: string): Promise<EvalRun> {
        return this.request(`/api/v1/projects/${projectId}/eval/runs/${runId}`);
    }

    async listEvalRuns(
        projectId: string,
        params?: { datasetId?: string; skip?: number; limit?: number }
    ): Promise<EvalRun[]> {
        const q = new URLSearchParams();
        if (params?.datasetId) q.set('dataset_id', params.datasetId);
        if (params?.skip !== undefined) q.set('skip', String(params.skip));
        if (params?.limit !== undefined) q.set('limit', String(params.limit));
        const qs = q.toString();
        return this.request(
            `/api/v1/projects/${projectId}/eval/runs${qs ? `?${qs}` : ''}`
        );
    }

    async listEvalRunCases(
        projectId: string,
        runId: string,
        skip: number = 0,
        limit: number = 100
    ): Promise<EvalCaseResult[]> {
        return this.request(
            `/api/v1/projects/${projectId}/eval/runs/${runId}/cases?skip=${skip}&limit=${limit}`
        );
    }

    async abortEvalRun(
        projectId: string,
        runId: string
    ): Promise<{ status: string; run_id: string }> {
        return this.request(`/api/v1/projects/${projectId}/eval/runs/${runId}:abort`, {
            method: 'POST',
        });
    }

    async diffEvalRuns(
        projectId: string,
        runA: string,
        runB: string
    ): Promise<EvalRunDiff> {
        const params = new URLSearchParams({ run_a: runA, run_b: runB });
        return this.request(
            `/api/v1/projects/${projectId}/eval/runs/diff?${params.toString()}`
        );
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
