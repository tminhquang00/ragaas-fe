# Divider

Horizontal or vertical separator line.

---

## Import

```tsx
import { Divider } from '@bosch/react-frok';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `withinText` | `boolean` | `false` | With text label in center |
| `children` | `ReactNode` | - | Text content (when withinText) |
| `vertical` | `boolean` | `false` | Vertical orientation |
| `className` | `string` | - | Additional CSS classes |

---

## CSS Classes

| Class | Description |
|-------|-------------|
| `.a-divider` | Base horizontal divider |
| `.a-divider--vertical` | Vertical divider |
| `.a-divider--within-text` | With centered text |
| `.a-divider__text` | Text label |

---

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--g-gray-85` | `#d0d4d8` | Line color |
| `--g-gray-50` | `#525f6b` | Text color |

---

## Usage Examples

### Basic Horizontal Divider
```tsx
<p>Section 1 content</p>
<Divider />
<p>Section 2 content</p>
```

### With Text
```tsx
<Divider withinText>OR</Divider>
```

### Login Form with Divider
```tsx
<Form>
  <FormField label="Email">
    <TextField id="email" type="email" />
  </FormField>
  <FormField label="Password">
    <TextField id="password" type="password" />
  </FormField>
  <Button mode="primary" style={{ width: '100%' }}>Sign In</Button>
  
  <Divider withinText>OR</Divider>
  
  <Button mode="secondary" icon="google" style={{ width: '100%' }}>
    Continue with Google
  </Button>
</Form>
```

### Vertical Divider
```tsx
<div style={{ display: 'flex', alignItems: 'center', height: '40px' }}>
  <span>Item A</span>
  <Divider vertical />
  <span>Item B</span>
  <Divider vertical />
  <span>Item C</span>
</div>
```

### Section Separator
```tsx
<article>
  <h2>Introduction</h2>
  <p>Introduction content...</p>
  
  <Divider />
  
  <h2>Main Content</h2>
  <p>Main content...</p>
  
  <Divider />
  
  <h2>Conclusion</h2>
  <p>Conclusion content...</p>
</article>
```

### Menu with Dividers
```tsx
<List>
  <MenuItem label="Edit" icon="edit" />
  <MenuItem label="Duplicate" icon="copy" />
  <Divider />
  <MenuItem label="Move to..." icon="folder" />
  <MenuItem label="Archive" icon="archive" />
  <Divider />
  <MenuItem label="Delete" icon="delete" />
</List>
```

### Toolbar Divider
```tsx
<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
  <Button mode="tertiary" icon="bold" iconOnly />
  <Button mode="tertiary" icon="italic" iconOnly />
  <Button mode="tertiary" icon="underline" iconOnly />
  <Divider vertical />
  <Button mode="tertiary" icon="text-align-left" iconOnly />
  <Button mode="tertiary" icon="text-align-center" iconOnly />
  <Button mode="tertiary" icon="text-align-right" iconOnly />
  <Divider vertical />
  <Button mode="tertiary" icon="list" iconOnly />
</div>
```

---

## Accessibility

```tsx
<Divider role="separator" aria-orientation="horizontal" />

<Divider vertical role="separator" aria-orientation="vertical" />
```

- Use `role="separator"` for semantic meaning
- Decorative dividers don't need ARIA attributes

---

## Do's and Don'ts

**Do:**
- Use to separate content sections
- Use text label for alternatives (OR, AND)
- Use vertical in toolbars

**Don't:**
- Don't overuse dividers
- Don't use where whitespace suffices
- Don't use for layout (use CSS)

---

## Related Components
- [List](list.md) — Menus with dividers
- [Box](box.md) — Container with borders
