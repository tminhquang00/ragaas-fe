# Shadows & Motion

Box shadows, transitions, and animation patterns.

---

## Shadow Tokens

### CSS Variables

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--shadow-fill` | `#00000026` | `#00000040` | Drop shadow color |
| `--floating-outline` | `#0000000d` | `#ffffff0d` | Subtle border/outline |

---

## Box Shadow Patterns

### Elevation Levels

```css
/* Level 1 - Subtle (cards, tiles) */
box-shadow: 0 1px 2px var(--shadow-fill);

/* Level 2 - Medium (dropdowns, popovers) */
box-shadow: 0 2px 8px var(--shadow-fill);

/* Level 3 - Elevated (dialogs, modals) */
box-shadow: 0 4px 16px var(--shadow-fill);

/* Level 4 - High (tooltips, floating elements) */
box-shadow: 0 8px 24px var(--shadow-fill);
```

### Component-Specific Shadows

| Component | Shadow |
|-----------|--------|
| Tile (elevated) | `0 2px 8px var(--shadow-fill)` |
| Dropdown menu | `0 2px 8px var(--shadow-fill)` |
| Dialog/Modal | `0 4px 16px var(--shadow-fill)` |
| Tooltip | `0 2px 8px var(--shadow-fill)` |
| Popover | `0 4px 16px var(--shadow-fill)` |

---

## Focus Rings

```css
/* Default focus ring */
outline: 2px solid var(--g-blue-50);
outline-offset: 2px;

/* Focus within a dark container */
outline: 2px solid var(--g-blue-80);
outline-offset: 2px;
```

---

## Transitions

### Standard Durations

| Duration | Value | Use Case |
|----------|-------|----------|
| Fast | `150ms` | Hover states, micro-interactions |
| Normal | `200ms` | **Default** — color changes, visibility |
| Slow | `300ms` | Expanding/collapsing, overlays |
| Slower | `400ms` | Page transitions, large animations |

### Easing Functions

| Easing | Value | Use Case |
|--------|-------|----------|
| Ease Out | `cubic-bezier(0.0, 0, 0.2, 1)` | **Default** — entering elements |
| Ease In | `cubic-bezier(0.4, 0, 1, 1)` | Exiting elements |
| Ease In-Out | `cubic-bezier(0.4, 0, 0.2, 1)` | Moving/transforming elements |
| Linear | `linear` | Progress indicators, loading |

---

## Common Transition Patterns

### Button Hover
```css
.a-button {
  transition: background-color 150ms ease-out,
              color 150ms ease-out,
              border-color 150ms ease-out;
}
```

### Link Hover
```css
.a-link {
  transition: color 150ms ease-out;
}
```

### Accordion Expand
```css
.a-accordion__content {
  transition: max-height 300ms ease-out,
              opacity 200ms ease-out;
}
```

### Dialog Open/Close
```css
.m-dialog {
  transition: opacity 200ms ease-out,
              transform 200ms ease-out;
}

.m-dialog[data-state="closed"] {
  opacity: 0;
  transform: scale(0.95);
}

.m-dialog[data-state="open"] {
  opacity: 1;
  transform: scale(1);
}
```

### Dropdown Menu
```css
.a-dropdown__menu {
  transition: opacity 150ms ease-out,
              transform 150ms ease-out;
}
```

---

## Animation Patterns

### Fade In
```css
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.fade-in {
  animation: fadeIn 200ms ease-out;
}
```

### Slide Down (for accordions, dropdowns)
```css
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-down {
  animation: slideDown 200ms ease-out;
}
```

### Scale In (for dialogs)
```css
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.scale-in {
  animation: scaleIn 200ms ease-out;
}
```

### Spinner
```css
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.a-activity-indicator {
  animation: spin 1s linear infinite;
}
```

---

## Reduced Motion Support

Always respect user preferences:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Usage Examples

### Custom Card with Shadow
```tsx
<div style={{
  backgroundColor: 'var(--g-gray-100)',
  borderRadius: '8px',
  padding: '1.5rem',
  boxShadow: '0 2px 8px var(--shadow-fill)',
  transition: 'box-shadow 200ms ease-out'
}}>
  <h3 className="-size-xl highlight">Card Title</h3>
  <p className="-size-m">Card content</p>
</div>
```

### Interactive Element with Transition
```tsx
<button 
  className="a-button a-button--primary"
  style={{
    transition: 'background-color 150ms ease-out, transform 100ms ease-out'
  }}
  onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
  onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
>
  Click Me
</button>
```

### Loading Overlay
```tsx
<div style={{
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  animation: 'fadeIn 200ms ease-out'
}}>
  <ActivityIndicator />
</div>
```
