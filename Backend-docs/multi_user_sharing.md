# Multi-User Project Sharing — Frontend Integration Guide

This document describes every change a frontend application needs to make to support the new **multi-user project sharing** feature in RAG-as-a-Service.

---

## Table of Contents

1. [Summary of Changes](#summary-of-changes)
2. [Authentication Header Changes](#authentication-header-changes)
3. [New API Endpoints](#new-api-endpoints)
   - [Share a Project](#1-share-a-project)
   - [List Project Members](#2-list-project-members)
   - [Revoke Access](#3-revoke-access)
   - [Set Visibility](#4-set-project-visibility)
   - [Migration (Admin)](#5-run-owner-backfill-migration)
   - [Check Migration Status (Admin)](#6-check-migration-status)
4. [Changed API Behavior](#changed-api-behavior)
   - [Public Projects](#public-projects)
   - [List Projects](#list-projects-now-includes-shared-projects)
   - [Role-Based Permissions](#role-based-permissions)
5. [TypeScript Interfaces](#typescript-interfaces)
6. [UI Components to Build](#ui-components-to-build)
   - [Project Members Panel](#project-members-panel)
   - [Share Dialog](#share-dialog)
   - [Role Badges](#role-badges)
   - [Permission-Gated UI](#permission-gated-ui)
7. [Error Handling](#error-handling)
8. [Migration Workflow](#migration-workflow)
9. [Complete API Client Example](#complete-api-client-example)

---

## Summary of Changes

| Area | What Changed | FE Impact |
|------|-------------|-----------|
| **Auth header** | `X-User-ID` is now the canonical header (replaces `X-Tenant-ID`) | Update HTTP client to send `X-User-ID` |
| **Project list** | `GET /projects` returns owned **and shared** projects | Add "Role" column/badge; distinguish "My Projects" vs "Shared with me" |
| **Project model** | New fields: `owner_id`, `members[]` | Update TypeScript types |
| **Sharing** | 3 new endpoints under `/projects/{id}/members` | Build sharing UI |
| **Visibility** | New `PATCH /projects/{id}/visibility` endpoint | Build public/private toggle (owner only) |
| **Permissions** | Endpoints enforce role checks (owner / editor / viewer) | Conditionally hide/disable buttons based on user role |
| **Migration API** | `POST /admin/migrations/backfill-owners` | Admin panel button (optional) |

---

## Authentication Header Changes

### Before

```typescript
headers: {
  'X-Tenant-ID': userId
}
```

### After

```typescript
headers: {
  'X-User-ID': userId   // ✅ New canonical header
}
```

> **Backward compatibility**: The backend still accepts `X-Tenant-ID` as a fallback, but new code should use `X-User-ID`. We recommend updating your HTTP client immediately.

### Update your API client

```typescript
// api-client.ts — update the base headers
const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'X-User-ID': getCurrentUserId(),  // was 'X-Tenant-ID'
  },
});
```

---

## New API Endpoints

### 1. Share a Project

Grants another user access to a project. **Owner only.**

```
POST /api/v1/projects/{project_id}/members
```

**Request:**

```typescript
// Headers
{ 'X-User-ID': 'owner-user-id' }

// Body
{
  "user_id": "target-user-id",
  "role": "editor"   // "editor" | "viewer" (default: "viewer")
}
```

**Response (201):**

```json
{
  "user_id": "target-user-id",
  "role": "editor",
  "added_at": "2026-03-06T12:00:00Z",
  "added_by": "owner-user-id"
}
```

**Errors:**

| Code | Meaning |
|------|---------|
| 400 | Self-share attempt or user already a member with same role |
| 403 | Caller is not the project owner |
| 404 | Project not found |

> **Tip:** If the target user is already a member with a *different* role, the API automatically updates their role instead of returning an error.

---

### 2. List Project Members

Returns all members including the owner. **Viewer+ can access.**

```
GET /api/v1/projects/{project_id}/members
```

**Response (200):**

```json
[
  {
    "user_id": "owner-user-id",
    "role": "owner",
    "added_at": "2026-01-15T08:00:00Z",
    "added_by": null
  },
  {
    "user_id": "editor-user-id",
    "role": "editor",
    "added_at": "2026-03-01T10:30:00Z",
    "added_by": "owner-user-id"
  }
]
```

---

### 3. Revoke Access

Remove a user from the project. **Owner only.**

```
DELETE /api/v1/projects/{project_id}/members/{target_user_id}
```

**Response:** `204 No Content`

**Errors:**

| Code | Meaning |
|------|---------|
| 403 | Caller is not the project owner |
| 404 | Project not found or target user is not a member |

---

### 4. Set Project Visibility

Toggle a project between **private** and **public**. **Owner only.**

```
PATCH /api/v1/projects/{project_id}/visibility
```

**Request:**

```typescript
// Headers
{ 'X-User-ID': 'owner-user-id' }

// Body
{
  "visibility": "public"   // "public" | "private"
}
```

**Response (200):** Returns the full updated `RAGProject` object.

**Errors:**

| Code | Meaning |
|------|---------|  
| 403 | Caller is not the project owner |
| 404 | Project not found |

> **Public projects** are visible to every authenticated user with implicit **viewer** access (chat + read). The owner and explicit members retain their higher roles.

---

### 5. Run Owner-Backfill Migration

Backfills `owner_id`, `members`, and `visibility` on legacy projects. **Idempotent — safe to call multiple times.**

```
POST /api/v1/admin/migrations/backfill-owners
```

**Response (200):**

```json
{
  "migration": "backfill-owners",
  "status": "completed",
  "projects_found": 42,
  "projects_updated": 42,
  "projects_remaining": 0,
  "index_created": true,
  "message": "Migrated 42/42 projects.",
  "executed_at": "2026-03-06T14:00:00Z",
  "executed_by": "admin-user"
}
```

| `status` value | Meaning |
|----------------|---------|
| `completed` | All projects migrated |
| `no_action_needed` | Already up to date |
| `partial` | Some projects could not be migrated |

---

### 6. Check Migration Status

Dry-run: see how many projects still need migration without changing data.

```
GET /api/v1/admin/migrations/backfill-owners
```

**Response (200):**

```json
{
  "migration": "backfill-owners",
  "projects_needing_migration": 5,
  "total_projects": 100,
  "message": "5 out of 100 projects need owner_id backfill. POST this endpoint to run the migration."
}
```

---

## Changed API Behavior

### List Projects Now Includes Shared Projects

`GET /api/v1/projects` now returns **all projects the user can access** — both owned and shared.

**Before:** Only projects where `tenant_id == user_id`.  
**After:** Projects where `owner_id == user_id` OR `tenant_id == user_id` OR user is in `members[]` **OR** `visibility == "public"`.

The response shape is unchanged. To distinguish ownership, check the new fields on each project:

```typescript
const projects = await listProjects();

for (const project of projects) {
  const isOwner = project.owner_id === currentUserId || project.tenant_id === currentUserId;
  const member = project.members.find(m => m.user_id === currentUserId);

  if (isOwner) {
    // This user owns the project
  } else if (member) {
    // This project was shared with the user
    const myRole = member.role;
  } else if (project.visibility === 'public') {
    // Public project — implicit viewer access
  }
}
```

### Public Projects

When a project's `visibility` is set to `"public"`:

- **Any authenticated user** can see it in their project list and has implicit **viewer** access (chat, read documents, view sessions).
- The **owner** and **explicit members** retain their higher roles (editor/owner).
- Only the **owner** can toggle visibility.
- Public projects should be visually distinguished in the project list (e.g., a 🌐 icon or "Public" badge).

### Role-Based Permissions

Endpoints now enforce role-based access. If the user's role is insufficient, the API returns **403 Forbidden**.

| Action | Minimum Role | Endpoint |
|--------|-------------|----------|
| Chat / query | viewer | `POST /projects/{id}/chat` |
| Read documents | viewer | `GET /projects/{id}/documents` |
| View sessions | viewer | `GET /projects/{id}/sessions` |
| View widget config | viewer | `GET /projects/{id}/widget/config` |
| Upload documents | editor | `POST /projects/{id}/documents` |
| Delete documents | editor | `DELETE /projects/{id}/documents/{doc_id}` |
| Edit project config | editor | `PUT /projects/{id}` |
| Activate / archive | editor | `POST /projects/{id}/activate` |
| Delete project | owner | `DELETE /projects/{id}` |
| Manage API keys | owner | `POST /projects/{id}/api-keys` |
| Share / revoke | owner | `POST/DELETE /projects/{id}/members` |
| Set visibility | owner | `PATCH /projects/{id}/visibility` |

---

## TypeScript Interfaces

Add these types to your frontend codebase:

```typescript
// ──────────────────────────────────────────────
// Roles
// ──────────────────────────────────────────────

type ProjectRole = 'owner' | 'editor' | 'viewer';

// ──────────────────────────────────────────────
// Project Member
// ──────────────────────────────────────────────

interface ProjectMember {
  user_id: string;
  role: ProjectRole;
  added_at: string;          // ISO 8601 datetime
  added_by: string | null;   // null for the owner
}

// ──────────────────────────────────────────────
// Updated Project model (new fields marked ✨)
// ──────────────────────────────────────────────

interface RAGProject {
  project_id: string;
  tenant_id: string;
  owner_id: string | null;     // ✨ null on legacy projects pre-migration
  members: ProjectMember[];    // ✨ empty until project is shared
  visibility: 'private' | 'public';  // ✨ default "private"
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  status: 'draft' | 'active' | 'archived';
  version: number;
  config: ProjectConfig;
  endpoints: ChatEndpoint[];
  api_keys: APIKey[];
}

// ──────────────────────────────────────────────
// Share / revoke requests
// ──────────────────────────────────────────────

interface ShareProjectRequest {
  user_id: string;
  role: 'editor' | 'viewer';   // "owner" cannot be assigned
}

interface SetVisibilityRequest {
  visibility: 'private' | 'public';
}

interface ProjectMemberResponse {
  user_id: string;
  role: ProjectRole;
  added_at: string;
  added_by: string | null;
}

// ──────────────────────────────────────────────
// Migration (admin)
// ──────────────────────────────────────────────

interface MigrationResult {
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

interface MigrationDryRunResult {
  migration: string;
  projects_needing_migration: number;
  total_projects: number;
  message: string;
}
```

### Helper: determine user's role on a project

```typescript
function getUserRole(project: RAGProject, userId: string): ProjectRole | null {
  // Owner check (handles both new and legacy projects)
  if (project.owner_id === userId || project.tenant_id === userId) {
    return 'owner';
  }
  // Member check
  const member = project.members.find(m => m.user_id === userId);
  if (member) return member.role;
  // Public projects grant implicit viewer access
  if (project.visibility === 'public') return 'viewer';
  return null;
}

function hasPermission(
  project: RAGProject,
  userId: string,
  requiredRole: ProjectRole
): boolean {
  const hierarchy: Record<ProjectRole, number> = {
    viewer: 1,
    editor: 2,
    owner: 3,
  };
  const role = getUserRole(project, userId);
  if (!role) return false;
  return hierarchy[role] >= hierarchy[requiredRole];
}
```

---

## UI Components to Build

### Project Members Panel

Display on the project settings page. Shows all members with their roles.

```
┌──────────────────────────────────────────────────────────────┐
│  Team Members                                [+ Share]       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  👤 alice@company.com          Owner          ─              │
│  👤 bob@company.com            Editor         [Remove]       │
│  👤 carol@company.com          Viewer         [Remove]       │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

- The **owner** row should not have a "Remove" button.
- The **[+ Share]** and **[Remove]** buttons are only visible to the owner.
- Editors and viewers can see the member list but cannot modify it.

### Share Dialog

```
┌──────────────────────────────────────────────────────────────┐
│  Share Project                                         [X]   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  User ID *                                                   │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ bob@company.com                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  Role                                                        │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Viewer  ▼                                              │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  Role descriptions:                                          │
│  • Viewer — Can chat and read documents (read-only)         │
│  • Editor — Can also upload/delete documents and edit config │
│                                                              │
│              [Cancel]          [Share]                       │
└──────────────────────────────────────────────────────────────┘
```

### Role Badges

Show the user's role on each project in the project list.

```
┌──────────────────────────────────────────────────────────────┐
│  My Projects                                                 │
├──────────────────────────────────────────────────────────────┤
│  📁 Legal Document Assistant     Active   [Owner]       →   │
│  📁 HR Knowledge Base            Draft    [Owner]       →   │
│  📁 Engineering Docs (shared)    Active   [Editor]      →   │
│  📁 Sales Playbook (shared)      Active   [Viewer]      →   │
│  🌐 Company FAQ (public)         Active   [Viewer]      →   │
└──────────────────────────────────────────────────────────────┘
```

Suggested badge colors:

| Role | Color | Hex |
|------|-------|-----|
| Owner | Purple | `#7c3aed` |
| Editor | Blue | `#2563eb` |
| Viewer | Gray | `#6b7280` |

| Visibility | Icon/Badge | Suggested Style |
|---|---|---|
| Public | 🌐 Public | Green border / `#059669` |
| Private | 🔒 Private | Default / no extra badge |

### Permission-Gated UI

Conditionally show/hide UI elements based on the user's role.

```typescript
// React example
function ProjectActions({ project, userId }: Props) {
  const role = getUserRole(project, userId);
  const isOwner = role === 'owner';
  const isEditorOrAbove = hasPermission(project, userId, 'editor');

  return (
    <div>
      {/* Everyone can see chat */}
      <ChatButton />

      {/* Editor+ can upload docs */}
      {isEditorOrAbove && <UploadButton />}
      {isEditorOrAbove && <DeleteDocButton />}
      {isEditorOrAbove && <EditConfigButton />}

      {/* Owner-only actions */}
      {isOwner && <VisibilityToggle project={project} />}
      {isOwner && <ShareButton />}
      {isOwner && <DeleteProjectButton />}
      {isOwner && <ApiKeysButton />}
    </div>
  );
}
```

---

## Error Handling

Two new error types to handle:

### 403 Forbidden (Authorization)

Returned when the user has access to the project but insufficient role.

```json
{ "detail": "Insufficient permissions. Required role: editor" }
```

**UI action:** Show a toast like *"You don't have permission to perform this action"* and hide/disable the relevant button.

### 403 Forbidden (No Access)

Returned when the user has no access to the project at all.

```json
{ "detail": "You do not have access to this project" }
```

**UI action:** Redirect to the project list or show a *"Project not found"* page.

### Example error handler

```typescript
async function apiCall<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (error.response?.status === 403) {
      const msg = error.response.data?.detail || 'Access denied';
      if (msg.includes('do not have access')) {
        // User is not a member — redirect
        router.push('/projects');
        toast.error('You no longer have access to this project');
      } else {
        // Insufficient role — disable the action
        toast.warning(msg);
      }
    }
    throw error;
  }
}
```

---

## Migration Workflow

Before deploying this feature to production, existing projects need to be migrated to populate the `owner_id` field.

### Option A: Admin Panel Button (recommended)

Add a button to your admin dashboard:

```typescript
// Check status first
const status = await fetch('/api/v1/admin/migrations/backfill-owners', {
  headers: { 'X-User-ID': adminUserId },
});
const data: MigrationDryRunResult = await status.json();

if (data.projects_needing_migration > 0) {
  // Show migration prompt
  showMigrationBanner(
    `${data.projects_needing_migration} projects need migration.`
  );
}

// Run migration
async function runMigration() {
  const result = await fetch('/api/v1/admin/migrations/backfill-owners', {
    method: 'POST',
    headers: { 'X-User-ID': adminUserId },
  });
  const data: MigrationResult = await result.json();
  
  if (data.status === 'completed') {
    toast.success(`Migrated ${data.projects_updated} projects`);
  } else if (data.status === 'no_action_needed') {
    toast.info('All projects are already up to date');
  } else {
    toast.warning(data.message);
  }
}
```

### Option B: Automatic on Deploy

Call the migration endpoint from your CI/CD pipeline after deployment:

```bash
curl -X POST https://your-api.com/api/v1/admin/migrations/backfill-owners \
  -H "X-User-ID: ci-admin"
```

---

## Complete API Client Example

```typescript
class ProjectSharingClient {
  private baseUrl: string;
  private userId: string;

  constructor(baseUrl: string, userId: string) {
    this.baseUrl = baseUrl;
    this.userId = userId;
  }

  private headers() {
    return {
      'Content-Type': 'application/json',
      'X-User-ID': this.userId,
    };
  }

  // ── Projects (updated) ──────────────────────────

  /** Lists all projects the user owns OR has been shared with */
  async listProjects(page = 1, pageSize = 20): Promise<{
    projects: RAGProject[];
    total: number;
  }> {
    const res = await fetch(
      `${this.baseUrl}/projects?page=${page}&page_size=${pageSize}`,
      { headers: this.headers() }
    );
    return res.json();
  }

  // ── Visibility ──────────────────────────────────

  /** Set project visibility to public or private (owner only) */
  async setVisibility(
    projectId: string,
    visibility: 'public' | 'private'
  ): Promise<RAGProject> {
    const res = await fetch(
      `${this.baseUrl}/projects/${projectId}/visibility`,
      {
        method: 'PATCH',
        headers: this.headers(),
        body: JSON.stringify({ visibility }),
      }
    );
    if (!res.ok) throw await this.parseError(res);
    return res.json();
  }

  // ── Sharing ─────────────────────────────────────

  /** Share a project with another user (owner only) */
  async shareProject(
    projectId: string,
    targetUserId: string,
    role: 'editor' | 'viewer' = 'viewer'
  ): Promise<ProjectMemberResponse> {
    const res = await fetch(
      `${this.baseUrl}/projects/${projectId}/members`,
      {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify({ user_id: targetUserId, role }),
      }
    );
    if (!res.ok) throw await this.parseError(res);
    return res.json();
  }

  /** List all members of a project (viewer+ can access) */
  async listMembers(projectId: string): Promise<ProjectMemberResponse[]> {
    const res = await fetch(
      `${this.baseUrl}/projects/${projectId}/members`,
      { headers: this.headers() }
    );
    if (!res.ok) throw await this.parseError(res);
    return res.json();
  }

  /** Remove a user from the project (owner only) */
  async revokeMember(
    projectId: string,
    targetUserId: string
  ): Promise<void> {
    const res = await fetch(
      `${this.baseUrl}/projects/${projectId}/members/${targetUserId}`,
      { method: 'DELETE', headers: this.headers() }
    );
    if (!res.ok) throw await this.parseError(res);
  }

  // ── Admin ───────────────────────────────────────

  /** Check how many projects need migration (dry run) */
  async checkMigration(): Promise<MigrationDryRunResult> {
    const res = await fetch(
      `${this.baseUrl}/admin/migrations/backfill-owners`,
      { headers: this.headers() }
    );
    return res.json();
  }

  /** Run the owner-backfill migration */
  async runMigration(): Promise<MigrationResult> {
    const res = await fetch(
      `${this.baseUrl}/admin/migrations/backfill-owners`,
      { method: 'POST', headers: this.headers() }
    );
    return res.json();
  }

  // ── Helpers ─────────────────────────────────────

  private async parseError(res: Response) {
    const body = await res.json().catch(() => ({}));
    return { status: res.status, detail: body.detail || 'Unknown error' };
  }
}
```

---

## Checklist for Frontend Teams

- [ ] Replace `X-Tenant-ID` header with `X-User-ID` in HTTP client
- [ ] Update `RAGProject` TypeScript interface (add `owner_id`, `members`)
- [ ] Add `ProjectMember`, `ShareProjectRequest`, `ProjectMemberResponse` types
- [ ] Add role badge to project list items (Owner / Editor / Viewer)
- [ ] Distinguish "My Projects" vs "Shared with me" in project list (optional)
- [ ] Build "Team Members" panel on project settings page
- [ ] Build "Share Project" dialog (owner only)
- [ ] Conditionally show/hide UI elements based on user role
- [ ] Handle 403 errors gracefully (toast + redirect)
- [ ] Add public/private visibility toggle on project settings (owner only)
- [ ] Show 🌐 Public badge on public projects in the project list
- [ ] Add migration button/banner to admin panel (optional)
- [ ] Test: any authenticated user can view/chat on a public project
- [ ] Test: viewer can chat but cannot upload docs
- [ ] Test: editor can upload but cannot delete project
- [ ] Test: owner can share, revoke, delete
