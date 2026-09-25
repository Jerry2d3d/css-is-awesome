---
title: What the AI got wrong, and what I built to catch it
slug: what-the-ai-got-wrong
category: ai
tags: ai, verification, ci, process, code-review
audience: developers using AI assistants, library maintainers
excerpt: Four times AI-assisted work on this design system produced something confidently wrong, how each one was caught, and the checks that now exist because of them. Not a productivity post.
author: Jerry Hansen
publishDate: 2026-09-25
updatedDate: 2026-09-25
---

I build this design system with an AI assistant. That is not the interesting
part. Eighty-four percent of developers report using AI tools, and only about
three percent say they highly trust what comes out. The usage number stopped
being a story a while ago.

What is worth writing down is the gap between those two numbers, and what
closing it actually costs. This post is four times the tooling produced
something confidently wrong on this project, how each was caught, and what
exists in the repository now because of it. Every claim links to the thing
that proves it.

None of these are hallucinated APIs. Those are easy: the compiler catches
them, or the first test run does. The interesting failures all had the same
shape. The work looked right, passed the checks that existed, and was wrong
in a way that only a check nobody had written yet could see.

## 1. A validator that passed while auditing nothing

Release 1.12.0 added a required token to the theme contract without the major
version bump the project's own versioning policy demands, in writing. A
consumer upgraded and their theme validation started failing. That was my
bug and the policy was right there.

The part worth the post is why nothing caught it.

There is a `validate-themes` check that runs on every push and had been green
throughout. It validates the twenty-four themes that ship with the library.
All twenty-four declared the new token, because the same change that required
it also added it to every one of them. The check passed, and it would have
passed no matter how many required tokens were added, because the only themes
it ever sees are the ones edited in the same commit.

The check was not weak. It was answering a different question than everyone
believed it was answering. It proves the shipped themes are self-consistent.
It says nothing whatsoever about a theme written by someone else, which is the
only population a contract exists to protect.

AI wrote that check. I approved it. Both of us read "validate themes" and
stopped reading.

**What exists now:** `scripts/check-contract-growth.mjs`, which diffs the
contract against the last release tag and fails when the required list grows
without a major bump. It was proven against a deliberately broken contract
before being trusted, because a check you have never seen fail is a check you
have not tested.

## 2. A false all-clear

A consumer reported that the design-tokens converter mangled their file. I
fixed it, wrote a test, watched it pass, and told them it was handled. The
message I sent said the fix had been tested against their exact layout with
zero unmapped tokens.

That was not true, and I did not know it was not true.

The fixture I had written put the non-colour groups outside the light and
dark blocks. Their real file put them inside. That one arrangement was the
only one where the bug did not reproduce, and it was the arrangement I
happened to invent. The test was green. The claim was confident. The bug was
still there.

This is the failure mode I now watch for hardest, because confidence is
exactly what AI assistance is good at manufacturing. A fabricated test fixture
is a guess about reality wearing the costume of evidence, and once it passes,
everyone downstream treats it as proof.

**What exists now:** the test uses the shape the consumer actually reported,
and asserts that both call forms agree token for token rather than merely
that neither throws. The rule I took from it is narrower and more useful than
"be careful": when a fixture stands in for someone else's real input, the
fixture has to come from them, not from me.

## 3. An epic that died to its own spike

Not every one of these is a failure. This one is the process working.

A React codegen package sat on the roadmap for two weeks with stories,
acceptance criteria and an estimate. Before building it, I built the generator
badly and pointed it at three recipes. An afternoon.

Two of the three generated components crashed on first render. And of the
hundred-odd lines in the largest output, eighty-eight came verbatim from the
recipe and fifteen were synthesised — with those fifteen byte-identical
across all three outputs apart from the component name. A fixed wrapper and a
"do not edit" header. That is `cat` with extra steps, not a pipeline worth a
published package.

The estimate was probably fine. Two weeks was realistic for building it. The
estimate simply could not answer whether the output was worth having, and
only running it could. AI is very willing to help you build the thing you
described. It will not volunteer that the thing is not worth building.

**What exists now:** the spike survives at `spike/` as the evidence, and the
epic keeps its stories verbatim as the plan that was not executed. The
fail-fast clause that killed it was written into the epic before any code was.

## 4. A roadmap that lied in both directions

This week I audited every epic file against the actual source tree, because I
had stopped trusting the status lines.

One epic was recorded as not started. It had shipped in a release three days
earlier. Another was recorded as never built, citing a missing file as proof —
and the feature it describes ships today under a different filename, because
it arrived as part of a different epic and nobody closed the first one. One
table row contradicted itself inside a single row: "not started" in one
column, "complete" in the next.

Staleness in one direction is ordinary. You under-claim, someone notices, the
file gets fixed. Staleness in both directions at once is different, because
the document has stopped being evidence. If "not started" can mean shipped
and "never built" can mean built, no line in the file carries information.

This one matters specifically for AI-assisted work, because those files are
what an assistant reads to decide what to do next. A wrong status line does
not produce a wrong answer to a question you asked. It produces confident work
on the wrong thing, and the confidence is inherited from your own repository.

**What exists now:** a `/now` page generated from the epic files at build
time, and a check that fails the build on a status line the collector cannot
parse. It found an epic file with no status line at all on its first run.

That does not fix wrong lines, only unreadable ones. Nothing automatic can
tell you a sentence is false. But it does mean the page and the files can no
longer disagree, which removes one of the two ways this went wrong.

## The pattern

Four incidents, one shape. In every case the work passed every check that
existed. In every case the missing check was not more coverage of the same
kind — it was a check of a different kind, aimed at the assumption underneath
the work rather than at the work itself.

- A theme validator that validates only the themes we wrote.
- A test fixture invented rather than reported.
- An estimate that prices building and not worth-building.
- A status file trusted because it is ours.

What AI changed is throughput, and throughput is exactly what turns each of
these from an annoyance into a pattern. More work arriving per day means more
assumptions per day, each one plausible, each one arriving with a reasonable
explanation attached. The bottleneck stopped being how fast things get
written. It became how fast I can tell whether a thing is true.

So the question I now ask of every check in this repository is not "does it
pass" but "what would have to be true for it to fail". Several had no good
answer. That question has been worth more than any prompt I have written.

If you want to see what came out of it, the checks are all in
`.github/workflows/ci.yml` and `scripts/`, and the current state of the
project is at [/now](/now), generated rather than typed.
