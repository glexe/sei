#!/bin/sh
# Rebuilds app/src/assets/wallpapers from photos named <name>_Author-<First-Last>_unsplash.jpg (macOS): npm run wallpapers -- <dir>
set -eu

SRC="${1:?usage: npm run wallpapers -- <folder with .jpg photos>}"
DST=app/src/assets/wallpapers
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

# Baseline JPEG decodes much faster than progressive on the TV's CPU; sips can't choose, so encode ourselves.
swiftc -O scripts/wallpapers/jpeg.swift -o "$TMP/jpeg"

# Every photo must name its author: that is all CREDITS.md is made from.
for f in "$SRC"/*.jpg; do
  case $(basename "$f") in
    *_Author-*_unsplash.jpg) ;;
    *) echo "no author in the name: $f" >&2; exit 1 ;;
  esac
done

rm -rf "$DST"
mkdir -p "$DST"
cat > "$DST/CREDITS.md" <<'MD'
# Credits

Photos from [Unsplash](https://unsplash.com), under the [Unsplash License](https://unsplash.com/license), cropped and
resized for the TV. `npm run wallpapers` writes this file.

| Photo | Author |
| --- | --- |
MD

# Resizes and center-crops $1 to $2x$3 as lossless PNG in $TMP/out.png.
fit() {
  sips -s format png "$1" --out "$TMP/out.png" >/dev/null
  if [ $((w * $3)) -gt $((h * $2)) ]; then
    sips --resampleHeight "$3" "$TMP/out.png" >/dev/null
  else
    sips --resampleWidth "$2" "$TMP/out.png" >/dev/null
  fi
  sips -c "$3" "$2" "$TMP/out.png" >/dev/null
}

for f in "$SRC"/*.jpg; do
  name=$(basename "$f" _unsplash.jpg)
  author=$(printf '%s' "${name##*_Author-}" | tr '-' ' ')
  slug=$(printf '%s' "${name%_Author-*}" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-//; s/-$//')
  w=$(sips -g pixelWidth "$f" | awk '/pixelWidth/{print $2}')
  h=$(sips -g pixelHeight "$f" | awk '/pixelHeight/{print $2}')

  fit "$f" 1920 1080
  "$TMP/jpeg" "$TMP/out.png" "$DST/$slug.jpg" 0.82

  fit "$f" 600 600
  "$TMP/jpeg" "$TMP/out.png" "$DST/$slug.thumb.jpg" 0.80
  echo "| \`$slug\` | $author |" >> "$DST/CREDITS.md"
  echo "$slug"
done

npx oxfmt "$DST/CREDITS.md" >/dev/null
du -sh "$DST"
