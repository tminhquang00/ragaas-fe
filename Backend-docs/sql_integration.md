# SQL Agent - Frontend Integration Guide

## Overview

The SQL Agent feature allows users to connect a relational database to a project and chat with it using natural language. This document covers all API endpoints the frontend needs to integrate with.

**Base URL**: `/api/v1`
**Auth**: All requests require `X-User-ID` header (tenant ID).

---

## 1. API Endpoints

### 1.1 Create / Update Database Connection

**`PUT /api/v1/projects/{project_id}/database-connection`**

Creates or replaces the database connection for a project. Tests the connection before saving. Triggers automatic schema introspection.

**Request Body:**
```json
{
  "database_type": "postgresql",
  "connection_string": "postgresql://user:password@host:5432/dbname",
  "display_name": "Sales Database",
  "include_tables": ["orders", "customers", "products"],
  "exclude_tables": [],
  "max_result_rows": 500,
  "query_timeout_seconds": 30
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `database_type` | enum | Yes | `postgresql`, `mysql`, `sqlserver`, `sqlite` |
| `connection_string` | string | Yes | Database connection URI (plaintext, encrypted at rest) |
| `display_name` | string | No | Human-readable name (default: "Database") |
| `include_tables` | string[] | No | Allowlist of tables. `null` = all tables |
| `exclude_tables` | string[] | No | Blocklist of tables |
| `max_result_rows` | int | No | Max rows per query result (1-5000, default: 500) |
| `query_timeout_seconds` | int | No | Query timeout in seconds (5-120, default: 30) |

**Response (200):**
```json
{
  "enabled": true,
  "database_type": "postgresql",
  "display_name": "Sales Database",
  "status": "connected",
  "include_tables": ["orders", "customers", "products"],
  "exclude_tables": [],
  "max_result_rows": 500,
  "query_timeout_seconds": 30,
  "schema_introspected_at": "2026-03-11T10:00:00Z",
  "table_count": 3
}
```

**Errors:**
- `400` — Invalid request body
- `404` — Project not found
- `502` — Database connection test failed (message includes DB error)

> **Note**: The connection string is never returned in any API response. It is encrypted at rest.

---

### 1.2 Get Database Connection Info

**`GET /api/v1/projects/{project_id}/database-connection`**

Returns the current database connection configuration (without the connection string).

**Response (200):**
```json
{
  "enabled": true,
  "database_type": "postgresql",
  "display_name": "Sales Database",
  "status": "connected",
  "include_tables": ["orders", "customers", "products"],
  "exclude_tables": [],
  "max_result_rows": 500,
  "query_timeout_seconds": 30,
  "schema_introspected_at": "2026-03-11T10:00:00Z",
  "table_count": 3
}
```

**Errors:**
- `404` — No database connection configured

---

### 1.3 Delete Database Connection

**`DELETE /api/v1/projects/{project_id}/database-connection`**

Removes the database connection and all cached schema data.

**Response:** `204 No Content`

---

### 1.4 Test Connection (without saving)

**`POST /api/v1/projects/{project_id}/database-connection/test`**

Tests a connection string without saving it. Use this for the "Test Connection" button in the UI.

**Request Body:**
```json
{
  "database_type": "postgresql",
  "connection_string": "postgresql://user:password@host:5432/dbname"
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
  "message": "Connection refused: could not connect to server at host:5432",
  "latency_ms": 5023,
  "tables_found": null
}
```

---

### 1.5 Introspect Schema (Refresh)

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
        },
        {
          "name": "total",
          "data_type": "DECIMAL(10,2)",
          "nullable": false,
          "is_primary_key": false,
          "is_foreign_key": false,
          "foreign_key_target": null,
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

### 1.6 Query Audit Log

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

### 1.7 Chat (Existing Endpoint - No Changes)

**`POST /api/v1/projects/{project_id}/chat`**

The existing chat endpoint works unchanged. When the project has a database connection enabled, the agent automatically gets SQL tools and can query the database.

The frontend does NOT need to do anything special for SQL queries — the agent decides when to use SQL tools based on the user's question.

**The agent's responses for SQL queries typically include:**
- The SQL query in a code block
- A results table
- A natural language explanation

---

## 2. Supported Database Types

| Value | Display Name | Connection String Format |
|---|---|---|
| `postgresql` | PostgreSQL | `postgresql://user:pass@host:5432/dbname` |
| `mysql` | MySQL | `mysql://user:pass@host:3306/dbname` |
| `sqlserver` | SQL Server | `mssql://user:pass@host:1433/dbname?driver=ODBC+Driver+18+for+SQL+Server` |
| `sqlite` | SQLite | `sqlite:///path/to/database.db` |

> The backend automatically converts sync driver prefixes to async ones. Users can provide standard connection strings.

---

## 3. Connection Status Values

| Status | Meaning |
|---|---|
| `connected` | Connection is active and working |
| `disconnected` | Connection is configured but not enabled |
| `error` | Connection was attempted but failed |
| `pending` | Connection is being tested/introspected |

---

## 4. UI Flow Recommendations

### 4.1 Database Connection Setup Page

```
Project Settings > Database Connection

┌─────────────────────────────────────────────────────────┐
│  Database Connection                          [Enabled] │
│                                                         │
│  Database Type:  [PostgreSQL ▼]                         │
│  Display Name:   [Sales Database          ]             │
│  Connection:     [postgresql://user:***@host/db ]       │
│                                                         │
│  ── Table Access Control ──                             │
│  Include Tables: [orders, customers, products  ]        │
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
│  ▸ products (4 columns, ~500 rows)                      │
└─────────────────────────────────────────────────────────┘
```

### 4.2 Recommended UI Flow

1. User selects database type from dropdown
2. User enters connection string and display name
3. User clicks **"Test Connection"** → call `POST .../test`
   - Show green checkmark + table count on success
   - Show red error message on failure
4. User configures table filters (optional)
5. User clicks **"Save"** → call `PUT .../database-connection`
   - This tests, saves, and introspects in one step
6. Schema table tree is rendered from the response
7. User clicks **"Refresh Schema"** → call `POST .../introspect`

### 4.3 Connection String Security

- Mask the connection string in the input field after saving (show `postgresql://user:***@host:5432/dbname`)
- The backend never returns the connection string — the frontend should clear it from local state after a successful save
- Show a warning that the connection string contains credentials

### 4.4 Chat Integration

No special frontend changes needed for the chat UI. The agent handles SQL queries transparently through the existing chat endpoint.

However, you may want to:
- Show a "Database Connected" badge on projects with SQL enabled
- Display a hint in the chat input (e.g., "You can ask questions about your Sales Database")
- Render SQL code blocks with syntax highlighting when the agent returns SQL queries

### 4.5 Audit Log Page

Optional page accessible from project settings:

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

## 5. Error Handling

| HTTP Code | Scenario | Frontend Action |
|---|---|---|
| 200 (success=false) | Connection test failed | Show error message from `message` field |
| 400 | Invalid request body | Show validation errors |
| 403 | SQL agent feature disabled | Show "SQL Agent is not enabled on this platform" |
| 404 | Project or connection not found | Show appropriate "not found" message |
| 500 | Encryption key not configured | Show "Platform configuration error" (admin issue) |
| 502 | Database connection failed on save | Show the DB error from `detail` field |

---

## 6. Feature Flag

The SQL Agent has a global feature flag (`SQL_AGENT_ENABLED`). If disabled, all endpoints return `403`. The frontend can detect this by calling `GET .../database-connection` — if it returns `403`, hide the database connection UI entirely.

---

## 7. TypeScript Types

```typescript
type DatabaseType = 'postgresql' | 'mysql' | 'sqlserver' | 'sqlite';
type ConnectionStatus = 'connected' | 'disconnected' | 'error' | 'pending';

interface DatabaseConnectionCreate {
  database_type: DatabaseType;
  connection_string: string;
  display_name?: string;
  include_tables?: string[] | null;
  exclude_tables?: string[] | null;
  max_result_rows?: number;       // 1-5000, default 500
  query_timeout_seconds?: number;  // 5-120, default 30
}

interface DatabaseConnectionResponse {
  enabled: boolean;
  database_type: DatabaseType;
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
  connection_string: string;
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
