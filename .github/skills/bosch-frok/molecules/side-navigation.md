# SideNavigation

Vertical navigation menu with hierarchical structure.

---

## Import

```tsx
import { 
  SideNavigation,
  SideNavigationHeader,
  SideNavigationBody,
  SideNavigationGroup,
  SideNavigationItem
} from '@bosch/react-frok';
```

---

## Props

### SideNavigation Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | Header, Body, and content |
| `collapsed` | `boolean` | `false` | Collapsed (icon-only) state |
| `onCollapseChange` | `(collapsed: boolean) => void` | - | Collapse toggle handler |
| `className` | `string` | - | Additional CSS classes |

### SideNavigationItem Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | **Required** — Item text |
| `icon` | `string` | - | Item icon |
| `link` | `string` | - | Navigation URL |
| `onClick` | `() => void` | - | Click handler |
| `selected` | `boolean` | `false` | Selected state |
| `disabled` | `boolean` | `false` | Disabled state |
| `badge` | `number \| string` | - | Badge counter |
| `children` | `ReactNode` | - | Nested items |

### SideNavigationGroup Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Group heading |
| `collapsible` | `boolean` | `false` | Allow collapse |
| `defaultCollapsed` | `boolean` | `false` | Initial collapsed state |
| `children` | `ReactNode` | - | SideNavigationItem children |

---

## CSS Classes

| Class | Description |
|-------|-------------|
| `.m-side-navigation` | Base container |
| `.m-side-navigation--collapsed` | Collapsed state |
| `.m-side-navigation__header` | Header section |
| `.m-side-navigation__body` | Body section |
| `.m-side-navigation__group` | Item group |
| `.m-side-navigation__group-label` | Group heading |
| `.m-side-navigation__item` | Navigation item |
| `.m-side-navigation__item--selected` | Selected state |
| `.m-side-navigation__item--disabled` | Disabled state |
| `.m-side-navigation__item-icon` | Item icon |
| `.m-side-navigation__item-label` | Item label |
| `.m-side-navigation__badge` | Badge counter |

---

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--g-gray-100` | `#ffffff` | Background |
| `--g-gray-95` | `#eff1f2` | Hover background |
| `--g-blue-90` | `#d1e4ff` | Selected background |
| `--g-blue-50` | `#007bc0` | Selected accent |
| `--g-gray-85` | `#d0d4d8` | Border color |

---

## Usage Examples

### Basic Side Navigation
```tsx
<SideNavigation>
  <SideNavigationBody>
    <SideNavigationItem label="Dashboard" icon="home" link="/" selected />
    <SideNavigationItem label="Projects" icon="folder" link="/projects" />
    <SideNavigationItem label="Reports" icon="chart" link="/reports" />
    <SideNavigationItem label="Settings" icon="settings" link="/settings" />
  </SideNavigationBody>
</SideNavigation>
```

### With Groups
```tsx
<SideNavigation>
  <SideNavigationBody>
    <SideNavigationGroup label="Main">
      <SideNavigationItem label="Dashboard" icon="home" link="/" />
      <SideNavigationItem label="Projects" icon="folder" link="/projects" />
    </SideNavigationGroup>
    
    <SideNavigationGroup label="Analytics">
      <SideNavigationItem label="Reports" icon="chart" link="/reports" />
      <SideNavigationItem label="Metrics" icon="analytics" link="/metrics" />
    </SideNavigationGroup>
    
    <SideNavigationGroup label="Settings">
      <SideNavigationItem label="Profile" icon="user" link="/profile" />
      <SideNavigationItem label="Preferences" icon="settings" link="/preferences" />
    </SideNavigationGroup>
  </SideNavigationBody>
</SideNavigation>
```

### Collapsible Navigation
```tsx
const [collapsed, setCollapsed] = useState(false);

<SideNavigation
  collapsed={collapsed}
  onCollapseChange={setCollapsed}
>
  <SideNavigationHeader>
    <Button 
      mode="tertiary" 
      icon={collapsed ? 'menu' : 'close'}
      iconOnly
      onClick={() => setCollapsed(!collapsed)}
      aria-label={collapsed ? 'Expand menu' : 'Collapse menu'}
    />
  </SideNavigationHeader>
  <SideNavigationBody>
    <SideNavigationItem label="Dashboard" icon="home" link="/" />
    <SideNavigationItem label="Projects" icon="folder" link="/projects" />
  </SideNavigationBody>
</SideNavigation>
```

### With Badges
```tsx
<SideNavigation>
  <SideNavigationBody>
    <SideNavigationItem label="Inbox" icon="mail" badge={12} link="/inbox" />
    <SideNavigationItem label="Tasks" icon="checklist" badge={5} link="/tasks" />
    <SideNavigationItem label="Notifications" icon="bell" badge="99+" link="/notifications" />
  </SideNavigationBody>
</SideNavigation>
```

### Nested Items
```tsx
<SideNavigation>
  <SideNavigationBody>
    <SideNavigationItem label="Products" icon="box">
      <SideNavigationItem label="All Products" link="/products" />
      <SideNavigationItem label="Categories" link="/products/categories" />
      <SideNavigationItem label="Inventory" link="/products/inventory" />
    </SideNavigationItem>
    <SideNavigationItem label="Orders" icon="cart">
      <SideNavigationItem label="Active" link="/orders/active" />
      <SideNavigationItem label="Completed" link="/orders/completed" />
    </SideNavigationItem>
  </SideNavigationBody>
</SideNavigation>
```

### With React Router
```tsx
import { useLocation, Link as RouterLink } from 'react-router-dom';

const SideNav = () => {
  const location = useLocation();
  
  return (
    <SideNavigation>
      <SideNavigationBody>
        <SideNavigationItem 
          label="Dashboard" 
          icon="home"
          as={RouterLink}
          to="/"
          selected={location.pathname === '/'}
        />
        <SideNavigationItem 
          label="Projects" 
          icon="folder"
          as={RouterLink}
          to="/projects"
          selected={location.pathname.startsWith('/projects')}
        />
      </SideNavigationBody>
    </SideNavigation>
  );
};
```

### Full Layout
```tsx
<div style={{ display: 'flex', minHeight: '100vh' }}>
  <aside style={{ width: collapsed ? '60px' : '250px', transition: 'width 0.2s' }}>
    <SideNavigation collapsed={collapsed}>
      {/* Navigation content */}
    </SideNavigation>
  </aside>
  <main style={{ flex: 1, padding: '1rem' }}>
    {/* Page content */}
  </main>
</div>
```

---

## Accessibility

```tsx
<nav aria-label="Main navigation">
  <SideNavigation>
    <SideNavigationBody>
      <SideNavigationItem 
        label="Dashboard" 
        icon="home"
        selected
        aria-current="page"
      />
    </SideNavigationBody>
  </SideNavigation>
</nav>
```

- Wrap in `<nav>` with `aria-label`
- Use `aria-current="page"` on selected item
- Ensure keyboard navigation works

---

## Do's and Don'ts

**Do:**
- Use icons for quick recognition
- Group related items
- Show badges for pending items
- Support collapse for more content space

**Don't:**
- Don't nest more than 2 levels deep
- Don't use too many top-level items
- Don't hide critical navigation in collapsed state

---

## Related Components
- [Header](../organisms/header.md) — App header
- [TabNavigation](../atoms/tab-navigation.md) — Horizontal tabs
- [List](../atoms/list.md) — Menu list
