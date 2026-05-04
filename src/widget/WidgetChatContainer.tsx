import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Notification } from '@bosch/react-frok';
import { ChatInterface } from '../components/chat';
import { ApiHttpError } from '../services/api';
import {
  SourceReference,
  StepProgress,
  AgentAction,
  ChatSession,
  ChatMessage as BackendChatMessage,
  ImageContent,
} from '../types';
import { useWidgetAuth } from './WidgetAuthProvider';
import { buildSourceReference, getStreamErrorMessage, getStreamTraceId, numberValue, parseStreamObject, stringValue } from '../utils/chatStream';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: SourceReference[];
  timestamp: Date;
  attachments?: File[];
  images?: ImageContent[];
  metadata?: {
    uploaded_files?: { filename: string; mime_type: string }[];
    [key: string]: any;
  };
}

interface WidgetChatContainerProps {
  projectId: string;
}

const SESSION_PAGE_SIZE = 20;
const MESSAGE_PAGE_SIZE = 50;

const mapBackendMessages = (backendMessages: BackendChatMessage[]): ChatMessage[] =>
  backendMessages.map((m) => ({
    id: m.message_id,
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: m.content,
    timestamp: new Date(m.timestamp),
    sources: m.metadata?.sources as SourceReference[] | undefined,
    images: m.images,
    metadata: m.metadata,
  }));

const mergeSessionsById = (existing: ChatSession[], incoming: ChatSession[]): ChatSession[] => {
  const seen = new Set(existing.map((session) => session.session_id));
  return [...existing, ...incoming.filter((session) => !seen.has(session.session_id))];
};

/**
 * Container that replicates the chat state + streaming handlers from
 * `ProjectDetailPage` and wires them into the shared `<ChatInterface />`.
 * Kept intentionally close to the original logic so behaviour stays in sync.
 */
export const WidgetChatContainer: React.FC<WidgetChatContainerProps> = ({ projectId }) => {
  const { apiClient } = useWidgetAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streamingContent, setStreamingContent] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsLoadingMore, setSessionsLoadingMore] = useState(false);
  const [sessionsPage, setSessionsPage] = useState(1);
  const [sessionsTotal, setSessionsTotal] = useState(0);
  const [sessionsQuery, setSessionsQuery] = useState('');
  const [olderMessagesLoading, setOlderMessagesLoading] = useState(false);
  const [olderMessagesCursor, setOlderMessagesCursor] = useState<string | null>(null);
  const [hasOlderMessages, setHasOlderMessages] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [steps, setSteps] = useState<StepProgress[]>([]);
  const [agentAction, setAgentAction] = useState<AgentAction | null>(null);
  const [error, setError] = useState('');

  const streamingBufferRef = useRef('');
  const rafIdRef = useRef<number | null>(null);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  const fetchSessions = useCallback(async (
    page: number = 1,
    options?: { append?: boolean; query?: string }
  ) => {
    if (!projectId) return;
    const query = options?.query ?? sessionsQuery;
    const append = options?.append ?? false;
    try {
      if (append) {
        setSessionsLoadingMore(true);
      } else {
        setSessionsLoading(true);
      }
      const data = query.trim()
        ? await apiClient.searchSessions(projectId, query.trim(), page, SESSION_PAGE_SIZE)
        : await apiClient.getSessions(projectId, page, SESSION_PAGE_SIZE);
      setSessions((prev) => append ? mergeSessionsById(prev, data.sessions) : data.sessions);
      setSessionsPage(data.page);
      setSessionsTotal(data.total);
    } catch (err) {
      console.error('Widget: failed to load sessions:', err);
    } finally {
      setSessionsLoading(false);
      setSessionsLoadingMore(false);
    }
  }, [apiClient, projectId, sessionsQuery]);

  useEffect(() => {
    fetchSessions(1, { query: sessionsQuery });
  }, [fetchSessions]);

  useEffect(() => {
    const loadSessionMessages = async () => {
      if (!sessionId) {
        setMessages([]);
        setHasOlderMessages(false);
        setOlderMessagesCursor(null);
        return;
      }
      try {
        setChatLoading(true);
        const msgs = await apiClient.getSessionMessages(projectId, sessionId, MESSAGE_PAGE_SIZE);
        setMessages(mapBackendMessages(msgs.messages));
        setHasOlderMessages(msgs.has_more);
        setOlderMessagesCursor(msgs.next_cursor);
      } catch (err) {
        console.error('Widget: failed to load session messages:', err);
        setMessages([]);
        setHasOlderMessages(false);
        setOlderMessagesCursor(null);
      } finally {
        setChatLoading(false);
      }
    };

    loadSessionMessages();
  }, [sessionId, apiClient, projectId]);

  const handleCreateSession = useCallback(() => {
    setSessionId(undefined);
    setMessages([]);
    setHasOlderMessages(false);
    setOlderMessagesCursor(null);
    setSteps([]);
    setSuggestions([]);
  }, []);

  const handleSelectSession = useCallback((sid: string) => {
    setSessionId(sid);
  }, []);

  const handleDeleteSession = useCallback(
    async (sid: string) => {
      try {
        await apiClient.deleteSession(projectId, sid);
        if (sessionId === sid) {
          handleCreateSession();
        }
        fetchSessions(1, { query: sessionsQuery });
      } catch (err) {
        console.error('Widget: failed to delete session:', err);
      }
    },
    [apiClient, projectId, sessionId, handleCreateSession, fetchSessions, sessionsQuery],
  );

  const handleUpdateSession = useCallback(
    async (sid: string, title: string) => {
      try {
        await apiClient.updateSession(projectId, sid, { title });
        fetchSessions(1, { query: sessionsQuery });
      } catch (err) {
        console.error('Widget: failed to update session:', err);
      }
    },
    [apiClient, projectId, fetchSessions, sessionsQuery],
  );

  const handleSearchSessions = useCallback(
    (query: string) => {
      setSessionsQuery(query);
    },
    [],
  );

  const handleLoadMoreSessions = useCallback(() => {
    fetchSessions(sessionsPage + 1, { append: true, query: sessionsQuery });
  }, [fetchSessions, sessionsPage, sessionsQuery]);

  const handleLoadOlderMessages = useCallback(async () => {
    if (!sessionId || !olderMessagesCursor) return;
    try {
      setOlderMessagesLoading(true);
      const result = await apiClient.getSessionMessages(
        projectId,
        sessionId,
        MESSAGE_PAGE_SIZE,
        olderMessagesCursor,
      );
      const olderMessages = mapBackendMessages(result.messages);
      setMessages((prev) => {
        const existing = new Set(prev.map((message) => message.id));
        return [
          ...olderMessages.filter((message) => !existing.has(message.id)),
          ...prev,
        ];
      });
      setHasOlderMessages(result.has_more);
      setOlderMessagesCursor(result.next_cursor);
    } catch (err) {
      console.error('Widget: failed to load older messages:', err);
    } finally {
      setOlderMessagesLoading(false);
    }
  }, [apiClient, projectId, sessionId, olderMessagesCursor]);

  const handleSendMessage = async (query: string, sid?: string, files?: File[]) => {
    if (!projectId) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date(),
      attachments: files,
    };
    setMessages((prev) => [...prev, userMessage]);
    setChatLoading(true);
    setStreamingContent('');
    setSuggestions([]);
    setSteps([]);
    setAgentAction(null);

    try {
      const processedFiles: { filename: string; data: string; mime_type?: string }[] = [];
      const processedImages: { data: string; mime_type: string }[] = [];

      if (files && files.length > 0) {
        for (const file of files) {
          const base64Data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result as string;
              const base64 = result.split(',')[1];
              resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });

          if (file.type.startsWith('image/')) {
            processedImages.push({ data: base64Data, mime_type: file.type });
          } else {
            processedFiles.push({
              filename: file.name,
              data: base64Data,
              mime_type: file.type,
            });
          }
        }
      }

      let fullContent = '';
      const sources: SourceReference[] = [];
      let traceId: string | undefined;
      let newSessionId = sid || sessionId;

      const chatRequest: {
        query: string;
        session_id?: string;
        files?: { filename: string; data: string; mime_type?: string }[];
        images?: { data: string; mime_type: string }[];
      } = {
        query,
        session_id: newSessionId,
      };

      if (processedFiles.length > 0) chatRequest.files = processedFiles;
      if (processedImages.length > 0) chatRequest.images = processedImages;

      const scheduleUpdate = () => {
        if (rafIdRef.current === null) {
          rafIdRef.current = requestAnimationFrame(() => {
            setStreamingContent(streamingBufferRef.current);
            rafIdRef.current = null;
          });
        }
      };

      setIsStreaming(true);
      streamingBufferRef.current = '';

      for await (const chunk of apiClient.streamChat(projectId, chatRequest)) {
        if (chunk.type === 'error') {
          throw new Error(getStreamErrorMessage(chunk));
        }

        switch (chunk.type) {
          case 'content':
            fullContent += chunk.data;
            streamingBufferRef.current = fullContent;
            scheduleUpdate();
            break;
          case 'source': {
            const sourceData = parseStreamObject(chunk.data, chunk.metadata);
            if (sourceData) {
              sources.push(buildSourceReference(sourceData));
            }
            break;
          }
          case 'complete':
            if (chunk.metadata?.session_id) {
              newSessionId = chunk.metadata.session_id as string;
            }
            if (chunk.metadata?.next_suggestions) {
              setSuggestions(chunk.metadata.next_suggestions as string[]);
            }
            {
              const metadataTraceId = getStreamTraceId(chunk.metadata);
              if (metadataTraceId) traceId = metadataTraceId;
            }
            setAgentAction(null);
            break;
          case 'step_start': {
            const stepData = parseStreamObject(chunk.data, chunk.metadata);
            if (stepData) {
              const stepName = stringValue(stepData.name ?? stepData.step ?? stepData.step_name, 'Unknown step');
              const stepType = stringValue(stepData.step_type ?? stepData.type, 'unknown');
              setSteps((prev) => {
                if (prev.some((step) => step.name === stepName)) {
                  return prev.map((step) =>
                    step.name === stepName
                      ? { ...step, step_type: stepType, status: 'running' }
                      : step,
                  );
                }

                return [
                  ...prev,
                  {
                    name: stepName,
                    step_type: stepType,
                    status: 'running',
                  },
                ];
              });
            }
            break;
          }
          case 'step_end': {
            const endData = parseStreamObject(chunk.data, chunk.metadata);
            if (endData) {
              const stepName = stringValue(endData.name ?? endData.step ?? endData.step_name, 'Unknown step');
              const stepType = stringValue(endData.step_type ?? endData.type, 'unknown');
              const duration = numberValue(endData.duration_ms);
              const nextStatus = stringValue(endData.status) === 'error' ? 'error' : 'completed';
              setSteps((prev) => {
                if (!prev.some((step) => step.name === stepName)) {
                  return [
                    ...prev,
                    {
                      name: stepName,
                      step_type: stepType,
                      status: nextStatus,
                      duration_ms: duration,
                    },
                  ];
                }

                return prev.map((s) =>
                  s.name === stepName
                    ? {
                        ...s,
                        step_type: stepType,
                        status: nextStatus,
                        duration_ms: duration,
                      }
                    : s,
                );
              });
            }
            break;
          }
          case 'agent_action': {
            const actionData = parseStreamObject(chunk.data, chunk.metadata);
            if (actionData) {
              const input = stringValue(actionData.input ?? actionData.input_summary);
              setAgentAction({
                step: stringValue(actionData.step ?? actionData.parent_step ?? actionData.name),
                action: stringValue(actionData.action ?? actionData.message ?? chunk.data, 'Agent activity'),
                tool: stringValue(actionData.tool ?? actionData.name) || undefined,
                input: input || undefined,
                parent_step: stringValue(actionData.parent_step) || undefined,
                status: (actionData.status as AgentAction['status']) || undefined,
              });
            }
            break;
          }
          case 'tool_start': {
            const toolData = parseStreamObject(chunk.data, chunk.metadata);
            if (toolData) {
              const input = stringValue(toolData.input ?? toolData.input_summary);
              setAgentAction({
                step: stringValue(toolData.parent_step ?? 'tool'),
                action: stringValue(toolData.message, 'Calling tool'),
                tool: stringValue(toolData.name ?? toolData.tool, 'tool'),
                input: input || undefined,
                parent_step: stringValue(toolData.parent_step) || undefined,
                status: 'running',
              });
            }
            break;
          }
          case 'tool_end': {
            const toolData = parseStreamObject(chunk.data, chunk.metadata);
            if (toolData) {
              const output = stringValue(toolData.output ?? toolData.output_summary);
              setAgentAction({
                step: stringValue(toolData.parent_step ?? 'tool'),
                action: stringValue(toolData.message, 'Tool completed'),
                tool: stringValue(toolData.name ?? toolData.tool, 'tool'),
                output: output || undefined,
                parent_step: stringValue(toolData.parent_step) || undefined,
                status: (toolData.status as AgentAction['status']) || 'completed',
                duration_ms: numberValue(toolData.duration_ms),
              });
            }
            break;
          }
        }
      }

      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      setIsStreaming(false);

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fullContent,
        sources,
        timestamp: new Date(),
        metadata: traceId ? { trace_id: traceId } : undefined,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setStreamingContent('');

      if (newSessionId && newSessionId !== sessionId) {
        setSessionId(newSessionId);
        fetchSessions(1, { query: sessionsQuery });
      }

      setSteps([]);
      setAgentAction(null);
    } catch (err) {
      setIsStreaming(false);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      setSteps((prev) =>
        prev.map((s) => (s.status === 'running' ? { ...s, status: 'error' } : s)),
      );
      if (err instanceof ApiHttpError && err.status === 429) {
        setError('The project has reached its usage quota. Please try again later.');
      } else {
        setError(err instanceof Error ? err.message : 'Chat failed');
      }
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <>
      {error && (
        <div style={{ padding: '0.5rem 0.75rem' }}>
          <Notification type="error" defaultOpen onCloseClick={() => setError('')}>
            {error}
          </Notification>
        </div>
      )}
      <div className="widget-chat-host">
        <ChatInterface
          projectId={projectId}
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={chatLoading}
          streamingContent={streamingContent}
          suggestions={suggestions}
          sessionId={sessionId}
          apiBaseUrl={apiBaseUrl}
          isStreaming={isStreaming}
          steps={steps}
          agentAction={agentAction}
          sessions={sessions}
          onSelectSession={handleSelectSession}
          onCreateSession={handleCreateSession}
          onDeleteSession={handleDeleteSession}
          onUpdateSession={handleUpdateSession}
          onSearch={handleSearchSessions}
          isLoadingSessions={sessionsLoading}
          hasMoreSessions={sessions.length < sessionsTotal}
          onLoadMoreSessions={handleLoadMoreSessions}
          isLoadingMoreSessions={sessionsLoadingMore}
          hasOlderMessages={hasOlderMessages}
          onLoadOlderMessages={handleLoadOlderMessages}
          isLoadingOlderMessages={olderMessagesLoading}
        />
      </div>
    </>
  );
};
