# Spacing

Padding, margin, and gap patterns used across FROK components.

---

## Base Spacing Scale

FROK uses a 4px base unit. Common spacing values:

| Value | Pixels | rem | Common Use |
|-------|--------|-----|------------|
| `0.25rem` | 4px | 0.25rem | Tight gaps, icon margins |
| `0.5rem` | 8px | 0.5rem | Small gaps, compact padding |
| `0.75rem` | 12px | 0.75rem | Button gaps, card padding |
| `1rem` | 16px | 1rem | **Standard spacing** |
| `1.25rem` | 20px | 1.25rem | Section gaps |
| `1.5rem` | 24px | 1.5rem | Large gaps, form spacing |
| `2rem` | 32px | 2rem | Section margins |
| `3rem` | 48px | 3rem | Major section breaks |
| `4rem` | 64px | 4rem | Page-level spacing |

---

## Container Classes

### `.e-container`
Standard centered container with max-width.

```css
.e-container {
  width: calc(100% - 2rem);
  max-width: 70.75rem; /* 1132px */
  margin: 0 auto;
  padding: 0 1rem;
}
```

### `.e-container.-full-width`
Full-width container with horizontal padding.

```css
.e-container.-full-width {
  width: 100%;
  max-width: unset;
  padding: 0 1rem;
}
```

---

## Component-Specific Spacing

### Button
| Element | Spacing |
|---------|---------|
| Horizontal padding | `1rem` (16px) |
| Vertical padding | `0.625rem` (10px) |
| Icon gap | `0.5rem` (8px) |
| Button group gap | `0.75rem` (12px) |

### FormField
| Element | Spacing |
|---------|---------|
| Label to input | `0.25rem` (4px) |
| Error message margin-top | `0.25rem` (4px) |
| Field to field | `1.5rem` (24px) |

### Card / Tile
| Element | Spacing |
|---------|---------|
| Inner padding | `1rem` to `1.5rem` |
| Card gap in grid | `1rem` (16px) |

### Dialog
| Element | Spacing |
|---------|---------|
| Header padding | `1.5rem` |
| Body padding | `1.5rem` |
| Footer padding | `1rem 1.5rem` |
| Action button gap | `0.75rem` |

### Header (Organism)
| Element | Spacing |
|---------|---------|
| Logo margin | `1rem` |
| Quick links gap | `0.5rem` |
| Breadcrumbs padding | `0.5rem 0` |

### Table
| Element | Spacing |
|---------|---------|
| Cell padding | `0.75rem 1rem` |
| Header cell padding | `0.75rem 1rem` |

---

## Layout Patterns

### Form Layout
```tsx
<Form description="User Settings">
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
    <FormField label="Name">
      <TextField />
    </FormField>
    <FormField label="Email">
      <TextField type="email" />
    </FormField>
  </div>
  
  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem' }}>
    <Button mode="primary">Save</Button>
    <Button mode="secondary">Cancel</Button>
  </div>
</Form>
```

### Card Grid
```tsx
<div style={{ 
  display: 'grid', 
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: '1rem' 
}}>
  <Tile>Card 1</Tile>
  <Tile>Card 2</Tile>
  <Tile>Card 3</Tile>
</div>
```

### Page Section
```tsx
<section style={{ marginBottom: '3rem' }}>
  <h2 className="-size-2xl highlight" style={{ marginBottom: '1rem' }}>
    Section Title
  </h2>
  <p className="-size-m">Section content...</p>
</section>
```

---

## Responsive Spacing

### Breakpoints
| Name | Width | Description |
|------|-------|-------------|
| Mobile | < 768px | Compact spacing |
| Tablet | 768px - 1151px | Medium spacing |
| Desktop | ≥ 1152px | Full spacing |

### Pattern
```css
.my-section {
  padding: 1rem;        /* Mobile */
}

@media (min-width: 768px) {
  .my-section {
    padding: 1.5rem;    /* Tablet */
  }
}

@media (min-width: 1152px) {
  .my-section {
    padding: 2rem;      /* Desktop */
  }
}
```

---

## Gap Utilities (if using Tailwind for layout)

Allowed gap utilities:
- `gap-1` (4px), `gap-2` (8px), `gap-3` (12px), `gap-4` (16px)
- `gap-6` (24px), `gap-8` (32px), `gap-12` (48px)

```tsx
// Allowed - layout only
<div className="flex gap-3">
  <Button mode="primary">Save</Button>
  <Button mode="secondary">Cancel</Button>
</div>
```

---

## Margin/Padding Quick Reference

| Use Case | Value |
|----------|-------|
| Inline icon spacing | `0.25rem` |
| Button icon gap | `0.5rem` |
| Adjacent buttons | `0.75rem` |
| Form fields | `1.5rem` |
| Page sections | `2rem - 3rem` |
| Hero spacing | `4rem` |
