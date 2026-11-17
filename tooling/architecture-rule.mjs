import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const uiLayers = new Set(['app', 'editor', 'renderer', 'player']);
const pureLayers = new Set(['domain', 'schema']);
const coreLayers = new Set(['domain', 'schema', 'physics', 'measurements', 'persistence']);

function projectPath(filename) {
  return path.relative(root, filename).split(path.sep).join('/');
}

export default {
  meta: {
    type: 'problem',
    schema: [],
    messages: { boundary: '{{reason}}' },
  },
  create(context) {
    const filename = context.filename;
    const sourcePath = projectPath(filename);
    const sourceLayer = sourcePath.split('/')[1];
    const inAdapter = sourcePath.startsWith('src/physics/adapters/');
    const report = (node, reason) => context.report({ node, messageId: 'boundary', data: { reason } });

    function inspect(node, source) {
      if (!source || typeof source.value !== 'string') {
        report(node, 'Module imports must use a literal path so architecture boundaries can be checked.');
        return;
      }
      const specifier = source.value;
      if (/^planck(?:\/|$)/u.test(specifier) && !inAdapter) {
        report(node, 'Native Planck imports belong only in src/physics/adapters.');
      }
      if (/^(?:matter-js|planck-js)(?:\/|$)/u.test(specifier)) {
        report(node, 'Unapproved physics engines belong in isolated PoC code, not the application.');
      }
      if (pureLayers.has(sourceLayer) && /^react(?:-dom)?(?:\/|$)/u.test(specifier)) {
        report(node, 'Scene domain and schema modules must stay independent of React.');
      }
      if (!specifier.startsWith('.')) return;

      const target = projectPath(path.resolve(path.dirname(filename), specifier));
      const targetLayer = target.startsWith('src/') ? target.split('/')[1] : undefined;
      if (target.startsWith('poc/')) report(node, 'Production modules must not import PoC code or results.');
      if (sourceLayer === 'domain' && targetLayer && targetLayer !== 'domain') {
        report(node, 'The scene domain must not depend on application services or rendering.');
      }
      if (sourceLayer === 'schema' && targetLayer && !pureLayers.has(targetLayer)) {
        report(node, 'Schema validation may depend on the domain, not application services.');
      }
      if (target.startsWith('src/physics/adapters/') && sourceLayer !== 'physics') {
        report(node, 'Use the physics interface; native adapter implementation must not leak into other layers.');
      }
      if (targetLayer && coreLayers.has(sourceLayer) && uiLayers.has(targetLayer)) {
        report(node, 'Core modules must not depend on editor, renderer, player or app modules.');
      }
      if (sourceLayer === 'renderer' && targetLayer && !['domain', 'renderer'].includes(targetLayer)) {
        report(node, 'The renderer consumes domain values, not physics, editing or persistence services.');
      }
      if (sourceLayer === 'player' && ['editor', 'persistence'].includes(targetLayer)) {
        report(node, 'The read-only player must use a resolver, not editor commands or writable persistence.');
      }
    }

    return {
      ImportDeclaration: (node) => inspect(node, node.source),
      ExportNamedDeclaration: (node) => { if (node.source) inspect(node, node.source); },
      ExportAllDeclaration: (node) => inspect(node, node.source),
      ImportExpression: (node) => inspect(node, node.source),
      TSImportType: (node) => inspect(node, node.argument),
      TSImportEqualsDeclaration: (node) => report(node, 'Use ESM imports; CommonJS cannot bypass module boundaries.'),
      CallExpression: (node) => {
        if (node.callee.type === 'Identifier' && node.callee.name === 'require') {
          report(node, 'Use ESM imports; CommonJS cannot bypass module boundaries.');
        }
      },
    };
  },
};
