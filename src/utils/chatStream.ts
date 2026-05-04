import type { SourceReference, StreamingChunk } from '../types';

export const parseStreamObject = (
  data: string,
  metadata?: Record<string, unknown> | null
): Record<string, unknown> | null => {
  if (data) {
    try {
      const parsed = JSON.parse(data) as unknown;
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
      return { value: parsed };
    } catch {
      return metadata ?? null;
    }
  }

  return metadata ?? null;
};

export const stringValue = (value: unknown, fallback = ''): string => {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return fallback;
  return String(value);
};

export const numberValue = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

export const getStreamTraceId = (metadata?: Record<string, unknown> | null): string | undefined => {
  const traceId = metadata?.trace_id ?? metadata?.traceId;
  return typeof traceId === 'string' && traceId.trim() ? traceId.trim() : undefined;
};

export const getStreamErrorMessage = (chunk: StreamingChunk): string => {
  const payload = parseStreamObject(chunk.data, chunk.metadata);
  const message = payload?.message ?? payload?.error ?? payload?.detail;
  if (typeof message === 'string' && message.trim()) return message;
  if (chunk.data.trim()) return chunk.data;
  return 'An error occurred';
};

export const buildSourceReference = (payload: Record<string, unknown>): SourceReference => ({
  document_id: stringValue(payload.document_id),
  document_name: stringValue(payload.document_name ?? payload.source_doc_name, 'Unknown'),
  chunk_id: stringValue(payload.chunk_id),
  excerpt: stringValue(payload.excerpt ?? payload.content),
  relevance_score: numberValue(payload.relevance_score ?? payload.score) ?? 0,
  position: typeof payload.position === 'string' ? payload.position : undefined,
  source_type: payload.source_type as SourceReference['source_type'],
  page_number: numberValue(payload.page_number),
  bounding_box: payload.bounding_box as SourceReference['bounding_box'],
  page_image_url: payload.page_image_url as string | undefined,
  page_image_urls: payload.page_image_urls as SourceReference['page_image_urls'],
  source_url: payload.source_url as string | undefined,
  section: payload.section as string | undefined,
  sheet_name: payload.sheet_name as string | undefined,
  cell_range: payload.cell_range as string | undefined,
  binary_hash: payload.binary_hash as string | undefined,
  bounding_box_points: payload.bounding_box_points as SourceReference['bounding_box_points'],
  elements_detail: payload.elements_detail as SourceReference['elements_detail'],
  headings: payload.headings as SourceReference['headings'],
  page_range: payload.page_range as SourceReference['page_range'],
  hash_unique_id: payload.hash_unique_id as string | null | undefined,
});
