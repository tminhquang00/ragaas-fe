# Display Components

## Table

### Purpose
The Table component is the outer wrapper element for creating data tables. It serves as the container for TableHead and TableBody sections.

### Import
```tsx
import { Table } from '@bosch/react-frok';
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | `React.ReactElement<TableHeadProps \| TableBodyProps>[]` \| `React.ReactElement<TableHeadProps \| TableBodyProps>` | - | Content of the table (TableHead and/or TableBody) |
| className | string | - | Additional CSS class names |
| ...rest | `TableHTMLAttributes<HTMLTableElement>` | - | All standard HTML table attributes |

### CSS Classes
- `m-table` - Base table class

### Usage Example
```tsx
import { Table, TableHead, TableBody, TableRow, TableCell } from '@bosch/react-frok';

function DataTable() {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell header>Name</TableCell>
          <TableCell header>Email</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell>John Doe</TableCell>
          <TableCell>john@example.com</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
```

### Do's and Don'ts
**Do:**
- Use TableHead and TableBody as direct children
- Apply additional className for custom styling
- Use with TableRow and TableCell for proper structure

**Don't:**
- Don't use non-table elements as direct children
- Don't nest Tables without proper structure

### Related Components
- TableHead - Header section container
- TableBody - Body section container
- TableRow - Row element
- TableCell - Cell element

---

## TableHead

### Purpose
The TableHead component represents the header section of a table, typically containing column headers.

### Import
```tsx
import { TableHead } from '@bosch/react-frok';
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | `React.ReactElement<TableRowProps>[]` \| `React.ReactElement<TableRowProps>` | - | Content of the table head section (TableRow elements) |
| ...rest | `React.TableHTMLAttributes<HTMLTableSectionElement>` | - | All standard HTML thead attributes |

### CSS Classes
No additional CSS classes beyond standard `<thead>` element.

### Usage Example
```tsx
import { Table, TableHead, TableRow, TableCell } from '@bosch/react-frok';

function TableExample() {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell header>Product</TableCell>
          <TableCell header>Price</TableCell>
          <TableCell header>Stock</TableCell>
        </TableRow>
      </TableHead>
    </Table>
  );
}
```

### Do's and Don'ts
**Do:**
- Use TableRow as direct children
- Include TableCell with header prop for header cells
- Place at the beginning of the Table

**Don't:**
- Don't use multiple TableHead elements in one table
- Don't include non-row elements as direct children

### Related Components
- Table - Parent container
- TableRow - Row element
- TableCell - Cell element with header prop

---

## TableBody

### Purpose
The TableBody component represents the body section of a table, containing the main data rows.

### Import
```tsx
import { TableBody } from '@bosch/react-frok';
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | `React.ReactElement<TableRowProps>[]` \| `React.ReactElement<TableRowProps>` | - | Content of the table body section (TableRow elements) |
| ...rest | `React.TableHTMLAttributes<HTMLTableSectionElement>` | - | All standard HTML tbody attributes |

### CSS Classes
No additional CSS classes beyond standard `<tbody>` element.

### Usage Example
```tsx
import { Table, TableBody, TableRow, TableCell } from '@bosch/react-frok';

function TableExample() {
  const data = [
    { id: 1, name: 'Item 1', value: '100' },
    { id: 2, name: 'Item 2', value: '200' }
  ];

  return (
    <Table>
      <TableBody>
        {data.map(item => (
          <TableRow key={item.id}>
            <TableCell>{item.name}</TableCell>
            <TableCell>{item.value}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

### Do's and Don'ts
**Do:**
- Use TableRow as direct children
- Map over data arrays to generate rows
- Place after TableHead

**Don't:**
- Don't include non-row elements as direct children
- Don't use multiple TableBody elements unless structurally necessary

### Related Components
- Table - Parent container
- TableRow - Row element
- TableCell - Cell element

---

## TableRow

### Purpose
The TableRow component represents a single row within a table, containing TableCell elements.

### Import
```tsx
import { TableRow } from '@bosch/react-frok';
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | `React.ReactElement<TableCellProps>` \| `TableRowChildrenArray` | - | Content of the table row (TableCell elements) |
| ...rest | `React.TableHTMLAttributes<HTMLTableRowElement>` | - | All standard HTML tr attributes |

### CSS Classes
No additional CSS classes beyond standard `<tr>` element.

### Usage Example
```tsx
import { TableRow, TableCell } from '@bosch/react-frok';

function RowExample() {
  return (
    <TableRow>
      <TableCell>Column 1</TableCell>
      <TableCell>Column 2</TableCell>
      <TableCell secondary>Bold Column 3</TableCell>
    </TableRow>
  );
}
```

### Do's and Don'ts
**Do:**
- Use TableCell as direct children
- Include in TableHead or TableBody
- Apply event handlers like onClick for interactive rows

**Don't:**
- Don't use non-cell elements as direct children
- Don't use rows outside of table sections

### Related Components
- TableHead - Header section container
- TableBody - Body section container
- TableCell - Cell element

---

## TableCell

### Purpose
The TableCell component represents a single cell within a table row. It can render as either a header cell (`<th>`) or data cell (`<td>`).

### Import
```tsx
import { TableCell } from '@bosch/react-frok';
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| secondary | boolean | false | Modifier to set the content bold |
| header | boolean | false | Determines if cell is a header (`<th>`) or data cell (`<td>`) |
| children | ReactNode | - | Content of the table cell |
| className | string | - | Additional CSS class names |
| ...rest | `TdHTMLAttributes` \| `ThHTMLAttributes` | - | All standard HTML td/th attributes |

### Variants
- **Standard Data Cell** - Default `<td>` element
- **Header Cell** - `<th>` element when `header={true}` (with left alignment)
- **Secondary Cell** - Bold content when `secondary={true}`

### CSS Classes
- `-secondary` - Applied when secondary prop is true (makes content bold)

### Usage Example
```tsx
import { Table, TableHead, TableBody, TableRow, TableCell } from '@bosch/react-frok';

function CompleteTableExample() {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell header>Product Name</TableCell>
          <TableCell header>Category</TableCell>
          <TableCell header>Price</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell secondary>Premium Widget</TableCell>
          <TableCell>Electronics</TableCell>
          <TableCell>$99.99</TableCell>
        </TableRow>
        <TableRow>
          <TableCell secondary>Standard Widget</TableCell>
          <TableCell>Electronics</TableCell>
          <TableCell>$49.99</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
```

### Do's and Don'ts
**Do:**
- Use `header={true}` for header cells in TableHead
- Use `secondary={true}` to emphasize important cell content
- Include within TableRow
- Use semantic HTML attributes (scope, colSpan, rowSpan)

**Don't:**
- Don't use cells outside of TableRow
- Don't mix header and data cell props inconsistently
- Don't use both header and secondary props unless specifically needed

### Related Components
- TableRow - Parent row container
- TableHead - For header rows
- TableBody - For data rows

---

## Tooltip

### Purpose
A tooltip provides supplementary information when hovering over an element. It supports different visual variants and width configurations.

### Import
```tsx
import { Tooltip } from '@bosch/react-frok';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `React.ReactNode` | - | Content to display in the tooltip |
| `variant` | `'success' \| 'warning' \| 'error'` | - | Visual style variant |
| `tooltipWidth` | `'dynamic' \| 'fixed'` | - | Width behavior of the tooltip |
| `children` | `React.ReactNode` | - | Element(s) that trigger the tooltip |

Extends `Omit<React.HTMLAttributes<HTMLSpanElement>, 'content'>`.

### Variants

- **Default**: Standard neutral tooltip
- **Success**: Green variant for success messages
- **Warning**: Yellow/amber variant for warnings
- **Error**: Red variant for error messages

### CSS Classes

- `.a-tooltip` - Base tooltip class
- `.a-tooltip--success` - Success variant
- `.a-tooltip--warning` - Warning variant
- `.a-tooltip--error` - Error variant
- `.-dynamic-width` - Dynamic width modifier
- `.-fixed-width` - Fixed width modifier

### Data Attributes

The component uses data attributes when wrapping children:
- `data-tooltip` - Contains the tooltip text content (when content is a string)
- `data-tooltip-width` - Width configuration
- `data-tooltip-type` - Variant type

### Usage Example

```tsx
// Basic tooltip with string child
<Tooltip content="This is helpful information">
  Hover over me
</Tooltip>

// Error tooltip with fixed width
<Tooltip
  content="Invalid input format"
  variant="error"
  tooltipWidth="fixed"
>
  <input type="text" />
</Tooltip>

// Success tooltip
<Tooltip content="Save successful" variant="success">
  <button>Save</button>
</Tooltip>

// Tooltip without children (standalone)
<Tooltip content="Standalone tooltip" variant="warning" />
```

### Do's and Don'ts

**Do:**
- Keep tooltip content concise and informative
- Use variants to communicate message severity
- Use tooltips for supplementary, non-critical information
- Ensure tooltip content is accessible

**Don't:**
- Put critical information only in tooltips
- Use tooltips for lengthy content (use Popover instead)
- Nest interactive elements inside tooltips
- Rely on tooltips for mobile interfaces (they require hover)

### Related Components
- **Popover** - For longer content or interactive elements
- **Alert** - For prominent system messages

---

## Popover

### Purpose
A popover is a larger variant of the tooltip that can display more complex content. It supports headlines, paragraphs, close buttons, and configurable positioning with 12 arrow positions.

### Import
```tsx
import { Popover } from '@bosch/react-frok';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | - | Controlled open state |
| `defaultOpen` | `boolean` | - | Default open state (uncontrolled) |
| `trigger` | `React.ReactElement` | - | Element that triggers the popover |
| `headline` | `string \| React.ReactElement` | - | Popover headline text |
| `paragraph` | `string \| React.ReactElement` | - | Popover paragraph text |
| `closeButton` | `boolean \| React.ReactElement<ButtonProps> \| ButtonProps` | `false` | Show/configure close button |
| `position` | `Position` | `'bottom-center'` | Arrow position (see Position types) |
| `borderOffset` | `number` | `0` | Offset from border (pixels) |
| `triggerOffset` | `number` | `16` | Offset from trigger element (pixels) |
| `strategy` | `'fixed' \| 'absolute'` | `'absolute'` | Positioning strategy |
| `isPopoverArrowMissing` | `boolean` | - | Hide the arrow pointer |
| `closeKey` | `string` | `'Escape'` | Keyboard key to close popover |
| `onTriggerClick` | `(ev: React.MouseEvent) => void` | - | Trigger click handler |
| `onCloseButtonClick` | `(ev: React.MouseEvent) => void` | - | Close button click handler |
| `onCloseKeyPressed` | `(ev: KeyboardEvent) => void` | - | Close key press handler |
| `onOutsideClick` | `(ev: MouseEvent) => void` | - | Outside click handler |
| `children` | `ReactNode` | - | Popover content |
| `boxProps` | `BoxProps` | `{}` | Props for the Box wrapper |

Extends `React.ComponentPropsWithRef<'div'>`.

### Position Types

The `position` prop accepts 12 values:

**Top positions:**
- `'top-left'`
- `'top-center'`
- `'top-right'`

**Right positions:**
- `'right-top'`
- `'right-center'`
- `'right-bottom'`

**Bottom positions:**
- `'bottom-left'`
- `'bottom-center'`
- `'bottom-right'`

**Left positions:**
- `'left-top'`
- `'left-center'`
- `'left-bottom'`

### CSS Classes

- `.m-popover` - Base popover class
- `.-detached` - Detached positioning mode
- `.-close-button` - Applied when close button is present
- `.-without-arrow` - Applied when arrow is hidden
- `.-{position}` - Position-specific class (e.g., `-bottom-center`)
- `.m-popover__content` - Content wrapper
- `.m-popover__head` - Header section
- `.m-popover__paragraph` - Paragraph section

### Usage Example

```tsx
// Basic popover
<Popover
  trigger={<button>Click me</button>}
  headline="Information"
  paragraph="This is some helpful information."
/>

// Popover with close button and custom position
<Popover
  trigger={<button>Show Details</button>}
  headline="Product Details"
  closeButton={true}
  position="top-right"
>
  <div>Custom content here</div>
</Popover>

// Controlled popover
const [isOpen, setIsOpen] = useState(false);

<Popover
  open={isOpen}
  trigger={<button>Toggle</button>}
  headline="Settings"
  closeButton={{
    'aria-label': 'Close settings'
  }}
  onCloseButtonClick={() => setIsOpen(false)}
  onOutsideClick={() => setIsOpen(false)}
>
  <SettingsPanel />
</Popover>

// Popover without arrow
<Popover
  trigger={<Icon iconName="info" />}
  paragraph="Quick tip"
  isPopoverArrowMissing={true}
  position="right-center"
/>
```

### Do's and Don'ts

**Do:**
- Use for contextual information that needs more space than a tooltip
- Provide a close button for better UX on complex popovers
- Use appropriate positioning to avoid viewport overflow
- Close popovers on outside clicks and Escape key
- Use controlled state when popover opening depends on application state

**Don't:**
- Use for critical workflows (use Modal instead)
- Put too much content (keep it focused)
- Forget to make the trigger element accessible
- Block important UI elements with poorly positioned popovers
- Disable flip/auto-positioning without good reason

### Related Components
- **Tooltip** - For simple, short hover information
- **Modal** - For critical or complex interactions
- **Dropdown** - For menu-style selections

---

## Accordion

### Purpose
An accordion provides expandable/collapsible content sections with a headline and toggle functionality. Useful for organizing content into sections that users can expand on demand.

### Import
```tsx
import { Accordion } from '@bosch/react-frok';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `headline` | `React.ReactNode` | - | The headline text or element |
| `size` | `'small'` | - | Size variant of the accordion |
| `open` | `boolean` | - | Controlled open state |
| `defaultOpen` | `boolean` | - | Default open state (uncontrolled) |
| `onOpenChange` | `(open: boolean) => void` | - | Called when open state changes |
| `as` | `React.ElementType` | `'div'` | Component to render as (polymorphic) |
| `children` | `React.ReactNode` | - | Content shown when expanded |

Extends `React.HTMLAttributes<HTMLElement>`.

### Variants

- **Default**: Standard size accordion
- **Small**: Compact accordion with `size="small"`

### CSS Classes

- `.a-accordion` - Base accordion class
- `.a-accordion--open` - Applied when accordion is open
- `.a-accordion--small` - Small size variant
- `.a-accordion__headline` - Headline wrapper (clickable)
- `.a-accordion__headline-heading` - Heading element
- `.a-accordion__headline-button` - Toggle button
- `.a-accordion__headline-icon` - Icon inside button
- `.a-accordion__content` - Content area (shown when open)

### Usage Example

```tsx
// Basic accordion
<Accordion headline="Frequently Asked Questions">
  <p>Here are the answers to common questions...</p>
</Accordion>

// Small accordion, open by default
<Accordion
  headline="Details"
  size="small"
  defaultOpen={true}
>
  <ul>
    <li>Item 1</li>
    <li>Item 2</li>
  </ul>
</Accordion>

// Controlled accordion
const [isOpen, setIsOpen] = useState(false);

<Accordion
  headline="Advanced Settings"
  open={isOpen}
  onOpenChange={setIsOpen}
>
  <SettingsForm />
</Accordion>

// Accordion rendered as section element
<Accordion
  headline="Product Information"
  as="section"
>
  <ProductDetails />
</Accordion>

// Multiple accordions
<>
  <Accordion headline="Section 1">
    Content 1
  </Accordion>
  <Accordion headline="Section 2">
    Content 2
  </Accordion>
  <Accordion headline="Section 3">
    Content 3
  </Accordion>
</>
```

### Do's and Don'ts

**Do:**
- Use clear, descriptive headlines
- Group related content logically
- Use controlled state when coordinating multiple accordions
- Consider using `as` prop for semantic HTML
- Keep content focused and scannable

**Don't:**
- Nest accordions too deeply
- Put critical, always-visible content inside accordions
- Use accordions for navigation (use tabs or menus instead)
- Forget that all content starts collapsed by default
- Override the icon behavior without maintaining accessibility

### Related Components
- **Tabs** - For switching between different views
- **Collapse** - For simpler show/hide patterns
- **Card** - For non-collapsible grouped content

---

## Background

### Purpose
A deprecated wrapper component that applies background type modifiers to a container element. This component is deprecated in favor of using plain CSS modifiers directly.

### Import
```typescript
import { Background } from '@bosch/react-frok';
```

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| type | string | Yes | - | The background variant type (applied as a CSS modifier class) |

### Variants
The component applies variants as CSS modifiers in the format `-{type}`. Possible values include:
- `-contrast`
- `-floating`
- Other background type modifiers (applied as `-{type}`)

### CSS Classes
- `frontend-kit__example-wrapper` - Base wrapper class
- `-{type}` - Modifier class based on the type prop

### Usage Example
```tsx
// Note: This component is deprecated
<Background type="contrast" />
<Background type="floating" />
```

### Do's and Don'ts

**Don'ts:**
- Don't use this component in new code - it's deprecated
- Don't rely on this component for production implementations

**Do's:**
- Use plain CSS modifiers like `-contrast`, `-floating` etc. instead
- Apply background modifiers directly to your elements

### Related Components
None - this is a standalone deprecated utility component.

---

## Text

### Purpose
A flexible component for rendering text content including headlines, subheadlines, and paragraphs. Supports polymorphic rendering via the `as` prop.

### Import
```typescript
import { Text, Headline, SubHeadline } from '@bosch/react-frok';
```

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| as | React.ElementType | No | 'div' | The HTML element to render as |
| className | string | No | - | Additional CSS classes |
| children | React.ReactNode | No | - | Content to display |
| ...rest | React.HTMLAttributes | No | - | Any valid HTML attributes |

### Variants
The Text component comes with two semantic subcomponents:
- **Headline** - Renders with `a-text__headline` class (default element: `p`)
- **SubHeadline** - Renders with `a-text__subheadline` class (default element: `p`)

### CSS Classes
- `a-text` - Base text component class
- `a-text__headline` - Headline variant class
- `a-text__subheadline` - Subheadline variant class

### Usage Example
```tsx
// Basic text
<Text>This is basic text content</Text>

// Text as a different element
<Text as="span">Inline text</Text>

// Headline
<Headline>Main Headline</Headline>

// SubHeadline
<SubHeadline>Secondary Headline</SubHeadline>

// With custom className
<Text className="custom-class">Styled text</Text>
```

### Do's and Don'ts

**Do's:**
- Use the `as` prop to render semantically correct HTML elements
- Use Headline and SubHeadline for structured content hierarchy
- Pass additional HTML attributes as needed (aria labels, data attributes, etc.)

**Don'ts:**
- Don't use Text for interactive elements - use appropriate components like Button
- Don't forget to provide meaningful content for accessibility

### Related Components
- Headline - Semantic headline variant
- SubHeadline - Semantic subheadline variant

---

## Video

### Purpose
A component for displaying video elements with multiple source formats and optional captions.

### Import
```typescript
import { Video } from '@bosch/react-frok';
```

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| sources | Array<{type: 'mp4' \| 'webm' \| 'ogv', src: string}> | Yes | - | Array of video source objects with type and src |
| caption | Array<{caption: string[]}> | No | - | Array of caption objects containing text paragraphs |

### Variants
No variants - single implementation with configurable sources and captions.

### CSS Classes
- `a-video` - Base video container class
- `a-video__caption` - Caption container class

### Usage Example
```tsx
// Basic video with multiple sources
<Video
  sources={[
    { type: 'mp4', src: '/videos/demo.mp4' },
    { type: 'webm', src: '/videos/demo.webm' },
    { type: 'ogv', src: '/videos/demo.ogv' }
  ]}
/>

// Video with caption
<Video
  sources={[
    { type: 'mp4', src: '/videos/demo.mp4' }
  ]}
  caption={[
    { caption: ['Video demonstration', 'Additional caption text'] }
  ]}
/>
```

### Do's and Don'ts

**Do's:**
- Provide multiple source formats for better browser compatibility
- Use mp4, webm, and ogv formats for maximum compatibility
- Include captions for accessibility when appropriate
- Ensure video sources are accessible and properly hosted

**Don'ts:**
- Don't rely on a single video format
- Don't forget to provide meaningful captions for accessibility
- Don't use excessively large video files without optimization

### Related Components
None - this is a standalone media component.


---

## Dialog

### Purpose
The Dialog component displays modal or non-modal dialog boxes for user interactions, confirmations, alerts, and messages. It supports multiple variants for different message types (info, error, warning, success) and provides flexible action buttons.

### Import
```tsx
import { Dialog } from '@bosch/react-frok';
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| title | string | - | Title of the dialog window |
| variant | `'info'` \| `'error'` \| `'warning'` \| `'success'` | - | Variant identifier for styling and icon |
| dialogId | string | - | A page-unique identifier |
| modal | boolean | false | If true, show as modal with backdrop |
| open | boolean | false | If true, open the dialog |
| headline | string | - | The headline of the dialog box content |
| dialogCode | string | - | The error code or reference code of the dialog box |
| onClose | `(event: React.MouseEvent) => void` | - | Callback for the 'X' close button, button isn't rendered if not provided |
| onConfirm | `(event: React.MouseEvent) => void` | - | Callback for the confirm button |
| confirmLabel | string | 'OK' | Label for the confirm button |
| confirmButton | `ButtonProps` \| `React.ReactElement<ButtonProps>` | - | Confirm button slot |
| onCancel | `(event: React.MouseEvent) => void` | - | Callback for the cancel button |
| cancelLabel | string | 'Cancel' | Label for the cancel button |
| cancelButton | `ButtonProps` \| `React.ReactElement<ButtonProps>` | - | Cancel button slot |
| onOption | `(event: React.MouseEvent) => void` | - | Callback for the optional button |
| optionalLabel | string | - | Label for the optional button |
| optionalButton | `ButtonProps` \| `React.ReactElement<ButtonProps>` | - | Optional button slot |
| children | ReactNode | - | Main content of the dialog |
| className | string | - | Additional CSS class names |
| ...rest | `React.HTMLAttributes<HTMLDialogElement>` | - | All standard HTML dialog attributes (except 'role' and 'open') |

### Variants
- **Info Dialog** - `variant="info"` - Shows info icon with blue accent
- **Error Dialog** - `variant="error"` - Shows error icon with red accent
- **Warning Dialog** - `variant="warning"` - Shows warning icon with yellow accent
- **Success Dialog** - `variant="success"` - Shows success icon with green accent
- **Modal Dialog** - `modal={true}` - Displays with backdrop overlay
- **Non-Modal Dialog** - `modal={false}` - Displays without backdrop

### CSS Classes
- `m-dialog` - Base dialog class
- `-floating-shadow-s` - Floating shadow styling
- `-primary` - Primary theme
- `m-dialog--{variant}` - Variant-specific styling (info, error, warning, success)
- `m-dialog__remark` - Colored remark bar for variants
- `--{variant}` - Variant modifier for remark
- `m-dialog__header` - Header section
- `m-dialog__title` - Title text
- `m-dialog__content` - Content wrapper
- `m-dialog__headline` - Headline text
- `m-dialog__body` - Main body content
- `m-dialog__code` - Error/reference code display
- `m-dialog__actions` - Action buttons container
- `a-box--modal` - Modal backdrop wrapper
- `-show` - Show modifier for modal

### Usage Example
```tsx
import { Dialog, Button } from '@bosch/react-frok';
import { useState } from 'react';

// Confirmation Dialog
function ConfirmationDialog() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Dialog</Button>

      <Dialog
        title="Confirm Action"
        variant="warning"
        modal={true}
        open={isOpen}
        headline="Are you sure?"
        onClose={() => setIsOpen(false)}
        onConfirm={() => {
          console.log('Confirmed');
          setIsOpen(false);
        }}
        onCancel={() => {
          console.log('Cancelled');
          setIsOpen(false);
        }}
        confirmLabel="Continue"
        cancelLabel="Go Back"
      >
        This action cannot be undone. Please confirm to proceed.
      </Dialog>
    </>
  );
}

// Error Dialog with Code
function ErrorDialog() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Show Error</Button>

      <Dialog
        title="Error"
        variant="error"
        modal={true}
        open={isOpen}
        headline="Operation Failed"
        dialogCode="ERR-500"
        onClose={() => setIsOpen(false)}
        onConfirm={() => setIsOpen(false)}
        confirmLabel="OK"
      >
        An unexpected error occurred. Please try again later or contact support.
      </Dialog>
    </>
  );
}

// Dialog with Three Buttons
function ThreeButtonDialog() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Dialog</Button>

      <Dialog
        title="Save Changes"
        open={isOpen}
        headline="Unsaved Changes"
        onClose={() => setIsOpen(false)}
        onConfirm={() => {
          console.log('Save');
          setIsOpen(false);
        }}
        onCancel={() => {
          console.log('Discard');
          setIsOpen(false);
        }}
        onOption={() => {
          console.log('Save as draft');
          setIsOpen(false);
        }}
        confirmLabel="Save"
        cancelLabel="Discard"
        optionalLabel="Save as Draft"
      >
        You have unsaved changes. What would you like to do?
      </Dialog>
    </>
  );
}
```

### Do's and Don'ts
**Do:**
- Use `modal={true}` for critical confirmations or important messages
- Provide clear, concise headlines and body text
- Use appropriate variants to convey message severity
- Include `onClose` for dismissible dialogs
- Use `dialogCode` for error tracking and support references
- Provide custom button labels that clearly indicate the action
- Control dialog visibility with state management

**Don't:**
- Don't show multiple modal dialogs simultaneously
- Don't use modal dialogs for non-critical information
- Don't omit cancel or close actions in modal dialogs
- Don't use excessively long content (consider alternatives for lengthy content)
- Don't use all three buttons unless truly necessary (can be overwhelming)

### Related Components
- Button - Used for action buttons and opening dialogs
- Icon - Used for variant indicators
- Divider - Used to separate header from content

---

## Lightbox

### Purpose
The Lightbox component displays images in an overlay with optional navigation for image sequences. It provides a focused viewing experience with support for captions and extended information.

### Import
```tsx
import { Lightbox } from '@bosch/react-frok';
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| lightboxId | string | - | A page-unique identifier |
| modal | boolean | true | If true, show as modal with backdrop |
| open | boolean | false | If true, show the lightbox |
| sequence | boolean | false | If true, enable sequence navigation controls |
| extended | boolean | false | If true, show extended view with captions and expand button |
| images | `ImageProps[]` | - | Array of image objects to display |
| activeImageIndex | number | - | Controlled: current active image index |
| defaultActiveImageIndex | number | 0 | Uncontrolled: initial active image index |
| onActiveImageIndexChange | `(activeImageIndex: number) => void` | - | Callback when active image changes |

### Variants
- **Single Image** - Display one image without navigation
- **Sequence** - `sequence={true}` - Enable left/right navigation for multiple images
- **Extended** - `extended={true}` - Show captions and expand button in footer
- **Modal** - `modal={true}` - Display with backdrop overlay (default)

### CSS Classes
- `m-lightbox` - Base lightbox class
- `-extended` - Extended modifier for caption display
- `m-lightbox--sequence` - Sequence variant modifier
- `m-lightbox__wrapper` - Content wrapper
- `-primary` - Primary theme
- `m-lightbox__aspect-wrapper` - Aspect ratio wrapper
- `m-lightbox__background` - Background element
- `-floating-shadow-s` - Floating shadow styling
- `m-lightbox__header` - Header section with close button
- `m-lightbox__content` - Content section
- `m-lightbox__image-wrapper` - Image container
- `-active` - Active image modifier
- `m-lightbox__footer` - Footer section (shown when sequence or extended)
- `m-lightbox__counter` - Image counter display
- `m-lightbox__expand` - Expand button
- `m-lightbox__sequence-buttons` - Navigation buttons container

### Usage Example
```tsx
import { Lightbox, Button } from '@bosch/react-frok';
import { useState } from 'react';

// Single Image Lightbox
function SingleImageLightbox() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>View Image</Button>

      <Lightbox
        open={isOpen}
        modal={true}
        images={[
          {
            img: {
              src: '/images/photo.jpg',
              srcSet: '/images/photo-400w.jpg 400w, /images/photo-800w.jpg 800w',
              alt: 'Product Photo'
            },
            caption: 'High-resolution product image'
          }
        ]}
      />
    </>
  );
}

// Image Gallery with Sequence Navigation
function ImageGallery() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const images = [
    {
      img: {
        src: '/images/gallery-1.jpg',
        srcSet: '/images/gallery-1-400w.jpg 400w, /images/gallery-1-800w.jpg 800w',
        alt: 'Gallery Image 1'
      },
      caption: 'First image in gallery'
    },
    {
      img: {
        src: '/images/gallery-2.jpg',
        srcSet: '/images/gallery-2-400w.jpg 400w, /images/gallery-2-800w.jpg 800w',
        alt: 'Gallery Image 2'
      },
      caption: 'Second image in gallery'
    },
    {
      img: {
        src: '/images/gallery-3.jpg',
        srcSet: '/images/gallery-3-400w.jpg 400w, /images/gallery-3-800w.jpg 800w',
        alt: 'Gallery Image 3'
      },
      caption: 'Third image in gallery'
    }
  ];

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>View Gallery</Button>

      <Lightbox
        open={isOpen}
        modal={true}
        sequence={true}
        extended={true}
        images={images}
        activeImageIndex={activeIndex}
        onActiveImageIndexChange={setActiveIndex}
      />
    </>
  );
}

// Controlled Lightbox with External Navigation
function ControlledLightbox() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  const images = [
    {
      img: { src: '/images/step1.jpg', alt: 'Step 1' },
      caption: 'Step 1: Preparation'
    },
    {
      img: { src: '/images/step2.jpg', alt: 'Step 2' },
      caption: 'Step 2: Assembly'
    }
  ];

  return (
    <div>
      <div>
        <Button onClick={() => { setCurrentImage(0); setIsOpen(true); }}>
          View Step 1
        </Button>
        <Button onClick={() => { setCurrentImage(1); setIsOpen(true); }}>
          View Step 2
        </Button>
      </div>

      <Lightbox
        open={isOpen}
        sequence={true}
        extended={true}
        images={images}
        activeImageIndex={currentImage}
        onActiveImageIndexChange={setCurrentImage}
      />
    </div>
  );
}
```

### Do's and Don'ts
**Do:**
- Provide responsive srcSet for different screen sizes
- Use descriptive alt text for accessibility
- Enable `sequence` for multiple images
- Enable `extended` to show captions and additional controls
- Provide captions when using extended mode
- Control visibility with state management
- Use high-quality images suitable for full-screen viewing

**Don't:**
- Don't use lightbox for thumbnails or small previews
- Don't omit alt text on images
- Don't use excessively large image files without optimization
- Don't enable sequence mode with only one image
- Don't display lightbox on page load (requires user interaction)

### Related Components
- Image - Used for displaying images within the lightbox
- Box - Used for modal backdrop functionality
- Button - Used for close, expand, and navigation controls

---

## Image

### Purpose
The Image component is a simple wrapper for displaying images with optional captions. It provides a semantic figure/figcaption structure with aspect ratio handling.

### Import
```tsx
import { Image } from '@bosch/react-frok';
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| img | `Slot<'img'>` | - | **Required.** Image element properties (supports string for src or object with full img attributes) |
| caption | string | - | Caption text to display below the image |
| className | string | - | Additional CSS class names |
| ...rest | `ImgHTMLAttributes<HTMLImageElement>` | - | All standard HTML img attributes |

### CSS Classes
- `a-image` - Base image class
- `a-image__ratioWrapper` - Aspect ratio wrapper element

### Usage Example
```tsx
import { Image } from '@bosch/react-frok';

// Simple Image with Source String
function SimpleImage() {
  return (
    <Image
      img={{ src: '/images/product.jpg', alt: 'Product Image' }}
      caption="Our flagship product"
    />
  );
}

// Responsive Image with srcSet
function ResponsiveImage() {
  return (
    <Image
      img={{
        src: '/images/hero-1600w.jpg',
        srcSet: '/images/hero-400w.jpg 400w, /images/hero-800w.jpg 800w, /images/hero-1600w.jpg 1600w',
        alt: 'Hero banner image',
        loading: 'lazy'
      }}
      caption="Welcome to our platform"
    />
  );
}

// Image with Custom Styling
function StyledImage() {
  return (
    <Image
      img={{
        src: '/images/photo.jpg',
        alt: 'Stylized photo',
        style: { filter: 'grayscale(100%)' }
      }}
      caption="Black and white photo"
      className="custom-image"
    />
  );
}

// Image Gallery Grid
function ImageGrid() {
  const images = [
    { src: '/images/1.jpg', alt: 'Image 1', caption: 'First image' },
    { src: '/images/2.jpg', alt: 'Image 2', caption: 'Second image' },
    { src: '/images/3.jpg', alt: 'Image 3', caption: 'Third image' }
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
      {images.map((image, index) => (
        <Image
          key={index}
          img={{ src: image.src, alt: image.alt }}
          caption={image.caption}
        />
      ))}
    </div>
  );
}

// Image without Caption
function ImageOnly() {
  return (
    <Image
      img={{
        src: '/images/logo.png',
        alt: 'Company Logo',
        width: 200,
        height: 100
      }}
    />
  );
}
```

### Do's and Don'ts
**Do:**
- Always provide meaningful alt text for accessibility
- Use srcSet for responsive images across different screen sizes
- Add captions to provide context or attribution
- Use lazy loading for images below the fold
- Specify width and height attributes to prevent layout shift
- Use appropriate image formats (WebP, JPEG, PNG)

**Don't:**
- Don't omit alt attributes (use empty string for decorative images)
- Don't use overly large image files without optimization
- Don't use images for text content
- Don't rely solely on captions for critical information
- Don't use img slot without required source properties

### Related Components
- Lightbox - For displaying images in a modal overlay with navigation
- Icon - For small graphical elements and UI icons
