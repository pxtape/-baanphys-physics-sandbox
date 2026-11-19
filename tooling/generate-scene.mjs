// Only this checked-in schema is compiled, at development/check time, never input data.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath, URL } from 'node:url';
import process from 'node:process';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import standalone from 'ajv/dist/standalone/index.js';
import { _ } from 'ajv/dist/compile/codegen/index.js';
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
import { compile } from 'json-schema-to-typescript';

const root = new URL('../', import.meta.url);
const schema = JSON.parse(await readFile(new URL('schemas/scene-v1.schema.json', root), 'utf8'));
const banner = '/* Generated from schemas/scene-v1.schema.json. Do not edit; run npm run generate:scene. */\n';
const ucs2length = ucs2Module.default ?? ucs2Module;
// Inline this trusted helper so the browser validator never imports the Ajv compiler.
ucs2length.code = `(${ucs2length.toString()})`;
const ajv = new Ajv2020({ allErrors: true, strict: true, strictTypes: false,
  ownProperties: true, coerceTypes: false, useDefaults: false, removeAdditional: false,
  code: { source: true, esm: true, lines: true, formats: _`fullFormats` } });
addFormats(ajv, { mode: 'full', formats: ['date-time'], keywords: false });
// Bare, hyphenated UUID strings; no urn prefix and no restriction to one version.
ajv.addFormat('uuid', /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i);
const validator = standalone(ajv, ajv.compile(schema));
if (/\brequire\s*\(|\beval\s*\(|\bnew\s+Function\s*\(/u.test(validator)) throw new Error('Generated validator must remain standalone ESM without dynamic code evaluation.');
const ajvLicense = await readFile(new URL('node_modules/ajv/LICENSE', root), 'utf8');
const files = new Map([
  ['src/domain/scene-v1.generated.ts', await compile({ ...schema, title: 'SceneV1' }, 'SceneV1', {
    bannerComment: banner.trim(), ignoreMinAndMaxItems: true, unreachableDefinitions: true,
    style: { singleQuote: true, semi: true, printWidth: 100 },
  })],
  ['src/schema/generated/scene-v1.validator.js', banner + `/* Inlined Unicode helper from Ajv (MIT):\n${ajvLicense}\n*/\nimport { fullFormats } from 'ajv-formats/dist/formats.js';\n` + validator + '\n'],
  ['src/schema/generated/scene-v1.validator.d.ts', banner + `import type { ValidateFunction } from 'ajv';\nimport type { SceneV1 } from '../../domain/scene-v1.generated';\ndeclare const validate: ValidateFunction<SceneV1>;\nexport default validate;\n`],
]);
for (const [filename, content] of files) {
  const url = new URL(filename, root);
  if (process.argv.includes('--check')) {
    if (await readFile(url, 'utf8') !== content) throw new Error(`Stale generated contract: ${filename}. Run npm run generate:scene.`);
  } else {
    await mkdir(fileURLToPath(new URL('.', url)), { recursive: true });
    await writeFile(url, content);
  }
}
