# Frontend Integration Guide: Admin Management & Request Quota

**Base URL:** `http://localhost:8000/api/v1`
**Full API docs:** `http://localhost:8000/api-docs` (Swagger)

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [TypeScript Types](#2-typescript-types)
3. [Quota — Project Owner View](#3-quota--project-owner-view)
4. [Quota Enforcement in Chat](#4-quota-enforcement-in-chat)
5. [Admin — Platform Management](#5-admin--platform-management)
6. [Admin — Quota Request Review](#6-admin--quota-request-review)
7. [Error Reference](#7-error-reference)
8. [UI/UX Recommendations](#8-uiux-recommendations)

---

## 1. Authentication

All requests require an identity header. The backend identifies the caller via `X-User-ID`.

```ts
// Regular user
headers: { "X-User-ID": "user_abc123" }

// Admin user (user ID must be listed in ADMIN_USER_IDS on server)
headers: { "X-User-ID": "admin_user_id" }
```

**How admin is determined:** The backend compares `X-User-ID` against the `ADMIN_USER_IDS` environment variable (comma-separated). There is no separate login flow — the FE just sets the same header. Identity of whether a user is admin should come from your own auth system / user profile endpoint.

> Production note: In production replace `X-User-ID` with an `Authorization: Bearer <token>` or `X-API-Key: rag_...` header. The backend supports all three.

---

## 2. TypeScript Types

Copy-paste these types into your project (e.g. `types/quota.ts`):

```ts
// ─── Quota ───────────────────────────────────────────────────────────────────

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

export type QuotaRequestStatus = "pending" | "approved" | "rejected";

export interface QuotaRequest {
  request_id: string;
  project_id: string;
  tenant_id: string;
  requested_by: string;
  bundle_size: BundleSize;
  status: QuotaRequestStatus;
  created_at: string;       // ISO 8601
  resolved_at: string | null;
  resolved_by: string | null;
  user_message: string | null;
  admin_note: string | null;
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export interface AdminProjectListResponse {
  projects: RAGProject[];   // RAGProject is your existing project type
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

export interface ApproveRejectBody {
  admin_note?: string;
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

// ─── API Error ────────────────────────────────────────────────────────────────

export interface APIError {
  detail: string;    // human-readable message
}
```

---

## 3. Quota — Project Owner View

### 3.1 Get Quota Status

**Who can call:** Any project member (viewer, editor, owner).

```
GET /api/v1/projects/{project_id}/quota
```

```ts
async function getQuotaStatus(projectId: string): Promise<QuotaStatus> {
  const res = await fetch(`/api/v1/projects/${projectId}/quota`, {
    headers: { "X-User-ID": currentUserId },
  });
  if (!res.ok) throw new Error((await res.json()).detail);
  return res.json();
}
```

**Example response:**
```json
{
  "project_id": "abc-123",
  "total_allocated": 350,
  "used_count": 42,
  "remaining": 308,
  "last_monthly_credit": "2026-04-01T00:00:00Z",
  "months_credited": 1
}
```

**Quota lifecycle explained:**

| When | What happens |
|---|---|
| Project created | `total_allocated = 50`, `used_count = 0` (testing allocation) |
| Each calendar month | `+300` requests added lazily on next quota check |
| Extra bundle approved | `total_allocated += bundle_size` |
| Each chat request | `used_count += 1` |

**Suggested UI — Quota Progress Bar:**
```tsx
function QuotaBadge({ quota }: { quota: QuotaStatus }) {
  const pct = Math.round((quota.used_count / quota.total_allocated) * 100);
  const isLow = quota.remaining < 50;
  const isExhausted = quota.remaining === 0;

  return (
    <div className="quota-badge">
      <div className="quota-label">
        {isExhausted ? "⚠️ Quota exhausted" : `${quota.remaining} requests remaining`}
      </div>
      <div className="quota-bar">
        <div
          className={`quota-fill ${isLow ? "low" : ""} ${isExhausted ? "exhausted" : ""}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <div className="quota-detail">
        {quota.used_count} / {quota.total_allocated} used
        {quota.last_monthly_credit && (
          <span> · last refill {formatDate(quota.last_monthly_credit)}</span>
        )}
      </div>
    </div>
  );
}
```

---

### 3.2 Request an Extra Bundle

**Who can call:** Project **owner** only.
**Constraint:** Only one pending request per project is allowed at a time.

```
POST /api/v1/projects/{project_id}/quota/request-extra
Content-Type: application/json
```

**Request body:**
```json
{
  "bundle_size": 1000,
  "user_message": "We're running a user study next week and need more capacity."
}
```

| `bundle_size` | Requests added |
|---|---|
| `500` | +500 |
| `1000` | +1,000 |
| `2500` | +2,500 |

```ts
async function requestExtraBundle(
  projectId: string,
  bundleSize: BundleSize,
  userMessage?: string,
): Promise<QuotaRequest> {
  const res = await fetch(`/api/v1/projects/${projectId}/quota/request-extra`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-User-ID": currentUserId,
    },
    body: JSON.stringify({ bundle_size: bundleSize, user_message: userMessage }),
  });

  if (!res.ok) {
    const err: APIError = await res.json();
    throw new Error(err.detail);
  }
  return res.json();   // QuotaRequest with status: "pending"
}
```

**Possible errors:**

| Status | `detail` | Meaning |
|---|---|---|
| `400` | `"Invalid bundle size..."` | Use only 500, 1000, or 2500 |
| `400` | `"A pending quota request already exists..."` | User must wait for admin to resolve the current request |
| `403` | `"Insufficient permissions..."` | Only owners can request bundles |

**Suggested UI — Request Bundle Modal:**
```tsx
function RequestBundleModal({ projectId, onClose }) {
  const [size, setSize] = useState<BundleSize>(1000);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState<QuotaRequest | null>(null);

  // Check for existing pending request first
  useEffect(() => {
    // Fetch quota requests for this project to check for existing pending one
    // Show "request in review" state if found
  }, [projectId]);

  const submit = async () => {
    try {
      const req = await requestExtraBundle(projectId, size, message);
      showToast("Request submitted — an admin will review it shortly.");
      onClose();
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  return (
    <Modal title="Request Extra Quota">
      <p>Choose a bundle size to request from the admin team:</p>
      <RadioGroup value={size} onChange={setSize}>
        <Radio value={500}>500 requests</Radio>
        <Radio value={1000}>1,000 requests  <Badge>Recommended</Badge></Radio>
        <Radio value={2500}>2,500 requests</Radio>
      </RadioGroup>
      <Textarea
        label="Optional message to admin"
        value={message}
        onChange={setMessage}
        placeholder="Describe why you need extra capacity..."
      />
      <Button onClick={submit}>Submit Request</Button>
    </Modal>
  );
}
```

---

## 4. Quota Enforcement in Chat

All three chat endpoints now return `429 Too Many Requests` when the project quota is exhausted.

```
POST /api/v1/projects/{project_id}/chat
POST /api/v1/projects/{project_id}/chat/stream
POST /api/v1/projects/{project_id}/chat/text
```

**429 response body:**
```json
{
  "detail": "Request quota exhausted (350/350 used). Request an extra bundle or wait for the next monthly credit."
}
```

### Handling quota errors in chat

```ts
async function sendChatMessage(projectId: string, query: string) {
  const res = await fetch(`/api/v1/projects/${projectId}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-User-ID": currentUserId,
    },
    body: JSON.stringify({ query }),
  });

  if (res.status === 429) {
    const err: APIError = await res.json();
    // Surface a quota-specific UI — NOT a generic error toast
    throw new QuotaExhaustedError(err.detail);
  }

  if (!res.ok) throw new Error((await res.json()).detail);
  return res.json();
}

// In your chat component:
try {
  const response = await sendChatMessage(projectId, userInput);
  displayResponse(response);
} catch (e) {
  if (e instanceof QuotaExhaustedError) {
    showQuotaBanner(projectId);   // Show inline quota warning + "Request more" button
  } else {
    showErrorToast(e.message);
  }
}
```

**Recommended in-chat quota banner (shown on 429):**
```tsx
function QuotaExhaustedBanner({ projectId, onRequestMore }) {
  return (
    <div className="quota-exhausted-banner">
      <WarningIcon />
      <div>
        <strong>Request quota reached</strong>
        <p>
          This project has used all its available requests.
          Monthly credits are added automatically each calendar month.
        </p>
      </div>
      <Button variant="primary" onClick={onRequestMore}>
        Request extra quota
      </Button>
    </div>
  );
}
```

---

## 5. Admin — Platform Management

All `/admin/*` endpoints require the caller's `X-User-ID` to match a value in the server's `ADMIN_USER_IDS` env var. A non-admin caller gets `403`.

> Your frontend should know if the current user is an admin from your auth/user profile system — gate the admin UI entirely rather than letting users discover endpoints via 403 errors.

### 5.1 List All Projects

```
GET /api/v1/admin/projects?status=active&page=1&page_size=20
```

**Query parameters:**

| Param | Type | Default | Description |
|---|---|---|---|
| `status` | `"draft" \| "active" \| "archived"` | — | Filter by project status |
| `page` | integer ≥ 1 | `1` | Page number |
| `page_size` | integer 1–100 | `20` | Items per page |

```ts
async function adminListProjects(params?: {
  status?: "draft" | "active" | "archived";
  page?: number;
  page_size?: number;
}): Promise<AdminProjectListResponse> {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.page_size) qs.set("page_size", String(params.page_size));

  const res = await fetch(`/api/v1/admin/projects?${qs}`, {
    headers: { "X-User-ID": adminUserId },
  });
  if (!res.ok) throw new Error((await res.json()).detail);
  return res.json();
}
```

**Example response:**
```json
{
  "projects": [
    {
      "project_id": "abc-123",
      "tenant_id": "user_xyz",
      "name": "Legal Document Bot",
      "status": "active",
      "request_quota": {
        "total_allocated": 350,
        "used_count": 42,
        "last_monthly_credit": "2026-04-01T00:00:00Z",
        "months_credited": 1
      },
      ...
    }
  ],
  "total": 84,
  "page": 1,
  "page_size": 20
}
```

> The full `RAGProject` object is returned per project, including the embedded `request_quota` — so you can show each project's quota inline in the admin table without extra API calls.

### 5.2 Get a Single Project (Admin)

```
GET /api/v1/admin/projects/{project_id}
```

```ts
async function adminGetProject(projectId: string): Promise<RAGProject> {
  const res = await fetch(`/api/v1/admin/projects/${projectId}`, {
    headers: { "X-User-ID": adminUserId },
  });
  if (res.status === 404) throw new Error("Project not found");
  if (!res.ok) throw new Error((await res.json()).detail);
  return res.json();
}
```

---

## 6. Admin — Quota Request Review

This is the core admin workflow: users submit bundle requests, admins approve or reject them.

### 6.1 List Quota Requests

```
GET /api/v1/admin/quota-requests?status=pending&page=1&page_size=20
```

**Query parameters:**

| Param | Type | Default | Description |
|---|---|---|---|
| `status` | `"pending" \| "approved" \| "rejected"` | — | Filter by status (omit for all) |
| `page` | integer ≥ 1 | `1` | Page number |
| `page_size` | integer 1–100 | `20` | Items per page |

```ts
async function adminListQuotaRequests(params?: {
  status?: QuotaRequestStatus;
  page?: number;
  page_size?: number;
}): Promise<QuotaRequestListResponse> {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.page_size) qs.set("page_size", String(params.page_size));

  const res = await fetch(`/api/v1/admin/quota-requests?${qs}`, {
    headers: { "X-User-ID": adminUserId },
  });
  if (!res.ok) throw new Error((await res.json()).detail);
  return res.json();
}
```

**Example response:**
```json
{
  "requests": [
    {
      "request_id": "d1e2f3...",
      "project_id": "abc-123",
      "tenant_id": "user_xyz",
      "requested_by": "user_xyz",
      "bundle_size": 1000,
      "status": "pending",
      "created_at": "2026-04-04T10:30:00Z",
      "resolved_at": null,
      "resolved_by": null,
      "user_message": "Running a user study next week.",
      "admin_note": null
    }
  ],
  "total": 3,
  "page": 1,
  "page_size": 20
}
```

### 6.2 Approve a Request

```
POST /api/v1/admin/quota-requests/{request_id}/approve
Content-Type: application/json
```

**Request body:**
```json
{
  "admin_note": "Approved for user study. Come back if you need more."
}
```

`admin_note` is optional.

```ts
async function approveQuotaRequest(
  requestId: string,
  adminNote?: string,
): Promise<QuotaApprovalResponse> {
  const res = await fetch(`/api/v1/admin/quota-requests/${requestId}/approve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-User-ID": adminUserId,
    },
    body: JSON.stringify({ admin_note: adminNote }),
  });

  if (res.status === 409) {
    const err: APIError = await res.json();
    throw new Error(err.detail);  // Already approved/rejected
  }
  if (!res.ok) throw new Error((await res.json()).detail);
  return res.json();
}
```

**Example response:**
```json
{
  "quota_request": {
    "request_id": "d1e2f3...",
    "status": "approved",
    "resolved_by": "admin_user_id",
    "resolved_at": "2026-04-04T11:00:00Z",
    "admin_note": "Approved for user study.",
    ...
  },
  "updated_quota": {
    "total_allocated": 1350,
    "used_count": 42,
    "last_monthly_credit": "2026-04-01T00:00:00Z",
    "months_credited": 1
  },
  "message": "Approved: 1000 requests credited to project abc-123."
}
```

### 6.3 Reject a Request

```
POST /api/v1/admin/quota-requests/{request_id}/reject
Content-Type: application/json
```

**Request body:**
```json
{
  "admin_note": "Please provide more justification for this request."
}
```

```ts
async function rejectQuotaRequest(
  requestId: string,
  adminNote?: string,
): Promise<QuotaRequest> {
  const res = await fetch(`/api/v1/admin/quota-requests/${requestId}/reject`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-User-ID": adminUserId,
    },
    body: JSON.stringify({ admin_note: adminNote }),
  });

  if (res.status === 409) throw new Error((await res.json()).detail);
  if (!res.ok) throw new Error((await res.json()).detail);
  return res.json();  // QuotaRequest with status: "rejected"
}
```

**Possible errors for approve/reject:**

| Status | Meaning |
|---|---|
| `403` | Caller is not an admin |
| `409` | Request was already approved or rejected by another admin |

### 6.4 Admin Quota Dashboard (suggested implementation)

```tsx
function AdminQuotaDashboard() {
  const [requests, setRequests] = useState<QuotaRequest[]>([]);
  const [pendingCount, setPendingCount] = useState(0);

  // Load pending requests on mount
  useEffect(() => {
    adminListQuotaRequests({ status: "pending" }).then((res) => {
      setRequests(res.requests);
      setPendingCount(res.total);
    });
  }, []);

  const handleApprove = async (req: QuotaRequest, note: string) => {
    const result = await approveQuotaRequest(req.request_id, note);
    showToast(`✓ Approved: +${req.bundle_size} requests for project ${req.project_id}`);
    setRequests((prev) => prev.filter((r) => r.request_id !== req.request_id));
  };

  const handleReject = async (req: QuotaRequest, note: string) => {
    await rejectQuotaRequest(req.request_id, note);
    showToast("Request rejected.");
    setRequests((prev) => prev.filter((r) => r.request_id !== req.request_id));
  };

  return (
    <div>
      <h2>Quota Requests {pendingCount > 0 && <Badge>{pendingCount} pending</Badge>}</h2>
      {requests.map((req) => (
        <QuotaRequestCard
          key={req.request_id}
          request={req}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      ))}
    </div>
  );
}

function QuotaRequestCard({ request, onApprove, onReject }) {
  const [note, setNote] = useState("");

  return (
    <Card>
      <div><strong>Project:</strong> {request.project_id}</div>
      <div><strong>Requested by:</strong> {request.requested_by}</div>
      <div><strong>Bundle size:</strong> +{request.bundle_size} requests</div>
      <div><strong>Submitted:</strong> {formatDate(request.created_at)}</div>
      {request.user_message && (
        <blockquote>{request.user_message}</blockquote>
      )}
      <Textarea
        placeholder="Optional note to user..."
        value={note}
        onChange={setNote}
      />
      <Button variant="success" onClick={() => onApprove(request, note)}>
        Approve
      </Button>
      <Button variant="danger" onClick={() => onReject(request, note)}>
        Reject
      </Button>
    </Card>
  );
}
```

---

## 7. Error Reference

| HTTP Status | When it occurs | How to handle |
|---|---|---|
| `400` | Invalid input (bad bundle size, duplicate pending request) | Show `detail` message inline near the form |
| `401` | Missing or invalid API key | Redirect to login |
| `403` | Insufficient role, or non-admin calling admin endpoint | Show permission denied message |
| `404` | Project or request not found | Show not-found state |
| `409` | Admin tried to approve/reject an already-resolved quota request | Refresh list (other admin resolved it first); show `detail` |
| `429` | Chat: project quota exhausted | Show quota-exhausted banner with "Request more" CTA |
| `500` | Server error | Generic error toast, do not retry automatically |

All error responses follow this shape:
```json
{ "detail": "Human-readable message here" }
```

---

## 8. UI/UX Recommendations

### Quota display placement
- Show `QuotaBadge` in the project sidebar / settings page header
- Re-fetch quota after each successful chat response to keep the count fresh
- Show a **soft warning** when `remaining < 50` and a **hard banner** when `remaining === 0`

### Admin notifications
- Poll `GET /api/v1/admin/quota-requests?status=pending` on a short interval (e.g. 60s) or use a WebSocket if available to show a notification badge on the admin nav
- Badge should disappear when `total === 0`

### Monthly credit communication
- In the quota widget, show when the next monthly credit will arrive:
  "Next +300 on May 1, 2026" — calculate client-side as `firstDayOfNextMonth(lastMonthlyCredit ?? projectCreatedAt)`
- If `last_monthly_credit` is `null`, the first monthly credit will arrive at the start of the month following project creation

### Bundle size selection
- Label the bundles clearly in the request modal:
  - `500` → "Small — quick experiments, prototyping"
  - `1000` → "Standard — production workloads" *(Recommended)*
  - `2500` → "Large — high-volume or batch usage"
- After a request is submitted, show pending status: "Your request for +1,000 requests is under review" and disable the request button
