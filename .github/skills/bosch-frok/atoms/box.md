# Box

Container component with modal/popup capabilities.

---

## Import

```tsx
import { Box } from '@bosch/react-frok';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | Box content |
| `modal` | `boolean` | `false` | Enable modal behavior |
| `open` | `boolean` | `false` | Visible state (modal mode) |
| `onClose` | `() => void` | - | Close handler (modal mode) |
| `shadow` | `boolean` | `false` | Add drop shadow |
| `className` | `string` | - | Additional CSS classes |

---

## CSS Classes

| Class | Description |
|-------|-------------|
| `.a-box` | Base container |
| `.a-box--modal` | Modal mode |
| `.a-box--open` | Visible state |
| `.a-box--shadow` | With drop shadow |

---

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--g-gray-100` | `#ffffff` | Background color |
| `--g-gray-85` | `#d0d4d8` | Border color |
| `--shadow-elevation-2` | `0 2px 8px rgba(0,0,0,0.15)` | Shadow |

---

## Usage Examples

### Basic Box
```tsx
<Box>
  <p>Content inside a box</p>
</Box>
```

### With Shadow
```tsx
<Box shadow>
  <h3>Card Title</h3>
  <p>Card content with elevation</p>
</Box>
```

### Modal Box
```tsx
const [isOpen, setIsOpen] = useState(false);

<>
  <Button onClick={() => setIsOpen(true)}>Open Box</Button>
  
  <Box
    modal
    open={isOpen}
    onClose={() => setIsOpen(false)}
  >
    <h3>Modal Content</h3>
    <p>This is a modal box</p>
    <Button onClick={() => setIsOpen(false)}>Close</Button>
  </Box>
</>
```

### Dropdown Container
```tsx
<div style={{ position: 'relative' }}>
  <Button onClick={() => setShowMenu(!showMenu)}>
    Menu
  </Button>
  {showMenu && (
    <Box 
      shadow 
      style={{ position: 'absolute', top: '100%', left: 0, zIndex: 10 }}
    >
      <List>
        <MenuItem label="Option 1" onClick={() => handleOption(1)} />
        <MenuItem label="Option 2" onClick={() => handleOption(2)} />
      </List>
    </Box>
  )}
</div>
```

### Info Card
```tsx
<Box shadow style={{ maxWidth: '400px', padding: '1.5rem' }}>
  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
    <Icon iconName="info-i" size="large" />
    <div>
      <h4 className="-size-m highlight">Information</h4>
      <p className="-size-s">Additional details about this feature.</p>
    </div>
  </div>
</Box>
```

---

## Do's and Don'ts

**Do:**
- Use shadow for elevated content
- Use modal mode for popups
- Keep content organized

**Don't:**
- Don't use for complex dialogs (use Dialog)
- Don't nest boxes unnecessarily

---

## Related Components
- [Tile](tile.md) — Card with highlight
- [Dialog](../molecules/dialog.md) — Full modal dialog
- [Popover](../molecules/popover.md) — Positioned popup
