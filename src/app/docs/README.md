# src/app/docs

The Next.js App Router subtree that renders the `/docs/*` documentation site. **Not shipped in the npm package** — this is the docs.css-is-awesome.dev surface, not library code.

## Convention

Every docs route is a folder under `src/app/docs/`. The folder name **is** the URL segment.

| Path                                     | URL                          |
| ---------------------------------------- | ---------------------------- |
| `src/app/docs/page.tsx`                  | `/docs`                      |
| `src/app/docs/install/page.tsx`          | `/docs/install`              |
| `src/app/docs/authoring/themes/page.tsx` | `/docs/authoring/themes`     |

Each page is a `page.tsx` (default-export React component) plus an optional co-located `page.module.scss`. Use semantic HTML (`<h1>`, `<h2 id="...">`, `<p>`, `<ul>`) — the shared `<DocsTOC />` reads `h2[id]` from the rendered article and the chrome (sidebar, TOC, prev/next) is supplied by `layout.tsx`.

## nav.config.ts — the source of truth

`nav.config.ts` is the **only** place the sidebar reads. A new page does not appear in the sidebar until you register it there. The same export drives `prevNext()` at the bottom of every page, so a page that isn't in `docsNav` also has no prev/next links.

```ts
{ title: "Reference", items: [{ label: "Tokens", href: "/docs/tokens" }] }
```

`href` is matched against `usePathname()` — keep it exact, no trailing slash.

## _components/

Underscore-prefixed folders are excluded from Next.js routing. `_components/` holds docs-only UI primitives that aren't general enough to live in `src/components/`:

- `DocsNav` — sidebar, consumes `docsNav`
- `DocsTOC` — right-rail table of contents, scrapes `h2[id]`
- `DocsPrevNext` — footer pager, consumes `prevNext()`

For general-purpose, themeable UI (Button, Card, Example, etc.), import from `@/components/*` — see `src/components/README.md` for the tokens-only rule.

## Add a new docs page

1. `mkdir src/app/docs/<segment>` (nest folders for nested URLs)
2. Create `page.tsx` exporting a default component; give every `<h2>` a stable `id` so the TOC can link to it
3. Add an entry to `nav.config.ts` under the right section — the page is otherwise unreachable from the sidebar
4. (Optional) Co-locate a `page.module.scss` for page-specific styles; everything else should compose tokens/utilities from the library
