---
title: A two-hour spike killed a two-week epic
date: 2026-09-19
tags: scope, codegen, spikes
---

`@cia/react` was on the roadmap for about two weeks: take the React block out
of each recipe, generate a component per recipe, publish a package. It had
stories, acceptance criteria, an effort estimate, the lot.

The epic carried a fail-fast clause, so before building it I built the
generator badly and pointed it at three recipes. That took an afternoon.

Two of the three generated components crashed on first render. `breadcrumb`
expects a `crumbs` array the generated wrapper never passes. `toast` threw a
`ReferenceError` for a symbol the template did not define. The third worked,
which is the result that would have been most dangerous if I had only tried
one.

The more interesting number was the copy ratio. Of the 103 lines in the
biggest output, 88 came verbatim from the recipe and 15 were synthesised —
and those 15 were byte-identical across all three components apart from the
name. It was a fixed wrapper plus a `DO NOT EDIT` header. That is not code
generation, it is `cat` with extra steps, and it is not worth a published
package and the support surface that comes with one.

So the epic is dead. The spike survives at `spike/` as the evidence, and the
epic file keeps its stories verbatim as the plan that was not executed.

The thing I want to remember is that the estimate was never the problem. Two
weeks was probably about right for building it. The question the estimate
could not answer was whether the output would be worth having, and only
running it could answer that.
