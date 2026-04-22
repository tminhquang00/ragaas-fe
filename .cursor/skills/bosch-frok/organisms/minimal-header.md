# MinimalHeader

Simplified header for focused contexts.

---

## Import

```tsx
import { MinimalHeader } from '@bosch/react-frok';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `logo` | `LogoProps` | - | Logo configuration |
| `title` | `string` | - | Page/app title |
| `backLink` | `BackLinkProps` | - | Back navigation |
| `actions` | `ReactNode` | - | Right-side actions |
| `className` | `string` | - | Additional CSS classes |

### LogoProps Type
```typescript
interface LogoProps {
  src: string;
  alt: string;
  href?: string;
}
```

### BackLinkProps Type
```typescript
interface BackLinkProps {
  label: string;
  href?: string;
  onClick?: () => void;
}
```

---

## CSS Classes

| Class | Description |
|-------|-------------|
| `.o-minimal-header` | Base container |
| `.o-minimal-header__logo` | Logo container |
| `.o-minimal-header__title` | Title text |
| `.o-minimal-header__back` | Back link |
| `.o-minimal-header__actions` | Actions container |

---

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--g-gray-100` | `#ffffff` | Background |
| `--g-gray-85` | `#d0d4d8` | Border color |
| `--g-blue-50` | `#007bc0` | Link color |

---

## Usage Examples

### Basic Minimal Header
```tsx
<MinimalHeader
  logo={{ src: '/logo.svg', alt: 'Company', href: '/' }}
  title="Settings"
/>
```

### With Back Link
```tsx
<MinimalHeader
  logo={{ src: '/logo.svg', alt: 'Company' }}
  backLink={{ 
    label: 'Back to Dashboard', 
    href: '/dashboard' 
  }}
  title="Edit Profile"
/>
```

### With Actions
```tsx
<MinimalHeader
  logo={{ src: '/logo.svg', alt: 'Company' }}
  title="Document Editor"
  actions={
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <Button mode="secondary">Cancel</Button>
      <Button mode="primary">Save</Button>
    </div>
  }
/>
```

### Checkout Flow
```tsx
<MinimalHeader
  logo={{ src: '/logo.svg', alt: 'Store' }}
  title="Checkout"
  actions={
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <Icon iconName="lock" />
      <span className="-size-s">Secure Checkout</span>
    </div>
  }
/>
```

### With React Router
```tsx
import { useNavigate } from 'react-router-dom';

const EditPage = () => {
  const navigate = useNavigate();
  
  return (
    <>
      <MinimalHeader
        logo={{ src: '/logo.svg', alt: 'App' }}
        backLink={{ 
          label: 'Back', 
          onClick: () => navigate(-1) 
        }}
        title="Edit Item"
        actions={
          <Button mode="primary" onClick={handleSave}>
            Save Changes
          </Button>
        }
      />
      <main style={{ padding: '2rem' }}>
        {/* Edit form */}
      </main>
    </>
  );
};
```

### Multi-Step Process
```tsx
<MinimalHeader
  logo={{ src: '/logo.svg', alt: 'App' }}
  backLink={{ 
    label: 'Exit Setup', 
    onClick: handleExitSetup 
  }}
  title={
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <span>Account Setup</span>
      <Badge>Step {step} of 3</Badge>
    </div>
  }
/>
```

### Login Page Header
```tsx
<MinimalHeader
  logo={{ 
    src: '/logo.svg', 
    alt: 'Company', 
    href: '/' 
  }}
/>
```

### Modal/Overlay Header
```tsx
<div className="fullscreen-overlay">
  <MinimalHeader
    backLink={{ 
      label: 'Close', 
      onClick: onClose 
    }}
    title="Preview"
    actions={
      <Button mode="primary" icon="download" onClick={handleDownload}>
        Download
      </Button>
    }
  />
  <div className="overlay-content">
    {/* Content */}
  </div>
</div>
```

### Wizard Header
```tsx
<MinimalHeader
  logo={{ src: '/logo.svg', alt: 'App' }}
  title={
    <StepIndicator 
      steps={steps} 
      currentStep={currentStep} 
      small 
    />
  }
  actions={
    <Button 
      mode="tertiary" 
      icon="close" 
      iconOnly
      onClick={handleClose}
      aria-label="Close wizard"
    />
  }
/>
```

---

## Layout Pattern

```tsx
<div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
  <MinimalHeader
    logo={{ src: '/logo.svg', alt: 'App' }}
    title="Focused Task"
    backLink={{ label: 'Exit', onClick: handleExit }}
  />
  
  <main style={{ flex: 1, padding: '2rem' }}>
    {/* Focus content - no sidebar, minimal distractions */}
  </main>
  
  {/* Optional: minimal footer or no footer */}
</div>
```

---

## Accessibility

```tsx
<header role="banner">
  <MinimalHeader
    logo={{ src: '/logo.svg', alt: 'Company home' }}
    backLink={{ 
      label: 'Back to previous page',
      href: '/dashboard'
    }}
    title="Settings"
    aria-label="Page header"
  />
</header>
```

- Back link is keyboard accessible
- Title describes current context
- Actions have accessible labels

---

## When to Use

**Use MinimalHeader when:**
- User is in a focused task (checkout, wizard)
- Full navigation would be distracting
- Context requires quick exit option
- Content needs maximum space

**Use Full Header when:**
- User needs navigation access
- Search functionality required
- Multiple sections available
- Standard app browsing

---

## Do's and Don'ts

**Do:**
- Provide clear exit/back option
- Show progress for multi-step flows
- Keep actions minimal and relevant
- Use for focused user journeys

**Don't:**
- Don't use for primary navigation pages
- Don't add complex menus
- Don't hide the back/exit option
- Don't use when search is needed

---

## Related Components
- [Header](header.md) — Full header with navigation
- [StepIndicator](../molecules/step-indicator.md) — Progress steps
- [Breadcrumbs](../molecules/breadcrumbs.md) — Navigation breadcrumbs
