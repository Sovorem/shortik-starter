#!/usr/bin/env bash
# Sample media for the Shortik course: two images, two clips (one long, one vertical) and a PDF.
set -euo pipefail

BASE="https://assets.sovorem.am/samples/shortik"
FILES=(
  ovo-image-horizontal.png
  ovo-image-vertical.png
  ovo-video-horizontal.mp4
  ovo-video-vertical.mp4
  shortik-hamaynqi-kanonner.pdf
)

mkdir -p samples
for f in "${FILES[@]}"; do
  echo "→ samples/$f"
  curl -sSfL -o "samples/$f" "$BASE/$f"
done
echo "OK: $(ls samples | wc -l) sample file(s) in ./samples"
