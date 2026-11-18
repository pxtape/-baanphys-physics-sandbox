// Exercise the real production preview at its GitHub Pages project path.
// Run after build. A nonzero exit prevents uploading/deploying the artifact.
import assert from 'node:assert/strict';
import { get } from 'node:http';
import { preview } from 'vite';

const base = '/-baanphys-physics-sandbox/';
const server = await preview({
  preview: { host: '127.0.0.1', port: 4175, strictPort: true, open: false },
});

function request(path) {
  return new Promise((resolve, reject) => {
    const req = get(`http://127.0.0.1:4175${path}`, { headers: { 'Cache-Control': 'no-cache' } }, (response) => {
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve({
        status: response.statusCode,
        type: response.headers['content-type'] ?? '',
        body: chunks.map((chunk) => chunk.toString('utf8')).join(''),
      }));
      response.on('error', reject);
    });
    req.setTimeout(10000, () => req.destroy(new Error('Pages preview request timed out.')));
    req.on('error', reject);
  });
}

try {
  const first = await request(base);
  assert.equal(first.status, 200, 'Project index must load at the Pages base path.');
  assert.match(first.type, /text\/html/u);
  assert.match(first.body, /<title>BaanPhys Physics Sandbox<\/title>/u);
  const assets = [...first.body.matchAll(/(?:src|href)="([^"]+\.(?:js|css))"/gu)].map((match) => match[1]);
  assert.ok(assets.some((path) => path.endsWith('.js')), 'Built JavaScript asset is required.');
  assert.ok(assets.some((path) => path.endsWith('.css')), 'Built stylesheet is required.');
  for (const path of assets) {
    assert.ok(path.startsWith(`${base}assets/`), `Asset must use the project base: ${path}`);
    const asset = await request(path);
    assert.equal(asset.status, 200, `Asset returned an error: ${path}`);
    assert.match(asset.type, path.endsWith('.css') ? /text\/css/u : /javascript/u);
    assert.ok(asset.body.length > 0, `Asset is empty: ${path}`);
  }
  const refresh = await request(base);
  assert.equal(refresh.status, 200, 'Refreshing the project index must work.');
  assert.equal(refresh.body, first.body);
} finally {
  await new Promise((resolve, reject) => server.httpServer.close((error) => error ? reject(error) : resolve()));
}
