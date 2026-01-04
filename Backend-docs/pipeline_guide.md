# Pipeline Editor & Visualizer Specification

This document defines the technical specifications and conventions for the Frontend Pipeline Builder. The goal is to create a Drag-and-Drop interface that generates a valid JSON configuration compatible with the RAGaaS backend.

---

## 1. Core Concepts

The backend executes a **Pipeline** defined as a list of **Steps**.
- **Linear Flow**: Steps execute sequentially (Step 1 -> Step 2).
- **Control Flow**: Special steps (`route`, `parallel`) can contain **sub-pipelines** (branches).

**Frontend Challenge**: 
While the backend executes linearly, the Frontend UI should likely look like a Flow Graph (Nodes & Edges).
The Frontend must serialize this Graph back into the recursive JSON structure expected by the API.

---

## 2. Data Model (TypeScript Interfaces)

The frontend should strictly adhere to these interfaces to ensure compatibility.

```typescript
// The root configuration object
interface PipelineConfig {
  steps: PipelineStep[];
}

// A generic step in the pipeline
interface PipelineStep {
  name: string;
  type: StepType;
  config: StepConfig; 
  branches?: Record<str, PipelineStep[]>; // For Route/Parallel steps
}

// Supported Step Types
type StepType = 
  | 'retrieve'
  | 'generate'
  | 'classify'
  | 'route'
  | 'transform'
  | 'parallel'
  | 'agent';  // Agent step for hybrid/multi-agent pipelines

// Configuration schemas vary by type
type StepConfig = 
  | RetrieveConfig 
  | GenerateConfig 
  | ClassifyConfig 
  | RouteConfig 
  | ParallelConfig
  | OrchestratorConfig;

// Sub-agent configuration for orchestrator
interface SubAgentConfig {
  project_id: string;     // ID of the project to invoke
  name: string;           // Human-readable name
  description: string;    // What this agent specializes in
  keywords?: string[];    // Keywords for routing hints
}

// Orchestrator pipeline config
interface OrchestratorConfig {
  agent_config: AgentConfig;
  sub_agents: SubAgentConfig[];
}

// Agent step config (for hybrid pipelines)
interface AgentStepConfig {
  agent_config?: AgentConfig;    // Optional, inherits from pipeline
  sub_agents?: SubAgentConfig[]; // Optional, inherits from pipeline
}
```

---

## 3. Node Specifications

### 3.1. Retrieve Node
Performs vector search.

- **Icon**: 🔍
- **Color**: Blue
- **Config Fields**:
  - `top_k` (Number, default: 10): Number of chunks to fetch.
  - `retrieval_method` (Select): `semantic` | `hybrid` | `bm25`.
  - `filter` (Text): Metadata filter string (e.g., `category eq 'news'`).
  - `namespace_override` (Text, Optional).
  - `contextualization_prompt_template` (TextArea, Optional): For history-aware rewriting.
  - `expansion_prompt_template` (TextArea, Optional): For iterative expansion.

### 3.2. Generate Node
Calls the LLM to generate text.

- **Icon**: ✨
- **Color**: Purple
- **Config Fields**:
  - `system_prompt` (TextArea): The instructions for the LLM.
  - `user_prompt_template` (TextArea, Optional): Template for user query + context.
  - `model_config` (Select): `default` | `fast` | `strong`.
  - `temperature` (Slider, 0-1): Creativity.
  - `stream` (Boolean): Enable streaming response.

### 3.3. Classify Node
Determines user intent to drive routing.

- **Icon**: 🏷️
- **Color**: Orange
- **Config Fields**:
  - `categories` (List<String>): e.g., `['technical', 'billing', 'general']`.
  - `route_variable` (Text, Fixed): `classification` (usually).
  - `system_prompt` (TextArea, Optional): Custom instruction.
  - `user_prompt_template` (TextArea, Optional): Template for user query.

### 3.4. Route Node (Complex)
Conditional logic hub.

- **Icon**: 🔀
- **Color**: Yellow
- **Visual Behavior**:
  - Validates that a `classify` node likely precedes it.
  - **Dynamic Handles**: The node should have one output handle for each key in `routes`.
- **Config Fields**:
  - `route_variable` (Text): Variable to read (default: `classification`).
  - `routes` (Map<String, String>): Map category names to Branch IDs.
- **Child Structure**:
  - Unlike a flat graph, `Route` outputs connect to **Branches**. 
  - **FE Convention**: Connections from a Route node start a *new* list of steps (a sub-pipeline).

### 3.5. Parallel Node (Complex)
Executes multiple branches simultaneously.

- **Icon**: 🔱
- **Color**: Cyan
- **Visual Behavior**:
  - Has multiple output handles, one for each branch.
- **Config Fields**:
  - `branches` (Map<String, List<Step>>): Defined implicitly by connections.

### 3.6. Transform Node
Modifies the query or state.

- **Icon**: ⚡
- **Color**: Green
- **Config Fields**:
  - `transform_type` (Select): `passthrough` | `expand_query` | `rewrite_query` | `custom`.
  - `system_prompt` (TextArea, Optional).
  - `user_prompt_template` (TextArea, Optional).
  - `output_variable` (Text, Optional): Variable to store result.

### 3.7. Orchestrator Node (Agent with Sub-Agents)
Delegates queries to specialized sub-agents (other projects).

- **Icon**: 🎯
- **Color**: Magenta
- **Visual Behavior**:
  - Displays configured sub-agents as a list.
  - Shows connection arrows to sub-agent projects (visual only, not actual edges).
- **Config Fields**:
  - `sub_agents` (List<SubAgentConfig>): List of sub-agents to invoke.
    - `project_id` (Text): Target project ID.
    - `name` (Text): Display name.
    - `description` (TextArea): Specialization description.
    - `keywords` (Tags): Routing keywords.
  - `agent_config.max_iterations` (Number, default: 15).
  - `agent_config.agent_system_prompt` (TextArea): Orchestrator instructions.
- **Note**: This node type is terminal - it handles everything including generation.

---

## 4. UI/UX Conventions

### 4.1. The "Main Line"
The editor should start with a "Start" node. Nodes connected in a single sequence represent the top-level `steps` array.

### 4.2. Handling Branches
When a user connects a `Route` node to multiple other nodes, the Editor must understand this as branching.

**Recommendation for Implementation (e.g., React Flow):**
1.  **Route Node**: Has customizable "Source Handles".
    *   User adds a route (e.g., "technical").
    *   Node adds a handle labeled "technical".
    *   User connects this handle to the first step of the *Technical* branch.
2.  **Serialization Logic**:
    *   Traverse from "Start".
    *   Add nodes to `steps[]`.
    *   If `Route` node found:
        *   Look at all edges connected to its handles.
        *   For each handle (e.g., "technical"), traverse that path to build a nested `PipelineStep[]`.
        *   Assign these arrays to `step.branches['technical']`.

### 4.3. Validation
- **Loop Detection**: The backend `LCELChainBuilder` does not support cycles. The FE must prevent cycles in the graph.
- **Orphan Nodes**: All nodes must be connected to the flow starting from "Start".

---

## 5. JSON Output Example

The Frontend must produce this exact structure to send to `/api/v1/projects/{id}/config`.

```json
{
  "pipeline_config": {
    "steps": [
      {
        "name": "intent_classifier",
        "type": "classify",
        "config": {
          "categories": ["tech", "sales"]
        }
      },
      {
        "name": "main_router",
        "type": "route",
        "config": {
            "route_variable": "classification",
            "routes": {
                "tech": "tech_branch",
                "sales": "sales_branch"
            }
        },
        "branches": {
            "tech_branch": [
                {
                    "name": "tech_search",
                    "type": "retrieve",
                    "config": { "filter": "dept eq 'engineering'" }
                }
            ],
            "sales_branch": [
                {
                    "name": "sales_gen",
                    "type": "generate",
                    "config": { "system_prompt": "You are a sales rep." }
                }
            ]
        }
      }
    ]
  }
}
```

## 6. Recommended Libraries
- **React Flow** (or **XYFlow**): Industry standard for node-based UIs in React.
