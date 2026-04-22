# Layout

Page layout system with header, footer, and content areas.

---

## Import

```tsx
import { Layout, LayoutHeader, LayoutContent, LayoutFooter } from '@bosch/react-frok';
```

---

## Props

### Layout Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | Layout sections |
| `className` | `string` | - | Additional CSS classes |

### LayoutContent Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | Main content |
| `sidebar` | `ReactNode` | - | Sidebar content |
| `sidebarPosition` | `'left' \| 'right'` | `'left'` | Sidebar placement |
| `sidebarWidth` | `string` | `'250px'` | Sidebar width |
| `className` | `string` | - | Additional CSS classes |

---

## CSS Classes

| Class | Description |
|-------|-------------|
| `.e-layout` | Base container |
| `.e-layout__header` | Header section |
| `.e-layout__content` | Content area |
| `.e-layout__sidebar` | Sidebar container |
| `.e-layout__main` | Main content |
| `.e-layout__footer` | Footer section |
| `.e-layout--with-sidebar` | Has sidebar modifier |

---

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--layout-sidebar-width` | `250px` | Sidebar width |
| `--layout-header-height` | `60px` | Header height |
| `--layout-footer-height` | `auto` | Footer height |

---

## Usage Examples

### Basic Layout
```tsx
<Layout>
  <LayoutHeader>
    <Header logo={{ href: '/' }} />
  </LayoutHeader>
  
  <LayoutContent>
    <main>
      {/* Page content */}
    </main>
  </LayoutContent>
  
  <LayoutFooter>
    <Footer copyright="© 2024 Company" />
  </LayoutFooter>
</Layout>
```

### With Sidebar
```tsx
<Layout>
  <LayoutHeader>
    <Header logo={{ href: '/' }} />
  </LayoutHeader>
  
  <LayoutContent
    sidebar={
      <SideNavigation>
        <SideNavigationBody>
          <SideNavigationItem label="Dashboard" icon="home" link="/" />
          <SideNavigationItem label="Projects" icon="folder" link="/projects" />
          <SideNavigationItem label="Settings" icon="settings" link="/settings" />
        </SideNavigationBody>
      </SideNavigation>
    }
    sidebarWidth="250px"
  >
    <div style={{ padding: '1.5rem' }}>
      {/* Page content */}
    </div>
  </LayoutContent>
  
  <LayoutFooter>
    <Footer copyright="© 2024 Company" />
  </LayoutFooter>
</Layout>
```

### Right Sidebar
```tsx
<Layout>
  <LayoutHeader>
    <Header />
  </LayoutHeader>
  
  <LayoutContent
    sidebar={<PropertiesPanel />}
    sidebarPosition="right"
    sidebarWidth="300px"
  >
    <EditorCanvas />
  </LayoutContent>
</Layout>
```

### Collapsible Sidebar
```tsx
const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

<Layout>
  <LayoutHeader>
    <Header 
      actions={
        <Button 
          mode="tertiary" 
          icon="menu" 
          iconOnly
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      }
    />
  </LayoutHeader>
  
  <LayoutContent
    sidebar={
      <SideNavigation collapsed={sidebarCollapsed}>
        {/* Navigation items */}
      </SideNavigation>
    }
    sidebarWidth={sidebarCollapsed ? '60px' : '250px'}
  >
    <div style={{ padding: '1.5rem' }}>
      {children}
    </div>
  </LayoutContent>
</Layout>
```

### Dashboard Layout
```tsx
<Layout>
  <LayoutHeader>
    <Header
      logo={{ src: '/logo.svg', alt: 'Dashboard', href: '/' }}
      searchForm={{
        placeholder: 'Search...',
        onSubmit: handleSearch
      }}
      actions={
        <>
          <Button mode="tertiary" icon="bell" iconOnly badge={3} />
          <Button mode="tertiary" icon="user" iconOnly />
        </>
      }
    />
  </LayoutHeader>
  
  <LayoutContent
    sidebar={<DashboardNavigation />}
    sidebarWidth="240px"
  >
    <div style={{ padding: '2rem' }}>
      <Breadcrumbs>
        <Link href="/">Home</Link>
        <Link href="/analytics">Analytics</Link>
        <span>Overview</span>
      </Breadcrumbs>
      
      <h1 style={{ marginTop: '1rem' }}>Analytics Overview</h1>
      
      <div style={{ marginTop: '2rem' }}>
        {/* Dashboard content */}
      </div>
    </div>
  </LayoutContent>
</Layout>
```

### Full Height Layout
```tsx
<Layout style={{ minHeight: '100vh' }}>
  <LayoutHeader>
    <Header />
  </LayoutHeader>
  
  <LayoutContent style={{ flex: 1 }}>
    <main style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Content fills available space */}
    </main>
  </LayoutContent>
  
  <LayoutFooter>
    <Footer />
  </LayoutFooter>
</Layout>
```

### Minimal Layout (No Sidebar)
```tsx
<Layout>
  <LayoutHeader>
    <MinimalHeader
      logo={{ src: '/logo.svg', alt: 'App' }}
      backLink={{ label: 'Exit', onClick: handleExit }}
    />
  </LayoutHeader>
  
  <LayoutContent>
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '2rem' 
    }}>
      {/* Centered content */}
    </div>
  </LayoutContent>
</Layout>
```

### With Tabs
```tsx
<Layout>
  <LayoutHeader>
    <Header />
    <TabNavigation>
      <TabItem label="Overview" selected />
      <TabItem label="Details" />
      <TabItem label="History" />
    </TabNavigation>
  </LayoutHeader>
  
  <LayoutContent>
    {/* Tab content */}
  </LayoutContent>
</Layout>
```

---

## Responsive Layout

```tsx
const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

useEffect(() => {
  const handleResize = () => setIsMobile(window.innerWidth < 768);
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);

<Layout>
  <LayoutHeader>
    <Header />
  </LayoutHeader>
  
  <LayoutContent
    sidebar={!isMobile && <SideNavigation />}
  >
    <main>
      {isMobile && <MobileNavigation />}
      {children}
    </main>
  </LayoutContent>
</Layout>
```

---

## Do's and Don'ts

**Do:**
- Use consistent layout across pages
- Make content area scrollable
- Support responsive breakpoints
- Keep header/footer sticky when appropriate

**Don't:**
- Don't nest Layout components
- Don't make sidebar too wide
- Don't hide navigation on desktop
- Don't use multiple scrolling areas

---

## Related Components
- [Header](../organisms/header.md) — Site header
- [Footer](../organisms/footer.md) — Site footer
- [SideNavigation](../molecules/side-navigation.md) — Sidebar navigation
- [MinimalHeader](../organisms/minimal-header.md) — Simple header
