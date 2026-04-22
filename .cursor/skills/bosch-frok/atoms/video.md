# Video

Video player component.

---

## Import

```tsx
import { Video } from '@bosch/react-frok';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | - | **Required** — Video source URL |
| `poster` | `string` | - | Thumbnail image |
| `controls` | `boolean` | `true` | Show video controls |
| `autoPlay` | `boolean` | `false` | Auto-play video |
| `muted` | `boolean` | `false` | Mute audio |
| `loop` | `boolean` | `false` | Loop playback |
| `width` | `number \| string` | - | Video width |
| `height` | `number \| string` | - | Video height |
| `className` | `string` | - | Additional CSS classes |

---

## CSS Classes

| Class | Description |
|-------|-------------|
| `.a-video` | Base container |
| `.a-video__player` | Video element |
| `.a-video__poster` | Poster overlay |

---

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--g-gray-10` | `#1a1d21` | Controls background |

---

## Usage Examples

### Basic Video
```tsx
<Video
  src="/videos/intro.mp4"
  poster="/videos/intro-thumb.jpg"
/>
```

### Auto-Play Background Video
```tsx
<Video
  src="/videos/hero-bg.mp4"
  autoPlay
  muted
  loop
  controls={false}
/>
```

### With Dimensions
```tsx
<Video
  src="/videos/tutorial.mp4"
  poster="/videos/tutorial-thumb.jpg"
  width={640}
  height={360}
/>
```

### Hero Section with Video
```tsx
<section style={{ position: 'relative' }}>
  <Video
    src="/videos/hero.mp4"
    autoPlay
    muted
    loop
    controls={false}
    style={{ width: '100%', height: '500px', objectFit: 'cover' }}
  />
  <div style={{
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
    color: 'white'
  }}>
    <h1 className="-size-xxl highlight">Welcome</h1>
    <Button mode="primary">Get Started</Button>
  </div>
</section>
```

### Tutorial Video
```tsx
<Tile>
  <Video
    src="/tutorials/getting-started.mp4"
    poster="/tutorials/getting-started-thumb.jpg"
  />
  <div style={{ padding: '1rem' }}>
    <h3>Getting Started Tutorial</h3>
    <p className="-size-s" style={{ color: 'var(--g-gray-50)' }}>
      Duration: 5:30
    </p>
  </div>
</Tile>
```

### Video Gallery
```tsx
const VideoGallery = ({ videos }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
    {videos.map(video => (
      <div key={video.id}>
        <Video
          src={video.url}
          poster={video.thumbnail}
        />
        <Text className="-size-s" style={{ marginTop: '0.5rem' }}>
          {video.title}
        </Text>
      </div>
    ))}
  </div>
);
```

### Controlled Video
```tsx
const VideoPlayer = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div>
      <Video
        ref={videoRef}
        src="/videos/demo.mp4"
        controls={false}
      />
      <Button onClick={togglePlay}>
        {isPlaying ? 'Pause' : 'Play'}
      </Button>
    </div>
  );
};
```

---

## Accessibility

```tsx
<Video
  src="/videos/product-demo.mp4"
  poster="/videos/product-demo-thumb.jpg"
  aria-label="Product demonstration video"
>
  <track
    kind="captions"
    src="/videos/product-demo-captions.vtt"
    srcLang="en"
    label="English"
  />
</Video>
```

- Provide captions for audio content
- Don't auto-play with audio
- Ensure controls are keyboard accessible

---

## Do's and Don'ts

**Do:**
- Provide poster images
- Include captions for accessibility
- Mute auto-playing videos
- Use appropriate dimensions

**Don't:**
- Don't auto-play with sound
- Don't use video for simple animations (use CSS)
- Don't block content behind video controls

---

## Related Components
- [Image](image.md) — Static images
- [Lightbox](../molecules/lightbox.md) — Media modal
- [Background](background.md) — Decorative backgrounds
