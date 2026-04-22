# StepIndicator

Multi-step progress indicator for wizards and processes.

---

## Import

```tsx
import { StepIndicator } from '@bosch/react-frok';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `steps` | `Step[]` | - | **Required** — Array of steps |
| `currentStep` | `number` | `0` | Active step index (0-based) |
| `onStepClick` | `(index: number) => void` | - | Step click handler |
| `small` | `boolean` | `false` | Compact variant |
| `clickable` | `boolean` | `false` | Allow clicking past steps |
| `className` | `string` | - | Additional CSS classes |

### Step Type
```typescript
interface Step {
  label: string;
  description?: string;
  completed?: boolean;
  error?: boolean;
}
```

---

## CSS Classes

| Class | Description |
|-------|-------------|
| `.m-step-indicator` | Base container |
| `.m-step-indicator__step` | Individual step |
| `.m-step-indicator__step--active` | Current step |
| `.m-step-indicator__step--completed` | Completed step |
| `.m-step-indicator__step--error` | Error state |
| `.m-step-indicator__step--clickable` | Clickable step |
| `.m-step-indicator__number` | Step number circle |
| `.m-step-indicator__label` | Step label |
| `.m-step-indicator__description` | Step description |
| `.m-step-indicator__connector` | Line between steps |
| `.m-step-indicator--small` | Compact variant |

---

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--g-gray-85` | `#d0d4d8` | Inactive step/connector |
| `--g-blue-50` | `#007bc0` | Active step |
| `--g-green-50` | `#00884a` | Completed step |
| `--g-red-50` | `#ed0007` | Error step |

---

## Usage Examples

### Basic Step Indicator
```tsx
const steps = [
  { label: 'Account' },
  { label: 'Profile' },
  { label: 'Review' },
  { label: 'Complete' }
];

<StepIndicator steps={steps} currentStep={1} />
```

### With Descriptions
```tsx
const steps = [
  { label: 'Account', description: 'Create your account' },
  { label: 'Profile', description: 'Fill in your details' },
  { label: 'Review', description: 'Review your information' }
];

<StepIndicator steps={steps} currentStep={0} />
```

### Wizard Form
```tsx
const [step, setStep] = useState(0);
const steps = [
  { label: 'Personal Info' },
  { label: 'Contact Info' },
  { label: 'Preferences' },
  { label: 'Confirmation' }
];

<div>
  <StepIndicator steps={steps} currentStep={step} />
  
  <div style={{ marginTop: '2rem' }}>
    {step === 0 && <PersonalInfoForm />}
    {step === 1 && <ContactInfoForm />}
    {step === 2 && <PreferencesForm />}
    {step === 3 && <ConfirmationView />}
  </div>
  
  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
    <Button 
      mode="secondary" 
      onClick={() => setStep(s => s - 1)}
      disabled={step === 0}
    >
      Previous
    </Button>
    {step < steps.length - 1 ? (
      <Button mode="primary" onClick={() => setStep(s => s + 1)}>
        Next
      </Button>
    ) : (
      <Button mode="primary" onClick={handleSubmit}>
        Submit
      </Button>
    )}
  </div>
</div>
```

### Clickable Steps
```tsx
const [step, setStep] = useState(0);
const [completedSteps, setCompletedSteps] = useState<number[]>([]);

const steps = [
  { label: 'Step 1', completed: completedSteps.includes(0) },
  { label: 'Step 2', completed: completedSteps.includes(1) },
  { label: 'Step 3', completed: completedSteps.includes(2) }
];

<StepIndicator
  steps={steps}
  currentStep={step}
  clickable
  onStepClick={(index) => {
    if (index <= Math.max(...completedSteps, step)) {
      setStep(index);
    }
  }}
/>
```

### With Error State
```tsx
const steps = [
  { label: 'Upload', completed: true },
  { label: 'Validate', error: true },
  { label: 'Process' },
  { label: 'Complete' }
];

<StepIndicator steps={steps} currentStep={1} />
```

### Small Variant
```tsx
<StepIndicator
  steps={[
    { label: 'Start' },
    { label: 'Middle' },
    { label: 'End' }
  ]}
  currentStep={1}
  small
/>
```

### Order Progress
```tsx
const OrderProgress = ({ status }) => {
  const steps = [
    { label: 'Ordered', completed: true },
    { label: 'Processing', completed: status !== 'ordered' },
    { label: 'Shipped', completed: ['shipped', 'delivered'].includes(status) },
    { label: 'Delivered', completed: status === 'delivered' }
  ];
  
  const currentStep = ['ordered', 'processing', 'shipped', 'delivered'].indexOf(status);
  
  return <StepIndicator steps={steps} currentStep={currentStep} />;
};
```

---

## Accessibility

```tsx
<nav aria-label="Form progress">
  <StepIndicator
    steps={steps}
    currentStep={step}
    aria-current="step"
  />
</nav>
```

- Use `aria-current="step"` on active step
- Clickable steps should be focusable
- Announce step changes to screen readers

---

## Do's and Don'ts

**Do:**
- Keep step labels short
- Show completed states clearly
- Allow navigation back to completed steps
- Use descriptions for complex flows

**Don't:**
- Don't use more than 7 steps
- Don't allow skipping ahead to incomplete steps
- Don't use for simple progress (use ProgressIndicator)

---

## Related Components
- [ProgressIndicator](../atoms/progress-indicator.md) — Simple progress bar
- [TabNavigation](../atoms/tab-navigation.md) — Content tabs
- [PageIndicator](../atoms/page-indicator.md) — Pagination
