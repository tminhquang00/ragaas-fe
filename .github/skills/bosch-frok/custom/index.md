# Custom Components

Specialized components for specific use cases and advanced layouts.

---

## Component List

| Component | File | Description |
|-----------|------|-------------|
| **CommandBar** | [command-bar.md](command-bar.md) | Horizontal toolbar with actions |
| **Blade** | [blade.md](blade.md) | Collapsible side panel |
| **BladeBox** | [blade-box.md](blade-box.md) | Container for managing multiple blades |
| **DataList** | [data-list.md](data-list.md) | List with data display |
| **OverlayActivityIndicator** | [overlay-activity-indicator.md](overlay-activity-indicator.md) | Full-screen loading overlay |

---

## Quick Import

```tsx
import {
  CommandBar,
  Blade,
  BladeBox,
  DataList,
  OverlayActivityIndicator
} from '@bosch/react-frok';
```

---

## Common Patterns

### Toolbar with Actions
```tsx
<CommandBar
  content={<span>3 items selected</span>}
  actions={
    <>
      <Button mode="tertiary" icon="edit">Edit</Button>
      <Button mode="tertiary" icon="delete">Delete</Button>
    </>
  }
  mainAction={
    <Button mode="primary">Save All</Button>
  }
/>
```

### Multi-Panel Layout with Blade
```tsx
<div style={{ display: 'flex', height: '100vh' }}>
  <Blade 
    title="Filters" 
    collapsible 
    defaultCollapsed={false}
    style={{ width: '300px' }}
  >
    <FilterPanel />
  </Blade>
  <main style={{ flex: 1 }}>
    <MainContent />
  </main>
</div>
```

### Loading Overlay
```tsx
{isLoading && (
  <OverlayActivityIndicator 
    text="Loading data..."
  />
)}
```
