# Molecules

Composite components built from atoms — more complex but still reusable.

---

## Component List

| Component | File | Description |
|-----------|------|-------------|
| **Dialog** | [dialog.md](dialog.md) | Modal dialogs with header, body, footer |
| **FormField** | [form-field.md](form-field.md) | Label + input + validation wrapper |
| **Popover** | [popover.md](popover.md) | Contextual popup overlay |
| **Breadcrumbs** | [breadcrumbs.md](breadcrumbs.md) | Navigation path hierarchy |
| **StepIndicator** | [step-indicator.md](step-indicator.md) | Multi-step wizard progress |
| **SideNavigation** | [side-navigation.md](side-navigation.md) | Vertical navigation menu |
| **SearchForm** | [search-form.md](search-form.md) | Search input with suggestions |
| **Lightbox** | [lightbox.md](lightbox.md) | Image/media gallery modal |
| **LanguageSelector** | [language-selector.md](language-selector.md) | Language/locale dropdown |
| **TextImage** | [text-image.md](text-image.md) | Text alongside image layout |

---

## CSS Class Pattern

All molecule components use the `.m-` prefix:

```css
.m-dialog       /* Dialog/Modal */
.m-form-field   /* Form field wrapper */
.m-popover      /* Popover */
.m-breadcrumbs  /* Breadcrumb navigation */
.m-step-indicator /* Step indicator */
.m-tab-navigation /* Tabs */
```

---

## Quick Import

```tsx
import {
  Dialog,
  FormField,
  Popover,
  Breadcrumbs,
  StepIndicator,
  TabNavigation,
  Tab,
  SideNavigation,
  SearchForm,
  SearchSuggestions,
  Lightbox,
  LanguageSelector
} from '@bosch/react-frok';
```

---

## Common Patterns

### Form with Validation
```tsx
<Form description="User Profile">
  <FormField label="Name" required error={errors.name}>
    <TextField name="name" required />
  </FormField>
  <FormField label="Email" error={errors.email}>
    <TextField type="email" name="email" />
  </FormField>
  <Button mode="primary" type="submit">Save</Button>
</Form>
```

### Confirmation Dialog
```tsx
<Dialog
  title="Delete Item"
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
<TabNavigation value={activeTab} onChange={setActiveTab}>
  <Tab value="overview">Overview</Tab>
  <Tab value="details">Details</Tab>
  <Tab value="settings">Settings</Tab>
</TabNavigation>
```
