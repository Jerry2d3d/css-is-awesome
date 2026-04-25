# Gemini — Web designer (20yr) — Round 2

## Q1 — Bare-tag approach: real talk
The bare-tag approach is a win for **markdown-driven content, CMS outputs, and "instant-UI" prototypes** where you want immediate polish without class-bloat. It fails when you integrate with **third-party libraries (e.g., Stripe Elements, Google Maps, or headless UI kits like Radix)** that rely on native elements but expect a "clean slate." The biggest bite is in **Form Libraries**: if you globally style `input` or `button`, you’ll spend half your life writing `.my-reset-container button { all: unset; }` to fix the layout of a nested widget that you didn't mean to "beautify."

## Q2 — Top items to keep from the imported doc (ranked)
1. **Fibonacci number convention** — This is the secret sauce for visual rhythm; it creates a mathematical "vibe" that feels intentional and is easy to maintain.
2. **Prefer tag selectors over class names** — This directly supports the bare-tag philosophy and keeps the DOM clean for authors who just want to write HTML.
3. **No same-element nesting** — The most effective way to kill "div-soup" and force developers to think semantically about their document structure.
4. **Vanilla CSS Modules only** — Essential for preventing "style leak" between components while maintaining the performance of native CSS.
5. **Root class matches kebab-case component name** — Provides a clear, predictable scoping boundary that makes debugging stylesheets instant.
6. **Sizing unit priority (rem → em)** — Crucial for accessibility and ensuring the library scales gracefully with user browser settings.
7. **Minimal markup — use pseudo-elements** — Keeps the DOM tree shallow, improving both performance and the developer's ability to read the source.

## My recommendation
**Ship it as a "Base Layer" opt-in.** Provide a `theme-base.css` that handles the bare-tag styles (the Pico way), but keep the React components scoped via CSS Modules. This gives "vanilla" users the instant polish they want while protecting power users from global style-pollution.
