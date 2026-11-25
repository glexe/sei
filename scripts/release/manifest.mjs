// Writes the files Homebrew Channel reads: the package's manifest and a one-app repository (dist/*.json).
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const SOURCE = 'https://github.com/glexe/sei';
const DOWNLOADS = process.env.DOWNLOADS ?? `${SOURCE}/releases/latest/download`;
const MANIFEST = 'com.glexe.sei.manifest.json';

const appinfo = JSON.parse(readFileSync('tv/host/appinfo.json', 'utf8'));
const ipk = readFileSync('dist/sei.ipk');

const manifest = {
  id: appinfo.id,
  version: appinfo.version,
  type: appinfo.type,
  title: appinfo.title,
  appDescription: appinfo.appDescription,
  iconUri: `https://raw.githubusercontent.com/glexe/sei/main/app/public/largeIcon.png`,
  sourceUrl: SOURCE,
  rootRequired: true,
  ipkUrl: `${DOWNLOADS}/sei.ipk`,
  ipkHash: { sha256: createHash('sha256').update(ipk).digest('hex') },
  ipkSize: ipk.length,
};

const repository = {
  packages: [
    {
      id: manifest.id,
      title: manifest.title,
      iconUri: manifest.iconUri,
      shortDescription: manifest.appDescription,
      manifestUrl: `${DOWNLOADS}/${MANIFEST}`,
      manifest,
    },
  ],
};

const save = (file, value) => writeFileSync(`dist/${file}`, JSON.stringify(value, null, 2) + '\n');
save(MANIFEST, manifest);
save('apps.json', repository);
