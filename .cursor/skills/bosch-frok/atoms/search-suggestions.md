# SearchSuggestions

Dropdown component displaying search suggestions under an input.

---

## Import

```tsx
import { SearchSuggestions } from '@bosch/react-frok';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | Suggestion items |
| `visible` | `boolean` | `false` | Show/hide suggestions |
| `onClose` | `() => void` | - | Close handler |
| `className` | `string` | - | Additional CSS classes |

---

## CSS Classes

| Class | Description |
|-------|-------------|
| `.a-search-suggestions` | Base container |
| `.a-search-suggestions--visible` | Visible state |
| `.a-search-suggestions__item` | Suggestion item |
| `.a-search-suggestions__item--highlighted` | Keyboard highlighted |
| `.a-search-suggestions__group` | Grouped suggestions |
| `.a-search-suggestions__group-label` | Group heading |

---

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--g-gray-100` | `#ffffff` | Background |
| `--g-gray-95` | `#eff1f2` | Highlight background |
| `--g-gray-85` | `#d0d4d8` | Border color |
| `--g-blue-50` | `#007bc0` | Accent color |

---

## Usage Examples

### Basic Search with Suggestions
```tsx
const [query, setQuery] = useState('');
const [showSuggestions, setShowSuggestions] = useState(false);
const [suggestions, setSuggestions] = useState<string[]>([]);

const handleSearch = (value: string) => {
  setQuery(value);
  // Fetch suggestions
  setSuggestions(value ? ['Result 1', 'Result 2', 'Result 3'] : []);
  setShowSuggestions(value.length > 0);
};

<div style={{ position: 'relative' }}>
  <TextField
    id="search"
    type="search"
    value={query}
    onChange={(e) => handleSearch(e.target.value)}
    onFocus={() => query && setShowSuggestions(true)}
    placeholder="Search..."
  />
  <SearchSuggestions
    visible={showSuggestions && suggestions.length > 0}
    onClose={() => setShowSuggestions(false)}
  >
    {suggestions.map((item, index) => (
      <MenuItem
        key={index}
        label={item}
        onClick={() => {
          setQuery(item);
          setShowSuggestions(false);
        }}
      />
    ))}
  </SearchSuggestions>
</div>
```

### With Categories
```tsx
<SearchSuggestions visible={showSuggestions} onClose={closeSuggestions}>
  <div className="a-search-suggestions__group">
    <span className="a-search-suggestions__group-label">Products</span>
    <MenuItem label="Product A" icon="box" onClick={() => selectSuggestion('product-a')} />
    <MenuItem label="Product B" icon="box" onClick={() => selectSuggestion('product-b')} />
  </div>
  <div className="a-search-suggestions__group">
    <span className="a-search-suggestions__group-label">Categories</span>
    <MenuItem label="Electronics" icon="folder" onClick={() => selectSuggestion('electronics')} />
  </div>
</SearchSuggestions>
```

### With Recent Searches
```tsx
const [recentSearches] = useState(['react', 'typescript', 'vite']);

<SearchSuggestions visible={showSuggestions} onClose={closeSuggestions}>
  {query ? (
    // Show matching suggestions
    filteredSuggestions.map(s => (
      <MenuItem key={s.id} label={s.name} onClick={() => select(s)} />
    ))
  ) : (
    // Show recent searches when empty
    <>
      <span className="-size-s" style={{ padding: '0.5rem', color: 'var(--g-gray-50)' }}>
        Recent Searches
      </span>
      {recentSearches.map(search => (
        <MenuItem 
          key={search} 
          label={search} 
          icon="clock" 
          onClick={() => setQuery(search)} 
        />
      ))}
    </>
  )}
</SearchSuggestions>
```

### With Keyboard Navigation
```tsx
const [highlightedIndex, setHighlightedIndex] = useState(-1);

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'ArrowDown') {
    setHighlightedIndex(i => Math.min(i + 1, suggestions.length - 1));
  } else if (e.key === 'ArrowUp') {
    setHighlightedIndex(i => Math.max(i - 1, 0));
  } else if (e.key === 'Enter' && highlightedIndex >= 0) {
    selectSuggestion(suggestions[highlightedIndex]);
  } else if (e.key === 'Escape') {
    setShowSuggestions(false);
  }
};

<TextField
  onKeyDown={handleKeyDown}
  // ...other props
/>
<SearchSuggestions visible={showSuggestions}>
  {suggestions.map((item, index) => (
    <MenuItem
      key={item.id}
      label={item.name}
      className={index === highlightedIndex ? 'a-search-suggestions__item--highlighted' : ''}
      onClick={() => selectSuggestion(item)}
    />
  ))}
</SearchSuggestions>
```

### With Loading State
```tsx
<SearchSuggestions visible={showSuggestions} onClose={closeSuggestions}>
  {isLoading ? (
    <div style={{ padding: '1rem', textAlign: 'center' }}>
      <ActivityIndicator size="small" />
      <span className="-size-s" style={{ marginLeft: '0.5rem' }}>
        Searching...
      </span>
    </div>
  ) : suggestions.length > 0 ? (
    suggestions.map(s => <MenuItem key={s.id} label={s.name} onClick={() => select(s)} />)
  ) : (
    <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--g-gray-50)' }}>
      No results found
    </div>
  )}
</SearchSuggestions>
```

### With Highlighted Match
```tsx
const highlightMatch = (text: string, query: string) => {
  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) return text;
  return (
    <>
      {text.slice(0, index)}
      <strong>{text.slice(index, index + query.length)}</strong>
      {text.slice(index + query.length)}
    </>
  );
};

<SearchSuggestions visible={showSuggestions}>
  {suggestions.map(item => (
    <MenuItem
      key={item.id}
      label={highlightMatch(item.name, query)}
      onClick={() => select(item)}
    />
  ))}
</SearchSuggestions>
```

---

## Accessibility

```tsx
<div role="combobox" aria-expanded={showSuggestions} aria-haspopup="listbox">
  <TextField
    aria-autocomplete="list"
    aria-controls="suggestions-list"
    aria-activedescendant={highlightedIndex >= 0 ? `suggestion-${highlightedIndex}` : undefined}
  />
  <SearchSuggestions visible={showSuggestions}>
    <ul id="suggestions-list" role="listbox">
      {suggestions.map((s, i) => (
        <li 
          key={s.id} 
          id={`suggestion-${i}`} 
          role="option"
          aria-selected={i === highlightedIndex}
        >
          {s.name}
        </li>
      ))}
    </ul>
  </SearchSuggestions>
</div>
```

---

## Do's and Don'ts

**Do:**
- Close on outside click
- Support keyboard navigation
- Show loading state during fetch
- Highlight matching text
- Show recent/popular when empty

**Don't:**
- Don't show too many suggestions (max ~10)
- Don't block typing while loading
- Don't auto-select on hover

---

## Related Components
- [SearchForm](../molecules/search-form.md) — Complete search form
- [TextField](input.md) — Search input
- [List](list.md) — Menu container
- [Dropdown](dropdown.md) — Select menu
