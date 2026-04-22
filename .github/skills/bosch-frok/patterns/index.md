# Patterns

Cross-cutting concerns and best practices for using FROK components.

---

## Documentation

| Pattern | File | Description |
|---------|------|-------------|
| **Theming** | [theming.md](theming.md) | Light/dark mode switching |
| **Responsive** | [responsive.md](responsive.md) | Breakpoints and mobile patterns |
| **Accessibility** | [accessibility.md](accessibility.md) | ARIA patterns and keyboard navigation |

---

## Quick Reference

### Theme Switching
```tsx
<div className="-dark-mode">
  {/* All children use dark theme */}
</div>
```

### Container
```tsx
<main className="e-container">
  {/* Centered content with max-width */}
</main>
```

### Typography
```tsx
<h1 className="-size-4xl highlight">Page Title</h1>
<p className="-size-m text">Body text.</p>
```
