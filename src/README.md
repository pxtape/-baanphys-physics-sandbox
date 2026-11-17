# Application module boundaries

One Vite application, following ARCHITECTURE.md. Only `app` and the React entry
point contain executable application code in M1-01. The other directories reserve
the agreed boundaries; they are not implemented features or alternate models.

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

Scene data, IDs, mutations, validation, coordinates and engine construction are
deliberately absent in this task. Future scene edits must go through validated
domain commands, never Planck handles or display pixels. Preserve the existing
JSON schema and qualified settings; do not register a production profile just
because the package is installed.
