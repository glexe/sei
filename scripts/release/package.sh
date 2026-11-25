#!/bin/sh
# Packs dist/sei.ipk: the web build, which is both the setup screen and the home screen it installs, and the service.
set -e
npm run -s build
rm -rf dist/host dist/service dist/*.ipk
mkdir -p dist
cp -R build/app dist/host
mv dist/host/appinfo.json dist/host/home.json
cp tv/host/appinfo.json dist/host/
mkdir dist/service
cp service/*.js service/package.json service/services.json dist/service/
rm dist/service/*.test.js
ares-package --no-minify dist/host dist/service -o dist
mv dist/com.glexe.sei_*.ipk dist/sei.ipk
