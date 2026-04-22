# Link

Styled anchor component with multiple visual variants.

---

## Import

```tsx
import { Link } from '@bosch/react-frok';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `href` | `string` | - | **Required** — Navigation URL |
| `level` | `'simple' \| 'primary' \| 'integrated' \| 'inline'` | `'simple'` | Visual variant |
| `icon` | `string` | - | Icon name |
| `iconPosition` | `'left' \| 'right'` | `'left'` | Icon placement |
| `disabled` | `boolean` | `false` | Disable interaction |
| `external` | `boolean` | `false` | Open in new tab |
| `children` | `ReactNode` | - | Link text |
| `as` | `ElementType` | `'a'` | Render as different element |
| `className` | `string` | - | Additional CSS classes |

---

## CSS Classes

| Class | Description |
|-------|-------------|
| `.a-link` | Base link styles |
| `.a-link--simple` | Simple underlined link |
| `.a-link--primary` | Primary button-like link |
| `.a-link--integrated` | Integrated/subtle link |
| `.a-link--inline` | Inline with text |
| `.a-link__icon` | Icon element |
| `.a-link__icon--left` | Left-positioned icon |
| `.a-link__icon--right` | Right-positioned icon |
| `.a-link--disabled` | Disabled state |

---

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--g-blue-50` | `#007bc0` | Link text color |
| `--g-blue-40` | `#0062a0` | Hover color |
| `--nested-major__enabled__default__fill` | `#007bc0` | Primary background |
| `--nested-major__enabled__default__front` | `#ffffff` | Primary text |
| `--nested-minor__disabled__default__front` | `#8a9097` | Disabled color |

---

## Usage Examples

### Simple Link
```tsx
<Link href="/about">About Us</Link>
```

### Primary Link (Button-Like)
```tsx
<Link href="/signup" level="primary">
  Get Started
</Link>
```

### Integrated Link
```tsx
<Link href="/settings" level="integrated">
  Settings
</Link>
```

### Inline Link
```tsx
<p>
  Read our <Link href="/terms" level="inline">terms of service</Link> for more information.
</p>
```

### With Icon
```tsx
<Link href="/download" icon="download">
  Download PDF
</Link>

<Link href="/next" icon="arrow-right" iconPosition="right">
  Next Page
</Link>
```

### External Link
```tsx
<Link href="https://example.com" external>
  Visit External Site
</Link>
```

### With React Router
```tsx
import { Link as RouterLink } from 'react-router-dom';

<Link as={RouterLink} to="/dashboard" level="primary">
  Go to Dashboard
</Link>
```

### Navigation List
```tsx
<nav>
  <Link href="/" icon="home">Home</Link>
  <Link href="/products" icon="folder">Products</Link>
  <Link href="/contact" icon="mail">Contact</Link>
</nav>
```

### Disabled Link
```tsx
<Link href="/premium" disabled>
  Premium Features (Coming Soon)
</Link>
```

### Back Link
```tsx
<Link href="/list" icon="arrow-left">
  Back to List
</Link>
```

### Download Link
```tsx
<Link 
  href="/files/report.pdf" 
  icon="download"
  download
>
  Download Report
</Link>
```

---

## Accessibility

```tsx
<Link 
  href="https://external.com" 
  external
  aria-label="Visit external site (opens in new tab)"
>
  External Link
</Link>
```

- External links should indicate new tab behavior
- Use descriptive link text
- Avoid "click here" or "read more" alone

```tsx
{/* Good */}
<Link href="/pricing">View pricing details</Link>

{/* Avoid */}
<Link href="/pricing">Click here</Link>
```

---

## Do's and Don'ts

**Do:**
- Use descriptive link text
- Indicate external links visually
- Use `level="inline"` within paragraphs
- Use `level="primary"` for call-to-action

**Don't:**
- Don't use for actions (use Button)
- Don't use generic text like "click here"
- Don't disable links without reason

---

## Related Components
- [Button](button.md) — Actions without navigation
- [MenuItem](list.md) — Menu navigation
- [Breadcrumbs](../molecules/breadcrumbs.md) — Navigation path
