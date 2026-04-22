# Sticker

Colored label tag for categorization.

---

## Import

```tsx
import { Sticker } from '@bosch/react-frok';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | **Required** — Sticker text |
| `background` | `'purple' \| 'blue' \| 'turquoise' \| 'green' \| 'yellow' \| 'red' \| 'gray'` | `'gray'` | Background color |
| `className` | `string` | - | Additional CSS classes |

---

## CSS Classes

| Class | Description |
|-------|-------------|
| `.a-sticker` | Base container |
| `.a-sticker--purple` | Purple background |
| `.a-sticker--blue` | Blue background |
| `.a-sticker--turquoise` | Turquoise background |
| `.a-sticker--green` | Green background |
| `.a-sticker--yellow` | Yellow background |
| `.a-sticker--red` | Red background |
| `.a-sticker--gray` | Gray background |

---

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--g-purple-50` | `#7851a9` | Purple |
| `--g-blue-50` | `#007bc0` | Blue |
| `--g-turquoise-50` | `#009eb4` | Turquoise |
| `--g-green-50` | `#00884a` | Green |
| `--g-yellow-50` | `#ffcf00` | Yellow |
| `--g-red-50` | `#ed0007` | Red |
| `--g-gray-50` | `#525f6b` | Gray |

---

## Usage Examples

### Basic Sticker
```tsx
<Sticker label="New" background="green" />
```

### Color Variants
```tsx
<Sticker label="Feature" background="purple" />
<Sticker label="Update" background="blue" />
<Sticker label="Info" background="turquoise" />
<Sticker label="Success" background="green" />
<Sticker label="Warning" background="yellow" />
<Sticker label="Error" background="red" />
<Sticker label="Default" background="gray" />
```

### Product Labels
```tsx
const ProductCard = ({ product }) => (
  <Tile>
    <div style={{ position: 'relative' }}>
      <Image src={product.image} alt={product.name} />
      {product.isNew && (
        <Sticker 
          label="New" 
          background="green"
          style={{ position: 'absolute', top: '0.5rem', left: '0.5rem' }}
        />
      )}
      {product.discount && (
        <Sticker 
          label={`-${product.discount}%`} 
          background="red"
          style={{ position: 'absolute', top: '0.5rem', right: '0.5rem' }}
        />
      )}
    </div>
    <h4>{product.name}</h4>
    <p>${product.price}</p>
  </Tile>
);
```

### Category Tags
```tsx
const Article = ({ article }) => (
  <div>
    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
      {article.categories.map(cat => (
        <Sticker key={cat.id} label={cat.name} background={cat.color} />
      ))}
    </div>
    <h2>{article.title}</h2>
    <p>{article.excerpt}</p>
  </div>
);
```

### Status Indicators
```tsx
const statusColors = {
  draft: 'gray',
  review: 'yellow',
  approved: 'green',
  rejected: 'red',
};

<Sticker 
  label={status} 
  background={statusColors[status]} 
/>
```

### Table with Stickers
```tsx
<Table>
  <TableHead>
    <TableRow>
      <TableCell header>Name</TableCell>
      <TableCell header>Type</TableCell>
      <TableCell header>Status</TableCell>
    </TableRow>
  </TableHead>
  <TableBody>
    {items.map(item => (
      <TableRow key={item.id}>
        <TableCell>{item.name}</TableCell>
        <TableCell>
          <Sticker label={item.type} background="blue" />
        </TableCell>
        <TableCell>
          <Sticker label={item.status} background={getStatusColor(item.status)} />
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

---

## Do's and Don'ts

**Do:**
- Use consistent colors for categories
- Keep labels short (1-2 words)
- Position prominently for visibility

**Don't:**
- Don't use too many colors together
- Don't use for dynamic status (use Badge)
- Don't use for actions (use Button)

---

## Related Components
- [Badge](badge.md) — Status indicators
- [Chip](chip.md) — Interactive tags
- [Tile](tile.md) — Container with highlight
