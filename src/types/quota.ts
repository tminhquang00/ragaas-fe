// ─── Quota & Admin Domain Types ───────────────────────────────────────────────
import type { Project } from './index';

export interface QuotaStatus {
    project_id: string;
    total_allocated: number;
    used_count: number;
    remaining: number;
    last_monthly_credit: string | null;  // ISO 8601 UTC datetime or null
    months_credited: number;
}

export type BundleSize = 500 | 1000 | 2500;

export interface RequestBundleBody {
    bundle_size: BundleSize;
    user_message?: string;
}

export type QuotaRequestStatus = 'pending' | 'approved' | 'rejected';

export interface QuotaRequest {
    request_id: string;
    project_id: string;
    tenant_id: string;
    requested_by: string;
    bundle_size: BundleSize;
    status: QuotaRequestStatus;
    created_at: string;
    resolved_at: string | null;
    resolved_by: string | null;
    user_message: string | null;
    admin_note: string | null;
}

export interface AdminProjectListResponse {
    projects: Project[];
    total: number;
    page: number;
    page_size: number;
}

export interface QuotaRequestListResponse {
    requests: QuotaRequest[];
    total: number;
    page: number;
    page_size: number;
}

export interface QuotaApprovalResponse {
    quota_request: QuotaRequest;
    updated_quota: {
        total_allocated: number;
        used_count: number;
        last_monthly_credit: string | null;
        months_credited: number;
    };
    message: string;
}
