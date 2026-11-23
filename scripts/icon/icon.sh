#!/bin/sh
# Renders the app icon in the sizes webOS and the About screen use: npm run icon
set -eu
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
swiftc -O scripts/icon/icon.swift -o "$TMP/icon"
"$TMP/icon" app/public/icon.png 80
"$TMP/icon" app/public/largeIcon.png 130
"$TMP/icon" app/src/assets/icon.png 560 0
cp app/public/icon.png tv/host/icon.png
