# PageIndicator

Pagination component for navigating through pages of content.

---

## Import

```tsx
import { PageIndicator, createPaginationArray } from '@bosch/react-frok';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `pages` | `number` | - | **Required** — Total number of pages |
| `selected` | `number` | `1` | Current page (1-indexed) |
| `onPageSelect` | `(page: number) => void` | - | Page change handler |
| `numbered` | `boolean` | `true` | Show page numbers vs dots |
| `showFirstLast` | `boolean` | `true` | Show first/last page buttons |
| `showPrevNext` | `boolean` | `true` | Show prev/next buttons |
| `className` | `string` | - | Additional CSS classes |

---

## CSS Classes

| Class | Description |
|-------|-------------|
| `.a-page-indicator` | Base container |
| `.a-page-indicator__item` | Page button |
| `.a-page-indicator__item--selected` | Current page |
| `.a-page-indicator__item--disabled` | Disabled state |
| `.a-page-indicator__prev` | Previous button |
| `.a-page-indicator__next` | Next button |
| `.a-page-indicator__first` | First page button |
| `.a-page-indicator__last` | Last page button |
| `.a-page-indicator__ellipsis` | Truncation indicator |

---

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--nested-pure__enabled__default__fill` | `#ffffff` | Button background |
| `--nested-pure__enabled__hovered__fill` | `#eff1f2` | Button hover |
| `--nested-major__enabled__default__fill` | `#007bc0` | Selected page |
| `--nested-major__enabled__default__front` | `#ffffff` | Selected text |
| `--g-gray-85` | `#d0d4d8` | Border color |

---

## Usage Examples

### Basic Pagination
```tsx
const [page, setPage] = useState(1);

<PageIndicator
  pages={10}
  selected={page}
  onPageSelect={setPage}
/>
```

### Dot Style (Non-Numbered)
```tsx
<PageIndicator
  pages={5}
  selected={currentSlide}
  onPageSelect={setCurrentSlide}
  numbered={false}
/>
```

### Without First/Last Buttons
```tsx
<PageIndicator
  pages={20}
  selected={page}
  onPageSelect={setPage}
  showFirstLast={false}
/>
```

### Table Pagination
```tsx
const Page = ({ data, pageSize = 10 }) => {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(data.length / pageSize);
  
  const paginatedData = data.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  return (
    <>
      <Table>
        {/* Table content with paginatedData */}
      </Table>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
        <PageIndicator
          pages={totalPages}
          selected={page}
          onPageSelect={setPage}
        />
      </div>
    </>
  );
};
```

### Carousel Indicator
```tsx
<div className="carousel">
  <div className="carousel-slides">
    {slides[currentSlide]}
  </div>
  <PageIndicator
    pages={slides.length}
    selected={currentSlide + 1}
    onPageSelect={(p) => setCurrentSlide(p - 1)}
    numbered={false}
    showPrevNext={false}
    showFirstLast={false}
  />
</div>
```

### With Page Info
```tsx
<div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
  <span className="-size-s">
    Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} of {total}
  </span>
  <PageIndicator
    pages={totalPages}
    selected={page}
    onPageSelect={setPage}
  />
</div>
```

### Utility: createPaginationArray
```tsx
// Creates array for custom pagination rendering
const pages = createPaginationArray(currentPage, totalPages, maxVisible);
// e.g., [1, '...', 4, 5, 6, '...', 10]
```

---

## Accessibility

```tsx
<nav aria-label="Pagination">
  <PageIndicator
    pages={10}
    selected={page}
    onPageSelect={setPage}
    aria-label="Page navigation"
  />
</nav>
```

- Wrap in `<nav>` for screen readers
- Current page announced automatically
- Keyboard navigable

---

## Do's and Don'ts

**Do:**
- Show total items and current range
- Use dots for carousels/slideshows
- Use numbers for data tables
- Keep page numbers visible when possible

**Don't:**
- Don't use for single-page content
- Don't hide all navigation controls
- Don't use negative page numbers

---

## Related Components
- [Table](table.md) — Data table
- [DataList](../custom/data-list.md) — List pagination
