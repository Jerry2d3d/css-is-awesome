# The release pipeline — how it works, and how to set one up again

**Five workflows, one job each, run by hand in order.** Each does one thing,
so when something fails you re-run that one rather than the whole chain.

```
feature branch  →  main  →  qa  →  prod-css-is-awesome
  (your work)      (CI)    (look    (public site + npm publish)
                            at it)
```

This file is written to be lifted into another project. The **Setting it up
from scratch** section is the recipe; the **Traps** section is the part worth
reading twice, because every entry cost a real failure here.

---

## How you run it

**Actions → pick the numbered workflow → Run workflow.** In order:

| | workflow | what it does |
| --- | --- | --- |
| 1 | **Release to qa** | merges `main` into `qa`, then stops. Go and test. |
| 2 | **Release to production** | shows what will ship, **asks for your approval**, merges `qa` into the production branch |
| 3 | **Publish to npm** | semantic-release: version, CHANGELOG, tag, npm, GitHub Release |
| 4 | **Mirror the site to GitHub Pages** | builds the docs site from the production branch |
| 5 | **Attach CDN archives to the release** | tar.gz + zip onto the Release, jsDelivr links in the notes |

1 and 2 are the release. 3, 4 and 5 are what a release consists of afterwards.

```bash
gh workflow run "1 · Release to qa"
gh workflow run "2 · Release to production"
gh workflow run "3 · Publish to npm"
```

### Why five files and not one

Because one file kept breaking in ways that were invisible.

A single workflow needs a stage input to know what to do, and every shape of
that was wrong. Required-with-a-no-op-default meant the obvious click did
nothing, successfully. Stages gated by `if:` meant skipped jobs that read like
failures. And you cannot change an input by re-running, so the natural button
on a failed run could never fix it.

Five workflows have no stage to get wrong, no skipped jobs, and a failure in
one is re-run on its own without redoing the promotion.

### There is no automatic chaining, deliberately

Every cross-workflow trigger this repo has ever had failed silently:

| trigger | why it never fired |
| --- | --- |
| `workflow_run` on CI for the prod branch | `GITHUB_TOKEN` pushes do not start workflows. npm sat unpublished for weeks. |
| `workflow_run` on "Publish to npm" | a `workflow_call`'d workflow runs *inside* its caller's run and produces no run to watch. Pages last deployed 2026-09-24. |
| `release: published` | semantic-release creates that Release with `GITHUB_TOKEN`. Runs ever: **zero**. |

Three mechanisms, three silent failures, each looking fine until someone went
looking. Manual steps you can see are worth more than automatic ones you
cannot.

### Optional inputs

- **`ref`** (workflow 1) — stage a branch or SHA other than `main`. Workflow 2
  flags loudly if qa holds anything that is not on `main`.
- **`dry_run`** (1 and 2) — do the merge, push nothing.

## The jobs, and why each one exists

Workflow 2 has two jobs, and the split matters:

```
show   no environment   prints what is about to ship
prod   Production       waits for your approval, then merges
```

`show` has to be a separate job. An environment's reviewer rule blocks a job
**before its first step**, so a check written inside `prod` would run *after*
you approved — making the approval a formality. A job with no environment runs
first, putting the commit list on screen while the prompt is still
unanswered.

### `qa` pins a SHA, and that is the load-bearing part

The qa job publishes the exact commit it produced as a job output, and `prod`
promotes **that SHA** rather than re-reading the branch:

```yaml
outputs:
  sha: ${{ steps.staged.outputs.sha }}
# ...
SRC_REF: ${{ needs.qa.outputs.sha }}
```

Without this, `prod` resolves `qa` *at approval time* — which can be hours
after you looked at it. Anything merged to `main` while you tested gets pulled
in and shipped unseen. You approve one thing and release another.

A SHA cannot drift. Read it back from the **remote**, not local `HEAD`: the
promote script exits early without pushing when the destination already
contains the source, and a dry run resets the local branch. In both cases
local `HEAD` is not what the branch is.

### `verify` has to be its own job

An environment's reviewer rule blocks a job **before its first step**. Any
check written inside `prod` therefore runs *after* the approval — so approving
would mean approving on trust.

A separate job with no environment runs first, which puts the commit list on
the run page while the `Review deployments` prompt is still sitting there
unanswered.

It refuses in two cases:

- **Nothing to ship** — production already contains the staged commit.
- **qa holds commits that are not on `main`** — someone staged a feature
  branch with `ref` to look at it. Looking at something must never leave it
  one click from npm. Override with `allow_unmerged` when shipping it is
  genuinely the point, and merge the same work to `main` or the next ordinary
  release silently reverts it.

It also prints what it is **not** shipping. When `main` is ahead of the staged
commit, those commits are listed explicitly — because the natural assumption
when clicking "release to production" is that you get the latest.

---

## Setting it up from scratch

### 1. Branches

```bash
git switch -c qa main   && git push -u origin qa
git switch -c prod main && git push -u origin prod   # name it whatever you like
git switch main
```

The deployed branch name is arbitrary. Whatever you pick, it must match your
host's production-branch setting (see trap 8).

### 2. Environments

**Settings → Environments → New environment.** Create one per stage. The
staging one needs no rules at all — not needing an approval is the point of a
staging branch. On the production one:

- **Required reviewers** → add yourself. [Only one listed reviewer needs to
  approve](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments),
  and up to six users or teams can be listed.
- **Prevent self-review** → **leave OFF** for a solo project. Turning it on
  stops the person who started the run from approving it, which on a one-person
  repo means nothing can ever ship.
- **Deployment branches** → leave unrestricted unless you have a reason. The
  workflow is dispatched from `main`, so a policy that only admits the
  production branch will refuse the deployment.

Environment protection is **not** branch protection. They are separate systems
with separate settings pages, and only the environment one gates a job.

### 3. The promote script

Keep the merge in one shell script that both stages call. Two jobs with two
copies of a merge are two things to keep in step, and the copy used less often
is the one that rots.

It takes three inputs from the environment — `SRC_REF`, `DEST`, `DRY_RUN` —
and must:

- resolve `SRC_REF` as a branch **or a raw SHA** (the pinning above depends on
  this)
- exit 0 early when the destination already contains the source
- print the commit list to `$GITHUB_STEP_SUMMARY` before doing anything
- **perform the merge even on a dry run**, and withhold only the push

### 4. Ownership of files the deployed branch edits

A feature flag flipped on production must survive the next promotion. Mark it
in `.gitattributes`:

```
public/flags.json merge=ours
```

and configure the driver in the script, because `merge=ours` needs one:

```bash
git config merge.ours.driver true
```

### 5. Concurrency

```yaml
concurrency:
  group: release
  cancel-in-progress: false
```

Never cancel a release midway — a cancelled merge can leave one branch pushed
without its pair.

**Known consequence:** a production job parked on its approval gate still holds
the group, so an un-approved run blocks every later release until someone
approves or cancels it. That is the correct trade, but when a release seems
stuck as "pending" and never starts, look for an older run waiting on *Review
deployments* before looking anywhere else.

---

## Traps

Every one of these cost a real failure. They are ordered by how long each took
to find.

### 1. A `--depth` fetch makes the whole clone shallow

```bash
git fetch origin "$SHA" --depth=1     # ← never do this in a job that counts commits
```

It does not just skip work. Every `rev-list` range in that job then silently
collapses: "21 commits this ships" became **"1 commit"**, with no error and no
warning. It would have understated every release forever and looked fine doing
it.

If the checkout already uses `fetch-depth: 0`, the commit is present and needs
no fetching at all.

### 2. `GITHUB_TOKEN` pushes do not trigger workflows

This is [GitHub's anti-recursion rule](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows),
and it is absolute. A promotion that pushes with the default token will **not**
start CI on the destination branch, and any workflow you wired to
`workflow_run` on that CI will never fire.

Symptom here: the promotion succeeded, the website updated, and npm quietly
stayed where it was — for weeks.

Fix: call the publish workflow directly with `workflow_call` instead of hanging
it off a trigger that cannot fire.

### 3. `permissions:` replaces the default set, it does not add to it

A workflow-level `permissions: contents: write` leaves **every other scope at
none**. A called workflow can only narrow what the caller was granted, so if it
asks for `issues`, `pull-requests` or `id-token`, GitHub rejects the whole run.

Worth knowing: a reusable-workflow reference is validated **when the run
starts**, not when that job would execute. Adding a `publish` job broke every
stage, including the `status` stage that touches nothing.

### 4. `[skip ci]` anywhere in a commit message skips everything

GitHub scans the **entire message**, body included. Explaining the token in
prose is enough to skip every workflow on that push.

Tell: host checks (Vercel, Netlify) present, Actions runs absent entirely.

### 5. A dry run that skips the risky step is not a rehearsal

The first version exited before the merge, so it reported success without ever
attempting the thing that can fail. A qa dry run passed at 15:28; the real
production run failed at 15:36 on a merge conflict the dry run was
structurally incapable of noticing.

Do the merge. Withhold the push. Reset afterwards.

### 6. `.gitattributes` cannot protect itself

Git reads the **destination's** copy to decide merge policy, so a rule written
on `main` has no effect until main's copy has already won. Chicken and egg.

Two branches each adding a `.gitattributes` saying the same thing in different
words is an add/add conflict — and git then writes conflict markers into the
file and fails parsing its own output:

```
origin/qa is not a valid attribute name: .gitattributes:14
```

Handle it explicitly: keep a short list of source-owned paths and resolve those
from the source, abort on anything else.

### 7. Re-run reuses the inputs

A re-run cannot change what a run does. If your workflow needs an input to
decide anything important, the obvious button on the run page silently cannot
help — and nothing goes red, because the run succeeds having done nothing.

The fix here was to stop needing the input at all. If a workflow has one
job, let it do that job.

### 8. The host's production-branch setting is the other half

The approval gate is meaningless if your host is deploying a different branch.
Between 2026-09-04 and 2026-09-24 the host's production branch here was `main`,
so the live site tracked every merge and "releasing" changed nothing at all.

If the site ever moves without this workflow having run, check that setting
before anything else.

### 9. Preview deployments sit behind the host's login

A staging URL that redirects to a provider login page is the protection
working, not a broken build — but it also means nobody you want to test it can
open it. Turn deployment protection off for previews, or issue a bypass link,
or staging is only testable by you.

### 10. A merge-based promotion looks like tampering forever

Promoting `main` into `prod` creates a merge commit **on prod** that main never
sees, so the branch page reads "36 commits ahead of main" and the number only
grows. It looks exactly like someone pushing straight to production.

Two mitigations: report the `--no-merges` count alongside the raw one, and
merge the deployed branch back into `main` once so it becomes an ancestor —
after which promotions fast-forward and the count stays at zero.

---

## Troubleshooting

| symptom | cause |
| --- | --- |
| Run succeeds, nothing shipped, every job grey | A required input defaulted to a no-op stage. Do not make "do nothing" the default. |
| Run queued forever, never starts | An older run is parked on the approval gate holding the concurrency group. |
| "There was a problem approving one of the gates" | Check **prevent self-review** on the environment, and that you are a listed reviewer. |
| CI never ran on the promoted branch | Expected — `GITHUB_TOKEN` pushes do not trigger workflows. Call the workflow directly. |
| Commit counts look impossibly small | Something in the job made the clone shallow. |
| Promotion fails on `.gitattributes` | Add it to the source-owned list. |

---

## Testing it without shipping

```bash
gh workflow run Release -f dry_run=true
```

That exercises the whole chain — staging, the verify gate, the approval prompt,
the production merge — and pushes nothing. `publish` is excluded from dry runs
outright, so npm is never touched.

It is worth doing after any change to the workflow, because the production path
is the one that runs least often and therefore rots first.
