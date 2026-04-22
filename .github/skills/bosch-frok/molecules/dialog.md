# Dialog

Modal dialog component for confirmations, forms, and focused interactions.

---

## Import

```tsx
import { Dialog } from '@bosch/react-frok';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | - | **Required** — Controlled open state |
| `onOpenChange` | `(open: boolean) => void` | - | **Required** — State change handler |
| `title` | `string` | - | Dialog title in header |
| `variant` | `'default' \| 'warning' \| 'error'` | `'default'` | Semantic style |
| `children` | `ReactNode` | - | Dialog body content |
| `confirmLabel` | `string` | - | Primary action button text |
| `cancelLabel` | `string` | - | Secondary action button text |
| `onConfirm` | `() => void` | - | Primary action handler |
| `onCancel` | `() => void` | - | Cancel/secondary handler |
| `closeOnOverlayClick` | `boolean` | `true` | Close when clicking backdrop |
| `closeOnEscape` | `boolean` | `true` | Close on Escape key |
| `header` | `ReactNode` | - | Custom header content |
| `footer` | `ReactNode` | - | Custom footer content |
| `className` | `string` | - | Additional CSS classes |

---

## CSS Classes

| Class | Description |
|-------|-------------|
| `.m-dialog` | Base dialog styles |
| `.m-dialog__overlay` | Backdrop overlay |
| `.m-dialog__container` | Dialog box container |
| `.m-dialog__header` | Header section |
| `.m-dialog__title` | Title text |
| `.m-dialog__close` | Close button |
| `.m-dialog__body` | Content section |
| `.m-dialog__footer` | Action buttons section |
| `.m-dialog--warning` | Warning variant |
| `.m-dialog--error` | Error variant |

---

## CSS Variables for Customization

| Variable | Default | Description |
|----------|---------|-------------|
| `--max-dialog-width` | `600px` | Maximum dialog width |
| `--dialog-padding` | `1.5rem` | Internal padding |
| `--g-gray-100` | `#ffffff` | Dialog background |
| `--shadow-fill` | `rgba(0,0,0,0.15)` | Box shadow color |

### Overlay
| Variable | Default | Description |
|----------|---------|-------------|
| `background-color` | `rgba(0,0,0,0.5)` | Backdrop color |

### Variant Colors

**Default:** Uses accent tokens (`--accent-major__*`)

**Warning:** Uses warning signal tokens
| Variable | Value |
|----------|-------|
| `--signal-warning-major__enabled__default__fill` | `#ffcf00` |

**Error:** Uses error signal tokens
| Variable | Value |
|----------|-------|
| `--signal-error-major__enabled__default__fill` | `#ed0007` |

---

## Usage Examples

### Basic Confirmation Dialog
```tsx
const [isOpen, setIsOpen] = useState(false);

<Button mode="primary" onClick={() => setIsOpen(true)}>
  Delete Item
</Button>

<Dialog
  title="Delete Item"
  open={isOpen}
  onOpenChange={setIsOpen}
  confirmLabel="Delete"
  cancelLabel="Cancel"
  onConfirm={() => {
    handleDelete();
    setIsOpen(false);
  }}
>
  Are you sure you want to delete this item? This action cannot be undone.
</Dialog>
```

### Warning Dialog
```tsx
<Dialog
  title="Unsaved Changes"
  variant="warning"
  open={showWarning}
  onOpenChange={setShowWarning}
  confirmLabel="Leave"
  cancelLabel="Stay"
  onConfirm={handleLeave}
>
  You have unsaved changes. Are you sure you want to leave?
</Dialog>
```

### Error Dialog
```tsx
<Dialog
  title="Error"
  variant="error"
  open={hasError}
  onOpenChange={setHasError}
  confirmLabel="Retry"
  cancelLabel="Close"
  onConfirm={handleRetry}
>
  Failed to save your changes. Please try again.
</Dialog>
```

### Form Inside Dialog
```tsx
<Dialog
  title="Edit Profile"
  open={isEditOpen}
  onOpenChange={setIsEditOpen}
  footer={
    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
      <Button mode="secondary" onClick={() => setIsEditOpen(false)}>
        Cancel
      </Button>
      <Button mode="primary" onClick={handleSave}>
        Save Changes
      </Button>
    </div>
  }
>
  <FormField label="Display Name">
    <TextField value={name} onChange={(e) => setName(e.target.value)} />
  </FormField>
  <FormField label="Bio" style={{ marginTop: '1rem' }}>
    <TextArea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} />
  </FormField>
</Dialog>
```

### Custom Width
```tsx
<Dialog
  title="Large Dialog"
  open={isOpen}
  onOpenChange={setIsOpen}
  style={{ '--max-dialog-width': '800px' } as React.CSSProperties}
>
  Wide content here...
</Dialog>
```

### Small Confirmation
```tsx
<Dialog
  title="Confirm"
  open={isOpen}
  onOpenChange={setIsOpen}
  style={{ '--max-dialog-width': '400px' } as React.CSSProperties}
  confirmLabel="Yes"
  cancelLabel="No"
  onConfirm={handleConfirm}
>
  Continue with this action?
</Dialog>
```

---

## Controlled Pattern (Required)

Dialog MUST be controlled. Never use without `open` + `onOpenChange`:

```tsx
// ✅ Correct - controlled
const [isOpen, setIsOpen] = useState(false);
<Dialog open={isOpen} onOpenChange={setIsOpen}>...</Dialog>

// ❌ Wrong - uncontrolled (won't work properly)
<Dialog>...</Dialog>
```

---

## Accessibility

- Focus is trapped inside the dialog when open
- Pressing Escape closes the dialog (unless `closeOnEscape={false}`)
- Focus returns to trigger element when closed
- Use meaningful `title` for screen readers

---

## Do's and Don'ts

**Do:**
- Always use controlled pattern with `open` + `onOpenChange`
- Provide clear action labels (`confirmLabel`, `cancelLabel`)
- Use appropriate `variant` for destructive actions
- Keep dialog content focused and concise

**Don't:**
- Don't nest dialogs (close first before opening another)
- Don't use dialogs for simple alerts (use Notification)
- Don't put long scrollable content in dialogs
- Don't auto-close dialogs without user action

---

## Related Components
- [Notification](../atoms/notification.md) — For non-blocking alerts
- [Popover](popover.md) — For contextual, non-modal content
- [Lightbox](lightbox.md) — For media viewing
