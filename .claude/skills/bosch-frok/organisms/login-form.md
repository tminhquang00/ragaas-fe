# LoginForm

Authentication form with username/password fields.

---

## Import

```tsx
import { LoginForm } from '@bosch/react-frok';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onSubmit` | `(credentials: Credentials) => void` | - | **Required** — Submit handler |
| `onForgotPassword` | `() => void` | - | Forgot password handler |
| `error` | `string` | - | Error message |
| `loading` | `boolean` | `false` | Loading state |
| `logo` | `ReactNode` | - | Logo element |
| `title` | `string` | `'Sign In'` | Form title |
| `rememberMe` | `boolean` | `true` | Show remember me |
| `socialProviders` | `SocialProvider[]` | - | OAuth providers |
| `className` | `string` | - | Additional CSS classes |

### Credentials Type
```typescript
interface Credentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}
```

### SocialProvider Type
```typescript
interface SocialProvider {
  name: string;
  icon: string;
  onClick: () => void;
}
```

---

## CSS Classes

| Class | Description |
|-------|-------------|
| `.o-login-form` | Base container |
| `.o-login-form__logo` | Logo container |
| `.o-login-form__title` | Form title |
| `.o-login-form__form` | Form element |
| `.o-login-form__field` | Input field group |
| `.o-login-form__error` | Error message |
| `.o-login-form__actions` | Submit/forgot password |
| `.o-login-form__remember` | Remember me checkbox |
| `.o-login-form__social` | Social login section |
| `.o-login-form__divider` | "or" divider |

---

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--g-gray-100` | `#ffffff` | Background |
| `--g-gray-20` | `#2a2f34` | Text color |
| `--g-red-50` | `#ed0007` | Error color |
| `--g-blue-50` | `#007bc0` | Link/focus color |

---

## Usage Examples

### Basic Login Form
```tsx
<LoginForm
  onSubmit={(credentials) => {
    loginUser(credentials);
  }}
/>
```

### With Logo and Title
```tsx
<LoginForm
  logo={<Image img={{ src: '/logo.svg', alt: 'Company Logo' }} />}
  title="Welcome Back"
  onSubmit={handleLogin}
/>
```

### With Error Handling
```tsx
const [error, setError] = useState('');
const [loading, setLoading] = useState(false);

const handleLogin = async (credentials) => {
  setLoading(true);
  setError('');
  
  try {
    await authenticateUser(credentials);
    navigate('/dashboard');
  } catch (err) {
    setError('Invalid username or password');
  } finally {
    setLoading(false);
  }
};

<LoginForm
  onSubmit={handleLogin}
  error={error}
  loading={loading}
/>
```

### With Forgot Password
```tsx
<LoginForm
  onSubmit={handleLogin}
  onForgotPassword={() => navigate('/forgot-password')}
/>
```

### With Social Login
```tsx
<LoginForm
  onSubmit={handleLogin}
  socialProviders={[
    { 
      name: 'Microsoft', 
      icon: 'microsoft', 
      onClick: () => handleOAuth('microsoft') 
    },
    { 
      name: 'Google', 
      icon: 'google', 
      onClick: () => handleOAuth('google') 
    }
  ]}
/>
```

### Full Featured Login
```tsx
<div style={{ 
  minHeight: '100vh', 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center',
  background: 'var(--g-gray-95)'
}}>
  <div style={{ 
    width: '400px', 
    padding: '2rem', 
    background: 'white',
    borderRadius: '8px',
    boxShadow: 'var(--shadow-elevation-2)'
  }}>
    <LoginForm
      logo={<Image img={{ src: '/logo.svg', alt: 'Bosch' }} />}
      title="Sign In to Your Account"
      onSubmit={handleLogin}
      onForgotPassword={() => setShowForgotPassword(true)}
      error={error}
      loading={loading}
      rememberMe
      socialProviders={[
        { name: 'Azure AD', icon: 'microsoft', onClick: handleAzureLogin }
      ]}
    />
    
    <Divider style={{ margin: '1.5rem 0' }} />
    
    <Text align="center">
      Don't have an account?{' '}
      <Link href="/register">Sign up</Link>
    </Text>
  </div>
</div>
```

### Custom Login Form (Manual)
```tsx
const [username, setUsername] = useState('');
const [password, setPassword] = useState('');
const [rememberMe, setRememberMe] = useState(false);
const [error, setError] = useState('');

const handleSubmit = (e) => {
  e.preventDefault();
  // Validation and submit
};

<form onSubmit={handleSubmit}>
  <FormField label="Username" error={error && !username ? 'Required' : ''}>
    <TextField
      value={username}
      onChange={(e) => setUsername(e.target.value)}
      placeholder="Enter username"
      autoComplete="username"
    />
  </FormField>
  
  <FormField label="Password">
    <TextField
      type="password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      placeholder="Enter password"
      autoComplete="current-password"
    />
  </FormField>
  
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <Checkbox
      label="Remember me"
      checked={rememberMe}
      onChange={() => setRememberMe(!rememberMe)}
    />
    <Link href="/forgot-password" className="-size-s">
      Forgot password?
    </Link>
  </div>
  
  {error && (
    <Notification type="error" style={{ marginTop: '1rem' }}>
      {error}
    </Notification>
  )}
  
  <Button 
    mode="primary" 
    type="submit" 
    style={{ width: '100%', marginTop: '1.5rem' }}
  >
    Sign In
  </Button>
</form>
```

### Two-Factor Authentication
```tsx
const [step, setStep] = useState<'credentials' | 'mfa'>('credentials');
const [mfaCode, setMfaCode] = useState('');

{step === 'credentials' ? (
  <LoginForm
    onSubmit={async (credentials) => {
      const result = await authenticate(credentials);
      if (result.requiresMfa) {
        setStep('mfa');
      }
    }}
  />
) : (
  <div style={{ textAlign: 'center' }}>
    <h2>Two-Factor Authentication</h2>
    <p>Enter the code from your authenticator app</p>
    
    <FormField label="Verification Code">
      <TextField
        value={mfaCode}
        onChange={(e) => setMfaCode(e.target.value)}
        placeholder="000000"
        maxLength={6}
        style={{ textAlign: 'center', letterSpacing: '0.5em' }}
      />
    </FormField>
    
    <Button mode="primary" onClick={verifyMfa}>
      Verify
    </Button>
  </div>
)}
```

---

## Accessibility

```tsx
<LoginForm
  onSubmit={handleLogin}
  aria-label="Login form"
/>
```

- Form fields have associated labels
- Error messages linked with `aria-describedby`
- Focus managed on error
- Submit with Enter key

---

## Do's and Don'ts

**Do:**
- Show clear error messages
- Support keyboard submission
- Use autocomplete attributes
- Show loading state during submit

**Don't:**
- Don't expose specific error details (security)
- Don't auto-fill passwords visibly
- Don't block copy/paste in password field
- Don't use CAPTCHA for every attempt

---

## Related Components
- [FormField](../molecules/form-field.md) — Form field wrapper
- [TextField](../atoms/input.md) — Input component
- [Button](../atoms/button.md) — Submit button
- [Checkbox](../atoms/checkbox.md) — Remember me
