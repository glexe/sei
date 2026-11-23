#!/bin/sh
# Packs the service into dist/service.ipk, without its tests and type files: npm run package
set -e
rm -rf dist/service dist/*.ipk
mkdir -p dist/service
cp service/*.js service/package.json service/services.json dist/service/
rm dist/service/*.test.js
ares-package tv/host dist/service -o dist
mv dist/*.ipk dist/service.ipk
