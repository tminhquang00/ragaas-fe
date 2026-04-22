# List & MenuItem

List container and menu item components for navigation and selection menus.

---

## Import

```tsx
import { List, MenuItem, MenuItemGroup } from '@bosch/react-frok';
```

---

## List Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `'dot' \| 'num' \| 'check'` | `'dot'` | Bullet style for static lists |
| `items` | `string[]` | - | Simple list items (alternative to children) |
| `children` | `ReactNode` | - | MenuItem children |
| `className` | `string` | - | Additional CSS classes |

## MenuItem Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | **Required** — Item text |
| `icon` | `string` | - | Leading icon name |
| `iconRight` | `string` | - | Trailing icon |
| `link` | `string` | - | Navigation URL |
| `onClick` | `() => void` | - | Click handler |
| `disabled` | `boolean` | `false` | Disable item |
| `selected` | `boolean` | `false` | Selected state |
| `children` | `ReactNode` | - | Submenu items |
| `className` | `string` | - | Additional CSS classes |

## MenuItemGroup Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Group heading |
| `children` | `ReactNode` | - | MenuItem children |

---

## CSS Classes

| Class | Description |
|-------|-------------|
| `.a-list` | Base list container |
| `.a-list--dot` | Bullet list |
| `.a-list--num` | Numbered list |
| `.a-list--check` | Checkmark list |
| `.a-menu-item` | Menu item |
| `.a-menu-item__label` | Item text |
| `.a-menu-item__icon` | Item icon |
| `.a-menu-item__icon--right` | Trailing icon |
| `.a-menu-item--selected` | Selected state |
| `.a-menu-item--disabled` | Disabled state |
| `.a-menu-item-group` | Group container |
| `.a-menu-item-group__label` | Group heading |

---

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--nested-minor__enabled__default__fill` | `#ffffff` | Item background |
| `--nested-minor__enabled__hovered__fill` | `#eff1f2` | Item hover |
| `--nested-major__enabled__default__fill` | `#007bc0` | Selected background |
| `--nested-major__enabled__default__front` | `#ffffff` | Selected text |
| `--g-gray-50` | `#525f6b` | Icon color |

---

## Usage Examples

### Simple Bullet List
```tsx
<List type="dot" items={['Item 1', 'Item 2', 'Item 3']} />
```

### Numbered List
```tsx
<List type="num" items={['First step', 'Second step', 'Third step']} />
```

### Checkmark List
```tsx
<List type="check" items={['Feature A', 'Feature B', 'Feature C']} />
```

### Navigation Menu
```tsx
<List>
  <MenuItem label="Dashboard" icon="home" link="/" />
  <MenuItem label="Projects" icon="folder" link="/projects" />
  <MenuItem label="Settings" icon="settings" link="/settings" />
</List>
```

### With Selected Item
```tsx
<List>
  <MenuItem label="Overview" selected />
  <MenuItem label="Analytics" />
  <MenuItem label="Reports" />
</List>
```

### With Click Handlers
```tsx
<List>
  <MenuItem 
    label="New Project" 
    icon="add" 
    onClick={() => openNewProjectDialog()} 
  />
  <MenuItem 
    label="Import" 
    icon="upload" 
    onClick={() => openImportDialog()} 
  />
</List>
```

### Grouped Menu
```tsx
<List>
  <MenuItemGroup label="Main">
    <MenuItem label="Dashboard" icon="home" />
    <MenuItem label="Projects" icon="folder" />
  </MenuItemGroup>
  <MenuItemGroup label="Settings">
    <MenuItem label="Profile" icon="user" />
    <MenuItem label="Preferences" icon="settings" />
  </MenuItemGroup>
</List>
```

### With Submenu
```tsx
<List>
  <MenuItem label="File" icon="file">
    <MenuItem label="New" onClick={handleNew} />
    <MenuItem label="Open" onClick={handleOpen} />
    <MenuItem label="Save" onClick={handleSave} />
  </MenuItem>
  <MenuItem label="Edit" icon="edit">
    <MenuItem label="Undo" onClick={handleUndo} />
    <MenuItem label="Redo" onClick={handleRedo} />
  </MenuItem>
</List>
```

### With Icons and Right Arrow
```tsx
<List>
  <MenuItem 
    label="More Options" 
    icon="settings" 
    iconRight="chevron-right"
    onClick={() => showMoreOptions()}
  />
</List>
```

---

## Accessibility

```tsx
<nav aria-label="Main navigation">
  <List role="menu">
    <MenuItem 
      label="Home" 
      role="menuitem"
      aria-current={isHomePage ? 'page' : undefined}
    />
  </List>
</nav>
```

- Menu items are keyboard navigable
- Use `aria-current` for current page
- Use semantic `<nav>` wrapper when appropriate

---

## Do's and Don'ts

**Do:**
- Use icons consistently across menu items
- Group related items with MenuItemGroup
- Highlight current/selected item
- Keep menu items concise

**Don't:**
- Don't mix static lists with interactive menus
- Don't deeply nest submenus
- Don't use for single actions (use Button)

---

## Related Components
- [SideNavigation](../molecules/side-navigation.md) — Full sidebar nav
- [ContextMenu](../organisms/context-menu.md) — Right-click menu
- [Dropdown](dropdown.md) — Select menu
