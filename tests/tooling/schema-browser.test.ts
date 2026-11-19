import { expect, it } from 'vitest';
import { build } from 'vite';
import { readFileSync } from 'node:fs';
import example from '../../examples/falling-ball.scene.json';

it('bundles the full validation boundary for browsers without the Ajv compiler or node imports', async () => {
    const output = await build({ configFile: false, logLevel: 'silent', build: { write: false, minify: false, lib: { entry: new URL('../../src/schema/index.ts', import.meta.url).pathname, formats: ['es'], fileName: 'scene-validation' } } });
    const results = Array.isArray(output) ? output : [output];
    const chunks = results.flatMap(result => 'output' in result ? result.output : []);
    const code = chunks.filter(chunk => chunk.type === 'chunk').map(chunk => chunk.code).join('\n');
    expect(code.length).toBeGreaterThan(0); expect(code).not.toMatch(/new Function|\beval\s*\(|from ["']node:/u);
    const source = readFileSync(new URL('../../src/schema/generated/scene-v1.validator.js', import.meta.url), 'utf8');
    expect(source).not.toMatch(/\brequire\s*\(|\bnew Function|\beval\s*\(/u);
    const module = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`) as typeof import('../../src/schema/index');
    expect(module.parseSceneJson(JSON.stringify(example)).ok).toBe(true);
    const invalid = module.parseSceneJson('{"x":1,"x":2}');
    expect(invalid.ok).toBe(false);
    expect(invalid.diagnostics.some(d => d.code === 'JSON_DUPLICATE_KEY')).toBe(true);
  });
