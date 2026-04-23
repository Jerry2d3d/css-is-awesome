# Contributing to css-is-awesome

Thanks for the interest. This project is a small, mixin-first SCSS design system with a one-file theme swap and a Next.js docs site that dogfoods the library. It is pre-1.0 and moves fast. See [README.md](./README.md) for what it is today and [ROADMAP.md](./ROADMAP.md) for what ships next. Epics and user stories live in [roadmap/epics/](./roadmap/epics/README.md).

This guide is the single entry point for contributors. It covers setup, workflow, component and mixin authoring, PRs, and where to find the other contribution-adjacent docs.

## Ways to contribute

| Contribution   | Where to start                                                      |
| -------------- | ------------------------------------------------------------------- |
| Bug report     | Open a GitHub issue using the Bug template (`.github/ISSUE_TEMPLATE/`) |
| Feature idea   | Open a GitHub issue using the Feature template and link a roadmap epic |
| Theme          | Read [CONTRIBUTING-THEMES.md](./CONTRIBUTING-THEMES.md) end-to-end first |
| Docs fix       | Edit the page under `src/app/` and open a PR                         |
| New mixin      | Edit the right file in `scss/components/` — see below                |
| New component  | Follow the Button pattern in `src/components/Button/` — see below    |
| Question       | GitHub Discussions (if enabled) or an issue using the Question template |

If you are not sure which bucket your change falls into, open an issue and ask before writing code. A 30-second question saves a 3-hour rewrite.

## Local setup

Requires Node 20+ and npm.

```bash
git clone https://github.com/Jerry2d3d/css-is-awesome.git
cd css-is-awesome
npm install
npm run dev
```

The docs site runs at <http://localhost:5173>. Edits to `scss/` or `src/` hot-reload.

### Scripts

Every script below is defined in [`package.json`](./package.json).

| Script                         | Purpose                                                      |
| ------------------------------ | ------------------------------------------------------------ |
| `npm run dev`                  | Next.js docs site on port 5173 (hot reload)                  |
| `npm run build`                | Static-export the docs site to `out/`                        |
| `npm run start`                | Serve a built site on port 5173                              |
| `npm run lint`                 | ESLint on the Next.js app (`src/`)                           |
| `npm run lint:fix`             | ESLint with auto-fix                                         |
| `npm run lint:scss`            | Stylelint on every `.scss` file under `scss/`                |
| `npm run lint:scss:fix`        | Stylelint with auto-fix                                      |
| `npm run validate-themes`      | Run `scripts/theme-validator.js` against every shipped theme |
| `npm run build:css`            | Compile `scss/main.scss` to `dist/css-is-awesome.css`        |
| `npm run build:css:core`       | Tokens + resets only → `dist/css-is-awesome.core.css`        |
| `npm run build:css:utilities`  | Utilities only → `dist/css-is-awesome.utilities.css`         |
| `npm run build:css:min`        | Minified versions of all three bundles                       |
| `npm run build:css:all`        | Run every `build:css:*` script in order                      |
| `npm run watch:css`            | Watch `scss/main.scss` and rebuild on save                   |

## Project layout

| Path                     | What lives here                                                   |
| ------------------------ | ----------------------------------------------------------------- |
| `scss/`                  | The design-system library — tokens, mixins, utilities, components |
| `scss/components/`       | One file per component category (buttons, forms, navigation, …)   |
| `dist/`                  | Compiled CSS bundles — generated, do not edit by hand             |
| `public/`                | Static assets served by Next.js — `theme.css`, `themes/`, `icons/` |
| `public/icons/`          | Shared icon SVGs (see `public/icons/README.md`)                   |
| `src/app/`               | Next.js 15 App Router routes for the docs site                    |
| `src/components/`        | React components used by the docs site (folder per component)     |
| `figma-tokens/`          | Figma Tokens JSON export, kept in sync with the SCSS tokens       |
| `roadmap/epics/`         | Epic + user-story backlog (work-item view of the roadmap)         |
| `scripts/`               | Tooling — theme validator, build helpers                          |
| `.github/workflows/`     | CI — runs lint, validate-themes, and build on every PR            |

## Development workflow

### Branch naming

| Prefix     | Use for                                     |
| ---------- | ------------------------------------------- |
| `feat/*`   | New user-facing feature or mixin            |
| `fix/*`    | Bug fix                                     |
| `docs/*`   | Docs site or repo markdown change           |
| `theme/*`  | New or updated theme file                   |
| `chore/*`  | Tooling, CI, deps, refactors with no user-facing effect |

### Commits

- Conventional Commits — `type(scope): subject`. Examples: `feat(buttons): add btn-ghost variant`, `fix(theme): quote color-name interpolation`, `docs(readme): clarify CDN usage`.
- One commit per logical change. Prefer a rebased, readable history over a noisy merge log.
- Subject ≤ 72 chars, imperative mood, no trailing period.
- Reference the epic when relevant: `Epic 3.2: Button forwardRef + className`.

### Before you push

Run these locally. CI runs the same set.

```bash
npm run lint
npm run lint:scss
npm run validate-themes
npm run build
```

If any of the four fail, fix them first. Do not push a branch that is red locally.

## Adding a React component

The canonical example is `src/components/Button/`. Every new component follows the same folder shape.

```
src/components/Example/
  Example.tsx          # the component
  Example.module.scss  # co-located styles, composes library mixins
  index.ts             # barrel: `export { default } from './Example';`
```

Requirements:

| Requirement         | Detail                                                                 |
| ------------------- | ---------------------------------------------------------------------- |
| TypeScript          | Typed props, no `any`, strict prop unions where appropriate            |
| `forwardRef`        | Forward the DOM ref for focus / measurement by callers                 |
| `className` passthrough | Accept `className`, merge with internal class (see `Button.tsx`)   |
| Spread extra props  | Forward HTML attributes so callers can add `id`, `aria-*`, handlers    |
| CSS Modules         | `ComponentName.module.scss`, kebab or camelCase class names            |
| Library mixins      | Use `@use 'mixins' as m;` and `@use 'components/<group>' as ...;`      |
| No new tokens       | Reskin through the existing theme contract — do not add raw hex values |
| Accessibility       | Keyboard-operable, visible focus, respects `prefers-reduced-motion`    |

Link the relevant user story in [roadmap/epics/03-react-components.md](./roadmap/epics/03-react-components.md) in your PR body.

## Adding a library mixin

The library lives in `scss/`. Component mixins are grouped by category in `scss/components/`.

| Category            | File                          |
| ------------------- | ----------------------------- |
| Buttons             | `scss/components/_buttons.scss`    |
| Forms + inputs      | `scss/components/_forms.scss`      |
| Navigation + tabs   | `scss/components/_navigation.scss` |
| Feedback (alerts, toasts, badges) | `scss/components/_feedback.scss` |
| Overlays (modal, tooltip, dropdown) | `scss/components/_overlay.scss` |
| Data (table, list, avatar)        | `scss/components/_data.scss` |

Rules:

- Edit the file that already owns that category. Do not split into a new file unless the category itself is new.
- Match the existing signature: every parameter has a theme-sourced default (`$py: 1`, `$r: md`, `$font-weight: medium`).
- Document inline with a short comment block — what the mixin does, what each param means, a one-line usage example.
- Read tokens through `var(--name, #{fallback})` so custom properties can override without recompiling.
- If you add a mixin, wire it into `scss/components/_index.scss` so consumers can `@use 'components' as c;`.

## Adding a theme

Read [CONTRIBUTING-THEMES.md](./CONTRIBUTING-THEMES.md) first. A theme is a single CSS file of custom properties on `:root`; no SCSS, no JS, no component rules. Copy `public/theme.css`, replace values, register the theme in `src/components/ThemePicker/ThemePicker.tsx`, run `npm run validate-themes`, open a PR with screenshots. Every slot in the [token contract](./CONTRACT.md) is required.

## Adding an icon

See [`public/icons/README.md`](./public/icons/README.md) for the authoritative guide. Short version: drop an SVG into `public/icons/`, reference it via `@include m.svg(<name>);`. No registry update needed. Per-theme packs live in `public/themes/<theme>/icons/`.

## Pull requests

### What the PR template asks for

| Field          | Detail                                                                 |
| -------------- | ---------------------------------------------------------------------- |
| Title          | Conventional-Commits style — becomes the squash-merge commit subject   |
| Summary        | 1–3 sentences on what changed and why                                  |
| Linked epic    | `roadmap/epics/0X-*.md` reference, user story ID if applicable         |
| Screenshots    | For any visual change — before + after at minimum                      |
| Test plan      | Checklist of how you verified it                                       |
| Breaking?      | Flag yes/no. Breaking changes need a migration note in the PR body     |

### What CI runs

Every PR triggers `.github/workflows/ci.yml`. All four must pass.

| Check             | Command                      |
| ----------------- | ---------------------------- |
| ESLint            | `npm run lint`               |
| Stylelint         | `npm run lint:scss`          |
| Theme validator   | `npm run validate-themes`    |
| Library + docs build | `npm run build:css:all` then `npm run build` |

### Review + merge

- At least one maintainer review. Trivial docs fixes can self-merge after CI passes if you are a maintainer.
- Merge strategy is squash — the PR title becomes the commit subject, so write it in Conventional-Commits form.
- No force-push to `main`. Ever.
- We prefer stacked, small PRs over one giant one.

## Issues

Use the templates in `.github/ISSUE_TEMPLATE/`. Pick the one that fits:

| Template       | Use for                                   |
| -------------- | ----------------------------------------- |
| Bug            | Something is broken                        |
| Feature        | You want something that does not exist    |
| Theme proposal | New theme idea, before you write the file |
| Question       | You need help using the library           |

Include:

- What you expected vs what happened
- Reproduction steps or a minimal code sample
- Versions — `node -v`, `npm -v`, this repo's commit SHA
- Browser + OS if rendering is involved

Triage target: new issues get a label and first response within a week. Active development happens in short bursts, so do not read silence as rejection — ping the issue after seven days.

## Code style

ESLint and Stylelint do most of the work. Run `npm run lint:fix` and `npm run lint:scss:fix` before you push. The notable conventions:

| Where            | Convention                                                          |
| ---------------- | ------------------------------------------------------------------- |
| Utility classes  | Always prefixed `cia-` (e.g. `cia-flex`, `cia-p-md`)                |
| Component CSS Modules | Local class names are camelCase (`.primary`, not `.btn-primary`) |
| Global library classes | Published BEM where it ships as global CSS (`btn btn--primary`) |
| Tokens           | Snake-kebab custom properties (`--paper-raised`, `--ink-soft`)       |
| Mixin params     | Leading `$`, short names with theme-sourced defaults                 |
| Typescript       | No `any`, exhaustive prop unions, named exports from each component |
| React            | Function components, `forwardRef`, no class components              |

Do not add linting exceptions to silence a warning — fix the warning.

## Accessibility

Every component the library ships must:

- Be fully keyboard-operable (tab, enter, escape, arrow keys where appropriate).
- Show a visible focus ring — the library exposes `m.focus-ring` for this.
- Respect `prefers-reduced-motion` — honored globally in `scss/_animations.scss`, do not bypass it.
- Forward `ref` so callers can move focus.
- Accept and merge `className` so callers can extend without forking.
- Use semantic HTML first — `<button>` for buttons, `<a href>` for links.
- Pass axe-core smoke checks (target: Epic 5, Quality + Delivery).

If a pattern cannot be made accessible, do not ship it.

## Releases + versioning

See [./VERSIONING.md](./VERSIONING.md) for the SemVer policy, release cadence, and changelog rules. The short version: pre-1.0 right now, every release cuts a GitHub tag + entry in [CHANGELOG.md](./CHANGELOG.md).

## Code of Conduct

By contributing you agree to the [./CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md). TL;DR: be kind, be specific, assume good faith, keep the bar on the work.

## Security

Do not file security issues in public. Follow [./SECURITY.md](./SECURITY.md) for private reporting.

## Questions?

Try GitHub Discussions if it is enabled on the repo. Otherwise open an issue using the Question template — we read every one. If your question is "is it okay if I…", the answer is almost always yes, with a PR to review.

Thanks for being here. Ship something small and good.
