# Icon

Bosch icon component with 3000+ icons available.

---

## Import

```tsx
import { Icon } from '@bosch/react-frok';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `iconName` | `string` | - | **Required** — Icon identifier (without prefix) |
| `isUiIcon` | `boolean` | `false` | Use UI icon set instead of standard |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Icon size |
| `className` | `string` | - | Additional CSS classes |
| `aria-label` | `string` | - | Accessible label for standalone icons |
| `aria-hidden` | `boolean` | - | Hide from screen readers (decorative icons) |

---

## Usage

```tsx
// Standard icon
<Icon iconName="settings" />

// UI icon (simplified icons for UI elements)
<Icon iconName="close" isUiIcon />

// With accessible label (for standalone icons)
<Icon iconName="warning" aria-label="Warning" />

// Decorative icon (inside labeled element)
<Button mode="primary" icon="add">Add Item</Button>
```

---

## CSS Classes

| Class | Description |
|-------|-------------|
| `.a-icon` | Base icon styles |
| `.boschicon-bosch-ic-{name}` | Standard icon class |
| `.boschicon-bosch-ic-ui-{name}` | UI icon class |

---

## CSS Variables for Customization

| Variable | Default | Description |
|----------|---------|-------------|
| `font-size` | Inherited | Controls icon size |
| `color` | Inherited | Icon color (inherits from parent) |

### Size Values
| Size Prop | Font Size |
|-----------|-----------|
| `small` | 1rem (16px) |
| `medium` | 1.5rem (24px) |
| `large` | 2rem (32px) |

---

## Curated Icon Reference (~200 Icons)

> **Note**: The full library has 3000+ icons. Find more at `node_modules/@bosch/frontend.kit-npm/dist/bosch_icon.woff2`

### Navigation & Actions

| Icon Name | Description |
|-----------|-------------|
| `arrow-left` | Left arrow |
| `arrow-right` | Right arrow |
| `arrow-up` | Up arrow |
| `arrow-down` | Down arrow |
| `arrow-left-frame` | Left arrow in frame |
| `arrow-right-frame` | Right arrow in frame |
| `chevron-left` | Left chevron |
| `chevron-right` | Right chevron |
| `chevron-up` | Up chevron |
| `chevron-down` | Down chevron |
| `back` | Back navigation |
| `forward` | Forward navigation |
| `home` | Home/dashboard |
| `menu` | Hamburger menu |
| `close` | Close/dismiss |
| `add` | Add/create |
| `remove` | Remove/delete |
| `edit` | Edit/modify |
| `delete` | Delete/trash |
| `search` | Search/find |
| `filter` | Filter/funnel |
| `sort` | Sort/order |
| `refresh` | Refresh/reload |
| `undo` | Undo action |
| `redo` | Redo action |
| `save` | Save |
| `download` | Download |
| `upload` | Upload |
| `export` | Export |
| `import` | Import |
| `share` | Share |
| `copy` | Copy |
| `paste` | Paste |
| `cut` | Cut |
| `drag-handle` | Drag reorder |
| `expand` | Expand/fullscreen |
| `collapse` | Collapse/minimize |
| `maximize` | Maximize window |
| `minimize` | Minimize window |
| `external-link` | Open in new tab |
| `link` | Hyperlink |

### Status & Feedback

| Icon Name | Description |
|-----------|-------------|
| `checkmark` | Success/check |
| `checkmark-frame` | Checkmark in frame |
| `error` | Error/problem |
| `warning` | Warning/caution |
| `info` | Information |
| `info-i` | Info with "i" |
| `question` | Help/question |
| `alert` | Alert/notification |
| `thumbs-up` | Positive feedback |
| `thumbs-down` | Negative feedback |
| `star` | Favorite/rating |
| `star-filled` | Filled star |
| `heart` | Like/love |
| `heart-filled` | Filled heart |
| `flag` | Flag/mark |
| `bookmark` | Bookmark |
| `bookmark-filled` | Filled bookmark |
| `lightbulb` | Idea/tip |
| `lightning` | Quick/fast |
| `clock` | Time/clock |
| `calendar` | Date/calendar |
| `hourglass` | Waiting/pending |

### User & Account

| Icon Name | Description |
|-----------|-------------|
| `user` | Single user |
| `user-frame` | User in frame |
| `user-add` | Add user |
| `user-group` | Multiple users |
| `user-settings` | User preferences |
| `login` | Log in |
| `logout` | Log out |
| `lock` | Locked/secure |
| `lock-open` | Unlocked |
| `key` | Access key |
| `shield` | Security |
| `shield-checkmark` | Verified secure |
| `fingerprint` | Biometric |
| `badge` | ID badge |

### Communication

| Icon Name | Description |
|-----------|-------------|
| `chat` | Chat/message |
| `chat-add` | New message |
| `mail` | Email |
| `mail-open` | Open email |
| `phone` | Phone call |
| `video` | Video call |
| `microphone` | Audio input |
| `microphone-off` | Muted mic |
| `speaker` | Audio output |
| `speaker-off` | Muted speaker |
| `bell` | Notifications |
| `bell-off` | Notifications off |
| `send` | Send message |
| `inbox` | Inbox |
| `outbox` | Outbox |

### Files & Documents

| Icon Name | Description |
|-----------|-------------|
| `document` | Generic document |
| `document-add` | New document |
| `document-checkmark` | Approved document |
| `document-edit` | Edit document |
| `documents` | Multiple documents |
| `folder` | Folder |
| `folder-open` | Open folder |
| `folder-add` | New folder |
| `file` | Generic file |
| `file-pdf` | PDF file |
| `file-image` | Image file |
| `file-video` | Video file |
| `file-audio` | Audio file |
| `file-zip` | Archive file |
| `attachment` | Attachment/clip |
| `print` | Print |
| `scan` | Scan |

### Media & Display

| Icon Name | Description |
|-----------|-------------|
| `image` | Image/photo |
| `image-add` | Add image |
| `gallery` | Image gallery |
| `camera` | Camera/capture |
| `video-camera` | Video camera |
| `play` | Play media |
| `pause` | Pause media |
| `stop` | Stop media |
| `record` | Record |
| `fast-forward` | Fast forward |
| `rewind` | Rewind |
| `volume` | Volume |
| `volume-mute` | Volume muted |
| `fullscreen` | Enter fullscreen |
| `fullscreen-exit` | Exit fullscreen |
| `zoom-in` | Zoom in |
| `zoom-out` | Zoom out |

### Data & Charts

| Icon Name | Description |
|-----------|-------------|
| `chart-bar` | Bar chart |
| `chart-line` | Line chart |
| `chart-pie` | Pie chart |
| `chart-area` | Area chart |
| `analytics` | Analytics |
| `dashboard` | Dashboard |
| `table` | Data table |
| `grid` | Grid view |
| `list` | List view |
| `statistics` | Statistics |
| `trend-up` | Increasing trend |
| `trend-down` | Decreasing trend |

### Settings & Tools

| Icon Name | Description |
|-----------|-------------|
| `settings` | Settings/gear |
| `settings-connected` | Connected settings |
| `wrench` | Tools/configure |
| `sliders` | Adjustments |
| `tune` | Fine-tune |
| `palette` | Theme/colors |
| `eye` | Show/view |
| `eye-off` | Hide |
| `accessibility` | Accessibility |
| `language` | Language |
| `globe` | Global/world |
| `location` | Location/map |
| `map` | Map |
| `compass` | Compass |
| `ruler` | Measure |
| `calculator` | Calculator |

### E-commerce & Business

| Icon Name | Description |
|-----------|-------------|
| `cart` | Shopping cart |
| `cart-add` | Add to cart |
| `bag` | Shopping bag |
| `store` | Store/shop |
| `credit-card` | Payment card |
| `money` | Money/currency |
| `invoice` | Invoice |
| `receipt` | Receipt |
| `barcode` | Barcode |
| `qr-code` | QR code |
| `gift` | Gift |
| `discount` | Discount/sale |
| `shipping` | Delivery |
| `package` | Package |

### Industry & IoT

| Icon Name | Description |
|-----------|-------------|
| `connected-services` | Connected services |
| `connected-devices` | IoT devices |
| `sensor` | Sensor |
| `connector` | Data connector |
| `car` | Vehicle |
| `car-connected` | Connected car |
| `industry` | Industrial |
| `factory` | Manufacturing |
| `robot` | Automation |
| `cloud` | Cloud |
| `cloud-upload` | Cloud upload |
| `cloud-download` | Cloud download |
| `server` | Server |
| `database` | Database |
| `network` | Network |
| `wifi` | Wi-Fi |
| `bluetooth` | Bluetooth |
| `battery` | Battery |
| `battery-charging` | Charging |

### UI Icons (use `isUiIcon={true}`)

| Icon Name | Description |
|-----------|-------------|
| `close` | Close button |
| `checkmark` | Checkbox check |
| `minus` | Minus/collapse |
| `plus` | Plus/expand |
| `arrow-down` | Dropdown arrow |
| `arrow-up` | Collapse arrow |
| `arrow-left` | Back arrow |
| `arrow-right` | Forward arrow |
| `search` | Search icon |
| `clear` | Clear input |
| `edit` | Edit action |
| `delete` | Delete action |
| `more` | More options |
| `drag` | Drag handle |

---

## Usage Examples

### Standalone Icon with Label
```tsx
<Icon iconName="warning" aria-label="Warning: Check your input" />
```

### Decorative Icon (no label needed)
```tsx
<Button mode="primary">
  <Icon iconName="add" aria-hidden />
  Add Item
</Button>
```

### Colored Icon
```tsx
<Icon 
  iconName="error" 
  style={{ color: 'var(--g-red-50)' }} 
  aria-label="Error"
/>
```

### Sized Icon
```tsx
<Icon iconName="settings" size="large" />
```

### Icon Button Pattern
```tsx
<Button mode="tertiary" icon="close" iconOnly aria-label="Close dialog" />
```

---

## Do's and Don'ts

**Do:**
- Provide `aria-label` for standalone informative icons
- Use `aria-hidden` for decorative icons next to text
- Use semantic icon names that match the action
- Use UI icons (`isUiIcon`) for interface controls

**Don't:**
- Don't add `boschicon-bosch-ic-` prefix to `iconName` — the component adds it
- Don't use icons alone without accessible labels
- Don't override icon fonts with custom fonts
- Don't use `<i>` tags directly — use the `<Icon>` component

---

## Finding More Icons

For the complete icon list (3000+):
1. Open `node_modules/@bosch/frontend.kit-npm/dist/styles/fonts/`
2. Check the generated icon SCSS in `boschicon/`
3. Or use browser DevTools to inspect available `.boschicon-bosch-ic-*` classes
