# Typography

Font families, sizes, weights, and text style classes.

---

## Font Family

```css
font-family: boschsans, 'Helvetica Neue', Helvetica, Arial, sans-serif;
```

> **Important**: Do NOT import external fonts. `boschsans` is provided by `@bosch/frontend.kit-npm`.

---

## Font Size Classes

Apply these classes to any text element (`<h1>`, `<p>`, `<span>`, etc.).

| Class | Font Size | Line Height | Use Case |
|-------|-----------|-------------|----------|
| `.-size-6xl` | 3.5rem (56px) | 1.14 | Hero headlines, landing pages |
| `.-size-5xl` | 3rem (48px) | 1.17 | Major page titles |
| `.-size-4xl` | 2.5rem (40px) | 1.2 | `<h1>` equivalent |
| `.-size-3xl` | 2rem (32px) | 1.25 | `<h2>` equivalent |
| `.-size-2xl` | 1.5rem (24px) | 1.33 | `<h3>` equivalent |
| `.-size-xl` | 1.25rem (20px) | 1.4 | `<h4>` equivalent |
| `.-size-l` | 1.125rem (18px) | 1.44 | `<h5>` equivalent, large body |
| `.-size-m` | 1rem (16px) | 1.5 | **Default body text** |
| `.-size-sm` | 0.9375rem (15px) | 1.47 | Slightly smaller body |
| `.-size-s` | 0.875rem (14px) | 1.43 | Labels, captions, secondary text |
| `.-size-xs` | 0.75rem (12px) | 1.33 | Fine print, badges |

---

## Text Style Classes

Apply these for semantic text styling.

| Class | Font Weight | Letter Spacing | Use Case |
|-------|-------------|----------------|----------|
| `.highlight` | 700 (bold) | Normal | Headlines, emphasis, page titles |
| `.text` | 400 (regular) | Normal | Body text, paragraphs |
| `.quote` | 400 | Normal | Blockquotes, testimonials |
| `.label` | 400 | 0.02em | Form labels, button text |
| `.list-element` | 400 | Normal | List items |

---

## Combined Usage

```tsx
// Page title
<h1 className="-size-4xl highlight">Dashboard</h1>

// Section heading
<h2 className="-size-2xl highlight">Recent Activity</h2>

// Body text
<p className="-size-m text">This is regular body text.</p>

// Caption / secondary
<span className="-size-s" style={{ color: 'var(--g-gray-50)' }}>
  Last updated 5 minutes ago
</span>

// Form label
<label className="-size-s label">Email Address</label>
```

---

## Base Typography Values

```css
:root {
  --font-size: 1rem;        /* 16px base */
  --line-height: 1.5;       /* 24px for 16px text */
  font-weight: 400;         /* Regular weight */
  font-size: 16px;          /* Root size */
}
```

---

## Responsive Typography

The system uses `rem` units, so scale by adjusting root font-size:

```css
/* Mobile */
html {
  font-size: 14px;
}

/* Desktop */
@media (min-width: 1152px) {
  html {
    font-size: 16px;
  }
}
```

---

## Font Weight Reference

| Weight | Value | Usage |
|--------|-------|-------|
| Regular | 400 | Body text, labels |
| Bold | 700 | Headlines, emphasis |

> **Note**: Bosch Sans only includes Regular (400) and Bold (700) weights.

---

## Text Color Patterns

### Primary Text
```css
color: var(--plain-pure__enabled__default__front); /* #000000 light / #ffffff dark */
```

### Secondary Text
```css
color: var(--g-gray-50); /* #71767c */
```

### Disabled Text
```css
color: var(--g-gray-65); /* #979ea4 */
```

### Link Text
```css
color: var(--accent-pure__enabled__default__front); /* #007bc0 */
```

### Error Text
```css
color: var(--signal-error-pure__enabled__default__front); /* #ed0007 */
```

---

## Usage Examples

### Page Header
```tsx
<header>
  <h1 className="-size-4xl highlight">Settings</h1>
  <p className="-size-m" style={{ color: 'var(--g-gray-50)' }}>
    Manage your account preferences
  </p>
</header>
```

### Card Title
```tsx
<div className="card">
  <h3 className="-size-xl highlight">Order Summary</h3>
  <p className="-size-m text">Review your items before checkout.</p>
</div>
```

### Data Label & Value
```tsx
<div>
  <span className="-size-s label" style={{ color: 'var(--g-gray-50)' }}>
    Total Amount
  </span>
  <span className="-size-2xl highlight">$1,234.56</span>
</div>
```

---

## Icon Font (Bosch Icons)

Icon fonts are included in `@bosch/frontend.kit-npm`:

| Font | CSS Class Prefix | Icon Count |
|------|------------------|------------|
| Bosch Icon | `boschicon-bosch-ic-` | ~3000 |
| Bosch UI Icon | `boschicon-bosch-ic-ui-` | ~200 |

```tsx
// With FROK Icon component
<Icon iconName="settings" />
<Icon iconName="close" isUiIcon />

// Direct CSS class (not recommended)
<i className="boschicon-bosch-ic-settings" />
```

See `atoms/icon.md` for full icon reference.
