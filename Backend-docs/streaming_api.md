# Streaming API Integration Guide

This document describes how to handle streaming responses from the RAGaaS API, including step-level progress events for pipeline visualization.

## Streaming Endpoint

```
POST /api/v1/projects/{project_id}/chat/stream
```

## Event Types

The streaming response uses Server-Sent Events (SSE). Each event is a JSON object with the following types:

| Type | Description | When Sent |
|------|-------------|-----------|
| `step_start` | Pipeline step beginning | Before each step executes |
| `step_end` | Pipeline step completed | After each step finishes |
| `agent_action` | Agent tool call or thought | During agent execution |
| `content` | Text generation token | During LLM generation |
| `source` | Source reference | After generation |
| `complete` | Stream finished | At the end |
| `error` | Error occurred | On failure |

---

## Event Payloads

### step_start
```json
{
  "type": "step_start",
  "data": "{\"name\": \"retrieve_context\", \"step_type\": \"retrieve\"}",
  "metadata": {
    "name": "retrieve_context",
    "step_type": "retrieve"
  }
}
```

### step_end
```json
{
  "type": "step_end",
  "data": "{\"name\": \"retrieve_context\", \"status\": \"completed\", \"duration_ms\": 145.32}",
  "metadata": {
    "name": "retrieve_context",
    "status": "completed",
    "duration_ms": 145.32
  }
}
```

### agent_action
```json
{
  "type": "agent_action",
  "data": "{\"step\": \"orchestrator\", \"action\": \"tool_call\", \"tool\": \"invoke_project\", \"input\": \"...\"}",
  "metadata": {
    "step": "orchestrator",
    "action": "tool_call",
    "tool": "invoke_project",
    "input": "project_id=abc-123&query=..."
  }
}
```

### content
```json
{
  "type": "content",
  "data": "The answer to your question is"
}
```

### source
```json
{
  "type": "source",
  "data": "{\"document_id\": \"...\", \"document_name\": \"policy.pdf\", ...}",
  "metadata": {"document_id": "doc-123"}
}
```

### complete
```json
{
  "type": "complete",
  "data": "",
  "metadata": {
    "session_id": "sess-456",
    "total_sources": 3,
    "steps_executed": ["retrieve_context", "orchestrator", "refine"]
  }
}
```

---

## Frontend Implementation Example

### TypeScript Types

```typescript
type StreamEventType = 
  | 'step_start' 
  | 'step_end' 
  | 'agent_action' 
  | 'content' 
  | 'source' 
  | 'complete' 
  | 'error';

interface StreamEvent {
  type: StreamEventType;
  data: string;
  metadata?: Record<string, any>;
  chunk_id?: string;
}

interface StepProgress {
  name: string;
  step_type: string;
  status: 'running' | 'completed' | 'error';
  duration_ms?: number;
}
```

### React Hook Example

```typescript
function useChatStream(projectId: string) {
  const [steps, setSteps] = useState<StepProgress[]>([]);
  const [content, setContent] = useState('');
  const [sources, setSources] = useState([]);

  const streamChat = async (query: string) => {
    const response = await fetch(`/api/v1/projects/${projectId}/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;

      const lines = decoder.decode(value).split('\n');
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        
        const event: StreamEvent = JSON.parse(line.slice(6));
        
        switch (event.type) {
          case 'step_start':
            const stepData = JSON.parse(event.data);
            setSteps(prev => [...prev, {
              name: stepData.name,
              step_type: stepData.step_type,
              status: 'running'
            }]);
            break;
            
          case 'step_end':
            const endData = JSON.parse(event.data);
            setSteps(prev => prev.map(s => 
              s.name === endData.name 
                ? { ...s, status: 'completed', duration_ms: endData.duration_ms }
                : s
            ));
            break;
            
          case 'agent_action':
            // Show agent activity indicator
            const action = JSON.parse(event.data);
            console.log('Agent action:', action);
            break;
            
          case 'content':
            setContent(prev => prev + event.data);
            break;
            
          case 'source':
            setSources(prev => [...prev, JSON.parse(event.data)]);
            break;
            
          case 'complete':
            // Stream finished
            break;
        }
      }
    }
  };

  return { steps, content, sources, streamChat };
}
```

---

## UI Recommendations

### Step Progress Visualization

```
┌─────────────────────────────────────────────┐
│ Pipeline Progress                           │
├─────────────────────────────────────────────┤
│ ✓ retrieve_context    (145ms)              │
│ ⟳ orchestrator        running...           │
│ ○ refine_response     pending              │
└─────────────────────────────────────────────┘
```

- Use `step_start` to add step with "running" state
- Use `step_end` to mark as "completed" with duration
- Show pending steps (from pipeline config) as "pending"

### Agent Action Display

```
┌─────────────────────────────────────────────┐
│ 🤖 Orchestrator Agent                       │
├─────────────────────────────────────────────┤
│ 🔧 Calling: HR Assistant                    │
│ 📝 Query: "What is the leave policy?"       │
└─────────────────────────────────────────────┘
```

Show agent_action events in a collapsible panel or as inline indicators.

---

## Error Handling

```typescript
case 'error':
  const error = JSON.parse(event.data);
  setError(error.message);
  // Mark current step as failed
  setSteps(prev => prev.map(s => 
    s.status === 'running' ? { ...s, status: 'error' } : s
  ));
  break;
```
