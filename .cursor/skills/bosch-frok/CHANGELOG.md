# Changelog

All notable changes to the bosch-frok skill are documented here.

---

## [2.1] — 2026-04-18

### Added
- **Complete atoms coverage** — All 37 atoms now documented (was 8)
  - Form Controls: value-modificator, option-bar, search-suggestions, radiobutton, slider, rating
  - Layout: box, tile, selectable-tile, divider, tab-navigation
  - Indicators: page-indicator, progress-indicator, activity-indicator, badge, sticker
  - Plus: text, tooltip, notification, link, chip, accordion, list, table, image
- **Full molecules** — 11 components (was 3)
  - New: popover, breadcrumbs, step-indicator, side-navigation, search-form, lightbox, language-selector, text-image
- **Full organisms** — 6 components (was 1)
  - New: footer, context-menu, login-form, minimal-header, form
- **New category: Basics**
  - layout component for full-page structure
- **Custom additions**
  - blade-box for multi-panel layouts
- **Enhanced documentation**
  - Props table for each component
  - CSS Classes reference
  - CSS Variables per component
  - Real-world Usage Examples
  - Accessibility guidelines
  - Do's and Don'ts sections
  - Related Components cross-references

### Changed
- **Structure** — Reorganized from flat single folder into atomic design hierarchy: `atoms/`, `molecules/`, `organisms/`, `custom/`, `basics/`
- **Index files** — Updated category tables with all components organized by function
- **Documentation depth** — Each component now 150-250 lines with comprehensive coverage

### Removed
- `background.md` — Not in official component list
- `video.md` — Not in official component list

### Stats
- **Total files:** 8 → 70 (8.75x growth)
- **Components:** 8 → 58 (7.25x coverage)
- **Documentation quality:** ~50 lines per component → ~200 lines per component

---

## [2.0] — 2026-03-15

### Added
- Initial V2 skill structure with atomic design organization
- CSS variables documentation per component
- Basic examples and accessibility notes
- 30 total files with atoms, molecules, organisms, custom components

### Changed
- Reorganized from V1 flat structure into `atoms/`, `molecules/`, `organisms/`, `custom/` folders

---

## [1.0] — Legacy

- Original bosch-frok documentation
- 8 atoms only (button, icon, input, badge, notification, toggle, checkbox, activity-indicator)
- Archived to `bosch-frok-v1-archive/` for reference
