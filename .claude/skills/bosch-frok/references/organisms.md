# Organisms

Complex, multi-part components that form major sections of the application interface.

## Header

Main application header with search form, main menu, quick links, and breadcrumbs.

### Import

```typescript
import { Header } from '@bosch/react-frok';
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `logo` | `Slot<LogoProps>` | No | Slot for the main Bosch logo |
| `quickLinks` | `ButtonProps[]` | No | Quick links that appear next to the menu trigger button |
| `searchForm` | `Slot<SearchFormProps>` | No | Slot for search form |
| `searchTrigger` | `Slot<ButtonProps>` | No | Button which toggles the search bar |
| `suggestions` | `Slot<SearchSuggestionsProps>` | No | List of search suggestions |
| `breadcrumbs` | `Slot<BreadcrumbsProps>` | No | Breadcrumb navigation under the logo |
| `menuTrigger` | `Slot<MenuTriggerProps>` | No | Button which toggles the main navigation (uses hamburger icon by default) |
| `menu` | `Slot<'div'>` | No | Slot for main navigation |
| `as` | `React.ElementType` | No | Render as different element (default: 'header') |
| `className` | `string` | No | Additional CSS classes |
| `children` | `React.ReactNode` | No | Subbrand content |

### CSS Classes

| Class | Description |
|-------|-------------|
| `o-header` | Base header class |
| `o-header__top-container` | Container for the top section |
| `o-header__top` | Top section layout |
| `o-header__quicklinks` | Container for quick links |
| `o-header__search_suggestions_container` | Container for search suggestions |
| `o-header__meta` | Container for breadcrumbs and subbrand |
| `o-header__navigation-container` | Container for main navigation |
| `o-header__subbrand` | Subbrand element |
| `-menu-open` | Applied when menu is open |
| `-second-level-open` | Applied when second level menu is open |
| `-third-level-open` | Applied when third level menu is open |
| `-search-open` | Applied when search is open |
| `-show-suggestions` | Applied when search suggestions are visible |

### Usage Example

```tsx
<Header
  logo={{ href: '/', alt: 'Bosch Logo' }}
  quickLinks={[
    { children: 'Contact', href: '/contact' },
    { children: 'Support', href: '/support' }
  ]}
  searchForm={{
    onSubmit: handleSearch,
    placeholder: 'Search...'
  }}
  searchTrigger={{
    'aria-label': 'Toggle search',
    icon: 'search'
  }}
  breadcrumbs={{
    items: [
      { label: 'Home', href: '/' },
      { label: 'Products', href: '/products' }
    ]
  }}
  menuTrigger={{}}
  menu={{
    children: <nav>Main navigation content</nav>
  }}
>
  MyApp
</Header>
```

### Do's and Don'ts

Do's:
- Use the header as the main navigation component at the top of your application
- Provide accessible labels for interactive elements like search and menu triggers
- Keep quick links to a reasonable number (3-5 items)
- Use breadcrumbs to show hierarchical navigation structure

Don'ts:
- Don't nest multiple headers
- Don't override the default menu trigger icon unless necessary
- Don't put lengthy content in quick links

### Related Components

- Logo (header part)
- MenuTrigger (header part)
- Search (header part)
- Breadcrumbs (molecule)
- SearchForm (molecule)
- Button (atom)
- SearchSuggestions (atom)

---

## Footer

Application footer with search, links, language selector, and copyright information.

### Import

```typescript
import { Footer } from '@bosch/react-frok';
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `variation` | `'default' \| 'minimal'` | Yes | Footer variation type |
| `backToTopButton` | `Slot<ButtonProps>` | No | Button to scroll back to top |
| `claim` | `Slot<'div'>` | No | Company claim or tagline |
| `languageSelector` | `Slot<LanguageSelectorProps>` | No | Language selection component |
| `shareOptions` | `Slot<'div'>` | No | Social media sharing options |
| `searchForm` | `Slot<SearchFormProps>` | No | Search form in footer |
| `searchCta` | `React.ReactNode` | No | Call-to-action text for search |
| `copyright` | `Slot<'div'>` | No | Copyright information |
| `bottomLinks` | `Slot<FooterLinksProps>` | No | Links at the bottom of footer |
| `topLinks` | `Slot<FooterLinksProps>` | No | Links at the top of footer |
| `as` | `React.ElementType` | No | Render as different element (default: 'footer') |
| `className` | `string` | No | Additional CSS classes |
| `children` | `never` | No | Children not allowed |

### Variants

- **default**: Full footer with all available sections (search, claim, language selector, top/bottom links, share options)
- **minimal**: Simplified footer with only bottom links, copyright, and divider

### CSS Classes

| Class | Description |
|-------|-------------|
| `o-footer` | Base footer class |
| `o-footer__search-container` | Container for search section |
| `o-footer__search` | Search layout wrapper |
| `o-footer__search-cta` | Search call-to-action text |
| `o-footer__top` | Top section of footer |
| `o-footer__bottom` | Bottom section of footer |
| `o-footer__claim` | Company claim element |
| `o-footer__share` | Share options container |
| `o-footer__copyright` | Copyright information element |
| `o-footer__back-to-top` | Back to top button |
| `o-footer__links` | Links container |
| `-show-suggestions` | Applied when search has suggestions |
| `-minimal` | Applied when variation is minimal |
| `-secondary` | Applied to search container |

### Usage Example

```tsx
// Default variation
<Footer
  variation="default"
  claim={{
    children: 'Invented for life'
  }}
  searchForm={{
    onSubmit: handleSearch,
    placeholder: 'Search our site...'
  }}
  searchCta="Looking for something?"
  languageSelector={{
    currentLanguage: 'en',
    languages: [
      { code: 'en', label: 'English' },
      { code: 'de', label: 'Deutsch' }
    ]
  }}
  topLinks={{
    children: [
      <a href="/about">About</a>,
      <a href="/careers">Careers</a>
    ]
  }}
  bottomLinks={{
    children: [
      <a href="/privacy">Privacy</a>,
      <a href="/terms">Terms</a>
    ]
  }}
  copyright={{
    children: '© 2026 Robert Bosch GmbH'
  }}
  backToTopButton={{
    onClick: scrollToTop
  }}
/>

// Minimal variation
<Footer
  variation="minimal"
  bottomLinks={{
    children: [
      <a href="/privacy">Privacy</a>,
      <a href="/terms">Terms</a>
    ]
  }}
  copyright={{
    children: '© 2026 Robert Bosch GmbH'
  }}
/>
```

### Do's and Don'ts

Do's:
- Use 'minimal' variation for secondary pages or when space is limited
- Provide copyright information
- Group related links logically in top and bottom link sections
- Include accessible back-to-top functionality for long pages

Don'ts:
- Don't pass children to Footer (not supported)
- Don't overload footer with too many links
- Don't use search in minimal variation
- Don't forget to provide the required variation prop

### Related Components

- FooterLinks
- SearchForm (molecule)
- LanguageSelector (molecule)
- Button (atom)
- Divider (atom)

---

## FooterLinks

A list of links specifically styled for use within the Footer component.

### Import

```typescript
import { FooterLinks } from '@bosch/react-frok';
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `children` | `Array<React.ReactElement>` | No | Array of link elements to display |
| `as` | `React.ElementType` | No | Render as different element (default: 'ul') |
| `className` | `string` | No | Additional CSS classes |

### CSS Classes

| Class | Description |
|-------|-------------|
| `o-footer__links` | Base links list class |

### Usage Example

```tsx
<FooterLinks>
  {[
    <a href="/privacy">Privacy Policy</a>,
    <a href="/terms">Terms of Use</a>,
    <a href="/cookies">Cookie Settings</a>,
    <a href="/legal">Legal Notice</a>
  ]}
</FooterLinks>

// Or as a slot in Footer
<Footer
  variation="default"
  bottomLinks={{
    children: [
      <a href="/privacy">Privacy</a>,
      <a href="/terms">Terms</a>
    ]
  }}
/>
```

### Do's and Don'ts

Do's:
- Use within Footer component for consistent styling
- Provide an array of link elements as children
- Keep link text concise and clear

Don'ts:
- Don't use outside of Footer context (styling is footer-specific)
- Don't pass non-link elements as children
- Don't mix different element types (stick to anchors or buttons)

### Related Components

- Footer
- Link (atom)

---

## ContextMenu

A dropdown menu component triggered by a button, providing contextual actions or options. Built on top of Popover with menu structure.

### Import

```typescript
import { ContextMenu } from '@bosch/react-frok';
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `closeKey` | `string` | No | The key for closing the context menu (defaults to Escape) |
| `closePopoverIcon` | `IconName` | No | The icon displayed when menu is open (default: 'close') |
| `openPopoverIcon` | `IconName` | No | The icon displayed when menu is closed (default: 'options') |
| `ariaOpenPopoverButtonLabel` | `string` | No | ARIA label for open trigger (default: 'Open context menu') |
| `ariaClosePopoverButtonLabel` | `string` | No | ARIA label for close trigger (default: 'Close context menu') |
| `ariaMenuLabel` | `string` | No | ARIA label for the menubar (default: 'Context menu') |
| `popover` | `PopoverProps` | No | Popover properties to passthrough |
| `children` | `ReactChildren` | No | Menu items (MenuItem, MenuItemLink, MenuItemGroup, ContextSubMenu) |
| `trigger` | `ReactElement` | No | Custom trigger element (uses default button if not provided) |
| `open` | `boolean` | No | Controlled open state |
| `defaultOpen` | `boolean` | No | Default open state (uncontrolled) |
| `onOpenChange` | `(open: boolean) => void` | No | Callback when open state changes |

### Sub-components

**ContextMenu.Item** - Individual menu item (from MenuItem atom)

**ContextMenu.Link** - Menu item as a link (from MenuItemLink atom)

**ContextMenu.Label** - Menu item label element (from MenuItemLabel atom)

**ContextMenu.Group** - Group of menu items (from MenuItemGroup atom)

**ContextMenu.SubMenu** - Nested submenu with hover behavior

#### ContextSubMenu Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `label` | `string` | No | Label text for the submenu item |
| `ariaOpenButtonLabel` | `string` | No | ARIA label for submenu button (default: 'Open') |
| `children` | `MenuItemProps` elements | No | Menu items within the submenu |
| `expanded` | `boolean` | No | Controlled expanded state |
| `defaultExpanded` | `boolean` | No | Default expanded state (uncontrolled) |

### CSS Classes

| Class | Description |
|-------|-------------|
| `o-context-menu` | Base context menu class |
| `o-context-menu__trigger` | Default trigger button |
| `-open` | Applied when menu is open |
| `m-menu-group` | Menu group container (menubar) |
| `m-menu-group__flyout` | Flyout submenu container |
| `-primary` | Applied to flyout submenus |
| `a-menu-item` | Individual menu item |
| `a-menu-item__wrapper` | Menu item wrapper |
| `a-menu-item__side-menu` | Submenu trigger button |

### Usage Example

```tsx
// Basic usage with default trigger
<ContextMenu>
  <ContextMenu.Item label="Edit" onClick={handleEdit} />
  <ContextMenu.Item label="Delete" onClick={handleDelete} />
</ContextMenu>

// With custom trigger
<ContextMenu
  trigger={<Button icon="more-vertical" mode="integrated" />}
  popover={{ position: 'bottom-end' }}
>
  <ContextMenu.Item label="Share" icon="share" />
  <ContextMenu.Item label="Download" icon="download" />
</ContextMenu>

// With submenu
<ContextMenu>
  <ContextMenu.Item label="Copy" />
  <ContextMenu.SubMenu label="Export">
    <ContextMenu.Item label="PDF" />
    <ContextMenu.Item label="CSV" />
    <ContextMenu.Item label="JSON" />
  </ContextMenu.SubMenu>
  <ContextMenu.Item label="Delete" />
</ContextMenu>

// With groups
<ContextMenu ariaMenuLabel="Document actions">
  <ContextMenu.Group>
    <ContextMenu.Item label="Open" />
    <ContextMenu.Item label="Edit" />
  </ContextMenu.Group>
  <ContextMenu.Group>
    <ContextMenu.Item label="Delete" />
  </ContextMenu.Group>
</ContextMenu>

// Controlled state
<ContextMenu
  open={isOpen}
  onOpenChange={setIsOpen}
  closeKey="Escape"
>
  <ContextMenu.Item label="Action 1" />
  <ContextMenu.Item label="Action 2" />
</ContextMenu>
```

### Do's and Don'ts

Do's:
- Use for contextual actions related to a specific element
- Provide clear, concise labels for menu items
- Use submenu for related actions that need grouping
- Provide appropriate ARIA labels for accessibility
- Use controlled state when you need to manage menu visibility externally

Don'ts:
- Don't use for primary navigation (use navigation components instead)
- Don't nest submenus too deeply (one level is typically sufficient)
- Don't include too many items (consider grouping or alternative UI)
- Don't override default icons without good reason

### Related Components

- Popover (molecule) - underlying component
- MenuItem (atom) - individual menu items
- MenuItemLink (atom) - link menu items
- MenuItemGroup (atom) - grouping menu items
- Button (atom) - default trigger
- Icon (atom) - used in trigger and submenu

---

## MinimalHeader

A simplified header component with logo, title, actions, and optional side navigation. Designed for minimal layouts with responsive behavior.

### Import

```typescript
import { MinimalHeader } from '@bosch/react-frok';
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `sideNavigation` | `SideNavigationProps \| React.ReactElement<SideNavigationProps> \| null` | No | Side navigation configuration or element |
| `logo` | `Slot<LogoProps>` | No | Logo component configuration |
| `actions` | `HeaderActionProps[] \| Slot<'ul'>` | No | Array of action buttons or custom action list |
| `falaffel` | `Slot<'div'>` | No | Custom falaffel menu slot |
| `burger` | `ButtonProps` | No | Burger menu button props |
| `as` | `React.ElementType` | No | Render as different element (default: 'header') |
| `className` | `string` | No | Additional CSS classes |
| `children` | `React.ReactNode` | No | Title content |
| `open` | `boolean` | No | Controlled side navigation open state |
| `defaultOpen` | `boolean` | No | Default side navigation open state (uncontrolled) |
| `onOpenChange` | `(open: boolean) => void` | No | Callback when side navigation state changes |

#### HeaderActionProps

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `showLabel` | `boolean` | No | Whether to show label on desktop (always hidden on mobile falaffel) |
| `value` | `string` | No | Action value |
| ...MenuItemProps | Various | No | All MenuItem props (label, icon, onClick, etc.) |

### CSS Classes

| Class | Description |
|-------|-------------|
| `o-minimal-header` | Base minimal header class |
| `-primary` | Primary header styling |
| `o-minimal-header__supergraphic` | Decorative background graphic |
| `o-minimal-header__top` | Top section container |
| `o-minimal-header__burger` | Burger menu button container (tablet/mobile) |
| `o-minimal-header__title` | Title section |
| `o-minimal-header__actions` | Actions list (desktop) |
| `o-minimal-header__falafel` | Falaffel menu container (mobile) |

### Usage Example

```tsx
// Basic usage with title
<MinimalHeader>
  My Application
</MinimalHeader>

// With logo
<MinimalHeader
  logo={{
    href: '/',
    alt: 'Bosch Logo',
    variant: 'small'
  }}
>
  Dashboard
</MinimalHeader>

// With actions array
<MinimalHeader
  actions={[
    { label: 'Settings', icon: 'settings', onClick: handleSettings, showLabel: true },
    { label: 'Profile', icon: 'user', onClick: handleProfile },
    { label: 'Logout', icon: 'logout', onClick: handleLogout }
  ]}
>
  My App
</MinimalHeader>

// With side navigation
<MinimalHeader
  sideNavigation={{
    items: [
      { label: 'Home', href: '/' },
      { label: 'Products', href: '/products' },
      { label: 'About', href: '/about' }
    ]
  }}
  burger={{
    'aria-label': 'Toggle navigation'
  }}
>
  Application Name
</MinimalHeader>

// Controlled side navigation state
<MinimalHeader
  sideNavigation={{ items: navItems }}
  open={navOpen}
  onOpenChange={setNavOpen}
>
  My App
</MinimalHeader>

// Custom actions slot
<MinimalHeader
  actions={{
    children: (
      <>
        <li><button>Action 1</button></li>
        <li><button>Action 2</button></li>
      </>
    ),
    role: 'menu'
  }}
>
  Custom Actions
</MinimalHeader>
```

### Do's and Don'ts

Do's:
- Use for minimal, streamlined layouts
- Use actions array for simple button-based actions
- Provide clear title content as children
- Use side navigation for primary navigation on mobile/tablet
- Set showLabel: true for important actions that benefit from text labels on desktop

Don'ts:
- Don't use for complex header layouts (use Header organism instead)
- Don't overload with too many actions (keep it minimal)
- Don't forget burger button configuration when using side navigation
- Don't use both actions array and falaffel slot simultaneously

### Related Components

- SideNavigation (molecule)
- Logo (header part)
- Button (atom)
- ContextMenu - used internally for mobile falaffel menu
- Icon (atom)

---

## LoginForm

A pre-styled login form component with username, password, remember-me checkbox, and submit button. Built on top of the Form organism.

### Import

```typescript
import { LoginForm } from '@bosch/react-frok';
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `formHeader` | `TextProps` | No | Header text configuration for the form |
| `values` | `FormValues` | No | Form values object with username and password |
| `errors` | `FormErrors` | No | Form errors object for validation feedback |
| `usernameField` | `string \| TextFieldProps` | No | Username label string or full TextField configuration (default: 'Username') |
| `passwordField` | `string \| TextFieldProps` | No | Password label string or full TextField configuration (default: 'Password') |
| `loginButton` | `string \| ButtonProps` | No | Login button label string or full Button configuration (default: 'Login') |
| `rememberMeCheckbox` | `string \| CheckboxProps` | No | Remember-me label string or full Checkbox configuration (default: 'Stay logged in') |
| ...HTMLFormElement | Various | No | All standard HTML form attributes (onSubmit, etc.) |

#### FormValues Interface

```typescript
{
  username?: string;
  password?: string;
}
```

#### FormErrors Interface

```typescript
{
  username?: { text: string; type: NotificationType };
  password?: { text: string; type: NotificationType };
}
```

### Constants

- `FIELD_USERNAME` - 'username' - Name attribute for username field
- `FIELD_PASSWORD` - 'password' - Name attribute for password field

### CSS Classes

The component uses styled-components with custom styling. Key internal classes:

| Class | Description |
|-------|-------------|
| `o-form` | Form wrapper (from Form organism) |
| `a-text` | Header text element |
| `a-checkbox` | Remember-me checkbox |

### Usage Example

```tsx
// Basic usage
<LoginForm onSubmit={handleLogin} />

// With custom labels
<LoginForm
  usernameField="Email Address"
  passwordField="Password"
  loginButton="Sign In"
  rememberMeCheckbox="Keep me signed in"
  onSubmit={handleLogin}
/>

// With values and errors
<LoginForm
  values={{ username: email, password: pwd }}
  errors={{
    username: { text: 'Invalid email format', type: 'error' },
    password: { text: 'Password is required', type: 'error' }
  }}
  onSubmit={handleLogin}
/>

// With header and full configuration
<LoginForm
  formHeader={{
    children: 'Welcome Back',
    as: 'h2',
    size: 'large'
  }}
  usernameField={{
    label: 'Email',
    type: 'email',
    placeholder: 'you@example.com',
    required: true
  }}
  passwordField={{
    label: 'Password',
    placeholder: 'Enter your password',
    required: true
  }}
  loginButton={{
    label: 'Log In',
    mode: 'primary',
    size: 'large'
  }}
  rememberMeCheckbox={{
    label: 'Remember me',
    defaultChecked: true
  }}
  values={formValues}
  errors={validationErrors}
  onSubmit={handleLogin}
/>

// With form ref
const formRef = useRef<HTMLFormElement>(null);

<LoginForm
  ref={formRef}
  onSubmit={handleLogin}
  usernameField="Username"
  passwordField="Password"
/>
```

### Do's and Don'ts

Do's:
- Use for standard login scenarios
- Provide clear validation error messages via errors prop
- Handle form submission with onSubmit handler
- Use controlled values for managing form state
- Provide appropriate field configurations for your use case

Don'ts:
- Don't use for complex authentication flows (build custom forms)
- Don't forget to handle form validation
- Don't expose sensitive error details in validation messages
- Don't bypass the built-in field structure (username/password/remember-me)

### Related Components

- Form (organism) - underlying form component
- FormField (molecule) - wraps each field with validation
- TextField (atom) - username and password inputs
- Checkbox (atom) - remember-me checkbox
- Button (atom) - submit button
- Text (atom) - form header
