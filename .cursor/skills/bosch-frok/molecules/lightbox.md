# Lightbox

Image/media viewer modal with navigation.

---

## Import

```tsx
import { Lightbox } from '@bosch/react-frok';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `images` | `LightboxImage[]` | - | **Required** — Array of images |
| `open` | `boolean` | `false` | Open state |
| `onClose` | `() => void` | - | Close handler |
| `startIndex` | `number` | `0` | Initial image index |
| `onIndexChange` | `(index: number) => void` | - | Navigation handler |
| `showThumbnails` | `boolean` | `true` | Show thumbnail strip |
| `showCounter` | `boolean` | `true` | Show "1 of 5" counter |
| `className` | `string` | - | Additional CSS classes |

### LightboxImage Type
```typescript
interface LightboxImage {
  src: string;
  alt: string;
  thumbnail?: string;
  caption?: string;
}
```

---

## CSS Classes

| Class | Description |
|-------|-------------|
| `.m-lightbox` | Base container |
| `.m-lightbox__backdrop` | Dark overlay |
| `.m-lightbox__content` | Image container |
| `.m-lightbox__image` | Main image |
| `.m-lightbox__caption` | Image caption |
| `.m-lightbox__nav` | Navigation buttons |
| `.m-lightbox__nav-prev` | Previous button |
| `.m-lightbox__nav-next` | Next button |
| `.m-lightbox__close` | Close button |
| `.m-lightbox__counter` | Image counter |
| `.m-lightbox__thumbnails` | Thumbnail strip |
| `.m-lightbox__thumbnail` | Individual thumbnail |
| `.m-lightbox__thumbnail--active` | Active thumbnail |

---

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--g-gray-10` | `#1a1d21` | Backdrop color |
| `--g-gray-100` | `#ffffff` | Button/text color |
| `--g-blue-50` | `#007bc0` | Active thumbnail border |

---

## Usage Examples

### Basic Lightbox
```tsx
const [isOpen, setIsOpen] = useState(false);
const [currentIndex, setCurrentIndex] = useState(0);

const images = [
  { src: '/photos/1.jpg', alt: 'Photo 1' },
  { src: '/photos/2.jpg', alt: 'Photo 2' },
  { src: '/photos/3.jpg', alt: 'Photo 3' }
];

<>
  <Button onClick={() => setIsOpen(true)}>View Gallery</Button>
  
  <Lightbox
    images={images}
    open={isOpen}
    onClose={() => setIsOpen(false)}
    startIndex={currentIndex}
    onIndexChange={setCurrentIndex}
  />
</>
```

### With Captions
```tsx
const images = [
  { 
    src: '/photos/sunset.jpg', 
    alt: 'Sunset over mountains',
    caption: 'Beautiful sunset captured in the Alps'
  },
  { 
    src: '/photos/ocean.jpg', 
    alt: 'Ocean waves',
    caption: 'Pacific coast during storm season'
  }
];

<Lightbox
  images={images}
  open={isOpen}
  onClose={handleClose}
/>
```

### With Thumbnails
```tsx
const images = [
  { 
    src: '/photos/full/1.jpg', 
    thumbnail: '/photos/thumb/1.jpg',
    alt: 'Photo 1' 
  },
  { 
    src: '/photos/full/2.jpg', 
    thumbnail: '/photos/thumb/2.jpg',
    alt: 'Photo 2' 
  }
];

<Lightbox
  images={images}
  open={isOpen}
  onClose={handleClose}
  showThumbnails
/>
```

### Gallery Click to Open
```tsx
const Gallery = ({ images }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const openLightbox = (index: number) => {
    setActiveIndex(index);
    setLightboxOpen(true);
  };

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
        {images.map((image, index) => (
          <Image
            key={index}
            img={{
              src: image.thumbnail || image.src,
              alt: image.alt,
              style: { cursor: 'pointer' }
            }}
            onClick={() => openLightbox(index)}
          />
        ))}
      </div>
      
      <Lightbox
        images={images}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        startIndex={activeIndex}
        onIndexChange={setActiveIndex}
      />
    </>
  );
};
```

### Single Image Lightbox
```tsx
<Lightbox
  images={[{ src: product.fullImage, alt: product.name }]}
  open={isOpen}
  onClose={() => setIsOpen(false)}
  showThumbnails={false}
  showCounter={false}
/>
```

### Product Image Gallery
```tsx
const ProductGallery = ({ product }) => {
  const [mainIndex, setMainIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <div>
      {/* Main Image */}
      <div 
        style={{ cursor: 'zoom-in' }}
        onClick={() => setLightboxOpen(true)}
      >
        <Image img={{ src: product.images[mainIndex].src, alt: product.name }} />
      </div>
      
      {/* Thumbnail Strip */}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
        {product.images.map((img, index) => (
          <Image
            key={index}
            img={{
              src: img.thumbnail,
              alt: `View ${index + 1}`,
              style: { 
                width: '60px',
                cursor: 'pointer',
                border: index === mainIndex ? '2px solid var(--g-blue-50)' : 'none'
              }
            }}
            onClick={() => setMainIndex(index)}
          />
        ))}
      </div>
      
      {/* Lightbox */}
      <Lightbox
        images={product.images}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        startIndex={mainIndex}
        onIndexChange={setMainIndex}
      />
    </div>
  );
};
```

---

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `Escape` | Close lightbox |
| `ArrowLeft` | Previous image |
| `ArrowRight` | Next image |
| `Home` | First image |
| `End` | Last image |

---

## Accessibility

```tsx
<Lightbox
  images={images}
  open={isOpen}
  onClose={handleClose}
  aria-label="Image gallery"
/>
```

- Focus trapped inside lightbox
- Escape key closes lightbox
- Images have alt text
- Navigation buttons have aria-labels

---

## Do's and Don'ts

**Do:**
- Provide meaningful alt text
- Use thumbnails for performance
- Support keyboard navigation
- Show loading state for large images

**Don't:**
- Don't open lightbox automatically
- Don't disable close functionality
- Don't use for non-visual content

---

## Related Components
- [Image](../atoms/image.md) — Single image
- [Dialog](dialog.md) — Modal dialog
- [Video](../atoms/video.md) — Video player
