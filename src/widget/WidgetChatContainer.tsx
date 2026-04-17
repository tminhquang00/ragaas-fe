import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Notification } from '@bosch/react-frok';
import { ChatInterface } from '../components/chat';
import { ApiHttpError } from '../services/api';
import {
  SourceReference,
  StepProgress,
  AgentAction,
  ChatSession,
  ImageContent,
} from '../types';
import { useWidgetAuth } from './WidgetAuthProvider';

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
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [steps, setSteps] = useState<StepProgress[]>([]);
  const [agentAction, setAgentAction] = useState<AgentAction | null>(null);
  const [error, setError] = useState('');

  const streamingBufferRef = useRef('');
  const rafIdRef = useRef<number | null>(null);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  const fetchSessions = useCallback(async () => {
    if (!projectId) return;
    try {
      setSessionsLoading(true);
      const data = await apiClient.getSessions(projectId);
      setSessions(data.sessions);
    } catch (err) {
      console.error('Widget: failed to load sessions:', err);
    } finally {
      setSessionsLoading(false);
    }
  }, [apiClient, projectId]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    const loadSessionMessages = async () => {
      if (!sessionId) {
        setMessages([]);
        return;
      }
      try {
        setChatLoading(true);
        const msgs = await apiClient.getSessionMessages(projectId, sessionId);
        const chatMsgs: ChatMessage[] = msgs.messages.map((m) => ({
          id: m.message_id,
          role: m.role as 'user' | 'assistant',
          content: m.content,
          timestamp: new Date(m.timestamp),
          sources: m.metadata?.sources as SourceReference[] | undefined,
          images: m.images,
          metadata: m.metadata,
        }));
        setMessages(chatMsgs);
      } catch (err) {
        console.error('Widget: failed to load session messages:', err);
        setMessages([]);
      } finally {
        setChatLoading(false);
      }
    };

    loadSessionMessages();
  }, [sessionId, apiClient, projectId]);

  const handleCreateSession = useCallback(() => {
    setSessionId(undefined);
    setMessages([]);
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
        fetchSessions();
      } catch (err) {
        console.error('Widget: failed to delete session:', err);
      }
    },
    [apiClient, projectId, sessionId, handleCreateSession, fetchSessions],
  );

  const handleUpdateSession = useCallback(
    async (sid: string, title: string) => {
      try {
        await apiClient.updateSession(projectId, sid, { title });
        fetchSessions();
      } catch (err) {
        console.error('Widget: failed to update session:', err);
      }
    },
    [apiClient, projectId, fetchSessions],
  );

  const handleSearchSessions = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        fetchSessions();
        return;
      }
      try {
        const result = await apiClient.searchSessions(projectId, query);
        setSessions(result.sessions);
      } catch (err) {
        console.error('Widget: failed to search sessions:', err);
      }
    },
    [apiClient, projectId, fetchSessions],
  );

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
        if ((chunk as any).type === 'error') {
          const errorMsg =
            typeof chunk.data === 'string'
              ? chunk.data
              : (chunk.data as any)?.message || 'Unknown error';
          throw new Error(errorMsg);
        }

        switch (chunk.type) {
          case 'content':
            fullContent += chunk.data;
            streamingBufferRef.current = fullContent;
            scheduleUpdate();
            break;
          case 'source': {
            let sourceData: Record<string, unknown> | null = null;
            if (chunk.data) {
              try {
                sourceData =
                  typeof chunk.data === 'string'
                    ? JSON.parse(chunk.data)
                    : (chunk.data as Record<string, unknown>);
              } catch {
                /* ignore malformed source payloads */
              }
            }
            if (!sourceData && chunk.metadata && chunk.metadata.document_id) {
              sourceData = chunk.metadata as Record<string, unknown>;
            }
            if (sourceData) {
              const sourceRef: SourceReference = {
                document_id: String(sourceData.document_id || ''),
                document_name: String(
                  sourceData.document_name || sourceData.source_doc_name || 'Unknown',
                ),
                chunk_id: String(sourceData.chunk_id || ''),
                excerpt: String(sourceData.excerpt || sourceData.content || ''),
                relevance_score: Number(sourceData.relevance_score || sourceData.score || 0),
                position: sourceData.position as string | undefined,
                source_type: (sourceData.source_type as SourceReference['source_type']) || undefined,
                page_number:
                  sourceData.page_number !== undefined && sourceData.page_number !== null
                    ? Number(sourceData.page_number)
                    : undefined,
                bounding_box: sourceData.bounding_box as SourceReference['bounding_box'],
                page_image_url: sourceData.page_image_url as string | undefined,
                source_url: sourceData.source_url as string | undefined,
                section: sourceData.section as string | undefined,
                sheet_name: sourceData.sheet_name as string | undefined,
                cell_range: sourceData.cell_range as string | undefined,
                binary_hash: sourceData.binary_hash as string | undefined,
              };
              sources.push(sourceRef);
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
            setAgentAction(null);
            break;
          case 'step_start': {
            const stepData = chunk.data ? JSON.parse(chunk.data) : chunk.metadata;
            if (stepData) {
              setSteps((prev) => [
                ...prev,
                {
                  name: stepData.name || 'Unknown step',
                  step_type: stepData.step_type || 'unknown',
                  status: 'running',
                },
              ]);
            }
            break;
          }
          case 'step_end': {
            const endData = chunk.data ? JSON.parse(chunk.data) : chunk.metadata;
            if (endData) {
              setSteps((prev) =>
                prev.map((s) =>
                  s.name === endData.name
                    ? {
                        ...s,
                        status: endData.status === 'error' ? 'error' : 'completed',
                        duration_ms: endData.duration_ms,
                      }
                    : s,
                ),
              );
            }
            break;
          }
          case 'agent_action': {
            const actionData = chunk.data ? JSON.parse(chunk.data) : chunk.metadata;
            if (actionData) {
              setAgentAction({
                step: actionData.step || '',
                action: actionData.action || '',
                tool: actionData.tool,
                input: actionData.input,
              });
            }
            break;
          }
          case 'error': {
            const errorData = chunk.data ? JSON.parse(chunk.data) : chunk.metadata;
            const errorMessage = errorData?.message || errorData?.error || 'An error occurred';
            setError(errorMessage);
            setSteps((prev) =>
              prev.map((s) => (s.status === 'running' ? { ...s, status: 'error' } : s)),
            );
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
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setStreamingContent('');

      if (newSessionId && newSessionId !== sessionId) {
        setSessionId(newSessionId);
        fetchSessions();
      }

      setSteps([]);
      setAgentAction(null);
    } catch (err) {
      setIsStreaming(false);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
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
        />
      </div>
    </>
  );
};
