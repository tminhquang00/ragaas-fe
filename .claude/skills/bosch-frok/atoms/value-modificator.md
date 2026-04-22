# ValueModificator

Numeric input with increment/decrement buttons.

---

## Import

```tsx
import { ValueModificator } from '@bosch/react-frok';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | - | Unique identifier |
| `label` | `string` | - | Label text |
| `value` | `number` | - | Current value (controlled) |
| `defaultValue` | `number` | `0` | Initial value (uncontrolled) |
| `onChange` | `(value: number) => void` | - | Value change handler |
| `min` | `number` | - | Minimum allowed value |
| `max` | `number` | - | Maximum allowed value |
| `step` | `number` | `1` | Increment/decrement amount |
| `disabled` | `boolean` | `false` | Disable interaction |
| `className` | `string` | - | Additional CSS classes |

---

## CSS Classes

| Class | Description |
|-------|-------------|
| `.a-value-modificator` | Base container |
| `.a-value-modificator__input` | Number input field |
| `.a-value-modificator__button` | +/- buttons |
| `.a-value-modificator__button--increment` | Plus button |
| `.a-value-modificator__button--decrement` | Minus button |
| `.a-value-modificator__label` | Label text |
| `.a-value-modificator.-disabled` | Disabled state |

---

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--nested-minor__enabled__default__fill` | `#ffffff` | Input background |
| `--nested-minor__enabled__default__front` | `#000000` | Text color |
| `--nested-pure__enabled__default__fill` | `#ffffff` | Button background |
| `--nested-pure__enabled__hovered__fill` | `#eff1f2` | Button hover |
| `--g-gray-85` | `#d0d4d8` | Border color |
| `--g-blue-50` | `#007bc0` | Focus border |

---

## Usage Examples

### Basic Usage
```tsx
<ValueModificator
  id="quantity"
  label="Quantity"
  defaultValue={1}
  min={1}
  max={99}
/>
```

### Controlled Component
```tsx
const [count, setCount] = useState(5);

<ValueModificator
  id="items"
  label="Number of items"
  value={count}
  onChange={setCount}
  min={0}
  max={100}
/>
```

### With Custom Step
```tsx
<ValueModificator
  id="amount"
  label="Amount ($)"
  defaultValue={10}
  step={5}
  min={0}
  max={500}
/>
```

### Decimal Values
```tsx
<ValueModificator
  id="weight"
  label="Weight (kg)"
  defaultValue={1.5}
  step={0.1}
  min={0}
  max={10}
/>
```

### Cart Quantity
```tsx
const CartItem = ({ product, quantity, onQuantityChange }) => (
  <div className="cart-item">
    <span>{product.name}</span>
    <ValueModificator
      id={`qty-${product.id}`}
      value={quantity}
      onChange={onQuantityChange}
      min={1}
      max={product.stock}
    />
    <span>${product.price * quantity}</span>
  </div>
);
```

### Inside FormField
```tsx
<FormField label="Team Size" required>
  <ValueModificator
    id="team-size"
    defaultValue={3}
    min={1}
    max={20}
  />
</FormField>
```

---

## Accessibility

```tsx
<ValueModificator
  id="accessible-vm"
  label="Quantity"
  aria-label="Quantity selector"
  aria-valuemin={1}
  aria-valuemax={99}
  aria-valuenow={value}
/>
```

- Buttons are keyboard accessible
- Input accepts direct number entry
- Arrow keys increment/decrement when focused

---

## Do's and Don'ts

**Do:**
- Set reasonable `min` and `max` bounds
- Use appropriate `step` for the data type
- Provide clear labels
- Consider validation for direct input

**Don't:**
- Don't use for large ranges (use Slider)
- Don't allow negative values unless needed
- Don't omit bounds for critical inputs

---

## Related Components
- [Slider](slider.md) — Visual range selection
- [TextField](input.md) — General number input
- [FormField](../molecules/form-field.md) — Validation wrapper
