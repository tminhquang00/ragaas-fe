# Slider

Range input for selecting a value within a numeric range.

---

## Import

```tsx
import { Slider } from '@bosch/react-frok';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | - | Unique identifier |
| `min` | `number` | `0` | Minimum value |
| `max` | `number` | `100` | Maximum value |
| `step` | `number` | `1` | Step increment |
| `value` | `number` | - | Current value (controlled) |
| `defaultValue` | `number` | - | Initial value (uncontrolled) |
| `onChange` | `(value: number) => void` | - | Value change handler |
| `labelLeft` | `string` | - | Label on left side |
| `labelRight` | `string` | - | Label on right side |
| `tooltip` | `boolean` | `false` | Show value tooltip on drag |
| `tooltipUnit` | `string` | - | Unit suffix in tooltip (e.g., "px", "%") |
| `disabled` | `boolean` | `false` | Disable interaction |
| `className` | `string` | - | Additional CSS classes |

---

## CSS Classes

| Class | Description |
|-------|-------------|
| `.a-slider` | Base container |
| `.a-slider__track` | Background track |
| `.a-slider__fill` | Filled portion (left of thumb) |
| `.a-slider__thumb` | Draggable handle |
| `.a-slider__label` | Label text |
| `.a-slider__label--left` | Left label |
| `.a-slider__label--right` | Right label |
| `.a-slider__tooltip` | Value tooltip |
| `.a-slider.-disabled` | Disabled state |

---

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--g-gray-85` | `#d0d4d8` | Track background |
| `--g-blue-50` | `#007bc0` | Fill color |
| `--g-blue-50` | `#007bc0` | Thumb color |
| `--g-gray-100` | `#ffffff` | Thumb background |
| `--nested-minor__disabled__default__fill` | `#eff1f2` | Disabled track |
| `--nested-minor__disabled__default__front` | `#8a9097` | Disabled thumb |

---

## Usage Examples

### Basic Slider
```tsx
<Slider
  id="volume"
  min={0}
  max={100}
  defaultValue={50}
  onChange={(value) => console.log(value)}
/>
```

### With Labels
```tsx
<Slider
  id="brightness"
  min={0}
  max={100}
  labelLeft="Dark"
  labelRight="Bright"
  defaultValue={75}
/>
```

### With Tooltip
```tsx
<Slider
  id="font-size"
  min={12}
  max={48}
  step={2}
  tooltip
  tooltipUnit="px"
  defaultValue={16}
/>
```

### Controlled Slider
```tsx
const [value, setValue] = useState(50);

<div>
  <Slider
    id="opacity"
    min={0}
    max={100}
    value={value}
    onChange={setValue}
    tooltip
    tooltipUnit="%"
  />
  <p>Current opacity: {value}%</p>
</div>
```

### Step Increments
```tsx
<Slider
  id="rating"
  min={0}
  max={5}
  step={0.5}
  tooltip
  defaultValue={3}
/>
```

### Inside FormField
```tsx
<FormField label="Volume Level">
  <Slider
    id="volume"
    min={0}
    max={100}
    labelLeft="0%"
    labelRight="100%"
  />
</FormField>
```

### Custom Range
```tsx
<Slider
  id="year"
  min={1990}
  max={2024}
  step={1}
  tooltip
  defaultValue={2020}
/>
```

---

## Accessibility

```tsx
<Slider
  id="accessible-slider"
  min={0}
  max={100}
  aria-label="Volume control"
  aria-valuemin={0}
  aria-valuemax={100}
  aria-valuenow={value}
  aria-valuetext={`${value} percent`}
/>
```

- Use keyboard arrows to adjust value
- Tab to focus, Arrow keys to change
- Provide `aria-label` for screen readers

---

## Do's and Don'ts

**Do:**
- Show current value (tooltip or external display)
- Use appropriate step values
- Provide context with labels
- Consider keyboard accessibility

**Don't:**
- Don't use for precise number entry (use TextField)
- Don't use very large ranges without steps
- Don't hide the current value from users

---

## Related Components
- [ProgressIndicator](progress-indicator.md) — Display-only progress
- [ValueModificator](value-modificator.md) — Increment/decrement input
- [TextField](input.md) — Precise number entry
