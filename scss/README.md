# SCSS Design System

A flexible, themeable styling system for Boilerplate 2.0 projects.

## Quick Start

```bash
# Install from scss-install folder
chmod +x install-scss.sh
./install-scss.sh ~/boiler-project-ai
```

## File Structure

```
src/styles/
├── _theme.scss          ← THE ACTIVE THEME (gets copied during disconnect)
├── _icons.scss          ← SVG + FA icon mixins
├── _mixins.scss         ← Core utilities
├── _primitives.scss     ← Global constants (spacing, breakpoints, z-index)
├── _tokens.scss         ← CSS variable generator
├── _index.scss          ← Barrel file
├── main.scss            ← Entry point (import this once)
├── themes/              ← Available themes to choose from
│   ├── _default.scss    ← Professional blue + coral (zeroheight + Trueform inspired)
│   ├── _grinning-gremlin.scss
│   ├── _minimal.scss
│   └── _portfolio.scss
└── examples/
    └── _usage.scss      ← Usage examples
```

---

## Recent Changes (2026-01-28)

### New Background Token: `background-navbar`

We've introduced a new design principle separating navbar backgrounds from page backgrounds:

- **`background-navbar`**: Dedicated navbar/header background color
- **`background-default`**: Main page background (remains unchanged)
- **`background-subtle`**: Alternate page sections

#### Why This Matters

Previously, navbars and pages shared the same background token, making it impossible to:
- Have a distinct navbar appearance
- Create visual hierarchy between navigation and content
- Support designs where navbar needs different treatment

#### Usage

```scss
.navbar {
  background: m.color(background-navbar);  // Dedicated navbar bg
}

.page {
  background: m.color(background-default); // Main page bg
}

.hero-section {
  background: m.color(background-subtle);  // Alternate section
}
```

#### Default Values

**Light Mode:**
- `background-navbar: #FAFAFA` (subtle off-white, distinct from white page)
- `background-default: #FFFFFF` (pure white page)
- `background-subtle: #F8F6F0` (warm cream sections)

**Dark Mode:**
- `background-navbar: #1a1a1a` (lighter than page for contrast)
- `background-default: #0a0a0a` (deep black page)
- `background-subtle: #151515` (near-black sections)

---

## Default Theme Redesign

The `_default.scss` theme has been completely redesigned with inspiration from professional design systems:

### Design Inspiration

**Light Mode** (Trueform + zeroheight):
- Clean, professional blue primary (#384fff)
- Warm coral/orange accent (#ff6039)
- Warm cream backgrounds (#F8F6F0)
- High contrast text (#0f0f0f)
- WCAG AA compliant throughout

**Dark Mode** (Tive):
- Deep, professional blacks (#0a0a0a)
- High contrast white text (#FFFFFF)
- Bright cyan links (#09f)
- Muted blue-gray accents (#768194)
- Professional depth with subtle grays

### Color Philosophy

1. **Professional First**: Business-appropriate colors
2. **Accessible**: All text/background combinations meet WCAG AA
3. **Warm & Inviting**: Subtle cream tones in light mode
4. **High Contrast**: Easy to read, reduced eye strain
5. **Distinct Layers**: Clear visual hierarchy with background tokens

---

## Theme Token Generation System

### How Tokens Are Generated

The `_tokens.scss` file automatically converts theme maps into CSS custom properties:

```scss
// In theme file (_theme.scss or themes/_default.scss)
$theme-brand: (
  primary: #384fff,
  secondary: #ff6039,
);

// Becomes in CSS
:root {
  --brand-primary: #384fff;
  --brand-secondary: #ff6039;
}
```

### Generation Process

1. **Light Mode Base** (`generate-light`):
   - Applied to `:root` (default)
   - Applied to `[data-theme="light"]`
   - Includes: brand colors, light semantic colors, fonts, spacing, shadows

2. **Dark Mode Overrides** (`generate-dark`):
   - Applied to `[data-theme="dark"]`
   - Applied to `:root:not([data-theme="light"])` when `prefers-color-scheme: dark`
   - Includes: dark semantic colors, dark shadows

3. **Smart Cascading**:
   - Brand colors, fonts, spacing are defined once (light mode)
   - Only color/shadow differences redefined in dark mode
   - Reduces CSS output size significantly

### Overriding System Dark Mode Preference

By default, the system respects `prefers-color-scheme: dark`. To force light mode:

```html
<!-- Force light mode regardless of system preference -->
<html data-theme="light">
```

```javascript
// JavaScript toggle
document.documentElement.setAttribute('data-theme', 'light');
document.documentElement.setAttribute('data-theme', 'dark');
document.documentElement.removeAttribute('data-theme'); // Use system preference
```

### Theme Switching Logic

```scss
// From _tokens.scss

// 1. Default: Light mode
:root {
  @include generate-light;
}

// 2. Explicit light mode (overrides everything)
[data-theme="light"] {
  @include generate-light;
}

// 3. Explicit dark mode
[data-theme="dark"] {
  @include generate-dark;
}

// 4. System preference (only if no explicit theme set)
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    @include generate-dark;
  }
}
```

**Priority Order** (highest to lowest):
1. `data-theme="light"` - Always light
2. `data-theme="dark"` - Always dark
3. `prefers-color-scheme: dark` - System preference (if no data-theme set)
4. `:root` default - Light mode fallback

---

## Themes

### Available Themes

| Theme | Description | Primary Color | Light Mode Inspiration | Dark Mode Inspiration |
|-------|-------------|---------------|----------------------|---------------------|
| **Default** | Professional, accessible | Blue (#384fff) | Trueform + zeroheight | Tive |
| **Grinning Gremlin** | Playful, colorful | Indigo (#6366f1) | - | - |
| **Minimal** | Sharp, stripped-down | Black (#000000) | - | - |
| **Portfolio** | Professional, elegant | Dark slate (#0f172a) | - | - |

### Switching Themes

```bash
# Copy desired theme to active
cp src/styles/themes/_grinning-gremlin.scss src/styles/_theme.scss
```

### Creating a New Theme

1. Copy any existing theme: `cp themes/_default.scss themes/_my-theme.scss`
2. Edit colors, fonts, radius in the new file
3. **IMPORTANT**: Include `background-navbar` in both light and dark maps
4. Apply it: `cp themes/_my-theme.scss _theme.scss`

#### Required Tokens for Custom Themes

All themes must include these background tokens:

```scss
$theme-light: (
  background-default: #FFFFFF,   // Main page background
  background-subtle:  #F5F5F5,   // Alternate sections
  background-navbar:  #FAFAFA,   // Navbar background (NEW!)
  // ... other tokens
);

$theme-dark: (
  background-default: #0a0a0a,   // Main page background
  background-subtle:  #151515,   // Alternate sections
  background-navbar:  #1a1a1a,   // Navbar background (NEW!)
  // ... other tokens
);
```

---

## Import Pattern

```scss
// Recommended: Short aliases
@use 'mixins' as m;
@use 'icons' as i;
@use 'system' as s;
@use 'theme' as t;

.button {
  @include m.btn-base;
  background: m.color(brand-primary);
  @include i.svg-text(arrow-right, $position: after);
}
```

---

## Core Mixins

### Colors
```scss
m.color(surface-default)    // var(--surface-default, #fff)
m.brand(primary)            // var(--brand-primary, #...)
m.color-raw(text-primary)   // #111827 (no CSS var)
```

### Spacing
```scss
m.space(4)                  // var(--space-4, 1rem)
@include m.inset(4)         // padding all sides
@include m.inset-x(4)       // horizontal padding
@include m.inset-y(3)       // vertical padding
@include m.squish(2, 6)     // asymmetric (y, x)
```

### Layout
```scss
@include m.stack(4)         // flex column + gap
@include m.inline(2)        // flex row + gap
@include m.flex-center      // center both axes
@include m.flex-between     // space-between
```

### Typography
```scss
@include m.font(bold, lg, tight)
@include m.font(semibold, 1.5rem, 1.4)
```

### Borders
```scss
@include m.border(1px, solid, border-default)
@include m.border(2px, solid, brand-primary, bottom)
```

### Breakpoints
```scss
@include m.mobile-only { }  // < 768px
@include m.tablet { }       // 768px+
@include m.desktop { }      // 1024px+
@include m.bp(xl) { }       // 1280px+
```

### Component Bases
```scss
@include m.btn-base($py, $px, $r, $font-weight)
@include m.card-base($p, $r, $shadow, $bg)
@include m.input-base($py, $px, $r, $border-width, $bg, $border-color)
@include m.badge-base($py, $px, $r, $font-size)
@include m.modal-base($p, $r, $shadow, $max-width)
@include m.tooltip-base($py, $px, $r, $bg, $color)
```

---

## Icon Systems

### SVG Icons (Folder-Based)

Just drop SVG files into `/assets/icons/` - filename = icon name.

```scss
@use 'icons' as i;

@include i.svg(arrow);              // Basic icon
@include i.svg(search, 20px);       // Custom size
@include i.svg-text(download);      // Icon + text
@include i.svg-bg(logo, 120px);     // Multi-color SVG
```

### Font Awesome Icons

```scss
@use 'icons' as i;

// Inside ::before or ::after
.btn::before {
  @include i.fa(check);
  @include i.fa(star, solid, 24px);
  @include i.fa(github, brands);
}

// Standalone
@include i.fa-icon(user);
@include i.fa-text(save);
@include i.fa-spin(spinner);
```

---

## Theme File Contents

What goes IN the theme file (`_theme.scss`):

- ✅ Brand colors (primary, secondary, accent)
- ✅ Semantic colors (surfaces, text, borders)
- ✅ Light/dark mode variants
- ✅ Font families
- ✅ Border radius scale
- ✅ Shadows
- ✅ Component tokens
- ✅ Icon paths and maps

What stays OUTSIDE (in `_primitives.scss`):

- ❌ Spacing scale
- ❌ Font sizes
- ❌ Breakpoints
- ❌ Z-index layers

---

## Disconnect Workflow

**Before `/disconnect-project`:**
- Theme in boilerplate, can be updated via npm

**After `/disconnect-project`:**
- All styles copied to project
- `_theme.scss` is YOURS forever
- No more updates from boilerplate
- Fully standalone

---

## CSS Variables Generated

The system generates these CSS variables:

```css
:root {
  /* Brand */
  --brand-primary, --brand-secondary, --brand-accent

  /* Backgrounds (NEW STRUCTURE) */
  --background-default   /* Main page background */
  --background-subtle    /* Alternate sections */
  --background-navbar    /* Navbar/header background (NEW!) */

  /* Surfaces */
  --surface-default, --surface-subtle, --surface-muted, --surface-emphasis

  /* Text */
  --text-primary, --text-secondary, --text-muted, --text-inverse, --text-link

  /* Borders */
  --border-default, --border-subtle, --border-emphasis, --border-focus

  /* Status */
  --success-default, --warning-default, --error-default, --info-default

  /* Spacing */
  --space-0 through --space-24

  /* Shadows */
  --shadow-sm, --shadow-md, --shadow-lg, --shadow-xl, --shadow-2xl

  /* Radius */
  --radius-sm, --radius-md, --radius-lg, --radius-xl, --radius-full

  /* Fonts */
  --font-primary, --font-secondary, --font-mono

  /* Z-index */
  --z-dropdown, --z-modal, --z-toast, etc.
}
```

### Theme Switching Methods

Dark mode can be applied via:
1. `[data-theme="dark"]` - Explicit dark mode (JavaScript control)
2. `prefers-color-scheme: dark` - System preference (auto-detects)

Light mode can be forced via:
1. `[data-theme="light"]` - Overrides system preference

> **Note:** For component-scoped theming, use the `generate-scoped` mixin under your own selector rather than relying on `.theme-*` classes.

### Background vs Surface Tokens

**Backgrounds** = Page-level:
- `background-default` - Main page/body background
- `background-navbar` - Navigation/header background
- `background-subtle` - Alternate page sections

**Surfaces** = Component-level:
- `surface-default` - Cards, modals, panels
- `surface-subtle` - Secondary cards, sidebars
- `surface-muted` - Disabled states, placeholders
- `surface-emphasis` - Highlighted sections

---

## File Sizes

| File | Lines | Size |
|------|-------|------|
| `_theme.scss` | ~315 | Brand config |
| `_icons.scss` | ~212 | Icon systems |
| `_mixins.scss` | ~610 | Core utilities |
| `_primitives.scss` | ~144 | Global constants |
| `_tokens.scss` | ~94 | CSS generator |
| **Total Source** | ~1,400 | |
| **Compiled CSS** | ~250 | Output |

---

## Questions?

See `examples/_usage.scss` for comprehensive usage examples.
