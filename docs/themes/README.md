# Themes

Drop-in theme packs for **css-is-awesome**. Each theme is a `theme.css` that re-declares the token contract defined in `docs/theme.css` (the Sketchbook base). To swap themes, replace `docs/theme.css` with any file from here — nothing else changes.

## Available

| Theme       | Mood                                                  |
| ----------- | ----------------------------------------------------- |
| Sketchbook  | Warm washi paper, ink, construction lines (default)   |
| Press       | Editorial newsprint, Playfair serif, press red        |
| Graphite    | Space-gray aluminum dark mode, system blue            |
| Glass       | visionOS glassmorphism, mesh gradient, iOS indigo     |
| Cupertino   | macOS Sonoma window, SF Pro, system blue              |
| Terminal    | VT100 phosphor green on deep black, CRT glow          |

## Contract

Every theme declares **every** slot in the contract, even when unused (e.g. `--blur-md: none;`). That's what makes swapping lossless.

See `docs/theme.css` for the authoritative contract list.

## Icon pack (per theme)

Each theme may ship its own `icons.svg` sprite alongside the `theme.css`. Consumers swap the theme file and get the matching icons — phosphor glyphs with Terminal, thin editorial marks with Press, SF-style strokes with Cupertino, etc.

Usage in HTML:
```html
<svg class="cia-icon"><use href="icons.svg#edit"></use></svg>
```

Icons inherit the current text color via `fill="currentColor"`, so they reskin with the theme automatically. Sizing is font-size–based — use `.cia-icon--sm/md/lg/xl` or just set `font-size` on the parent.

The seed sprite at `docs/icons.svg` is the Sketchbook pack. Theme authors drop a replacement `icons.svg` in their theme folder and the swap is complete.
