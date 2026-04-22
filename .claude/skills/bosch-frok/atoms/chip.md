# Chip

Interactive tag component for selections, filters, or labels.

---

## Import

```tsx
import { Chip } from '@bosch/react-frok';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | **Required** — Chip text |
| `image` | `string` | - | Avatar image URL |
| `icon` | `string` | - | Leading icon name |
| `buttonClose` | `boolean` | `false` | Show remove button |
| `onClose` | `() => void` | - | Remove handler |
| `onClick` | `() => void` | - | Click handler |
| `selected` | `boolean` | `false` | Selected state |
| `disabled` | `boolean` | `false` | Disable interaction |
| `dragged` | `boolean` | `false` | Drag state styling |
| `className` | `string` | - | Additional CSS classes |

---

## CSS Classes

| Class | Description |
|-------|-------------|
| `.a-chip` | Base container |
| `.a-chip__label` | Text label |
| `.a-chip__icon` | Leading icon |
| `.a-chip__image` | Avatar image |
| `.a-chip__button-close` | Remove button |
| `.a-chip--selected` | Selected state |
| `.a-chip--disabled` | Disabled state |
| `.a-chip--dragged` | Dragging state |
| `.a-chip--clickable` | Has click handler |

---

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--g-gray-95` | `#eff1f2` | Default background |
| `--nested-minor__enabled__hovered__fill` | `#e0e2e5` | Hover background |
| `--nested-major__enabled__default__fill` | `#007bc0` | Selected background |
| `--nested-major__enabled__default__front` | `#ffffff` | Selected text |
| `--g-gray-50` | `#525f6b` | Icon color |

---

## Usage Examples

### Basic Chip
```tsx
<Chip label="Category" />
```

### With Close Button
```tsx
<Chip
  label="Filter: Active"
  buttonClose
  onClose={() => removeFilter('active')}
/>
```

### Selectable Chip
```tsx
const [selected, setSelected] = useState(false);

<Chip
  label="Option A"
  selected={selected}
  onClick={() => setSelected(!selected)}
/>
```

### With Icon
```tsx
<Chip label="Location" icon="pin" />
```

### With Avatar
```tsx
<Chip
  label="John Doe"
  image="/avatars/john.jpg"
  buttonClose
  onClose={() => removeUser('john')}
/>
```

### Filter Chips
```tsx
const [filters, setFilters] = useState(['status:active', 'type:project']);

<div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
  {filters.map(filter => (
    <Chip
      key={filter}
      label={filter}
      buttonClose
      onClose={() => setFilters(f => f.filter(x => x !== filter))}
    />
  ))}
</div>
```

### Multi-Select Chips
```tsx
const options = ['React', 'Vue', 'Angular', 'Svelte'];
const [selected, setSelected] = useState<string[]>([]);

<div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
  {options.map(option => (
    <Chip
      key={option}
      label={option}
      selected={selected.includes(option)}
      onClick={() => {
        setSelected(s => 
          s.includes(option) 
            ? s.filter(x => x !== option)
            : [...s, option]
        );
      }}
    />
  ))}
</div>
```

### Tag Input
```tsx
const [tags, setTags] = useState<string[]>(['react', 'typescript']);
const [input, setInput] = useState('');

<div>
  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
    {tags.map(tag => (
      <Chip
        key={tag}
        label={tag}
        buttonClose
        onClose={() => setTags(t => t.filter(x => x !== tag))}
      />
    ))}
  </div>
  <TextField
    value={input}
    onChange={(e) => setInput(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === 'Enter' && input.trim()) {
        setTags([...tags, input.trim()]);
        setInput('');
      }
    }}
    placeholder="Add tag..."
  />
</div>
```

### Disabled Chip
```tsx
<Chip label="Locked" disabled />
```

---

## Accessibility

```tsx
<Chip
  label="Filter"
  selected={isSelected}
  onClick={toggleFilter}
  role="checkbox"
  aria-checked={isSelected}
/>
```

- Clickable chips are keyboard focusable
- Close button has built-in aria-label
- Use appropriate roles for multi-select

---

## Do's and Don'ts

**Do:**
- Use for removable items (tags, filters)
- Use for multi-select options
- Keep labels short
- Show close button for removable chips

**Don't:**
- Don't use for actions (use Button)
- Don't use for navigation (use Link)
- Don't use for single selection (use RadioButton)

---

## Related Components
- [Badge](badge.md) — Status labels
- [Button](button.md) — Actions
- [Sticker](sticker.md) — Colored labels
