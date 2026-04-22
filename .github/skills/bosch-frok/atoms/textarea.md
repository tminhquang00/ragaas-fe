# TextArea

Multi-line text input for longer content.

---

## Import

```tsx
import { TextArea } from '@bosch/react-frok';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | - | **Required** — Unique identifier |
| `label` | `string` | - | Label text |
| `value` | `string` | - | Input value (controlled) |
| `defaultValue` | `string` | - | Initial value (uncontrolled) |
| `onChange` | `(e: ChangeEvent) => void` | - | Change handler |
| `placeholder` | `string` | - | Placeholder text |
| `rows` | `number` | `4` | Visible rows |
| `cols` | `number` | - | Visible columns |
| `maxLength` | `number` | - | Maximum characters |
| `dynamicHeight` | `boolean` | `false` | Auto-expand with content |
| `disabled` | `boolean` | `false` | Disable interaction |
| `readOnly` | `boolean` | `false` | Read-only state |
| `required` | `boolean` | `false` | Mark as required |
| `className` | `string` | - | Additional CSS classes |

---

## CSS Classes

| Class | Description |
|-------|-------------|
| `.a-text-area` | Base container |
| `.a-text-area textarea` | Native textarea element |
| `.a-text-area label` | Label element |
| `.a-text-area--dynamic-height` | Auto-expanding modifier |
| `.a-text-area.-disabled` | Disabled state |
| `.a-text-area.-error` | Error state |
| `.a-text-area.-readonly` | Read-only state |

---

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--nested-minor__enabled__default__fill` | `#ffffff` | Background color |
| `--nested-minor__enabled__default__front` | `#000000` | Text color |
| `--nested-minor__enabled__hovered__fill` | `#eff1f2` | Hover background |
| `--nested-minor__enabled__pressed__fill` | `#e0e2e5` | Focus background |
| `--nested-minor__disabled__default__fill` | `#eff1f2` | Disabled background |
| `--nested-minor__disabled__default__front` | `#8a9097` | Disabled text |
| `--g-gray-85` | `#d0d4d8` | Border color |
| `--g-blue-50` | `#007bc0` | Focus border |

---

## Usage Examples

### Basic TextArea
```tsx
<TextArea
  id="description"
  label="Description"
  placeholder="Enter description..."
/>
```

### Controlled TextArea
```tsx
const [text, setText] = useState('');

<TextArea
  id="notes"
  label="Notes"
  value={text}
  onChange={(e) => setText(e.target.value)}
  rows={6}
/>
```

### With Character Limit
```tsx
const [message, setMessage] = useState('');
const maxLength = 500;

<div>
  <TextArea
    id="message"
    label="Message"
    value={message}
    onChange={(e) => setMessage(e.target.value)}
    maxLength={maxLength}
  />
  <span className="-size-s" style={{ color: 'var(--g-gray-50)' }}>
    {message.length}/{maxLength} characters
  </span>
</div>
```

### Dynamic Height
```tsx
<TextArea
  id="auto-expand"
  label="Feedback"
  placeholder="Start typing..."
  dynamicHeight
/>
```

### Inside FormField
```tsx
<FormField 
  label="Comments" 
  validationMessage="Please provide more details"
  validationState="error"
>
  <TextArea
    id="comments"
    placeholder="Minimum 50 characters"
    rows={4}
  />
</FormField>
```

### Read-Only Display
```tsx
<TextArea
  id="summary"
  label="Generated Summary"
  value={summaryText}
  readOnly
  rows={8}
/>
```

---

## Accessibility

```tsx
<TextArea
  id="accessible-textarea"
  label="Description"
  aria-describedby="description-hint"
  aria-required="true"
/>
<span id="description-hint" className="-size-s">
  Provide a detailed description (minimum 100 characters)
</span>
```

---

## Do's and Don'ts

**Do:**
- Set appropriate `rows` for expected content
- Use `dynamicHeight` for variable content
- Show character count for limited fields
- Use placeholder as an example, not instruction

**Don't:**
- Don't use for single-line input (use TextField)
- Don't set very small row count for comments
- Don't forget labels for accessibility

---

## Related Components
- [TextField](input.md) — Single-line input
- [FormField](../molecules/form-field.md) — Validation wrapper
