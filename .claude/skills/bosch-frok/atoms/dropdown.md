# Dropdown

Select menu component for single option selection.

---

## Import

```tsx
import { Dropdown } from '@bosch/react-frok';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Label text above dropdown |
| `id` | `string` | - | Unique identifier |
| `options` | `DropdownOption[]` | - | Array of options |
| `value` | `string` | - | Selected value (controlled) |
| `defaultValue` | `string` | - | Initial value (uncontrolled) |
| `onChange` | `(value: string) => void` | - | Selection change handler |
| `disabled` | `boolean` | `false` | Disable interaction |
| `isDynamicWidth` | `boolean` | `false` | Auto-adjust width to content |
| `placeholder` | `string` | - | Placeholder text |
| `required` | `boolean` | `false` | Mark as required |
| `className` | `string` | - | Additional CSS classes |

### DropdownOption Type
```typescript
interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}
```

---

## CSS Classes

| Class | Description |
|-------|-------------|
| `.a-dropdown` | Base dropdown container |
| `.a-dropdown select` | Native select element |
| `.a-dropdown label` | Label element |
| `.a-dropdown:after` | Dropdown arrow icon |
| `.a-dropdown--dynamic-width` | Auto-width modifier |
| `.a-dropdown--disabled` | Disabled state |
| `.a-dropdown.-error` | Error state |

---

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--nested-minor__enabled__default__fill` | `#ffffff` | Background color |
| `--nested-minor__enabled__default__front` | `#000000` | Text color |
| `--nested-minor__enabled__hovered__fill` | `#eff1f2` | Hover background |
| `--nested-minor__disabled__default__fill` | `#eff1f2` | Disabled background |
| `--nested-minor__disabled__default__front` | `#8a9097` | Disabled text |
| `--g-gray-85` | `#d0d4d8` | Border color |
| `--g-blue-50` | `#007bc0` | Focus border |

---

## Usage Examples

### Basic Dropdown
```tsx
const options = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' }
];

<Dropdown
  id="basic-dropdown"
  label="Select an option"
  options={options}
  onChange={(value) => console.log(value)}
/>
```

### Controlled Dropdown
```tsx
const [selected, setSelected] = useState('');

<Dropdown
  id="controlled"
  label="Category"
  options={categories}
  value={selected}
  onChange={setSelected}
  placeholder="Choose category..."
/>
```

### With Disabled Options
```tsx
const options = [
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending', disabled: true },
  { value: 'archived', label: 'Archived' }
];

<Dropdown
  id="status"
  label="Status"
  options={options}
/>
```

### Dynamic Width
```tsx
<Dropdown
  id="dynamic"
  label="Size"
  options={sizes}
  isDynamicWidth
/>
```

### Inside FormField
```tsx
<FormField label="Country" required>
  <Dropdown
    id="country"
    options={countries}
    placeholder="Select country"
  />
</FormField>
```

---

## Do's and Don'ts

**Do:**
- Provide clear, descriptive labels
- Use placeholder for guidance
- Disable unavailable options rather than hiding
- Wrap in FormField for validation messages

**Don't:**
- Don't use for more than ~15 options (use searchable select)
- Don't use for binary choices (use Toggle)
- Don't nest dropdowns

---

## Related Components
- [FormField](../molecules/form-field.md) — Validation wrapper
- [Toggle](toggle.md) — Binary choices
- [RadioButton](radiobutton.md) — Visible options
