---
title: The import in our README did not work
slug: the-import-in-our-readme-did-not-work
category: engineering
tags: sass, packaging, npm, post-mortem, testing
audience: library authors, sass authors
excerpt: Sass does not read package.json exports. Both documented imports failed on a clean install, and every check we had stayed green.
author: Jerry Hansen
publishDate: 2026-08-18
updatedDate: 2026-08-18
---

We cut 1.0.0 on 2026-08-17. The next day, while checking something unrelated, we
installed the packed tarball into an empty project and typed the first line of
our own README:

```scss
@use 'css-is-awesome' as cia;
```

```
Error: Can't find stylesheet to import.
```

Then the second documented form, the one the whole two-import model is built on:

```scss
@use 'css-is-awesome/api' as cia;
```

```
Error: Can't find stylesheet to import.
```

Both headline imports were broken for anyone who installed the package. They had
probably never worked.

## Sass does not read `exports`

`package.json` had what looked like the right answer:

```json
"exports": {
  "./api": { "sass": "./scss/api.scss" }
}
```

That entry is real, and bundlers that honour Node's export map will use it. Sass
is not one of them. Sass resolves a bare specifier by looking for a **file on
disk** relative to a load path. Given `--load-path=node_modules`, this:

```scss
@use 'css-is-awesome/api';
```

makes Sass look for `node_modules/css-is-awesome/api.scss`, then
`node_modules/css-is-awesome/api/_index.scss`. Our barrel lives at
`scss/api.scss`. Neither candidate exists, so the import fails. The `"sass"`
condition in the export map was never consulted, because nothing in the chain
was reading the export map at all.

The same applies to the bare package name. `@use 'css-is-awesome'` looks for
`node_modules/css-is-awesome/_index.scss`. Ours is at `scss/_index.scss`.

## Why nothing caught it

This is the part worth writing down.

We had a script whose entire job was guarding the `/api` barrel —
`validate-api.mjs`, five assertions, wired into CI. It passed. It still passes.
It compiles the barrel like this:

```scss
@use 'api' as cia;   // with scss/ on the load path
```

From inside the repo, with `scss/` as a load path, `api` resolves fine. The
check was testing the source tree, not the artifact. Every assertion it made was
true and none of them were about what a consumer receives.

The showcase project didn't catch it either, for a different reason: it imports
the deep path.

```scss
@use 'css-is-awesome/scss/api' as cia;   // 110 files, all fine
```

`css-is-awesome/scss/api` is a real path to a real file, so it resolves under
plain load-path resolution. The one consumer we had was using the one form that
worked, so the failure was invisible from every angle we were looking from.

Green CI, a working showcase, and a broken package.

## The fix is two files

Two forwarding shims at the package root, both added to the `files` manifest:

```scss
// api.scss
@forward './scss/api';

// _index.scss
@forward './scss/index';
```

That is the whole fix. They exist so the documented specifiers have a file to
land on. `api.scss` forwards only — it emits nothing, so `css-is-awesome/api`
stays zero-emit. `_index.scss` forwards the kitchen-sink barrel, which does emit,
which is correct for a root import.

Verified by packing, installing into a clean project, and compiling a probe rule
through each form:

| specifier | before | after |
|---|---|---|
| `css-is-awesome` | fails | 24,663 bytes |
| `css-is-awesome/api` | fails | 52 bytes |
| `css-is-awesome/scss/api` | 52 bytes | 52 bytes |
| `css-is-awesome/scss/mixins` | 52 bytes | 52 bytes |

52 bytes is the probe rule and nothing else — the zero-emit contract survives the
shim.

## The check that should have existed

The fix took ten minutes. The interesting work was making sure this class of
break cannot happen again, because the failure mode is specifically *invisible
from inside the repo*.

`validate-package` packs the tarball, installs it into a temp directory, and
compiles every specifier the docs hand out — currently ten of them — asserting
that the `/api` forms stay zero-emit:

```
validate-package — css-is-awesome@1.0.0

  ✓ @use 'css-is-awesome'
  ✓ @use 'css-is-awesome/api' (zero-emit)
  ✓ @use 'css-is-awesome/scss/api' (zero-emit)
  ✓ @use 'css-is-awesome/scss/mixins' (zero-emit)
  ✓ @use 'css-is-awesome/scss/main' (resolves)
  …
```

Then we deleted the two shims and ran it again, to check the test could actually
fail:

```
  ✗ @use 'css-is-awesome' — Error: Can't find stylesheet to import.
  ✗ @use 'css-is-awesome/api' — Error: Can't find stylesheet to import.

package validation FAILED — 2 documented import(s) do not resolve.
```

A guard you have never watched fail is a guard you are trusting on faith.

## What we'd take from this

Testing the source tree is not testing the package. Those are different
artifacts with different resolution rules, and a check that runs with your repo's
load paths configured is answering an easier question than the one your users
ask.

The deeper version: our one consumer was configured in a way that avoided the
bug. That made the showcase useless as an early-warning system for exactly the
thing a showcase is supposed to catch. If every consumer you have is using the
same workaround, you don't have a consumer test — you have a coincidence.

The install instructions on a package's front page are executable claims. Ours
were wrong for a day, in the most-read four lines of the project.
