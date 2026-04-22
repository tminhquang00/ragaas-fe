# Table Components

Data table with header, body, rows, and cells for structured data display.

---

## Import

```tsx
import { 
  Table, 
  TableHead, 
  TableBody, 
  TableRow, 
  TableCell 
} from '@bosch/react-frok';
```

---

## Props

### Table Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | TableHead and TableBody |
| `className` | `string` | - | Additional CSS classes |

### TableHead Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | TableRow with header cells |
| `className` | `string` | - | Additional CSS classes |

### TableBody Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | TableRow elements |
| `className` | `string` | - | Additional CSS classes |

### TableRow Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | TableCell elements |
| `selected` | `boolean` | `false` | Row selection state |
| `onClick` | `() => void` | - | Row click handler |
| `className` | `string` | - | Additional CSS classes |

### TableCell Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | Cell content |
| `header` | `boolean` | `false` | Render as `<th>` |
| `sortable` | `boolean` | `false` | Enable sort indicator |
| `sortDirection` | `'asc' \| 'desc' \| 'none'` | `'none'` | Sort state |
| `onSort` | `() => void` | - | Sort click handler |
| `align` | `'left' \| 'center' \| 'right'` | `'left'` | Text alignment |
| `className` | `string` | - | Additional CSS classes |

---

## CSS Classes

| Class | Description |
|-------|-------------|
| `.m-table` | Base table container |
| `.m-table-head` | Table header section |
| `.m-table-body` | Table body section |
| `.m-table-row` | Table row |
| `.m-table-row--selected` | Selected row |
| `.m-table-row--clickable` | Clickable row (hover effect) |
| `.m-table-cell` | Table cell |
| `.m-table-cell--header` | Header cell |
| `.m-table-cell--sortable` | Sortable header |
| `.m-table-cell--sorted-asc` | Ascending sort |
| `.m-table-cell--sorted-desc` | Descending sort |
| `.m-table-cell--align-center` | Center aligned |
| `.m-table-cell--align-right` | Right aligned |

---

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--g-gray-95` | `#eff1f2` | Header background |
| `--g-gray-100` | `#ffffff` | Body background |
| `--g-gray-85` | `#d0d4d8` | Border color |
| `--nested-minor__enabled__hovered__fill` | `#eff1f2` | Row hover |
| `--nested-major__enabled__default__fill` | `#d1e4ff` | Selected row |

---

## Usage Examples

### Basic Table
```tsx
<Table>
  <TableHead>
    <TableRow>
      <TableCell header>Name</TableCell>
      <TableCell header>Email</TableCell>
      <TableCell header>Role</TableCell>
    </TableRow>
  </TableHead>
  <TableBody>
    <TableRow>
      <TableCell>John Doe</TableCell>
      <TableCell>john@example.com</TableCell>
      <TableCell>Admin</TableCell>
    </TableRow>
    <TableRow>
      <TableCell>Jane Smith</TableCell>
      <TableCell>jane@example.com</TableCell>
      <TableCell>User</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### With Sorting
```tsx
const [sortColumn, setSortColumn] = useState('name');
const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

const handleSort = (column: string) => {
  if (sortColumn === column) {
    setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
  } else {
    setSortColumn(column);
    setSortDirection('asc');
  }
};

<Table>
  <TableHead>
    <TableRow>
      <TableCell 
        header 
        sortable 
        sortDirection={sortColumn === 'name' ? sortDirection : 'none'}
        onSort={() => handleSort('name')}
      >
        Name
      </TableCell>
      <TableCell 
        header 
        sortable 
        sortDirection={sortColumn === 'date' ? sortDirection : 'none'}
        onSort={() => handleSort('date')}
      >
        Date
      </TableCell>
    </TableRow>
  </TableHead>
  <TableBody>
    {sortedData.map(item => (
      <TableRow key={item.id}>
        <TableCell>{item.name}</TableCell>
        <TableCell>{item.date}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### Selectable Rows
```tsx
const [selectedId, setSelectedId] = useState<string | null>(null);

<Table>
  <TableHead>
    <TableRow>
      <TableCell header>Project</TableCell>
      <TableCell header>Status</TableCell>
    </TableRow>
  </TableHead>
  <TableBody>
    {projects.map(project => (
      <TableRow
        key={project.id}
        selected={selectedId === project.id}
        onClick={() => setSelectedId(project.id)}
      >
        <TableCell>{project.name}</TableCell>
        <TableCell>{project.status}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### With Alignment
```tsx
<Table>
  <TableHead>
    <TableRow>
      <TableCell header>Product</TableCell>
      <TableCell header align="center">Quantity</TableCell>
      <TableCell header align="right">Price</TableCell>
    </TableRow>
  </TableHead>
  <TableBody>
    <TableRow>
      <TableCell>Widget A</TableCell>
      <TableCell align="center">10</TableCell>
      <TableCell align="right">$99.99</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### With Actions
```tsx
<Table>
  <TableHead>
    <TableRow>
      <TableCell header>Name</TableCell>
      <TableCell header align="right">Actions</TableCell>
    </TableRow>
  </TableHead>
  <TableBody>
    {items.map(item => (
      <TableRow key={item.id}>
        <TableCell>{item.name}</TableCell>
        <TableCell align="right">
          <Button mode="tertiary" icon="edit" iconOnly aria-label="Edit" />
          <Button mode="tertiary" icon="delete" iconOnly aria-label="Delete" />
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### Empty State
```tsx
<Table>
  <TableHead>
    <TableRow>
      <TableCell header>Name</TableCell>
      <TableCell header>Status</TableCell>
    </TableRow>
  </TableHead>
  <TableBody>
    {data.length === 0 ? (
      <TableRow>
        <TableCell colSpan={2} style={{ textAlign: 'center', padding: '2rem' }}>
          No data available
        </TableCell>
      </TableRow>
    ) : (
      data.map(item => (
        <TableRow key={item.id}>
          <TableCell>{item.name}</TableCell>
          <TableCell>{item.status}</TableCell>
        </TableRow>
      ))
    )}
  </TableBody>
</Table>
```

---

## Accessibility

```tsx
<Table aria-label="User list">
  <TableHead>
    <TableRow>
      <TableCell header scope="col">Name</TableCell>
      <TableCell header scope="col">Email</TableCell>
    </TableRow>
  </TableHead>
  <TableBody>
    <TableRow>
      <TableCell>John</TableCell>
      <TableCell>john@example.com</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

- Use `scope="col"` on header cells
- Provide `aria-label` or `aria-labelledby`
- Use `aria-sort` on sortable columns

---

## Do's and Don'ts

**Do:**
- Always include TableHead for clarity
- Use consistent column alignment
- Provide empty states
- Make clickable rows visually obvious

**Don't:**
- Don't omit headers
- Don't use for layout (use CSS Grid/Flex)
- Don't nest tables
- Don't make tables too wide (horizontal scroll)

---

## Related Components
- [DataList](../custom/data-list.md) — List-based data display
- [Pagination](page-indicator.md) — Table pagination
