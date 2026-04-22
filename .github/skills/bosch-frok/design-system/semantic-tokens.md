# Semantic Tokens

State-aware tokens for interactive components. Automatically respond to theme context (light/dark mode).

**Naming Pattern:** `--{category}-{variant}__{state}__{interaction}__{property}`

---

## Token Structure

| Part | Values | Description |
|------|--------|-------------|
| **Category** | `base`, `accent`, `plain`, `integrated`, `emphasis-{color}`, `signal-{status}` | Semantic purpose |
| **Variant** | `major`, `minor`, `pure`, `nested-major`, `nested-minor`, `nested-pure` | Visual weight |
| **State** | `enabled`, `disabled` | Interactivity |
| **Interaction** | `default`, `hovered`, `pressed` | User action |
| **Property** | `fill`, `front` | Background or foreground |

---

## Base Tokens (Neutral Gray)

For neutral/gray-toned components.

### Light Mode vs Dark Mode

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--base-major__enabled__default__fill` | `#71767c` | `#71767c` | Neutral button bg |
| `--base-major__enabled__default__front` | `#ffffff` | `#ffffff` | Neutral button text |
| `--base-major__enabled__hovered__fill` | `#595e62` | `#8a9097` | Hover state |
| `--base-major__enabled__pressed__fill` | `#43464a` | `#a4abb3` | Pressed state |
| `--base-major__disabled__default__fill` | `#e0e2e5` | `#383b3e` | Disabled bg |
| `--base-major__disabled__default__front` | `#979ea4` | `#656a6f` | Disabled text |
| | | | |
| `--base-minor__enabled__default__fill` | `#e0e2e5` | `#383b3e` | Secondary neutral bg |
| `--base-minor__enabled__default__front` | `#000000` | `#ffffff` | Secondary text |
| `--base-minor__enabled__hovered__fill` | `#c1c7cc` | `#43464a` | |
| `--base-minor__enabled__pressed__fill` | `#a4abb3` | `#4e5256` | |
| | | | |
| `--base-pure__enabled__default__fill` | `transparent` | `transparent` | Ghost neutral bg |
| `--base-pure__enabled__default__front` | `#71767c` | `#a4abb3` | Ghost text |
| `--base-pure__enabled__hovered__fill` | `#e0e2e5` | `#383b3e` | |

---

## Accent Tokens (Primary Blue)

For primary actions (buttons, links, focus indicators).

### Light Mode vs Dark Mode

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--accent-major__enabled__default__fill` | `#007bc0` | `#007bc0` | **Primary button bg** |
| `--accent-major__enabled__default__front` | `#ffffff` | `#ffffff` | Primary button text |
| `--accent-major__enabled__hovered__fill` | `#00629a` | `#0096e8` | Hover state |
| `--accent-major__enabled__pressed__fill` | `#004975` | `#36a8ff` | Pressed state |
| `--accent-major__disabled__default__fill` | `#e0e2e5` | `#383b3e` | Disabled |
| `--accent-major__disabled__default__front` | `#979ea4` | `#656a6f` | |
| | | | |
| `--accent-minor__enabled__default__fill` | `#d1e4ff` | `#001d33` | **Secondary button bg** |
| `--accent-minor__enabled__default__front` | `#000000` | `#7ebdff` | Secondary text |
| `--accent-minor__enabled__hovered__fill` | `#9dc9ff` | `#002742` | |
| `--accent-minor__enabled__pressed__fill` | `#56b0ff` | `#003253` | |
| | | | |
| `--accent-pure__enabled__default__fill` | `transparent` | `transparent` | **Tertiary button bg** |
| `--accent-pure__enabled__default__front` | `#007bc0` | `#7ebdff` | Tertiary text |
| `--accent-pure__enabled__hovered__fill` | `#d1e4ff` | `#001d33` | |

---

## Plain Tokens (Black/White)

For high-contrast, stark styling.

### Light Mode vs Dark Mode

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--plain-major__enabled__default__fill` | `#000000` | `#ffffff` | Black/white button |
| `--plain-major__enabled__default__front` | `#ffffff` | `#000000` | Contrast text |
| `--plain-major__enabled__hovered__fill` | `#2e3033` | `#e0e2e5` | |
| `--plain-major__enabled__pressed__fill` | `#595e62` | `#c1c7cc` | |
| | | | |
| `--plain-minor__enabled__default__fill` | `#eff1f2` | `#232628` | Light/dark subtle bg |
| `--plain-minor__enabled__default__front` | `#000000` | `#ffffff` | |
| | | | |
| `--plain-pure__enabled__default__fill` | `transparent` | `transparent` | Ghost black/white |
| `--plain-pure__enabled__default__front` | `#000000` | `#ffffff` | |
| `--plain-pure__enabled__hovered__fill` | `#e0e2e5` | `#383b3e` | |

---

## Integrated Tokens

For components that blend with their container, transitioning to accent on hover.

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--integrated-major__enabled__default__fill` | `#000000` | `#ffffff` | Starts black/white |
| `--integrated-major__enabled__hovered__fill` | `#00629a` | `#0096e8` | Transitions to blue |
| `--integrated-major__enabled__pressed__fill` | `#007bc0` | `#36a8ff` | |
| | | | |
| `--integrated-pure__enabled__default__fill` | `transparent` | `transparent` | Ghost integrated |
| `--integrated-pure__enabled__hovered__fill` | `#d1e4ff` | `#001d33` | Blue tint on hover |

---

## Signal Tokens (Status Indicators)

### Error (Red)

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--signal-error-major__enabled__default__fill` | `#ed0007` | `#ed0007` | Error button/badge |
| `--signal-error-major__enabled__default__front` | `#ffffff` | `#ffffff` | |
| `--signal-error-major__enabled__hovered__fill` | `#be0004` | `#ff5152` | |
| `--signal-error-major__enabled__pressed__fill` | `#920002` | `#ff7171` | |
| | | | |
| `--signal-error-minor__enabled__default__fill` | `#ffd9d9` | `#4c0000` | Light error bg |
| `--signal-error-minor__enabled__default__front` | `#000000` | `#ffb2b2` | |
| | | | |
| `--signal-error-pure__enabled__default__fill` | `transparent` | `transparent` | Text-only error |
| `--signal-error-pure__enabled__default__front` | `#ed0007` | `#ff9d9d` | |

### Success (Green)

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--signal-success-major__enabled__default__fill` | `#00884a` | `#00884a` | Success button/badge |
| `--signal-success-major__enabled__default__front` | `#ffffff` | `#ffffff` | |
| `--signal-success-major__enabled__hovered__fill` | `#006c3a` | `#37a264` | |
| | | | |
| `--signal-success-minor__enabled__default__fill` | `#b8efc9` | `#001e0e` | Light success bg |
| `--signal-success-minor__enabled__default__front` | `#000000` | `#86d7a2` | |
| | | | |
| `--signal-success-pure__enabled__default__front` | `#00884a` | `#72ca92` | Text-only success |

### Warning (Yellow)

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--signal-warning-major__enabled__default__fill` | `#ffcf00` | `#ffcf00` | Warning badge |
| `--signal-warning-major__enabled__default__front` | `#000000` | `#000000` | Black text |
| `--signal-warning-major__enabled__hovered__fill` | `#deb300` | `#eec100` | |
| | | | |
| `--signal-warning-minor__enabled__default__fill` | `#ffdf95` | `#3c2e00` | Light warning bg |
| `--signal-warning-minor__enabled__default__front` | `#000000` | `#ffdf95` | |
| | | | |
| `--signal-warning-pure__enabled__default__front` | `#8f7300` | `#eec100` | Text-only warning |

### Note (Blue/Info)

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--signal-note-major__enabled__default__fill` | `#007bc0` | `#007bc0` | Info badge |
| `--signal-note-major__enabled__default__front` | `#ffffff` | `#ffffff` | |
| | | | |
| `--signal-note-minor__enabled__default__fill` | `#d1e4ff` | `#001d33` | Light info bg |
| `--signal-note-minor__enabled__default__front` | `#000000` | `#7ebdff` | |

### Neutral (Gray)

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--signal-neutral-major__enabled__default__fill` | `#71767c` | `#71767c` | Neutral badge |
| `--signal-neutral-minor__enabled__default__fill` | `#e0e2e5` | `#383b3e` | Light neutral bg |

---

## Emphasis Color Tokens

Color-specific tokens for non-semantic color use (categorization, tags, etc.).

### Blue (`--emphasis-blue-*`)
Same as accent tokens.

### Gray (`--emphasis-gray-*`)
Same as base tokens.

### Green (`--emphasis-green-*`)

| Token | Light Mode | Usage |
|-------|------------|-------|
| `--emphasis-green-major__enabled__default__fill` | `#00884a` | Green bg |
| `--emphasis-green-minor__enabled__default__fill` | `#b8efc9` | Light green bg |
| `--emphasis-green-pure__enabled__default__front` | `#00884a` | Green text |

### Purple (`--emphasis-purple-*`)

| Token | Light Mode | Usage |
|-------|------------|-------|
| `--emphasis-purple-major__enabled__default__fill` | `#9e2896` | Purple bg |
| `--emphasis-purple-minor__enabled__default__fill` | `#f0dcee` | Light purple bg |
| `--emphasis-purple-pure__enabled__default__front` | `#9e2896` | Purple text |

### Turquoise (`--emphasis-turquoise-*`)

| Token | Light Mode | Usage |
|-------|------------|-------|
| `--emphasis-turquoise-major__enabled__default__fill` | `#18837e` | Turquoise bg |
| `--emphasis-turquoise-minor__enabled__default__fill` | `#b6ede8` | Light turquoise bg |
| `--emphasis-turquoise-pure__enabled__default__front` | `#18837e` | Turquoise text |

---

## Nested Tokens

For components inside colored containers (e.g., buttons inside a blue card).

| Token | Light Mode | Usage |
|-------|------------|-------|
| `--accent-nested-major__enabled__default__fill` | `#ffffff` | White button on blue bg |
| `--accent-nested-major__enabled__default__front` | `#007bc0` | Blue text |
| `--accent-nested-minor__enabled__default__fill` | `#00629a` | Darker blue button |
| `--accent-nested-minor__enabled__default__front` | `#ffffff` | White text |
| `--accent-nested-pure__enabled__default__front` | `#ffffff` | White ghost text |

---

## Global Utility Tokens

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--background` | `#ffffff` | `#1a1c1d` | Page background |
| `--brand-symbol` | `#000000` | `#ffffff` | Bosch logo color |
| `--brand-text` | `#ed0007` | `#ed0007` | Bosch red text |
| `--floating-outline` | `#0000000d` | `#ffffff0d` | Subtle borders |
| `--shadow-fill` | `#00000026` | `#00000040` | Drop shadows |

---

## Usage with FROK Components

### Button Modes → Token Categories

| Button Mode | Token Category |
|-------------|----------------|
| `mode="primary"` | `--accent-major__*` |
| `mode="secondary"` | `--accent-minor__*` |
| `mode="tertiary"` | `--accent-pure__*` |
| `mode="integrated"` | `--integrated-*` |

### Notification Variants → Signal Tokens

| Notification Variant | Token Category |
|----------------------|----------------|
| `variant="error"` | `--signal-error-*` |
| `variant="success"` | `--signal-success-*` |
| `variant="warning"` | `--signal-warning-*` |
| `variant="note"` | `--signal-note-*` |

### Badge Variants → Signal Tokens

| Badge Variant | Token Category |
|---------------|----------------|
| `variant="error"` | `--signal-error-*` |
| `variant="success"` | `--signal-success-*` |
| `variant="warning"` | `--signal-warning-*` |
| `variant="info"` | `--signal-note-*` |

---

## Overriding Tokens

### Custom Primary Color
```css
:root {
  --accent-major__enabled__default__fill: #yourcolor;
  --accent-major__enabled__hovered__fill: #yourdarkercolor;
  --accent-major__enabled__pressed__fill: #yourdarkestcolor;
}
```

### Custom Component Theme
```tsx
<div style={{
  '--accent-major__enabled__default__fill': '#custom',
  '--accent-major__enabled__default__front': '#white'
} as React.CSSProperties}>
  <Button mode="primary">Custom Themed</Button>
</div>
```
