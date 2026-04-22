# Badge

Status indicator component with semantic color variants.

---

## Import

```tsx
import { Badge } from '@bosch/react-frok';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'success' \| 'error' \| 'warning' \| 'info' \| 'neutral'` | `'neutral'` | Semantic color variant |
| `children` | `ReactNode` | - | Badge text content |
| `className` | `string` | - | Additional CSS classes |

---

## Variants

| Variant | Token Category | Use Case |
|---------|----------------|----------|
| `success` | `--signal-success-*` | Completed, active, approved |
| `error` | `--signal-error-*` | Failed, rejected, critical |
| `warning` | `--signal-warning-*` | Pending, attention needed |
| `info` | `--signal-note-*` | Informational, neutral highlight |
| `neutral` | `--signal-neutral-*` | Default, inactive |

```tsx
<Badge variant="success">Active</Badge>
<Badge variant="error">Failed</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="info">New</Badge>
<Badge variant="neutral">Draft</Badge>
```

---

## CSS Classes

| Class | Description |
|-------|-------------|
| `.a-badge` | Base badge styles |
| `.a-badge--success` | Success variant (green) |
| `.a-badge--error` | Error variant (red) |
| `.a-badge--warning` | Warning variant (yellow) |
| `.a-badge--info` | Info variant (blue) |
| `.a-badge--neutral` | Neutral variant (gray) |

---

## CSS Variables

### Success Badge
| Variable | Value | Description |
|----------|-------|-------------|
| `--signal-success-minor__enabled__default__fill` | `#b8efc9` | Background |
| `--signal-success-minor__enabled__default__front` | `#000000` | Text |

### Error Badge
| Variable | Value | Description |
|----------|-------|-------------|
| `--signal-error-minor__enabled__default__fill` | `#ffd9d9` | Background |
| `--signal-error-minor__enabled__default__front` | `#000000` | Text |

### Warning Badge
| Variable | Value | Description |
|----------|-------|-------------|
| `--signal-warning-minor__enabled__default__fill` | `#ffdf95` | Background |
| `--signal-warning-minor__enabled__default__front` | `#000000` | Text |

### Info Badge
| Variable | Value | Description |
|----------|-------|-------------|
| `--signal-note-minor__enabled__default__fill` | `#d1e4ff` | Background |
| `--signal-note-minor__enabled__default__front` | `#000000` | Text |

### Neutral Badge
| Variable | Value | Description |
|----------|-------|-------------|
| `--signal-neutral-minor__enabled__default__fill` | `#e0e2e5` | Background |
| `--signal-neutral-minor__enabled__default__front` | `#000000` | Text |

---

## Usage Examples

### Status Indicators
```tsx
<Badge variant="success">Completed</Badge>
<Badge variant="error">Error</Badge>
<Badge variant="warning">In Progress</Badge>
```

### In a Table
```tsx
<TableCell>
  <Badge variant={row.status === 'active' ? 'success' : 'neutral'}>
    {row.status}
  </Badge>
</TableCell>
```

### With Count
```tsx
<Badge variant="info">3 new</Badge>
```

### Status Mapping
```tsx
const statusConfig = {
  completed: { variant: 'success', label: 'Completed' },
  failed: { variant: 'error', label: 'Failed' },
  pending: { variant: 'warning', label: 'Pending' },
  draft: { variant: 'neutral', label: 'Draft' }
};

const status = statusConfig[item.status];
<Badge variant={status.variant}>{status.label}</Badge>
```

---

## Custom Styling

### Custom Colors
```tsx
<Badge 
  variant="neutral"
  style={{ 
    '--signal-neutral-minor__enabled__default__fill': 'var(--g-purple-90)',
    '--signal-neutral-minor__enabled__default__front': 'var(--g-purple-30)'
  } as React.CSSProperties}
>
  Custom
</Badge>
```

### SCSS Override
```scss
.my-purple-badge {
  background-color: var(--g-purple-90);
  color: var(--g-purple-30);
}
```

---

## Do's and Don'ts

**Do:**
- Use consistent status colors throughout the app
- Keep badge text short (1-2 words)
- Use semantic variants that match meaning

**Don't:**
- Don't use badges for long text
- Don't mix status meanings (e.g., success for pending)
- Don't use many different colors in one view

---

## Related Components
- [Chip](chip.md) — Interactive tag with close action
- [Notification](notification.md) — Full alert banner
- [Sticker](sticker.md) — Category label
