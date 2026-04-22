# Atoms

Basic UI elements — the smallest building blocks of the design system.

---

## Component List

### Buttons & Actions
| Component | File | Description |
|-----------|------|-------------|
| **Button** | [button.md](button.md) | Primary, secondary, tertiary, integrated buttons |
| **Link** | [link.md](link.md) | Styled anchor with button variants |
| **Chip** | [chip.md](chip.md) | Interactive tag with close functionality |

### Icons & Indicators
| Component | File | Description |
|-----------|------|-------------|
| **Icon** | [icon.md](icon.md) | 3000+ Bosch icons with categorized reference |
| **Badge** | [badge.md](badge.md) | Status indicator with semantic variants |
| **Sticker** | [sticker.md](sticker.md) | Colored label tag |
| **ActivityIndicator** | [activity-indicator.md](activity-indicator.md) | Loading spinner |
| **ProgressIndicator** | [progress-indicator.md](progress-indicator.md) | Progress bar |
| **PageIndicator** | [page-indicator.md](page-indicator.md) | Pagination dots |

### Form Controls
| Component | File | Description |
|-----------|------|-------------|
| **TextField** | [input.md](input.md) | Text input, password, search |
| **TextArea** | [textarea.md](textarea.md) | Multi-line text input |
| **Dropdown** | [dropdown.md](dropdown.md) | Select menu with options |
| **Checkbox** | [checkbox.md](checkbox.md) | Multi-select with indeterminate state |
| **RadioButton** | [radiobutton.md](radiobutton.md) | Single-select from options |
| **Toggle** | [toggle.md](toggle.md) | On/off switch with labels |
| **Slider** | [slider.md](slider.md) | Range input |
| **Rating** | [rating.md](rating.md) | Star rating input/display |
| **ValueModificator** | [value-modificator.md](value-modificator.md) | Numeric stepper |
| **OptionBar** | [option-bar.md](option-bar.md) | Segmented control |
| **SearchSuggestions** | [search-suggestions.md](search-suggestions.md) | Typeahead suggestions |

### Typography & Content
| Component | File | Description |
|-----------|------|-------------|
| **Text** | [text.md](text.md) | Typography component with styling props |
| **Tooltip** | [tooltip.md](tooltip.md) | Hover/focus information overlay |
| **Notification** | [notification.md](notification.md) | Alert banners (error, success, warning, info) |

### Data Display
| Component | File | Description |
|-----------|------|-------------|
| **Table** | [table.md](table.md) | Data table with head/body/row/cell |
| **List** | [list.md](list.md) | Menu list container |
| **MenuItem** | [list.md](list.md) | List item for menus |
| **Accordion** | [accordion.md](accordion.md) | Collapsible content sections |

### Media
| Component | File | Description |
|-----------|------|-------------|
| **Image** | [image.md](image.md) | Responsive image component |
| **Video** | [video.md](video.md) | Video player |
| **Background** | [background.md](background.md) | Decorative background patterns |

### Layout & Navigation
| Component | File | Description |
|-----------|------|-------------|
| **Box** | [box.md](box.md) | Generic container |
| **Tile** | [tile.md](tile.md) | Card container with highlight |
| **SelectableTile** | [selectable-tile.md](selectable-tile.md) | Clickable card selection |
| **Divider** | [divider.md](divider.md) | Horizontal/vertical separator |
| **TabNavigation** | [tab-navigation.md](tab-navigation.md) | Tabbed content switching |

---

## CSS Class Pattern

All atom components use the `.a-` prefix:

```css
.a-button        /* Button */
.a-icon          /* Icon */
.a-toggle        /* Toggle switch */
.a-checkbox      /* Checkbox */
.a-notification  /* Notification banner */
.a-badge         /* Badge */
.a-chip          /* Chip */
```

---

## Quick Import

```tsx
import {
  Button,
  Icon,
  Badge,
  Chip,
  Toggle,
  Checkbox,
  TextField,
  TextArea,
  Tooltip,
  Notification,
  ActivityIndicator,
  ProgressIndicator,
  Slider,
  Rating,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Accordion,
  List,
  MenuItem,
  Image,
  Text,
  Tile,
  Box,
  Divider
} from '@bosch/react-frok';
```

---

## Common Patterns

### Button Group
```tsx
<div style={{ display: 'flex', gap: '0.75rem' }}>
  <Button mode="primary">Save</Button>
  <Button mode="secondary">Cancel</Button>
  <Button mode="tertiary">Reset</Button>
</div>
```

### Icon Button
```tsx
<Button mode="tertiary" icon="close" aria-label="Close" />
```

### Status Badge
```tsx
<Badge variant="success">Active</Badge>
<Badge variant="error">Failed</Badge>
<Badge variant="warning">Pending</Badge>
```

### Loading State
```tsx
{isLoading ? (
  <ActivityIndicator />
) : (
  <div>Content loaded</div>
)}
```

### Notification Banner
```tsx
<Notification variant="error" title="Error">
  Something went wrong. Please try again.
</Notification>
```
