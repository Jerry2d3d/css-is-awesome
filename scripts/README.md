# scripts

Small Node utilities that support the css-is-awesome workflow. No runtime deps.

## theme-validator.js

Checks a `theme.css` against the token contract **and** runs a WCAG 2.2 AA
contrast audit on every theme. Every theme MUST declare every required custom
property so the "swap one file, reskin the site" model stays lossless, and
every audited contrast pair must meet AA so the system stays accessible by
default.

### Run

```bash
# Validate every theme (public/theme.css + public/themes/*/theme.css)
npm run validate-themes

# Validate a specific file
node scripts/theme-validator.js public/themes/graphite-dark/theme.css
```

### Flags

| Flag                  | Effect                                                                                          |
| --------------------- | ----------------------------------------------------------------------------------------------- |
| `--all`               | Validate every `theme.css` under `public/` (CI mode)                                            |
| `--no-a11y`           | Skip the WCAG 2.2 AA contrast audit; contract check only                                        |
| `--allow-a11y-fail`   | Run the audit and report a11y FAILs, but do not exit non-zero on them (downgrade to soft)        |
| `--strict`            | Accepted as a **no-op** for backwards compatibility. A11y FAIL is now the default behaviour     |

### Output

```
✓ public/theme.css passes (78 tokens declared)
x public/themes/<name>/theme.css — 2 missing:
     --text-link
     --border-focus
```

The a11y audit prints a per-theme line with `pass / warn / info / fail`
counts plus a one-liner per non-passing pair. Pairs flagged `decorative`
(currently `--border-default`) are reported as `info` with their actual
contrast ratio but never count as a FAIL — WCAG 2.2 SC 1.4.11 applies only to
graphical objects essential for understanding content.

### Exit codes

| Code | Meaning                                                                                       |
| ---- | --------------------------------------------------------------------------------------------- |
| `0`  | Every file/block declares every required contract token AND all audited pairs meet WCAG 2.2 AA (or `--allow-a11y-fail` was passed) |
| `1`  | One or more files/blocks missing tokens (always fatal), OR an a11y FAIL (default as of v0.7)  |
| `2`  | Usage error (file not found, bad args)                                                        |

### Contract

The authoritative required-token list lives in `scripts/theme-contract.json`.
It mirrors the `:root { ... }` block in `public/theme.css` (Sketchbook — the
reference theme). When the contract changes, update that JSON file, not the
validator.

The audited contrast pairs live in `scripts/theme-a11y.js` (`AUDIT_PAIRS`).
A pair carrying `decorative: true` is reported as `info` rather than `fail`
when it dips below its target ratio.

### CI

Wired into `.github/workflows/ci.yml` via `npm run validate-themes`. A PR
that introduces an incomplete theme **or** an AA contrast regression on any
audited pair fails before merge.
