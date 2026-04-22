# Theming

Light/dark mode switching and color scheme management.

---

## Theme Classes

Apply these classes to any container to switch color schemes:

| Class | Description |
|-------|-------------|
| `.-light-mode` | Light theme (default) |
| `.-dark-mode` | Dark theme |
| `.-contrast` | High contrast accessibility mode |
| `.-primary` | Primary color scheme |
| `.-secondary` | Secondary color scheme |

---

## Usage

### Full Page Dark Mode
```tsx
<div className="-dark-mode" style={{ minHeight: '100vh' }}>
  <Header />
  <main>Content in dark mode</main>
  <Footer />
</div>
```

### Section-Level Theming
```tsx
<main className="-light-mode">
  <section>Light content</section>
  
  <section className="-dark-mode">
    {/* This section is dark */}
    <h2>Dark Section</h2>
    <Button mode="primary">Still works</Button>
  </section>
  
  <section>Back to light</section>
</main>
```

### Dynamic Theme Toggle
```tsx
const [isDark, setIsDark] = useState(false);

<div className={isDark ? '-dark-mode' : '-light-mode'}>
  <Toggle 
    id="theme"
    leftLabel="Dark Mode"
    checked={isDark}
    onChange={(e) => setIsDark(e.target.checked)}
  />
  
  <div>Content adapts to theme</div>
</div>
```

---

## How Tokens Respond

All semantic tokens automatically adjust based on theme class:

| Light Mode | Dark Mode |
|------------|-----------|
| `--background: #ffffff` | `--background: #1a1c1d` |
| `--accent-major__enabled__default__fill: #007bc0` | `--accent-major__enabled__default__fill: #007bc0` |
| `--plain-pure__enabled__default__front: #000000` | `--plain-pure__enabled__default__front: #ffffff` |

Components using these tokens adapt automatically.

---

## High Contrast Mode

For accessibility compliance:

```tsx
<div className="-contrast">
  {/* Increased contrast, thicker borders */}
</div>
```

---

## Persisting Theme Preference

```tsx
// Save preference
localStorage.setItem('theme', isDark ? 'dark' : 'light');

// Load preference
useEffect(() => {
  const saved = localStorage.getItem('theme');
  setIsDark(saved === 'dark');
}, []);

// Respect system preference
useEffect(() => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  if (!localStorage.getItem('theme')) {
    setIsDark(mediaQuery.matches);
  }
}, []);
```

---

## Custom Theme Override

Override tokens at root or container level:

```css
/* Custom brand color */
.-my-brand {
  --accent-major__enabled__default__fill: #ff6600;
  --accent-major__enabled__hovered__fill: #e55a00;
  --accent-major__enabled__pressed__fill: #cc5000;
}
```

```tsx
<div className="-light-mode -my-brand">
  <Button mode="primary">Orange Button</Button>
</div>
```

---

## Do's and Don'ts

**Do:**
- Apply theme class to a high-level container
- Test all components in both light and dark modes
- Respect user's system preference by default
- Provide a toggle for manual override

**Don't:**
- Don't apply theme to `:root` (use container classes)
- Don't mix theme classes on same element
- Don't hardcode colors — use tokens
- Don't forget to test contrast mode for accessibility
