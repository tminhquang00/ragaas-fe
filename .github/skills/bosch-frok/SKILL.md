---
name: bosch-frok
description: Use this skill whenever working with `@bosch/react-frok` UI components — building UIs, forms, dialogs, navigation, tables, headers, footers, or any Bosch FROK component. Trigger on any mention of Bosch components, react-frok, FROK, Bosch design system, or tasks like "create a Bosch form", "add a dialog", "build a header", "use Bosch components", or any UI task in a project that uses `@bosch/react-frok`. Always use this skill before writing or editing any FROK component code — do not rely on memory alone.
---

# Bosch React FROK — Component Skill

## ⚡ Quick Workflow

**Before writing any component code:**
1. Find the component in the lookup table below
2. `view` the corresponding reference file to read full props, variants, and examples
3. Check `design-tokens.md` for theming, colors, or typography needs

---

## Component → Reference File Lookup

| Component(s) | Reference File |
|---|---|
| `Button`, `Link`, `Icon`, `Sticker`, `ValueModificator` | `references/actions.md` |
| `TextField`, `TextArea`, `Checkbox`, `RadioButton`, `Toggle`, `Slider`, `Rating`, `SelectableTile`, `FormField`, `SearchForm`, `SearchSuggestions`, `ProgressIndicator` | `references/forms.md` |
| `Badge`, `Chip`, `Notification`, `ActivityIndicator`, `StepIndicator` | `references/feedback.md` |
| `Tile`, `Box`, `Divider`, `Layout`, `Form`, `TextImage`, `SideNavigation` | `references/layout.md` |
| `List`, `MenuItem`, `Dropdown`, `TabNavigation`, `PageIndicator`, `Breadcrumbs`, `OptionBar`, `OptionBarItem`, `LanguageSelector` | `references/navigation.md` |
| `Tooltip`, `Popover`, `Accordion`, `Dialog`, `Lightbox`, `Image`, `Table`, `TableHead`, `TableBody`, `TableRow`, `TableCell`, `Background`, `Text`, `Video` | `references/display.md` |
| `Header`, `Footer`, `FooterLinks`, `ContextMenu`, `MinimalHeader`, `LoginForm` | `references/organisms.md` |
| `CommandBar`, `Blade`, `DataList`, `OverlayActivityIndicator` | `references/custom.md` |
| Colors, typography, spacing, semantic tokens, theming | `design-tokens.md` |

---

## Installation

```bash
npm install @bosch/react-frok @bosch/frontend.kit-npm @bosch/bdds.tokens-npm styled-components
```

### Vite Config (required — package uses `style` condition only, not `import`)

```js
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@bosch/frontend.kit-npm/styles/frontend-kit.complete.css": path.resolve(
        __dirname,
        "node_modules/@bosch/frontend.kit-npm/dist/styles/frontend-kit.complete.css"
      ),
    },
  },
})
```

### CSS Import (add to App.tsx or main app component)

**⚠️ IMPORTANT:** Import the CSS in your **App.tsx** (or root app component), NOT in main.tsx:

```tsx
// App.tsx - CORRECT ✅
import '@bosch/frontend.kit-npm/styles/frontend-kit.complete.css';
import ProductListingPage from './ProductListingPage';

function App() {
  return <ProductListingPage />;
}
```

```tsx
// main.tsx - WRONG ❌
// Don't import Bosch CSS here - it won't apply properly
import '@bosch/frontend.kit-npm/styles/frontend-kit.complete.css';  // DON'T DO THIS
```

The CSS must be imported in the same file where your App component is defined, before any component imports.

Available CSS bundles:
- `frontend-kit.complete.css` — All styles (recommended)
- `frontend-kit.foundations.css` — Base tokens only
- `frontend-kit.atoms.css` — Atom components only
- `frontend-kit.molecules.css` — Molecule components only
- `frontend-kit.organisms.css` — Organism components only

---

## Common Patterns

### Primary Button

```tsx
import { Button } from '@bosch/react-frok';
<Button mode="primary" onClick={handleClick}>Submit</Button>
// Modes: 'primary' | 'secondary' | 'tertiary' | 'integrated'
```

### Form with Fields

```tsx
import { Form, FormField, TextField, Button, Checkbox } from '@bosch/react-frok';

<Form description="Login Form">
  <FormField label="Username">
    <TextField name="username" />
  </FormField>
  <FormField label="Password">
    <TextField type="password" name="password" />
  </FormField>
  <FormField>
    <Checkbox label="Remember me" />
  </FormField>
  <Button mode="primary" type="submit">Login</Button>
</Form>
```

### Confirmation Dialog

```tsx
import { Dialog } from '@bosch/react-frok';

<Dialog
  title="Confirm Delete"
  variant="warning"
  open={isOpen}
  onOpenChange={setIsOpen}
  confirmLabel="Delete"
  cancelLabel="Cancel"
  onConfirm={handleDelete}
>
  Are you sure you want to delete this item?
</Dialog>
```

### Tab Navigation

```tsx
import { TabNavigation, Tab } from '@bosch/react-frok';

<TabNavigation defaultValue="overview">
  <Tab value="overview">Overview</Tab>
  <Tab value="details">Details</Tab>
  <Tab value="settings">Settings</Tab>
</TabNavigation>
```

### Icons

```tsx
import { Icon } from '@bosch/react-frok';

<Icon iconName="settings" />               // Bosch icon (3000+ available)
<Icon iconName="close" isUiIcon />         // UI icon
<Icon iconName="info" aria-label="Info" /> // Accessible standalone icon
// Do NOT include the 'boschicon-bosch-ic-' prefix — the component adds it
```

---

## Design Tokens Quick Reference

```css
/* Primary colors */
--g-blue-50: #007bc0;   /* Brand blue */
--g-red-50:  #ed0007;   /* Error */
--g-green-50: #00884a;  /* Success */
--g-yellow-85: #ffcf00; /* Warning */

/* Semantic button tokens */
--accent-major__enabled__default__fill: #007bc0;  /* Primary BG */
--accent-major__enabled__default__front: #ffffff; /* Primary text */

/* Theming */
<div className="-dark-mode">...</div>     /* Dark theme */
<div className="-contrast">...</div>      /* High contrast */
```

See `design-tokens.md` for the full token reference.

---

## CSS Class Conventions

| Prefix | Type | Example |
|--------|------|---------|
| `.a-` | Atom | `.a-button`, `.a-icon`, `.a-toggle` |
| `.m-` | Molecule | `.m-dialog`, `.m-table` |
| `.o-` | Organism | `.o-header`, `.o-footer` |
| `.e-` | Element/Layout | `.e-container` |

```css
/* Container utility */
.e-container          /* max-width 1132px, auto margin */
.e-container.-full-width  /* full-width with padding */
```

---

## Controlled vs Uncontrolled

Many components support both patterns:

```tsx
// Controlled
<Dialog open={isOpen} onOpenChange={setIsOpen} />

// Uncontrolled
<Dialog defaultOpen onOpenChange={(open) => console.log(open)} />
```

---

## Common Gotchas

| Problem | Fix |
|---|---|
| Icons not rendering | Check you have `@bosch/frontend.kit-npm` CSS imported and do NOT add `boschicon-bosch-ic-` prefix to `iconName` |
| **Styles missing / components look unstyled** | **Import CSS in `App.tsx`, NOT in `main.tsx`** — the CSS must be imported in the same file as your App component |
| `styled-components` error | Install `styled-components` separately; it's a peer dependency |
| Dark mode not applying | Wrap in `<div className="-dark-mode">`, not `:root` override |
| Dialog not closing | Use controlled pattern: `open={state}` + `onOpenChange={setState}` |
| Form not submitting | Wrap with `<Form>` organism, use `<Button type="submit">` |

---

## Versions

| Package | Version |
|---|---|
| `@bosch/react-frok` | 1.1.2 |
| `@bosch/frontend.kit-npm` | 4.1.2 |
| `@bosch/bdds.tokens-npm` | 1.1.0 |
