# SelectableTile

Tile component with checkbox or radio selection.

---

## Import

```tsx
import { SelectableTile } from '@bosch/react-frok';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | Tile content |
| `control` | `'radio' \| 'checkbox'` | `'checkbox'` | Selection type |
| `checked` | `boolean` | `false` | Selected state |
| `defaultChecked` | `boolean` | `false` | Initial state |
| `onChange` | `(checked: boolean) => void` | - | Selection handler |
| `name` | `string` | - | Group name (radio mode) |
| `value` | `string` | - | Tile value |
| `disabled` | `boolean` | `false` | Disable selection |
| `className` | `string` | - | Additional CSS classes |

---

## CSS Classes

| Class | Description |
|-------|-------------|
| `.a-selectable-tile` | Base container |
| `.a-selectable-tile__control` | Checkbox/radio control |
| `.a-selectable-tile__content` | Content area |
| `.a-selectable-tile--selected` | Selected state |
| `.a-selectable-tile--disabled` | Disabled state |
| `.a-selectable-tile--radio` | Radio mode |
| `.a-selectable-tile--checkbox` | Checkbox mode |

---

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--g-gray-100` | `#ffffff` | Background |
| `--g-gray-85` | `#d0d4d8` | Border color |
| `--g-blue-90` | `#d1e4ff` | Selected background |
| `--g-blue-50` | `#007bc0` | Selected border |

---

## Usage Examples

### Basic Checkbox Tile
```tsx
const [selected, setSelected] = useState(false);

<SelectableTile
  checked={selected}
  onChange={setSelected}
>
  <h4>Option A</h4>
  <p>Description of option A</p>
</SelectableTile>
```

### Multi-Select Tiles
```tsx
const [selectedIds, setSelectedIds] = useState<string[]>([]);

const toggleSelection = (id: string) => {
  setSelectedIds(prev => 
    prev.includes(id) 
      ? prev.filter(x => x !== id) 
      : [...prev, id]
  );
};

<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
  {options.map(option => (
    <SelectableTile
      key={option.id}
      control="checkbox"
      checked={selectedIds.includes(option.id)}
      onChange={() => toggleSelection(option.id)}
    >
      <Icon iconName={option.icon} size="large" />
      <h4>{option.name}</h4>
      <p className="-size-s">{option.description}</p>
    </SelectableTile>
  ))}
</div>
```

### Radio Group Tiles
```tsx
const [selectedPlan, setSelectedPlan] = useState('basic');

<div style={{ display: 'flex', gap: '1rem' }}>
  <SelectableTile
    control="radio"
    name="plan"
    value="basic"
    checked={selectedPlan === 'basic'}
    onChange={() => setSelectedPlan('basic')}
  >
    <h4>Basic</h4>
    <p className="-size-xl highlight">$9/mo</p>
    <ul>
      <li>5 Projects</li>
      <li>10GB Storage</li>
    </ul>
  </SelectableTile>
  
  <SelectableTile
    control="radio"
    name="plan"
    value="pro"
    checked={selectedPlan === 'pro'}
    onChange={() => setSelectedPlan('pro')}
  >
    <h4>Pro</h4>
    <p className="-size-xl highlight">$29/mo</p>
    <ul>
      <li>Unlimited Projects</li>
      <li>100GB Storage</li>
    </ul>
  </SelectableTile>
</div>
```

### With Images
```tsx
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
  {templates.map(template => (
    <SelectableTile
      key={template.id}
      checked={selectedTemplate === template.id}
      onChange={() => setSelectedTemplate(template.id)}
    >
      <Image src={template.thumbnail} alt={template.name} />
      <p>{template.name}</p>
    </SelectableTile>
  ))}
</div>
```

### Disabled Tile
```tsx
<SelectableTile disabled>
  <h4>Premium</h4>
  <Badge variant="warning">Coming Soon</Badge>
</SelectableTile>
```

### Selection Summary
```tsx
<div>
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
    {features.map(feature => (
      <SelectableTile
        key={feature.id}
        checked={selectedFeatures.includes(feature.id)}
        onChange={() => toggleFeature(feature.id)}
      >
        <h4>{feature.name}</h4>
        <p className="-size-s">+${feature.price}/mo</p>
      </SelectableTile>
    ))}
  </div>
  <p>
    Selected: {selectedFeatures.length} features 
    (${calculateTotal(selectedFeatures)}/mo)
  </p>
</div>
```

---

## Accessibility

```tsx
<SelectableTile
  control="checkbox"
  checked={isSelected}
  onChange={setIsSelected}
  aria-label="Select premium plan"
>
  <h4>Premium Plan</h4>
</SelectableTile>
```

- Entire tile is clickable
- Keyboard accessible (Tab + Space)
- Radio tiles should share `name` prop

---

## Do's and Don'ts

**Do:**
- Use radio mode for single selection
- Use checkbox mode for multi-selection
- Keep content concise
- Show selection visually

**Don't:**
- Don't mix radio and checkbox in same group
- Don't use for navigation
- Don't disable without explanation

---

## Related Components
- [Tile](tile.md) — Non-selectable card
- [Checkbox](checkbox.md) — Standalone checkbox
- [RadioButton](radiobutton.md) — Standalone radio
