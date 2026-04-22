# Blade

Collapsible side panel for multi-panel layouts.

---

## Import

```tsx
import { Blade } from '@bosch/react-frok';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | - | Panel header title |
| `collapsible` | `boolean` | `false` | Allow collapse/expand |
| `collapsed` | `boolean` | - | Controlled collapsed state |
| `defaultCollapsed` | `boolean` | `false` | Uncontrolled default |
| `onCollapsedChange` | `(collapsed: boolean) => void` | - | State change handler |
| `children` | `ReactNode` | - | Panel content |
| `header` | `ReactNode` | - | Custom header content |
| `footer` | `ReactNode` | - | Footer content |
| `width` | `string \| number` | `'300px'` | Panel width |
| `className` | `string` | - | Additional CSS classes |

---

## CSS Classes

| Class | Description |
|-------|-------------|
| `.c-blade` | Base blade styles |
| `.c-blade__header` | Header container |
| `.c-blade__title` | Title text |
| `.c-blade__collapse-trigger` | Collapse button |
| `.c-blade__content` | Content area |
| `.c-blade__footer` | Footer area |
| `.c-blade--collapsed` | Collapsed state |

---

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--g-gray-100` | `#ffffff` | Background |
| `--g-gray-85` | `#d0d4d8` | Border color |
| `--g-gray-95` | `#eff1f2` | Header background |

---

## Usage Examples

### Basic Blade
```tsx
<Blade title="Details">
  <p>Panel content here</p>
</Blade>
```

### Collapsible Panel
```tsx
<Blade 
  title="Filters" 
  collapsible 
  defaultCollapsed={false}
>
  <FilterForm />
</Blade>
```

### Controlled Collapse
```tsx
const [isCollapsed, setIsCollapsed] = useState(false);

<Blade
  title="Properties"
  collapsible
  collapsed={isCollapsed}
  onCollapsedChange={setIsCollapsed}
>
  <PropertyEditor />
</Blade>
```

### Multi-Panel Layout
```tsx
<div style={{ display: 'flex', height: '100vh' }}>
  {/* Left sidebar */}
  <Blade 
    title="Navigation" 
    collapsible 
    width="250px"
  >
    <SideNavigation />
  </Blade>
  
  {/* Main content */}
  <main style={{ flex: 1, overflow: 'auto' }}>
    <MainContent />
  </main>
  
  {/* Right panel */}
  <Blade 
    title="Properties" 
    collapsible
    defaultCollapsed={true}
    width="350px"
  >
    <PropertyPanel />
  </Blade>
</div>
```

### With Footer Actions
```tsx
<Blade 
  title="Edit Item"
  footer={
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <Button mode="primary">Save</Button>
      <Button mode="secondary">Cancel</Button>
    </div>
  }
>
  <EditForm />
</Blade>
```

### Custom Header
```tsx
<Blade
  header={
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h3 className="-size-l highlight">Settings</h3>
      <Button mode="tertiary" icon="settings" iconOnly />
    </div>
  }
>
  <SettingsContent />
</Blade>
```

### Responsive Collapse
```tsx
const isMobile = useMediaQuery('(max-width: 768px)');

<Blade
  title="Sidebar"
  collapsible
  defaultCollapsed={isMobile}
>
  <Navigation />
</Blade>
```

---

## Do's and Don'ts

**Do:**
- Use for secondary panels alongside main content
- Make collapsible for space efficiency
- Provide meaningful titles
- Consider default collapsed state on mobile

**Don't:**
- Don't nest blades inside blades
- Don't use for main content areas
- Don't make too wide (max ~400px recommended)

---

## Related Components
- [SideNavigation](../molecules/side-navigation.md) — Navigation menu
- [Dialog](../molecules/dialog.md) — Modal overlays
