#!/bin/sh
# Packs what install.sh needs into dist/sei.tar.gz: npm run release
set -e
npm run -s build
npm run -s package
rm -rf dist/sei
mkdir -p dist/sei
cp scripts/install/install.sh scripts/install/tv.sh LICENSE app/src/assets/wallpapers/CREDITS.md dist/sei/
cp dist/service.ipk dist/sei/
cp -R build/app dist/sei/app
COPYFILE_DISABLE=1 tar -C dist -czf dist/sei.tar.gz sei
ls -lh dist/sei.tar.gz
