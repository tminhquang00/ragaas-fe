# Copilot Instructions – RAGaaS Frontend

## Project Overview

This is a **RAG-as-a-Service (RAGaaS) management frontend** — a React SPA for managing AI-powered knowledge base projects. Users create projects, upload documents, configure retrieval pipelines, and chat with their knowledge base. The backend API lives at `VITE_API_BASE_URL` (default: `http://localhost:8000`).

## Architecture & Data Flow

```
AuthContext (tenantId + RAGaaSClient) → Pages → components → api.ts (RAGaaSClient)
```

- **`src/services/api.ts`** — Single `RAGaaSClient` class wrapping all backend calls. Every request injects `X-User-ID: tenantId` as the auth/tenant header. Use `useAuth()` to get `apiClient` — never instantiate `RAGaaSClient` directly in components.
- **`src/context/AuthContext.tsx`** — Manages tenant identity and the shared `apiClient`. Supports two modes toggled by `VITE_USE_AZURE_AD=true`: Azure AD (MSAL) or a simple local tenant ID stored in `localStorage`.
- **`src/types/index.ts`** — All domain types (`Project`, `PipelineConfig`, `StreamingChunk`, etc.). `src/types/config.ts` holds extended config types with more backend-specific fields.
- **`src/theme/index.ts`** — Bosch Digital Design System (BDDS) color palette constants. Primary blue: `#007bc0`. No MUI theme objects; use FROK CSS variables (e.g. `var(--g-blue-50)`) for colors. Dark/light themes managed by `useFrokTheme()` in `src/utils/frokTheme.ts`, exposed via `useTheme()` from `ThemeContext`.
- **`src/utils/frokTheme.ts`** — `useFrokTheme()` hook (applies `-dark-mode` CSS class), `cssVar()` helper, and `alpha()` color-mix utility. Import from here instead of MUI's `alpha`.
- **`src/utils/iconAdapter.tsx`** — `<FrokIcon name="MuiIconName" />` component that translates MUI icon names to Bosch icon names and renders `<Icon>` from `@bosch/react-frok`. Use this whenever an icon is needed.
- **`src/styles/frok-overrides.css`** — App-specific CSS overrides using FROK design tokens. Add custom styles here, not via `sx` props.

## Key Patterns

### Consuming the API client
```tsx
const { apiClient } = useAuth(); // Always from context
const projects = await apiClient.listProjects();
```

### Streaming chat responses
`RAGaaSClient.streamChat()` is an `AsyncGenerator<StreamingChunk>`. Consume with `for await`:
```ts
for await (const chunk of apiClient.streamChat(projectId, request)) { ... }
```
SSE lines prefixed with `data: `, terminated by `[DONE]`.

### Theme access
```tsx
import { useTheme } from '../../context/ThemeContext'; // { mode, toggleTheme, setMode }
```
Do **not** import from MUI — there is no MUI theme. Use FROK CSS variables (`var(--g-blue-50)`) for colors in inline styles or CSS.

### Using icons
```tsx
import { FrokIcon } from '../../utils/iconAdapter';
// <FrokIcon name="Settings" /> renders the mapped Bosch icon
// Or import Icon directly: import { Icon } from '@bosch/react-frok';
```

### Using FROK components
Always read `.github/skills/bosch-frok/SKILL.md` before writing FROK component code. Find the component in the lookup table, then read its reference file for props and examples. Never guess FROK API from memory.

### Pipeline editor
`PipelineConfig` → `configToFlow()` → React Flow nodes/edges → visual edit → `graphToConfig()` → `PipelineConfig`. Auto-layout uses `dagre`. Changes debounce 500ms before calling `onConfigChange`. See `src/utils/pipelineFlowUtils.ts`.

### Barrel exports
Every `components/*/` and `pages/` folder has an `index.ts`. Always import from the folder, not the file directly:
```tsx
import { ChatInterface } from '../components/chat'; // ✅
import { ChatInterface } from '../components/chat/ChatInterface'; // ✗
```

## Env Variables (`.env`)

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Backend URL (default `http://localhost:8000`) |
| `VITE_USE_AZURE_AD` | `true` to enable MSAL auth |
| `VITE_AZURE_CLIENT_ID` | Azure AD app client ID |
| `VITE_AZURE_AUTHORITY` | Azure AD authority URL |
| `VITE_AZURE_REDIRECT_URI` | OAuth redirect URI |
| `VITE_DEFAULT_TENANT_ID` | Tenant ID when Azure AD is off (default `demo-tenant`) |

## Developer Workflows

```bash
npm run dev        # Start dev server (Vite HMR)
npm run build      # TypeScript check + Vite build (tsc -b && vite build)
npm run lint       # ESLint with typescript-eslint
npm run preview    # Preview production build
```

Docker: `docker-compose up` spins up the frontend container (see `Dockerfile`).

## Project Lifecycle (Backend Flow)

`draft` → upload documents → `active` → chat/widget. Projects must be activated before the chat API responds. Pipeline types: `simple_rag`, `classify`, `agentic`, `routing`, `agent`, `custom`.

## Component Directory Map

| Directory | Responsibility |
|---|---|
| `components/chat/` | `ChatInterface` (streaming, sessions, sources, visual grounding), `ChatSessionList`, `JsonViewer`, `VisualGroundingModal` |
| `components/pipeline/` | Visual pipeline editor using `@xyflow/react` + dagre layout |
| `components/documents/` | File upload (`react-dropzone`) and document list |
| `components/projects/` | Project cards, create dialog, YAML config editor |
| `components/widget/` | Embeddable chat widget config/preview |
| `pages/ProjectDetailPage.tsx` | Tabbed view (Chat · Documents · Pipeline · Config · Widget) — the main work surface |

## UI Stack

**Bosch React FROK** (`@bosch/react-frok` + `@bosch/frontend.kit-npm`) for all UI components. Skill reference: `.github/skills/bosch-frok/SKILL.md`.

- Do **not** import from `@mui/material`. MUI is still listed in `package.json` as a residual dependency but must not be used in new or edited code.
- Style with FROK CSS variables (e.g. `var(--g-blue-50)`, `var(--supergraphic-primary)`), not `sx` props or Tailwind classes.
- Utility class merging (`clsx` / `tailwind-merge`) is used only for combining classNames, not for layout or theming.
- Global CSS overrides go in `src/styles/frok-overrides.css`.
- `styled-components` is available for component-scoped styles when inline styles are insufficient.
