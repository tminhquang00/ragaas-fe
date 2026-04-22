# OptionBar

Segmented button group for single selection from visible options.

---

## Import

```tsx
import { OptionBar, OptionBarItem } from '@bosch/react-frok';
```

---

## Props

### OptionBar Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `selectedValue` | `string` | - | Currently selected value |
| `onOptionSelect` | `(value: string) => void` | - | Selection change handler |
| `options` | `OptionBarOption[]` | - | Array of options (alternative to children) |
| `children` | `ReactNode` | - | OptionBarItem children |
| `disabled` | `boolean` | `false` | Disable all options |
| `className` | `string` | - | Additional CSS classes |

### OptionBarItem Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | - | **Required** — Option value |
| `label` | `string` | - | Display text |
| `icon` | `string` | - | Icon name |
| `disabled` | `boolean` | `false` | Disable this option |

### OptionBarOption Type
```typescript
interface OptionBarOption {
  value: string;
  label?: string;
  icon?: string;
  disabled?: boolean;
}
```

---

## CSS Classes

| Class | Description |
|-------|-------------|
| `.a-option-bar` | Base container |
| `.a-option-bar__item` | Individual option button |
| `.a-option-bar__item--selected` | Selected state |
| `.a-option-bar__item--disabled` | Disabled state |
| `.a-option-bar__icon` | Option icon |
| `.a-option-bar__label` | Option label |

---

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--nested-pure__enabled__default__fill` | `#ffffff` | Default background |
| `--nested-pure__enabled__hovered__fill` | `#eff1f2` | Hover background |
| `--nested-major__enabled__default__fill` | `#007bc0` | Selected background |
| `--nested-major__enabled__default__front` | `#ffffff` | Selected text |
| `--g-gray-85` | `#d0d4d8` | Border color |

---

## Usage Examples

### Basic Option Bar
```tsx
const [view, setView] = useState('grid');

<OptionBar
  selectedValue={view}
  onOptionSelect={setView}
>
  <OptionBarItem value="grid" label="Grid" />
  <OptionBarItem value="list" label="List" />
  <OptionBarItem value="table" label="Table" />
</OptionBar>
```

### With Icons
```tsx
<OptionBar
  selectedValue={alignment}
  onOptionSelect={setAlignment}
>
  <OptionBarItem value="left" icon="text-align-left" />
  <OptionBarItem value="center" icon="text-align-center" />
  <OptionBarItem value="right" icon="text-align-right" />
  <OptionBarItem value="justify" icon="text-align-block" />
</OptionBar>
```

### Using Options Array
```tsx
const viewOptions = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' }
];

<OptionBar
  options={viewOptions}
  selectedValue={view}
  onOptionSelect={setView}
/>
```

### With Disabled Option
```tsx
<OptionBar
  selectedValue={plan}
  onOptionSelect={setPlan}
>
  <OptionBarItem value="free" label="Free" />
  <OptionBarItem value="pro" label="Pro" />
  <OptionBarItem value="enterprise" label="Enterprise" disabled />
</OptionBar>
```

### Icon + Label Combination
```tsx
<OptionBar
  selectedValue={sortOrder}
  onOptionSelect={setSortOrder}
>
  <OptionBarItem value="asc" icon="sort-ascending" label="A-Z" />
  <OptionBarItem value="desc" icon="sort-descending" label="Z-A" />
</OptionBar>
```

### View Switcher Pattern
```tsx
const ViewSwitcher = ({ view, onViewChange }) => (
  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
    <OptionBar selectedValue={view} onOptionSelect={onViewChange}>
      <OptionBarItem value="grid" icon="grid-view" aria-label="Grid view" />
      <OptionBarItem value="list" icon="list-view" aria-label="List view" />
    </OptionBar>
  </div>
);
```

---

## Accessibility

```tsx
<OptionBar
  selectedValue={selected}
  onOptionSelect={setSelected}
  role="tablist"
  aria-label="View options"
>
  <OptionBarItem value="a" label="Option A" role="tab" aria-selected={selected === 'a'} />
  <OptionBarItem value="b" label="Option B" role="tab" aria-selected={selected === 'b'} />
</OptionBar>
```

- Keyboard navigation with arrow keys
- Tab to focus, Enter/Space to select

---

## Do's and Don'ts

**Do:**
- Use for 2-5 mutually exclusive options
- Provide icons OR labels OR both
- Set a default selected value
- Use for view/mode switching

**Don't:**
- Don't use for >5 options (use Dropdown)
- Don't mix icon-only and label-only items
- Don't use for form data (use RadioButton)

---

## Related Components
- [RadioButton](radiobutton.md) — Form radio selection
- [TabNavigation](tab-navigation.md) — Content tabs
- [Button](button.md) — Single actions
