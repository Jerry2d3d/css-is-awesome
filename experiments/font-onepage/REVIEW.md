# Font onepage — consolidated review

Six proposals for an "add a font for one page" SCSS API. Original problem in `README.md` — consumer has a one-off page that needs a font NOT in the theme. They want one-line ergonomics without touching `public/theme.css`.

---

## Comparison at a glance

| # | Author | API style | Calls per page | Idempotent | `@error` | Self-hosted | Notable |
|---|---|---|---|---|---|---|---|
| 1 | Claude webdesign | `font-face($family, $fallback)` — load+apply in one | 1 | Yes (list) | No | Sister `font-face-src` | Call site reads like designer intent |
| 2 | Claude frontend | `font-face-google($family)` + existing `font(.., $family)` | 2 | Yes (list) | No | `font-face-local` | Per-route CSS module = network scoping |
| 3 | Claude dev | `font-load($name, $url)` + `font-family($name)` | 2 | Yes (map) | **Yes — strict** | Separate `font-face` mixin | URL-mismatch detection on re-register |
| 4 | Gemini webdesign | `google-font($family, $alias)` aliases to theme token | 1 | Yes (list) | No | Manual `@font-face` | **Aliases to theme token** — page-scoped `--font-display` override |
| 5 | Gemini frontend | `load-external-font` + existing `font()` | 2 | Yes (map) | No | `load-local-font` | Same as #2 with different naming |
| 6 | Gemini dev | Polymorphic `font($family, $url, $size)` — folds everything into existing `font()` | 1 | Yes (map) | **Yes** | Same mixin (URL heuristic) | One entry point — extends existing `font()` |

---

## Key disagreements

### 1. One-call vs two-call

**One-call** (`@include font-face('Pacifico')` does load + apply):

- Pros: one line at the call site; reads like designer intent.
- Cons: load happens inside a selector. If you use the font on 5 elements, the `@import` registers once (registry), but the apply emits 5 times (correct). If you forget to use it, the `@import` was for nothing.

**Two-call** (`@include font-load(...)` once at top + `@include font-family(...)` per selector):

- Pros: clean separation of side-effect (load) from declaration (apply). Easier to reason about.
- Cons: two lines for the trivial case. Need to remember to load before apply.

### 2. Where the `@import` lives

Most agents hoist via `@at-root` to the top of the compiled stylesheet. **Claude frontend (#2)** puts the import inside a per-route CSS Module, so Next 15's bundler scopes the font download to that route — `/about` doesn't pay for the font that only `/special-landing` uses. This is genuinely better network behavior, falls out of framework defaults, no custom infra needed.

### 3. Strict vs lenient on typos

**Claude dev (#3)** and **Gemini dev (#6)** add `@error` guards. A typo on the apply step fails the build with the list of loaded fonts. The others silently fall through to the fallback — page ships, looks subtly wrong, nobody notices for weeks.

### 4. Theme token aliasing

**Only Gemini webdesign (#4)** proposes aliasing a one-off font to a theme token: `@include google-font('Pacifico', $alias: 'display')` writes `--font-display: 'Pacifico'` in the local scope. Designer can then keep using `font-family(display)` everywhere, but on this page "display" is Pacifico. Genuinely clever — it keeps the existing token vocabulary intact.

### 5. Self-hosted: same mixin or sister?

Two camps:

- **Sister mixin** (Claude #1, Claude #2, Claude #3, Gemini #5): `font-face` (Google) + `font-face-src` / `font-face-local` (file). Single-responsibility, but two names to learn.
- **Same mixin auto-detecting** (Gemini #6): URL contains `"css"` → use `@import`; otherwise → `@font-face`. Heuristic. Fragile.

The sister-mixin camp is right.

### 6. Polymorphic `font()` — extend the existing mixin?

**Gemini dev (#6)** folds everything into the existing `font()` mixin. Smart symmetry: `@include font(bold, 4)` and `@include font('Pacifico', $url: ...)` use the same entry point. **Risk**: bloats the most-called mixin in the system to serve a one-off case (same argument Claude dev made against folding into `btn-base` for the buttonold exercise).

---

## Per-proposal full text

### #1 — Claude webdesign

**Consumer:**
```scss
.special-landing { @include font-face('Pacifico', cursive); }
```

**Implementation (~70 lines):** `font-face($family, $fallback, $weights, $italic)` does both register and apply. Uses module-level `$_loaded-fonts` list for idempotency. Hoists `@import` via `@at-root`. Sister `font-face-src` for self-hosted. Defaults to weights `300;400;500;600;700` so designers never touch axis syntax.

### #2 — Claude frontend

**Consumer:**
```scss
// src/app/special-landing/page.module.scss
@include m.font-face-google('Pacifico', $weights: (400));
.headline { @include m.font(reg, 7, $family: ('Pacifico', cursive)); }
```

**Implementation (~50 lines):** Two mixins — `font-face-google` (load) and `font-face-local` (self-hosted). Apply step reuses existing `font($type, $size, $family)`. Key insight: putting the `@import` in a per-route CSS Module means Next.js scopes the font to that route. `/about` never sees Pacifico.

### #3 — Claude dev

**Consumer:**
```scss
@include font-load('Pacifico', 'https://fonts.googleapis.com/css2?family=Pacifico&display=swap');
.special-landing { @include font-family('Pacifico'); }
```

**Implementation (~50 lines):** Strict registry (Sass map). `@error` on apply if not loaded. `@error` on re-register with conflicting URL (typo detection). Existing `font()` mixin patched to validate `$family` against the registry. Self-hosted is a sibling `font-face` mixin sharing the same registry.

### #4 — Gemini webdesign

**Consumer:**
```scss
@include m.google-font('Pacifico', $alias: 'display');
h1 { @include m.font(reg, 8, $family: font-family(display)); }
```

**Implementation (~40 lines):** `google-font($family, $alias, $weights)`. `$alias` writes `--font-#{$alias}: 'Pacifico'` in local scope — page-scoped theme-token override. Designer can then keep using the existing token vocabulary; on this page, "display" means Pacifico.

### #5 — Gemini frontend

**Consumer:**
```scss
// page.module.scss
@include m.load-external-font('Bungee', (400));
.specialHeadline { @include m.font(regular, 7, $family: 'Bungee'); }
```

**Implementation (~50 lines):** Same two-mixin shape as #2 (`load-external-font` + `load-local-font`). Same per-route scoping argument. Different naming.

### #6 — Gemini dev

**Consumer:**
```scss
.hero-title { @include m.font('Pacifico', $url: 'https://...', $size: 8); }
// or
@include m.font-load('Pacifico', 'https://...');
.subtitle { @include m.font('Pacifico', $size: 4); }
```

**Implementation (~80 lines):** Folds load and apply into the existing `font()` mixin. Polymorphic — first arg can be a weight/style key (`bold`) OR a font name. URL heuristic detects Google CSS vs raw font file. `@error` on unknown name without `$url`.

---

## Manager (Claude) read

Three viable shapes, depending on what you weight:

### Pick A — designer ergonomics first (#1 + #4)

One-line API at the call site. Optionally aliases to a theme token for token-vocabulary continuity. **Most ergonomic.** Pros: shortest possible call site. Cons: load is implicit in the apply call; no `@error` guard.

### Pick B — developer safety first (#3)

Two-line API but strict. `@error` on typos. URL-mismatch detection. Composes into the existing `font()` mixin via registry validation. **Safest.** Pros: typos fail at compile time. Cons: two lines instead of one.

### Pick C — framework integration first (#2)

Two-line API + the discipline of putting the call inside a per-route CSS Module. Best network behavior — font only downloads on the page that uses it. **Best for performance.** Pros: route-scoped delivery is a free win. Cons: requires the consumer to know to put it in a route module (less obvious).

### Synthesis worth considering

The strongest combined approach:

```scss
// 1. Load + (optional) theme-token alias — picks up #1, #4, plus @error from #3.
@include font-load('Pacifico', 'https://fonts.googleapis.com/css2?family=Pacifico&display=swap', $alias: display);

// 2. Apply via the EXISTING font() mixin — no new apply primitive.
.headline { @include font(bold, 7, $family: 'Pacifico'); }
```

That's:
- **One mixin** to learn (`font-load`).
- **One line** to load + (optionally) alias.
- The **existing `font()`** handles apply — no new vocabulary.
- `@error` guards typos (from #3).
- `$alias` keeps the theme-token mental model (from #4).
- Idempotent map registry (from all of them).
- Sister `font-face` for self-hosted (from #1, #2, #3).

If the consumer drops the call into a per-route CSS Module (the Next 15 advice from #2), they get free network scoping. If not, the font lives in the global stylesheet — still functional, just not optimized.

### My recommendation

**Pick the synthesis above.** It's the smallest combined footprint that captures every agent's strongest insight without any of the tradeoffs being load-bearing. ~60 lines, two mixins (`font-load` + sister `font-face` for self-hosted), `@error` guard, optional `$alias` for theme-token override, composes with existing `font()` for apply.

If you want me to mint that into `scss/_mixins.scss` (or a new `scss/_fonts.scss`), say go and I'll ship it. Or pick one of the six proposals as-is.
