# RadioButton

Single selection from a group of mutually exclusive options.

---

## Import

```tsx
import { RadioButton } from '@bosch/react-frok';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | - | **Required** — Unique identifier |
| `name` | `string` | - | **Required** — Group name for mutual exclusion |
| `label` | `ReactNode` | - | Label text |
| `value` | `string` | - | Option value |
| `checked` | `boolean` | `false` | Selected state (controlled) |
| `defaultChecked` | `boolean` | `false` | Initial state (uncontrolled) |
| `onChange` | `(e: ChangeEvent) => void` | - | Change handler |
| `disabled` | `boolean` | `false` | Disable interaction |
| `className` | `string` | - | Additional CSS classes |

---

## CSS Classes

| Class | Description |
|-------|-------------|
| `.a-radio-button` | Base container |
| `.a-radio-button input[type=radio]` | Hidden native input |
| `.a-radio-button label` | Clickable label |
| `.a-radio-button label::before` | Custom radio circle |
| `.a-radio-button label::after` | Selected dot indicator |
| `.a-radio-button.-selected` | Selected state |
| `.a-radio-button.-disabled` | Disabled state |
| `.a-radio-button.-error` | Error state |

---

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--nested-minor__enabled__default__fill` | `#ffffff` | Circle background |
| `--nested-minor__enabled__default__front` | `#000000` | Border color |
| `--nested-major__enabled__default__fill` | `#007bc0` | Selected dot color |
| `--nested-minor__disabled__default__fill` | `#eff1f2` | Disabled background |
| `--nested-minor__disabled__default__front` | `#8a9097` | Disabled border |
| `--g-blue-50` | `#007bc0` | Focus ring |

---

## Usage Examples

### Basic Radio Group
```tsx
<div role="radiogroup" aria-label="Shipping method">
  <RadioButton
    id="standard"
    name="shipping"
    label="Standard (5-7 days)"
    value="standard"
  />
  <RadioButton
    id="express"
    name="shipping"
    label="Express (2-3 days)"
    value="express"
  />
  <RadioButton
    id="overnight"
    name="shipping"
    label="Overnight"
    value="overnight"
  />
</div>
```

### Controlled Group
```tsx
const [method, setMethod] = useState('standard');

<div role="radiogroup">
  <RadioButton
    id="standard"
    name="shipping"
    label="Standard"
    value="standard"
    checked={method === 'standard'}
    onChange={() => setMethod('standard')}
  />
  <RadioButton
    id="express"
    name="shipping"
    label="Express"
    value="express"
    checked={method === 'express'}
    onChange={() => setMethod('express')}
  />
</div>
```

### With Disabled Option
```tsx
<RadioButton
  id="premium"
  name="plan"
  label="Premium (Coming soon)"
  value="premium"
  disabled
/>
```

### Inside FormField
```tsx
<FormField 
  label="Payment Method" 
  variant="radio"
  required
>
  <RadioButton id="card" name="payment" label="Credit Card" value="card" />
  <RadioButton id="paypal" name="payment" label="PayPal" value="paypal" />
  <RadioButton id="bank" name="payment" label="Bank Transfer" value="bank" />
</FormField>
```

### Horizontal Layout
```tsx
<div style={{ display: 'flex', gap: '1.5rem' }}>
  <RadioButton id="yes" name="answer" label="Yes" value="yes" />
  <RadioButton id="no" name="answer" label="No" value="no" />
</div>
```

---

## Accessibility

- Use `role="radiogroup"` on container
- Provide `aria-label` or `aria-labelledby` for group
- All radios in group must share same `name`
- Labels are clickable by default

```tsx
<fieldset>
  <legend>Select size</legend>
  <RadioButton id="small" name="size" label="Small" value="s" />
  <RadioButton id="medium" name="size" label="Medium" value="m" />
  <RadioButton id="large" name="size" label="Large" value="l" />
</fieldset>
```

---

## Do's and Don'ts

**Do:**
- Always use `name` to group related radios
- Provide unique `id` for each option
- Use for 2-7 mutually exclusive options
- Set a sensible default selection

**Don't:**
- Don't use for multiple selections (use Checkbox)
- Don't use for >7 options (use Dropdown)
- Don't forget the `name` attribute

---

## Related Components
- [Checkbox](checkbox.md) — Multiple selections
- [Dropdown](dropdown.md) — Many options
- [FormField](../molecules/form-field.md) — Validation wrapper
- [OptionBar](option-bar.md) — Visual button group
