# Input Components

Text input components: TextField and TextArea.

---

## TextField

Single-line text input.

### Import
```tsx
import { TextField } from '@bosch/react-frok';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | - | Controlled value |
| `defaultValue` | `string` | - | Uncontrolled default value |
| `name` | `string` | - | Form field name |
| `type` | `'text' \| 'password' \| 'email' \| 'number' \| 'tel' \| 'url'` | `'text'` | Input type |
| `placeholder` | `string` | - | Placeholder text |
| `disabled` | `boolean` | `false` | Disable input |
| `readOnly` | `boolean` | `false` | Read-only mode |
| `required` | `boolean` | `false` | Mark as required |
| `maxLength` | `number` | - | Maximum characters |
| `pattern` | `string` | - | Validation regex |
| `icon` | `string` | - | Icon name (left side) |
| `iconAfter` | `string` | - | Icon name (right side) |
| `onChange` | `(e: ChangeEvent) => void` | - | Change handler |
| `onFocus` | `(e: FocusEvent) => void` | - | Focus handler |
| `onBlur` | `(e: FocusEvent) => void` | - | Blur handler |
| `className` | `string` | - | Additional CSS classes |

### CSS Classes

| Class | Description |
|-------|-------------|
| `.a-text-field` | Base input wrapper |
| `.a-text-field__input` | Actual input element |
| `.a-text-field__icon` | Icon element |
| `.a-text-field--disabled` | Disabled state |
| `.a-text-field--error` | Error state |
| `.a-text-field--focused` | Focused state |

### CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--g-gray-85` | `#d0d4d8` | Border color |
| `--g-blue-50` | `#007bc0` | Focus border color |
| `--g-red-50` | `#ed0007` | Error border color |
| `--g-gray-100` | `#ffffff` | Background |
| `--g-gray-65` | `#979ea4` | Placeholder color |
| `--g-gray-90` | `#e0e2e5` | Disabled background |

### Usage

```tsx
// Basic
<TextField name="username" placeholder="Enter username" />

// Controlled
const [value, setValue] = useState('');
<TextField 
  value={value} 
  onChange={(e) => setValue(e.target.value)} 
/>

// With icon
<TextField icon="search" placeholder="Search..." />

// Password
<TextField type="password" name="password" placeholder="Password" />

// With FormField
<FormField label="Email" required>
  <TextField type="email" name="email" required />
</FormField>
```

---

## TextArea

Multi-line text input.

### Import
```tsx
import { TextArea } from '@bosch/react-frok';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | - | Controlled value |
| `defaultValue` | `string` | - | Uncontrolled default value |
| `name` | `string` | - | Form field name |
| `placeholder` | `string` | - | Placeholder text |
| `disabled` | `boolean` | `false` | Disable input |
| `readOnly` | `boolean` | `false` | Read-only mode |
| `required` | `boolean` | `false` | Mark as required |
| `maxLength` | `number` | - | Maximum characters |
| `rows` | `number` | `3` | Number of visible rows |
| `resize` | `'none' \| 'vertical' \| 'horizontal' \| 'both'` | `'vertical'` | Resize behavior |
| `onChange` | `(e: ChangeEvent) => void` | - | Change handler |
| `className` | `string` | - | Additional CSS classes |

### CSS Classes

| Class | Description |
|-------|-------------|
| `.a-text-area` | Base textarea styles |
| `.a-text-area--disabled` | Disabled state |
| `.a-text-area--error` | Error state |

### CSS Variables

Same as TextField — border colors, backgrounds, focus states.

### Usage

```tsx
// Basic
<TextArea name="description" placeholder="Enter description..." />

// With rows
<TextArea rows={5} placeholder="Enter long text..." />

// Non-resizable
<TextArea resize="none" rows={4} />

// With FormField and validation
<FormField label="Comments" hint="Maximum 500 characters">
  <TextArea name="comments" maxLength={500} />
</FormField>
```

---

## Form Field Integration

Always wrap inputs with `<FormField>` for proper labels and error handling:

```tsx
import { FormField, TextField, TextArea } from '@bosch/react-frok';

// Standard form field
<FormField label="Username" required>
  <TextField name="username" required />
</FormField>

// With error message
<FormField label="Email" error="Invalid email format">
  <TextField type="email" name="email" />
</FormField>

// With hint
<FormField label="Password" hint="Minimum 8 characters">
  <TextField type="password" name="password" />
</FormField>

// Textarea
<FormField label="Bio">
  <TextArea name="bio" rows={4} />
</FormField>
```

---

## Custom Styling

### Override Border Color
```scss
.my-custom-input {
  .a-text-field__input {
    border-color: var(--g-purple-50);
    
    &:focus {
      border-color: var(--g-purple-40);
    }
  }
}
```

### Custom Width
```tsx
<TextField 
  name="zipcode" 
  placeholder="ZIP" 
  style={{ width: '120px' }}
/>
```

---

## Validation Patterns

### Email Validation
```tsx
<FormField 
  label="Email" 
  error={!isValidEmail(email) ? 'Invalid email' : undefined}
>
  <TextField 
    type="email" 
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
</FormField>
```

### Required Field
```tsx
<FormField label="Name" required>
  <TextField name="name" required />
</FormField>
```

### Character Counter
```tsx
const [text, setText] = useState('');
const maxLength = 200;

<FormField 
  label="Description" 
  hint={`${text.length}/${maxLength} characters`}
>
  <TextArea 
    value={text}
    onChange={(e) => setText(e.target.value)}
    maxLength={maxLength}
  />
</FormField>
```

---

## Do's and Don'ts

**Do:**
- Always use `<FormField>` wrapper for accessibility
- Provide meaningful placeholder text
- Use appropriate `type` for validation hints
- Show character count for limited fields

**Don't:**
- Don't use placeholder as the only label
- Don't allow unlimited textarea resize in fixed layouts
- Don't forget to handle error states visually

---

## Related Components
- [FormField](../molecules/form-field.md) — Label + validation wrapper
- [SearchForm](../molecules/search-form.md) — Search-specific input
- [Dropdown](../molecules/dropdown.md) — Select input alternative
