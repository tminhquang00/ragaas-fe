# Rating

Star rating component for input or display.

---

## Import

```tsx
import { Rating } from '@bosch/react-frok';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | - | Current rating value |
| `defaultValue` | `number` | `0` | Initial value (uncontrolled) |
| `onChange` | `(value: number) => void` | - | Value change handler |
| `max` | `number` | `5` | Maximum stars |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Star size |
| `readOnly` | `boolean` | `false` | Display only (no interaction) |
| `disabled` | `boolean` | `false` | Disable interaction |
| `precision` | `0.5 \| 1` | `1` | Allow half stars |
| `className` | `string` | - | Additional CSS classes |

---

## CSS Classes

| Class | Description |
|-------|-------------|
| `.a-rating` | Base container |
| `.a-rating__star` | Individual star |
| `.a-rating__star--filled` | Filled star |
| `.a-rating__star--half` | Half-filled star |
| `.a-rating__star--empty` | Empty star |
| `.a-rating--small` | Small size |
| `.a-rating--large` | Large size |
| `.a-rating--readonly` | Read-only state |
| `.a-rating--disabled` | Disabled state |

---

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--g-yellow-50` | `#ffcf00` | Filled star color |
| `--g-gray-75` | `#bfc5cb` | Empty star color |
| `--g-gray-50` | `#525f6b` | Disabled star color |

---

## Usage Examples

### Basic Rating Input
```tsx
const [rating, setRating] = useState(0);

<Rating
  value={rating}
  onChange={setRating}
/>
```

### Read-Only Display
```tsx
<Rating value={4.5} readOnly />
```

### Custom Max Stars
```tsx
<Rating
  value={rating}
  onChange={setRating}
  max={10}
/>
```

### Half-Star Precision
```tsx
<Rating
  value={rating}
  onChange={setRating}
  precision={0.5}
/>
```

### Different Sizes
```tsx
<Rating value={4} size="small" readOnly />
<Rating value={4} size="medium" readOnly />
<Rating value={4} size="large" readOnly />
```

### Product Rating Display
```tsx
const ProductRating = ({ rating, reviewCount }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
    <Rating value={rating} readOnly precision={0.5} />
    <span className="-size-s" style={{ color: 'var(--g-gray-50)' }}>
      {rating.toFixed(1)} ({reviewCount} reviews)
    </span>
  </div>
);
```

### Rating Form
```tsx
<FormField label="Rate your experience">
  <Rating
    value={experienceRating}
    onChange={setExperienceRating}
  />
</FormField>
```

### With Labels
```tsx
const labels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

<div>
  <Rating value={rating} onChange={setRating} />
  {rating > 0 && (
    <span className="-size-s">{labels[rating - 1]}</span>
  )}
</div>
```

---

## Accessibility

```tsx
<Rating
  value={rating}
  onChange={setRating}
  aria-label="Product rating"
  aria-valuemin={0}
  aria-valuemax={5}
  aria-valuenow={rating}
/>
```

- Keyboard navigable (arrow keys)
- Announce current value to screen readers
- Use with label for context

---

## Do's and Don'ts

**Do:**
- Show numeric value alongside stars
- Use half-stars for averaged ratings
- Size appropriately for context
- Indicate number of ratings when displaying

**Don't:**
- Don't use more than 10 stars
- Don't use for non-rating purposes
- Don't hide the ability to clear rating

---

## Related Components
- [ProgressIndicator](progress-indicator.md) — Progress display
- [Slider](slider.md) — Range input
