// Emits a scoped package.json into the compiled Electron output dir so Node
// treats the CommonJS-compiled files as CommonJS, despite the root package.json
// declaring "type": "module" (required by Vite/ESM for the renderer).
import { mkdirSync, writeFileSync } from 'node:fs';

const outDir = 'dist-electron';
mkdirSync(outDir, { recursive: true });
writeFileSync(`${outDir}/package.json`, JSON.stringify({ type: 'commonjs' }) + '\n');
console.log(`Wrote ${outDir}/package.json ({ "type": "commonjs" })`);
