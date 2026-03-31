# SQL Agent - Frontend Integration Guide

## Overview

The SQL Agent feature allows users to connect a relational database to a project and chat with it using natural language. This document covers all API endpoints the frontend needs to integrate with.

**Base URL**: `/api/v1`
**Auth**: All requests require `X-User-ID` header (tenant ID).

---

## 1. Authentication Modes

Three authentication modes are supported. The `auth_type` field controls which fields are required.

| `auth_type` | Who provides credentials | Supported DB |
|---|---|---|
| `connection_string` | User provides a full connection URI | All |
| `service_principal` | User provides their own Azure AD client_id + client_secret | SQL Server only |
| `app_service_principal` | Platform uses its own pre-configured app registration — user only provides server + database | SQL Server only |

> **`app_service_principal`** is the zero-credential option. The platform admin configures `SQL_AZURE_TENANT_ID`, `SQL_AZURE_CLIENT_ID`, and `SQL_AZURE_CLIENT_SECRET` once as environment variables, and users just pick a server and database. If those env vars are not set, this mode returns `503`.

---

## 2. API Endpoints

### 2.1 Create / Update Database Connection

**`PUT /api/v1/projects/{project_id}/database-connection`**

Creates or replaces the database connection for a project. Tests the connection before saving. Triggers automatic schema introspection.

#### connection_string auth
```json
{
  "database_type": "postgresql",
  "auth_type": "connection_string",
  "connection_string": "postgresql://user:password@host:5432/dbname",
  "display_name": "Sales Database",
  "include_tables": ["orders", "customers", "products"],
  "exclude_tables": [],
  "max_result_rows": 500,
  "query_timeout_seconds": 30
}
```

#### service_principal auth (user's own Azure app)
```json
{
  "database_type": "sqlserver",
  "auth_type": "service_principal",
  "azure_server": "myserver.database.windows.net",
  "azure_database": "MyDB",
  "azure_tenant_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "azure_client_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "azure_client_secret": "your-client-secret",
  "display_name": "Azure SQL Database",
  "max_result_rows": 500,
  "query_timeout_seconds": 30
}
```

#### app_service_principal auth (platform's app — no credentials needed from user)
```json
{
  "database_type": "sqlserver",
  "auth_type": "app_service_principal",
  "azure_server": "myserver.database.windows.net",
  "azure_database": "MyDB",
  "display_name": "Azure SQL Database",
  "max_result_rows": 500,
  "query_timeout_seconds": 30
}
```

**Fields reference:**

| Field | Type | Required for | Description |
|---|---|---|---|
| `database_type` | enum | all | `postgresql`, `mysql`, `sqlserver`, `sqlite` |
| `auth_type` | enum | all | `connection_string` (default), `service_principal`, `app_service_principal` |
| `display_name` | string | — | Human-readable name (default: "Database") |
| `include_tables` | string[] | — | Allowlist of tables. `null` = all tables |
| `exclude_tables` | string[] | — | Blocklist of tables |
| `max_result_rows` | int | — | Max rows per query (1-5000, default: 500) |
| `query_timeout_seconds` | int | — | Query timeout (5-120, default: 30) |
| `connection_string` | string | `connection_string` | Full database URI |
| `azure_server` | string | `service_principal`, `app_service_principal` | e.g. `myserver.database.windows.net` |
| `azure_database` | string | `service_principal`, `app_service_principal` | Database name |
| `azure_tenant_id` | string | `service_principal` | Azure AD tenant ID |
| `azure_client_id` | string | `service_principal` | Application (client) ID |
| `azure_client_secret` | string | `service_principal` | Client secret (never returned in responses) |

**Response (200):**
```json
{
  "enabled": true,
  "database_type": "sqlserver",
  "auth_type": "app_service_principal",
  "display_name": "Azure SQL Database",
  "status": "connected",
  "include_tables": null,
  "exclude_tables": null,
  "max_result_rows": 500,
  "query_timeout_seconds": 30,
  "schema_introspected_at": "2026-03-11T10:00:00Z",
  "table_count": 12
}
```

**Errors:**
- `400` — Invalid request body or missing required fields for the chosen auth_type
- `404` — Project not found
- `502` — Database connection test failed (message includes DB error)
- `503` — `app_service_principal` selected but platform env vars not configured

> **Security**: Connection strings and client secrets are **never** returned in any API response. For `app_service_principal`, no user credentials are stored at all.

---

### 2.2 Get Database Connection Info

**`GET /api/v1/projects/{project_id}/database-connection`**

Returns the current database connection configuration (no secrets ever returned).

**Response (200):**
```json
{
  "enabled": true,
  "database_type": "sqlserver",
  "auth_type": "app_service_principal",
  "display_name": "Azure SQL Database",
  "status": "connected",
  "include_tables": null,
  "exclude_tables": null,
  "max_result_rows": 500,
  "query_timeout_seconds": 30,
  "schema_introspected_at": "2026-03-11T10:00:00Z",
  "table_count": 12
}
```

**Errors:**
- `404` — No database connection configured

---

### 2.3 Delete Database Connection

**`DELETE /api/v1/projects/{project_id}/database-connection`**

Removes the database connection and all cached schema data.

**Response:** `204 No Content`

---

### 2.4 Test Connection (without saving)

**`POST /api/v1/projects/{project_id}/database-connection/test`**

Tests a connection without saving it. Use this for the "Test Connection" button in the UI.

#### connection_string
```json
{
  "database_type": "postgresql",
  "auth_type": "connection_string",
  "connection_string": "postgresql://user:password@host:5432/dbname"
}
```

#### service_principal
```json
{
  "database_type": "sqlserver",
  "auth_type": "service_principal",
  "azure_server": "myserver.database.windows.net",
  "azure_database": "MyDB",
  "azure_tenant_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "azure_client_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "azure_client_secret": "your-client-secret"
}
```

#### app_service_principal
```json
{
  "database_type": "sqlserver",
  "auth_type": "app_service_principal",
  "azure_server": "myserver.database.windows.net",
  "azure_database": "MyDB"
}
```

**Response (200):** Always returns 200 with a `success` field indicating the result.

```json
{
  "success": true,
  "message": "Connected successfully",
  "latency_ms": 45,
  "tables_found": 12
}
```

**Failed test example:**
```json
{
  "success": false,
  "message": "Connection refused: could not connect to server at host:1433",
  "latency_ms": 5023,
  "tables_found": null
}
```

**Errors:**
- `503` — `app_service_principal` selected but platform env vars not configured

---

### 2.5 Introspect Schema (Refresh)

**`POST /api/v1/projects/{project_id}/database-connection/introspect`**

Triggers a schema introspection refresh. Returns the full schema structure.

**Response (200):**
```json
{
  "tables": [
    {
      "table_name": "orders",
      "columns": [
        {
          "name": "id",
          "data_type": "INTEGER",
          "nullable": false,
          "is_primary_key": true,
          "is_foreign_key": false,
          "foreign_key_target": null,
          "comment": null
        },
        {
          "name": "customer_id",
          "data_type": "INTEGER",
          "nullable": false,
          "is_primary_key": false,
          "is_foreign_key": true,
          "foreign_key_target": "customers.id",
          "comment": null
        }
      ],
      "row_count_estimate": 150000,
      "comment": null,
      "sample_values": null
    }
  ],
  "introspected_at": "2026-03-11T10:05:00Z",
  "table_count": 3
}
```

---

### 2.6 Query Audit Log

**`GET /api/v1/projects/{project_id}/database-connection/audit-log`**

Retrieve history of SQL queries executed by the agent.

**Query Parameters:**
| Param | Type | Default | Description |
|---|---|---|---|
| `session_id` | string | null | Filter by chat session |
| `limit` | int | 50 | Max entries (max 200) |
| `offset` | int | 0 | Pagination offset |

**Response (200):**
```json
{
  "entries": [
    {
      "tenant_id": "user_123",
      "project_id": "proj_456",
      "session_id": "sess_789",
      "message_id": "",
      "user_query": "How many orders last month?",
      "sql_query": "SELECT COUNT(*) FROM orders WHERE created_at >= '2026-02-01'",
      "query_valid": true,
      "execution_time_ms": 23,
      "row_count": 1,
      "error_message": null,
      "generated_at": "2026-03-11T10:30:00Z",
      "executed_at": "2026-03-11T10:30:00Z"
    }
  ],
  "total": 142,
  "limit": 50,
  "offset": 0
}
```

---

### 2.7 Chat (Existing Endpoint - No Changes)

**`POST /api/v1/projects/{project_id}/chat`**

The existing chat endpoint works unchanged. When the project has a database connection enabled, the agent automatically gets SQL tools and can query the database.

---

## 3. Supported Database Types

| Value | Display Name | Auth modes available |
|---|---|---|
| `postgresql` | PostgreSQL | `connection_string` |
| `mysql` | MySQL | `connection_string` |
| `sqlserver` | SQL Server | `connection_string`, `service_principal`, `app_service_principal` |
| `sqlite` | SQLite | `connection_string` |

> The backend automatically converts sync driver prefixes to async ones (e.g. `postgresql://` → `postgresql+asyncpg://`).

---

## 4. Connection Status Values

| Status | Meaning |
|---|---|
| `connected` | Connection is active and working |
| `disconnected` | Connection is configured but not enabled |
| `error` | Connection was attempted but failed |
| `pending` | Connection is being tested/introspected |

---

## 5. UI Flow Recommendations

### 5.1 Database Connection Setup Page

The auth mode selector should drive which fields are shown:

```
Project Settings > Database Connection

┌─────────────────────────────────────────────────────────┐
│  Database Connection                          [Enabled] │
│                                                         │
│  Database Type:  [SQL Server ▼]                         │
│  Display Name:   [Azure SQL Database      ]             │
│                                                         │
│  Authentication: [Use Platform App ▼]                   │
│    ○ Connection String                                  │
│    ○ My Azure App (Service Principal)                   │
│    ● Platform App  ← zero-credential option             │
│                                                         │
│  ── Platform App fields (shown for "Platform App") ──   │
│  Server:    [myserver.database.windows.net ]            │
│  Database:  [MyDB                          ]            │
│                                                         │
│  ── Table Access Control ──                             │
│  Include Tables: [orders, customers           ]         │
│  (Leave empty for all tables)                           │
│                                                         │
│  ── Safety Settings ──                                  │
│  Max Result Rows:      [500     ]                       │
│  Query Timeout (sec):  [30      ]                       │
│                                                         │
│  [Test Connection]  [Save]  [Delete Connection]         │
│                                                         │
│  ── Schema (12 tables) ── Last refreshed: 2h ago        │
│  [Refresh Schema]                                       │
│                                                         │
│  ▸ orders (3 columns, ~150K rows)                       │
│  ▸ customers (5 columns, ~10K rows)                     │
└─────────────────────────────────────────────────────────┘
```

### 5.2 Field Visibility by Auth Mode

| Field | `connection_string` | `service_principal` | `app_service_principal` |
|---|---|---|---|
| Connection String input | ✓ | — | — |
| Azure Server | — | ✓ | ✓ |
| Azure Database | — | ✓ | ✓ |
| Tenant ID | — | ✓ | — |
| Client ID | — | ✓ | — |
| Client Secret | — | ✓ | — |

### 5.3 Recommended UI Flow

1. User selects **Database Type** (dropdown)
2. User selects **Authentication Mode** (radio/select)
   - If `app_service_principal` is selected and the platform has it configured, show a green info banner: *"This platform's app registration will be used — no credentials required."*
   - If the platform has NOT configured it, either hide the option or show a greyed-out option with tooltip: *"Not available on this platform — contact your administrator."*
3. User fills in the relevant fields based on the chosen auth mode
4. User clicks **"Test Connection"** → call `POST .../test`
   - Show green checkmark + table count on success
   - Show red error message on failure
5. User configures table filters (optional)
6. User clicks **"Save"** → call `PUT .../database-connection`
   - This tests, saves, and introspects in one step
7. Schema table tree is rendered from the response

### 5.4 Detecting Platform App Availability

The frontend can detect whether `app_service_principal` is available by checking if a test request with that mode returns `200` or `503`:

```typescript
async function isAppSpAvailable(projectId: string): Promise<boolean> {
  try {
    // A minimal test request — will 503 fast if not configured
    const res = await fetch(`/api/v1/projects/${projectId}/database-connection/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-User-ID': tenantId },
      body: JSON.stringify({
        database_type: 'sqlserver',
        auth_type: 'app_service_principal',
        azure_server: 'probe',
        azure_database: 'probe',
      }),
    });
    // 503 = not configured; any other status (even 200 success=false) = configured
    return res.status !== 503;
  } catch {
    return false;
  }
}
```

### 5.5 Connection String Security

- Mask the connection string in the input field after saving
- The backend never returns the connection string — clear it from local state after a successful save
- For `service_principal`, mask the client secret field
- For `app_service_principal`, no secrets are ever sent or stored — no masking needed

### 5.6 Chat Integration

No special frontend changes needed for the chat UI. The agent handles SQL queries transparently.

You may want to:
- Show a "Database Connected" badge on projects with SQL enabled
- Display a hint in the chat input (e.g., "You can ask questions about your Sales Database")
- Render SQL code blocks with syntax highlighting

### 5.7 Audit Log Page

```
Project Settings > SQL Query History

┌────────────────────────────────────────────────────────────┐
│  Filter: [All Sessions ▼]     Showing 1-50 of 142         │
│                                                            │
│  10:30 AM  "How many orders last month?"                   │
│  SELECT COUNT(*) FROM orders WHERE created_at >= '...'     │
│  ✓ 1 row, 23ms                                             │
│                                                            │
│  10:28 AM  "Top 5 customers by revenue"                    │
│  SELECT c.name, SUM(o.total) FROM customers c JOIN ...     │
│  ✓ 5 rows, 156ms                                           │
│                                                            │
│  10:25 AM  "Show me the xyz table"                         │
│  SELECT * FROM xyz                                         │
│  ✗ Error: relation "xyz" does not exist                    │
└────────────────────────────────────────────────────────────┘
```

---

## 6. Error Handling

| HTTP Code | Scenario | Frontend Action |
|---|---|---|
| 200 (success=false) | Connection test failed | Show error message from `message` field |
| 400 | Invalid request body / missing fields | Show validation errors |
| 403 | SQL agent feature disabled | Show "SQL Agent is not enabled on this platform" |
| 404 | Project or connection not found | Show appropriate "not found" message |
| 500 | Encryption key not configured | Show "Platform configuration error" (admin issue) |
| 502 | Database connection failed on save | Show the DB error from `detail` field |
| 503 | `app_service_principal` not configured | Show "Platform app not configured — use a different auth mode or contact your administrator" |

---

## 7. Feature Flag

The SQL Agent has a global feature flag (`SQL_AGENT_ENABLED`). If disabled, all endpoints return `403`. The frontend can detect this by calling `GET .../database-connection` — if it returns `403`, hide the database connection UI entirely.

---

## 8. TypeScript Types

```typescript
type DatabaseType = 'postgresql' | 'mysql' | 'sqlserver' | 'sqlite';
type ConnectionStatus = 'connected' | 'disconnected' | 'error' | 'pending';
type AuthType = 'connection_string' | 'service_principal' | 'app_service_principal';

interface DatabaseConnectionCreate {
  database_type: DatabaseType;
  auth_type?: AuthType;             // default: 'connection_string'
  display_name?: string;
  include_tables?: string[] | null;
  exclude_tables?: string[] | null;
  max_result_rows?: number;         // 1-5000, default 500
  query_timeout_seconds?: number;   // 5-120, default 30

  // connection_string auth
  connection_string?: string;

  // service_principal auth
  azure_server?: string;
  azure_database?: string;
  azure_tenant_id?: string;
  azure_client_id?: string;
  azure_client_secret?: string;     // write-only, never returned

  // app_service_principal auth — only azure_server + azure_database needed
}

interface DatabaseConnectionResponse {
  enabled: boolean;
  database_type: DatabaseType;
  auth_type: AuthType;
  display_name: string;
  status: ConnectionStatus;
  include_tables: string[] | null;
  exclude_tables: string[] | null;
  max_result_rows: number;
  query_timeout_seconds: number;
  schema_introspected_at: string | null;  // ISO datetime
  table_count: number | null;
}

interface ConnectionTestRequest {
  database_type: DatabaseType;
  auth_type?: AuthType;

  // connection_string auth
  connection_string?: string;

  // service_principal auth
  azure_server?: string;
  azure_database?: string;
  azure_tenant_id?: string;
  azure_client_id?: string;
  azure_client_secret?: string;

  // app_service_principal auth — only azure_server + azure_database needed
}

interface ConnectionTestResult {
  success: boolean;
  message: string;
  latency_ms: number;
  tables_found: number | null;
}

interface ColumnSchema {
  name: string;
  data_type: string;
  nullable: boolean;
  is_primary_key: boolean;
  is_foreign_key: boolean;
  foreign_key_target: string | null;
  comment: string | null;
}

interface TableSchema {
  table_name: string;
  columns: ColumnSchema[];
  row_count_estimate: number | null;
  comment: string | null;
  sample_values: Record<string, any[]> | null;
}

interface IntrospectResponse {
  tables: TableSchema[];
  introspected_at: string;
  table_count: number;
}

interface QueryAuditEntry {
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

interface AuditLogResponse {
  entries: QueryAuditEntry[];
  total: number;
  limit: number;
  offset: number;
}
```
