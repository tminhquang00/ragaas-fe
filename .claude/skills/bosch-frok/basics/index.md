# Basics

Foundation components for page structure and layout.

---

## Component List

| Component | File | Description |
|-----------|------|-------------|
| **Layout** | [layout.md](layout.md) | Page layout with header, sidebar, content, footer |

---

## Quick Import

```tsx
import {
  Layout,
  LayoutHeader,
  LayoutContent,
  LayoutFooter
} from '@bosch/react-frok';
```

---

## CSS Class Pattern

Basics components use the `.e-` prefix (elements):

```css
.e-layout         /* Base layout */
.e-layout__header /* Header section */
.e-layout__content /* Content area */
.e-layout__sidebar /* Sidebar */
.e-layout__footer /* Footer section */
.e-container      /* Centered container */
```

---

## Common Patterns

### Full Page Layout
```tsx
<Layout>
  <LayoutHeader>
    <Header logo={{ href: '/' }} />
  </LayoutHeader>
  
  <LayoutContent
    sidebar={<SideNavigation />}
    sidebarWidth="250px"
  >
    <div style={{ padding: '2rem' }}>
      {/* Page content */}
    </div>
  </LayoutContent>
  
  <LayoutFooter>
    <Footer copyright="© 2024 Company" />
  </LayoutFooter>
</Layout>
```

### Minimal Layout
```tsx
<Layout>
  <LayoutHeader>
    <MinimalHeader 
      logo={{ src: '/logo.svg', alt: 'App' }}
      backLink={{ label: 'Exit', onClick: handleExit }}
    />
  </LayoutHeader>
  
  <LayoutContent>
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      {/* Centered content */}
    </div>
  </LayoutContent>
</Layout>
```
