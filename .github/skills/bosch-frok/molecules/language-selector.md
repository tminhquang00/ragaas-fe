# LanguageSelector

Dropdown for language/locale selection.

---

## Import

```tsx
import { LanguageSelector } from '@bosch/react-frok';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `languages` | `Language[]` | - | **Required** — Available languages |
| `value` | `string` | - | Selected language code |
| `onChange` | `(code: string) => void` | - | Selection handler |
| `showFlag` | `boolean` | `true` | Show flag icons |
| `showLabel` | `boolean` | `true` | Show language names |
| `className` | `string` | - | Additional CSS classes |

### Language Type
```typescript
interface Language {
  code: string;      // ISO code (e.g., 'en', 'de')
  label: string;     // Display name (e.g., 'English')
  flag?: string;     // Flag icon/emoji
}
```

---

## CSS Classes

| Class | Description |
|-------|-------------|
| `.m-language-selector` | Base container |
| `.m-language-selector__trigger` | Dropdown trigger |
| `.m-language-selector__flag` | Flag icon |
| `.m-language-selector__label` | Language name |
| `.m-language-selector__dropdown` | Options dropdown |
| `.m-language-selector__option` | Language option |
| `.m-language-selector__option--selected` | Selected option |

---

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--g-gray-100` | `#ffffff` | Background |
| `--g-gray-95` | `#eff1f2` | Option hover |
| `--g-blue-90` | `#d1e4ff` | Selected option |
| `--g-blue-50` | `#007bc0` | Selected accent |

---

## Usage Examples

### Basic Language Selector
```tsx
const [language, setLanguage] = useState('en');

const languages = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'es', label: 'Español', flag: '🇪🇸' }
];

<LanguageSelector
  languages={languages}
  value={language}
  onChange={setLanguage}
/>
```

### Without Flags
```tsx
<LanguageSelector
  languages={languages}
  value={language}
  onChange={setLanguage}
  showFlag={false}
/>
```

### Code Only
```tsx
<LanguageSelector
  languages={languages}
  value={language}
  onChange={setLanguage}
  showLabel={false}
/>
```

### In Header
```tsx
<Header
  logo={{ href: '/' }}
  actions={
    <LanguageSelector
      languages={supportedLanguages}
      value={currentLanguage}
      onChange={handleLanguageChange}
    />
  }
/>
```

### With i18n Integration
```tsx
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  
  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' }
  ];
  
  const handleChange = (code: string) => {
    i18n.changeLanguage(code);
    // Optionally persist to localStorage or cookie
    localStorage.setItem('language', code);
  };
  
  return (
    <LanguageSelector
      languages={languages}
      value={i18n.language}
      onChange={handleChange}
    />
  );
};
```

### Footer Language Selector
```tsx
<Footer>
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <span>© 2024 Company</span>
    <LanguageSelector
      languages={languages}
      value={language}
      onChange={setLanguage}
    />
  </div>
</Footer>
```

### Region Selector Variant
```tsx
const regions = [
  { code: 'us', label: 'United States', flag: '🇺🇸' },
  { code: 'uk', label: 'United Kingdom', flag: '🇬🇧' },
  { code: 'de', label: 'Germany', flag: '🇩🇪' },
  { code: 'jp', label: 'Japan', flag: '🇯🇵' }
];

<LanguageSelector
  languages={regions}
  value={selectedRegion}
  onChange={handleRegionChange}
/>
```

### With Native Names
```tsx
const languages = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' }
];

<LanguageSelector
  languages={languages}
  value={language}
  onChange={setLanguage}
/>
```

---

## Accessibility

```tsx
<LanguageSelector
  languages={languages}
  value={language}
  onChange={setLanguage}
  aria-label="Select language"
/>
```

- Keyboard navigable dropdown
- Selected language announced
- Use native language names for clarity

---

## Do's and Don'ts

**Do:**
- Use native language names (Deutsch not German)
- Show flags for quick recognition
- Persist selection across sessions
- Place in consistent location (header/footer)

**Don't:**
- Don't auto-detect without option to change
- Don't hide the selector
- Don't use abbreviations only
- Don't reload page unnecessarily on change

---

## Related Components
- [Dropdown](../atoms/dropdown.md) — Generic dropdown
- [Header](../organisms/header.md) — App header
- [Footer](../organisms/footer.md) — App footer
