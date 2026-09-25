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
# Conflict policy: `public/flags.json` is owned by the deployed branches, so
# .gitattributes marks it merge=ours and the driver is configured below — the
# branch being promoted INTO keeps its own flags. Any other conflict fails the
# run loudly, because nothing else is supposed to diverge.
set -euo pipefail

: "${SRC_REF:?SRC_REF is required}"
: "${DEST:?DEST is required}"
DRY_RUN="${DRY_RUN:-false}"

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

if [ "$DRY_RUN" = "true" ]; then
  summary "### Dry run — nothing was pushed"
  summary ""
  summary "Run it again with \`dry_run\` unticked to ship it."
  echo "Dry run: stopping before the merge."
  exit 0
fi

git checkout -B "$DEST" "origin/$DEST"
git merge --no-edit "$SRC"
git push origin "$DEST"

summary "Pushed \`$DEST\` at \`$(git rev-parse --short HEAD)\`."
echo "Promoted $SRC_REF -> $DEST."
