# SearchForm

Search input form with suggestions support.

---

## Import

```tsx
import { SearchForm, SearchSuggestions } from '@bosch/react-frok';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | - | Input ID |
| `value` | `string` | - | Search value (controlled) |
| `defaultValue` | `string` | - | Initial value |
| `onChange` | `(value: string) => void` | - | Value change handler |
| `onSubmit` | `(value: string) => void` | - | Form submit handler |
| `onClear` | `() => void` | - | Clear button handler |
| `placeholder` | `string` | `'Search...'` | Placeholder text |
| `suggestions` | `ReactNode` | - | SearchSuggestions component |
| `disabled` | `boolean` | `false` | Disable input |
| `className` | `string` | - | Additional CSS classes |

---

## CSS Classes

| Class | Description |
|-------|-------------|
| `.m-search-form` | Base container |
| `.m-search-form__input` | Input field |
| `.m-search-form__icon-search` | Search icon |
| `.m-search-form__icon-close` | Clear button |
| `.m-search-form__icon-close--visible` | Show clear button |
| `.m-search-form__suggestions` | Suggestions container |

---

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--g-gray-100` | `#ffffff` | Input background |
| `--g-gray-85` | `#d0d4d8` | Border color |
| `--g-blue-50` | `#007bc0` | Focus border |
| `--g-gray-50` | `#525f6b` | Icon color |

---

## Usage Examples

### Basic Search Form
```tsx
<SearchForm
  id="search"
  placeholder="Search..."
  onSubmit={(value) => handleSearch(value)}
/>
```

### Controlled Search
```tsx
const [query, setQuery] = useState('');

<SearchForm
  id="search"
  value={query}
  onChange={setQuery}
  onSubmit={(value) => {
    performSearch(value);
  }}
  onClear={() => setQuery('')}
/>
```

### With Suggestions
```tsx
const [query, setQuery] = useState('');
const [showSuggestions, setShowSuggestions] = useState(false);
const [suggestions, setSuggestions] = useState<string[]>([]);

useEffect(() => {
  if (query.length > 2) {
    fetchSuggestions(query).then(setSuggestions);
    setShowSuggestions(true);
  } else {
    setSuggestions([]);
    setShowSuggestions(false);
  }
}, [query]);

<SearchForm
  id="search-with-suggestions"
  value={query}
  onChange={setQuery}
  onSubmit={(value) => {
    performSearch(value);
    setShowSuggestions(false);
  }}
  suggestions={
    <SearchSuggestions
      visible={showSuggestions && suggestions.length > 0}
      onClose={() => setShowSuggestions(false)}
    >
      {suggestions.map(item => (
        <MenuItem
          key={item}
          label={item}
          onClick={() => {
            setQuery(item);
            performSearch(item);
            setShowSuggestions(false);
          }}
        />
      ))}
    </SearchSuggestions>
  }
/>
```

### In Header
```tsx
<Header
  logo={{ href: '/' }}
  searchForm={{
    id: 'header-search',
    placeholder: 'Search products...',
    onSubmit: handleSearch
  }}
  menu={{ children: <MainMenu /> }}
/>
```

### With Debounce
```tsx
const [query, setQuery] = useState('');
const debouncedQuery = useDebounce(query, 300);

useEffect(() => {
  if (debouncedQuery) {
    fetchResults(debouncedQuery);
  }
}, [debouncedQuery]);

<SearchForm
  id="debounced-search"
  value={query}
  onChange={setQuery}
  onSubmit={handleSubmit}
/>
```

### Global Search
```tsx
const GlobalSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({
    products: [],
    articles: [],
    users: []
  });

  return (
    <div style={{ position: 'relative', width: '400px' }}>
      <SearchForm
        id="global-search"
        value={query}
        onChange={setQuery}
        placeholder="Search everything..."
        suggestions={
          <SearchSuggestions visible={query.length > 0}>
            {results.products.length > 0 && (
              <div className="suggestion-group">
                <span className="-size-xs" style={{ padding: '0.5rem', color: 'var(--g-gray-50)' }}>
                  Products
                </span>
                {results.products.map(p => (
                  <MenuItem key={p.id} label={p.name} icon="box" link={`/products/${p.id}`} />
                ))}
              </div>
            )}
            {results.articles.length > 0 && (
              <div className="suggestion-group">
                <span className="-size-xs" style={{ padding: '0.5rem', color: 'var(--g-gray-50)' }}>
                  Articles
                </span>
                {results.articles.map(a => (
                  <MenuItem key={a.id} label={a.title} icon="file" link={`/articles/${a.id}`} />
                ))}
              </div>
            )}
          </SearchSuggestions>
        }
      />
    </div>
  );
};
```

### Filter Table
```tsx
const [filter, setFilter] = useState('');

const filteredData = data.filter(item =>
  item.name.toLowerCase().includes(filter.toLowerCase())
);

<div>
  <SearchForm
    id="table-filter"
    value={filter}
    onChange={setFilter}
    placeholder="Filter results..."
  />
  <Table>
    {/* Table with filteredData */}
  </Table>
</div>
```

---

## Accessibility

```tsx
<form role="search" aria-label="Site search">
  <SearchForm
    id="accessible-search"
    aria-label="Search query"
    onSubmit={handleSearch}
  />
</form>
```

- Use `role="search"` on form wrapper
- Provide accessible labels
- Ensure keyboard navigation for suggestions

---

## Do's and Don'ts

**Do:**
- Show clear button when there's input
- Debounce API calls for suggestions
- Support keyboard navigation
- Show loading state during fetch

**Don't:**
- Don't auto-submit on every keystroke
- Don't show too many suggestions
- Don't block typing while loading

---

## Related Components
- [SearchSuggestions](../atoms/search-suggestions.md) — Suggestion dropdown
- [TextField](../atoms/input.md) — Basic input
- [Header](../organisms/header.md) — App header with search
