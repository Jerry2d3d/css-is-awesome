#!/usr/bin/env bash
# bundle-cdn.sh
#
# Local helper that mirrors what .github/workflows/cdn-publish.yml does to
# produce the CDN release bundle. Useful for smoke-testing the archive contents
# without waiting for a real GitHub Release.
#
# Usage:
#   scripts/bundle-cdn.sh              # tag defaults to "local"
#   scripts/bundle-cdn.sh v1.2.3       # pass an explicit tag
#
# Output:
#   ./css-is-awesome-<tag>-cdn-bundle.tar.gz
#   ./css-is-awesome-<tag>-cdn-bundle.zip
#
# Assumes `npm run build:css:all` has been run (this script will run it if the
# dist/ bundles are missing).

set -euo pipefail

TAG="${1:-local}"
STAGE="cdn-bundle"
BASENAME="css-is-awesome-${TAG}-cdn-bundle"

cd "$(dirname "$0")/.."

# Build CSS bundles if they aren't already present.
if [ ! -f dist/css-is-awesome.min.css ]; then
  echo "dist/ bundles missing; running npm run build:css:all"
  npm run build:css:all
fi

rm -rf "$STAGE"
mkdir -p "$STAGE/dist" "$STAGE/public"

cp dist/css-is-awesome.css               "$STAGE/dist/"
cp dist/css-is-awesome.min.css           "$STAGE/dist/"
cp dist/css-is-awesome.core.min.css      "$STAGE/dist/"
cp dist/css-is-awesome.utilities.min.css "$STAGE/dist/"

cp public/theme.css "$STAGE/public/theme.css"
cp -R public/themes "$STAGE/public/themes"

echo "Staged files:"
find "$STAGE" -type f | sort

tar -czf "${BASENAME}.tar.gz" -C "$STAGE" .

if command -v zip >/dev/null 2>&1; then
  ( cd "$STAGE" && zip -r "../${BASENAME}.zip" . >/dev/null )
else
  echo "WARN: zip not on PATH; skipping .zip archive"
fi

rm -rf "$STAGE"

echo "Archives:"
ls -lh "${BASENAME}.tar.gz" "${BASENAME}.zip" 2>/dev/null || ls -lh "${BASENAME}.tar.gz"
