# Form Components

## Toggle

### Purpose
A toggle component (switch) that allows users to switch between two states (on/off). It's represented as a checkbox input with role="switch" and can display optional labels on either side.

### Import
```tsx
import { Toggle } from '@bosch/react-frok';
```

### Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| id | string | - | Yes | Unique identifier for the toggle element |
| leftLabel | string | undefined | No | Text shown on the left side of the toggle |
| rightLabel | string | undefined | No | Text shown on the right side of the toggle |
| disabled | boolean | false | No | Whether the toggle is disabled |
| checked | boolean | false | No | Whether the toggle is checked/on |
| className | string | undefined | No | Additional CSS classes to apply |
| style | CSSProperties | undefined | No | Inline styles to apply |

*Note: Extends `InputHTMLAttributes<HTMLInputElement>`, so all standard input attributes are supported.*

### Variants
- **Default**: Basic toggle without labels
- **Left Label**: Toggle with label on the left side
- **Right Label**: Toggle with label on the right side
- **Checked**: Toggle in the "on" state
- **Disabled**: Toggle that cannot be interacted with

### CSS Classes
- `a-toggle`: Base class for the toggle container
- `-disabled`: Modifier class applied when toggle is disabled
- `a-toggle__label`: Base class for label elements
- `a-toggle__label--left`: Class for left-side label
- `a-toggle__label--right`: Class for right-side label
- `a-toggle__trigger`: Class for the visual toggle switch element

### Usage Example
```tsx
// Basic toggle with left label
<Toggle
  id="notifications"
  leftLabel="Enable Notifications"
/>

// Toggle with right label
<Toggle
  id="darkMode"
  rightLabel="Dark Mode"
  checked={true}
/>

// Disabled toggle
<Toggle
  id="locked"
  leftLabel="This is locked"
  disabled={true}
/>

// Controlled toggle with onChange
<Toggle
  id="settings"
  leftLabel="Auto-save"
  checked={isAutoSaveEnabled}
  onChange={(e) => setAutoSaveEnabled(e.target.checked)}
/>
```

### Do's and Don'ts
**Do:**
- Use toggles for immediate on/off settings
- Provide descriptive labels when needed
- Use the `disabled` state to indicate unavailable options
- Use `leftLabel` or `rightLabel` for context

**Don't:**
- Use toggles for actions that require confirmation
- Use both `leftLabel` and `rightLabel` simultaneously (choose one for clarity)
- Forget to provide an `id` (required prop)

### Related Components
- Checkbox
- RadioButton

---

## Checkbox

### Purpose
A checkbox component that allows users to select or deselect an option. Supports standard checked states as well as an indeterminate state for partial selections.

### Import
```tsx
import { Checkbox } from '@bosch/react-frok';
```

### Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| id | string | - | Yes | Unique identifier for the checkbox (will be prefixed with 'checkbox-') |
| label | ReactNode | undefined | No | Label to display next to the checkbox, can contain text or React elements |
| indeterminate | boolean | false | No | Whether the checkbox is in an indeterminate state (partial selection) |
| checked | boolean | false | No | Whether the checkbox is checked |
| disabled | boolean | false | No | Whether the checkbox is disabled |
| children | ReactNode | undefined | No | Alternative way to provide label content (used if `label` is not provided) |
| className | string | undefined | No | Additional CSS classes to apply |
| style | CSSProperties | undefined | No | Inline styles to apply |

*Note: Extends `InputHTMLAttributes<HTMLInputElement>`, so all standard input attributes are supported.*

### Variants
- **Default**: Basic unchecked checkbox
- **Checked**: Checkbox in checked state
- **Disabled**: Checkbox that cannot be interacted with
- **Indeterminate**: Checkbox in partial selection state (useful for "select all" scenarios)

### CSS Classes
- `a-checkbox`: Base class for the checkbox container
- `a-checkbox--indeterminate`: Modifier class applied when checkbox is in indeterminate state

### Usage Example
```tsx
// Basic checkbox with label
<Checkbox
  id="terms"
  label="I accept the terms and conditions"
/>

// Checked checkbox
<Checkbox
  id="subscribe"
  label="Subscribe to newsletter"
  checked={true}
/>

// Disabled checkbox
<Checkbox
  id="locked-option"
  label="Premium feature (locked)"
  disabled={true}
/>

// Indeterminate checkbox (partial selection)
<Checkbox
  id="select-all"
  label="Select all items"
  indeterminate={someItemsSelected}
  checked={allItemsSelected}
/>

// Using children instead of label prop
<Checkbox id="custom">
  <strong>Custom</strong> label content
</Checkbox>

// Controlled checkbox with onChange
<Checkbox
  id="remember"
  label="Remember me"
  checked={rememberMe}
  onChange={(e) => setRememberMe(e.target.checked)}
/>
```

### Do's and Don'ts
**Do:**
- Use checkboxes for multiple selections
- Use `indeterminate` state for parent checkboxes when only some children are selected
- Provide clear, concise labels
- Use `children` prop for complex label content with React elements

**Don't:**
- Use checkboxes for mutually exclusive options (use RadioButton instead)
- Forget to provide an `id` (required prop)
- Use both `label` and `children` props (label takes precedence)

### Related Components
- Toggle
- RadioButton

---

## RadioButton

### Purpose
A radio button component for selecting a single option from a group of mutually exclusive choices. Radio buttons with the same `name` attribute form a group where only one can be selected at a time.

### Import
```tsx
import { RadioButton } from '@bosch/react-frok';
```

### Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| id | string | - | Yes | Unique identifier for the radio button (will be prefixed with 'radio-button-') |
| label | ReactNode | undefined | No | Label to display next to the radio button, can contain text or React elements |
| value | string | undefined | No | Value of the radio button (important for form submission) |
| name | string | undefined | No | Name of the input group (radio buttons with the same name are mutually exclusive) |
| checked | boolean | false | No | Whether the radio button is selected |
| disabled | boolean | false | No | Whether the radio button is disabled |
| children | ReactNode | undefined | No | Alternative way to provide label content (used if `label` is not provided) |
| className | string | undefined | No | Additional CSS classes to apply |
| style | CSSProperties | undefined | No | Inline styles to apply |

*Note: Extends `InputHTMLAttributes<HTMLInputElement>`, so all standard input attributes are supported.*

### Variants
- **Default**: Basic unselected radio button
- **Checked**: Radio button in selected state
- **Disabled**: Radio button that cannot be interacted with

### CSS Classes
- `a-radio-button`: Base class for the radio button container

### Usage Example
```tsx
// Basic radio button group
<div>
  <RadioButton
    id="option1"
    name="choice"
    value="option1"
    label="Option 1"
  />
  <RadioButton
    id="option2"
    name="choice"
    value="option2"
    label="Option 2"
  />
  <RadioButton
    id="option3"
    name="choice"
    value="option3"
    label="Option 3"
  />
</div>

// Checked radio button
<RadioButton
  id="default-choice"
  name="settings"
  value="auto"
  label="Automatic"
  checked={true}
/>

// Disabled radio button
<RadioButton
  id="premium"
  name="plan"
  value="premium"
  label="Premium (coming soon)"
  disabled={true}
/>

// Using children instead of label prop
<RadioButton id="custom-radio" name="type" value="custom">
  <strong>Custom</strong> option
</RadioButton>

// Controlled radio button group
{['small', 'medium', 'large'].map((size) => (
  <RadioButton
    key={size}
    id={size}
    name="size"
    value={size}
    label={size.charAt(0).toUpperCase() + size.slice(1)}
    checked={selectedSize === size}
    onChange={(e) => setSelectedSize(e.target.value)}
  />
))}
```

### Do's and Don'ts
**Do:**
- Use radio buttons for mutually exclusive options
- Always use the same `name` attribute for related radio buttons in a group
- Provide a `value` attribute for each radio button
- Use descriptive labels
- Pre-select a default option when appropriate

**Don't:**
- Use radio buttons for multiple selections (use Checkbox instead)
- Use radio buttons for on/off states (use Toggle instead)
- Forget to provide an `id` (required prop)
- Use both `label` and `children` props (label takes precedence)
- Forget to set the `name` attribute for grouping

### Related Components
- Toggle
- Checkbox

---

## TextField

### Purpose
TextField is a form input component for single-line text entry with support for labels, placeholders, helper text, and validation states.

### Import
```typescript
import { TextField } from '@bosch/react-frok';
```

### Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| name | string | - | No | Name attribute for the input field |
| value | string | - | No | Controlled value of the input |
| label | string | - | No | Label text displayed above the input |
| placeholder | string | - | No | Placeholder text shown when input is empty |
| helperText | string | - | No | Helper text displayed below the input |
| errorText | string | - | No | Error message displayed when input is invalid |
| disabled | boolean | false | No | Whether the input is disabled |
| readOnly | boolean | false | No | Whether the input is read-only |
| required | boolean | false | No | Whether the input is required |
| autoFocus | boolean | false | No | Whether to focus the input on mount |
| maxLength | number | - | No | Maximum number of characters allowed |
| type | 'text' \| 'password' \| 'email' \| 'number' \| 'tel' \| 'url' | 'text' | No | Input type |
| onChange | (event: React.ChangeEvent<HTMLInputElement>) => void | - | No | Callback fired when value changes |
| onBlur | (event: React.FocusEvent<HTMLInputElement>) => void | - | No | Callback fired when input loses focus |
| onFocus | (event: React.FocusEvent<HTMLInputElement>) => void | - | No | Callback fired when input gains focus |
| className | string | - | No | Additional CSS class names |
| id | string | - | No | HTML id attribute |
| dataTestId | string | - | No | Test ID for testing purposes |

*Note: Extends `InputHTMLAttributes<HTMLInputElement>`, so all standard input attributes are supported.*

### Variants
TextField supports different states through props:
- **Default**: Standard input field
- **Disabled**: Non-interactive state (`disabled={true}`)
- **Read-only**: Display-only state (`readOnly={true}`)
- **Error**: Shows error message (`errorText="Error message"`)
- **Required**: Indicates required field (`required={true}`)

### CSS Classes
TextField uses the following CSS class pattern:
- `a-text-field`: Base class for root container
- `a-text-field__label`: Label element class
- `a-text-field__input`: Input element class
- `a-text-field__helper-text`: Helper text element class
- `a-text-field__error-text`: Error text element class
- `a-text-field--disabled`: Disabled state modifier
- `a-text-field--error`: Error state modifier
- `a-text-field--readonly`: Read-only state modifier

### Usage Example
```tsx
import { TextField } from '@bosch/react-frok';
import { useState } from 'react';

function MyForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  const handleBlur = () => {
    if (email && !email.includes('@')) {
      setError('Please enter a valid email address');
    }
  };

  return (
    <TextField
      name="email"
      type="email"
      label="Email Address"
      value={email}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder="you@example.com"
      helperText="We'll never share your email"
      errorText={error}
      required
    />
  );
}
```

### Do's and Don'ts

**Do:**
- Provide clear, concise labels for all text fields
- Use helper text to provide additional context or instructions
- Show error messages that help users fix validation issues
- Use appropriate input types (email, tel, url) for better mobile keyboards
- Set maxLength when there are character limits

**Don't:**
- Use placeholder text as a replacement for labels
- Disable fields without explaining why
- Use vague error messages like "Invalid input"
- Mix controlled and uncontrolled patterns
- Forget to handle both onChange and onBlur for validation

### Related Components
- TextArea
- Toggle
- Checkbox
- RadioButton

---

## TextArea

### Purpose
TextArea is a form input component for multi-line text entry with support for labels, placeholders, and validation states.

### Import
```typescript
import { TextArea } from '@bosch/react-frok';
```

### Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| name | string | - | No | Name attribute for the textarea |
| value | string | - | No | Controlled value of the textarea |
| label | string | - | No | Label text displayed above the textarea |
| placeholder | string | - | No | Placeholder text shown when textarea is empty |
| disabled | boolean | false | No | Whether the textarea is disabled |
| readOnly | boolean | false | No | Whether the textarea is read-only |
| required | boolean | false | No | Whether the textarea is required |
| rows | number | 3 | No | Number of visible text lines |
| maxLength | number | - | No | Maximum number of characters allowed |
| onChange | (event: React.ChangeEvent<HTMLTextAreaElement>) => void | - | No | Callback fired when value changes |
| onBlur | (event: React.FocusEvent<HTMLTextAreaElement>) => void | - | No | Callback fired when textarea loses focus |
| onFocus | (event: React.FocusEvent<HTMLTextAreaElement>) => void | - | No | Callback fired when textarea gains focus |
| className | string | - | No | Additional CSS class names |
| id | string | - | No | HTML id attribute |
| dataTestId | string | - | No | Test ID for testing purposes |

*Note: Extends `TextareaHTMLAttributes<HTMLTextAreaElement>`, so all standard textarea attributes are supported.*

### Variants
TextArea supports different states through props:
- **Default**: Standard textarea
- **Disabled**: Non-interactive state (`disabled={true}`)
- **Read-only**: Display-only state (`readOnly={true}`)
- **Required**: Indicates required field (`required={true}`)

### CSS Classes
TextArea uses the following CSS class pattern:
- `a-text-area`: Base class for root container
- `a-text-area__label`: Label element class
- `a-text-area__textarea`: Textarea element class
- `a-text-area--disabled`: Disabled state modifier
- `a-text-area--readonly`: Read-only state modifier

### Usage Example
```tsx
import { TextArea } from '@bosch/react-frok';
import { useState } from 'react';

function FeedbackForm() {
  const [feedback, setFeedback] = useState('');
  const maxChars = 500;

  return (
    <div>
      <TextArea
        name="feedback"
        label="Your Feedback"
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="Tell us what you think..."
        rows={5}
        maxLength={maxChars}
        required
      />
      <p>{feedback.length} / {maxChars} characters</p>
    </div>
  );
}
```

### Do's and Don'ts

**Do:**
- Set an appropriate number of rows for the expected content length
- Use maxLength to prevent overly long inputs
- Provide clear labels explaining what content is expected
- Consider showing character count for limited-length textareas
- Use rows prop to give users enough visible space

**Don't:**
- Use TextArea for single-line inputs (use TextField instead)
- Set rows too small, forcing users to scroll unnecessarily
- Forget to handle resize behavior in your layout
- Use placeholder as the only instruction

### Related Components
- TextField
- Toggle
- Checkbox

---

## SelectableTile

### Purpose
SelectableTile is an interactive card component that can be selected, combining visual content with selection functionality. It's useful for choice selection in a more visual way than traditional radio buttons or checkboxes.

### Import
```typescript
import { SelectableTile } from '@bosch/react-frok';
```

### Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| selected | boolean | false | No | Whether the tile is currently selected |
| disabled | boolean | false | No | Whether the tile is disabled |
| onChange | (selected: boolean) => void | - | No | Callback fired when selection changes |
| children | React.ReactNode | - | No | Content to display inside the tile |
| className | string | - | No | Additional CSS class names |
| id | string | - | No | HTML id attribute |
| name | string | - | No | Name attribute for form grouping |
| value | string | - | No | Value associated with this tile |
| dataTestId | string | - | No | Test ID for testing purposes |
| multiSelect | boolean | false | No | Whether multiple tiles can be selected (checkbox behavior) |

*Note: Extends `HTMLAttributes<HTMLDivElement>`, so all standard div attributes are supported.*

### Variants
SelectableTile supports different states:
- **Default**: Unselected, interactive state
- **Selected**: Active/selected state (`selected={true}`)
- **Disabled**: Non-interactive state (`disabled={true}`)
- **Multi-select**: Checkbox-style selection (`multiSelect={true}`)
- **Single-select**: Radio-style selection (`multiSelect={false}`)

### CSS Classes
SelectableTile uses the following CSS class pattern:
- `a-selectable-tile`: Base class for root container
- `a-selectable-tile--selected`: Selected state modifier
- `a-selectable-tile--disabled`: Disabled state modifier
- `a-selectable-tile__content`: Content wrapper class
- `a-selectable-tile__input`: Hidden input element class

### Usage Example
```tsx
import { SelectableTile } from '@bosch/react-frok';
import { useState } from 'react';

// Single selection example
function PlanSelector() {
  const [selectedPlan, setSelectedPlan] = useState<string>('');

  const plans = [
    { id: 'basic', name: 'Basic Plan', price: '$9/mo' },
    { id: 'pro', name: 'Pro Plan', price: '$29/mo' },
    { id: 'enterprise', name: 'Enterprise', price: '$99/mo' }
  ];

  return (
    <div className="plan-selector">
      {plans.map(plan => (
        <SelectableTile
          key={plan.id}
          name="plan"
          value={plan.id}
          selected={selectedPlan === plan.id}
          onChange={() => setSelectedPlan(plan.id)}
        >
          <h3>{plan.name}</h3>
          <p>{plan.price}</p>
        </SelectableTile>
      ))}
    </div>
  );
}

// Multi-selection example
function FeatureSelector() {
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  const features = [
    { id: 'analytics', name: 'Analytics', icon: '📊' },
    { id: 'api', name: 'API Access', icon: '🔌' },
    { id: 'support', name: '24/7 Support', icon: '💬' }
  ];

  const toggleFeature = (featureId: string) => {
    setSelectedFeatures(prev =>
      prev.includes(featureId)
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  };

  return (
    <div className="feature-selector">
      {features.map(feature => (
        <SelectableTile
          key={feature.id}
          name="features"
          value={feature.id}
          selected={selectedFeatures.includes(feature.id)}
          onChange={() => toggleFeature(feature.id)}
          multiSelect
        >
          <div className="feature-icon">{feature.icon}</div>
          <h4>{feature.name}</h4>
        </SelectableTile>
      ))}
    </div>
  );
}
```

### Do's and Don'ts

**Do:**
- Use SelectableTile for visual choices where content matters
- Provide meaningful content inside tiles (icons, images, descriptions)
- Ensure tiles have sufficient contrast in selected/unselected states
- Use multiSelect prop to indicate whether multiple selections are allowed
- Group related tiles with appropriate spacing

**Don't:**
- Use for simple yes/no choices (use Checkbox instead)
- Use for long lists of text-only options (use Select or RadioButton instead)
- Make tiles too small or too large for their content
- Forget to indicate which tiles are selected with clear visual feedback
- Mix single-select and multi-select tiles in the same group

### Related Components
- RadioButton
- Checkbox
- Toggle

---

## FormField

### Purpose
FormField is a wrapper molecule component that provides consistent layout, spacing, and notification support for form inputs. It wraps various form controls (text fields, textareas, radio buttons, checkboxes, dropdowns, toggles) and displays optional validation or informational messages.

### Import
```tsx
import { FormField } from '@bosch/react-frok';
```

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `fieldType` | `'text' \| 'password' \| 'textarea' \| 'radio' \| 'checkbox' \| 'dropdown' \| 'toggle'` | Yes | - | The type of form field being wrapped |
| `size` | `'quarter' \| 'half'` | No | - | Controls the width of the form field |
| `notificationText` | `ReactNode` | No | - | Text to display in the notification below the field |
| `notificationType` | `'neutral' \| 'success' \| 'warning' \| 'error'` | No | `'neutral'` | The type/severity of the notification |
| `children` | `ReactElement` | Yes | - | A single form control element (TextField, TextArea, RadioButton, Checkbox, Dropdown, or Toggle) |
| `className` | `string` | No | - | Additional CSS classes |

### Variants

**Size Variants:**
- Default (full width): No size prop specified
- `quarter`: 25% width (flex-basis: 25%, flex-grow: 0)
- `half`: 50% width (flex-basis: 50%)

**Field Type Variants:**
The component applies different styling based on `fieldType`:
- `radio`: Adds top margin and notification spacing
- `checkbox`: Adds top margin, notification spacing, and unsets label position
- `dropdown`: Adds top margin
- `toggle`: Adds top margin and notification spacing

### CSS Classes

| Class | Description |
|-------|-------------|
| `m-form-field` | Base class for the component |
| `m-form-field--radio` | Applied when `fieldType="radio"` |
| `m-form-field--checkbox` | Applied when `fieldType="checkbox"` |
| `m-form-field--dropdown` | Applied when `fieldType="dropdown"` |
| `m-form-field--toggle` | Applied when `fieldType="toggle"` |
| `-quarter` | Applied when `size="quarter"` |
| `-half` | Applied when `size="half"` |

### Usage Example

```tsx
import { FormField, TextField } from '@bosch/react-frok';

// Basic text field with error notification
<FormField
  fieldType="text"
  notificationText="This field is required"
  notificationType="error"
>
  <TextField
    label="Email"
    placeholder="Enter your email"
  />
</FormField>

// Half-width field with success notification
<FormField
  fieldType="text"
  size="half"
  notificationText="Valid email address"
  notificationType="success"
>
  <TextField
    label="Email"
    value="user@example.com"
  />
</FormField>

// Checkbox field
<FormField
  fieldType="checkbox"
  notificationText="Please agree to continue"
  notificationType="warning"
>
  <Checkbox label="I agree to the terms and conditions" />
</FormField>
```

### Do's and Don'ts

**Do:**
- Use the correct `fieldType` that matches your child component
- Use notifications to provide helpful validation feedback or contextual information
- Use size variants (`quarter`, `half`) to create consistent form layouts
- Keep notification text concise and actionable

**Don't:**
- Pass multiple children - FormField only accepts a single form control element
- Mismatch the `fieldType` prop with the actual child component type
- Use FormField for non-form elements
- Nest FormField components

### Related Components
- TextField: Text input field (atom)
- TextArea: Multi-line text input (atom)
- RadioButton: Single-choice selection (atom)
- Checkbox: Multiple-choice selection (atom)
- Dropdown: Dropdown select (atom)
- Toggle: On/off switch (atom)
- Notification: Message display component (atom)

---

## SearchForm

### Purpose
SearchForm is a molecule component that provides a complete search form with an integrated search field and optional search suggestions. It handles form submission, reset functionality, and manages the interaction between the search input and suggestions dropdown.

### Import
```tsx
import { SearchForm } from '@bosch/react-frok';
```

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `searchField` | `Slot<TextFieldProps>` | No | Default search configuration | Configuration for the search input field |
| `suggestions` | `Slot<SearchSuggestionsProps>` | No | - | Search suggestions component configuration |
| `onSubmit` | `(ev: React.SyntheticEvent<HTMLElement>, props?: SearchFormProps) => void` | No | - | Callback when form is submitted |
| `onReset` | `(ev: React.SyntheticEvent<HTMLElement>, props?: SearchFormProps) => void` | No | - | Callback when reset button is clicked |
| `action` | `string` | No | - | Form action URL (if not provided, preventDefault is called) |
| `as` | `React.ElementType` | No | `'form'` | Component type to render as |
| `className` | `string` | No | - | Additional CSS classes |

**Default Search Field Props:**
When `searchField` is not provided or uses defaults, the following are applied:
- `placeholder`: "Search"
- `name`: "search"
- `type`: "search"
- `resetButton`: Enabled with button type
- `searchButton`: Enabled with button type
- `autoComplete`: "off" (when rendered as form element)

### Variants

The component can be rendered as different HTML elements using the `as` prop (defaults to `'form'`).

### CSS Classes

| Class | Description |
|-------|-------------|
| `m-search-form` | Base class for the component |

Note: The searchForm.scss file contains no styles - styling is handled by child components (TextField and SearchSuggestions).

### Usage Example

```tsx
import { SearchForm } from '@bosch/react-frok';

// Basic search form
<SearchForm
  onSubmit={(ev, props) => {
    console.log('Search submitted');
  }}
/>

// Search form with custom field configuration
<SearchForm
  searchField={{
    placeholder: "Search products...",
    name: "product-search"
  }}
  onSubmit={(ev, props) => {
    // Handle search
  }}
  onReset={(ev, props) => {
    // Handle reset
  }}
/>

// Search form with suggestions
<SearchForm
  searchField={{
    placeholder: "Search"
  }}
  suggestions={{
    children: [
      <a href="/results?q=laptop">Laptop</a>,
      <a href="/results?q=phone">Phone</a>,
      <a href="/all-results">View all results</a>
    ]
  }}
  onSubmit={(ev, props) => {
    // Handle search
  }}
/>

// With form action (traditional form submission)
<SearchForm
  action="/search"
  searchField={{
    name: "q"
  }}
/>
```

### Do's and Don'ts

**Do:**
- Use `onSubmit` to handle search logic in client-side applications
- Provide an `action` prop for server-side form handling
- Use the `suggestions` prop to show search recommendations or quick links
- Handle both submit and reset events for complete control

**Don't:**
- Pass `children` prop - SearchForm manages its own children
- Override the password button - it's explicitly set to null for search fields
- Forget to handle form submission if not providing an `action` prop

### Related Components
- TextField: Used internally for the search input (atom)
- SearchSuggestions: Optional suggestions dropdown (atom)

---

## SearchSuggestions

### Purpose
SearchSuggestions is an atom component that displays a list of search suggestions or results. It wraps child elements in a styled list structure, automatically applying appropriate classes to distinguish between regular suggestions and the final "view all" link.

### Import
```tsx
import { SearchSuggestions } from '@bosch/react-frok';
```

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `children` | `Array<React.ReactElement>` | No | `null` | Array of suggestion elements (typically links) |
| `as` | `React.ElementType` | No | `'ul'` | Component type to render the list as |
| `className` | `string` | No | - | Additional CSS classes |
| `style` | `React.CSSProperties` | No | - | Inline styles |

### Variants

The component can be rendered as different list elements using the `as` prop (defaults to `'ul'`).

### CSS Classes

| Class | Description |
|-------|-------------|
| `a-search-suggestions` | Base wrapper class |
| `a-search-suggestions__item` | Applied to each `<li>` wrapper around suggestions |
| `a-search-suggestions__result-link` | Applied to suggestion links (all except the last item) and wrapping `<li>` of the last item |
| `a-search-suggestions__results-link` | Available for styling the final "view all results" link container |

**Styling Details:**
- Links have no text decoration by default, underline on hover
- List items have no bullet points (content: none)
- The last child is treated specially - its `<li>` gets the `result-link` class
- All suggestions except the last have `tabIndex: -1` applied
- `em` tags within result links are bold, not italic

### Usage Example

```tsx
import { SearchSuggestions } from '@bosch/react-frok';

// Basic suggestions list
<SearchSuggestions>
  {[
    <a href="/results?q=laptop">Laptop computers</a>,
    <a href="/results?q=keyboard">Wireless <em>keyboards</em></a>,
    <a href="/results?q=mouse">Gaming mice</a>,
    <a href="/all-results">View all results</a>
  ]}
</SearchSuggestions>

// With emphasized matching text
<SearchSuggestions>
  {[
    <a href="/results?q=power">
      <em>Power</em> tools
    </a>,
    <a href="/results?q=power">
      <em>Power</em> supply
    </a>,
    <a href="/browse/power">
      See all <em>power</em> products
    </a>
  ]}
</SearchSuggestions>

// Returns null when no children
<SearchSuggestions>
  {null}
</SearchSuggestions>
```

### Do's and Don'ts

**Do:**
- Use `em` tags to highlight matching search terms within suggestions
- Include a final "view all results" link as the last child for better UX
- Provide meaningful link destinations for each suggestion
- Return empty/null children when there are no suggestions to display

**Don't:**
- Pass non-array or single children - expects an array of elements
- Rely on default browser list styling - bullet points are removed
- Use this component for non-search-related lists
- Include interactive elements other than links as children

### Related Components
- SearchForm: Parent component that uses SearchSuggestions (molecule)
- TextField: Used in SearchForm for the search input (atom)
---

## Slider

### Purpose
A slider component for selecting a numeric value from a range. Features draggable thumb control, optional labels on either side, and an optional tooltip showing the current value.

### Import
```tsx
import { Slider } from '@bosch/react-frok';
```

### Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| labelLeft | SliderLabelType | undefined | No | Label or element displayed on the left side of the slider |
| labelRight | SliderLabelType | undefined | No | Label or element displayed on the right side of the slider |
| labelsOnTop | boolean | false | No | When true, positions labels above the slider instead of on the sides |
| tooltip | boolean \| string \| TooltipProps | undefined | No | Controls tooltip display. Can be boolean to show/hide, string for custom text, or TooltipProps object for full control |
| tooltipUnit | string | '' | No | Unit text appended to tooltip value (e.g., "px", "%", "kg") |
| isTooltipInPercent | boolean | false | No | When true, tooltip displays percentage value instead of actual value |
| input | InputHTMLAttributes<HTMLInputElement> | {} | No | Props passed to the underlying range input element (min, max, value, step, etc.) |

*Note: Extends `HTMLAttributes<HTMLDivElement>`, so all standard div attributes are supported.*

**SliderLabelType** can be:
- `string`: Text label
- `React.DetailedHTMLProps<React.LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>`: Label element props
- `React.ReactElement<HTMLLabelElement>`: Custom label element

### Variants
- **Default**: Basic slider without labels or tooltip
- **With Labels**: Slider with left and/or right labels
- **Labels on Top**: Labels positioned above the slider (`labelsOnTop={true}`)
- **With Tooltip**: Shows value in a tooltip when hovering (`tooltip={true}`)
- **Custom Tooltip**: Tooltip with custom text or unit (`tooltip="Custom"` or `tooltipUnit="px"`)
- **Percentage Tooltip**: Shows percentage value in tooltip (`isTooltipInPercent={true}`)

### CSS Classes
- `a-slider`: Base class for the slider container
- `a-slider--labels-on-top`: Modifier class when labels are positioned on top
- `a-tooltip`: Class for the tooltip element
- `-floating-shadow-s`: Shadow modifier for floating tooltip

**CSS Custom Properties:**
- `--slider-percentage`: Set dynamically to track thumb position (0-100)
- `--color`: Set dynamically based on interaction state (#007bc0 normal, #00629a hover, #004975 active)

### Usage Example
```tsx
import { Slider } from '@bosch/react-frok';
import { useState } from 'react';

// Basic slider
<Slider
  input={{
    id: 'volume',
    min: 0,
    max: 100,
    defaultValue: 50
  }}
/>

// Slider with labels
<Slider
  labelLeft="Min"
  labelRight="Max"
  input={{
    id: 'brightness',
    min: 0,
    max: 100,
    value: 75
  }}
/>

// Slider with tooltip and unit
<Slider
  tooltip={true}
  tooltipUnit="px"
  input={{
    id: 'size',
    min: 12,
    max: 48,
    step: 2,
    defaultValue: 16
  }}
/>

// Slider with percentage tooltip
<Slider
  tooltip={true}
  tooltipUnit="%"
  isTooltipInPercent={true}
  input={{
    id: 'opacity',
    min: 0,
    max: 100,
    value: 80
  }}
/>

// Controlled slider with labels on top
function VolumeControl() {
  const [volume, setVolume] = useState(50);

  return (
    <Slider
      labelLeft="Volume"
      labelRight={`${volume}%`}
      labelsOnTop={true}
      tooltip={true}
      input={{
        id: 'audio-volume',
        min: 0,
        max: 100,
        value: volume,
        onChange: (e) => setVolume(Number(e.target.value))
      }}
    />
  );
}
```

### Do's and Don'ts

**Do:**
- Set appropriate min, max, and step values in the input prop
- Use tooltipUnit to provide context for the value
- Use labels to describe what the slider controls
- Consider using labelsOnTop for better layout in narrow spaces
- Use step attribute for discrete values (e.g., step={5} for increments of 5)

**Don't:**
- Use sliders for precise numeric input (use TextField instead)
- Use sliders with very large ranges where precision matters
- Forget to provide context through labels or tooltips
- Use both labelLeft and labelRight when labelsOnTop is true (may cause layout issues)

### Related Components
- TextField (for precise numeric input)
- ProgressIndicator (for displaying progress, not for input)

---

## Rating

### Purpose
A star rating component for displaying or collecting user ratings. Supports interactive rating selection or read-only display, with customizable size and maximum number of stars.

### Import
```tsx
import { Rating } from '@bosch/react-frok';
```

### Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| size | 'small' \| 'large' | 'large' | No | Size variation of the rating stars |
| link | Slot<'a'> | undefined | No | Link slot for read-only ratings. When provided, the rating becomes clickable |
| disabled | boolean | false | No | Disables interaction, no events will fire |
| max | number | 5 | No | Maximum number of stars to display |
| value | number | undefined | No | Controlled rating value (can be integer or float) |
| defaultValue | number | undefined | No | Default rating value for uncontrolled component |
| label | Slot<'span'> | undefined | No | Label slot to display custom label (defaults to showing the rating value) |
| completeLabel | Slot<'span'> | undefined | No | Complete label slot (defaults to "(value/max)" format) |
| readOnly | boolean | false | No | When true, rating cannot be changed by user interaction |
| onChange | (ev: SyntheticEvent, newValue?: number) => void | undefined | No | Callback invoked when rating is changed (star clicked) |
| onHover | (ev: SyntheticEvent, hoveredValue: number) => void | undefined | No | Callback invoked when a rating star is hovered |
| as | ElementType | 'div' | No | The element type to render as |

*Note: Extends `HTMLAttributes<HTMLElement>`, so all standard HTML attributes are supported.*

**Slot<'a'>** and **Slot<'span'>** can be:
- Object with element props (e.g., `{ href: '/reviews', children: <StarContainer /> }`)
- React element

### Variants
- **Large (default)**: Larger star size (`size="large"`)
- **Small**: Smaller star size (`size="small"`)
- **Interactive**: User can click to rate (default when `readOnly={false}`)
- **Read-only**: Display-only mode (`readOnly={true}`)
- **With Link**: Clickable rating that navigates (`link={{ href: '/reviews' }}`)
- **Disabled**: Non-interactive state (`disabled={true}`)

### CSS Classes
- `a-rating`: Base class for the rating container
- `a-rating--large`: Modifier for large size
- `a-rating--small`: Modifier for small size
- `a-rating--selection`: Applied when no link is provided (interactive mode)
- `a-rating--link`: Applied when link is provided
- `a-rating--disabled`: Applied when disabled
- `a-rating__star-container`: Container for star icons
- `a-rating__label-container`: Container for label elements
- `a-rating__label`: Base class for labels
- `a-rating__label--complete`: Additional class for complete label

**Icon names used:**
- `nosafe-star-fill`: Filled star (for rated stars)
- `nosafe-star-half`: Half-filled star (during hover)
- `nosafe-star`: Empty star (unrated stars)

### Usage Example
```tsx
import { Rating } from '@bosch/react-frok';
import { useState } from 'react';

// Basic interactive rating
<Rating
  defaultValue={3}
  onChange={(e, newValue) => console.log('Rating:', newValue)}
/>

// Small size rating
<Rating
  size="small"
  value={4.5}
  readOnly
/>

// Read-only rating with link
<Rating
  readOnly
  value={4.2}
  link={{ href: '/product-reviews' }}
/>

// Custom max stars
<Rating
  max={10}
  defaultValue={7}
/>

// Controlled rating with hover feedback
function ProductRating() {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div>
      <Rating
        value={rating}
        onChange={(e, newValue) => setRating(newValue || 0)}
        onHover={(e, hoveredValue) => setHoverRating(hoveredValue)}
      />
      <p>
        {hoverRating > 0
          ? `Hovering: ${hoverRating} stars`
          : `Current rating: ${rating} stars`}
      </p>
    </div>
  );
}

// Disabled rating
<Rating
  value={3}
  disabled
/>

// Custom labels
<Rating
  value={4}
  label={{ children: '4.0' }}
  completeLabel={{ children: 'out of 5 stars' }}
  readOnly
/>
```

### Do's and Don'ts

**Do:**
- Use readOnly mode for displaying existing ratings
- Use interactive mode for collecting user ratings
- Provide onChange callback for interactive ratings
- Use appropriate size based on context (small for compact spaces)
- Use link prop when rating should navigate to detailed reviews
- Consider using onHover for preview feedback

**Don't:**
- Use Rating for non-rating purposes (use other icons/buttons instead)
- Forget to set readOnly when displaying existing ratings
- Make ratings interactive without onChange handler
- Use very large max values (stick to 5 or 10 for usability)
- Mix controlled and uncontrolled patterns

### Related Components
- Icon (used internally for star rendering)
- Button (for standalone rating actions)

---

## ProgressIndicator

### Purpose
A progress indicator component that shows the progress of an operation. Supports both determinate (known progress) and indeterminate (unknown/ongoing progress) modes.

### Import
```tsx
import { ProgressIndicator } from '@bosch/react-frok';
```

### Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| type | 'determinate' \| 'indeterminate' | 'indeterminate' | No | Type of progress indicator |
| progressId | string | undefined | No | Identifier for the progress element (deprecated, use `id` instead) |
| progress | number | undefined | No | Progress value 0-100 (deprecated, use `value` instead) |
| value | number | undefined | No | Current progress value (0-100 for determinate) |
| max | number | 100 | No | Maximum value for the progress indicator |
| id | string | undefined | No | HTML id attribute |

*Note: Extends `ProgressHTMLAttributes<HTMLProgressElement>`, so all standard progress element attributes are supported.*

### Variants
- **Indeterminate (default)**: Shows continuous animation for unknown progress (`type="indeterminate"`)
- **Determinate**: Shows specific progress value (`type="determinate"`, requires `value` prop)

### CSS Classes
- `a-progress-indicator-container`: Container wrapper for the progress indicator
- `a-progress-indicator`: Base class for the progress element
- `-indeterminate`: Modifier class for indeterminate type
- `-determinate`: Modifier class for determinate type
- `a-progress-indicator__inner-bar`: Inner bar element (static for determinate)
- `a-progress-indicator__anim-bar`: Animated bar wrapper (only for indeterminate)

### Usage Example
```tsx
import { ProgressIndicator } from '@bosch/react-frok';
import { useState, useEffect } from 'react';

// Indeterminate progress (loading)
<ProgressIndicator type="indeterminate" />

// Determinate progress with specific value
<ProgressIndicator
  type="determinate"
  value={75}
/>

// Using deprecated props (still supported)
<ProgressIndicator
  type="determinate"
  progressId="upload-progress"
  progress={45}
/>

// Controlled progress example
function FileUpload() {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const startUpload = () => {
    setUploading(true);
    setProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  return (
    <div>
      <button onClick={startUpload} disabled={uploading}>
        Upload File
      </button>
      {uploading && (
        <div>
          <ProgressIndicator
            type="determinate"
            value={progress}
            id="upload-progress"
          />
          <p>{progress}% complete</p>
        </div>
      )}
    </div>
  );
}

// Indeterminate for unknown duration tasks
function DataFetch() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData().finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <p>Loading data...</p>
        <ProgressIndicator type="indeterminate" />
      </div>
    );
  }

  return <div>Data loaded!</div>;
}
```

### Do's and Don'ts

**Do:**
- Use indeterminate type when progress is unknown or continuous
- Use determinate type when you can calculate actual progress
- Provide value between 0-100 for determinate progress
- Update progress values smoothly for better UX
- Provide context text explaining what's loading/processing
- Hide progress indicator when task completes

**Don't:**
- Use determinate type without providing value prop
- Use for instant operations (under 1 second)
- Forget to update progress values in determinate mode
- Use progress indicator as a design element (use dividers/borders instead)
- Mix indeterminate and determinate in the same loading context
- Use deprecated progressId and progress props in new code (use id and value instead)

### Related Components
- Spinner (for inline/icon-based loading states)
- Skeleton (for content placeholders during loading)
- Slider (for user input, not progress display)
