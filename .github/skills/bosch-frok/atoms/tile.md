# Tile

Card container with optional highlight accent.

---

## Import

```tsx
import { Tile } from '@bosch/react-frok';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | Tile content |
| `highlight` | `'purple' \| 'blue' \| 'turquoise' \| 'green'` | - | Colored top accent |
| `background` | `'primary' \| 'secondary' \| 'contrast'` | `'primary'` | Background variant |
| `className` | `string` | - | Additional CSS classes |

---

## CSS Classes

| Class | Description |
|-------|-------------|
| `.a-tile` | Base container |
| `.a-tile--highlight-purple` | Purple accent |
| `.a-tile--highlight-blue` | Blue accent |
| `.a-tile--highlight-turquoise` | Turquoise accent |
| `.a-tile--highlight-green` | Green accent |
| `.a-tile--background-primary` | Primary background |
| `.a-tile--background-secondary` | Secondary background |
| `.a-tile--background-contrast` | Contrast background |

---

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--g-gray-100` | `#ffffff` | Primary background |
| `--g-gray-95` | `#eff1f2` | Secondary background |
| `--g-gray-10` | `#1a1d21` | Contrast background |
| `--g-purple-50` | `#7851a9` | Purple highlight |
| `--g-blue-50` | `#007bc0` | Blue highlight |
| `--g-turquoise-50` | `#009eb4` | Turquoise highlight |
| `--g-green-50` | `#00884a` | Green highlight |

---

## Usage Examples

### Basic Tile
```tsx
<Tile>
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</Tile>
```

### With Highlight
```tsx
<Tile highlight="blue">
  <h3>Featured</h3>
  <p>This tile has a blue accent</p>
</Tile>
```

### Different Backgrounds
```tsx
<Tile background="primary">
  <p>Primary background (white)</p>
</Tile>

<Tile background="secondary">
  <p>Secondary background (gray)</p>
</Tile>

<Tile background="contrast">
  <p style={{ color: 'white' }}>Contrast background (dark)</p>
</Tile>
```

### Dashboard Cards
```tsx
const DashboardCard = ({ title, value, trend, color }) => (
  <Tile highlight={color}>
    <div style={{ padding: '1.5rem' }}>
      <h4 className="-size-s" style={{ color: 'var(--g-gray-50)' }}>
        {title}
      </h4>
      <p className="-size-xl highlight">{value}</p>
      <span className="-size-s" style={{ color: trend > 0 ? 'var(--g-green-50)' : 'var(--g-red-50)' }}>
        {trend > 0 ? '+' : ''}{trend}%
      </span>
    </div>
  </Tile>
);

<div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
  <DashboardCard title="Revenue" value="$12,345" trend={5.2} color="green" />
  <DashboardCard title="Users" value="1,234" trend={-2.1} color="blue" />
  <DashboardCard title="Orders" value="456" trend={12.5} color="purple" />
  <DashboardCard title="Sessions" value="7,890" trend={3.8} color="turquoise" />
</div>
```

### Clickable Tile
```tsx
<Tile 
  highlight="blue"
  style={{ cursor: 'pointer' }}
  onClick={() => navigate('/details')}
>
  <div style={{ padding: '1rem' }}>
    <h4>Click to view details</h4>
    <Icon iconName="chevron-right" />
  </div>
</Tile>
```

### Grid of Tiles
```tsx
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
  {items.map(item => (
    <Tile key={item.id} highlight={item.color}>
      <Image src={item.image} alt={item.name} />
      <div style={{ padding: '1rem' }}>
        <h4>{item.name}</h4>
        <p className="-size-s">{item.description}</p>
      </div>
    </Tile>
  ))}
</div>
```

---

## Do's and Don'ts

**Do:**
- Use highlights to categorize content
- Use consistent backgrounds in sections
- Add padding to child content

**Don't:**
- Don't mix too many highlight colors
- Don't use contrast background for small text
- Don't nest tiles

---

## Related Components
- [SelectableTile](selectable-tile.md) — Selectable card
- [Box](box.md) — Simple container
- [Accordion](accordion.md) — Collapsible content
