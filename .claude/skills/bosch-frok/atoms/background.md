# Background

Decorative background pattern component.

---

## Import

```tsx
import { Background } from '@bosch/react-frok';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `color` | `'purple' \| 'blue' \| 'turquoise' \| 'green'` | `'blue'` | Background color theme |
| `pattern` | `'dots' \| 'lines' \| 'grid' \| 'none'` | `'none'` | Decorative pattern |
| `children` | `ReactNode` | - | Content overlay |
| `className` | `string` | - | Additional CSS classes |

---

## CSS Classes

| Class | Description |
|-------|-------------|
| `.a-background` | Base container |
| `.a-background--purple` | Purple theme |
| `.a-background--blue` | Blue theme |
| `.a-background--turquoise` | Turquoise theme |
| `.a-background--green` | Green theme |
| `.a-background--dots` | Dots pattern |
| `.a-background--lines` | Lines pattern |
| `.a-background--grid` | Grid pattern |

---

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--g-purple-90` | `#e8dff0` | Light purple |
| `--g-blue-90` | `#d1e4ff` | Light blue |
| `--g-turquoise-90` | `#ccf0f5` | Light turquoise |
| `--g-green-90` | `#c8f0dc` | Light green |

---

## Usage Examples

### Basic Background
```tsx
<Background color="blue">
  <div style={{ padding: '2rem' }}>
    <h2>Content on blue background</h2>
  </div>
</Background>
```

### With Pattern
```tsx
<Background color="purple" pattern="dots">
  <div style={{ padding: '3rem', textAlign: 'center' }}>
    <h1>Hero Section</h1>
    <p>Decorative dotted background</p>
  </div>
</Background>
```

### Hero Section
```tsx
<Background color="turquoise" pattern="lines">
  <div style={{ 
    padding: '4rem 2rem', 
    maxWidth: '800px', 
    margin: '0 auto',
    textAlign: 'center' 
  }}>
    <h1 className="-size-xxl highlight">Welcome to Our Platform</h1>
    <p className="-size-l" style={{ marginTop: '1rem' }}>
      Build amazing experiences with our tools
    </p>
    <div style={{ marginTop: '2rem' }}>
      <Button mode="primary">Get Started</Button>
      <Button mode="secondary" style={{ marginLeft: '1rem' }}>Learn More</Button>
    </div>
  </div>
</Background>
```

### Feature Section
```tsx
<Background color="green" pattern="grid">
  <div style={{ padding: '3rem' }}>
    <h2 className="-size-xl highlight" style={{ marginBottom: '2rem' }}>
      Key Features
    </h2>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
      <Tile>
        <Icon iconName="speed" size="large" />
        <h3>Fast</h3>
        <p>Lightning fast performance</p>
      </Tile>
      <Tile>
        <Icon iconName="security" size="large" />
        <h3>Secure</h3>
        <p>Enterprise-grade security</p>
      </Tile>
      <Tile>
        <Icon iconName="scalable" size="large" />
        <h3>Scalable</h3>
        <p>Grows with your needs</p>
      </Tile>
    </div>
  </div>
</Background>
```

### Call-to-Action Banner
```tsx
<Background color="blue">
  <div style={{ 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    padding: '2rem' 
  }}>
    <div>
      <h3 className="-size-l highlight">Ready to get started?</h3>
      <p>Join thousands of users today</p>
    </div>
    <Button mode="primary">Sign Up Free</Button>
  </div>
</Background>
```

### Color Variants
```tsx
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
  <Background color="purple">
    <div style={{ padding: '2rem' }}>Purple theme</div>
  </Background>
  <Background color="blue">
    <div style={{ padding: '2rem' }}>Blue theme</div>
  </Background>
  <Background color="turquoise">
    <div style={{ padding: '2rem' }}>Turquoise theme</div>
  </Background>
  <Background color="green">
    <div style={{ padding: '2rem' }}>Green theme</div>
  </Background>
</div>
```

---

## Do's and Don'ts

**Do:**
- Use for hero sections and CTAs
- Ensure content contrast
- Use patterns sparingly
- Match color to brand/section purpose

**Don't:**
- Don't overlay dark text on dark backgrounds
- Don't use multiple backgrounds close together
- Don't use busy patterns with complex content

---

## Related Components
- [Tile](tile.md) — Card with highlight
- [Box](box.md) — Content container
