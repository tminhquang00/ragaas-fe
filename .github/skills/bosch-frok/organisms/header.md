# Header

Main application header with logo, search, menu, breadcrumbs, and quick links.

---

## Import

```tsx
import { Header } from '@bosch/react-frok';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `logo` | `LogoProps` | - | Logo configuration |
| `searchForm` | `SearchFormProps` | - | Search form slot |
| `searchTrigger` | `ButtonProps` | - | Search toggle button |
| `suggestions` | `SearchSuggestionsProps` | - | Search suggestions |
| `breadcrumbs` | `BreadcrumbsProps` | - | Breadcrumb navigation |
| `menuTrigger` | `MenuTriggerProps` | - | Menu toggle button (hamburger) |
| `menu` | `ReactNode` | - | Main navigation content |
| `quickLinks` | `ButtonProps[]` | - | Quick action links |
| `children` | `ReactNode` | - | Subbrand content |
| `as` | `ElementType` | `'header'` | Root element type |
| `className` | `string` | - | Additional CSS classes |

---

## CSS Classes

| Class | Description |
|-------|-------------|
| `.o-header` | Base header styles |
| `.o-header__top-container` | Top section container |
| `.o-header__top` | Top section layout |
| `.o-header__logo` | Logo container |
| `.o-header__quicklinks` | Quick links container |
| `.o-header__search_suggestions_container` | Search suggestions |
| `.o-header__meta` | Breadcrumbs/subbrand area |
| `.o-header__navigation-container` | Main navigation |
| `.o-header__subbrand` | Subbrand text |
| `.-menu-open` | Menu open state |
| `.-search-open` | Search open state |
| `.-second-level-open` | Second level menu open |
| `.-third-level-open` | Third level menu open |
| `.-show-suggestions` | Suggestions visible |

---

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--g-gray-100` | `#ffffff` | Header background |
| `--g-gray-85` | `#d0d4d8` | Border color |
| `--shadow-fill` | `rgba(0,0,0,0.15)` | Shadow |

---

## Usage Examples

### Basic Header
```tsx
<Header
  logo={{ href: '/', alt: 'My App' }}
  menuTrigger={{}}
/>
```

### With Search
```tsx
<Header
  logo={{ href: '/' }}
  searchForm={{
    placeholder: 'Search...',
    onSubmit: (query) => handleSearch(query)
  }}
  searchTrigger={{
    'aria-label': 'Toggle search'
  }}
  menuTrigger={{}}
/>
```

### With Breadcrumbs
```tsx
<Header
  logo={{ href: '/' }}
  breadcrumbs={{
    items: [
      { label: 'Home', href: '/' },
      { label: 'Products', href: '/products' },
      { label: 'Widget Pro' }
    ]
  }}
  menuTrigger={{}}
/>
```

### With Quick Links
```tsx
<Header
  logo={{ href: '/' }}
  quickLinks={[
    { children: 'Contact', onClick: () => navigate('/contact') },
    { children: 'Support', href: '/support' },
    { children: 'Login', onClick: openLoginDialog }
  ]}
  menuTrigger={{}}
/>
```

### With Navigation Menu
```tsx
<Header
  logo={{ href: '/' }}
  menuTrigger={{}}
  menu={{
    children: (
      <nav>
        <List>
          <MenuItem onClick={() => navigate('/dashboard')}>Dashboard</MenuItem>
          <MenuItem onClick={() => navigate('/products')}>Products</MenuItem>
          <MenuItem onClick={() => navigate('/settings')}>Settings</MenuItem>
        </List>
      </nav>
    )
  }}
/>
```

### With Subbrand
```tsx
<Header
  logo={{ href: '/' }}
  menuTrigger={{}}
>
  My Application Name
</Header>
```

### Full Featured Header
```tsx
<Header
  logo={{ href: '/', alt: 'Bosch Logo' }}
  quickLinks={[
    { children: 'Support', href: '/support' },
    { children: 'Contact', href: '/contact' }
  ]}
  searchForm={{
    placeholder: 'Search...',
    onSubmit: handleSearch
  }}
  searchTrigger={{ 'aria-label': 'Search' }}
  suggestions={{
    items: searchResults,
    onSelect: handleSuggestionSelect
  }}
  breadcrumbs={{
    items: [
      { label: 'Home', href: '/' },
      { label: currentSection }
    ]
  }}
  menuTrigger={{}}
  menu={{
    children: <MainNavigation />
  }}
>
  My App
</Header>
```

---

## Controlled Menu State

```tsx
const [isMenuOpen, setIsMenuOpen] = useState(false);

<Header
  logo={{ href: '/' }}
  menuTrigger={{
    onClick: () => setIsMenuOpen(!isMenuOpen)
  }}
  className={isMenuOpen ? '-menu-open' : ''}
  menu={{
    children: (
      <nav>
        <List>
          <MenuItem onClick={() => { navigate('/'); setIsMenuOpen(false); }}>
            Home
          </MenuItem>
        </List>
      </nav>
    )
  }}
/>
```

---

## Responsive Behavior

The header handles responsive states automatically:
- **Desktop**: Full navigation visible
- **Mobile**: Hamburger menu, search collapses

CSS media query breakpoint: `1152px`

---

## Do's and Don'ts

**Do:**
- Include logo that links to home
- Provide accessible labels for icon-only buttons
- Keep quick links to 3-5 items
- Use breadcrumbs for deep navigation

**Don't:**
- Don't nest multiple headers
- Don't put lengthy content in quick links
- Don't override menu trigger icon without reason
- Don't hide critical navigation in collapsed menu only

---

## Related Components
- [MinimalHeader](minimal-header.md) — Simplified header
- [Footer](footer.md) — Page footer
- [Breadcrumbs](../molecules/breadcrumbs.md) — Navigation path
- [SearchForm](../molecules/search-form.md) — Search input
