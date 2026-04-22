# BladeBox

Container for managing multiple Blade panels.

---

## Import

```tsx
import { BladeBox, Blade } from '@bosch/react-frok';
```

---

## Props

### BladeBox Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | Blade children |
| `onBladeClose` | `(id: string) => void` | - | Blade close handler |
| `className` | `string` | - | Additional CSS classes |

---

## CSS Classes

| Class | Description |
|-------|-------------|
| `.c-blade-box` | Base container |
| `.c-blade-box__inner` | Scrollable inner area |
| `.c-blade-box--has-blades` | When blades are open |

---

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--g-gray-95` | `#eff1f2` | Background |
| `--blade-transition-duration` | `300ms` | Animation timing |

---

## Usage Examples

### Basic BladeBox
```tsx
const [blades, setBlades] = useState<BladeConfig[]>([]);

const openBlade = (config: BladeConfig) => {
  setBlades(prev => [...prev, config]);
};

const closeBlade = (id: string) => {
  setBlades(prev => prev.filter(b => b.id !== id));
};

<BladeBox onBladeClose={closeBlade}>
  {blades.map(blade => (
    <Blade
      key={blade.id}
      id={blade.id}
      title={blade.title}
      onClose={() => closeBlade(blade.id)}
    >
      {blade.content}
    </Blade>
  ))}
</BladeBox>
```

### Master-Detail Pattern
```tsx
const [selectedItem, setSelectedItem] = useState(null);
const [detailBladeOpen, setDetailBladeOpen] = useState(false);

<div style={{ display: 'flex', height: '100vh' }}>
  {/* Master List */}
  <div style={{ width: '300px', borderRight: '1px solid var(--g-gray-85)' }}>
    <List>
      {items.map(item => (
        <MenuItem
          key={item.id}
          label={item.name}
          selected={selectedItem?.id === item.id}
          onClick={() => {
            setSelectedItem(item);
            setDetailBladeOpen(true);
          }}
        />
      ))}
    </List>
  </div>
  
  {/* Blade Area */}
  <BladeBox>
    {detailBladeOpen && selectedItem && (
      <Blade
        id="detail"
        title={selectedItem.name}
        onClose={() => setDetailBladeOpen(false)}
      >
        <ItemDetail item={selectedItem} />
      </Blade>
    )}
  </BladeBox>
</div>
```

### Multi-Blade Navigation
```tsx
const [bladeStack, setBladeStack] = useState<BladeConfig[]>([
  { id: 'main', title: 'Categories', content: <CategoriesView /> }
]);

const pushBlade = (blade: BladeConfig) => {
  setBladeStack(prev => [...prev, blade]);
};

const popBlade = () => {
  setBladeStack(prev => prev.slice(0, -1));
};

const closeBlade = (id: string) => {
  const index = bladeStack.findIndex(b => b.id === id);
  if (index !== -1) {
    setBladeStack(prev => prev.slice(0, index));
  }
};

<BladeBox onBladeClose={closeBlade}>
  {bladeStack.map((blade, index) => (
    <Blade
      key={blade.id}
      id={blade.id}
      title={blade.title}
      onClose={() => closeBlade(blade.id)}
      width={blade.width || '400px'}
    >
      {React.cloneElement(blade.content, {
        onNavigate: (nextBlade) => pushBlade(nextBlade),
        onBack: popBlade
      })}
    </Blade>
  ))}
</BladeBox>
```

### With Context
```tsx
const BladeContext = createContext<{
  openBlade: (config: BladeConfig) => void;
  closeBlade: (id: string) => void;
}>(null);

const BladeProvider = ({ children }) => {
  const [blades, setBlades] = useState<BladeConfig[]>([]);
  
  const openBlade = (config: BladeConfig) => {
    setBlades(prev => {
      // Replace if same ID exists
      const existing = prev.findIndex(b => b.id === config.id);
      if (existing !== -1) {
        const updated = [...prev];
        updated[existing] = config;
        return updated;
      }
      return [...prev, config];
    });
  };
  
  const closeBlade = (id: string) => {
    setBlades(prev => prev.filter(b => b.id !== id));
  };
  
  return (
    <BladeContext.Provider value={{ openBlade, closeBlade }}>
      {children}
      <BladeBox onBladeClose={closeBlade}>
        {blades.map(blade => (
          <Blade key={blade.id} {...blade} onClose={() => closeBlade(blade.id)}>
            {blade.content}
          </Blade>
        ))}
      </BladeBox>
    </BladeContext.Provider>
  );
};

// Usage in any component
const MyComponent = () => {
  const { openBlade } = useContext(BladeContext);
  
  return (
    <Button onClick={() => openBlade({
      id: 'settings',
      title: 'Settings',
      content: <SettingsPanel />
    })}>
      Open Settings
    </Button>
  );
};
```

### Form Blade
```tsx
<BladeBox>
  <Blade
    id="edit-form"
    title="Edit Item"
    onClose={handleClose}
    footer={
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <Button mode="secondary" onClick={handleClose}>Cancel</Button>
        <Button mode="primary" onClick={handleSave}>Save</Button>
      </div>
    }
  >
    <form>
      <FormField label="Name">
        <TextField value={name} onChange={setName} />
      </FormField>
      <FormField label="Description">
        <Textarea value={description} onChange={setDescription} />
      </FormField>
    </form>
  </Blade>
</BladeBox>
```

### Dashboard with Blades
```tsx
<div style={{ display: 'flex', height: '100vh' }}>
  <SideNavigation>
    {/* Navigation items */}
  </SideNavigation>
  
  <main style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
    {/* Main content */}
    <div style={{ flex: 1, overflow: 'auto', padding: '1rem' }}>
      <DashboardGrid onItemClick={handleItemClick} />
    </div>
    
    {/* Blade panel area */}
    <BladeBox>
      {activeBlade && (
        <Blade
          id={activeBlade.id}
          title={activeBlade.title}
          onClose={() => setActiveBlade(null)}
        >
          {activeBlade.content}
        </Blade>
      )}
    </BladeBox>
  </main>
</div>
```

---

## Blade Stacking Behavior

1. **Single Mode**: Only one blade open at a time
2. **Stack Mode**: Multiple blades stack horizontally
3. **Replace Mode**: New blade replaces existing with same ID

```tsx
// Single mode
const openBlade = (config) => {
  setBlades([config]); // Always one
};

// Stack mode  
const openBlade = (config) => {
  setBlades(prev => [...prev, config]); // Add to stack
};

// Replace mode
const openBlade = (config) => {
  setBlades(prev => {
    const idx = prev.findIndex(b => b.id === config.id);
    if (idx !== -1) {
      const updated = [...prev];
      updated[idx] = config;
      return updated;
    }
    return [...prev, config];
  });
};
```

---

## Do's and Don'ts

**Do:**
- Use for master-detail patterns
- Support closing individual blades
- Save blade state when appropriate
- Use consistent blade widths

**Don't:**
- Don't open too many blades at once
- Don't use for primary content
- Don't make blades too narrow
- Don't nest BladeBox components

---

## Related Components
- [Blade](blade.md) — Individual blade panel
- [Dialog](../molecules/dialog.md) — Modal dialog
- [SideNavigation](../molecules/side-navigation.md) — Navigation
