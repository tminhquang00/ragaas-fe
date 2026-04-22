# TextImage

Layout component for text alongside images.

---

## Import

```tsx
import { TextImage } from '@bosch/react-frok';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `image` | `ReactNode` | - | **Required** — Image element |
| `children` | `ReactNode` | - | Text content |
| `imagePosition` | `'left' \| 'right'` | `'left'` | Image placement |
| `imageWidth` | `string` | `'50%'` | Image column width |
| `verticalAlign` | `'top' \| 'center' \| 'bottom'` | `'top'` | Vertical alignment |
| `reverse` | `boolean` | `false` | Reverse on mobile |
| `className` | `string` | - | Additional CSS classes |

---

## CSS Classes

| Class | Description |
|-------|-------------|
| `.m-text-image` | Base container |
| `.m-text-image__image` | Image column |
| `.m-text-image__content` | Content column |
| `.m-text-image--image-left` | Image on left |
| `.m-text-image--image-right` | Image on right |
| `.m-text-image--align-top` | Top alignment |
| `.m-text-image--align-center` | Center alignment |
| `.m-text-image--align-bottom` | Bottom alignment |

---

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--text-image-gap` | `2rem` | Gap between columns |

---

## Usage Examples

### Basic Text Image
```tsx
<TextImage
  image={<Image img={{ src: '/feature.jpg', alt: 'Feature' }} />}
>
  <h2>Feature Title</h2>
  <p>Feature description text goes here explaining the benefits.</p>
</TextImage>
```

### Image on Right
```tsx
<TextImage
  image={<Image img={{ src: '/product.jpg', alt: 'Product' }} />}
  imagePosition="right"
>
  <h2>Product Overview</h2>
  <p>Detailed product information and specifications.</p>
  <Button mode="primary">Learn More</Button>
</TextImage>
```

### Centered Alignment
```tsx
<TextImage
  image={<Image img={{ src: '/team.jpg', alt: 'Our team' }} />}
  verticalAlign="center"
>
  <h2>Meet Our Team</h2>
  <p>
    Our dedicated team of professionals is committed to 
    delivering excellence in everything we do.
  </p>
</TextImage>
```

### Custom Width
```tsx
<TextImage
  image={<Image img={{ src: '/hero.jpg', alt: 'Hero' }} />}
  imageWidth="60%"
>
  <h3>Smaller Text Column</h3>
  <p>When the image is the focus.</p>
</TextImage>
```

### Alternating Layout
```tsx
const features = [
  { title: 'Feature 1', text: 'Description 1', image: '/f1.jpg' },
  { title: 'Feature 2', text: 'Description 2', image: '/f2.jpg' },
  { title: 'Feature 3', text: 'Description 3', image: '/f3.jpg' }
];

<div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
  {features.map((feature, index) => (
    <TextImage
      key={feature.title}
      image={<Image img={{ src: feature.image, alt: feature.title }} />}
      imagePosition={index % 2 === 0 ? 'left' : 'right'}
    >
      <h2>{feature.title}</h2>
      <p>{feature.text}</p>
    </TextImage>
  ))}
</div>
```

### With Video
```tsx
<TextImage
  image={
    <Video
      src="/demo.mp4"
      poster="/demo-poster.jpg"
    />
  }
  imagePosition="left"
  verticalAlign="center"
>
  <h2>Watch the Demo</h2>
  <p>See how our product works in action.</p>
</TextImage>
```

### Hero Section
```tsx
<Background color="blue">
  <TextImage
    image={
      <Image img={{ src: '/hero-image.png', alt: 'Product screenshot' }} />
    }
    imagePosition="right"
    imageWidth="55%"
    verticalAlign="center"
  >
    <h1 className="-size-xxl highlight">Transform Your Workflow</h1>
    <p className="-size-l" style={{ marginTop: '1rem' }}>
      Powerful tools to help you work smarter, not harder.
    </p>
    <div style={{ marginTop: '2rem' }}>
      <Button mode="primary">Get Started</Button>
      <Button mode="secondary" style={{ marginLeft: '1rem' }}>Learn More</Button>
    </div>
  </TextImage>
</Background>
```

### Testimonial
```tsx
<TextImage
  image={
    <Image 
      img={{ 
        src: customer.avatar, 
        alt: customer.name,
        style: { borderRadius: '50%', width: '150px' }
      }} 
    />
  }
  imageWidth="200px"
  verticalAlign="center"
>
  <blockquote style={{ fontStyle: 'italic', fontSize: '1.25rem' }}>
    "{customer.quote}"
  </blockquote>
  <p className="highlight" style={{ marginTop: '1rem' }}>
    {customer.name}
  </p>
  <p className="-size-s" style={{ color: 'var(--g-gray-50)' }}>
    {customer.title}, {customer.company}
  </p>
</TextImage>
```

---

## Responsive Behavior

On smaller screens, the layout typically stacks vertically:
- Image appears first (or use `reverse` for content first)
- Full-width columns

```tsx
<TextImage
  image={<Image img={{ src: '/mobile.jpg', alt: 'Mobile view' }} />}
  reverse  // Content appears first on mobile
>
  <h2>Mobile First</h2>
  <p>Content before image on small screens.</p>
</TextImage>
```

---

## Do's and Don'ts

**Do:**
- Use meaningful images that support the content
- Alternate image positions for visual interest
- Use appropriate image widths for content balance
- Consider mobile layout

**Don't:**
- Don't use decorative-only images
- Don't make text columns too narrow
- Don't stack too many TextImage sections
- Don't use mismatched image sizes in a series

---

## Related Components
- [Image](../atoms/image.md) — Image component
- [Video](../atoms/video.md) — Video component
- [Tile](../atoms/tile.md) — Card container
- [Background](../atoms/background.md) — Section backgrounds
