# Badge

## Purpose
Visual indicator for displaying status, counts, or notifications with semantic color coding.

## Import
```tsx
import { Badge } from '@bosch/react-frok';
```

## Props
| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| label | ReactNode | undefined | No | Content to display in the badge |
| type | 'success' \| 'warning' \| 'error' | undefined | No | Visual variant indicating status type. If not provided, renders in default/normal style |
| className | string | undefined | No | Additional CSS class names to apply |
| children | ReactNode | undefined | No | Alternative to label prop - renders as badge content |
| ...rest | HTMLAttributes<HTMLDivElement> | - | No | All standard HTML div attributes (onClick, style, etc.) |

## Variants
| Variant Value | CSS Class | Visual Description |
|---------------|-----------|-------------------|
| undefined (default) | `a-badge` | Normal/default badge styling |
| success | `a-badge -success` | Success state indicator (typically green) |
| warning | `a-badge -warning` | Warning state indicator (typically yellow/orange) |
| error | `a-badge -error` | Error state indicator (typically red) |

## CSS Classes
**Base:**
- `a-badge` - Base badge component class

**Modifiers:**
- `-success` - Applied when type="success"
- `-warning` - Applied when type="warning"
- `-error` - Applied when type="error"

**Accessibility:**
- Component has `role="status"` for screen readers
- Has `aria-live="off"` attribute
- Focusable with `tabIndex={0}`

## Usage Example
```tsx
// Simple count badge
<Badge label="1" />

// Error message badge
<Badge type="error">Error message goes here</Badge>

// Success badge
<Badge type="success">Great job!</Badge>

// Warning badge with count
<Badge label="999+" type="warning" />

// Custom styled badge
<Badge className="custom-class" type="success">
  Custom content
</Badge>

// Badge positioned on button (requires custom positioning)
<div style={{ position: 'relative', display: 'inline-block' }}>
  <Button mode="integrated" icon="emoji-happy" />
  <Badge
    label="5"
    type="warning"
    style={{ position: 'absolute', top: '8px', left: '24px' }}
  />
</div>
```

## Do's and Don'ts
**Do:**
- Use semantic type variants (success/warning/error) to communicate status
- Keep badge content concise (single numbers or short words)
- Use label prop for simple content, children for complex content
- Use "999+" or similar for very large counts
- Position badges absolutely when overlaying on other components

**Don't:**
- Don't use long text in badges - they're meant for brief indicators
- Don't mix label and children props (children takes precedence)
- Don't forget to apply custom positioning when using badges as overlays
- Don't use badges as primary interactive elements

## Related Components
- Button - Often used with badges for notification counts
- Icon - Similar size elements that can be combined with badges

---

# Chip

## Purpose
Interactive tag-like component for representing selections, filters, or categorizations with optional close functionality and images.

## Import
```tsx
import { Chip } from '@bosch/react-frok';
```

## Props
| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| label | string | - | Yes | Text label displayed in the chip |
| chipLabelId | string | auto-generated | No | ID for the chip label element (used for aria-labelledby) |
| disabled | boolean | false | No | Disables the chip interaction |
| buttonClose | boolean | false | No | Shows a close button (X icon) on the chip |
| image | string | undefined | No | URL of image to display in the chip |
| fixedWidth | boolean | false | No | Sets the chip to have a fixed width |
| selected | boolean | false | No | Sets the chip to selected state |
| dragged | boolean | false | No | Sets the chip to dragged state (visual feedback during drag) |
| buttonPair | boolean | false | No | Renders two chips side-by-side (for preview/demo purposes only) |
| onClose | (ev?: React.MouseEvent<HTMLElement, MouseEvent>) => void | undefined | No | Callback function when close button is clicked |
| className | string | undefined | No | Additional CSS class names to apply |
| ...rest | HTMLAttributes<HTMLDivElement> | - | No | All standard HTML div attributes |

## Variants
| Variant Value | CSS Class | Visual Description |
|---------------|-----------|-------------------|
| Default | `a-chip` | Standard chip styling |
| Fixed Width | `a-chip a-chip--fixed` | Chip with fixed width constraint |
| With Close Button | `a-chip -btnClose` | Includes close button (X icon) |
| With Image | `a-chip -image` | Displays image thumbnail |
| Selected | `a-chip -selected` | Selected state styling |
| Disabled | `a-chip -disabled` | Disabled state styling |
| Dragged | `a-chip -dragged` | Dragging state styling |

## CSS Classes
**Base:**
- `a-chip` - Base chip component class

**Modifier Classes:**
- `a-chip--fixed` - Applied when fixedWidth={true}
- `-disabled` - Applied when disabled={true}
- `-btnClose` - Applied when buttonClose={true}
- `-image` - Applied when image prop is provided
- `-selected` - Applied when selected={true}
- `-dragged` - Applied when dragged={true}

**Element Classes:**
- `a-chip__image` - Image container element
- `a-chip__label` - Label text element
- `a-chip__close` - Close button icon element

**Accessibility:**
- Component has `role="button"`
- Uses `aria-labelledby` pointing to the label element ID

## Usage Example
```tsx
// Simple chip
<Chip label="Label" />

// Chip with image
<Chip
  label="User Name"
  image="https://example.com/avatar.jpg"
/>

// Chip with close button
<Chip
  label="Removable Tag"
  buttonClose={true}
  onClose={() => console.log('Chip closed')}
/>

// Fixed width chip with image and close button
<Chip
  label="Longer Label Text"
  image="https://example.com/avatar.jpg"
  fixedWidth={true}
  buttonClose={true}
  onClose={() => handleRemove()}
/>

// Selected chip
<Chip
  label="Active Filter"
  selected={true}
/>

// Disabled chip
<Chip
  label="Unavailable"
  disabled={true}
/>

// Chip with custom ID for accessibility
<Chip
  label="Custom Tag"
  chipLabelId="custom-chip-label"
/>

// Draggable chip with drag state
<Chip
  label="Draggable Item"
  dragged={isDragging}
  onDragStart={handleDragStart}
/>
```

## Do's and Don'ts
**Do:**
- Use chips for filters, tags, or multi-select options
- Provide onClose callback when buttonClose is true
- Use fixedWidth for consistent chip sizing in lists
- Use selected state to indicate active filters or selections
- Use disabled state for unavailable options
- Use chipLabelId when you need specific accessibility control

**Don't:**
- Don't use buttonPair in production (it's for preview/demo only)
- Don't make chips too long - keep labels concise
- Don't forget to handle the onClose event when buttonClose is enabled
- Don't use chips as primary action buttons (use Button component instead)
- Don't use dragged state without implementing actual drag functionality
- Don't use images with very large dimensions (they're constrained to chip size)

## Related Components
- Badge - Similar visual weight, but for status/counts
- Button - For primary actions (chips are for selections/filters)
- Icon - Used internally for the close button

---

# StepIndicator

## Purpose
A step indicator (stepper) component that displays a multi-step process with visual progress tracking. It shows steps in a horizontal list with nodes and labels, highlighting active steps to guide users through sequential workflows.

## Import
```tsx
import { StepIndicator, Step } from '@bosch/react-frok';
```

## Props

**StepIndicator Props:**

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| activeValues | StepValue[] | [] | Yes | Array of step values that should be marked as active |
| children | ReactElement<StepProps> \| ReactElement<StepProps>[] | undefined | No | Step components as children |
| steps | StepProps[] | undefined | No | Steps configuration array (alternative to children) |
| small | boolean | false | No | Renders a compact/small variant of the step indicator |
| as | ElementType | 'div' | No | Override the rendered HTML element |
| className | string | undefined | No | Additional CSS classes to apply |
| ...rest | React.ComponentPropsWithoutRef<ElementType> | - | No | All standard element attributes |

**Step Props:**

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| value | StepValue | undefined | No | Value to match against activeValues to determine if step is active |
| node | Slot<'div'> | undefined | No | Custom node element (the circular indicator) |
| label | Slot<'span'> | undefined | No | Custom label element |
| as | ElementType | 'li' | No | Override the rendered HTML element for the step |
| className | string | undefined | No | Additional CSS classes to apply |
| children | ReactNode | undefined | No | Label content (used as default for label slot) |
| ...rest | React.HTMLAttributes<HTMLElement> | - | No | All standard HTML attributes |

*Note: `StepValue` is defined as `unknown`, allowing any type of value for step identification.*

## Variants
| Variant | CSS Class | Description |
|---------|-----------|-------------|
| Default | `m-step-indicator` | Standard-sized step indicator with nodes and labels |
| Small | `m-step-indicator -small` | Compact variant without node children |

## CSS Classes
**Base:**
- `m-step-indicator` - Base class for the step indicator container
- `m-step-indicator__steps` - Class for the steps list (ul element)
- `m-step-indicator__step` - Base class for individual step (li element)
- `m-step-indicator__node` - Class for the step node (circular indicator)
- `m-step-indicator__label` - Class for the step label

**Modifiers:**
- `-small` - Applied to container when small={true}
- `-active` - Applied to step when its value is in activeValues array

## Usage Example
```tsx
// Using children components
<StepIndicator activeValues={[1, 2]}>
  <Step value={1} label="Select" />
  <Step value={2} label="Configure" />
  <Step value={3} label="Review" />
  <Step value={4} label="Complete" />
</StepIndicator>

// Using steps prop
<StepIndicator
  activeValues={['step1', 'step2']}
  steps={[
    { value: 'step1', label: 'Personal Info' },
    { value: 'step2', label: 'Payment' },
    { value: 'step3', label: 'Confirmation' }
  ]}
/>

// Small variant
<StepIndicator
  small
  activeValues={[1]}
  steps={[
    { value: 1, label: 'Start' },
    { value: 2, label: 'Process' },
    { value: 3, label: 'Finish' }
  ]}
/>

// Custom element
<StepIndicator
  as="nav"
  activeValues={[1]}
  aria-label="Progress"
>
  <Step value={1} label="Step 1" />
  <Step value={2} label="Step 2" />
</StepIndicator>

// Using children for complex labels
<StepIndicator activeValues={['checkout']}>
  <Step value="cart">Shopping Cart</Step>
  <Step value="checkout">Checkout</Step>
  <Step value="complete">Order Complete</Step>
</StepIndicator>
```

## Do's and Don'ts
**Do:**
- Use for multi-step processes with 3-7 steps
- Mark completed and current steps in `activeValues`
- Provide clear, concise labels for each step
- Use `small` variant when space is limited
- Use either `children` or `steps` prop, not both
- Use consistent value types across all steps

**Don't:**
- Don't use for simple two-step processes (consider simpler alternatives)
- Don't overcrowd with too many steps (consider grouping)
- Don't change step order dynamically (maintain consistency)
- Don't mix `children` and `steps` props together
- Don't forget to include all active/completed steps in activeValues

## Related Components
- Breadcrumb - For navigation hierarchy
- ProgressBar - For continuous progress indication

---

# Notification

## Purpose
A notification component for displaying important messages to users with different severity levels. Supports multiple variants (bar, banner, text) and can include icons, custom content, and an optional close button for dismissible notifications.

## Import
```tsx
import { Notification } from '@bosch/react-frok';
```

## Props
| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| variant | 'banner' \| 'text' | undefined | No | Notification variant. Omitting creates a 'bar' type |
| type | 'neutral' \| 'success' \| 'warning' \| 'error' | 'neutral' | No | Notification type determining color and default icon |
| icon | IconName \| IconProps | undefined | No | Custom icon (optional for neutral type, automatic for others) |
| onCloseClick | (event: MouseEvent<HTMLButtonElement>) => void | undefined | No | Click handler for close button |
| closeButton | ButtonProps | undefined | No | Props forwarded to the close button |
| open | boolean | undefined | No | Self-controlled open state (controlled component) |
| defaultOpen | boolean | undefined | No | Auto-controlled open state (uncontrolled component) |
| children | ReactNode | undefined | No | Content inserted into the notification |
| id | string | undefined | No | Unique identifier for the notification |
| className | string | undefined | No | Additional CSS classes to apply |
| ...rest | HTMLAttributes<HTMLDivElement> | - | No | All standard div attributes |

*Note: Do not use `open` and `defaultOpen` together.*

## Variants
| Variant | CSS Class | Description |
|---------|-----------|-------------|
| Bar (default) | `a-notification` | Default variant (when no variant prop provided) |
| Banner | `a-notification--banner` | Banner variant with close button |
| Text | `a-notification--text` | Text-only variant |

**Notification Types:**

| Type | CSS Class | Icon | Description |
|------|-----------|------|-------------|
| neutral | `-neutral` | None (optional custom) | Gray, no automatic icon |
| success | `-success` | alert-success | Green with success icon |
| warning | `-warning` | alert-warning | Orange/yellow with warning icon |
| error | `-error` | alert-error | Red with error icon |

## CSS Classes
**Base:**
- `a-notification` - Base class for the notification container

**Variant Modifiers:**
- `a-notification--banner` - Applied when variant="banner"
- `a-notification--text` - Applied when variant="text"

**Type Modifiers:**
- `-neutral` - Applied when type="neutral"
- `-success` - Applied when type="success"
- `-warning` - Applied when type="warning"
- `-error` - Applied when type="error"

**State Modifiers:**
- `-show` - Applied when notification is visible (based on open state)

**Element Classes:**
- `a-notification__content` - Class for the content wrapper div

**Accessibility:**
- Component has `role="alert"` for dynamic content
- Uses `aria-labelledby` pointing to content element ID

## Usage Example
```tsx
// Basic bar notification (default)
<Notification type="success" defaultOpen>
  Your changes have been saved successfully.
</Notification>

// Banner variant with close button
<Notification
  variant="banner"
  type="error"
  onCloseClick={() => console.log('Closed')}
  defaultOpen
>
  An error occurred while processing your request.
</Notification>

// Text variant
<Notification
  variant="text"
  type="warning"
>
  Your session will expire in 5 minutes.
</Notification>

// Neutral with custom icon
<Notification
  type="neutral"
  icon="info"
  defaultOpen
>
  New features are now available. Check them out!
</Notification>

// Controlled notification
<Notification
  type="success"
  open={isOpen}
  onCloseClick={() => setIsOpen(false)}
  variant="banner"
>
  Operation completed successfully.
</Notification>

// Custom close button props
<Notification
  variant="banner"
  type="warning"
  closeButton={{ 'aria-label': 'Dismiss notification' }}
  defaultOpen
>
  You have 3 new messages.
</Notification>

// With custom ID for accessibility
<Notification
  id="notification-1"
  type="error"
  variant="banner"
  defaultOpen
>
  Please fix the errors in your form.
</Notification>
```

## Do's and Don'ts
**Do:**
- Use appropriate type for the message severity
- Use banner variant for important dismissible messages
- Provide meaningful content that explains the notification
- Use `defaultOpen` for uncontrolled components
- Use `open` with `onCloseClick` for controlled components
- Use neutral type for informational messages without urgency
- Set defaultOpen or open to true if you want it visible initially

**Don't:**
- Don't use both `open` and `defaultOpen` together
- Don't overuse error type (reserve for actual errors)
- Don't use banner variant without implementing close functionality
- Don't use overly long text (keep messages concise)
- Don't forget aria-label on closeButton for accessibility
- Don't use custom icons for non-neutral types (they have automatic icons)

## Related Components
- Badge - For status indicators
- ActivityIndicator - For loading states

---

# ActivityIndicator

## Purpose
A loading spinner component that displays an animated indicator while content is loading or an asynchronous operation is in progress. Provides visual feedback to users during wait times.

## Import
```tsx
import { ActivityIndicator } from '@bosch/react-frok';
```

## Props
| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| size | 'small' \| 'medium' \| 'large' | undefined | No | Size variant of the activity indicator |
| className | string | undefined | No | Additional CSS classes to apply |
| ...rest | React.ComponentPropsWithRef<'div'> | - | No | All standard div attributes including ref |

## Variants
| Variant | CSS Class | Description |
|---------|-----------|-------------|
| Default | `a-activity-indicator` | Medium size (when no size prop provided) |
| Small | `a-activity-indicator -small` | Compact spinner for inline or small areas |
| Medium | `a-activity-indicator -medium` | Standard size for general use |
| Large | `a-activity-indicator -large` | Larger spinner for prominent loading states |

## CSS Classes
**Base:**
- `a-activity-indicator` - Base class for the activity indicator container

**Size Modifiers:**
- `-small` - Applied when size="small"
- `-medium` - Applied when size="medium"
- `-large` - Applied when size="large"

**Element Classes:**
- `a-activity-indicator__top-box` - Class for the top animated box element
- `a-activity-indicator__bottom-box` - Class for the bottom animated box element

**Accessibility:**
The component automatically includes:
- `role="alert"` - Indicates dynamic content
- `aria-live="off"` - Screen readers don't announce automatically
- `aria-busy={true}` - Indicates the region is busy loading

## Usage Example
```tsx
// Default (medium) size
<ActivityIndicator />

// Small size for inline loading
<ActivityIndicator size="small" />

// Large size for page loading
<ActivityIndicator size="large" />

// With custom className
<ActivityIndicator
  size="medium"
  className="my-custom-loader"
/>

// With ref
const loaderRef = useRef<HTMLDivElement>(null);

<ActivityIndicator
  ref={loaderRef}
  size="large"
/>

// Conditional rendering based on loading state
{isLoading && <ActivityIndicator size="medium" />}

// Centered in container
<div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
  <ActivityIndicator />
</div>

// With wrapper for positioning
<div className="loading-overlay">
  <ActivityIndicator size="large" />
  <p>Loading your data...</p>
</div>
```

## Do's and Don'ts
**Do:**
- Use during data fetching or async operations
- Choose size based on the context (small for inline, large for full page)
- Center the indicator in its container for better UX
- Remove the indicator immediately when loading completes
- Provide additional text for screen reader users if needed
- Use conditional rendering to show/hide based on loading state

**Don't:**
- Don't show multiple activity indicators at once in the same view
- Don't use as a permanent element (only during loading)
- Don't forget to hide the indicator when loading is complete
- Don't use for very quick operations (< 200ms)
- Don't override aria attributes without good reason
- Don't use when you can show partial content or skeleton screens instead

## Related Components
- Notification - For status messages
- Badge - For status indicators
