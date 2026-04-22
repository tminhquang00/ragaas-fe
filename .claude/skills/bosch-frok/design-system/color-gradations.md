# Color Gradations

Raw color palette tokens. Each color has 21 levels from 00 (darkest) to 100 (lightest) in 5% increments.

**CSS Variable Pattern:** `--g-{color}-{level}`

---

## Gray Scale (`--g-gray-*`)

The foundation neutral palette for text, backgrounds, and borders.

| Token | Value | Usage |
|-------|-------|-------|
| `--g-gray-00` | `#000000` | Pure black, highest emphasis text |
| `--g-gray-05` | `#101112` | Near black |
| `--g-gray-10` | `#1a1c1d` | Very dark backgrounds |
| `--g-gray-15` | `#232628` | Dark mode containers |
| `--g-gray-20` | `#2e3033` | Dark mode elevated surfaces |
| `--g-gray-25` | `#383b3e` | Dark mode cards |
| `--g-gray-30` | `#43464a` | Dark border colors |
| `--g-gray-35` | `#4e5256` | Disabled text (dark mode) |
| `--g-gray-40` | `#595e62` | Secondary text (dark mode) |
| `--g-gray-45` | `#656a6f` | |
| `--g-gray-50` | `#71767c` | **Primary neutral** — icons, secondary text |
| `--g-gray-55` | `#7d8389` | |
| `--g-gray-60` | `#8a9097` | |
| `--g-gray-65` | `#979ea4` | Placeholder text, disabled text |
| `--g-gray-70` | `#a4abb3` | |
| `--g-gray-75` | `#b2b9c0` | Disabled icons |
| `--g-gray-80` | `#c1c7cc` | Light borders, dividers |
| `--g-gray-85` | `#d0d4d8` | Input borders |
| `--g-gray-90` | `#e0e2e5` | Secondary backgrounds, disabled fills |
| `--g-gray-95` | `#eff1f2` | Hover backgrounds, light fills |
| `--g-gray-100` | `#ffffff` | Pure white, card backgrounds |

---

## Blue Scale (`--g-blue-*`) — Primary Accent

Brand blue for primary actions, links, and focus states.

| Token | Value | Usage |
|-------|-------|-------|
| `--g-blue-00` | `#000000` | Black (for gradation) |
| `--g-blue-05` | `#00111d` | Very dark blue |
| `--g-blue-10` | `#001b2b` | |
| `--g-blue-15` | `#00243a` | |
| `--g-blue-20` | `#002e4a` | |
| `--g-blue-25` | `#003859` | |
| `--g-blue-30` | `#004975` | **Pressed state** — active buttons |
| `--g-blue-35` | `#005587` | |
| `--g-blue-40` | `#00629a` | **Hover state** — button hover |
| `--g-blue-45` | `#006fad` | |
| `--g-blue-50` | `#007bc0` | **Primary blue** — buttons, links, focus |
| `--g-blue-55` | `#0088d4` | |
| `--g-blue-60` | `#0096e8` | |
| `--g-blue-65` | `#36a8ff` | |
| `--g-blue-70` | `#56b0ff` | |
| `--g-blue-75` | `#7ebdff` | |
| `--g-blue-80` | `#9dc9ff` | Secondary button hover fill |
| `--g-blue-85` | `#b8d6ff` | |
| `--g-blue-90` | `#d1e4ff` | **Light fill** — secondary buttons, hover bg |
| `--g-blue-95` | `#e8f1ff` | **Background tint** — subtle highlights |
| `--g-blue-100` | `#ffffff` | White |

---

## Red Scale (`--g-red-*`) — Error/Danger

Error states, destructive actions, and danger indicators.

| Token | Value | Usage |
|-------|-------|-------|
| `--g-red-00` | `#000000` | Black |
| `--g-red-05` | `#1f0000` | Very dark red |
| `--g-red-10` | `#350000` | |
| `--g-red-15` | `#4c0000` | |
| `--g-red-20` | `#680001` | |
| `--g-red-25` | `#780001` | |
| `--g-red-30` | `#920002` | **Pressed state** |
| `--g-red-35` | `#a80003` | |
| `--g-red-40` | `#be0004` | **Hover state** |
| `--g-red-45` | `#d50005` | |
| `--g-red-50` | `#ed0007` | **Primary error red** — error messages, badges |
| `--g-red-55` | `#ff2124` | Brighter red for emphasis |
| `--g-red-60` | `#ff5152` | |
| `--g-red-65` | `#ff7171` | |
| `--g-red-70` | `#ff8787` | Minor error fill pressed |
| `--g-red-75` | `#ff9d9d` | |
| `--g-red-80` | `#ffb2b2` | Minor error fill hover |
| `--g-red-85` | `#ffc6c6` | |
| `--g-red-90` | `#ffd9d9` | **Light error fill** — error backgrounds |
| `--g-red-95` | `#ffecec` | **Error tint** — subtle error backgrounds |
| `--g-red-100` | `#ffffff` | White |

---

## Green Scale (`--g-green-*`) — Success

Success states, completion indicators, and positive feedback.

| Token | Value | Usage |
|-------|-------|-------|
| `--g-green-00` | `#000000` | Black |
| `--g-green-05` | `#001308` | Very dark green |
| `--g-green-10` | `#001e0e` | |
| `--g-green-15` | `#002a14` | |
| `--g-green-20` | `#00381b` | |
| `--g-green-25` | `#004421` | |
| `--g-green-30` | `#00512a` | **Pressed state** |
| `--g-green-35` | `#005f32` | |
| `--g-green-40` | `#006c3a` | **Hover state** |
| `--g-green-45` | `#007a42` | |
| `--g-green-50` | `#00884a` | **Primary success green** — badges, indicators |
| `--g-green-55` | `#219557` | |
| `--g-green-60` | `#37a264` | |
| `--g-green-65` | `#4caf72` | |
| `--g-green-70` | `#5ebd82` | Minor success pressed |
| `--g-green-75` | `#72ca92` | |
| `--g-green-80` | `#86d7a2` | Minor success hover |
| `--g-green-85` | `#9be4b3` | |
| `--g-green-90` | `#b8efc9` | **Light success fill** |
| `--g-green-95` | `#e2f5e7` | **Success tint** |
| `--g-green-100` | `#ffffff` | White |

---

## Yellow Scale (`--g-yellow-*`) — Warning

Warning states, caution indicators, and attention-grabbing elements.

| Token | Value | Usage |
|-------|-------|-------|
| `--g-yellow-00` | `#000000` | Black |
| `--g-yellow-05` | `#171000` | Very dark yellow/brown |
| `--g-yellow-10` | `#231a00` | |
| `--g-yellow-15` | `#2f2400` | |
| `--g-yellow-20` | `#3c2e00` | |
| `--g-yellow-25` | `#493900` | |
| `--g-yellow-30` | `#564400` | |
| `--g-yellow-35` | `#644f00` | |
| `--g-yellow-40` | `#725b00` | |
| `--g-yellow-45` | `#806700` | |
| `--g-yellow-50` | `#8f7300` | Dark yellow for text on light bg |
| `--g-yellow-55` | `#9e7f00` | |
| `--g-yellow-60` | `#ad8c00` | |
| `--g-yellow-65` | `#bd9900` | Minor warning pressed |
| `--g-yellow-70` | `#cda600` | Minor warning hover |
| `--g-yellow-75` | `#deb300` | Warning hover |
| `--g-yellow-80` | `#eec100` | |
| `--g-yellow-85` | `#ffcf00` | **Primary warning yellow** — badges, alerts |
| `--g-yellow-90` | `#ffdf95` | Minor warning fill |
| `--g-yellow-95` | `#ffefd1` | Warning tint |
| `--g-yellow-100` | `#ffffff` | White |

---

## Purple Scale (`--g-purple-*`)

Accent color for categorization, tags, and special indicators.

| Token | Value | Usage |
|-------|-------|-------|
| `--g-purple-00` | `#000000` | Black |
| `--g-purple-05` | `#170117` | Very dark purple |
| `--g-purple-10` | `#250324` | |
| `--g-purple-15` | `#340731` | |
| `--g-purple-20` | `#440b41` | |
| `--g-purple-25` | `#551151` | |
| `--g-purple-30` | `#661561` | Pressed purple |
| `--g-purple-35` | `#791d73` | Hover purple |
| `--g-purple-40` | `#8b2284` | |
| `--g-purple-45` | `#9e2896` | |
| `--g-purple-50` | `#c535bc` | **Primary purple** — accents, tags |
| `--g-purple-55` | `#b12ea9` | |
| `--g-purple-60` | `#c535bc` | |
| `--g-purple-65` | `#d556cd` | |
| `--g-purple-70` | `#e472db` | |
| `--g-purple-75` | `#e48cdd` | Minor purple pressed |
| `--g-purple-80` | `#e8b6e3` | Minor purple hover |
| `--g-purple-85` | `#e5a2df` | |
| `--g-purple-90` | `#f0dcee` | **Light purple fill** |
| `--g-purple-95` | `#f7eef6` | Purple tint |
| `--g-purple-100` | `#ffffff` | White |

---

## Turquoise Scale (`--g-turquoise-*`)

Accent color for categorization, informational states, and special indicators.

| Token | Value | Usage |
|-------|-------|-------|
| `--g-turquoise-00` | `#000000` | Black |
| `--g-turquoise-05` | `#001211` | Very dark turquoise |
| `--g-turquoise-10` | `#021c1b` | |
| `--g-turquoise-15` | `#032725` | |
| `--g-turquoise-20` | `#053634` | |
| `--g-turquoise-25` | `#074241` | |
| `--g-turquoise-30` | `#0a4f4b` | Pressed turquoise |
| `--g-turquoise-35` | `#0d5c57` | |
| `--g-turquoise-40` | `#116864` | Hover turquoise |
| `--g-turquoise-45` | `#147671` | |
| `--g-turquoise-50` | `#18837e` | **Primary turquoise** — accents, tags |
| `--g-turquoise-55` | `#2e908b` | |
| `--g-turquoise-60` | `#419e98` | |
| `--g-turquoise-65` | `#55aba5` | |
| `--g-turquoise-70` | `#66b8b2` | Minor turquoise pressed |
| `--g-turquoise-75` | `#79c5c0` | |
| `--g-turquoise-80` | `#8dd2cd` | Minor turquoise hover |
| `--g-turquoise-85` | `#a1dfdb` | |
| `--g-turquoise-90` | `#b6ede8` | **Light turquoise fill** |
| `--g-turquoise-95` | `#def5f3` | Turquoise tint |
| `--g-turquoise-100` | `#ffffff` | White |

---

## Usage Examples

### In CSS/SCSS
```css
.my-element {
  background-color: var(--g-blue-50);
  color: var(--g-gray-00);
  border: 1px solid var(--g-gray-80);
}

.error-text {
  color: var(--g-red-50);
}

.success-badge {
  background-color: var(--g-green-90);
  color: var(--g-green-50);
}
```

### In React Inline Styles
```tsx
<div style={{ 
  backgroundColor: 'var(--g-blue-90)',
  color: 'var(--g-blue-30)',
  padding: '1rem',
  borderRadius: '4px'
}}>
  Info box with blue tint
</div>
```

### For Custom Status Colors
```tsx
const statusColors = {
  pending: '--g-yellow-85',
  active: '--g-green-50',
  error: '--g-red-50',
  info: '--g-blue-50',
  disabled: '--g-gray-65'
};

<Badge style={{ backgroundColor: `var(${statusColors[status]})` }}>
  {status}
</Badge>
```
