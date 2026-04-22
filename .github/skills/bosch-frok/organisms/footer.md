# Footer

Site footer with navigation, links, and copyright.

---

## Import

```tsx
import { Footer, FooterSection, FooterLink } from '@bosch/react-frok';
```

---

## Props

### Footer Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | Footer content |
| `logo` | `LogoProps` | - | Company logo |
| `copyright` | `string` | - | Copyright text |
| `social` | `SocialLink[]` | - | Social media links |
| `className` | `string` | - | Additional CSS classes |

### FooterSection Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | - | Section heading |
| `children` | `ReactNode` | - | Links or content |

### FooterLink Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `href` | `string` | - | Link URL |
| `children` | `ReactNode` | - | Link text |
| `external` | `boolean` | `false` | Opens in new tab |

---

## CSS Classes

| Class | Description |
|-------|-------------|
| `.o-footer` | Base container |
| `.o-footer__content` | Main content area |
| `.o-footer__section` | Link group |
| `.o-footer__section-title` | Section heading |
| `.o-footer__links` | Links list |
| `.o-footer__link` | Individual link |
| `.o-footer__logo` | Logo container |
| `.o-footer__social` | Social links |
| `.o-footer__bottom` | Bottom bar (copyright) |
| `.o-footer__copyright` | Copyright text |

---

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--g-gray-95` | `#eff1f2` | Background |
| `--g-gray-20` | `#2a2f34` | Text color |
| `--g-blue-50` | `#007bc0` | Link color |
| `--g-gray-85` | `#d0d4d8` | Border color |

---

## Usage Examples

### Basic Footer
```tsx
<Footer copyright="© 2024 Company Name. All rights reserved.">
  <FooterSection title="Products">
    <FooterLink href="/products/a">Product A</FooterLink>
    <FooterLink href="/products/b">Product B</FooterLink>
    <FooterLink href="/products/c">Product C</FooterLink>
  </FooterSection>
  
  <FooterSection title="Company">
    <FooterLink href="/about">About Us</FooterLink>
    <FooterLink href="/careers">Careers</FooterLink>
    <FooterLink href="/press">Press</FooterLink>
  </FooterSection>
  
  <FooterSection title="Support">
    <FooterLink href="/help">Help Center</FooterLink>
    <FooterLink href="/contact">Contact Us</FooterLink>
    <FooterLink href="/docs">Documentation</FooterLink>
  </FooterSection>
</Footer>
```

### With Logo
```tsx
<Footer
  logo={{
    src: '/logo.svg',
    alt: 'Company Logo',
    href: '/'
  }}
  copyright="© 2024 Company"
>
  {/* Footer sections */}
</Footer>
```

### With Social Links
```tsx
<Footer
  copyright="© 2024 Company"
  social={[
    { icon: 'linkedin', href: 'https://linkedin.com/company/x' },
    { icon: 'twitter', href: 'https://twitter.com/x' },
    { icon: 'youtube', href: 'https://youtube.com/x' },
    { icon: 'github', href: 'https://github.com/x' }
  ]}
>
  {/* Footer sections */}
</Footer>
```

### Full Footer
```tsx
<Footer
  logo={{ src: '/logo.svg', alt: 'Bosch', href: '/' }}
  copyright="© 2024 Robert Bosch GmbH. All rights reserved."
  social={[
    { icon: 'linkedin', href: 'https://linkedin.com/company/bosch' },
    { icon: 'twitter', href: 'https://twitter.com/bosch' }
  ]}
>
  <FooterSection title="Products">
    <FooterLink href="/automotive">Automotive</FooterLink>
    <FooterLink href="/industrial">Industrial</FooterLink>
    <FooterLink href="/consumer">Consumer Goods</FooterLink>
    <FooterLink href="/energy">Energy & Building</FooterLink>
  </FooterSection>
  
  <FooterSection title="Company">
    <FooterLink href="/about">About Bosch</FooterLink>
    <FooterLink href="/careers">Careers</FooterLink>
    <FooterLink href="/sustainability">Sustainability</FooterLink>
    <FooterLink href="/research">Research & Development</FooterLink>
  </FooterSection>
  
  <FooterSection title="Support">
    <FooterLink href="/contact">Contact</FooterLink>
    <FooterLink href="/faq">FAQ</FooterLink>
    <FooterLink href="/service">Service</FooterLink>
  </FooterSection>
  
  <FooterSection title="Legal">
    <FooterLink href="/privacy">Privacy Policy</FooterLink>
    <FooterLink href="/terms">Terms of Use</FooterLink>
    <FooterLink href="/imprint">Imprint</FooterLink>
    <FooterLink href="/cookies">Cookie Settings</FooterLink>
  </FooterSection>
</Footer>
```

### Minimal Footer
```tsx
<Footer>
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <span>© 2024 Company</span>
    <div style={{ display: 'flex', gap: '1rem' }}>
      <Link href="/privacy">Privacy</Link>
      <Link href="/terms">Terms</Link>
    </div>
  </div>
</Footer>
```

### With Newsletter
```tsx
<Footer copyright="© 2024 Company">
  <FooterSection title="Products">
    {/* Links */}
  </FooterSection>
  
  <FooterSection title="Newsletter">
    <p className="-size-s" style={{ marginBottom: '1rem' }}>
      Subscribe for updates
    </p>
    <form style={{ display: 'flex', gap: '0.5rem' }}>
      <TextField 
        placeholder="Email address" 
        type="email"
        style={{ flex: 1 }}
      />
      <Button mode="primary" type="submit">Subscribe</Button>
    </form>
  </FooterSection>
</Footer>
```

### With Language Selector
```tsx
<Footer
  copyright="© 2024 Company"
  actions={
    <LanguageSelector
      languages={supportedLanguages}
      value={language}
      onChange={setLanguage}
    />
  }
>
  {/* Footer sections */}
</Footer>
```

---

## Layout Pattern

```tsx
// Full page layout
<div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
  <Header />
  <main style={{ flex: 1 }}>
    {/* Page content */}
  </main>
  <Footer>
    {/* Footer content */}
  </Footer>
</div>
```

---

## Accessibility

```tsx
<footer role="contentinfo">
  <Footer
    copyright="© 2024 Company"
    aria-label="Site footer"
  >
    <FooterSection title="Navigation" aria-label="Footer navigation">
      {/* Links */}
    </FooterSection>
  </Footer>
</footer>
```

- Use semantic `<footer>` element
- Links are keyboard navigable
- Social links have accessible names

---

## Do's and Don'ts

**Do:**
- Include essential links (privacy, terms)
- Use consistent layout across pages
- Show copyright information
- Include contact/support links

**Don't:**
- Don't overload with too many links
- Don't hide critical information
- Don't use footer for primary navigation
- Don't make footer taller than viewport

---

## Related Components
- [Header](header.md) — Site header
- [Link](../atoms/link.md) — Navigation links
- [LanguageSelector](../molecules/language-selector.md) — Language switcher
