# Application module boundaries

One Vite application, following ARCHITECTURE.md. M1-01 provides the app/React entry point. M1-02 adds the schema-derived domain
and standalone validation boundary; other directories still reserve the approved
modules and are not implemented runtime/editor features.

| Directory | Responsibility |
| --- | --- |
| `domain` | Engine/render-independent SI scene values and commands (M1-02). |
| `schema` | Bundled Scene v1 validation/migration boundary (M1-02). |
| `physics` | Engine-independent runtime interface and fixed-step scheduling (M1-03). |
| `physics/adapters` | Sole location allowed to import Planck native APIs (M1-03). |
| `renderer` | SI-to-screen transforms, shared SVG renderer and hit testing (M1-04). |
| `editor` | Authored-state tools, selection and validated commands (M1-05). |
| `measurements` | SI tick-derived observables, separate from rendering. |
| `persistence` | Immutable revision repository and import/export (M1-07). |
| `player` | Isolated session; no editor or writable persistence imports (M1-08). |
| `integration` | Resolver/host protocol, outside native physics. |
| `app` | Composition, presentation and eventual routes. |

Run `npm run lint` to enforce import boundaries. It also rejects production PoC
imports, type-only/native Planck leaks, CommonJS require and computed module
imports. No path aliases are configured. Add aliases only together with resolver
support in the architecture rule/tests so they cannot bypass these checks.

M1-02 validation accepts the single Scene v1 representation and returns frozen,
detached authored data with stable IDs. See schema/README.md for its API and
execution/persistence limitations. Coordinate transforms, UI mutations, engine
construction and editor commands remain later tasks. Future edits must validate
a candidate before replacing authored state, never mutate Planck handles or
display pixels as physical state. Preserve the existing
JSON schema and qualified settings; do not register a production profile just
because the package is installed.
