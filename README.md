# RAGaaS Frontend

React SPA for the **RAG-as-a-Service** management UI: create projects, upload documents, configure retrieval pipelines, and chat with your knowledge base. It talks to the RAGaaS backend via `VITE_API_BASE_URL` (default `http://localhost:8000`).

## Stack

- **React 19** + **TypeScript** + **Vite 7**
- **Bosch React FROK** (`@bosch/react-frok`, BDDS tokens) for UI
- **React Router** · **@xyflow/react** + **dagre** (pipeline editor) · **react-dropzone** (uploads) · **react-markdown** (chat)

## Prerequisites

- Node.js and npm (versions aligned with the repo’s `package.json`)
- A running RAGaaS API, or adjust `VITE_API_BASE_URL` to your environment

## Quick start

```bash
npm install
cp .env.example .env   # adjust variables as needed
npm run dev
```

The dev server uses Vite HMR (default port **5173**).

## Scripts

| Command | Description |
|--------|-------------|
| `npm run dev` | Start the dev server |
| `npm run build` | Typecheck (`tsc -b`) and production build |
| `npm run lint` | ESLint |
| `npm run preview` | Serve the production build locally |

## Environment variables

Copy `.env.example` to `.env`. Common variables:

| Variable | Purpose |
|----------|---------|
| `VITE_API_BASE_URL` | Backend base URL (default `http://localhost:8000`) |
| `VITE_USE_AZURE_AD` | Set to `true` for Azure AD (MSAL) |
| `VITE_AZURE_CLIENT_ID` | Azure AD application (client) ID |
| `VITE_AZURE_AUTHORITY` | Azure AD authority URL |
| `VITE_AZURE_REDIRECT_URI` | OAuth redirect URI |
| `VITE_DEFAULT_TENANT_ID` | Tenant ID when Azure AD is off (default `demo-tenant`) |

Other keys (for example optional Azure settings) are documented in **`.env.example`**.

## Docker

See **[README.Docker.md](./README.Docker.md)** for `docker-compose` and image-based workflows.

## Project layout (high level)

- **`src/services/api.ts`** — `RAGaaSClient`; all HTTP/SSE calls; tenant via `X-User-ID`
- **`src/context/AuthContext.tsx`** — Tenant identity and shared `apiClient`
- **`src/pages/ProjectDetailPage.tsx`** — Main project workspace (Chat, Documents, Pipeline, Config, Widget)
- **`src/components/chat/`** — Streaming chat, sessions, sources
- **`src/components/pipeline/`** — Visual pipeline editor
- **`src/components/documents/`** — Uploads and document list
- **`src/components/projects/`** — Project list and creation
- **`src/widget/`** — Embeddable widget entry

Backend expectation: projects move **draft** → **active** after documents are in place; chat and widget need an **active** project.

## Contributing / AI context

For architecture, patterns, and FROK usage notes, see **`CLAUDE.md`** in the repo root.
