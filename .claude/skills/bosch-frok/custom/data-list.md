# DataList

List component optimized for displaying structured data items.

---

## Import

```tsx
import { DataList } from '@bosch/react-frok';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `DataListItem[]` | - | **Required** — Array of data items |
| `renderItem` | `(item: DataListItem, index: number) => ReactNode` | - | Custom item renderer |
| `onItemClick` | `(item: DataListItem) => void` | - | Item click handler |
| `selectable` | `boolean` | `false` | Enable item selection |
| `selectedItems` | `string[]` | - | Selected item IDs |
| `onSelectionChange` | `(selected: string[]) => void` | - | Selection change handler |
| `emptyState` | `ReactNode` | - | Content when list is empty |
| `loading` | `boolean` | `false` | Show loading state |
| `className` | `string` | - | Additional CSS classes |

### DataListItem Type
```typescript
interface DataListItem {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  icon?: string;
  meta?: ReactNode;
  actions?: ReactNode;
}
```

---

## CSS Classes

| Class | Description |
|-------|-------------|
| `.c-data-list` | Base list styles |
| `.c-data-list__item` | Individual item |
| `.c-data-list__item--selected` | Selected state |
| `.c-data-list__item-icon` | Item icon |
| `.c-data-list__item-content` | Content wrapper |
| `.c-data-list__item-title` | Title text |
| `.c-data-list__item-subtitle` | Subtitle text |
| `.c-data-list__item-meta` | Meta information |
| `.c-data-list__item-actions` | Action buttons |
| `.c-data-list__empty` | Empty state container |

---

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--g-gray-100` | `#ffffff` | Item background |
| `--g-gray-95` | `#eff1f2` | Hover background |
| `--g-blue-90` | `#d1e4ff` | Selected background |
| `--g-gray-85` | `#d0d4d8` | Border color |

---

## Usage Examples

### Basic Data List
```tsx
const items = [
  { id: '1', title: 'Document A', subtitle: 'PDF • 2.3 MB' },
  { id: '2', title: 'Document B', subtitle: 'DOCX • 1.1 MB' },
  { id: '3', title: 'Document C', subtitle: 'PDF • 4.5 MB' }
];

<DataList items={items} />
```

### With Icons and Actions
```tsx
const items = [
  { 
    id: '1', 
    title: 'Project Alpha',
    subtitle: 'Last edited 2 hours ago',
    icon: 'folder',
    actions: (
      <>
        <Button mode="tertiary" icon="edit" iconOnly aria-label="Edit" />
        <Button mode="tertiary" icon="delete" iconOnly aria-label="Delete" />
      </>
    )
  }
];

<DataList items={items} onItemClick={(item) => navigate(`/project/${item.id}`)} />
```

### Selectable List
```tsx
const [selected, setSelected] = useState<string[]>([]);

<DataList
  items={users}
  selectable
  selectedItems={selected}
  onSelectionChange={setSelected}
/>

{/* Selection actions */}
{selected.length > 0 && (
  <CommandBar
    content={<span>{selected.length} selected</span>}
    mainAction={
      <Button mode="primary" onClick={() => handleBulkDelete(selected)}>
        Delete Selected
      </Button>
    }
  />
)}
```

### Custom Item Renderer
```tsx
<DataList
  items={products}
  renderItem={(item) => (
    <div style={{ display: 'flex', gap: '1rem', padding: '1rem' }}>
      <Image src={item.thumbnail} alt={item.title} style={{ width: 60 }} />
      <div>
        <h4 className="-size-m highlight">{item.title}</h4>
        <p className="-size-s" style={{ color: 'var(--g-gray-50)' }}>
          {item.description}
        </p>
        <Badge variant={item.inStock ? 'success' : 'error'}>
          {item.inStock ? 'In Stock' : 'Out of Stock'}
        </Badge>
      </div>
    </div>
  )}
/>
```

### Empty State
```tsx
<DataList
  items={filteredItems}
  emptyState={
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <Icon iconName="search" size="large" style={{ color: 'var(--g-gray-65)' }} />
      <p className="-size-m" style={{ marginTop: '1rem', color: 'var(--g-gray-50)' }}>
        No items found matching your search.
      </p>
    </div>
  }
/>
```

### Loading State
```tsx
<DataList
  items={items}
  loading={isLoading}
/>
```

---

## Do's and Don'ts

**Do:**
- Provide unique `id` for each item
- Use subtitle for secondary information
- Add actions for common item operations
- Provide meaningful empty states

**Don't:**
- Don't use for simple navigation (use List)
- Don't overload items with too much content
- Don't mix selectable and custom click handlers

---

## Related Components
- [List](../atoms/list.md) — Simple menu list
- [Table](../atoms/table.md) — Tabular data
- [CommandBar](command-bar.md) — Selection actions
