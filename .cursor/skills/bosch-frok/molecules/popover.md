# Popover

Positioned overlay popup for contextual content.

---

## Import

```tsx
import { Popover } from '@bosch/react-frok';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | Trigger element |
| `content` | `ReactNode` | - | **Required** — Popover content |
| `open` | `boolean` | - | Controlled open state |
| `defaultOpen` | `boolean` | `false` | Initial state |
| `onOpenChange` | `(open: boolean) => void` | - | State change handler |
| `position` | `PopoverPosition` | `'bottom'` | Popover position |
| `trigger` | `'click' \| 'hover'` | `'click'` | Open trigger |
| `closeOnClickOutside` | `boolean` | `true` | Close on outside click |
| `className` | `string` | - | Additional CSS classes |

### PopoverPosition Type
```typescript
type PopoverPosition = 
  | 'top' | 'top-start' | 'top-end'
  | 'bottom' | 'bottom-start' | 'bottom-end'
  | 'left' | 'left-start' | 'left-end'
  | 'right' | 'right-start' | 'right-end';
```

---

## CSS Classes

| Class | Description |
|-------|-------------|
| `.m-popover` | Base container |
| `.m-popover__trigger` | Trigger wrapper |
| `.m-popover__content` | Content container |
| `.m-popover__arrow` | Arrow indicator |
| `.m-popover--open` | Open state |
| `.m-popover--top` | Top position |
| `.m-popover--bottom` | Bottom position |
| `.m-popover--left` | Left position |
| `.m-popover--right` | Right position |

---

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--g-gray-100` | `#ffffff` | Background |
| `--g-gray-85` | `#d0d4d8` | Border/arrow |
| `--shadow-elevation-2` | - | Drop shadow |

---

## Usage Examples

### Basic Popover
```tsx
<Popover
  content={
    <div style={{ padding: '1rem' }}>
      <p>Popover content here</p>
    </div>
  }
>
  <Button>Click me</Button>
</Popover>
```

### Different Positions
```tsx
<Popover content={<p>Top content</p>} position="top">
  <Button>Top</Button>
</Popover>

<Popover content={<p>Right content</p>} position="right">
  <Button>Right</Button>
</Popover>

<Popover content={<p>Bottom content</p>} position="bottom">
  <Button>Bottom</Button>
</Popover>

<Popover content={<p>Left content</p>} position="left">
  <Button>Left</Button>
</Popover>
```

### Hover Trigger
```tsx
<Popover
  content={
    <div style={{ padding: '0.5rem' }}>
      Quick preview content
    </div>
  }
  trigger="hover"
  position="top"
>
  <span style={{ cursor: 'pointer' }}>Hover for preview</span>
</Popover>
```

### Controlled Popover
```tsx
const [isOpen, setIsOpen] = useState(false);

<Popover
  content={
    <div style={{ padding: '1rem' }}>
      <p>Controlled content</p>
      <Button onClick={() => setIsOpen(false)}>Close</Button>
    </div>
  }
  open={isOpen}
  onOpenChange={setIsOpen}
>
  <Button onClick={() => setIsOpen(true)}>Open Popover</Button>
</Popover>
```

### Menu Popover
```tsx
<Popover
  content={
    <List>
      <MenuItem label="Edit" icon="edit" onClick={handleEdit} />
      <MenuItem label="Duplicate" icon="copy" onClick={handleDuplicate} />
      <Divider />
      <MenuItem label="Delete" icon="delete" onClick={handleDelete} />
    </List>
  }
  position="bottom-start"
>
  <Button mode="tertiary" icon="more" iconOnly aria-label="More options" />
</Popover>
```

### User Profile Popover
```tsx
<Popover
  content={
    <div style={{ padding: '1rem', width: '250px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Image 
          img={{ src: user.avatar, alt: user.name, width: 48 }} 
        />
        <div>
          <p className="highlight">{user.name}</p>
          <p className="-size-s" style={{ color: 'var(--g-gray-50)' }}>
            {user.email}
          </p>
        </div>
      </div>
      <Divider />
      <List>
        <MenuItem label="Profile" icon="user" link="/profile" />
        <MenuItem label="Settings" icon="settings" link="/settings" />
        <MenuItem label="Sign Out" icon="logout" onClick={handleLogout} />
      </List>
    </div>
  }
  position="bottom-end"
>
  <Button mode="tertiary" icon="user" iconOnly aria-label="User menu" />
</Popover>
```

### Info Popover
```tsx
<span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
  API Rate Limit
  <Popover
    content={
      <div style={{ padding: '1rem', maxWidth: '300px' }}>
        <h4 className="highlight">Rate Limiting</h4>
        <p className="-size-s" style={{ marginTop: '0.5rem' }}>
          API requests are limited to 100 calls per minute per user.
          Exceeding this limit will result in 429 errors.
        </p>
        <Link href="/docs/rate-limits" className="-size-s">
          Learn more
        </Link>
      </div>
    }
    position="right"
    trigger="hover"
  >
    <Icon iconName="info-i" style={{ cursor: 'help' }} />
  </Popover>
</span>
```

---

## Accessibility

```tsx
<Popover
  content={<div id="popover-content">...</div>}
  open={isOpen}
  onOpenChange={setIsOpen}
>
  <Button
    aria-expanded={isOpen}
    aria-haspopup="dialog"
    aria-controls="popover-content"
  >
    Open
  </Button>
</Popover>
```

- Use proper ARIA attributes
- Ensure keyboard accessibility (Escape to close)
- Focus management when opening/closing

---

## Do's and Don'ts

**Do:**
- Keep content focused and concise
- Position to avoid viewport overflow
- Close on outside click for clarity
- Use for contextual actions/info

**Don't:**
- Don't use for primary navigation
- Don't nest popovers
- Don't use for critical information alone
- Don't make too large (use Dialog instead)

---

## Related Components
- [Tooltip](../atoms/tooltip.md) — Simple hover tips
- [ContextMenu](../organisms/context-menu.md) — Right-click menu
- [Dialog](dialog.md) — Modal overlay
