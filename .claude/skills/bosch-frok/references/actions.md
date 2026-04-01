# Actions Components

Action components provide interactive elements for navigation and user interactions.

---

## Link

### Purpose
A versatile link component that supports multiple visual styles including standard links, button-styled links, and integrated links. Provides consistent styling and accessibility features for navigation elements.

### Import
```tsx
import { Link } from '@bosch/react-frok';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `as` | `ElementType` | `'div'` | Root element type |
| `href` | `string` | - | Link destination URL |
| `target` | `string` | - | Link target attribute |
| `content` | `Slot<'a'>` | - | Shorthand for link anchor content |
| `icon` | `Slot<'i'>` | - | Icon element |
| `iconPosition` | `'before' \| 'after'` | `'before'` | Position of icon relative to text |
| `disabled` | `boolean` | `false` | Whether link is disabled |
| `appearance` | `'default' \| 'button' \| 'button-secondary' \| 'button-integrated' \| 'integrated'` | `'default'` | Visual style of link |
| `className` | `string` | - | Additional CSS classes |

All standard HTML attributes are supported via spread props.

### Variants

#### Appearance Variants
- **default**: Standard underlined link with accent color
- **button**: Primary button style with filled background
- **button-secondary**: Secondary button style with border
- **button-integrated**: Transparent button style
- **integrated**: Subtle link style for integrated UIs

#### Icon Positions
- **before**: Icon appears before link text (default)
- **after**: Icon appears after link text

### CSS Classes

#### Base Classes
- `.a-link`: Base link component wrapper
- `.a-link.-disabled`: Disabled state
- `.a-link.-icon`: Link with icon variant

#### Appearance Classes
- `.a-link--button`: Primary button styled link
- `.a-link--button-secondary`: Secondary button styled link
- `.a-link--button-integrated`: Integrated button styled link
- `.a-link--integrated`: Integrated link style

#### Element Classes
- `.a-icon`: Icon element styling

### Usage Example

```tsx
import { Link } from '@bosch/react-frok';

// Basic link
<Link href="/home" content="Go to Home" />

// Link with icon
<Link
  href="/settings"
  content="Settings"
  icon="boschicon-bosch-ic-settings"
  iconPosition="before"
/>

// Button styled link
<Link
  href="/submit"
  content="Submit Form"
  appearance="button"
/>

// Secondary button link
<Link
  href="/cancel"
  content="Cancel"
  appearance="button-secondary"
/>

// Disabled link
<Link
  href="/unavailable"
  content="Unavailable"
  disabled
/>

// Link with custom content
<Link href="/profile">
  <a>
    <i className="a-icon boschicon-bosch-ic-user" />
    <span>My Profile</span>
  </a>
</Link>
```

### Do's and Don'ts

**Do:**
- Use standard links for navigation within the application
- Use button appearance for primary actions
- Use button-secondary for secondary or less prominent actions
- Disable links when the action is temporarily unavailable
- Use integrated appearance for subtle navigation in dense UIs
- Provide clear, descriptive link text

**Don't:**
- Don't use button-styled links for external navigation
- Don't nest interactive elements inside links
- Don't use generic text like "click here" or "read more"
- Don't override disabled state styling for clarity
- Don't use multiple different appearances in the same context

### Related Components
- Button: For non-navigation actions
- Navigation: For structured navigation menus
- Breadcrumb: For hierarchical navigation paths

---

## Sticker

### Purpose
A small, colored label component used to display status, categories, or tags. Provides visual emphasis through predefined color variants.

### Import
```tsx
import { Sticker } from '@bosch/react-frok';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `as` | `ElementType` | `'div'` | Root element type |
| `label` | `string` | - | Text content of the sticker |
| `color` | `'turquoise' \| 'purple' \| 'green'` | - | Color variant of the sticker |
| `className` | `string` | - | Additional CSS classes |

All standard HTML attributes are supported via spread props.

### Variants

#### Color Variants
- **turquoise**: Turquoise background with appropriate contrast text
- **purple**: Purple background with appropriate contrast text
- **green**: Green background with appropriate contrast text

### CSS Classes

#### Base Classes
- `.a-sticker`: Base sticker component
- `.a-sticker__label`: Label text element

#### Color Modifier Classes
- `.a-sticker.-turquoise`: Turquoise color variant
- `.a-sticker.-purple`: Purple color variant
- `.a-sticker.-green`: Green color variant

### Usage Example

```tsx
import { Sticker } from '@bosch/react-frok';

// Turquoise sticker
<Sticker label="New" color="turquoise" />

// Purple sticker for status
<Sticker label="In Progress" color="purple" />

// Green sticker for completion
<Sticker label="Completed" color="green" />

// Multiple stickers
<div>
  <Sticker label="Priority" color="purple" />
  <Sticker label="Verified" color="green" />
  <Sticker label="Updated" color="turquoise" />
</div>
```

### Do's and Don'ts

**Do:**
- Use stickers to highlight status, categories, or tags
- Choose colors that align with their semantic meaning in your application
- Keep label text short and concise (1-2 words)
- Use consistently across the application for similar purposes

**Don't:**
- Don't use stickers for interactive elements (they are display-only)
- Don't create custom color variants outside the provided options
- Don't use long text that might overflow
- Don't use stickers as buttons or clickable elements
- Don't overuse stickers in a single view (causes visual clutter)

### Related Components
- Badge: For numerical indicators
- Chip: For interactive, removable tags
- Label: For form field labels

---

## ValueModificator

### Purpose
An input control with increment and decrement buttons for adjusting numeric values. Provides an intuitive interface for step-based value changes with defined min/max constraints.

### Import
```tsx
import { ValueModificator } from '@bosch/react-frok';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `as` | `ElementType` | `'div'` | Root element type |
| `label` | `string` | - | Label text for the input |
| `disabled` | `boolean` | `false` | Whether the control is disabled |
| `control` | `Slot<'input'>` | - | Shorthand for input element customization |
| `min` | `number` | `0` | Minimum allowed value |
| `max` | `number` | `100` | Maximum allowed value |
| `step` | `number` | `5` | Increment/decrement step size |
| `value` | `number` | - | Controlled value |
| `defaultValue` | `number` | - | Uncontrolled default value |
| `onChange` | `(event, value?) => void` | - | Callback fired when value changes |
| `className` | `string` | - | Additional CSS classes |

All standard HTML attributes are supported via spread props.

### Variants

#### States
- **Default**: Normal interactive state
- **Disabled**: Non-interactive state for entire control
- **Button Disabled**: Individual buttons disabled when at min/max limits

### CSS Classes

#### Base Classes
- `.a-value-modificator`: Base component wrapper
- `.a-value-modificator.-disabled`: Disabled state modifier

#### Element Classes
- `.a-value-modificator__minus-button`: Decrement button
- `.a-value-modificator__plus-button`: Increment button
- `.a-value-modificator__icon`: Icon styling for buttons
- `.a-value-modificator__minus-icon`: Minus icon (uses `boschicon-bosch-ic-less-minimize`)
- `.a-value-modificator__plus-icon`: Plus icon (uses `boschicon-bosch-ic-add`)

### Usage Example

```tsx
import { ValueModificator } from '@bosch/react-frok';
import { useState } from 'react';

// Uncontrolled with default value
<ValueModificator
  label="Quantity"
  defaultValue={10}
  min={0}
  max={100}
  step={5}
/>

// Controlled component
function QuantitySelector() {
  const [quantity, setQuantity] = useState(20);

  return (
    <ValueModificator
      label="Items"
      value={quantity}
      onChange={(ev, newValue) => setQuantity(newValue)}
      min={0}
      max={50}
      step={1}
    />
  );
}

// Disabled state
<ValueModificator
  label="Locked Value"
  value={25}
  disabled
/>

// Custom step increments
<ValueModificator
  label="Price (€)"
  defaultValue={100}
  min={0}
  max={1000}
  step={10}
/>

// With change handler
<ValueModificator
  label="Volume"
  defaultValue={50}
  min={0}
  max={100}
  step={5}
  onChange={(ev, value) => {
    console.log('New value:', value);
  }}
/>
```

### Do's and Don'ts

**Do:**
- Use for numeric inputs where step-based changes make sense
- Set appropriate min, max, and step values for the use case
- Provide a clear, descriptive label
- Use controlled component pattern when value needs to be synchronized with other state
- Disable when the value should not be editable

**Don't:**
- Don't use for large ranges where typing would be more efficient
- Don't set step values that would make it difficult to reach desired values
- Don't allow negative values unless semantically appropriate
- Don't use without labels in forms
- Don't set min/max values that are equal or inverted
- Don't use for non-integer values unless step is configured appropriately

### Related Components
- Input: For direct numeric input without step controls
- Slider: For visual range selection
- Spinner: For loading states (different purpose)

---

## Icon

### Purpose
Display font-based icons from the Bosch icon library, supporting both standard Bosch icons and UI-specific icons.

### Import
```tsx
import { Icon } from '@bosch/react-frok';
```

### Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `as` | `ElementType` | `'i'` | No | Root element type to render |
| `iconName` | `IconName \| string` | `undefined` | No | Name of the font icon (without prefix) |
| `children` | `string \| ReactChildren` | `undefined` | No | Alias for `iconName` - icon name as children |
| `isUiIcon` | `boolean` | `false` | No | Whether it's an icon from the UI font (`ui-ic-` prefix) vs standard Bosch icon (`boschicon-bosch-ic-` prefix) |
| `aria-label` | `string` | `undefined` | No | Accessibility label for the icon. When provided, sets `aria-hidden="false"` |
| `className` | `string` | `undefined` | No | Additional CSS classes |

All standard HTML attributes are supported via spread props.

### Variants

#### Icon Types
| Variant Value | CSS Class | Visual Description |
|--------------|-----------|-------------------|
| Standard Bosch Icon | `boschicon-bosch-ic-{iconName}` | Icons from the main Bosch icon font (3000+ icons available) |
| UI Icon | `ui-ic-{iconName}` | Icons from the UI-specific icon font |

#### Special Icon Names
The component accepts these special icon names in addition to the standard IconName type:
- `nosafe-star-fill`
- `nosafe-star-half`
- `nosafe-star`

### CSS Classes

#### Base Classes
- `.a-icon`: Base icon class with default 24px font size and inherited color

#### Icon Font Classes
- `.boschicon-bosch-ic-{iconName}`: Applied for standard Bosch icons when `isUiIcon=false`
- `.ui-ic-{iconName}`: Applied for UI icons when `isUiIcon=true`

### Usage Example

```tsx
import { Icon } from '@bosch/react-frok';

// Basic icon using iconName prop
<Icon iconName="settings" />

// Icon using children prop (alias for iconName)
<Icon>user</Icon>

// UI icon
<Icon iconName="close" isUiIcon />

// Icon with accessibility label
<Icon iconName="info" aria-label="Information" />

// Custom element type
<Icon as="span" iconName="check" />

// Icon with custom styling
<Icon
  iconName="warning"
  className="custom-warning-icon"
  style={{ fontSize: '32px', color: 'red' }}
/>

// Common icon examples
<Icon iconName="add" />
<Icon iconName="delete" />
<Icon iconName="edit" />
<Icon iconName="download" />
<Icon iconName="upload" />
<Icon iconName="search" />
<Icon iconName="filter" />
<Icon iconName="checkmark" />
<Icon iconName="close" />
```

### Do's and Don'ts

**Do:**
- Use `iconName` prop or `children` for cleaner syntax (both work identically)
- Provide `aria-label` for standalone icons that convey meaning
- Use consistent icon sizes across similar UI contexts
- Use semantic icon names that match their purpose
- Set `isUiIcon=true` for UI-specific icons to apply correct font prefix
- Leverage the extensive Bosch icon library (3000+ icons available)

**Don't:**
- Don't include the `boschicon-bosch-ic-` or `ui-ic-` prefix in `iconName` (component adds it)
- Don't use icons as the only indicator for important actions without text labels
- Don't override font-family (breaks icon rendering)
- Don't use icons inconsistently (same icon for different purposes)
- Don't make icons too small for touch targets in interactive elements
- Don't forget accessibility: add `aria-label` for decorative icons used standalone

### Related Components
- Button: Uses Icon component internally for button icons
- Link: Can include icons via icon prop

---

## Button

### Purpose
Interactive button component with multiple visual modes (primary, secondary, tertiary, integrated), support for icons, labels, and consistent FROK styling.

### Import
```tsx
import { Button } from '@bosch/react-frok';
```

### Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `as` | `ElementType` | `'button'` | No | Root element type to render |
| `mode` | `'primary' \| 'secondary' \| 'tertiary' \| 'integrated'` | `'primary'` | No | FROK button visual style |
| `label` | `Slot<'span'>` | `undefined` | No | Label text inside the button (can contain React elements) |
| `children` | `ReactNode` | `undefined` | No | Alternative to label prop for button content |
| `icon` | `IconName \| IconProps` | `undefined` | No | Either icon name string or full IconProps object |
| `isUiIcon` | `boolean` | `undefined` | No | Whether the icon is from UI font (forwarded to Icon component) |
| `fixedWidth` | `boolean` | `false` | No | Whether button has fixed 8rem width |
| `action` | `string` | `null` | No | String bound to button's `data-frok-action` attribute for analytics/tracking |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | No | HTML button type attribute |
| `disabled` | `boolean` | `false` | No | Whether button is disabled |
| `className` | `string` | `undefined` | No | Additional CSS classes |

All standard HTML button attributes are supported via spread props (onClick, onBlur, etc.).

### Variants

#### Mode Variants
| Variant Value | CSS Class | Visual Description |
|--------------|-----------|-------------------|
| `primary` | `.a-button--primary` | Filled background with major accent color, white text - for primary actions |
| `secondary` | `.a-button--secondary` | Transparent background with 1px border, accent text - for secondary actions |
| `tertiary` | `.a-button--tertiary` | Transparent background, accent text, no border - for tertiary actions |
| `integrated` | `.a-button--integrated` | Transparent background with focus inside, minimal visual weight |

#### State Variants
All modes support these interaction states via CSS:
- `:hover` - Hover state with color changes
- `:active` - Pressed/active state
- `:disabled` - Disabled state with reduced opacity/contrast
- `:focus-visible` - Focus state with focus outline

### CSS Classes

#### Base Classes
- `.a-button`: Base button class with flex layout, padding, and typography

#### Mode Modifier Classes
- `.a-button--primary`: Primary button styling (filled, major accent)
- `.a-button--secondary`: Secondary button styling (bordered, pure accent)
- `.a-button--tertiary`: Tertiary button styling (no border, pure accent)
- `.a-button--integrated`: Integrated button styling (minimal, transparent)

#### State Modifier Classes
- `.-fixed`: Fixed width (8rem) with centered content and ellipsis overflow
- `.-without-icon`: Applied when button has no icon (centers label)
- `.-without-label`: Applied when button has no label (centers icon)

#### Element Classes
- `.a-button__label`: Label/text element with padding (0.75rem for primary, 0.6875rem for secondary)
- `.a-button__icon`: Icon element with 1.5rem font size and specific padding

### Usage Example

```tsx
import { Button } from '@bosch/react-frok';

// Primary button (default)
<Button label="Submit" />
<Button>Submit</Button>  // Using children instead of label

// Secondary button
<Button label="Cancel" mode="secondary" />

// Tertiary button
<Button label="Learn More" mode="tertiary" />

// Integrated button
<Button label="Edit" mode="integrated" />

// Button with icon (string)
<Button
  label="Download"
  icon="download"
/>

// Button with icon (IconProps)
<Button
  label="Upload"
  icon={{ iconName: "upload", className: "custom-icon" }}
/>

// Icon-only button
<Button icon="close" aria-label="Close" />

// Button with icon after text
<Button label="Next" icon="arrow-right" />

// Fixed width button
<Button label="OK" fixedWidth />

// Disabled button
<Button label="Submit" disabled />

// Button with action tracking
<Button
  label="Subscribe"
  action="newsletter-subscribe"
  onClick={() => console.log('Subscribed')}
/>

// Submit button in form
<Button
  label="Save Changes"
  type="submit"
  mode="primary"
/>

// Custom element type (renders as anchor)
<Button
  as="a"
  href="/home"
  label="Home"
/>

// Full example with all props
<Button
  mode="primary"
  label="Create Account"
  icon="user-add"
  fixedWidth
  action="user-registration"
  onClick={() => handleCreateAccount()}
/>
```

### Do's and Don'ts

**Do:**
- Use `primary` mode for the most important action on a page
- Use `secondary` for alternative or cancel actions
- Use `tertiary` for less prominent actions
- Use `integrated` for subtle actions in dense UIs
- Provide either `label` or accessible `aria-label` for icon-only buttons
- Use `fixedWidth` for consistent button sizing in forms or button groups
- Use `action` prop for analytics tracking
- Keep button text concise and action-oriented (verbs)
- Limit primary buttons to one per section

**Don't:**
- Don't use multiple primary buttons in the same context (causes confusion)
- Don't use buttons for navigation (use Link component instead)
- Don't create icon-only buttons without `aria-label` (accessibility issue)
- Don't override the default button type unless needed (defaults to `type="button"`)
- Don't mix button modes inconsistently
- Don't use extremely long text in fixed width buttons (will be truncated)
- Don't use disabled buttons without explaining why they're disabled
- Don't nest interactive elements inside buttons

### Related Components
- Link: For navigation actions
- Icon: Used internally for button icons
- ValueModificator: Uses buttons internally for increment/decrement
