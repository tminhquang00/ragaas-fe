# Tooltip

Hover/focus information overlay.

---

## Import

```tsx
import { Tooltip } from '@bosch/react-frok';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `ReactNode` | - | **Required** — Tooltip content |
| `children` | `ReactNode` | - | Trigger element |
| `variant` | `'light' \| 'dark'` | `'dark'` | Visual variant |
| `position` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` | Tooltip position |
| `tooltipWidth` | `string` | `'auto'` | Custom width |
| `delay` | `number` | `200` | Show delay (ms) |
| `disabled` | `boolean` | `false` | Disable tooltip |
| `className` | `string` | - | Additional CSS classes |

---

## CSS Classes

| Class | Description |
|-------|-------------|
| `.a-tooltip` | Base container |
| `.a-tooltip__trigger` | Trigger wrapper |
| `.a-tooltip__content` | Tooltip content |
| `.a-tooltip--light` | Light variant |
| `.a-tooltip--dark` | Dark variant |
| `.a-tooltip--top` | Top position |
| `.a-tooltip--bottom` | Bottom position |
| `.a-tooltip--left` | Left position |
| `.a-tooltip--right` | Right position |

---

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--g-gray-10` | `#1a1d21` | Dark background |
| `--g-gray-100` | `#ffffff` | Dark text / Light background |
| `--g-gray-50` | `#525f6b` | Light text |

---

## Usage Examples

### Basic Tooltip
```tsx
<Tooltip content="This is helpful information">
  <Button mode="tertiary" icon="info-i" iconOnly aria-label="Info" />
</Tooltip>
```

### Different Positions
```tsx
<Tooltip content="Top tooltip" position="top">
  <Button>Top</Button>
</Tooltip>

<Tooltip content="Bottom tooltip" position="bottom">
  <Button>Bottom</Button>
</Tooltip>

<Tooltip content="Left tooltip" position="left">
  <Button>Left</Button>
</Tooltip>

<Tooltip content="Right tooltip" position="right">
  <Button>Right</Button>
</Tooltip>
```

### Light Variant
```tsx
<Tooltip content="Light variant tooltip" variant="light">
  <span>Hover me</span>
</Tooltip>
```

### Rich Content
```tsx
<Tooltip
  content={
    <div>
      <strong>Keyboard Shortcuts</strong>
      <ul style={{ marginTop: '0.5rem', paddingLeft: '1rem' }}>
        <li>Ctrl+S - Save</li>
        <li>Ctrl+Z - Undo</li>
        <li>Ctrl+C - Copy</li>
      </ul>
    </div>
  }
  tooltipWidth="200px"
>
  <Button mode="tertiary" icon="keyboard" iconOnly aria-label="Shortcuts" />
</Tooltip>
```

### Icon with Tooltip
```tsx
<Tooltip content="Settings">
  <Button mode="tertiary" icon="settings" iconOnly aria-label="Settings" />
</Tooltip>
```

### Disabled Button Tooltip
```tsx
<Tooltip content="You don't have permission to delete">
  <span> {/* Wrapper needed for disabled button */}
    <Button mode="tertiary" icon="delete" disabled>
      Delete
    </Button>
  </span>
</Tooltip>
```

### Form Field Help
```tsx
<FormField 
  label={
    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      API Key
      <Tooltip content="Your API key can be found in Settings > API">
        <Icon iconName="info-i" style={{ cursor: 'help' }} />
      </Tooltip>
    </span>
  }
>
  <TextField id="api-key" type="password" />
</FormField>
```

### Table Cell Tooltip
```tsx
<TableCell>
  <Tooltip content={item.fullDescription}>
    <span style={{ 
      overflow: 'hidden', 
      textOverflow: 'ellipsis', 
      whiteSpace: 'nowrap',
      maxWidth: '150px',
      display: 'inline-block'
    }}>
      {item.fullDescription}
    </span>
  </Tooltip>
</TableCell>
```

### Conditional Tooltip
```tsx
<Tooltip
  content="This action requires admin privileges"
  disabled={hasPermission}
>
  <Button disabled={!hasPermission}>
    Admin Action
  </Button>
</Tooltip>
```

---

## Accessibility

```tsx
<Tooltip content="Delete this item permanently" id="delete-tooltip">
  <Button 
    mode="tertiary" 
    icon="delete" 
    aria-describedby="delete-tooltip"
  >
    Delete
  </Button>
</Tooltip>
```

- Tooltip content is accessible to screen readers
- Use `aria-describedby` for additional context
- Ensure keyboard focus triggers tooltip

---

## Do's and Don'ts

**Do:**
- Keep content concise
- Use for supplementary information
- Position to avoid overflow
- Add delay to prevent flicker

**Don't:**
- Don't put essential information in tooltips
- Don't use for complex interactions
- Don't use on touch-only devices without alternative
- Don't use for critical errors (use Notification)

---

## Related Components
- [Popover](../molecules/popover.md) — Interactive popup
- [Notification](notification.md) — Alert messages
- [Badge](badge.md) — Status labels
