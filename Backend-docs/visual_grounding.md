# Visual Grounding - Frontend Integration Guide

This document describes the visual grounding changes introduced by the Docling batch processor refactoring. It covers new API fields, new endpoints, and how the frontend should use them to render source citations with per-element highlights.

---

## What Changed

Previously, each source citation included at most a single `bounding_box` (`{l, t, r, b}` normalized 0–1) pointing to one region on a page. The new batch processor produces **per-element structured metadata** (`elements_detail`) with precise bounding boxes for every text block, table, heading, and image in a chunk.

### New Fields on `SourceReference`

The chat response `sources[]` array now includes these additional fields:

| Field | Type | Description |
|---|---|---|
| `bounding_box_points` | `Object \| null` | **Union bounding box of all chunk text elements in PDF points** (see below) |
| `elements_detail` | `Array<Object> \| null` | Per-element type, coordinates, and optional content/base64 |
| `headings` | `Array<string> \| null` | Active heading hierarchy (e.g. `["Chapter 1", "Introduction"]`) |
| `page_range` | `Array<int> \| null` | `[start_page, end_page]` covered by this chunk |
| `hash_unique_id` | `string \| null` | Cross-reference ID: `"chunk-{document_id}-{chunk_index}"` |
| `page_image_urls` | `Object \| null` | **Per-page highlight URLs** — `{ page_no: url }` for every page in `page_range` |

#### `bounding_box_points` — The Primary Visual Grounding Field

This is the key new field for showing **where the source text is on the page**. It is the union (envelope) bounding box of all content elements in the chunk, computed automatically from `elements_detail` during ingestion.

```json
{
  "l": 72.0,
  "t": 720.0,
  "r": 540.0,
  "b": 600.0,
  "coord_origin": "BOTTOMLEFT",
  "coord_system": "points"
}
```

- **Units**: PDF points (72 pts/inch)
- **`coord_origin`**: Almost always `"BOTTOMLEFT"` (PDF standard): Y increases upward, `t` > `b`
- **`coord_system`**: Always `"points"` to distinguish from legacy normalized `bounding_box`

The `page_image_url` is automatically built to use this bounding box with the `page-highlight` endpoint using `coord_system=points`. **Simply rendering `page_image_url` in an `<img>` tag gives the correct highlighted result.**

These fields are **nullable** — old documents ingested before the migration will have `null` values. The frontend should check for `null` and fall back to the legacy single bounding box.

### `elements_detail` Structure

```json
[
  {
    "type": "section_header",
    "coordinates": [
      {
        "page_no": 1,
        "bbox": {
          "left": 72.0,
          "top": 680.0,
          "right": 540.0,
          "bottom": 700.0,
          "coord_origin": "BOTTOMLEFT",
          "original_unit": "points"
        }
      }
    ],
    "content": "1. Introduction",
    "self_ref": "#/texts/0"
  },
  {
    "type": "text",
    "coordinates": [
      {
        "page_no": 1,
        "bbox": { "left": 72.0, "top": 620.0, "right": 540.0, "bottom": 670.0, "coord_origin": "BOTTOMLEFT", "original_unit": "points" }
      }
    ],
    "content": "This paper presents..."
  },
  {
    "type": "picture",
    "coordinates": [
      {
        "page_no": 2,
        "bbox": { "left": 100.0, "top": 400.0, "right": 500.0, "bottom": 600.0, "coord_origin": "BOTTOMLEFT", "original_unit": "points" }
      }
    ],
    "base64": "iVBORw0KGgo...",
    "self_ref": "#/pictures/0"
  },
  {
    "type": "table",
    "coordinates": [
      {
        "page_no": 3,
        "bbox": { "left": 72.0, "top": 300.0, "right": 540.0, "bottom": 500.0, "coord_origin": "BOTTOMLEFT", "original_unit": "points" }
      }
    ]
  }
]
```

**Element types**: `text`, `section_header`, `table`, `picture`, `figure`, `list_item`, `caption`, `formula`, `page_header`, `page_footer`, `footnote`

**Coordinate system**: Bounding boxes are in PDF points (72 points per inch). The `coord_origin` field tells you the origin:
- `BOTTOMLEFT` (most common): Y increases upward. To convert to screen coordinates: `y_screen = page_height - y_pdf`
- `TOPLEFT`: Y increases downward (already screen-like)

---

## API Endpoints

### `GET /api/v1/page-highlight/{binary_hash}` (updated)

Renders a page image with a **single highlighted rectangle**. Updated to support both normalized (0-1) and PDF-point coordinates.

**Query parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `page_no` | int | required | Page number (1-indexed) |
| `bbox_l` | float | `0` | Left coordinate |
| `bbox_t` | float | `0` | Top coordinate |
| `bbox_r` | float | `1` | Right coordinate |
| `bbox_b` | float | `1` | Bottom coordinate |
| `coord_system` | string | `normalized` | `"normalized"` (0-1 fraction) or `"points"` (PDF points) |
| `coord_origin` | string | `BOTTOMLEFT` | `"BOTTOMLEFT"` or `"TOPLEFT"` — used when `coord_system=points` |
| `highlight_color` | string | `blue` | CSS color |
| `line_width` | int | `3` | Border width (1–10) |

**`coord_system=points` example (new batch processor output):**
```
GET /api/v1/page-highlight/abc123?page_no=2&bbox_l=72&bbox_t=680&bbox_r=540&bbox_b=620&coord_system=points
```
This is exactly the URL generated in `SourceReference.page_image_url` for chunks processed by the new batch processor.

**`coord_system=normalized` example (legacy):**
```
GET /api/v1/page-highlight/abc123?page_no=2&bbox_l=0.1&bbox_t=0.8&bbox_r=0.9&bbox_b=0.6
```

### `GET /api/v1/page-multi-highlight/{binary_hash}` (new)

Renders a page image with **multiple colored element highlights** (one per element type in the chunk).

**Query parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `page_no` | int | Yes | Page number (1-indexed) |
| `hash_unique_id` | string | No | Chunk hash_unique_id — looks up `elements_detail` from MongoDB |
| `highlight_color` | string | No | Default color (default: `"blue"`) |
| `line_width` | int | No | Border width 1–10 (default: `2`) |

**Response**: `image/png`

**Example:**
```
GET /api/v1/page-multi-highlight/abc123def456?page_no=2&hash_unique_id=chunk-doc1-0
```

Elements are highlighted with type-specific colors:
- **Text**: blue
- **Section headers**: green
- **Tables**: orange
- **Pictures/Figures**: red
- **List items**: purple
- **Captions**: teal

### `GET /api/v1/chunk-elements/{binary_hash}`

Returns the raw `elements_detail` for a chunk. Use this when the frontend wants to render its own overlay on top of a page image.

**Query parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `hash_unique_id` | string | Yes | Chunk hash_unique_id |

**Response:**
```json
{
  "hash_unique_id": "chunk-doc1-0",
  "binary_hash": "abc123...",
  "headings": ["Introduction", "Background"],
  "page_range": [1, 3],
  "elements": [
    {
      "type": "text",
      "coordinates": [{"page_no": 1, "bbox": {"left": 72, "top": 620, "right": 540, "bottom": 670, "coord_origin": "BOTTOMLEFT", "original_unit": "points"}}],
      "content": "This paper presents..."
    }
  ]
}
```

### Existing Endpoints (Unchanged)

| Endpoint | Description |
|---|---|
| `GET /api/v1/page-highlight/{binary_hash}` | Single bounding box highlight (legacy) |
| `GET /api/v1/page/{binary_hash}?page_no=N` | Plain page image (no highlights) |
| `GET /api/v1/page-count/{binary_hash}` | Total page count |
| `GET /api/v1/pages/{binary_hash}` | List available page numbers |
| `GET /api/v1/download/{binary_hash}` | Download original document file |

---

## `page_image_url` Auto-Generation

The `page_image_url` field in `SourceReference` is auto-generated with this priority:

1. **`hash_unique_id` + `page_number`** → `/api/v1/page-multi-highlight/{hash}?page_no=N&hash_unique_id=...`  ← **primary path** (most accurate — loads full elements_detail from DB)
2. **`bounding_box_points`** (new batch processor) → `/api/v1/page-highlight/{hash}?page_no=N&bbox_l=...&coord_system=points`
3. **`elements_detail` with coordinates** → `/api/v1/page-multi-highlight/{hash}?page_no={first_page}`
4. **Legacy `bounding_box`** (normalized 0-1) → `/api/v1/page-highlight/{hash}?page_no=N&bbox_l=...`
5. **`page_number` only** → `/api/v1/page/{hash}?page_no=N` (plain page image)
6. **null** — no grounding available

The **simplest frontend integration** is to use `page_image_url` directly. It always points to the most precise highlighting available for the chunk.

The frontend can use `page_image_url` directly for quick rendering, or use `hash_unique_id` with the `/chunk-elements/` endpoint for custom overlay rendering.

---

## `page_image_urls` — Per-Page Highlight URLs (New)

**Problem solved:** A chunk can span multiple pages (e.g. `page_range=[3,4]`). The single `page_image_url` always points to the first page only. When the user navigates to page 4 in the citation viewer, no highlight URL was available for that page.

**Solution:** `page_image_urls` is a dict mapping each page number in `page_range` → its correct highlight URL. The backend calls `/page-multi-highlight/` with the right `page_no` for each page — the endpoint already filters elements by `page_no` server-side.

### Example

For a chunk with `page_range=[3,4]` and `hash_unique_id="chunk-doc1-0"`:

```json
{
  "page_image_url": "/api/v1/page-multi-highlight/abc?page_no=3&hash_unique_id=chunk-doc1-0",
  "page_image_urls": {
    "3": "/api/v1/page-multi-highlight/abc?page_no=3&hash_unique_id=chunk-doc1-0",
    "4": "/api/v1/page-multi-highlight/abc?page_no=4&hash_unique_id=chunk-doc1-0"
  },
  "page_range": [3, 4]
}
```

> **Note:** `page_image_urls` keys are **strings** (e.g. `"3"`, `"4"`) — not integers — so the dict is safe to store in MongoDB and serializes cleanly to JSON.
```

- `page_image_url` is **unchanged** — still points to the first page for backward compatibility.
- `page_image_urls` provides the correct URL **per page**.
- For single-page chunks, `page_image_urls` has exactly one entry matching `page_image_url`.
- `page_image_urls` is `null` for non-PDF sources or when `binary_hash` is not available.

### Frontend Usage

```tsx
function SourceViewer({ source }: { source: SourceReference }) {
  // Determine pages to show (default to single page_number)
  const pages = source.page_range
    ? Array.from(
        { length: source.page_range[1] - source.page_range[0] + 1 },
        (_, i) => source.page_range![0] + i
      )
    : source.page_number != null ? [source.page_number] : [];

  const [currentPage, setCurrentPage] = useState(pages[0]);

  // Look up the correct highlight URL for the currently-viewed page
  // Keys are strings, so convert currentPage to string
  const highlightUrl =
    source.page_image_urls?.[String(currentPage)]  // per-page URL (new)
    ?? source.page_image_url               // fallback to first page (legacy)
    ?? null;

  return (
    <div>
      {/* Page navigation tabs (only shown for multi-page chunks) */}
      {pages.length > 1 && (
        <div className="flex gap-1 mb-2">
          {pages.map(p => (
            <button
              key={p}
              onClick={() => setCurrentPage(p)}
              className={p === currentPage ? 'font-bold underline' : ''}
            >
              Page {p}
            </button>
          ))}
        </div>
      )}

      {/* Highlight image — URL automatically reflects current page */}
      {highlightUrl && (
        <img src={highlightUrl} alt={`Page ${currentPage} highlight`} />
      )}
    </div>
  );
}
```

**Key rule:** always prefer `page_image_urls[currentPage]` over `page_image_url` when the user changes the page. If `page_image_urls` is null (old data), fall back to `page_image_url`.

---

## Frontend Integration Strategies

### Strategy 1: Server-Side Rendering (Simple)

Use the `page_image_url` directly in an `<img>` tag:

```tsx
{source.page_image_url && (
  <img
    src={source.page_image_url}
    alt={`Source from ${source.document_name}`}
  />
)}
```

For the new multi-highlight endpoint, append `hash_unique_id`:

```tsx
function getHighlightUrl(source: SourceReference): string | null {
  if (!source.binary_hash) return null;

  // New structured grounding
  if (source.hash_unique_id && source.elements_detail?.length) {
    const page = source.page_range?.[0] ?? source.page_number ?? 1;
    return `/api/v1/page-multi-highlight/${source.binary_hash}?page_no=${page}&hash_unique_id=${source.hash_unique_id}`;
  }

  // Legacy single bbox
  if (source.page_image_url) {
    return source.page_image_url;
  }

  // Plain page image
  if (source.page_number != null) {
    return `/api/v1/page/${source.binary_hash}?page_no=${source.page_number}`;
  }

  return null;
}
```

### Strategy 2: Client-Side Overlay (Rich)

For interactive highlighting (hover to see element type, click to zoom, etc.), fetch the elements data and render overlays on a `<canvas>` or absolutely-positioned `<div>` elements:

```tsx
async function loadChunkElements(binaryHash: string, hashUniqueId: string) {
  const resp = await fetch(
    `/api/v1/chunk-elements/${binaryHash}?hash_unique_id=${hashUniqueId}`
  );
  return resp.json();
}

// In your component:
function SourceHighlight({ source }: { source: SourceReference }) {
  const [elements, setElements] = useState(null);
  const [pageImg, setPageImg] = useState<string | null>(null);

  useEffect(() => {
    if (source.hash_unique_id && source.binary_hash) {
      loadChunkElements(source.binary_hash, source.hash_unique_id)
        .then(setElements);
    }
  }, [source]);

  const pageNo = source.page_range?.[0] ?? source.page_number ?? 1;

  return (
    <div style={{ position: 'relative' }}>
      {/* Base page image */}
      <img
        src={`/api/v1/page/${source.binary_hash}?page_no=${pageNo}`}
        onLoad={(e) => {/* store natural dimensions */}}
      />

      {/* Overlay bounding boxes */}
      {elements?.elements
        ?.filter(el => el.coordinates?.some(c => c.page_no === pageNo))
        .map((el, i) => {
          const coord = el.coordinates.find(c => c.page_no === pageNo);
          const bbox = coord.bbox;
          // Convert from PDF points to pixel coordinates
          // coord_origin is typically BOTTOMLEFT for PDFs
          return (
            <div
              key={i}
              title={el.type}
              style={{
                position: 'absolute',
                left: `${(bbox.left / pageWidth) * 100}%`,
                // For BOTTOMLEFT origin, flip Y
                top: `${((pageHeight - bbox.top) / pageHeight) * 100}%`,
                width: `${((bbox.right - bbox.left) / pageWidth) * 100}%`,
                height: `${((bbox.top - bbox.bottom) / pageHeight) * 100}%`,
                border: `2px solid ${getColorForType(el.type)}`,
                pointerEvents: 'all',
              }}
            />
          );
        })}
    </div>
  );
}

function getColorForType(type: string): string {
  const colors: Record<string, string> = {
    text: '#3b82f6',         // blue
    section_header: '#22c55e', // green
    table: '#f97316',         // orange
    picture: '#ef4444',       // red
    figure: '#ef4444',        // red
    list_item: '#a855f7',     // purple
    caption: '#14b8a6',       // teal
  };
  return colors[type] ?? '#6b7280'; // gray default
}
```

### Strategy 3: Heading Breadcrumb

Display the heading hierarchy above the source excerpt:

```tsx
{source.headings && source.headings.length > 0 && (
  <div className="text-sm text-gray-500">
    {source.headings.join(' > ')}
  </div>
)}
```

The `section` field is also auto-populated from headings (as `"Heading1 > Heading2"`), so you can use either.

### Strategy 4: Page Range Navigation

When a chunk spans multiple pages, use `page_image_urls` to show the correct highlight as the user navigates between pages:

```tsx
const [currentPage, setCurrentPage] = useState(
  source.page_range?.[0] ?? source.page_number ?? 1
);

// Resolve the highlight URL for the active page
const highlightUrl =
  source.page_image_urls?.[String(currentPage)]
  ?? source.page_image_url
  ?? null;

{source.page_range && source.page_range.length === 2 && (
  <div className="flex gap-1">
    {Array.from(
      { length: source.page_range[1] - source.page_range[0] + 1 },
      (_, i) => source.page_range![0] + i
    ).map(pageNo => (
      <button
        key={pageNo}
        onClick={() => setCurrentPage(pageNo)}
        className={pageNo === currentPage ? 'active' : ''}
      >
        Page {pageNo}
      </button>
    ))}
  </div>
)}

{highlightUrl && <img src={highlightUrl} alt={`Page ${currentPage}`} />}
```

> **Before this change**, clicking "Page 4" would still show the page 3 highlight because only `page_image_url` existed. Now `page_image_urls[4]` returns the correct highlight URL for page 4.

---

## Backward Compatibility

| Scenario | Behavior |
|---|---|
| Documents ingested before migration | `elements_detail`, `headings`, `page_range`, `hash_unique_id` are all `null`. Legacy `bounding_box` and `page_image_url` still work. |
| Documents ingested after migration (PDF) | Full structured fields populated. `page_image_url` points to multi-highlight endpoint. |
| Documents ingested after migration (non-PDF) | Only basic fields populated (`page_number`, `section`). No `elements_detail`. |
| Migration script run on old data | Adds empty defaults to MongoDB. `hash_unique_id` is backfilled as `"chunk-{document_id}-{chunk_index}"`. No `elements_detail` data (would need re-ingestion). |

**Frontend should always check for null/empty before rendering structured grounding UI.** A safe pattern:

```tsx
const hasStructuredGrounding = source.elements_detail && source.elements_detail.length > 0;
const hasLegacyGrounding = source.bounding_box != null;

if (hasStructuredGrounding) {
  // Render multi-element overlay
} else if (hasLegacyGrounding) {
  // Render single bounding box
} else if (source.page_number != null && source.binary_hash) {
  // Show plain page image
} else {
  // Text-only citation (no visual grounding)
}
```

---

## TypeScript Types

```typescript
interface SourceReference {
  document_id: string;
  document_name: string;
  chunk_id: string;
  excerpt: string;
  relevance_score: number;

  source_type?: string | null;   // "pdf", "docx", "excel", "text"
  source_url?: string | null;
  position?: string | null;

  // PDF visual grounding (legacy — normalized 0-1)
  page_number?: number | null;
  bounding_box?: { l: number; t: number; r: number; b: number } | null;
  page_image_url?: string | null;       // Pre-built URL for first page — use in <img src={...} />
  page_image_urls?: Record<string, string> | null;  // Per-page URLs keyed by string page_no — use when navigating pages
  binary_hash?: string | null;

  // Structured visual grounding (new batch processor)
  bounding_box_points?: {        // Union bbox of chunk text in PDF points
    l: number; t: number; r: number; b: number;
    coord_origin: "BOTTOMLEFT" | "TOPLEFT";
    coord_system: "points";
  } | null;
  elements_detail?: ElementDetail[] | null;
  headings?: string[] | null;
  page_range?: [number, number] | null;
  hash_unique_id?: string | null;

  // DOCX-specific
  section?: string | null;
  paragraph_index?: number | null;

  // Excel-specific
  sheet_name?: string | null;
  cell_range?: string | null;
}

interface ElementDetail {
  type: string;  // "text", "section_header", "table", "picture", "figure", "list_item", etc.
  coordinates: ElementCoordinate[];
  content?: string;     // Text content (for text elements)
  base64?: string;      // Base64 PNG image data (for picture/figure elements)
  self_ref?: string;    // Internal Docling reference
}

interface ElementCoordinate {
  page_no: number;
  bbox: {
    left: number;
    top: number;
    right: number;
    bottom: number;
    coord_origin: "BOTTOMLEFT" | "TOPLEFT";
    original_unit: "points" | "EMU";
  };
  charspan?: [number, number] | null;
}

interface ChunkElementsResponse {
  hash_unique_id: string;
  binary_hash: string;
  headings: string[];
  page_range: number[];
  elements: ElementDetail[];
}
```

---

## Summary of Changes

| Component | Change |
|---|---|
| `SourceReference` model | Added `bounding_box_points`, `elements_detail`, `headings`, `page_range`, `hash_unique_id` |
| `bounding_box_points` | **New** — envelope bbox in PDF points, computed from all chunk elements. Use this for single-rectangle highlighting. |
| `page_image_url` generation | Priority: `hash_unique_id` → `bounding_box_points` → `elements_detail` → legacy `bounding_box` → plain page |
| `page_image_urls` field | **New** — `{page_no: url}` for every page in `page_range`; use instead of `page_image_url` when user navigates to a non-first page |
| `GET /page-highlight/` | **Updated** — now accepts `coord_system=points` + `coord_origin` for PDF-point coordinates |
| `GET /page-multi-highlight/` | **New** — renders multiple colored highlights per element type |
| `GET /chunk-elements/` | **New** — returns raw elements_detail for client-side overlay rendering |
| `section` field | Auto-populated from `headings` (joined with ` > `) when not explicitly set |
| `chunking_service.py` | Added `compute_envelope_bbox_from_elements()` — computes union bbox from elements_detail |
| Vector store metadata | `hash_unique_id` + `bounding_box_points` stored for cross-referencing and highlighting |
| MongoDB `document_chunks` | Full `elements_detail`, `headings`, `page_range`, `token_count`, `hash_unique_id` stored per chunk |
