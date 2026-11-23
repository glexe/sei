#!/bin/sh
# Renders the app icon in the sizes webOS uses: npm run icon
set -eu
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
swiftc -O scripts/icon/icon.swift -o "$TMP/icon"
"$TMP/icon" app/public/icon.png 80
"$TMP/icon" app/public/largeIcon.png 130
cp app/public/icon.png tv/host/icon.png
