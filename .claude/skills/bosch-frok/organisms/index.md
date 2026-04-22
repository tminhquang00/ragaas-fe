# Organisms

Complex, multi-part components that form major sections of the application interface.

---

## Component List

| Component | File | Description |
|-----------|------|-------------|
| **Header** | [header.md](header.md) | Main app header with logo, search, menu, breadcrumbs |
| **Footer** | [footer.md](footer.md) | App footer with links, copyright |
| **Form** | [form.md](form.md) | Form container with description |
| **LoginForm** | [login-form.md](login-form.md) | Pre-built login form |
| **MinimalHeader** | [minimal-header.md](minimal-header.md) | Simplified header |
| **ContextMenu** | [context-menu.md](context-menu.md) | Right-click menu |

---

## CSS Class Pattern

All organism components use the `.o-` prefix:

```css
.o-header    /* Header */
.o-footer    /* Footer */
.o-form      /* Form container */
```

---

## Quick Import

```tsx
import {
  Header,
  Footer,
  FooterLinks,
  Form,
  LoginForm,
  MinimalHeader,
  ContextMenu
} from '@bosch/react-frok';
```

---

## Common Pattern: Full Page Layout

```tsx
import { Header, Footer, Form, FormField, TextField, Button } from '@bosch/react-frok';

function AppLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        logo={{ href: '/' }}
        searchForm={{ onSubmit: handleSearch }}
        menuTrigger={{}}
        menu={{ children: <MainNavigation /> }}
      />
      
      <main className="e-container" style={{ flex: 1, padding: '2rem 0' }}>
        {children}
      </main>
      
      <Footer
        variation="default"
        copyright={{ children: '© 2024 Bosch' }}
        bottomLinks={{
          items: [
            { label: 'Privacy', href: '/privacy' },
            { label: 'Terms', href: '/terms' }
          ]
        }}
      />
    </div>
  );
}
```
