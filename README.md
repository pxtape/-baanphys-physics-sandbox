# BaanPhys Physics Sandbox

M1-01: React + strict TypeScript + Vite foundation and module boundaries.
Planck.js **1.5.1** is pinned for the future adapter. This task provides a runnable
foundation page, not a scene editor or simulation. No scene data is constructed,
mutated or reinterpreted, and the existing Scene v1 schema/example are unchanged.

## Run locally

Use Node.js **24 or newer**, npm, and a terminal in the repository root:

```sh
nvm use                 # optional, if nvm is installed; reads .nvmrc
npm ci
npm run dev
```

Open **http://localhost:5173/**. The strict port option reports a conflict rather
than silently choosing another port. To use a different port:

```sh
npm run dev -- --port 5174
```

The server binds to `0.0.0.0` for shared-workspace previews; it is a development
server, not a production deployment. In a restricted execution environment,
binding a port may require the environment's network permission. Normal local
development does not require special sandbox permissions.

## Check and build

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run preview
```

The production preview is **http://localhost:4173/**. `build` typechecks before
Vite emits `dist/`. `npm run test:watch` runs Vitest in watch mode. The root test
suite is intentionally distinct from the archived PoC; it checks application
architecture boundaries, including type-only/dynamic imports.

Existing regression checks remain available without changing their thresholds:

```sh
python -m pip install 'jsonschema>=4,<5'  # only if absent in your Python environment
npm run test:m0
npm --prefix poc/engine-comparison ci --ignore-scripts
npm run test:poc
```

The PoC has its own exact dependencies and lockfile. `test:poc` verifies its
recorded evidence; it does not regenerate trajectories or turn failed physics
cases into passes. See [BENCHMARKS.md](BENCHMARKS.md) for those failures and
[the PoC README](poc/engine-comparison/README.md) for numerical rerun commands.

## Manual review of this task

1. Open the development URL. Expect the BaanPhys brand, “A place to build and
   explore physics.” and a foundation-preview notice. No shape palette,
   draggable objects, inspector or playback controls are present yet.
2. Reload. The same page should render without a Vite error overlay.
3. Narrow the window and zoom the page; text should remain readable and the
   notice should wrap. Real iPad/Safari compatibility remains unverified.
4. For a production smoke check, build, start `preview`, and open its URL.

## Architecture and current scope

[src/README.md](src/README.md) maps the reserved module directories to the
approved architecture. Native Planck APIs may only be imported by
`src/physics/adapters`; even type-only imports are checked. Production modules
cannot import the PoC. Domain/schema modules cannot depend on React, and a
player cannot import editor or writable persistence modules.

No production adapter exists yet (M1-03); the installed package is not imported
by the page. Scene validation (M1-02), coordinate transforms/rendering (M1-04),
authoring (M1-05), persistence and player work remain separate tasks. There is no
unvalidated sample model, ID regeneration or pixel-based physics state in this
foundation.

The approved future profile is unchanged: logical timestep `1/120 s`, 4 fixed
substeps (`h = 1/480 s`), Planck position/velocity iterations `12/12`, zero
restitution velocity threshold. It is not registered or activated by this task.
Rolling and advanced mechanisms remain unqualified and unimplemented.

See [M1_TASKS.md](M1_TASKS.md), [PROGRESS.md](PROGRESS.md) and
[DECISIONS.md](DECISIONS.md) for task status, review gates and engine decisions.
