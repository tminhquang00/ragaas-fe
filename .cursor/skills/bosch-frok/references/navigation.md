# Navigation Components

## OptionBar

### Purpose
OptionBar is a container component that manages a group of selectable option items, functioning as a radio button group. It provides controlled or uncontrolled selection state management and handles the selection logic for its child OptionBarItem components.

### Import
```tsx
import { OptionBar } from '@bosch/react-frok';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| as | string \| Component | 'ul' | The element type to render as |
| children | ReactElement<OptionBarItemProps> \| ReactElement<OptionBarItemProps>[] | - | Child OptionBarItem components |
| options | OptionBarItemProps[] | - | Array of option configurations to render as OptionBarItems |
| defaultSelectedValue | OptionBarItemValue | - | Default selected value (uncontrolled mode) |
| selectedValue | OptionBarItemValue | - | Preselected value (controlled mode), must be used with onOptionSelect |
| onOptionSelect | (event, data) => void | - | Event handler for item selection, must be used with selectedValue |
| name | string | auto-generated | The name of the option bar used as radio group name |
| className | string | - | Additional CSS classes |

### Variants
- Uncontrolled: Use `defaultSelectedValue` for default selection without managing state
- Controlled: Use `selectedValue` + `onOptionSelect` for full control over selection state

### CSS Classes
- `a-option-bar`: Base class applied to the container element

### Usage Example

**Uncontrolled with children:**
```tsx
<OptionBar defaultSelectedValue="option1" name="myOptions">
  <OptionBarItem value="option1" label="Option 1" />
  <OptionBarItem value="option2" label="Option 2" />
  <OptionBarItem value="option3" label="Option 3" disabled />
</OptionBar>
```

**Controlled with options array:**
```tsx
const [selected, setSelected] = useState('option1');

<OptionBar
  selectedValue={selected}
  onOptionSelect={(event, data) => setSelected(data.value)}
  options={[
    { value: 'option1', label: 'Option 1', icon: 'home' },
    { value: 'option2', label: 'Option 2', icon: 'settings' },
    { value: 'option3', label: 'Option 3', icon: 'user', disabled: true }
  ]}
/>
```

### Do's and Don'ts

**Do:**
- Use `defaultSelectedValue` for simple cases where you don't need to control selection externally
- Use `selectedValue` + `onOptionSelect` together when you need controlled behavior
- Provide a unique `value` for each OptionBarItem
- Use the `name` prop when you have multiple OptionBars on the same page

**Don't:**
- Use `selectedValue` without `onOptionSelect` (controlled mode requires both)
- Mix children and options array (choose one approach)
- Forget to provide unique values for each option

### Related Components
- OptionBarItem: Individual selectable item within an OptionBar

---

## OptionBarItem

### Purpose
OptionBarItem represents an individual selectable option within an OptionBar. It renders as a radio button with optional icon and label, and integrates with the OptionBar context for selection management.

### Import
```tsx
import { OptionBarItem } from '@bosch/react-frok';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| as | string \| Component | 'li' | The element type to render as |
| value | OptionBarItemValue | - | Required. The unique value of the option bar item |
| children | ReactNode | - | Label content of the option bar item |
| label | Slot<'span'> | - | Slot for label (alias for children) |
| icon | Slot<IconProps> | - | Slot for icon to display |
| option | Slot<'label'> | - | Slot for the option label element |
| disabled | boolean | false | Whether the item is disabled |
| className | string | - | Additional CSS classes |

### Variants
- With icon: Include an `icon` prop to display an icon alongside the label
- Text only: Provide only `children` or `label` for text-only options
- Disabled: Set `disabled={true}` to prevent selection

### CSS Classes
- `a-option-bar__item`: Base class applied to the item container
- `a-option-bar__option`: Applied to the label element
- `a-option-bar__icon`: Applied to the icon element
- `a-option-bar__label`: Applied to the label text span

### Usage Example

**Basic text option:**
```tsx
<OptionBarItem value="basic" label="Basic Option" />
```

**With icon:**
```tsx
<OptionBarItem value="home" icon="home" label="Home" />
```

**Using children:**
```tsx
<OptionBarItem value="settings">
  Settings
</OptionBarItem>
```

**Disabled option:**
```tsx
<OptionBarItem value="disabled" label="Disabled Option" disabled />
```

**Custom styling:**
```tsx
<OptionBarItem
  value="custom"
  label={{ children: 'Custom', className: 'my-label' }}
  icon={{ name: 'star', className: 'my-icon' }}
  className="my-item"
/>
```

### Do's and Don'ts

**Do:**
- Always provide a unique `value` prop for each item
- Use the `disabled` prop to indicate unavailable options
- Use either `children` or `label` for the text content (they serve the same purpose)

**Don't:**
- Use OptionBarItem outside of an OptionBar component
- Omit the `value` prop (it's required for selection tracking)
- Try to manually manage the checked state (the OptionBar context handles this)

### Related Components
- OptionBar: Parent container that manages the selection state
- Icon: Used for the icon slot

---

## LanguageSelector

### Purpose
LanguageSelector is a molecule component that combines a link to Bosch's global websites and a dropdown for language selection. It provides a standardized way to offer language/region selection in Bosch applications.

### Import
```tsx
import { LanguageSelector } from '@bosch/react-frok';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| as | string \| Component | 'div' | The element type to render as |
| dropdown | Slot<DropdownProps> | - | Required. Dropdown configuration for language selection |
| label | Slot<typeof Link> | Link to Bosch Global | Slot for the global websites link |
| className | string | - | Additional CSS classes |

### Variants
- Default: Uses the default "Bosch Global" link with globe icon
- Custom label: Override the label slot with custom link properties
- Custom dropdown: Provide dropdown configuration with language options

### CSS Classes
- `m-language-selector`: Base class applied to the container element

### Usage Example

**Basic usage with custom dropdown:**
```tsx
<LanguageSelector
  dropdown={{
    options: [
      { value: 'en', label: 'English' },
      { value: 'de', label: 'Deutsch' },
      { value: 'fr', label: 'Français' }
    ],
    defaultValue: 'en',
    onOptionSelect: (event, data) => {
      console.log('Language changed to:', data.value);
    }
  }}
/>
```

**With custom label:**
```tsx
<LanguageSelector
  label={{
    as: 'a',
    href: '/locations',
    icon: 'map',
    children: 'Our Locations',
    target: '_blank'
  }}
  dropdown={{
    options: [
      { value: 'us', label: 'United States' },
      { value: 'uk', label: 'United Kingdom' },
      { value: 'de', label: 'Germany' }
    ]
  }}
/>
```

**Minimal with required props:**
```tsx
<LanguageSelector
  dropdown={{
    options: [
      { value: 'en', label: 'EN' },
      { value: 'de', label: 'DE' }
    ]
  }}
/>
```

### Do's and Don'ts

**Do:**
- Always provide the `dropdown` prop (it's required)
- Use meaningful language/region codes as option values
- Provide a handler for `dropdown.onOptionSelect` to respond to language changes
- Keep language labels short and recognizable

**Don't:**
- Omit the `dropdown` prop
- Use overly long labels in the dropdown options
- Forget to handle the language selection change event

### Related Components
- Dropdown: Used for the language selection dropdown
- Link: Used for the global websites link

---

## List

### Purpose
Representation of lists with support for different list types (bulleted, numbered, checkmarks). Provides flexible rendering through custom render functions or direct children.

### Import
```tsx
import { List } from '@bosch/react-frok';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| type | 'dot' \| 'num' \| 'check' | 'dot' | Type of list marker: 'dot' for bullets, 'num' for numbers, 'check' for checkmarks |
| items | Array<TItem> | - | Array of items to render. Not used if children are provided |
| onRenderCell | (item: TItem) => React.ReactNode | - | Custom render function for each list item |
| ...rest | React.HTMLAttributes<HTMLOListElement> | - | Standard HTML attributes for ordered list elements |

### Variants

The component supports three list types:

- **dot** - Renders an unordered list (`<ul>`) with bullet points
- **num** - Renders an ordered list (`<ol>`) with numbers
- **check** - Renders an unordered list (`<ul>`) with checkmarks

### CSS Classes

- `a-list`: Base class for all lists
- `a-list--dot`: Applied when type="dot"
- `a-list--num`: Applied when type="num"
- `a-list--check`: Applied when type="check"

### Usage Examples

**Basic list with children:**
```tsx
<List type="dot">
  <li>First item</li>
  <li>Second item</li>
  <li>Third item</li>
</List>
```

**Numbered list:**
```tsx
<List type="num">
  <li>Step one</li>
  <li>Step two</li>
  <li>Step three</li>
</List>
```

**List with items array:**
```tsx
<List
  type="check"
  items={['Task 1', 'Task 2', 'Task 3']}
/>
```

**List with custom render function:**
```tsx
interface Task {
  id: number;
  title: string;
  completed: boolean;
}

const tasks: Task[] = [
  { id: 1, title: 'Review code', completed: true },
  { id: 2, title: 'Write tests', completed: false }
];

<List<Task>
  type="check"
  items={tasks}
  onRenderCell={(task) => (
    <span className={task.completed ? 'completed' : ''}>
      {task.title}
    </span>
  )}
/>
```

### Do's and Don'ts

**Do:**
- Use type="num" for sequential steps or ordered procedures
- Use type="check" for task lists or completed items
- Use onRenderCell for complex list items requiring custom rendering
- Provide either children or items, not both

**Don't:**
- Mix children and items props (children takes precedence)
- Use the List component for navigation menus (use MenuItem instead)
- Forget to provide a key when using items array (handled automatically)

### Related Components
- MenuItem: For interactive menu lists
- MenuItemGroup: For nested menu structures

---

## MenuItem

### Purpose
Representation of menu items with support for icons, labels, links, disabled states, and grouping. Provides building blocks for navigation menus and dropdowns.

### Import
```tsx
import { MenuItem, MenuItemLabel, MenuItemLink, MenuItemGroup } from '@bosch/react-frok';
```

### Props

#### MenuItem Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| disabled | boolean | - | Whether the menu item is disabled |
| label | React.ReactNode | - | Label to display inside the menu item |
| icon | IconName \| IconProps | - | Icon to display (icon name string or Icon component props) |
| link | string | - | URL for the menu item link |
| className | string | - | Additional CSS classes |
| ...rest | React.HTMLAttributes<HTMLElement> | - | Standard HTML attributes |

#### MenuItemLabel Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| label | React.ReactNode | - | Label content |
| children | React.ReactNode | - | Alternative to label prop |
| ...rest | React.HTMLAttributes<HTMLSpanElement> | - | Standard HTML span attributes |

#### MenuItemGroup Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| expanded | boolean | - | Controlled expanded state |
| defaultExpanded | boolean | - | Default expanded state (uncontrolled) |
| onGroupClick | (ev: React.MouseEvent) => void | - | Callback when group is clicked |
| label | string | - | Group label text |
| icon | string \| IconProps | - | Group icon |
| children | React.ReactNode | - | Child menu items |
| ...rest | React.HTMLAttributes<HTMLElement> | - | Standard HTML attributes |

#### MenuItemLink Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| className | string | - | Additional CSS classes |
| children | React.ReactNode | - | Link content |
| ...rest | React.AnchorHTMLAttributes<HTMLAnchorElement> | - | Standard anchor attributes |

### Variants

The MenuItem component has several sub-components:

- **MenuItem**: Standard menu item with optional icon and label
- **MenuItemLabel**: Label wrapper for menu item text
- **MenuItemLink**: Anchor element for clickable menu items
- **MenuItemGroup**: Expandable/collapsible group of menu items

### CSS Classes

- `a-menu-item`: Base class for menu items
- `a-menu-item__label`: Label element within menu item
- `a-menu-item__link`: Link element within menu item
- `a-menu-item__wrapper`: Wrapper div for menu item content
- `a-menu-item__group`: Button element for expandable groups
- `-disabled`: Modifier class for disabled menu items
- `-open`: Modifier class for expanded groups
- `m-menu-group__group`: Container for grouped menu items

### Usage Examples

**Basic menu item with label:**
```tsx
<MenuItem label="Home" link="/home" />
```

**Menu item with icon:**
```tsx
<MenuItem
  label="Settings"
  icon="settings"
  link="/settings"
/>
```

**Disabled menu item:**
```tsx
<MenuItem
  label="Premium Feature"
  icon="star"
  disabled
/>
```

**Menu with custom content:**
```tsx
<MenuItem>
  <MenuItemLink href="/custom">
    <Icon iconName="user" />
    <MenuItemLabel>Custom Content</MenuItemLabel>
  </MenuItemLink>
</MenuItem>
```

**Expandable menu group:**
```tsx
<MenuItemGroup
  label="Products"
  icon="folder"
  defaultExpanded={false}
>
  <MenuItem label="Product A" link="/products/a" />
  <MenuItem label="Product B" link="/products/b" />
  <MenuItem label="Product C" link="/products/c" />
</MenuItemGroup>
```

**Controlled menu group:**
```tsx
const [isExpanded, setIsExpanded] = useState(false);

<MenuItemGroup
  label="Advanced"
  expanded={isExpanded}
  onGroupClick={() => setIsExpanded(!isExpanded)}
>
  <MenuItem label="Option 1" />
  <MenuItem label="Option 2" />
</MenuItemGroup>
```

### Do's and Don'ts

**Do:**
- Use link prop for navigation items
- Provide meaningful label text for accessibility
- Use icon to enhance visual recognition
- Use MenuItemGroup for organizing related menu items
- Set disabled for unavailable options

**Don't:**
- Use MenuItem outside of proper menu context (should have role="menu" parent)
- Forget to handle click events when not using the link prop
- Nest MenuItemGroups too deeply (max 2-3 levels recommended)
- Use both label prop and children in MenuItem (label takes precedence)

### Related Components
- List: For non-interactive lists
- Dropdown: For select-style menus
- Icon: Used internally for menu item icons

---

## Dropdown

### Purpose
Representation of a dropdown/select field with support for labels, dynamic width, and flexible option configuration.

### Import
```tsx
import { Dropdown } from '@bosch/react-frok';
```

### Props

#### Dropdown Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| disabled | boolean | - | Whether the dropdown is disabled |
| label | ReactNode | - | Label displayed above the dropdown |
| isDynamicWidth | boolean | - | Makes dropdown width dynamic based on longest option |
| options | OptionProps[] | [] | Array of option objects |
| id | string | auto-generated | HTML id attribute |
| className | string | - | Additional CSS classes |
| style | React.CSSProperties | - | Inline styles for the wrapper div |
| ...rest | SelectHTMLAttributes<HTMLSelectElement> | - | Standard HTML select attributes |

#### OptionProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| name | string | required | Display text for the option |
| value | string \| number | - | Value of the option |
| ...rest | OptionHTMLAttributes<HTMLOptionElement> | - | Standard HTML option attributes |

### Variants

The Dropdown component has two main variants based on width behavior:

- **Fixed width** (default): Standard dropdown with fixed width
- **Dynamic width**: When isDynamicWidth={true}, width adjusts to longest option

### CSS Classes

- `a-dropdown`: Base class for dropdown wrapper
- `a-dropdown--dynamic-width`: Applied when isDynamicWidth={true}
- `a-dropdown--disabled`: Applied when disabled={true}

### Usage Examples

**Basic dropdown:**
```tsx
<Dropdown
  label="Select Country"
  options={[
    { name: 'Germany', value: 'de' },
    { name: 'United States', value: 'us' },
    { name: 'France', value: 'fr' }
  ]}
/>
```

**Dropdown with dynamic width:**
```tsx
<Dropdown
  label="Choose an option"
  isDynamicWidth
  options={[
    { name: 'Short', value: '1' },
    { name: 'Very Long Option Name', value: '2' },
    { name: 'Medium', value: '3' }
  ]}
/>
```

**Disabled dropdown:**
```tsx
<Dropdown
  label="Unavailable"
  disabled
  options={[
    { name: 'Option 1', value: '1' }
  ]}
/>
```

**Controlled dropdown with onChange:**
```tsx
const [selectedValue, setSelectedValue] = useState('');

<Dropdown
  label="Select Size"
  value={selectedValue}
  onChange={(e) => setSelectedValue(e.target.value)}
  options={[
    { name: 'Small', value: 's' },
    { name: 'Medium', value: 'm' },
    { name: 'Large', value: 'l' }
  ]}
/>
```

**Dropdown with default selection:**
```tsx
<Dropdown
  label="Language"
  defaultValue="en"
  options={[
    { name: 'English', value: 'en' },
    { name: 'German', value: 'de' },
    { name: 'Spanish', value: 'es' }
  ]}
/>
```

**Dropdown with children (native optgroup):**
```tsx
<Dropdown label="Choose Location">
  <optgroup label="Europe">
    <option value="de">Germany</option>
    <option value="fr">France</option>
  </optgroup>
  <optgroup label="Americas">
    <option value="us">United States</option>
    <option value="ca">Canada</option>
  </optgroup>
</Dropdown>
```

### Do's and Don'ts

**Do:**
- Provide a clear label for accessibility
- Use value prop for controlled components
- Use defaultValue for uncontrolled components
- Set unique value attributes for each option
- Use isDynamicWidth when option lengths vary significantly
- Provide meaningful option names

**Don't:**
- Use both value and defaultValue (use one or the other)
- Forget to handle onChange events for controlled components
- Use excessively long option names without dynamic width
- Rely solely on color to indicate disabled state
- Use Dropdown for more than 10-15 options (consider autocomplete instead)

### Related Components
- MenuItem: For navigation-style menus
- MenuItemGroup: For hierarchical menu structures

### Technical Notes

**Firefox Click Bug Fix:**
The component includes a workaround for a Firefox bug where onChange receives an old value when there's an upper onMouseDown/onMouseUp handler. The component stops propagation of mouse events to prevent this issue.

**Auto-generated IDs:**
If no id prop is provided, the component automatically generates a unique ID using the useId hook. This ensures proper label-input association for accessibility.

---

## TabNavigation

### Purpose
TabNavigation provides a horizontal tab interface for switching between different views or content sections. It consists of a parent `TabNavigation` component that wraps individual `Tab` children, managing selection state and providing a scrollable tab list with gradient indicators.

### Import
```tsx
import { TabNavigation, Tab } from '@bosch/react-frok';
```

### Props

#### TabNavigation Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| children | React.ReactElement<TabProps> \| React.ReactElement<TabProps>[] | Yes | - | One or more Tab components |
| selectedValue | TabValue | No | - | Controlled selected tab value |
| defaultSelectedValue | TabValue | No | - | Default selected tab value (uncontrolled) |
| onTabSelect | (ev: React.MouseEvent<HTMLElement>, data: SelectTabData) => void | No | - | Callback fired when a tab is selected |
| tablist | Slot<'ol'> | No | - | Slot for customizing the tablist element |
| as | React.ElementType | No | 'div' | Component type to render as |
| className | string | No | - | Additional CSS class names |

#### Tab Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| value | TabValue | Yes | - | Unique identifier for the tab |
| icon | Slot<IconProps> | No | - | Icon to display in the tab |
| tab | Slot<'button' \| 'a'> | No | - | Slot for customizing the tab element |
| disabled | boolean | No | false | Whether the tab is disabled |
| children | React.ReactNode | No | - | Tab label content |
| as | React.ElementType | No | 'li' | Component type to render as |
| className | string | No | - | Additional CSS class names |
| onClick | (ev: React.MouseEvent<HTMLElement>) => void | No | - | Click handler |

### Variants
- Standard tabs: Text-based tabs with optional icons
- Icon-only tabs: Tabs with only icons (when icon is provided but no children)
- Disabled tabs: Individual tabs can be disabled
- Controlled/Uncontrolled: Can be used in controlled or uncontrolled mode

### CSS Classes

#### TabNavigation Classes
- `a-tab-navigation__wrapper`: Root wrapper element
- `a-tab-navigation`: Tab list container (ol element)
- `a-tab-navigation__gradients`: Gradient overlay for scrollable tabs

#### Tab Classes
- `a-tab-navigation__item`: List item wrapper
- `a-tab-navigation__tab`: Tab button/anchor element
- `a-tab-navigation__tab.-selected`: Selected tab state
- `a-tab-navigation__tab.-disabled`: Disabled tab state
- `a-tab-navigation__tab.-only-icon`: Icon-only tab variant
- `a-tab-navigation__tab-content`: Inner content wrapper
- `a-tab-navigation__label`: Tab text label
- `a-tab-navigation__icon`: Tab icon

### Usage Example
```tsx
import { TabNavigation, Tab } from '@bosch/react-frok';
import { useState } from 'react';

// Controlled example
function MyTabs() {
  const [selectedTab, setSelectedTab] = useState('overview');

  return (
    <TabNavigation
      selectedValue={selectedTab}
      onTabSelect={(ev, data) => setSelectedTab(data.value)}
    >
      <Tab value="overview">Overview</Tab>
      <Tab value="details" icon={{ name: 'info' }}>Details</Tab>
      <Tab value="settings" icon={{ name: 'settings' }}>Settings</Tab>
      <Tab value="disabled" disabled>Disabled</Tab>
    </TabNavigation>
  );
}

// Uncontrolled example
function UncontrolledTabs() {
  return (
    <TabNavigation defaultSelectedValue="home">
      <Tab value="home">Home</Tab>
      <Tab value="profile">Profile</Tab>
      <Tab value="messages">Messages</Tab>
    </TabNavigation>
  );
}

// Icon-only tabs
function IconTabs() {
  return (
    <TabNavigation defaultSelectedValue="grid">
      <Tab value="grid" icon={{ name: 'grid' }} />
      <Tab value="list" icon={{ name: 'list' }} />
      <Tab value="chart" icon={{ name: 'chart' }} />
    </TabNavigation>
  );
}
```

### Do's and Don'ts

**Do:**
- Provide unique `value` props for each Tab
- Use concise, clear labels for tab content
- Consider using icons for frequently-accessed tabs
- Use controlled mode when tab selection affects other parts of your UI
- Disable tabs that are temporarily unavailable

**Don't:**
- Exceed 6-8 tabs in a single TabNavigation (consider alternative patterns)
- Use extremely long tab labels that cause layout issues
- Change tab order dynamically (maintain consistent positioning)
- Nest TabNavigation components

### Related Components
- Icon: Used for tab icons
- Link: Can be used as the tab element via the `tab` slot

---

## PageIndicator

### Purpose
PageIndicator provides pagination controls for navigating through multiple pages of content. It supports both numbered pagination with previous/next carets and simple dot-style indicators.

### Import
```tsx
import { PageIndicator } from '@bosch/react-frok';
```

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| pages | number | Yes | - | Total number of pages |
| numbered | boolean | No | false | Whether to show numbered pagination with carets |
| disabled | boolean | No | false | Whether the page indicator is disabled |
| selected | number | No | - | Controlled selected page (1-indexed) |
| defaultSelected | number | No | 1 | Default selected page (uncontrolled, 1-indexed) |
| onPageSelect | (event: React.MouseEvent<HTMLElement>) => void | No | - | Callback fired when a page is selected |
| className | string | No | - | Additional CSS class names |

### Variants
- Dot indicators (default): Simple dot-based pagination for visual content like carousels
- Numbered pagination: Full numbered pagination with previous/next carets for content-heavy pages

### CSS Classes
- `a-page-indicator`: Root container
- `a-page-indicator.-disabled`: Disabled state
- `a-page-indicator--numbered`: Numbered variant modifier
- `a-page-indicator__container`: Container for page indicators
- `a-page-indicator__indicator`: Individual page button
- `a-page-indicator__indicator.-selected`: Selected page state
- `a-page-indicator__caret`: Navigation caret (numbered variant)
- `a-page-indicator__caret.-left`: Previous page caret
- `a-page-indicator__caret.-right`: Next page caret

### Usage Example
```tsx
import { PageIndicator } from '@bosch/react-frok';
import { useState } from 'react';

// Dot-style pagination for carousel
function ImageCarousel() {
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div>
      <div className="carousel-content">
        {/* Carousel images */}
      </div>
      <PageIndicator
        pages={5}
        selected={currentPage}
        onPageSelect={(ev) => {
          const page = parseInt(ev.currentTarget.dataset.index);
          setCurrentPage(page);
        }}
      />
    </div>
  );
}

// Numbered pagination for content
function ContentPagination() {
  const [page, setPage] = useState(1);

  return (
    <div>
      <div className="content">
        {/* Content for current page */}
      </div>
      <PageIndicator
        pages={20}
        numbered
        selected={page}
        onPageSelect={(ev) => {
          const selectedPage = parseInt(ev.currentTarget.dataset.index);
          setPage(selectedPage);
          // Load new content
        }}
      />
    </div>
  );
}

// Uncontrolled example
function UncontrolledPagination() {
  return (
    <PageIndicator
      pages={10}
      numbered
      defaultSelected={1}
    />
  );
}
```

### Do's and Don'ts

**Do:**
- Use dot indicators for image carousels and visual content (typically 3-7 pages)
- Use numbered pagination for content-heavy applications with many pages
- Access the selected page via `ev.currentTarget.dataset.index` in the callback
- Disable the indicator when content is loading
- Consider the total number of pages when choosing between variants

**Don't:**
- Use dot indicators for more than 10 pages (use numbered instead)
- Forget to handle the page change in your `onPageSelect` callback
- Mix dot and numbered styles in the same interface
- Use pagination when infinite scroll would be more appropriate

### Related Components
- StepIndicator: For multi-step processes
- ProgressIndicator: For showing progress through a process

---

## Breadcrumbs

### Purpose
Breadcrumbs provide hierarchical navigation, showing the user's current location within the application structure and allowing quick navigation to parent pages.

### Import
```tsx
import { Breadcrumbs } from '@bosch/react-frok';
import { Link } from '@bosch/react-frok';
```

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| children | React.ReactElement<LinkProps> \| Array<React.ReactElement<LinkProps>> | No | - | Link components representing breadcrumb items |
| as | React.ElementType | No | 'ol' | Component type to render as |
| className | string | No | - | Additional CSS classes |

### Variants
Breadcrumbs automatically style the contained Link components:
- All links except the last get a `forward-right-small` icon on the right
- All links except the last use `level: 'simple'`
- The last link represents the current page (no icon)

### CSS Classes
- `m-breadcrumbs`: Root ordered list
- `m-breadcrumbs > li`: List item containers

### Usage Example
```tsx
import { Breadcrumbs } from '@bosch/react-frok';
import { Link } from '@bosch/react-frok';

function Navigation() {
  return (
    <Breadcrumbs>
      <Link href="/">Home</Link>
      <Link href="/products">Products</Link>
      <Link href="/products/electronics">Electronics</Link>
      <Link href="/products/electronics/laptops">Laptops</Link>
    </Breadcrumbs>
  );
}

// With React Fragment
function BreadcrumbsWithFragment() {
  return (
    <Breadcrumbs>
      <>
        <Link href="/">Home</Link>
        <Link href="/docs">Documentation</Link>
        <Link href="/docs/components">Components</Link>
      </>
    </Breadcrumbs>
  );
}

// Dynamic breadcrumbs
function DynamicBreadcrumbs({ path }) {
  const segments = path.split('/').filter(Boolean);

  return (
    <Breadcrumbs>
      <Link href="/">Home</Link>
      {segments.map((segment, index) => {
        const href = '/' + segments.slice(0, index + 1).join('/');
        return (
          <Link key={href} href={href}>
            {segment}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
}
```

### Do's and Don'ts

**Do:**
- Use Link components as direct children
- Keep breadcrumb labels concise and meaningful
- Include "Home" or root-level link as the first item
- Make all breadcrumb items clickable links (including current page)
- Limit breadcrumb depth to 4-6 levels for usability
- Use breadcrumbs for hierarchical navigation structures

**Don't:**
- Mix Link components with other element types as children
- Use breadcrumbs for flat navigation structures (use TabNavigation instead)
- Include the application name in every breadcrumb item
- Truncate breadcrumb labels with ellipsis (use shorter labels instead)
- Use breadcrumbs as the only navigation method
- Manually add separator icons (they're added automatically)

### Related Components
- Link: Required for breadcrumb items
- TabNavigation: For horizontal navigation at the same level
- SideNavigation: For hierarchical sidebar navigation
