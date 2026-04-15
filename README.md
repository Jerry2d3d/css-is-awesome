# css-is-awesome

A token-driven SCSS design system. Light/dark theming out of the box, semantic color tokens, and a large mixin API for spacing, typography, layout, and component primitives.

## Install

```bash
npm install css-is-awesome
```

Or download and drop the compiled CSS into your project.

## Use

### As compiled CSS

```html
<link rel="stylesheet" href="css-is-awesome/dist/css-is-awesome.css">
```

### As SCSS

```scss
@use "css-is-awesome/scss/mixins" as m;

.my-button {
  @include m.btn-base;
  background: m.color(action-primary-default);
  border-radius: m.radius(lg);
}
```

### Theme switching

```html
<html data-theme="light"> <!-- or "dark" -->
```

## Build

```bash
npm install
npm run build      # dist/css-is-awesome.css
npm run build:min  # dist/css-is-awesome.min.css
npm run watch      # rebuild on change
```

## Structure

```
scss/
  main.scss           Entry point
  _index.scss         Public API barrel
  _system.scss        Primitives (spacing, type, z-index, motion)
  _mixins.scss        Main mixin and function API
  _generator.scss     SCSS maps -> CSS custom properties
  _icons.scss         Icon system
  theme/              Brand, colors (light/dark), shape, shadows, typography
figma-tokens/         Auto-generated from Figma Tokens Studio
```

## License

MIT
