# css-is-awesome — docs site

Static HTML + CSS. No build step. No framework.

## Structure

```
docs/
  index.html       landing
  docs.html        documentation
  examples.html    small example pages
  blog.html        blog index
  about.html       the story
  theme.css        <-- swap this file to reskin
  styles.css       base system (reads theme tokens)
  favicon.ico
  src/             SCSS source (for devs who compile)
    _tokens.scss
    _mixins.scss
```

## Run it

Open `index.html` in a browser, or serve the folder with any static server:

```
# Python
python -m http.server 8080 --directory docs

# Node (npx, no install)
npx serve docs
```

## How the theme swap works

Every page loads two stylesheets, in order:

```html
<link rel="stylesheet" href="theme.css">
<link rel="stylesheet" href="styles.css">
```

- `theme.css` declares all CSS custom properties on `:root` (colors, fonts, radii, shadows).
- `styles.css` is the base system — it consumes those tokens. No color literals inside it.

**To reskin:** download a different `theme.css` and replace this one. Reload. Everything changes.
