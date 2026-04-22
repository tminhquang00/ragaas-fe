# Toggle

On/off switch component with optional labels.

---

## Import

```tsx
import { Toggle } from '@bosch/react-frok';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | - | **Required** — Unique identifier |
| `checked` | `boolean` | `false` | Controlled checked state |
| `defaultChecked` | `boolean` | `false` | Uncontrolled default state |
| `disabled` | `boolean` | `false` | Disable interaction |
| `leftLabel` | `string` | - | Label on left side |
| `rightLabel` | `string` | - | Label on right side |
| `onChange` | `(e: ChangeEvent) => void` | - | Change handler |
| `className` | `string` | - | Additional CSS classes |

---

## CSS Classes

| Class | Description |
|-------|-------------|
| `.a-toggle` | Base toggle container |
| `.a-toggle__trigger` | Visual switch element |
| `.a-toggle__label` | Label text |
| `.a-toggle__label--left` | Left label |
| `.a-toggle__label--right` | Right label |
| `.-disabled` | Disabled state |
| `.-checked` | Checked state |

---

## CSS Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `--g-gray-80` | `#c1c7cc` | Track background (off) |
| `--g-blue-50` | `#007bc0` | Track background (on) |
| `--g-gray-100` | `#ffffff` | Thumb color |
| `--g-gray-65` | `#979ea4` | Disabled track |

---

## Usage Examples

### Basic Toggle
```tsx
<Toggle id="notifications" />
```

### With Left Label
```tsx
<Toggle id="darkMode" leftLabel="Dark Mode" />
```

### With Right Label
```tsx
<Toggle id="autoSave" rightLabel="Auto-save enabled" />
```

### Controlled Toggle
```tsx
const [enabled, setEnabled] = useState(false);

<Toggle 
  id="feature" 
  leftLabel="Enable feature"
  checked={enabled}
  onChange={(e) => setEnabled(e.target.checked)}
/>
```

### Disabled Toggle
```tsx
<Toggle 
  id="locked" 
  leftLabel="Premium feature" 
  disabled 
/>
```

### In a Settings Form
```tsx
<Form description="Settings">
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    <Toggle id="notifications" leftLabel="Enable notifications" />
    <Toggle id="emailDigest" leftLabel="Weekly email digest" />
    <Toggle id="darkMode" leftLabel="Dark mode" />
  </div>
</Form>
```

---

## Do's and Don'ts

**Do:**
- Use toggles for immediate on/off settings
- Provide clear labels describing the setting
- Use descriptive `leftLabel` for most cases

**Don't:**
- Don't use both `leftLabel` and `rightLabel` simultaneously
- Don't use toggles for actions requiring confirmation
- Don't forget the required `id` prop

---

## Related Components
- [Checkbox](checkbox.md) — For multi-select options
- [RadioButton](../molecules/form-field.md) — For single-select groups
