#!/bin/sh
# Builds what a release carries into dist/: the package, its Homebrew Channel files and the SSH installer: npm run release
set -e
npm run -s package
node scripts/release/manifest.mjs
rm -rf dist/sei
mkdir dist/sei
cp scripts/install/install.sh scripts/install/tv.sh LICENSE app/src/assets/wallpapers/CREDITS.md dist/sei.ipk dist/sei/
COPYFILE_DISABLE=1 tar -C dist -czf dist/sei.tar.gz sei
ls -lh dist/sei.ipk dist/sei.tar.gz dist/*.json
