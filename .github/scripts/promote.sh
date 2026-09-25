#!/usr/bin/env bash
#
# Move one branch of the release chain onto the next.
#
# Extracted from the workflow so the qa and prod jobs share ONE implementation.
# They have to be separate jobs — a job can declare only one `environment:`,
# and the environment is what gives each stage its own box, its own deployment
# history, and (on prod) its own approval gate. Two jobs with two copies of a
# merge would be two things to keep in step, and the copy that is used less
# often is the one that rots.
#
# Inputs, all via the environment:
#   SRC_REF   branch, tag or SHA to promote FROM
#   DEST      branch to promote INTO
#   DRY_RUN   "true" to report and change nothing
#
# ---------------------------------------------------------------------------
# WHO OWNS WHAT WHEN THE TWO SIDES DISAGREE
# ---------------------------------------------------------------------------
# `public/flags.json` is owned by the DESTINATION. Coming-soon and
# announcement switches are flipped on the deployed branch, not on main, so
# .gitattributes marks it `merge=ours` and the driver is configured below.
#
# `.gitattributes` itself is owned by the SOURCE, and that one cannot be
# expressed in .gitattributes — git reads the DESTINATION's copy to decide
# merge policy, so a rule written on main has no effect until main's copy has
# already won. Chicken and egg. It is handled explicitly below instead.
#
# That is not hypothetical. On 2026-09-25 the first real production promotion
# failed outright: main and prod-css-is-awesome had each added a
# `.gitattributes` independently, saying the same thing in different words, so
# git reported an add/add conflict, wrote conflict markers into the file, then
# tried to parse its own broken output and reported
# `origin/qa is not a valid attribute name: .gitattributes:14`.
#
# Once a promotion carries the source's copy across, both branches match and
# this path goes dormant. It is kept because a branch that has drifted once
# can drift again.
set -euo pipefail

: "${SRC_REF:?SRC_REF is required}"
: "${DEST:?DEST is required}"
DRY_RUN="${DRY_RUN:-false}"

# Files the SOURCE branch owns outright. Keep this list short and justified:
# every entry is a case where a deployed branch is not entitled to its own
# opinion, and silently overwriting anything else would be exactly the kind of
# quiet data loss a promotion must never do.
SOURCE_OWNED=(".gitattributes")

summary() { printf '%s\n' "$*" >>"${GITHUB_STEP_SUMMARY:-/dev/null}"; }

git config user.name  "github-actions[bot]"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
git config merge.ours.driver true

git fetch origin "$SRC_REF" --tags || true
git fetch origin "$DEST"

# Prefer the remote branch shape; fall back to a raw SHA or tag.
if git rev-parse --verify --quiet "origin/$SRC_REF" >/dev/null; then
  SRC="origin/$SRC_REF"
elif git rev-parse --verify --quiet "$SRC_REF" >/dev/null; then
  SRC="$SRC_REF"
else
  echo "::error::cannot resolve '$SRC_REF' to anything in this repository"
  exit 1
fi

summary "## Promoting \`$SRC_REF\` to \`$DEST\`"
summary ""

if git merge-base --is-ancestor "$SRC" "origin/$DEST"; then
  summary "\`$DEST\` already contains everything in \`$SRC_REF\`. Nothing to do."
  echo "$DEST already contains $SRC; nothing to promote."
  exit 0
fi

summary "Commits this promotion carries:"
summary ""
summary '```'
git log --oneline --no-decorate "origin/$DEST..$SRC" >>"${GITHUB_STEP_SUMMARY:-/dev/null}"
summary '```'
summary ""

# NOTE ON DRY RUN: it stops before the PUSH, not before the merge.
#
# This used to exit here, which made it worse than useless: it reported
# success without ever attempting the thing that can fail. On 2026-09-25 a
# dry run of the qa stage passed, and the real production run then failed on
# a merge conflict in .gitattributes — a conflict the dry run was structurally
# incapable of noticing, because the only question it answered was "can I
# resolve two branch names".
#
# A rehearsal that skips the risky step is not a rehearsal. The merge now
# happens locally either way; only the push is withheld, and the branch is
# reset afterwards so the runner is left as it was found.
git checkout -B "$DEST" "origin/$DEST"

if ! git merge --no-edit "$SRC"; then
  # Which paths actually conflicted?
  # stderr is silenced on purpose. When .gitattributes is the conflicted
  # file, git writes conflict markers into it and then warns while parsing
  # its own broken output ("... is not a valid attribute name"). That noise
  # must not reach a list of paths.
  mapfile -t CONFLICTS < <(git diff --name-only --diff-filter=U 2>/dev/null)

  # Anything outside the source-owned list is a real disagreement and must
  # stop the promotion. Resolving it automatically would be guessing with
  # someone's production branch.
  UNEXPECTED=()
  for path in "${CONFLICTS[@]}"; do
    owned=false
    for own in "${SOURCE_OWNED[@]}"; do
      [ "$path" = "$own" ] && owned=true && break
    done
    $owned || UNEXPECTED+=("$path")
  done

  if [ ${#UNEXPECTED[@]} -gt 0 ]; then
    git merge --abort || true
    {
      echo "### Promotion stopped: unresolved conflict"
      echo
      echo "These paths disagree between \`$SRC_REF\` and \`$DEST\`:"
      echo
      for path in "${UNEXPECTED[@]}"; do echo "- \`$path\`"; done
      echo
      echo "Nothing was pushed. Only \`public/flags.json\` (owned by the deployed"
      echo "branch) and \`.gitattributes\` (owned by the source) resolve"
      echo "automatically; everything else is a real difference and needs a human."
    } >>"${GITHUB_STEP_SUMMARY:-/dev/null}"
    echo "::error::conflict outside the source-owned list; nothing pushed"
    exit 1
  fi

  # Only source-owned paths conflicted: take the source's copy.
  for path in "${CONFLICTS[@]}"; do
    echo "Resolving $path from $SRC_REF (source-owned)."
    git checkout --theirs -- "$path" 2>/dev/null || git checkout "$SRC" -- "$path"
    git add -- "$path"
  done

  git commit --no-edit
  summary "Resolved ${#CONFLICTS[@]} source-owned path(s) from \`$SRC_REF\`: ${CONFLICTS[*]}"
  summary ""
fi

if [ "$DRY_RUN" = "true" ]; then
  summary "### Dry run — the merge succeeded and was thrown away"
  summary ""
  summary "Nothing was pushed. The merge was performed locally to prove it is"
  summary "clean, then discarded. Run it again with \`dry_run\` unticked to ship it."
  git reset --hard "origin/$DEST" >/dev/null
  echo "Dry run: merge succeeded, discarded, nothing pushed."
  exit 0
fi

git push origin "$DEST"

summary "Pushed \`$DEST\` at \`$(git rev-parse --short HEAD)\`."
echo "Promoted $SRC_REF -> $DEST."
