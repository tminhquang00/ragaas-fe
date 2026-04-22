# ActivityIndicator

Loading spinner component for async operations.

---

## Import

```tsx
import { ActivityIndicator } from '@bosch/react-frok';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Spinner size |
| `className` | `string` | - | Additional CSS classes |

---

## CSS Classes

| Class | Description |
|-------|-------------|
| `.a-activity-indicator` | Base spinner styles |
| `.a-activity-indicator--small` | Small size |
| `.a-activity-indicator--large` | Large size |

---

## CSS Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `--g-blue-50` | `#007bc0` | Spinner color |

### Size Values
| Size | Dimensions |
|------|------------|
| `small` | 16px × 16px |
| `medium` | 32px × 32px |
| `large` | 48px × 48px |

---

## Usage Examples

### Basic Spinner
```tsx
<ActivityIndicator />
```

### Sizes
```tsx
<ActivityIndicator size="small" />
<ActivityIndicator size="medium" />
<ActivityIndicator size="large" />
```

### Loading State Pattern
```tsx
{isLoading ? (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    padding: '2rem' 
  }}>
    <ActivityIndicator />
  </div>
) : (
  <div>{content}</div>
)}
```

### Button Loading
```tsx
<Button mode="primary" disabled={isLoading}>
  {isLoading ? (
    <>
      <ActivityIndicator size="small" />
      <span>Saving...</span>
    </>
  ) : (
    'Save'
  )}
</Button>
```

### Full Page Overlay
```tsx
{isLoading && (
  <div style={{
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  }}>
    <ActivityIndicator size="large" />
  </div>
)}
```

### Inline with Text
```tsx
<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
  <ActivityIndicator size="small" />
  <span>Loading data...</span>
</div>
```

---

## Custom Color

```tsx
<ActivityIndicator 
  style={{ color: 'var(--g-green-50)' }}
/>
```

---

## Do's and Don'ts

**Do:**
- Center spinners in their container
- Use appropriate size for context
- Provide loading text for accessibility
- Use small size for inline/button loading

**Don't:**
- Don't use multiple spinners in the same view
- Don't show spinner for very fast operations
- Don't forget to hide spinner when loading completes

---

## Related Components
- [ProgressIndicator](progress-indicator.md) — For determinate progress
- [Notification](notification.md) — For status messages
- [OverlayActivityIndicator](../custom/overlay-activity-indicator.md) — Full overlay version
