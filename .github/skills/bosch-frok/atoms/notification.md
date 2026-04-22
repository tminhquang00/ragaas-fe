# Notification

Alert banner component for status messages and feedback.

---

## Import

```tsx
import { Notification } from '@bosch/react-frok';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'success' \| 'error' \| 'warning' \| 'note'` | `'note'` | Semantic type |
| `title` | `string` | - | Notification title |
| `children` | `ReactNode` | - | Notification body content |
| `closable` | `boolean` | `false` | Show close button |
| `onClose` | `() => void` | - | Close handler |
| `icon` | `string` | - | Custom icon (auto-selected by variant if omitted) |
| `actions` | `ReactNode` | - | Action buttons |
| `className` | `string` | - | Additional CSS classes |

---

## Variants

| Variant | Icon | Color | Use Case |
|---------|------|-------|----------|
| `success` | checkmark | Green | Success confirmations |
| `error` | error | Red | Error messages, failures |
| `warning` | warning | Yellow | Warnings, caution |
| `note` | info | Blue | Informational messages |

---

## CSS Classes

| Class | Description |
|-------|-------------|
| `.a-notification` | Base notification styles |
| `.a-notification--success` | Success variant |
| `.a-notification--error` | Error variant |
| `.a-notification--warning` | Warning variant |
| `.a-notification--note` | Note/info variant |
| `.a-notification__icon` | Icon container |
| `.a-notification__content` | Content wrapper |
| `.a-notification__title` | Title element |
| `.a-notification__body` | Body text |
| `.a-notification__close` | Close button |
| `.a-notification__actions` | Actions container |

---

## CSS Variables

### Success Notification
| Variable | Value | Description |
|----------|-------|-------------|
| `--signal-success-minor__enabled__default__fill` | `#b8efc9` | Background |
| `--signal-success-major__enabled__default__fill` | `#00884a` | Icon/accent |

### Error Notification
| Variable | Value | Description |
|----------|-------|-------------|
| `--signal-error-minor__enabled__default__fill` | `#ffd9d9` | Background |
| `--signal-error-major__enabled__default__fill` | `#ed0007` | Icon/accent |

### Warning Notification
| Variable | Value | Description |
|----------|-------|-------------|
| `--signal-warning-minor__enabled__default__fill` | `#ffdf95` | Background |
| `--signal-warning-major__enabled__default__fill` | `#ffcf00` | Icon/accent |

### Note Notification
| Variable | Value | Description |
|----------|-------|-------------|
| `--signal-note-minor__enabled__default__fill` | `#d1e4ff` | Background |
| `--signal-note-major__enabled__default__fill` | `#007bc0` | Icon/accent |

---

## Usage Examples

### Basic Notifications
```tsx
<Notification variant="success" title="Success">
  Your changes have been saved.
</Notification>

<Notification variant="error" title="Error">
  Failed to save changes. Please try again.
</Notification>

<Notification variant="warning" title="Warning">
  Your session will expire in 5 minutes.
</Notification>

<Notification variant="note" title="Note">
  A new version is available.
</Notification>
```

### Closable Notification
```tsx
const [showNotification, setShowNotification] = useState(true);

{showNotification && (
  <Notification 
    variant="success" 
    title="Saved"
    closable
    onClose={() => setShowNotification(false)}
  >
    Your profile has been updated.
  </Notification>
)}
```

### With Actions
```tsx
<Notification 
  variant="warning" 
  title="Unsaved Changes"
  actions={
    <>
      <Button mode="primary" size="small">Save</Button>
      <Button mode="tertiary" size="small">Discard</Button>
    </>
  }
>
  You have unsaved changes that will be lost.
</Notification>
```

### Inline Error Message
```tsx
{error && (
  <Notification 
    variant="error" 
    title="Validation Error"
    style={{ marginBottom: '1rem' }}
  >
    {error.message}
  </Notification>
)}
```

### Loading/Processing State
```tsx
<Notification variant="note" title="Processing">
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
    <ActivityIndicator size="small" />
    <span>Uploading file...</span>
  </div>
</Notification>
```

---

## Toast Pattern

For transient toast notifications:

```tsx
// Using a notification state
const [toast, setToast] = useState<{
  variant: 'success' | 'error';
  message: string;
} | null>(null);

// Show toast
const showToast = (variant, message) => {
  setToast({ variant, message });
  setTimeout(() => setToast(null), 5000);
};

// Render
{toast && (
  <div style={{ 
    position: 'fixed', 
    top: '1rem', 
    right: '1rem',
    zIndex: 1000 
  }}>
    <Notification 
      variant={toast.variant}
      closable
      onClose={() => setToast(null)}
    >
      {toast.message}
    </Notification>
  </div>
)}
```

---

## Do's and Don'ts

**Do:**
- Use appropriate variant for message severity
- Keep messages concise and actionable
- Provide close action for non-critical notifications
- Position consistently (top of content or fixed)

**Don't:**
- Don't show multiple notifications simultaneously
- Don't use notifications for permanent content
- Don't auto-close error messages too quickly
- Don't use generic messages like "An error occurred"

---

## Related Components
- [Badge](badge.md) — Inline status indicator
- [Dialog](../molecules/dialog.md) — Modal confirmation
- [ActivityIndicator](activity-indicator.md) — Loading spinner
