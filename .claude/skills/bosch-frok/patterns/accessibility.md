# Accessibility

ARIA patterns, keyboard navigation, and accessibility best practices for FROK components.

---

## Core Principles

1. **Semantic HTML** — Use FROK components which render correct semantic elements
2. **Keyboard Navigation** — All interactive elements are focusable and operable
3. **Screen Reader Support** — Meaningful labels and ARIA attributes
4. **Color Contrast** — Tokens meet WCAG AA contrast ratios
5. **Focus Indicators** — Visible focus rings on all interactive elements

---

## ARIA Patterns by Component

### Button
```tsx
// Standard button - no extra ARIA needed
<Button mode="primary">Save</Button>

// Icon-only button - requires aria-label
<Button mode="tertiary" icon="close" iconOnly aria-label="Close dialog" />

// Loading state
<Button mode="primary" aria-busy={isLoading} disabled={isLoading}>
  {isLoading ? 'Saving...' : 'Save'}
</Button>
```

### Icon
```tsx
// Informative icon - needs label
<Icon iconName="warning" aria-label="Warning" />

// Decorative icon - hide from screen readers
<Button mode="primary">
  <Icon iconName="add" aria-hidden />
  Add Item
</Button>
```

### Dialog
```tsx
// Dialog has built-in ARIA attributes
<Dialog
  title="Confirm Delete"  // Becomes aria-labelledby
  open={isOpen}
  onOpenChange={setIsOpen}
>
  {/* Focus trapped inside when open */}
</Dialog>
```

### Form Fields
```tsx
// FormField associates label automatically
<FormField label="Email" required>
  <TextField 
    type="email" 
    aria-describedby={error ? 'email-error' : undefined}
  />
</FormField>

// Error message with ID for aria-describedby
{error && <span id="email-error" role="alert">{error}</span>}
```

### Toggle
```tsx
// Toggle uses role="switch" automatically
<Toggle 
  id="notifications"
  leftLabel="Enable Notifications"
  aria-describedby="notification-hint"
/>
<span id="notification-hint" className="-size-s">
  Receive alerts about new messages
</span>
```

### Notification
```tsx
// Use role="alert" for important messages
<Notification variant="error" title="Error" role="alert">
  Failed to save changes.
</Notification>

// Use role="status" for non-critical updates
<Notification variant="success" role="status">
  Changes saved.
</Notification>
```

### ActivityIndicator
```tsx
// Loading states need announcements
<div aria-live="polite" aria-busy={isLoading}>
  {isLoading ? (
    <ActivityIndicator aria-label="Loading" />
  ) : (
    <div>Content loaded</div>
  )}
</div>
```

---

## Keyboard Navigation

### Focus Order
FROK components follow natural DOM order. Ensure logical tab sequence:

```tsx
// Good - logical order
<FormField label="Name">
  <TextField />  {/* Tab order 1 */}
</FormField>
<FormField label="Email">
  <TextField />  {/* Tab order 2 */}
</FormField>
<Button mode="primary">Submit</Button>  {/* Tab order 3 */}
```

### Escape Key
- Dialogs close on Escape (unless `closeOnEscape={false}`)
- Dropdowns close on Escape
- Focus returns to trigger element

### Arrow Keys
- Dropdown options: Up/Down to navigate
- Tab navigation: Left/Right between tabs
- Radio buttons: Arrow keys to select

---

## Focus Management

### Focus Ring
All interactive elements show visible focus:
```css
/* Built into FROK components */
outline: 2px solid var(--g-blue-50);
outline-offset: 2px;
```

### Focus Trap (Dialogs)
```tsx
// Dialog automatically traps focus
<Dialog open={isOpen}>
  <TextField />  {/* Focus cycles within */}
  <Button>OK</Button>
</Dialog>
```

### Skip Links
Add skip link for keyboard users:
```tsx
<a href="#main-content" className="skip-link">
  Skip to main content
</a>
<Header />
<main id="main-content">
  {/* Content */}
</main>

// CSS
.skip-link {
  position: absolute;
  left: -9999px;
  &:focus {
    left: 0;
    z-index: 9999;
  }
}
```

---

## Color Contrast

FROK tokens meet WCAG AA (4.5:1 for text):

| Token | Foreground | Background | Ratio |
|-------|------------|------------|-------|
| `--plain-pure__*__front` | `#000000` | `#ffffff` | 21:1 ✓ |
| `--accent-major__*__front` | `#ffffff` | `#007bc0` | 4.5:1 ✓ |
| `--signal-error-major__*__front` | `#ffffff` | `#ed0007` | 4.5:1 ✓ |

### Testing Contrast
```tsx
// High contrast mode for users who need it
<div className="-contrast">
  {/* Increased contrast throughout */}
</div>
```

---

## Screen Reader Testing

### VoiceOver (macOS)
- `Cmd + F5` to enable
- `Tab` to navigate
- `Ctrl + Option + Space` to activate

### NVDA (Windows)
- `Insert + Q` to read current element
- `Tab` to navigate
- `Enter/Space` to activate

### Announcements
```tsx
// Live regions for dynamic content
<div aria-live="polite">
  {status}  {/* Announced when changed */}
</div>

// Assertive for errors
<div aria-live="assertive" role="alert">
  {error}  {/* Interrupts to announce */}
</div>
```

---

## Checklist

### Interactive Elements
- [ ] All buttons have visible labels or aria-label
- [ ] Icon-only buttons have aria-label
- [ ] Form fields have associated labels
- [ ] Error messages linked via aria-describedby
- [ ] Loading states announced

### Navigation
- [ ] Logical tab order
- [ ] Skip link provided
- [ ] Focus visible on all elements
- [ ] Escape closes modals/dropdowns

### Content
- [ ] Headings in logical order (h1 → h2 → h3)
- [ ] Images have alt text
- [ ] Color alone doesn't convey meaning
- [ ] Contrast meets WCAG AA

---

## Do's and Don'ts

**Do:**
- Use FROK components (they have ARIA built-in)
- Provide aria-label for icon-only buttons
- Test with keyboard only
- Test with screen reader
- Use semantic heading hierarchy

**Don't:**
- Don't remove focus outlines
- Don't use color alone for status
- Don't rely on hover-only interactions
- Don't use tabindex > 0
- Don't trap keyboard focus (except dialogs)
