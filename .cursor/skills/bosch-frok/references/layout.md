# Layout Components

Layout components provide structural elements for organizing content on the page.

## Tile

### Purpose
A container component that provides styled tiles with background colors, highlight accents, and optional link functionality.

### Import
```tsx
import { Tile, TileLink } from '@bosch/react-frok';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | ReactChildren | Required | Content to display inside the tile |
| background | BackgroundColor | 'primary' | Background color variant |
| highlight | HighlightColor | undefined | Optional highlight color accent |
| link | React.ComponentPropsWithRef&lt;typeof TileLink&gt; | undefined | Props to render tile as a link |
| as | string \| Component | 'div' | HTML element or component to render as |
| frokClassName | string | 'a-tile' | Base CSS class name |
| className | string | undefined | Additional CSS classes |

**BackgroundColor values:** 'primary' \| 'secondary' \| 'contrast' \| 'floating'

**HighlightColor values:** 'purple' \| 'blue' \| 'turquoise' \| 'green'

### Variants

**Background Variants:**
- `primary` (default) - Standard tile background
- `secondary` - Alternative background style
- `contrast` - High contrast background
- `floating` - Floating appearance background

**Highlight Variants:**
- `purple` - Purple accent border/highlight
- `blue` - Blue accent border/highlight
- `turquoise` - Turquoise accent border/highlight
- `green` - Green accent border/highlight

### CSS Classes
- `a-tile` - Base tile class
- `-primary`, `-secondary`, `-contrast`, `-floating` - Background modifiers
- `-purple`, `-blue`, `-turquoise`, `-green` - Highlight modifiers
- `a-tile__link` - Link wrapper class

### Usage Example

```tsx
// Basic tile
<Tile>
  <h3>Tile Title</h3>
  <p>Tile content goes here</p>
</Tile>

// Tile with secondary background
<Tile background="secondary">
  <p>Content with secondary background</p>
</Tile>

// Tile with highlight accent
<Tile highlight="blue">
  <p>Tile with blue highlight</p>
</Tile>

// Clickable tile with link
<Tile link={{ href: '/details' }}>
  <h3>Clickable Tile</h3>
  <p>Click anywhere to navigate</p>
</Tile>

// Tile with custom element
<Tile as="article" background="contrast" highlight="green">
  <h2>Article Tile</h2>
</Tile>
```

### Do's and Don'ts

**Do:**
- Use tiles to group related content
- Apply highlight colors to draw attention to important tiles
- Use the link prop for interactive tiles
- Choose background variants that match your design hierarchy

**Don't:**
- Nest tiles deeply without consideration for visual hierarchy
- Overuse highlight colors - use them sparingly for emphasis
- Mix too many background variants on the same screen

### Related Components
- Box - Alternative container component with modal support
- TileLink - Link component used within tiles

---

## Box

### Purpose
A flexible container component that can render as a standard box or as a modal dialog with shadow options.

### Import
```tsx
import { Box } from '@bosch/react-frok';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | React.ReactNode | undefined | Content to display inside the box |
| modal | boolean | false | If true, render as a modal |
| open | boolean | false | If true, show the modal (only when modal=true) |
| modalId | string | undefined | Optional ID for the modal wrapper |
| shadow | boolean | false | Whether the box has a floating shadow |
| className | string | undefined | Additional CSS classes |

### Variants

**Standard Box:**
- Default rendering as a container with primary styling

**Modal Box:**
- Set `modal={true}` to render as a modal dialog
- Use `open` prop to control visibility
- Automatically wraps box in modal container

**Shadow Box:**
- Set `shadow={true}` for floating shadow appearance
- Available since version 0.6.0 (FROK 3.2.0)

### CSS Classes
- `a-box` - Base box class
- `-primary` - Applied when shadow is false (default)
- `-floating-shadow-s` - Applied when shadow is true
- `a-box--modal` - Modal wrapper class
- `-show` - Applied to modal when open is true

### Usage Example

```tsx
// Basic box
<Box>
  <h3>Box Title</h3>
  <p>Box content</p>
</Box>

// Box with floating shadow
<Box shadow={true}>
  <p>Content in a floating box</p>
</Box>

// Modal box (closed)
<Box modal={true} open={false}>
  <h2>Modal Content</h2>
  <p>This modal is hidden</p>
</Box>

// Modal box (open)
<Box modal={true} open={true} modalId="my-modal">
  <h2>Open Modal</h2>
  <p>This modal is visible</p>
</Box>

// Box with custom class and ref
const boxRef = useRef<HTMLDivElement>(null);

<Box className="custom-box" ref={boxRef} shadow={true}>
  <p>Custom styled box</p>
</Box>
```

### Do's and Don'ts

**Do:**
- Use shadow prop for elevated UI elements
- Control modal visibility with the open prop
- Provide modalId for accessibility and testing
- Use modal boxes for dialog and overlay content

**Don't:**
- Set both shadow={true} and modal={true} without understanding the interaction
- Forget to manage the open state for modal boxes
- Use modals for content that should be immediately visible

### Related Components
- Tile - Alternative container with background and highlight variants

---

## Divider

### Purpose
A horizontal rule component for separating content sections, with special styling for inline text usage.

### Import
```tsx
import { Divider } from '@bosch/react-frok';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| withinText | boolean | undefined | Whether the divider is within text (special styling) |

### Variants

**Standard Divider:**
- Default horizontal rule for section separation

**Within Text Divider:**
- Set `withinText={true}` for inline text dividers
- Available since version 0.6.0

### CSS Classes
- `a-divider` - Base divider class
- `-within-text` - Applied when withinText is true

### Usage Example

```tsx
// Basic divider
<section>
  <p>First section content</p>
  <Divider />
  <p>Second section content</p>
</section>

// Divider within text
<div>
  <span>Text before</span>
  <Divider withinText={true} />
  <span>Text after</span>
</div>

// Multiple sections
<article>
  <h2>Introduction</h2>
  <p>Introduction text</p>

  <Divider />

  <h2>Main Content</h2>
  <p>Main content text</p>

  <Divider />

  <h2>Conclusion</h2>
  <p>Conclusion text</p>
</article>

// With ref
const dividerRef = useRef<HTMLHRElement>(null);

<Divider ref={dividerRef} />
```

### Do's and Don'ts

**Do:**
- Use dividers to create clear visual separation between sections
- Use withinText variant for inline separators
- Combine with semantic HTML structure

**Don't:**
- Overuse dividers - they should enhance, not clutter
- Use dividers as decorative elements without semantic purpose
- Apply the withinText variant for standard section breaks

### Related Components
- Box - Container component for grouped content
- Tile - Container component with background variants

---

## Layout

### Purpose
A container component that provides consistent page width and spacing. It serves as the main content wrapper with optional full-width mode.

### Import
```typescript
import { Layout } from '@bosch/react-frok';
```

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| fullWidth | boolean | No | false | When true, container spans full viewport width |
| className | string | No | - | CSS class name |
| children | React.ReactNode | No | - | Content to be wrapped |
| ...props | React.HTMLAttributes<HTMLDivElement> | No | - | Standard HTML div attributes |

### CSS Classes

- `.e-container`: Main container class
- `.-full-width`: Applied when `fullWidth={true}`, removes width constraints

### Usage Example

```tsx
import { Layout } from '@bosch/react-frok';

// Standard layout with constrained width
function MyPage() {
  return (
    <Layout>
      <h1>Page Content</h1>
      <p>This content respects the standard container width.</p>
    </Layout>
  );
}

// Full-width layout
function FullWidthPage() {
  return (
    <Layout fullWidth>
      <h1>Full Width Content</h1>
      <p>This content spans the entire viewport width.</p>
    </Layout>
  );
}
```

### Do's and Don'ts

**Do:**
- Use Layout as the root container for page content
- Use fullWidth mode for dashboard layouts or content that needs maximum space
- Apply custom className for additional styling when needed

**Don't:**
- Don't nest multiple Layout components unnecessarily
- Don't use Layout for small UI sections (it's designed for page-level structure)
- Don't override the core container width unless using fullWidth prop

### Related Components
- Form (often used within Layout for form pages)
- TextImage (content component that works well within Layout)

---

## Form

### Purpose
A wrapper component for HTML forms that provides semantic structure and ARIA accessibility. It wraps a standard form element with proper labeling.

### Import
```typescript
import { Form } from '@bosch/react-frok';
```

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| description | string | Yes | - | Accessible description for the form (used as aria-label) |
| action | string | No | - | Form submission URL |
| method | string | No | - | HTTP method for form submission (e.g., "POST", "GET") |
| children | React.ReactNode | No | - | Form fields and content |
| ...props | React.FormHTMLAttributes<HTMLFormElement> | No | - | Standard HTML form attributes |

### CSS Classes

- `.o-form`: Container wrapper class

### Usage Example

```tsx
import { Form } from '@bosch/react-frok';

function LoginForm() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <Form
      description="User login form"
      onSubmit={handleSubmit}
    >
      <div>
        <label htmlFor="email">Email</label>
        <input type="email" id="email" name="email" required />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input type="password" id="password" name="password" required />
      </div>
      <button type="submit">Log In</button>
    </Form>
  );
}

// With action and method
function ContactForm() {
  return (
    <Form
      description="Contact us form"
      action="/api/contact"
      method="POST"
    >
      <input type="text" name="name" placeholder="Your name" />
      <textarea name="message" placeholder="Your message" />
      <button type="submit">Send</button>
    </Form>
  );
}
```

### Do's and Don'ts

**Do:**
- Always provide a meaningful description prop for accessibility
- Use semantic form elements (input, select, textarea, button)
- Handle form submission with onSubmit event
- Use the description to clearly identify the form's purpose

**Don't:**
- Don't leave description empty or use generic text like "form"
- Don't use Form as a general layout container (use Layout instead)
- Don't forget to include accessible labels for form fields

### Related Components
- Layout (often contains Form components)
- Input components (used within forms)

---

## SideNavigation

### Purpose
A collapsible side navigation component with support for nested items, groups, and selection states. Provides hierarchical navigation with contrast mode for better visibility.

### Import
```typescript
import { SideNavigation } from '@bosch/react-frok';
```

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| header | SideNavigationHeaderProps | No | - | Configuration for the navigation header |
| body | SideNavigationBodyProps | No | - | Configuration for the navigation body |
| contrast | boolean | No | true | Applies contrast styling for better visibility |
| open | boolean | No | - | Controlled open state |
| defaultOpen | boolean | No | false | Initial open state (uncontrolled) |
| onOpenChange | (open: boolean) => void | No | - | Callback when open state changes |
| openItems | SideNavigationItemValue[] | No | - | Controlled array of open item values |
| defaultOpenItems | SideNavigationItemValue[] | No | [] | Initial open items (uncontrolled) |
| onToggle | (ev, data) => void | No | - | Callback when an item is toggled |
| selectedItem | SideNavigationItemValue | No | - | Controlled selected item value |
| defaultSelectedItem | SideNavigationItemValue | No | null | Initial selected item (uncontrolled) |
| onSelectedItemChange | (ev, data) => void | No | - | Callback when selection changes |
| as | React.ElementType | No | 'nav' | Component type to render as |
| children | React.ReactNode | No | - | Navigation items and groups |
| className | string | No | - | CSS class name |
| ...props | React.HTMLAttributes<HTMLElement> | No | - | Standard HTML element attributes |

### Sub-components

The SideNavigation component provides the following sub-components:
- `SideNavigation.Header`: Navigation header section
- `SideNavigation.Body`: Navigation body section
- `SideNavigation.Group`: Grouping container for navigation items
- `SideNavigation.Item`: Individual navigation item

### CSS Classes

- `.m-side-navigation`: Main navigation container
- `.-open`: Applied when navigation is expanded
- `.-contrast`: Applied when contrast mode is enabled (default)

### Usage Example

```tsx
import { SideNavigation } from '@bosch/react-frok';

// Basic usage with controlled selection
function MyApp() {
  const [selected, setSelected] = React.useState('home');

  return (
    <SideNavigation
      contrast={true}
      defaultOpen={true}
      selectedItem={selected}
      onSelectedItemChange={(ev, data) => setSelected(data.value)}
    >
      <SideNavigation.Item value="home">Home</SideNavigation.Item>
      <SideNavigation.Item value="about">About</SideNavigation.Item>
      <SideNavigation.Group value="products" title="Products">
        <SideNavigation.Item value="product-1">Product 1</SideNavigation.Item>
        <SideNavigation.Item value="product-2">Product 2</SideNavigation.Item>
      </SideNavigation.Group>
    </SideNavigation>
  );
}

// With header and body configuration
function AppWithHeader() {
  return (
    <SideNavigation
      header={{ title: "My App" }}
      body={{ /* body config */ }}
      defaultSelectedItem="dashboard"
    >
      <SideNavigation.Item value="dashboard">Dashboard</SideNavigation.Item>
      <SideNavigation.Item value="settings">Settings</SideNavigation.Item>
    </SideNavigation>
  );
}
```

### Do's and Don'ts

**Do:**
- Use unique values for each navigation item
- Group related items using SideNavigation.Group
- Provide meaningful labels for navigation items
- Use controlled state when navigation affects routing or app state
- Keep navigation hierarchy shallow (avoid deep nesting)

**Don't:**
- Don't use duplicate values across navigation items
- Don't put too many items at the top level (use groups to organize)
- Don't disable contrast mode unless you have a specific design requirement
- Don't forget to handle onSelectedItemChange for interactive navigation

### Related Components
- Layout (SideNavigation is often used alongside Layout)
- Navigation items depend on SideNavigation.Item and SideNavigation.Group

---

## TextImage

### Purpose
A component that displays text content alongside an image with configurable ordering. Used for creating content sections that combine headings, images, and paragraphs.

### Import
```typescript
import { TextImage } from '@bosch/react-frok';
```

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| headingText | Slot<TextProps> | Yes | - | Heading text configuration or string |
| image | ImageProps | Yes | - | Image component properties |
| paragraph | Slot<TextProps> | Yes | - | Paragraph text configuration or string |
| order | 'default' \| 'left-to-right' \| 'right-to-left' | No | 'default' | Controls the visual order of image and text |
| as | React.ElementType | No | 'div' | Component type to render as |
| children | React.ReactNode | No | - | Additional content |
| className | string | No | - | CSS class name |
| ...props | React.HTMLAttributes<HTMLDivElement> | No | - | Standard HTML div attributes |

### Variants

The component supports three order variants:
- **default**: Standard layout order
- **left-to-right**: Image and text flow from left to right
- **right-to-left**: Image and text flow from right to left

### CSS Classes

- `.m-text-image`: Main container class
- `.m-text-image__order-wrapper`: Container for image and paragraph
- `.m-text-image__order-wrapper--left-to-right`: Applied when order is 'left-to-right'
- `.m-text-image__order-wrapper--right-to-left`: Applied when order is 'right-to-left'

### Usage Example

```tsx
import { TextImage } from '@bosch/react-frok';

// Basic usage
function ProductFeature() {
  return (
    <TextImage
      headingText="Innovative Technology"
      image={{
        src: '/images/technology.jpg',
        alt: 'Advanced technology display'
      }}
      paragraph="Our cutting-edge solutions provide industry-leading performance and reliability."
    />
  );
}

// With custom order
function FeatureSection() {
  return (
    <TextImage
      order="right-to-left"
      headingText="User-Friendly Interface"
      image={{
        src: '/images/interface.jpg',
        alt: 'Clean user interface'
      }}
      paragraph="Experience intuitive design that makes complex tasks simple."
    />
  );
}

// With Text component props
function DetailedSection() {
  return (
    <TextImage
      headingText={{
        as: 'h2',
        variant: 'heading-2',
        children: 'Enhanced Features'
      }}
      image={{
        src: '/images/features.jpg',
        alt: 'Product features showcase',
        width: 800,
        height: 600
      }}
      paragraph={{
        variant: 'body-1',
        children: 'Detailed description of the features and benefits.'
      }}
      order="left-to-right"
    />
  );
}
```

### Do's and Don'ts

**Do:**
- Provide meaningful alt text for images
- Use appropriate heading levels for semantic HTML
- Choose order variant based on visual hierarchy and reading flow
- Keep paragraph text concise and scannable
- Use high-quality images that support the text content

**Don't:**
- Don't omit required props (headingText, image, paragraph)
- Don't use TextImage for image galleries or text-only content
- Don't forget alt text for accessibility
- Don't use overly long paragraphs (consider breaking into multiple sections)

### Related Components
- Text (used internally for headingText and paragraph)
- Image (used internally for image display)
- Layout (TextImage components are often used within Layout)
