# ContextMenu

Right-click context menu with nested items.

---

## Import

```tsx
import { ContextMenu, MenuItem, MenuDivider } from '@bosch/react-frok';
```

---

## Props

### ContextMenu Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | Target element |
| `menu` | `ReactNode` | - | **Required** — Menu items |
| `disabled` | `boolean` | `false` | Disable context menu |
| `onOpen` | `() => void` | - | Menu open handler |
| `onClose` | `() => void` | - | Menu close handler |
| `className` | `string` | - | Additional CSS classes |

### MenuItem Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | **Required** — Item text |
| `icon` | `string` | - | Item icon |
| `onClick` | `() => void` | - | Click handler |
| `disabled` | `boolean` | `false` | Disabled state |
| `danger` | `boolean` | `false` | Destructive action style |
| `shortcut` | `string` | - | Keyboard shortcut hint |
| `children` | `ReactNode` | - | Submenu items |

---

## CSS Classes

| Class | Description |
|-------|-------------|
| `.o-context-menu` | Base container |
| `.o-context-menu__overlay` | Backdrop overlay |
| `.o-context-menu__menu` | Menu container |
| `.o-context-menu__item` | Menu item |
| `.o-context-menu__item--disabled` | Disabled state |
| `.o-context-menu__item--danger` | Danger/destructive style |
| `.o-context-menu__item-icon` | Item icon |
| `.o-context-menu__item-label` | Item label |
| `.o-context-menu__item-shortcut` | Shortcut text |
| `.o-context-menu__submenu` | Submenu container |
| `.o-context-menu__divider` | Menu divider |

---

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--g-gray-100` | `#ffffff` | Menu background |
| `--g-gray-95` | `#eff1f2` | Item hover |
| `--g-gray-20` | `#2a2f34` | Text color |
| `--g-gray-50` | `#525f6b` | Shortcut/disabled |
| `--g-red-50` | `#ed0007` | Danger color |
| `--shadow-elevation-3` | - | Menu shadow |

---

## Usage Examples

### Basic Context Menu
```tsx
<ContextMenu
  menu={
    <>
      <MenuItem label="Copy" icon="copy" onClick={handleCopy} />
      <MenuItem label="Cut" icon="cut" onClick={handleCut} />
      <MenuItem label="Paste" icon="paste" onClick={handlePaste} />
      <MenuDivider />
      <MenuItem label="Delete" icon="delete" onClick={handleDelete} danger />
    </>
  }
>
  <div style={{ padding: '2rem', border: '1px dashed var(--g-gray-85)' }}>
    Right-click here
  </div>
</ContextMenu>
```

### With Shortcuts
```tsx
<ContextMenu
  menu={
    <>
      <MenuItem label="Undo" icon="undo" onClick={handleUndo} shortcut="Ctrl+Z" />
      <MenuItem label="Redo" icon="redo" onClick={handleRedo} shortcut="Ctrl+Y" />
      <MenuDivider />
      <MenuItem label="Cut" icon="cut" onClick={handleCut} shortcut="Ctrl+X" />
      <MenuItem label="Copy" icon="copy" onClick={handleCopy} shortcut="Ctrl+C" />
      <MenuItem label="Paste" icon="paste" onClick={handlePaste} shortcut="Ctrl+V" />
    </>
  }
>
  <textarea rows={5} cols={40} />
</ContextMenu>
```

### With Submenu
```tsx
<ContextMenu
  menu={
    <>
      <MenuItem label="New" icon="add">
        <MenuItem label="File" onClick={() => handleNew('file')} />
        <MenuItem label="Folder" onClick={() => handleNew('folder')} />
        <MenuItem label="Project" onClick={() => handleNew('project')} />
      </MenuItem>
      <MenuItem label="Open" icon="folder-open" onClick={handleOpen} />
      <MenuItem label="Save" icon="save" onClick={handleSave} />
      <MenuDivider />
      <MenuItem label="Export" icon="export">
        <MenuItem label="PDF" onClick={() => handleExport('pdf')} />
        <MenuItem label="CSV" onClick={() => handleExport('csv')} />
        <MenuItem label="Excel" onClick={() => handleExport('xlsx')} />
      </MenuItem>
    </>
  }
>
  <div className="document-area">
    {/* Document content */}
  </div>
</ContextMenu>
```

### File List Context Menu
```tsx
const FileItem = ({ file }) => (
  <ContextMenu
    menu={
      <>
        <MenuItem label="Open" icon="external-link" onClick={() => openFile(file)} />
        <MenuItem label="Rename" icon="edit" onClick={() => renameFile(file)} />
        <MenuItem label="Download" icon="download" onClick={() => downloadFile(file)} />
        <MenuDivider />
        <MenuItem label="Properties" icon="info" onClick={() => showProperties(file)} />
        <MenuDivider />
        <MenuItem 
          label="Delete" 
          icon="delete" 
          onClick={() => deleteFile(file)} 
          danger 
        />
      </>
    }
  >
    <div className="file-item">
      <Icon iconName={getFileIcon(file.type)} />
      <span>{file.name}</span>
    </div>
  </ContextMenu>
);
```

### Table Row Context Menu
```tsx
<Table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Status</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {rows.map(row => (
      <ContextMenu
        key={row.id}
        menu={
          <>
            <MenuItem label="View Details" onClick={() => viewDetails(row)} />
            <MenuItem label="Edit" onClick={() => editRow(row)} />
            <MenuDivider />
            <MenuItem label="Delete" onClick={() => deleteRow(row)} danger />
          </>
        }
      >
        <tr>
          <td>{row.name}</td>
          <td>{row.status}</td>
          <td>
            <Button mode="tertiary" icon="more" iconOnly />
          </td>
        </tr>
      </ContextMenu>
    ))}
  </tbody>
</Table>
```

### Canvas Context Menu
```tsx
const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
const [menuVisible, setMenuVisible] = useState(false);
const [selectedElement, setSelectedElement] = useState(null);

const handleContextMenu = (e, element) => {
  e.preventDefault();
  setMenuPosition({ x: e.clientX, y: e.clientY });
  setSelectedElement(element);
  setMenuVisible(true);
};

<div className="canvas" onContextMenu={(e) => handleContextMenu(e, null)}>
  {elements.map(el => (
    <div 
      key={el.id}
      onContextMenu={(e) => {
        e.stopPropagation();
        handleContextMenu(e, el);
      }}
    >
      {/* Element */}
    </div>
  ))}
  
  {menuVisible && (
    <ContextMenu
      style={{ position: 'fixed', left: menuPosition.x, top: menuPosition.y }}
      onClose={() => setMenuVisible(false)}
    >
      {selectedElement ? (
        <>
          <MenuItem label="Edit" onClick={() => edit(selectedElement)} />
          <MenuItem label="Duplicate" onClick={() => duplicate(selectedElement)} />
          <MenuItem label="Delete" onClick={() => remove(selectedElement)} danger />
        </>
      ) : (
        <>
          <MenuItem label="Add Element" onClick={addElement} />
          <MenuItem label="Paste" onClick={paste} disabled={!clipboard} />
        </>
      )}
    </ContextMenu>
  )}
</div>
```

### Conditional Items
```tsx
<ContextMenu
  menu={
    <>
      <MenuItem label="View" icon="eye" onClick={handleView} />
      {canEdit && (
        <MenuItem label="Edit" icon="edit" onClick={handleEdit} />
      )}
      {canShare && (
        <MenuItem label="Share" icon="share" onClick={handleShare} />
      )}
      <MenuDivider />
      {canDelete && (
        <MenuItem label="Delete" icon="delete" onClick={handleDelete} danger />
      )}
    </>
  }
>
  {children}
</ContextMenu>
```

---

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `ArrowDown` | Next item |
| `ArrowUp` | Previous item |
| `ArrowRight` | Open submenu |
| `ArrowLeft` | Close submenu |
| `Enter` | Activate item |
| `Escape` | Close menu |

---

## Accessibility

```tsx
<ContextMenu
  menu={
    <div role="menu" aria-label="Context actions">
      <MenuItem 
        label="Copy" 
        role="menuitem"
        aria-keyshortcuts="Control+C"
      />
    </div>
  }
>
  {children}
</ContextMenu>
```

- Use proper ARIA roles
- Support keyboard navigation
- Announce shortcuts

---

## Do's and Don'ts

**Do:**
- Show keyboard shortcuts
- Use icons for quick recognition
- Group related actions with dividers
- Support keyboard navigation

**Don't:**
- Don't nest more than 2 levels
- Don't have too many items
- Don't hide critical actions only in context menu
- Don't disable the entire menu

---

## Related Components
- [Popover](../molecules/popover.md) — Positioned overlay
- [List](../atoms/list.md) — Menu list
- [Button](../atoms/button.md) — Action triggers
