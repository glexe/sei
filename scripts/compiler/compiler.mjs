// Fails when the React Compiler skips a component or hook; the build itself skips them silently: npm run compiler
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { transformSync } from '@babel/core';

const SRC = 'app/src';

function* sources(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* sources(path);
    else if (/\.tsx?$/.test(entry.name) && !entry.name.endsWith('.d.ts')) yield path;
  }
}

const failures = [];
let compiled = 0;
for (const file of sources(SRC)) {
  transformSync(readFileSync(file, 'utf8'), {
    filename: file,
    babelrc: false,
    configFile: false,
    parserOpts: { plugins: ['jsx', 'typescript'] },
    plugins: [
      [
        'babel-plugin-react-compiler',
        {
          target: '18',
          logger: {
            logEvent(_, event) {
              if (event.kind === 'CompileSuccess') compiled++;
              else if (event.kind === 'CompileError' || event.kind === 'PipelineError') {
                const detail = event.detail?.options ?? event.detail ?? {};
                const line = detail.loc?.start?.line ?? event.fnLoc?.start?.line ?? '?';
                failures.push(`${relative(SRC, file)}:${line} ${detail.reason ?? event.kind}`);
              }
            },
          },
        },
      ],
    ],
  });
}

if (failures.length > 0) {
  console.error(`React Compiler skipped ${failures.length} function(s):`);
  for (const failure of failures) console.error(`  ${failure}`);
  process.exit(1);
}
console.log(`React Compiler: all ${compiled} components and hooks compiled`);
