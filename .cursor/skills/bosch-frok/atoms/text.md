# Text

Typography component with semantic variants.

---

## Import

```tsx
import { Text } from '@bosch/react-frok';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | Text content |
| `as` | `ElementType` | `'span'` | HTML element to render |
| `className` | `string` | - | Additional CSS classes |
| `...htmlAttrs` | - | - | Standard HTML attributes |

---

## CSS Classes (Typography Utilities)

| Class | Description |
|-------|-------------|
| `.-size-xs` | Extra small (0.75rem) |
| `.-size-s` | Small (0.875rem) |
| `.-size-m` | Medium (1rem) - default |
| `.-size-l` | Large (1.25rem) |
| `.-size-xl` | Extra large (1.5rem) |
| `.-size-xxl` | Double extra large (2rem) |
| `.highlight` | Bold weight |
| `.-line-height-s` | Tight line height (1.2) |
| `.-line-height-m` | Normal line height (1.5) |
| `.-line-height-l` | Loose line height (1.8) |

---

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--g-gray-10` | `#1a1d21` | Primary text color |
| `--g-gray-50` | `#525f6b` | Secondary text color |
| `--g-gray-65` | `#8a9097` | Muted text color |
| `--g-blue-50` | `#007bc0` | Link/accent color |

---

## Usage Examples

### Basic Text
```tsx
<Text>Default text content</Text>
```

### Size Variants
```tsx
<Text className="-size-xs">Extra small text</Text>
<Text className="-size-s">Small text</Text>
<Text className="-size-m">Medium text (default)</Text>
<Text className="-size-l">Large text</Text>
<Text className="-size-xl">Extra large text</Text>
<Text className="-size-xxl">Double extra large text</Text>
```

### Bold/Highlight
```tsx
<Text className="highlight">Bold important text</Text>
<Text className="-size-l highlight">Large bold heading</Text>
```

### Semantic Elements
```tsx
<Text as="p" className="-size-m">
  Rendered as paragraph
</Text>

<Text as="span" className="-size-s">
  Inline span
</Text>

<Text as="strong" className="highlight">
  Strong emphasis
</Text>
```

### Secondary/Muted Text
```tsx
<Text style={{ color: 'var(--g-gray-50)' }}>
  Secondary text with less emphasis
</Text>

<Text style={{ color: 'var(--g-gray-65)' }}>
  Muted helper text
</Text>
```

### Card with Typography
```tsx
<Tile>
  <Text as="h3" className="-size-l highlight">Card Title</Text>
  <Text 
    as="p" 
    className="-size-s" 
    style={{ color: 'var(--g-gray-50)', marginTop: '0.5rem' }}
  >
    Card description with secondary styling
  </Text>
  <Text 
    as="span" 
    className="-size-xs" 
    style={{ color: 'var(--g-gray-65)' }}
  >
    Last updated: 2 hours ago
  </Text>
</Tile>
```

### Page Header
```tsx
<header>
  <Text as="h1" className="-size-xxl highlight">
    Page Title
  </Text>
  <Text 
    as="p" 
    className="-size-m" 
    style={{ color: 'var(--g-gray-50)' }}
  >
    Subtitle or description text
  </Text>
</header>
```

### Truncated Text
```tsx
<Text 
  style={{ 
    overflow: 'hidden', 
    textOverflow: 'ellipsis', 
    whiteSpace: 'nowrap',
    maxWidth: '200px' 
  }}
>
  This is a very long text that will be truncated with ellipsis
</Text>
```

---

## Typography Scale Reference

| Class | Size | Line Height | Use Case |
|-------|------|-------------|----------|
| `-size-xs` | 12px | 1.33 | Labels, captions |
| `-size-s` | 14px | 1.43 | Secondary text |
| `-size-m` | 16px | 1.5 | Body text |
| `-size-l` | 20px | 1.4 | Subheadings |
| `-size-xl` | 24px | 1.33 | Section headings |
| `-size-xxl` | 32px | 1.25 | Page titles |

---

## Do's and Don'ts

**Do:**
- Use semantic `as` prop for accessibility
- Combine size and highlight classes
- Use color variables for consistency

**Don't:**
- Don't use inline styles for standard colors
- Don't skip heading levels
- Don't use `-size-xxl` for body text

---

## Related Components
- [Link](link.md) — Styled links
- [Badge](badge.md) — Status text
