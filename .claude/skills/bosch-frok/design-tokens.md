# Bosch Design System - Design Tokens

This document defines the design tokens used across all `@bosch/react-frok` components.

## Source Packages
- `@bosch/bdds.tokens-npm` - CSS custom properties (colors, gradations)
- `@bosch/frontend.kit-npm` - SCSS mixins, typography, layout

---

## Color Gradations

### Gray Scale (`--g-gray-*`)
| Token | Value | Usage |
|-------|-------|-------|
| `--g-gray-00` | `#000000` | Pure black |
| `--g-gray-05` | `#101112` | Near black |
| `--g-gray-10` | `#1a1c1d` | Very dark |
| `--g-gray-15` | `#232628` | Dark |
| `--g-gray-20` | `#2e3033` | Dark gray |
| `--g-gray-25` | `#383b3e` | |
| `--g-gray-30` | `#43464a` | |
| `--g-gray-35` | `#4e5256` | |
| `--g-gray-40` | `#595e62` | Medium dark |
| `--g-gray-45` | `#656a6f` | |
| `--g-gray-50` | `#71767c` | Medium |
| `--g-gray-55` | `#7d8389` | |
| `--g-gray-60` | `#8a9097` | |
| `--g-gray-65` | `#979ea4` | |
| `--g-gray-70` | `#a4abb3` | |
| `--g-gray-75` | `#b2b9c0` | |
| `--g-gray-80` | `#c1c7cc` | Light gray |
| `--g-gray-85` | `#d0d4d8` | |
| `--g-gray-90` | `#e0e2e5` | Very light |
| `--g-gray-95` | `#eff1f2` | Near white |
| `--g-gray-100` | `#ffffff` | Pure white |

### Blue Scale (`--g-blue-*`) - Primary Accent
| Token | Value | Usage |
|-------|-------|-------|
| `--g-blue-50` | `#007bc0` | Primary brand blue |
| `--g-blue-40` | `#00629a` | Hover state |
| `--g-blue-30` | `#004975` | Pressed state |
| `--g-blue-90` | `#d1e4ff` | Light fill |
| `--g-blue-95` | `#e8f1ff` | Background tint |

### Red Scale (`--g-red-*`) - Error/Danger
| Token | Value | Usage |
|-------|-------|-------|
| `--g-red-50` | `#ed0007` | Error red |
| `--g-red-55` | `#ff2124` | Error highlight |

### Green Scale (`--g-green-*`) - Success
| Token | Value | Usage |
|-------|-------|-------|
| `--g-green-50` | `#00884a` | Success green |

### Yellow Scale (`--g-yellow-*`) - Warning
| Token | Value | Usage |
|-------|-------|-------|
| `--g-yellow-85` | `#ffcf00` | Warning yellow |

---

## Semantic Color Tokens

### Background Modes
Apply these classes to switch color schemes:
- `.-light-mode` - Light background (default)
- `.-dark-mode` - Dark background
- `.-primary` - Primary scheme
- `.-secondary` - Secondary scheme
- `.-contrast` - High contrast

### Component Token Patterns

All interactive components use this naming pattern:
```
--{category}-{variant}__{state}__{interaction}__{property}
```

**Categories:**
- `base` - Neutral/gray tones
- `accent` - Brand blue tones
- `plain` - Black/white tones
- `integrated` - Interactive integration

**Variants:**
- `major` - Primary filled style
- `minor` - Secondary/bordered style
- `pure` - Transparent/ghost style
- `nested-major` - Nested primary
- `nested-minor` - Nested secondary
- `nested-pure` - Nested ghost

**States:**
- `enabled` - Interactive
- `disabled` - Non-interactive

**Interactions:**
- `default` - Rest state
- `hovered` - Mouse hover
- `pressed` - Active/clicked

**Properties:**
- `fill` - Background color
- `front` - Text/foreground color

### Common Token Examples

#### Button Tokens (Primary)
```css
/* Primary Button */
--accent-major__enabled__default__fill: #007bc0;
--accent-major__enabled__default__front: #ffffff;
--accent-major__enabled__hovered__fill: #00629a;
--accent-major__enabled__hovered__front: #ffffff;
--accent-major__enabled__pressed__fill: #004975;
--accent-major__enabled__pressed__front: #ffffff;
--accent-major__disabled__default__fill: #e0e2e5;
--accent-major__disabled__default__front: #979ea4;
```

#### Button Tokens (Secondary)
```css
/* Secondary Button */
--accent-minor__enabled__default__fill: #d1e4ff;
--accent-minor__enabled__default__front: #000000;
--accent-minor__enabled__hovered__fill: #9dc9ff;
--accent-minor__enabled__pressed__fill: #56b0ff;
```

#### Button Tokens (Tertiary/Ghost)
```css
/* Tertiary Button */
--accent-pure__enabled__default__fill: #ffffff00;
--accent-pure__enabled__default__front: #007bc0;
--accent-pure__enabled__hovered__fill: #d1e4ff;
```

---

## Typography

### Font Family
```css
font-family: boschsans, 'Helvetica Neue', Helvetica, Arial, sans-serif;
```

### Font Sizes
| Class | Usage |
|-------|-------|
| `.-size-6xl` | Hero headlines |
| `.-size-5xl` | Page titles |
| `.-size-4xl` | h1 equivalent |
| `.-size-3xl` | h2 equivalent |
| `.-size-2xl` | h3 equivalent |
| `.-size-xl` | h4 equivalent |
| `.-size-l` | h5 equivalent |
| `.-size-m` | Body text (default) |
| `.-size-sm` | Small body |
| `.-size-s` | Labels, captions |

### Text Styles
| Class | Usage |
|-------|-------|
| `.highlight` | Bold headlines |
| `.text` | Regular body text |
| `.quote` | Blockquotes |
| `.label` | Form labels, buttons |
| `.list-element` | List items |

### Base Typography Values
```css
font-size: 16px;
--font-size: 1rem;
line-height: 1.5;
--line-height: 1.5;
font-weight: 400;
```

---

## Layout

### Container
```css
.e-container {
  width: calc(100% - 2rem);
  max-width: 70.75rem; /* 1132px */
  margin: 0 1rem;
}

.e-container.-full-width {
  width: 100%;
  max-width: unset;
  padding: 0 1rem;
}
```

### Breakpoints
| Name | Min Width |
|------|-----------|
| Desktop | `1152px` |

### Box Sizing
All elements use `box-sizing: border-box`.

---

## CSS Class Conventions

### Atomic Design Prefixes
| Prefix | Category | Example |
|--------|----------|---------|
| `.a-` | Atom | `.a-button`, `.a-icon` |
| `.m-` | Molecule | `.m-dialog`, `.m-popover` |
| `.o-` | Organism | `.o-header`, `.o-footer` |
| `.e-` | Element/Layout | `.e-container` |

### Modifier Pattern
```css
/* Base */
.a-button { }

/* Variant modifiers */
.a-button--primary { }
.a-button--secondary { }
.a-button--tertiary { }

/* State modifiers */
.a-button--disabled { }
.a-button--loading { }

/* Size modifiers */
.a-button--small { }
.a-button--large { }
```

### BEM Elements
```css
.a-button { }
.a-button__label { }
.a-button__icon { }
```

---

## Using Design Tokens

### In React Components
```tsx
import '@bosch/frontend.kit-npm/dist/frontend-kit.css';

// Tokens are automatically available via CSS custom properties
<div style={{ color: 'var(--accent-major__enabled__default__fill)' }}>
  Blue text
</div>
```

### Theme Switching
```tsx
// Apply dark mode to a section
<div className="-dark-mode">
  <Button mode="primary">Dark Mode Button</Button>
</div>

// Apply contrast mode
<div className="-contrast">
  <Button mode="primary">High Contrast Button</Button>
</div>
```

### Custom Theming
Override CSS variables at the root or component level:
```css
:root {
  /* Override primary accent color */
  --accent-major__enabled__default__fill: #custom-color;
}
```

---

## Brand Assets

### Bosch Logo
- Brand symbol: `--brand-symbol: #000000`
- Brand text (red): `--brand-text: #ed0007`

### Shadows
- Floating outline: `--floating-outline: #0000000d`
- Shadow fill: `--shadow-fill: #00000026`
