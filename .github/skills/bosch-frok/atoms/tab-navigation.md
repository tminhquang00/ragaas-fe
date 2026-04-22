# TabNavigation

Tabbed content navigation component.

---

## Import

```tsx
import { TabNavigation, Tab } from '@bosch/react-frok';
```

---

## Props

### TabNavigation Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `selectedValue` | `string` | - | Currently selected tab value |
| `onTabSelect` | `(value: string) => void` | - | Tab change handler |
| `children` | `ReactNode` | - | Tab children |
| `className` | `string` | - | Additional CSS classes |

### Tab Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | - | **Required** — Tab identifier |
| `label` | `string` | - | Tab text |
| `icon` | `string` | - | Tab icon |
| `disabled` | `boolean` | `false` | Disable tab |
| `badge` | `number \| string` | - | Badge counter |
| `className` | `string` | - | Additional CSS classes |

---

## CSS Classes

| Class | Description |
|-------|-------------|
| `.a-tab-navigation` | Base container |
| `.a-tab-navigation__list` | Tab list wrapper |
| `.a-tab-navigation__tab` | Individual tab |
| `.a-tab-navigation__tab--selected` | Active tab |
| `.a-tab-navigation__tab--disabled` | Disabled tab |
| `.a-tab-navigation__label` | Tab label text |
| `.a-tab-navigation__icon` | Tab icon |
| `.a-tab-navigation__badge` | Counter badge |
| `.a-tab-navigation__indicator` | Active indicator line |

---

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--g-gray-100` | `#ffffff` | Background |
| `--g-gray-85` | `#d0d4d8` | Border color |
| `--g-blue-50` | `#007bc0` | Active indicator |
| `--nested-minor__enabled__hovered__fill` | `#eff1f2` | Tab hover |
| `--g-gray-50` | `#525f6b` | Inactive text |

---

## Usage Examples

### Basic Tabs
```tsx
const [activeTab, setActiveTab] = useState('overview');

<TabNavigation
  selectedValue={activeTab}
  onTabSelect={setActiveTab}
>
  <Tab value="overview" label="Overview" />
  <Tab value="details" label="Details" />
  <Tab value="settings" label="Settings" />
</TabNavigation>

{activeTab === 'overview' && <OverviewContent />}
{activeTab === 'details' && <DetailsContent />}
{activeTab === 'settings' && <SettingsContent />}
```

### With Icons
```tsx
<TabNavigation selectedValue={tab} onTabSelect={setTab}>
  <Tab value="files" label="Files" icon="folder" />
  <Tab value="images" label="Images" icon="image" />
  <Tab value="videos" label="Videos" icon="video" />
</TabNavigation>
```

### With Badges
```tsx
<TabNavigation selectedValue={tab} onTabSelect={setTab}>
  <Tab value="inbox" label="Inbox" badge={12} />
  <Tab value="sent" label="Sent" />
  <Tab value="drafts" label="Drafts" badge={3} />
</TabNavigation>
```

### Icon-Only Tabs
```tsx
<TabNavigation selectedValue={view} onTabSelect={setView}>
  <Tab value="grid" icon="grid-view" aria-label="Grid view" />
  <Tab value="list" icon="list-view" aria-label="List view" />
  <Tab value="table" icon="table-view" aria-label="Table view" />
</TabNavigation>
```

### With Disabled Tab
```tsx
<TabNavigation selectedValue={tab} onTabSelect={setTab}>
  <Tab value="active" label="Active" />
  <Tab value="pending" label="Pending" />
  <Tab value="premium" label="Premium" disabled />
</TabNavigation>
```

### Controlled with URL
```tsx
import { useSearchParams } from 'react-router-dom';

const [searchParams, setSearchParams] = useSearchParams();
const currentTab = searchParams.get('tab') || 'overview';

<TabNavigation
  selectedValue={currentTab}
  onTabSelect={(tab) => setSearchParams({ tab })}
>
  <Tab value="overview" label="Overview" />
  <Tab value="activity" label="Activity" />
</TabNavigation>
```

### Full Width Tabs
```tsx
<div style={{ borderBottom: '1px solid var(--g-gray-85)' }}>
  <TabNavigation selectedValue={tab} onTabSelect={setTab}>
    <Tab value="tab1" label="First Tab" />
    <Tab value="tab2" label="Second Tab" />
    <Tab value="tab3" label="Third Tab" />
  </TabNavigation>
</div>
```

---

## Accessibility

```tsx
<TabNavigation
  selectedValue={tab}
  onTabSelect={setTab}
  role="tablist"
  aria-label="Content sections"
>
  <Tab 
    value="overview" 
    label="Overview"
    role="tab"
    aria-selected={tab === 'overview'}
    aria-controls="panel-overview"
  />
</TabNavigation>

<div
  id="panel-overview"
  role="tabpanel"
  aria-labelledby="tab-overview"
  hidden={tab !== 'overview'}
>
  Content here
</div>
```

- Arrow keys navigate between tabs
- Enter/Space activates tab
- Use proper ARIA roles and relationships

---

## Do's and Don'ts

**Do:**
- Keep tab labels short
- Use icons for clarity
- Show badge counts for pending items
- Persist tab state in URL when appropriate

**Don't:**
- Don't use more than 6-7 tabs
- Don't use for wizard/stepper (use StepIndicator)
- Don't hide critical content in tabs

---

## Related Components
- [OptionBar](option-bar.md) — Segmented control
- [StepIndicator](../molecules/step-indicator.md) — Wizard steps
- [SideNavigation](../molecules/side-navigation.md) — Vertical navigation
