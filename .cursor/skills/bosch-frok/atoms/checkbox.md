# Checkbox

Multi-select checkbox component with indeterminate state support.

---

## Import

```tsx
import { Checkbox } from '@bosch/react-frok';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | - | **Required** — Unique identifier |
| `label` | `ReactNode` | - | Label content |
| `checked` | `boolean` | `false` | Controlled checked state |
| `defaultChecked` | `boolean` | `false` | Uncontrolled default |
| `indeterminate` | `boolean` | `false` | Partial selection state |
| `disabled` | `boolean` | `false` | Disable interaction |
| `children` | `ReactNode` | - | Alternative to `label` prop |
| `onChange` | `(e: ChangeEvent) => void` | - | Change handler |
| `className` | `string` | - | Additional CSS classes |

---

## CSS Classes

| Class | Description |
|-------|-------------|
| `.a-checkbox` | Base checkbox container |
| `.a-checkbox__input` | Hidden input element |
| `.a-checkbox__box` | Visual checkbox element |
| `.a-checkbox__label` | Label text |
| `.a-checkbox--indeterminate` | Indeterminate state |
| `.-disabled` | Disabled state |
| `.-checked` | Checked state |

---

## CSS Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `--g-gray-80` | `#c1c7cc` | Border color (unchecked) |
| `--g-blue-50` | `#007bc0` | Background (checked) |
| `--g-gray-100` | `#ffffff` | Checkmark color |
| `--g-gray-65` | `#979ea4` | Disabled color |

---

## Usage Examples

### Basic Checkbox
```tsx
<Checkbox id="terms" label="I accept the terms and conditions" />
```

### Controlled Checkbox
```tsx
const [agreed, setAgreed] = useState(false);

<Checkbox 
  id="agreement"
  label="I agree to the privacy policy"
  checked={agreed}
  onChange={(e) => setAgreed(e.target.checked)}
/>
```

### Indeterminate State (Select All)
```tsx
const [selected, setSelected] = useState<string[]>([]);
const allItems = ['item1', 'item2', 'item3'];
const allSelected = selected.length === allItems.length;
const someSelected = selected.length > 0 && !allSelected;

<Checkbox
  id="selectAll"
  label="Select all"
  checked={allSelected}
  indeterminate={someSelected}
  onChange={(e) => {
    setSelected(e.target.checked ? allItems : []);
  }}
/>

{allItems.map(item => (
  <Checkbox
    key={item}
    id={item}
    label={item}
    checked={selected.includes(item)}
    onChange={(e) => {
      setSelected(prev => 
        e.target.checked 
          ? [...prev, item]
          : prev.filter(i => i !== item)
      );
    }}
  />
))}
```

### Disabled Checkbox
```tsx
<Checkbox id="premium" label="Premium feature" disabled />
<Checkbox id="included" label="Included by default" checked disabled />
```

### In a Form
```tsx
<FormField label="Preferences">
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
    <Checkbox id="newsletter" label="Subscribe to newsletter" />
    <Checkbox id="updates" label="Receive product updates" />
    <Checkbox id="marketing" label="Receive marketing emails" />
  </div>
</FormField>
```

### With Rich Label
```tsx
<Checkbox id="terms">
  I agree to the <Link href="/terms">Terms of Service</Link> and{' '}
  <Link href="/privacy">Privacy Policy</Link>
</Checkbox>
```

---

## Do's and Don'ts

**Do:**
- Use checkboxes for multi-select options
- Use `indeterminate` for "select all" with partial selection
- Group related checkboxes together
- Provide clear, actionable labels

**Don't:**
- Don't use checkboxes for binary on/off settings (use Toggle)
- Don't use checkboxes for mutually exclusive options (use RadioButton)
- Don't forget the required `id` prop

---

## Related Components
- [Toggle](toggle.md) — For on/off switches
- [RadioButton](../molecules/form-field.md) — For single-select groups
- [FormField](../molecules/form-field.md) — For form integration
