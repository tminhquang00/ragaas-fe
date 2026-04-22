# Button

Interactive button component with multiple modes and states.

---

## Import

```tsx
import { Button } from '@bosch/react-frok';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mode` | `'primary' \| 'secondary' \| 'tertiary' \| 'integrated'` | `'primary'` | Visual style variant |
| `icon` | `string` | - | Icon name (appears before label) |
| `iconAfter` | `string` | - | Icon name (appears after label) |
| `iconOnly` | `boolean` | `false` | Render icon without text |
| `disabled` | `boolean` | `false` | Disable interaction |
| `loading` | `boolean` | `false` | Show loading state |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | HTML button type |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Button size |
| `children` | `ReactNode` | - | Button label |
| `className` | `string` | - | Additional CSS classes |
| `onClick` | `(e: MouseEvent) => void` | - | Click handler |

---

## Variants

### Mode Variants

| Mode | Use Case | Token Category |
|------|----------|----------------|
| `primary` | Main CTAs, form submissions | `--accent-major__*` |
| `secondary` | Secondary actions, alternatives | `--accent-minor__*` |
| `tertiary` | Subtle actions, cancel buttons | `--accent-pure__*` |
| `integrated` | Blends with container, transitions to accent | `--integrated-*` |

```tsx
<Button mode="primary">Primary</Button>
<Button mode="secondary">Secondary</Button>
<Button mode="tertiary">Tertiary</Button>
<Button mode="integrated">Integrated</Button>
```

---

## CSS Classes

### Base Classes
| Class | Description |
|-------|-------------|
| `.a-button` | Base button styles |
| `.a-button--primary` | Primary mode (filled blue) |
| `.a-button--secondary` | Secondary mode (light fill) |
| `.a-button--tertiary` | Tertiary mode (ghost/transparent) |
| `.a-button--integrated` | Integrated mode |

### State Classes
| Class | Description |
|-------|-------------|
| `.a-button--disabled` | Disabled state |
| `.a-button--loading` | Loading state with spinner |
| `.a-button--icon-only` | Icon-only variant (square) |

### Size Classes
| Class | Description |
|-------|-------------|
| `.a-button--small` | Compact size |
| `.a-button--large` | Larger size |

### Element Classes
| Class | Description |
|-------|-------------|
| `.a-button__label` | Button text |
| `.a-button__icon` | Icon element |
| `.a-button__spinner` | Loading spinner |

---

## CSS Variables for Customization

### Primary Button (`mode="primary"`)

| Variable | Default (Light) | Description |
|----------|-----------------|-------------|
| `--accent-major__enabled__default__fill` | `#007bc0` | Background |
| `--accent-major__enabled__default__front` | `#ffffff` | Text color |
| `--accent-major__enabled__hovered__fill` | `#00629a` | Hover background |
| `--accent-major__enabled__pressed__fill` | `#004975` | Pressed background |
| `--accent-major__disabled__default__fill` | `#e0e2e5` | Disabled background |
| `--accent-major__disabled__default__front` | `#979ea4` | Disabled text |

### Secondary Button (`mode="secondary"`)

| Variable | Default (Light) | Description |
|----------|-----------------|-------------|
| `--accent-minor__enabled__default__fill` | `#d1e4ff` | Background |
| `--accent-minor__enabled__default__front` | `#000000` | Text color |
| `--accent-minor__enabled__hovered__fill` | `#9dc9ff` | Hover background |
| `--accent-minor__enabled__pressed__fill` | `#56b0ff` | Pressed background |
| `--accent-minor__disabled__default__fill` | `#eff1f2` | Disabled background |
| `--accent-minor__disabled__default__front` | `#a4abb3` | Disabled text |

### Tertiary Button (`mode="tertiary"`)

| Variable | Default (Light) | Description |
|----------|-----------------|-------------|
| `--accent-pure__enabled__default__fill` | `transparent` | Background |
| `--accent-pure__enabled__default__front` | `#007bc0` | Text color |
| `--accent-pure__enabled__hovered__fill` | `#d1e4ff` | Hover background |
| `--accent-pure__enabled__pressed__fill` | `#9dc9ff` | Pressed background |
| `--accent-pure__disabled__default__fill` | `transparent` | Disabled background |
| `--accent-pure__disabled__default__front` | `#b2b9c0` | Disabled text |

### Integrated Button (`mode="integrated"`)

| Variable | Default (Light) | Description |
|----------|-----------------|-------------|
| `--integrated-major__enabled__default__fill` | `#000000` | Background (starts black) |
| `--integrated-major__enabled__hovered__fill` | `#00629a` | Hover (transitions to blue) |
| `--integrated-major__enabled__pressed__fill` | `#007bc0` | Pressed (accent blue) |

---

## Usage Examples

### Basic Buttons
```tsx
<Button mode="primary" onClick={handleSave}>Save</Button>
<Button mode="secondary" onClick={handleCancel}>Cancel</Button>
<Button mode="tertiary" onClick={handleReset}>Reset</Button>
```

### With Icons
```tsx
<Button mode="primary" icon="add">Add Item</Button>
<Button mode="secondary" iconAfter="arrow-right">Next</Button>
<Button mode="tertiary" icon="settings" iconOnly aria-label="Settings" />
```

### Loading State
```tsx
<Button mode="primary" loading disabled>
  Saving...
</Button>
```

### Disabled State
```tsx
<Button mode="primary" disabled>
  Not Available
</Button>
```

### Form Submit
```tsx
<Form description="Login">
  <FormField label="Email">
    <TextField type="email" />
  </FormField>
  <Button mode="primary" type="submit">Login</Button>
</Form>
```

### Button Group
```tsx
<div style={{ display: 'flex', gap: '0.75rem' }}>
  <Button mode="primary">Save</Button>
  <Button mode="secondary">Save Draft</Button>
  <Button mode="tertiary">Cancel</Button>
</div>
```

---

## Custom Styling

### Override Button Color
```tsx
<Button 
  mode="primary"
  style={{ 
    '--accent-major__enabled__default__fill': '#00884a',
    '--accent-major__enabled__hovered__fill': '#006c3a'
  } as React.CSSProperties}
>
  Green Primary
</Button>
```

### Custom SCSS Class
```scss
.my-custom-button {
  --accent-major__enabled__default__fill: var(--g-purple-50);
  --accent-major__enabled__hovered__fill: var(--g-purple-40);
  --accent-major__enabled__pressed__fill: var(--g-purple-30);
}
```

```tsx
<Button mode="primary" className="my-custom-button">
  Purple Button
</Button>
```

---

## Do's and Don'ts

**Do:**
- Use `primary` for main CTAs (one per view)
- Use `secondary` for alternative actions
- Use `tertiary` for cancel/dismiss/subtle actions
- Provide `aria-label` for icon-only buttons
- Use `loading` state during async operations

**Don't:**
- Don't use multiple `primary` buttons in close proximity
- Don't use `integrated` without a clear UX rationale
- Don't disable buttons without feedback about why
- Don't use generic labels like "Click Here"

---

## Related Components
- [Icon](icon.md) — For icons inside buttons
- [Link](link.md) — For navigation that looks like buttons
- [FormField](../molecules/form-field.md) — For form submit buttons
