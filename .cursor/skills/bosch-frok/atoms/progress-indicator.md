# ProgressIndicator

Progress bar for showing completion status.

---

## Import

```tsx
import { ProgressIndicator } from '@bosch/react-frok';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | - | Progress value (0-100) |
| `type` | `'determinate' \| 'indeterminate'` | `'determinate'` | Progress type |
| `label` | `string` | - | Label text |
| `showValue` | `boolean` | `false` | Show percentage text |
| `size` | `'small' \| 'medium'` | `'medium'` | Bar thickness |
| `className` | `string` | - | Additional CSS classes |

---

## CSS Classes

| Class | Description |
|-------|-------------|
| `.a-progress-indicator` | Base container |
| `.a-progress-indicator__track` | Background track |
| `.a-progress-indicator__fill` | Progress fill |
| `.a-progress-indicator__label` | Label text |
| `.a-progress-indicator__value` | Percentage text |
| `.a-progress-indicator--indeterminate` | Animated state |
| `.a-progress-indicator--small` | Thin variant |

---

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--g-gray-85` | `#d0d4d8` | Track background |
| `--g-blue-50` | `#007bc0` | Fill color |
| `--signal-success-major__enabled__default__fill` | `#00884a` | Success color |
| `--signal-error-major__enabled__default__fill` | `#ed0007` | Error color |

---

## Usage Examples

### Determinate Progress
```tsx
<ProgressIndicator value={65} />
```

### With Label and Value
```tsx
<ProgressIndicator
  value={45}
  label="Uploading..."
  showValue
/>
```

### Indeterminate (Loading)
```tsx
<ProgressIndicator type="indeterminate" label="Loading..." />
```

### File Upload Progress
```tsx
const FileUpload = ({ file, progress, status }) => (
  <div>
    <span className="-size-s">{file.name}</span>
    <ProgressIndicator
      value={progress}
      showValue
      label={status === 'complete' ? 'Complete' : 'Uploading'}
    />
  </div>
);
```

### Step Progress
```tsx
const steps = 5;
const currentStep = 3;

<div>
  <ProgressIndicator
    value={(currentStep / steps) * 100}
    label={`Step ${currentStep} of ${steps}`}
  />
</div>
```

### Small Size
```tsx
<ProgressIndicator value={80} size="small" />
```

### Multiple Progress Bars
```tsx
const tasks = [
  { name: 'Download', progress: 100 },
  { name: 'Extract', progress: 75 },
  { name: 'Install', progress: 30 },
];

<div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
  {tasks.map(task => (
    <ProgressIndicator
      key={task.name}
      value={task.progress}
      label={task.name}
      showValue
    />
  ))}
</div>
```

### With Status Colors (Custom)
```tsx
<ProgressIndicator
  value={100}
  label="Complete"
  style={{ '--progress-fill': 'var(--signal-success-major__enabled__default__fill)' }}
/>

<ProgressIndicator
  value={35}
  label="Failed"
  style={{ '--progress-fill': 'var(--signal-error-major__enabled__default__fill)' }}
/>
```

### Page Load Progress
```tsx
const [progress, setProgress] = useState(0);

useEffect(() => {
  // Simulate loading
  const interval = setInterval(() => {
    setProgress(p => p >= 100 ? 100 : p + 10);
  }, 200);
  return () => clearInterval(interval);
}, []);

{progress < 100 && (
  <ProgressIndicator
    value={progress}
    type={progress > 0 ? 'determinate' : 'indeterminate'}
  />
)}
```

---

## Accessibility

```tsx
<ProgressIndicator
  value={65}
  aria-label="File upload progress"
  aria-valuemin={0}
  aria-valuemax={100}
  aria-valuenow={65}
  aria-valuetext="65 percent complete"
/>
```

- Use `role="progressbar"` (automatic)
- Provide text alternative for screen readers
- Use `aria-busy="true"` on loading containers

---

## Do's and Don'ts

**Do:**
- Show percentage for determinate progress
- Use indeterminate when duration is unknown
- Update smoothly without jumping
- Pair with status text

**Don't:**
- Don't use for ratings (use Rating)
- Don't animate backwards
- Don't use tiny sizes for critical feedback

---

## Related Components
- [ActivityIndicator](activity-indicator.md) — Spinner loading
- [OverlayActivityIndicator](../custom/overlay-activity-indicator.md) — Full-screen loading
- [Slider](slider.md) — Interactive range
