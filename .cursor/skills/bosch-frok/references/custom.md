# Custom Components

Custom components in the Bosch React FROK library provide specialized UI patterns for complex application scenarios.

## CommandBar

### Purpose
A horizontal bar component that organizes content and action areas, typically used for displaying contextual controls and primary actions.

### Import
```typescript
import { CommandBar } from '@bosch/react-frok';
```

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| content | React.ReactNode | No | - | Content displayed in the left content area |
| actions | React.ReactNode | No | - | Actions displayed in the right action area |
| mainAction | React.ReactNode | No | - | Primary action displayed in the main action area |
| className | string | No | - | CSS class name |
| ...props | React.HTMLAttributes<HTMLDivElement> | No | - | Standard HTML div attributes |

### CSS Classes

The component uses styled-components with the following internal structure:

- **Bar**: Main container with flexbox layout, 4rem height, 1rem horizontal padding, 0.5rem vertical padding
- **Body**: Flex-grow container holding content and action areas
- **ContentArea**: Left-aligned flex container for content with 0.5rem column gap
- **ActionArea**: Right-aligned flex container for actions with 0.5rem column gap
- **MainAction**: Separate flex container for primary action
- Applied class: `-secondary` (automatically added to the main container)

### Usage Example

```tsx
import { CommandBar } from '@bosch/react-frok';
import { Button } from '@bosch/react-frok';

function MyComponent() {
  return (
    <CommandBar
      content={<span>Document: Annual Report</span>}
      actions={
        <>
          <Button mode="secondary">Edit</Button>
          <Button mode="secondary">Share</Button>
        </>
      }
      mainAction={<Button mode="primary">Save</Button>}
    />
  );
}
```

### Do's and Don'ts

**Do:**
- Use CommandBar for contextual toolbars and action bars
- Place primary actions in the mainAction slot
- Group related secondary actions in the actions area
- Use content area for contextual information or navigation

**Don't:**
- Don't overload with too many actions (maintain clarity)
- Don't use for primary navigation (use a navigation component instead)
- Don't place critical information only in the CommandBar if it needs to be always visible

### Related Components
- Button (for actions)
- Blade (often used together for panel-based interfaces)

---

## Blade

### Purpose
A collapsible panel component with header controls for minimize, maximize, restore, and close actions. Blades are typically used in multi-panel layouts where users can manage multiple side-by-side views.

### Import
```typescript
import { Blade } from '@bosch/react-frok';
```

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| children | ReactChildren | No | - | The blade's content |
| collapsed | boolean | No | false | Collapsed state flag |
| expanded | boolean | No | false | Expanded state flag |
| fluid | boolean | No | false | Fluid width flag (auto-size) |
| footer | React.ReactNode \| null | No | - | Footer slot content |
| header | string \| React.ReactNode \| null | No | - | Header title as string or custom component |
| headerTitle | string | No | - | HTML title attribute for header |
| active | boolean | No | false | Active state flag |
| showMinButton | boolean | No | true | Toggle minimize button visibility |
| showMaxButton | boolean | No | true | Toggle maximize button visibility |
| showRestoreButton | boolean | No | true | Toggle restore button visibility |
| showCloseButton | boolean | No | true | Toggle close button visibility |
| minTooltip | string | No | 'Minimize' | Minimize button tooltip |
| maxTooltip | string | No | 'Maximize' | Maximize button tooltip |
| restoreTooltip | string | No | 'Restore' | Restore button tooltip |
| closeTooltip | string | No | 'Close' | Close button tooltip |
| flip | boolean | No | false | Heading text direction (true: bottom-up, false: top-down) |
| initialWidth | number | No | - | Initial width of the blade |
| onActivate | () => void | No | - | Callback when blade is activated |
| onCollapse | () => void | No | - | Callback when blade is collapsed |
| onExpand | () => void | No | - | Callback when blade is expanded |
| onRestore | () => void | No | - | Callback when blade is restored |
| onClose | () => void | No | - | Callback when blade is closed |
| ...props | React.HTMLAttributes<HTMLDivElement> | No | - | Standard HTML div attributes |

### Variants

**States:**
- **Normal**: Default state with standard width
- **Collapsed**: Minimized to 3rem width showing vertical header
- **Expanded/Fluid**: Full width, auto-sizing to available space

**Header Orientation:**
- **Top-down** (default): Collapsed header rotated clockwise
- **Bottom-up** (flip=true): Collapsed header rotated counter-clockwise

### CSS Classes

The component uses styled-components with these internal elements:

- **BladeContainer**: Main article element with relative positioning, bordered right
  - When collapsed: `min-width: 3rem; max-width: 3rem`
  - When expanded/fluid: `flex: auto; width: 100%`
- **BladeHeader**: Header section (3rem height) with optional active state
  - Active state adds border-bottom color: `var(--minor-accent__enabled__front__default)`
- **BladeBody**: Content section with absolute positioning
  - Position: `top: calc(3rem + 2px)`, `height: calc(100% - (3rem + 2px))`
  - Padding: 1rem
  - Hidden when collapsed

### Usage Example

```tsx
import { Blade } from '@bosch/react-frok';

function MyComponent() {
  const [collapsed, setCollapsed] = React.useState(false);
  const [expanded, setExpanded] = React.useState(false);

  return (
    <Blade
      header="Properties"
      collapsed={collapsed}
      expanded={expanded}
      onCollapse={() => setCollapsed(true)}
      onExpand={() => setExpanded(true)}
      onRestore={() => {
        setCollapsed(false);
        setExpanded(false);
      }}
      onClose={() => console.log('Close blade')}
      initialWidth={300}
      footer={<div style={{ padding: '1rem' }}>Footer content</div>}
    >
      <div>Blade content goes here</div>
    </Blade>
  );
}
```

### Do's and Don'ts

**Do:**
- Use Blade for side panels and detail views
- Manage blade state (collapsed/expanded) in parent component
- Provide meaningful header text or custom header component
- Use initialWidth to set a reasonable default width
- Use footer slot for persistent actions or information

**Don't:**
- Don't nest Blades directly (use blade management context instead)
- Don't forget to handle all state callbacks if managing blade state
- Don't set both expanded and collapsed to true simultaneously
- Don't override the header click behavior (it's used for activation)

### Related Components
- BladeBox (container for managing multiple blades)
- Blades (context provider for blade management)
- ResizableBlade (blade with resize functionality)
- Button (used in header controls)

---

## DataList

### Purpose
A flexible, feature-rich table component for displaying and interacting with lists of data. Supports column definitions, grouping, row selection, checkboxes, expandable details, sorting indicators, and infinite scrolling.

### Import
```typescript
import { DataList } from '@bosch/react-frok';
```

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| items | Array<TItem> | Yes | - | Array of data objects to display |
| columns | Array<Column<TItem, TData>> | Yes | - | Column definitions |
| id | string | No | auto-generated | Table element id |
| selected | TItem | No | - | Currently selected item |
| groups | Array<Group> | No | - | Groups definition array |
| expandableDetails | Array<ExpandableDetails> | No | - | Expandable row details (not used with groups) |
| checked | Array<TItem> | No | [] | Items that should be checked |
| disabled | Array<TItem> | No | [] | Items that should be disabled |
| hideCheckBoxes | boolean | No | false | Hide checkbox column |
| hideHeaders | boolean | No | false | Hide table headers |
| enableScrolling | boolean | No | false | Enable scrolling container |
| emptyStateMessage | string | No | 'Empty list' | Message shown when items is empty |
| className | string | No | - | CSS class for wrapper element |
| style | React.CSSProperties | No | - | Inline styles for wrapper element |
| tableStyle | React.CSSProperties | No | - | Inline styles for table element |
| onSelect | (item: TItem) => void | No | - | Callback when row is clicked |
| onChecked | (checkedItems: Array<TItem>) => void | No | - | Callback when checked state changes |
| onItemChecked | (ev, item) => void | No | - | Callback when single item is checked |
| onColumnHeaderClick | (ev, col) => void | No | - | Callback when column header is clicked |
| onColumnHeaderContextMenu | (col, ev) => void | No | - | Callback for column header context menu |
| onRenderColumnHeader | (col, index, defaultRenderer) => ReactNode | No | - | Custom column header renderer |
| onGroupClicked | (group, ev) => void | No | - | Callback when group is clicked |
| onScrollToBottom | () => void | No | - | Callback when scrolled to bottom (infinite scroll) |
| onRenderRow | (props, Row) => JSX.Element | No | - | Custom row renderer |
| children | ReactNode | No | - | Additional content rendered inside container |

### Column Interface

```typescript
interface Column<TItem, TData = unknown> {
  header: string;                    // Column header text
  onRenderHeader?: (column, index) => ReactNode;  // Custom header renderer
  ariaLabel?: string;                // Accessible label
  style?: React.CSSProperties;       // Styles for th elements
  cellStyle?: React.CSSProperties;   // Styles for td elements
  className?: string;                // Class for th elements
  cellClassName?: string;            // Class for td elements
  fieldName?: keyof TItem;           // Field to render automatically
  renderCell?: (item, index, column) => ReactNode;  // Custom cell renderer
  title?: string;                    // Cell title attribute
  onColumnClick?: (ev, column) => void;  // Column click handler
  onColumnContextMenu?: (column, ev) => void;  // Context menu handler
  data?: TData;                      // Arbitrary passthrough data
  isSorted?: boolean;                // Show sort indicator
  isSortedDescending?: boolean;      // Sort direction indicator
  sortAscendingAriaLabel?: string;   // Aria label for ascending sort
  sortDescendingAriaLabel?: string;  // Aria label for descending sort
  disableOnSelect?: boolean;         // Disable row selection for this column
  disableOnCondition?: (item: TItem) => boolean;  // Conditional disable
}
```

### Group Interface

```typescript
interface Group {
  name: ReactNode;           // Group name/header
  count: number;             // Number of items in group
  startIndex: number;        // Start index in items array
  isCollapsed?: boolean;     // Collapsed state
  defaultCollapsed?: boolean;  // Default collapsed state
  data?: Dict<unknown>;      // Arbitrary data
  hideCount?: boolean;       // Hide item count
}
```

### ExpandableDetails Interface

```typescript
interface ExpandableDetails {
  detailsInfo: ReactNode;      // Content to show when expanded
  index: number;               // Item index
  defaultCollapsed?: boolean;  // Default collapsed state
}
```

### CSS Classes

The component uses styled-components:

- **StyledDataListContainer**: Main wrapper with relative positioning
  - When enableScrolling=true: `overflow-y: auto`
- **StyledTable**: Fixed table layout, 100% width
- **EmptyStateStyle**: Centered empty state with disabled color

### Usage Example

```tsx
import { DataList } from '@bosch/react-frok';

interface User {
  id: number;
  name: string;
  email: string;
  status: string;
}

function UserList() {
  const [users, setUsers] = React.useState<User[]>([
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Inactive' },
  ]);
  const [selected, setSelected] = React.useState<User | undefined>();
  const [checked, setChecked] = React.useState<User[]>([]);

  const columns = [
    {
      header: 'Name',
      fieldName: 'name' as keyof User,
      style: { width: '30%' },
    },
    {
      header: 'Email',
      fieldName: 'email' as keyof User,
      style: { width: '40%' },
    },
    {
      header: 'Status',
      renderCell: (user: User) => (
        <span style={{ color: user.status === 'Active' ? 'green' : 'gray' }}>
          {user.status}
        </span>
      ),
      style: { width: '30%' },
    },
  ];

  return (
    <DataList
      items={users}
      columns={columns}
      selected={selected}
      checked={checked}
      onSelect={(user) => setSelected(user)}
      onChecked={(checkedUsers) => setChecked(checkedUsers)}
      emptyStateMessage="No users found"
      enableScrolling={true}
    />
  );
}
```

### Infinite Scroll Example

```tsx
function InfiniteScrollList() {
  const [items, setItems] = React.useState<Item[]>(initialItems);

  const loadMore = () => {
    // Fetch more items
    fetchMoreItems().then(newItems => {
      setItems(prev => [...prev, ...newItems]);
    });
  };

  return (
    <DataList
      items={items}
      columns={columns}
      enableScrolling={true}
      onScrollToBottom={loadMore}
    />
  );
}
```

### Do's and Don'ts

**Do:**
- Define column widths explicitly for better control
- Use fieldName for simple field rendering
- Use renderCell for custom formatting and components
- Provide meaningful emptyStateMessage for better UX
- Use onScrollToBottom for pagination/infinite scroll
- Handle checked and selected states in parent component
- Use groups for organizing large datasets

**Don't:**
- Don't use both groups and expandableDetails simultaneously
- Don't forget to memoize heavy renderCell functions
- Don't put too many items without enableScrolling
- Don't disable checkboxes without providing visual feedback
- Don't forget accessibility labels (ariaLabel) for sortable columns

### Related Components
- Table, TableHead, TableBody (underlying atomic components)
- Icon (used in empty state)
- Checkbox (used for row selection)

---

## OverlayActivityIndicator

### Purpose
A loading indicator component that overlays its container with an optional background blur, used to indicate ongoing activity or loading states.

### Import
```typescript
import { OverlayActivityIndicator } from '@bosch/react-frok';
```

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| disableBlur | boolean | No | false | Disables the background blur effect |
| size | 'small' \| 'medium' \| 'large' | No | 'medium' | Size of the activity indicator |
| ...props | ActivityIndicatorProps | No | - | Additional ActivityIndicator props |

Note: This component extends ActivityIndicatorProps from the base ActivityIndicator component.

### Variants

**Blur State:**
- **With blur** (default): Semi-transparent background with backdrop-filter blur
- **Without blur** (disableBlur=true): No background, indicator only

**Size:**
- Inherited from ActivityIndicator: 'small', 'medium', 'large'
- Default is 'medium'

### CSS Classes

The component uses styled-components:

- **StyledLoadingIndicatorContainer**: Absolute positioned overlay
  - Position: absolute, 100% width/height, top/left at 0
  - Display: grid with centered content
  - Default blur: `background-color: rgba(113,118,124,.25)`, `backdrop-filter: blur(.25rem)`
  - When disableBlur=true: No background or blur

### Usage Example

```tsx
import { OverlayActivityIndicator } from '@bosch/react-frok';

function LoadingComponent() {
  const [loading, setLoading] = React.useState(true);

  return (
    <div style={{ position: 'relative', height: '400px' }}>
      {/* Your content */}
      <div>
        <h2>Content Area</h2>
        <p>Some content that will be overlaid when loading</p>
      </div>

      {/* Overlay when loading */}
      {loading && <OverlayActivityIndicator />}
    </div>
  );
}
```

### With Custom Size and No Blur

```tsx
function CustomLoading() {
  return (
    <div style={{ position: 'relative', height: '200px' }}>
      <OverlayActivityIndicator
        size="large"
        disableBlur={true}
      />
    </div>
  );
}
```

### Do's and Don'ts

**Do:**
- Use in containers with `position: relative` or `position: absolute`
- Use disableBlur when you want a cleaner look without background
- Conditionally render based on loading state
- Ensure parent container has defined dimensions

**Don't:**
- Don't use without a positioned parent container (it needs absolute positioning context)
- Don't stack multiple OverlayActivityIndicators on the same container
- Don't forget to remove/hide the indicator when loading completes
- Don't use for very small UI elements (use regular ActivityIndicator instead)

### Related Components
- ActivityIndicator (base component)
- Blade (often used together for loading blade content)
- DataList (can use for loading data states)
