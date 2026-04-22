# Design System Overview

The Bosch FROK design system uses a two-layer token architecture:

1. **Color Gradations** (`--g-{color}-{level}`) — Raw color palette with 7 colors × 21 levels = 147 tokens
2. **Semantic Tokens** (`--{category}-{variant}__{state}__{interaction}__{property}`) — 300+ state-aware tokens for interactive components

## Source Packages

| Package | Purpose |
|---|---|
| `@bosch/bdds.tokens-npm` | JSON token definitions, compiled to CSS variables |
| `@bosch/frontend.kit-npm` | SCSS mixins, typography classes, component CSS |
| `@bosch/react-frok` | React components consuming the tokens |

## Token Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ Color Gradations (raw palette)                              │
│ --g-blue-50, --g-gray-80, --g-red-50, etc.                 │
└─────────────────────────┬───────────────────────────────────┘
                          │ referenced by
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ Semantic Tokens (component states)                          │
│ --accent-major__enabled__default__fill: var(--g-blue-50)   │
│ --signal-error-major__enabled__default__fill: var(--g-red) │
└─────────────────────────┬───────────────────────────────────┘
                          │ consumed by
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ FROK Components                                             │
│ <Button mode="primary"> uses --accent-major__*              │
│ <Notification variant="error"> uses --signal-error-*        │
└─────────────────────────────────────────────────────────────┘
```

## Files in This Folder

| File | Contents |
|---|---|
| [color-gradations.md](color-gradations.md) | Full palette: gray, blue, red, green, yellow, purple, turquoise (147 tokens) |
| [semantic-tokens.md](semantic-tokens.md) | State tokens with light/dark mode values side-by-side (300+ tokens) |
| [typography.md](typography.md) | Font sizes, weights, line-heights, text style classes |
| [spacing.md](spacing.md) | Padding, margin, gap patterns used across components |
| [shadows-motion.md](shadows-motion.md) | Box-shadow tokens, transition timing, animation patterns |

## Quick Token Access

### Primary Colors
```css
--g-blue-50: #007bc0;   /* Brand blue / accent */
--g-red-50: #ed0007;    /* Error / danger */
--g-green-50: #00884a;  /* Success */
--g-yellow-85: #ffcf00; /* Warning */
--g-gray-50: #71767c;   /* Neutral / base */
```

### Button Background Tokens
```css
/* Primary */
--accent-major__enabled__default__fill: #007bc0;
--accent-major__enabled__hovered__fill: #00629a;
--accent-major__enabled__pressed__fill: #004975;
--accent-major__disabled__default__fill: #e0e2e5;

/* Secondary */
--accent-minor__enabled__default__fill: #d1e4ff;
--accent-minor__enabled__hovered__fill: #9dc9ff;

/* Tertiary / Ghost */
--accent-pure__enabled__default__fill: transparent;
--accent-pure__enabled__hovered__fill: #d1e4ff;
```

### Error/Success Signal Tokens
```css
/* Error */
--signal-error-major__enabled__default__fill: #ed0007;
--signal-error-minor__enabled__default__fill: #ffd9d9;

/* Success */
--signal-success-major__enabled__default__fill: #00884a;
--signal-success-minor__enabled__default__fill: #b8efc9;
```

## Theme Switching

Apply theme classes to containers:

```tsx
// Light mode (default)
<div className="-light-mode">...</div>

// Dark mode
<div className="-dark-mode">...</div>

// High contrast
<div className="-contrast">...</div>

// Primary/secondary schemes
<div className="-primary">...</div>
<div className="-secondary">...</div>
```

## CSS Class Prefixes (Atomic Design)

| Prefix | Category | Example |
|--------|----------|---------|
| `.a-` | **Atoms** | `.a-button`, `.a-icon`, `.a-toggle` |
| `.m-` | **Molecules** | `.m-dialog`, `.m-table`, `.m-popover` |
| `.o-` | **Organisms** | `.o-header`, `.o-footer` |
| `.e-` | **Elements/Layout** | `.e-container` |

## How to Override Tokens

### Global Override (all instances)
```css
:root {
  --accent-major__enabled__default__fill: #custom-color;
}
```

### Scoped Override (specific container)
```css
.my-custom-section {
  --accent-major__enabled__default__fill: #custom-color;
}
```

### Component-Level Override
```tsx
<Button 
  mode="primary" 
  style={{ '--accent-major__enabled__default__fill': '#custom' } as React.CSSProperties}
>
  Custom Button
</Button>
```
