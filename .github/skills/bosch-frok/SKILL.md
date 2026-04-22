---
name: bosch-frok
description: Use this skill whenever working with `@bosch/react-frok` UI components — building UIs, forms, dialogs, navigation, tables, headers, footers, or any Bosch FROK component. Trigger on any mention of Bosch components, react-frok, FROK, Bosch design system, or tasks like "create a Bosch form", "add a dialog", "build a header", "use Bosch components", or any UI task in a project that uses `@bosch/react-frok`. Always use this skill before writing or editing any FROK component code — do not rely on memory alone.
---

# Bosch React FROK V2 — Component Skill

## ⚡ Quick Workflow

**Before writing any component code:**
1. Identify every UI element your component needs (button, input, header, modal, spinner, badge, etc.)
2. Look up EACH element in the **Mandatory HTML → FROK Replacement Map** below
3. Navigate to the appropriate category folder (`atoms/`, `molecules/`, `organisms/`, `custom/`)
4. `read_file` the corresponding component file for full props, CSS variables, and examples
5. Check `design-system/` for theming, colors, typography, or CSS variable customization

---

## 📁 Skill Structure

```
bosch-frok-v2/
├── SKILL.md                     # This file (entry point)
├── design-system/
│   ├── index.md                 # Token architecture overview
│   ├── color-gradations.md      # --g-{color}-{level} tokens (140+ tokens)
│   ├── semantic-tokens.md       # State tokens (300+ variables, light/dark)
│   ├── typography.md            # Font sizes, weights, line-heights
│   ├── spacing.md               # Padding, margin, gap patterns
│   └── shadows-motion.md        # Shadows, transitions, animations
├── atoms/                       # Basic UI elements
│   ├── index.md                 # Overview + list
│   ├── button.md, icon.md, badge.md, chip.md, toggle.md, checkbox.md
│   ├── input.md, tooltip.md, notification.md, pagination.md
│   ├── rating.md, slider.md, progress-indicator.md, activity-indicator.md, text.md
├── molecules/                   # Composite components
│   ├── index.md, dialog.md, form-field.md, popover.md
│   ├── breadcrumbs.md, step-indicator.md, dropdown.md
│   ├── search-form.md, tab-navigation.md, side-navigation.md
├── organisms/                   # App-level components
│   ├── index.md, header.md, footer.md, form.md
│   ├── login-form.md, context-menu.md, minimal-header.md
├── custom/                      # Specialized components
│   ├── index.md, blade.md, command-bar.md
│   ├── data-list.md, overlay-activity-indicator.md
└── patterns/                    # Cross-cutting concerns
    ├── theming.md               # Light/dark mode switching
    ├── responsive.md            # Breakpoints + mobile patterns
    └── accessibility.md         # ARIA patterns + best practices
```

---

## 🚫 Mandatory HTML → FROK Replacement Map

**You MUST replace every native HTML element with its FROK equivalent.** If you write a native element where a FROK component exists, it is a violation.

| ❌ NEVER Use (Native HTML) | ✅ ALWAYS Use (FROK) | Reference File |
|---|---|---|
| `<button>` | `<Button mode="primary\|secondary\|tertiary\|integrated">` | `atoms/button.md` |
| `<a>` with custom styles | `<Link>` for styled links | `atoms/link.md` |
| `<input type="text">` | `<TextField>` inside `<FormField>` | `atoms/input.md` |
| `<textarea>` | `<TextArea>` inside `<FormField>` | `atoms/input.md` |
| `<input type="checkbox">` | `<Checkbox>` | `atoms/checkbox.md` |
| `<input type="radio">` | `<RadioButton>` | `molecules/form-field.md` |
| `<select>` / `<option>` | `<Dropdown>` | `molecules/dropdown.md` |
| `<form>` | `<Form description="...">` | `organisms/form.md` |
| `<label>` + `<input>` | `<FormField label="..."><TextField /></FormField>` | `molecules/form-field.md` |
| `<header>` (app bar) | `<Header>` or `<MinimalHeader>` | `organisms/header.md` |
| `<nav>` tabs | `<TabNavigation>` + `<Tab>` | `molecules/tab-navigation.md` |
| `<ul>` / `<li>` menu | `<List>` + `<MenuItem>` | `atoms/list.md` |
| `<table>` / `<tr>` / `<td>` | `<Table>` + `<TableHead>` + `<TableBody>` + `<TableRow>` + `<TableCell>` | `atoms/table.md` |
| `<dialog>` / custom modal / `window.confirm()` | `<Dialog>` (controlled) | `molecules/dialog.md` |
| `<img>` | `<Image>` | `atoms/image.md` |
| Custom CSS spinner | `<ActivityIndicator>` | `atoms/activity-indicator.md` |
| Custom badge `<span>` | `<Badge>` or `<Chip>` | `atoms/badge.md` / `atoms/chip.md` |
| Custom alert/toast `<div>` | `<Notification>` | `atoms/notification.md` |
| Custom tooltip `<div>` | `<Tooltip>` | `atoms/tooltip.md` |
| Custom accordion | `<Accordion>` | `atoms/accordion.md` |
| Custom breadcrumbs | `<Breadcrumbs>` | `molecules/breadcrumbs.md` |
| Custom progress bar | `<ProgressIndicator>` or `<StepIndicator>` | `atoms/progress-indicator.md` / `molecules/step-indicator.md` |

**Exceptions** (native HTML is OK):
- `<input type="file">` with `className="hidden"` — no FROK equivalent, hide and trigger via `<Button>`
- `<div>`, `<span>`, `<section>`, `<main>` — structural/layout containers (but use `.e-container` class for page layout)
- `<p>`, `<h1>`–`<h6>` — text content (but use FROK typography CSS classes like `.-size-4xl`, `.highlight`)

---

## 🎨 Styling Rules

### Tailwind CSS Restrictions
If the project uses Tailwind, it is **only allowed for layout utilities**:
- ✅ **Allowed:** `flex`, `grid`, `gap-*`, `p-*`, `m-*`, `w-*`, `h-*`, `min-h-*`, `max-w-*`, `hidden`, `block`, `relative`, `absolute`, `sticky`, `z-*`, `overflow-*`, `truncate`, `space-y-*`
- ❌ **Forbidden:** `bg-*`, `text-*` (colors), `border-*` (colors), `font-*`, `shadow-*`, `rounded-*` for component styling — use Bosch design tokens or FROK component props instead

### Color Rules
| ❌ WRONG | ✅ CORRECT |
|---|---|
| `className="bg-blue-600"` | `style={{ background: 'var(--g-blue-50)' }}` or `<Button mode="primary">` |
| `className="text-red-500"` | `style={{ color: 'var(--g-red-50)' }}` or `<Notification variant="error">` |
| `className="bg-gray-50"` | `style={{ background: 'var(--g-gray-95)' }}` or use `.-light-mode` class |
| `color: #007bc0` | `color: var(--g-blue-50)` |

### Font Rules
| ❌ WRONG | ✅ CORRECT |
|---|---|
| `font-family: Inter, sans-serif` | Let Frontend Kit CSS provide `boschsans` automatically |
| `@import url('fonts.googleapis.com/...')` | Remove — `boschsans` comes from `@bosch/frontend.kit-npm` |
| `className="text-2xl font-bold"` | `className="-size-3xl highlight"` |

---

## 📄 Full Page Example

```tsx
import '@bosch/frontend.kit-npm/styles/frontend-kit.complete.css'; // Only in App.tsx
import {
  Header, Button, Icon, Form, FormField, TextField,
  Notification, ActivityIndicator, Dialog, Badge
} from '@bosch/react-frok';
import { useState } from 'react';

function CreateItemPage() {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div>
      <Header appName="My Bosch App" />

      <main className="e-container" style={{ paddingTop: '2rem' }}>
        <h1 className="-size-4xl highlight" style={{ marginBottom: '0.5rem' }}>
          Create Item
        </h1>
        <p className="-size-m" style={{ color: 'var(--g-gray-50)', marginBottom: '2rem' }}>
          Fill in the details below
        </p>

        {error && (
          <Notification variant="error" title="Error" style={{ marginBottom: '1rem' }}>
            {error}
          </Notification>
        )}

        <Form description="Create Item Form">
          <FormField label="Item Name">
            <TextField
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter item name"
            />
          </FormField>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button mode="primary" type="submit" disabled={!name.trim() || isLoading}>
              {isLoading ? 'Creating...' : 'Create'}
            </Button>
            <Button mode="secondary" onClick={() => history.back()}>
              Cancel
            </Button>
          </div>
        </Form>

        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
            <ActivityIndicator />
          </div>
        )}

        <Badge variant="success">Active</Badge>

        <Dialog
          title="Confirm Delete"
          variant="warning"
          open={showConfirm}
          onOpenChange={setShowConfirm}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={() => { /* handle delete */ }}
        >
          Are you sure you want to delete this item?
        </Dialog>
      </main>
    </div>
  );
}
```

---

## Component → Reference File Lookup

| Component(s) | Reference File |
|---|---|
| `Button`, `Link`, `Icon`, `Sticker`, `ValueModificator` | `atoms/` |
| `Toggle`, `Checkbox`, `TextField`, `TextArea`, `Slider`, `Rating`, `SelectableTile` | `atoms/` |
| `Badge`, `Chip`, `Notification`, `ActivityIndicator`, `ProgressIndicator` | `atoms/` |
| `Tile`, `Box`, `Divider`, `Image`, `Text`, `Video`, `Background` | `atoms/` |
| `List`, `MenuItem`, `TabNavigation`, `PageIndicator`, `OptionBar` | `atoms/` |
| `Table`, `TableHead`, `TableBody`, `TableRow`, `TableCell`, `Tooltip`, `Accordion` | `atoms/` |
| `FormField`, `SearchForm`, `SearchSuggestions`, `RadioButton` | `molecules/` |
| `Dialog`, `Popover`, `Lightbox`, `Dropdown`, `Breadcrumbs`, `StepIndicator` | `molecules/` |
| `SideNavigation`, `LanguageSelector` | `molecules/` |
| `Header`, `Footer`, `FooterLinks`, `ContextMenu`, `MinimalHeader`, `LoginForm`, `Form` | `organisms/` |
| `CommandBar`, `Blade`, `DataList`, `OverlayActivityIndicator` | `custom/` |
| Colors, typography, spacing, semantic tokens, theming | `design-system/` |

---

## Installation

```bash
npm install @bosch/react-frok @bosch/frontend.kit-npm @bosch/bdds.tokens-npm styled-components
```

### Vite Config (required)

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

### CSS Import (add to App.tsx)

```tsx
// App.tsx - CORRECT ✅
import '@bosch/frontend.kit-npm/styles/frontend-kit.complete.css';
```

Available CSS bundles:
- `frontend-kit.complete.css` — All styles (recommended)
- `frontend-kit.foundations.css` — Base tokens only
- `frontend-kit.atoms.css` — Atom components only
- `frontend-kit.molecules.css` — Molecule components only
- `frontend-kit.organisms.css` — Organism components only

---

## CSS Class Conventions

| Prefix | Type | Example |
|--------|------|---------|
| `.a-` | Atom | `.a-button`, `.a-icon`, `.a-toggle` |
| `.m-` | Molecule | `.m-dialog`, `.m-popover` |
| `.o-` | Organism | `.o-header`, `.o-footer` |
| `.e-` | Element/Layout | `.e-container` |

---

## Common Gotchas

| Problem | Fix |
|---|---|
| Icons not rendering | Check CSS import + do NOT add `boschicon-bosch-ic-` prefix to `iconName` |
| Styles missing / unstyled | Import CSS in `App.tsx`, NOT in `main.tsx` |
| `styled-components` error | Install `styled-components` separately; it's a peer dependency |
| Dark mode not applying | Wrap in `<div className="-dark-mode">`, not `:root` override |
| Dialog not closing | Use controlled pattern: `open={state}` + `onOpenChange={setState}` |
| Form not submitting | Wrap with `<Form>` organism, use `<Button type="submit">` |
| CSS not overriding | Check for CSS custom properties (e.g., `--max-dialog-width`) and override them |
| Need more details | Investigate `node_modules/@bosch/react-frok/lib/cjs/` for source |

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

See `design-system/` folder for full token reference.
