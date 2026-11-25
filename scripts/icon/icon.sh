#!/bin/sh
# Renders Sei.icon (Icon Composer) in the sizes webOS and the About screen use, needs Xcode: npm run icon
set -eu
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
# Not xcrun's ictool: that one is actool under another name.
ICTOOL="$(xcode-select -p)/../Applications/Icon Composer.app/Contents/Executables/ictool"
SRGB="/System/Library/ColorSync/Profiles/sRGB Profile.icc"

# ictool writes 16-bit Display P3; the TV gets 8-bit sRGB.
render() {
  "$ICTOOL" scripts/icon/Sei.icon --export-image --output-file "$TMP/icon.png" \
    --platform iOS --rendition Default --width "$2" --height "$2" --scale 1 >/dev/null
  sips -m "$SRGB" "$TMP/icon.png" --out "$1" >/dev/null
}

render app/public/icon.png 80
render app/public/largeIcon.png 130

# About rounds its 560px block less than the icon, so the icon's own corners and rim are cut off.
render app/src/assets/icon.png 624
sips -c 560 560 app/src/assets/icon.png >/dev/null
