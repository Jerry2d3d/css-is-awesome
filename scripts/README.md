# scripts

Small Node utilities that support the css-is-awesome workflow. No runtime deps.

## theme-validator.js

Checks a `theme.css` against the token contract. Every theme MUST declare every
required custom property so the "swap one file, reskin the site" model stays
lossless.

### Run

```bash
# Validate every theme (public/theme.css + public/themes/*/theme.css)
npm run validate-themes

# Validate a specific file
node scripts/theme-validator.js public/themes/graphite/theme.css
```

### Output

```
✓ public/theme.css passes (78 tokens declared)
x public/themes/<name>/theme.css — 2 missing:
     --text-link
     --border-focus
```

Exit codes: `0` all clean · `1` missing tokens · `2` usage error.

### Contract

The authoritative required-token list lives in `scripts/theme-contract.json`.
It mirrors the `:root { ... }` block in `public/theme.css` (Sketchbook — the
reference theme). When the contract changes, update that JSON file, not the
validator.

### CI

Will be wired into GitHub Actions in Epic 5 so pull requests that introduce
an incomplete theme fail before merge.
