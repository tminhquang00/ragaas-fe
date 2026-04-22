# CommandBar

Horizontal toolbar component for context-specific actions.

---

## Import

```tsx
import { CommandBar } from '@bosch/react-frok';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `ReactNode` | - | Left-side content (status text, selection info) |
| `actions` | `ReactNode` | - | Secondary action buttons |
| `mainAction` | `ReactNode` | - | Primary action button (right-aligned) |
| `className` | `string` | - | Additional CSS classes |

---

## CSS Classes

| Class | Description |
|-------|-------------|
| `.c-command-bar` | Base command bar styles |
| `.c-command-bar__content` | Left content area |
| `.c-command-bar__actions` | Actions container |
| `.c-command-bar__main-action` | Primary action container |

---

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--g-gray-95` | `#eff1f2` | Background color |
| `--g-gray-85` | `#d0d4d8` | Border color |

---

## Usage Examples

### Basic Toolbar
```tsx
<CommandBar
  content={<span>3 items selected</span>}
  actions={
    <Button mode="tertiary" icon="delete">Delete</Button>
  }
  mainAction={
    <Button mode="primary">Save</Button>
  }
/>
```

### Selection Actions
```tsx
<CommandBar
  content={
    <span className="-size-s">
      {selectedCount} of {totalCount} selected
    </span>
  }
  actions={
    <>
      <Button mode="tertiary" icon="edit">Edit</Button>
      <Button mode="tertiary" icon="copy">Duplicate</Button>
      <Button mode="tertiary" icon="delete">Delete</Button>
    </>
  }
  mainAction={
    <Button mode="primary" icon="checkmark">
      Apply Changes
    </Button>
  }
/>
```

### Conditional Display
```tsx
{selectedItems.length > 0 && (
  <CommandBar
    content={<span>{selectedItems.length} selected</span>}
    actions={
      <Button 
        mode="tertiary" 
        onClick={() => setSelectedItems([])}
      >
        Clear Selection
      </Button>
    }
    mainAction={
      <Button mode="primary" onClick={handleBulkAction}>
        Process Selected
      </Button>
    }
  />
)}
```

### Sticky Toolbar
```tsx
<div style={{ position: 'sticky', top: 0, zIndex: 10 }}>
  <CommandBar
    content={<span>Editing document</span>}
    mainAction={
      <Button mode="primary" onClick={handleSave}>
        Save Changes
      </Button>
    }
  />
</div>
```

---

## Do's and Don'ts

**Do:**
- Show contextual information in content area
- Use tertiary buttons for secondary actions
- Use primary button for main action
- Show selection count when applicable

**Don't:**
- Don't overcrowd with too many actions
- Don't use for permanent navigation (use Header)
- Don't nest command bars

---

## Related Components
- [Header](../organisms/header.md) — App-level navigation
- [Button](../atoms/button.md) — Action buttons
