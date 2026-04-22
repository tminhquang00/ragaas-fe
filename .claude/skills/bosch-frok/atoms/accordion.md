# Accordion

Collapsible content sections for organizing information.

---

## Import

```tsx
import { Accordion } from '@bosch/react-frok';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `headline` | `string` | - | **Required** — Section title |
| `children` | `ReactNode` | - | Collapsible content |
| `open` | `boolean` | - | Controlled open state |
| `defaultOpen` | `boolean` | `false` | Initial open state |
| `onOpenChange` | `(open: boolean) => void` | - | State change handler |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Headline size |
| `disabled` | `boolean` | `false` | Disable toggling |
| `className` | `string` | - | Additional CSS classes |

---

## CSS Classes

| Class | Description |
|-------|-------------|
| `.a-accordion` | Base container |
| `.a-accordion__header` | Clickable header |
| `.a-accordion__headline` | Title text |
| `.a-accordion__icon` | Expand/collapse chevron |
| `.a-accordion__content` | Content wrapper |
| `.a-accordion--open` | Expanded state |
| `.a-accordion--disabled` | Disabled state |
| `.a-accordion--small` | Small size variant |
| `.a-accordion--large` | Large size variant |

---

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--g-gray-95` | `#eff1f2` | Header background |
| `--g-gray-85` | `#d0d4d8` | Border color |
| `--nested-minor__enabled__hovered__fill` | `#e0e2e5` | Header hover |
| `--g-blue-50` | `#007bc0` | Focus indicator |

---

## Usage Examples

### Basic Accordion
```tsx
<Accordion headline="Section Title">
  <p>This content is collapsible</p>
</Accordion>
```

### Multiple Sections
```tsx
<div>
  <Accordion headline="Getting Started">
    <p>Introduction content...</p>
  </Accordion>
  <Accordion headline="Configuration">
    <p>Configuration options...</p>
  </Accordion>
  <Accordion headline="Advanced">
    <p>Advanced settings...</p>
  </Accordion>
</div>
```

### Controlled Accordion
```tsx
const [isOpen, setIsOpen] = useState(false);

<Accordion
  headline="Details"
  open={isOpen}
  onOpenChange={setIsOpen}
>
  <p>Controlled content</p>
</Accordion>
```

### Only One Open (Exclusive)
```tsx
const [openIndex, setOpenIndex] = useState<number | null>(0);

{sections.map((section, index) => (
  <Accordion
    key={section.id}
    headline={section.title}
    open={openIndex === index}
    onOpenChange={(open) => setOpenIndex(open ? index : null)}
  >
    {section.content}
  </Accordion>
))}
```

### With Different Sizes
```tsx
<Accordion headline="Small Section" size="small">
  <p>Small accordion content</p>
</Accordion>

<Accordion headline="Large Section" size="large">
  <p>Large accordion content</p>
</Accordion>
```

### Default Open
```tsx
<Accordion headline="FAQ" defaultOpen>
  <p>This section is open by default</p>
</Accordion>
```

### Nested Accordions
```tsx
<Accordion headline="Parent Section">
  <Accordion headline="Child Section 1">
    <p>Nested content 1</p>
  </Accordion>
  <Accordion headline="Child Section 2">
    <p>Nested content 2</p>
  </Accordion>
</Accordion>
```

---

## Accessibility

```tsx
<Accordion
  headline="Accessible Section"
  aria-controls="section-content"
  aria-expanded={isOpen}
>
  <div id="section-content">
    Content here
  </div>
</Accordion>
```

- Header is keyboard focusable
- Enter/Space toggles open state
- `aria-expanded` managed automatically

---

## Do's and Don'ts

**Do:**
- Use clear, descriptive headlines
- Group related content logically
- Consider which sections should be open by default
- Use for progressive disclosure

**Don't:**
- Don't nest too many levels deep
- Don't put critical information in collapsed sections
- Don't use for simple show/hide (use conditional rendering)

---

## Related Components
- [Box](box.md) — Container without collapse
- [Tile](tile.md) — Card container
- [Dialog](../molecules/dialog.md) — Modal content
