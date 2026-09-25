---
title: A roadmap that lied in both directions
date: 2026-09-25
tags: roadmap, audit, process
---

I audited every epic in `roadmap/epics/` against the actual source tree,
because I had stopped trusting the status lines. The result was worse than
"a bit stale".

One epic was recorded as not started. It had shipped, in a release, three
days earlier. Another was recorded as never built, naming a file that does
not exist as proof — and the feature it describes ships today under a
different filename, because it arrived as part of a different epic and nobody
went back to close the first one. One table row managed to contradict itself
inside a single row: "not started" in one column and "complete" in the next.

Staleness in one direction is normal and mostly harmless. You under-claim,
someone eventually notices, the file gets updated. Staleness in both
directions at once is different, because it means the document has stopped
being evidence of anything. If "not started" can mean shipped and "never
built" can mean built, then no line in the file carries information, and the
next person to read it has to check the source anyway.

The specific failure mode is worth naming: work delivered under a different
epic than the one that planned it never gets recorded against the plan. Both
of the wrong entries here are that same shape. The feature exists, someone
built it, and the only file that would have told you lives under the epic it
was not built for.

So the status lines that a page can derive are now derived. The `/now` page
reads them out of the epic files at build time, and a status line it cannot
parse fails the build rather than quietly vanishing — which found one epic
file with no status line at all on the first run.

That does not fix wrong lines, only unreadable ones. Nothing automatic can
tell you a sentence is false. But it does mean the page and the files can no
longer disagree, which removes one of the two ways this went wrong.
