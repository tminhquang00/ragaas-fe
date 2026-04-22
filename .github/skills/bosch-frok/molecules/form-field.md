# FormField

Label + input + validation wrapper for form inputs.

---

## Import

```tsx
import { FormField } from '@bosch/react-frok';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Field label text |
| `required` | `boolean` | `false` | Show required indicator |
| `error` | `string` | - | Error message to display |
| `hint` | `string` | - | Helper text below input |
| `children` | `ReactNode` | - | Input component (TextField, TextArea, etc.) |
| `htmlFor` | `string` | - | ID of the input for label association |
| `className` | `string` | - | Additional CSS classes |

---

## CSS Classes

| Class | Description |
|-------|-------------|
| `.m-form-field` | Base wrapper styles |
| `.m-form-field__label` | Label element |
| `.m-form-field__required` | Required indicator (*) |
| `.m-form-field__input` | Input container |
| `.m-form-field__hint` | Hint text |
| `.m-form-field__error` | Error message |
| `.m-form-field--error` | Error state on wrapper |

---

## CSS Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `--g-gray-50` | `#71767c` | Label color |
| `--g-gray-65` | `#979ea4` | Hint text color |
| `--g-red-50` | `#ed0007` | Error text & border |
| `--g-blue-50` | `#007bc0` | Focus border |

---

## Usage Examples

### Basic Field
```tsx
<FormField label="Username">
  <TextField name="username" placeholder="Enter username" />
</FormField>
```

### Required Field
```tsx
<FormField label="Email" required>
  <TextField type="email" name="email" required />
</FormField>
```

### With Error
```tsx
<FormField label="Password" error="Password must be at least 8 characters">
  <TextField type="password" name="password" />
</FormField>
```

### With Hint
```tsx
<FormField label="Bio" hint="Maximum 200 characters">
  <TextArea name="bio" maxLength={200} />
</FormField>
```

### Complete Form
```tsx
<Form description="Registration Form">
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
    <FormField label="Full Name" required>
      <TextField name="name" required />
    </FormField>
    
    <FormField label="Email" required error={errors.email}>
      <TextField type="email" name="email" required />
    </FormField>
    
    <FormField 
      label="Password" 
      required 
      hint="Minimum 8 characters"
      error={errors.password}
    >
      <TextField type="password" name="password" required />
    </FormField>
    
    <FormField label="Country">
      <Dropdown
        name="country"
        options={countries}
        value={country}
        onChange={setCountry}
      />
    </FormField>
    
    <FormField>
      <Checkbox id="terms" label="I accept the terms and conditions" />
    </FormField>
  </div>
  
  <div style={{ marginTop: '2rem' }}>
    <Button mode="primary" type="submit">Register</Button>
  </div>
</Form>
```

### Dynamic Validation
```tsx
const [email, setEmail] = useState('');
const [touched, setTouched] = useState(false);

const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const showError = touched && !isValid && email.length > 0;

<FormField 
  label="Email" 
  required
  error={showError ? 'Please enter a valid email address' : undefined}
>
  <TextField
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    onBlur={() => setTouched(true)}
  />
</FormField>
```

### With Character Counter
```tsx
const [text, setText] = useState('');
const maxLength = 200;

<FormField 
  label="Description" 
  hint={`${text.length}/${maxLength} characters`}
  error={text.length > maxLength ? 'Too long' : undefined}
>
  <TextArea
    value={text}
    onChange={(e) => setText(e.target.value)}
    rows={4}
  />
</FormField>
```

### Horizontal Layout
```tsx
<div style={{ 
  display: 'grid', 
  gridTemplateColumns: '200px 1fr', 
  alignItems: 'start',
  gap: '1rem' 
}}>
  <label className="-size-s label" style={{ paddingTop: '0.5rem' }}>
    Username
  </label>
  <TextField name="username" />
</div>
```

---

## RadioButton Group

For mutually exclusive options, use RadioButton inside FormField:

```tsx
import { RadioButton } from '@bosch/react-frok';

<FormField label="Plan Type">
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
    <RadioButton 
      id="plan-free" 
      name="plan" 
      value="free"
      label="Free"
      checked={plan === 'free'}
      onChange={() => setPlan('free')}
    />
    <RadioButton 
      id="plan-pro" 
      name="plan" 
      value="pro"
      label="Pro"
      checked={plan === 'pro'}
      onChange={() => setPlan('pro')}
    />
    <RadioButton 
      id="plan-enterprise" 
      name="plan" 
      value="enterprise"
      label="Enterprise"
      checked={plan === 'enterprise'}
      onChange={() => setPlan('enterprise')}
    />
  </div>
</FormField>
```

---

## Do's and Don'ts

**Do:**
- Always wrap inputs with FormField for accessibility
- Use meaningful labels and error messages
- Show errors only after user interaction (touched state)
- Use hints for format requirements or character limits

**Don't:**
- Don't use placeholder as the only label
- Don't show all validation errors before user input
- Don't use red color for hints (reserve for errors)

---

## Related Components
- [TextField / TextArea](../atoms/input.md) — Input components
- [Dropdown](dropdown.md) — Select input
- [Form](../organisms/form.md) — Form container
- [Checkbox](../atoms/checkbox.md) — Multi-select option
