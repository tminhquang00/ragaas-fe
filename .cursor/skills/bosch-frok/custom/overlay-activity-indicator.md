# OverlayActivityIndicator

Full-screen loading overlay with spinner and optional text.

---

## Import

```tsx
import { OverlayActivityIndicator } from '@bosch/react-frok';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `string` | - | Loading message text |
| `visible` | `boolean` | `true` | Show/hide overlay |
| `className` | `string` | - | Additional CSS classes |

---

## CSS Classes

| Class | Description |
|-------|-------------|
| `.c-overlay-activity-indicator` | Base overlay styles |
| `.c-overlay-activity-indicator__backdrop` | Semi-transparent backdrop |
| `.c-overlay-activity-indicator__content` | Centered content container |
| `.c-overlay-activity-indicator__spinner` | Spinner element |
| `.c-overlay-activity-indicator__text` | Loading text |

---

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--g-gray-100` | `#ffffff` | Content background |
| `--g-blue-50` | `#007bc0` | Spinner color |
| `backdrop-color` | `rgba(0,0,0,0.5)` | Overlay backdrop |

---

## Usage Examples

### Basic Overlay
```tsx
{isLoading && (
  <OverlayActivityIndicator />
)}
```

### With Loading Text
```tsx
{isLoading && (
  <OverlayActivityIndicator text="Loading data..." />
)}
```

### Conditional Display
```tsx
<OverlayActivityIndicator 
  visible={isLoading}
  text="Processing your request..."
/>
```

### During Form Submit
```tsx
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async (data) => {
  setIsSubmitting(true);
  try {
    await saveData(data);
  } finally {
    setIsSubmitting(false);
  }
};

<>
  <Form onSubmit={handleSubmit}>
    {/* Form fields */}
  </Form>
  
  <OverlayActivityIndicator 
    visible={isSubmitting}
    text="Saving changes..."
  />
</>
```

### Page-Level Loading
```tsx
function DataPage() {
  const { data, isLoading, error } = useQuery('data', fetchData);

  return (
    <>
      <OverlayActivityIndicator 
        visible={isLoading}
        text="Loading page data..."
      />
      
      {!isLoading && data && (
        <DataDisplay data={data} />
      )}
    </>
  );
}
```

### With Dynamic Text
```tsx
const [progress, setProgress] = useState(0);

<OverlayActivityIndicator 
  visible={isUploading}
  text={`Uploading... ${progress}%`}
/>
```

### Scoped to Container
```tsx
<div style={{ position: 'relative', minHeight: '400px' }}>
  <DataTable data={data} />
  
  {isLoading && (
    <div style={{ 
      position: 'absolute', 
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255,255,255,0.8)'
    }}>
      <ActivityIndicator />
      <span style={{ marginLeft: '0.5rem' }}>Loading...</span>
    </div>
  )}
</div>
```

---

## Accessibility

```tsx
<OverlayActivityIndicator 
  text="Loading data..."
  aria-live="polite"
  role="status"
/>
```

---

## Do's and Don'ts

**Do:**
- Provide meaningful loading text
- Show overlay for operations >500ms
- Use for blocking operations only
- Hide overlay when operation completes

**Don't:**
- Don't show overlay for fast operations
- Don't use for non-blocking background tasks
- Don't leave overlay visible indefinitely
- Don't stack multiple overlays

---

## Related Components
- [ActivityIndicator](../atoms/activity-indicator.md) — Inline spinner
- [ProgressIndicator](../atoms/progress-indicator.md) — Progress bar
- [Notification](../atoms/notification.md) — Status messages
