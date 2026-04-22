# Image

Responsive image component with caption support.

---

## Import

```tsx
import { Image } from '@bosch/react-frok';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `img` | `ImgProps` | - | **Required** — Image properties |
| `caption` | `string` | - | Image caption text |
| `className` | `string` | - | Additional CSS classes |

### ImgProps Type
```typescript
interface ImgProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  loading?: 'lazy' | 'eager';
}
```

---

## CSS Classes

| Class | Description |
|-------|-------------|
| `.a-image` | Base container |
| `.a-image__img` | Image element |
| `.a-image__caption` | Caption text |

---

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--g-gray-50` | `#525f6b` | Caption text color |

---

## Usage Examples

### Basic Image
```tsx
<Image
  img={{
    src: '/photos/example.jpg',
    alt: 'Example image description'
  }}
/>
```

### With Caption
```tsx
<Image
  img={{
    src: '/photos/product.jpg',
    alt: 'Product showcase'
  }}
  caption="Figure 1: Product in use"
/>
```

### With Dimensions
```tsx
<Image
  img={{
    src: '/photos/thumbnail.jpg',
    alt: 'Thumbnail',
    width: 200,
    height: 150
  }}
/>
```

### Lazy Loading
```tsx
<Image
  img={{
    src: '/photos/heavy-image.jpg',
    alt: 'Large photo',
    loading: 'lazy'
  }}
/>
```

### Image Gallery
```tsx
const Gallery = ({ images }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
    {images.map((image, index) => (
      <Image
        key={image.id}
        img={{
          src: image.url,
          alt: image.description,
          loading: index > 6 ? 'lazy' : 'eager'
        }}
        caption={image.title}
      />
    ))}
  </div>
);
```

### Article Image
```tsx
<article>
  <h2>Article Title</h2>
  <Image
    img={{
      src: '/articles/hero.jpg',
      alt: 'Article hero image'
    }}
    caption="Photo credit: John Doe"
  />
  <p>Article content...</p>
</article>
```

### Product Image with Fallback
```tsx
const ProductImage = ({ product }) => {
  const [src, setSrc] = useState(product.imageUrl);
  
  return (
    <Image
      img={{
        src,
        alt: product.name,
        onError: () => setSrc('/placeholder.jpg')
      }}
    />
  );
};
```

### Responsive Image
```tsx
<Image
  img={{
    src: '/photos/responsive.jpg',
    alt: 'Responsive image',
    style: { width: '100%', height: 'auto' }
  }}
/>
```

---

## Accessibility

```tsx
<Image
  img={{
    src: '/photos/chart.png',
    alt: 'Bar chart showing sales growth of 25% in Q4 2023'
  }}
  caption="Quarterly Sales Report"
/>
```

- Always provide descriptive `alt` text
- For decorative images, use `alt=""`
- Caption complements but doesn't replace alt text

---

## Do's and Don'ts

**Do:**
- Provide descriptive alt text
- Use lazy loading for below-fold images
- Include dimensions to prevent layout shift
- Use captions for context

**Don't:**
- Don't use empty alt for informative images
- Don't duplicate alt and caption text
- Don't use images without alt attributes

---

## Related Components
- [Video](video.md) — Video player
- [Lightbox](../molecules/lightbox.md) — Image modal
- [Background](background.md) — Decorative backgrounds
