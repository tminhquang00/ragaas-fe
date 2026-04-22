# Breadcrumbs

Navigation path component showing hierarchy.

---

## Import

```tsx
import { Breadcrumbs } from '@bosch/react-frok';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | Link children |
| `separator` | `ReactNode` | `'/'` | Custom separator |
| `maxItems` | `number` | - | Max visible items (collapses middle) |
| `className` | `string` | - | Additional CSS classes |

---

## CSS Classes

| Class | Description |
|-------|-------------|
| `.m-breadcrumbs` | Base container |
| `.m-breadcrumbs__list` | Ordered list |
| `.m-breadcrumbs__item` | Individual crumb |
| `.m-breadcrumbs__separator` | Separator element |
| `.m-breadcrumbs__link` | Clickable link |
| `.m-breadcrumbs__current` | Current page (not linked) |
| `.m-breadcrumbs__collapsed` | Collapsed items indicator |

---

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--g-blue-50` | `#007bc0` | Link color |
| `--g-gray-50` | `#525f6b` | Separator/current color |

---

## Usage Examples

### Basic Breadcrumbs
```tsx
<Breadcrumbs>
  <Link href="/">Home</Link>
  <Link href="/products">Products</Link>
  <Link href="/products/electronics">Electronics</Link>
  <span>Laptop XYZ</span>
</Breadcrumbs>
```

### Custom Separator
```tsx
<Breadcrumbs separator={<Icon iconName="chevron-right" />}>
  <Link href="/">Home</Link>
  <Link href="/docs">Documentation</Link>
  <span>Getting Started</span>
</Breadcrumbs>
```

### With React Router
```tsx
import { Link as RouterLink } from 'react-router-dom';

<Breadcrumbs>
  <Link as={RouterLink} to="/">Home</Link>
  <Link as={RouterLink} to="/dashboard">Dashboard</Link>
  <Link as={RouterLink} to="/dashboard/analytics">Analytics</Link>
  <span>Reports</span>
</Breadcrumbs>
```

### Collapsed Breadcrumbs
```tsx
<Breadcrumbs maxItems={3}>
  <Link href="/">Home</Link>
  <Link href="/category">Category</Link>
  <Link href="/category/subcategory">Subcategory</Link>
  <Link href="/category/subcategory/item">Item</Link>
  <span>Detail</span>
</Breadcrumbs>
{/* Renders: Home / ... / Item / Detail */}
```

### Dynamic Breadcrumbs
```tsx
const BreadcrumbNav = ({ path }) => {
  const segments = path.split('/').filter(Boolean);
  
  return (
    <Breadcrumbs>
      <Link href="/">Home</Link>
      {segments.map((segment, index) => {
        const href = '/' + segments.slice(0, index + 1).join('/');
        const isLast = index === segments.length - 1;
        
        return isLast ? (
          <span key={segment}>{formatLabel(segment)}</span>
        ) : (
          <Link key={segment} href={href}>{formatLabel(segment)}</Link>
        );
      })}
    </Breadcrumbs>
  );
};
```

### In Header
```tsx
<Header
  logo={{ href: '/' }}
  breadcrumbs={(
    <Breadcrumbs>
      <Link href="/">Home</Link>
      <Link href="/settings">Settings</Link>
      <span>Profile</span>
    </Breadcrumbs>
  )}
/>
```

### With Icons
```tsx
<Breadcrumbs>
  <Link href="/" icon="home">Home</Link>
  <Link href="/files" icon="folder">Files</Link>
  <Link href="/files/documents" icon="file">Documents</Link>
  <span>Report.pdf</span>
</Breadcrumbs>
```

---

## Accessibility

```tsx
<nav aria-label="Breadcrumb">
  <Breadcrumbs>
    <Link href="/" aria-label="Home page">Home</Link>
    <Link href="/products">Products</Link>
    <span aria-current="page">Current Item</span>
  </Breadcrumbs>
</nav>
```

- Wrap in `<nav>` with `aria-label`
- Use `aria-current="page"` on current item
- Links are keyboard navigable

---

## Do's and Don'ts

**Do:**
- Always include Home as first item
- Make all but last item clickable
- Keep labels short
- Use collapse for deep hierarchies

**Don't:**
- Don't link the current page
- Don't use for non-hierarchical navigation
- Don't use more than 5-6 levels without collapsing

---

## Related Components
- [Link](../atoms/link.md) — Navigation links
- [Header](../organisms/header.md) — App header with breadcrumbs
- [SideNavigation](side-navigation.md) — Vertical navigation
