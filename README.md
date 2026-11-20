# BaanPhys Physics Sandbox

A working teacher editor for circles, rectangles and static floors, with selection,
dragging, SI property editing, gravity, velocity and live measurements. Uses the
accepted Scene v1 domain and Planck.js **1.5.1** runtime.

**Experimental preview only:** M1-03E remains blocked. Local teacher preview
offers explicitly labelled, uncertified collisions through the real Planck solver.
The certified/public adapter remains blocked. No certified collision, rolling, rope or pulley behavior is offered.

## Run locally

Use Node.js **24 or newer**, npm, and a terminal in the repository root:

```sh
nvm use                 # optional, if nvm is installed; reads .nvmrc
npm ci
npm run dev
```

Open **http://localhost:5173/-baanphys-physics-sandbox/**. The strict port option reports a conflict rather
than silently choosing another port. To use a different port:

```sh
npm run dev -- --port 5174
```

The server binds to `0.0.0.0` for shared-workspace previews; it is a development
server, not a production deployment. In a restricted execution environment,
binding a port may require the environment's network permission. Normal local
development does not require special sandbox permissions.

## Try the teacher MVP

1. Open the local URL above. Choose a fall, collision, sliding, force/torque or hinge/rope pendulum example, or add objects.
2. Select an object in the scene/list. Drag it, use arrow keys (Shift: 0.5 m), or
   edit SI fields; blur/Enter commits a field. Invalid values leave the scene intact.
3. Check **Enable experimental preview**, then Play/Pause, Step (1/120 s), or Reset.
   Reset restores authored conditions and unlocks editing. Set Friction and
   Restitution on both bodies and the floor; resize/rotate before running.

Scenes are in-memory drafts: reload loses edits. Experimental collisions run for
up to 30 s with actual contacts, bounce, friction and angular motion. Gravity and
initial linear/angular speed are limited to 20 SI; existing runtime envelope and
native-settings checks still apply. Pairs use geometric-mean friction and maximum
restitution; the floor defaults to restitution 0. Free-flight mode retains its
original pre-contact stop and 5 s limit. Overlap, tunnelling, jitter and numerical
errors remain possible; no collision/rolling accuracy is certified. Applied-force
controls use body-local application points with world-fixed vectors. Off-centre
forces and force couples generate real torque (which varies with orientation).
Experimental native hinges, rigid massless rods and unilateral ropes are available;
these are not accuracy-certified. Springs and pulleys remain unsupported.

Default `npm run build` provides authoring with preview **disabled**. Development
builds enable the explicit teacher opt-in; an intentionally controlled teacher build
can set `VITE_ENABLE_TEACHER_PREVIEW=true`. Do not publish an enabled build to public
Pages. This is a workspace/build boundary, not authenticated roles; no backend auth
is implemented. Embedded/student surfaces reject execution, and the public adapter
still reports executionReady=false. Main/Pages are unchanged until acceptance.

Undo/Redo groups each drag into one action. Duplicate copies a body and its forces
with fresh IDs (not joints). Ctrl/⌘ Z, Ctrl/⌘ D and Delete work outside fields.
Fixed-pivot drag sets hinge/rod poses around anchors and permits slack rope starts.
Zoom/Pan/Home and velocity vectors affect only the view; arrow lengths are display-scaled.

`npm run test:collisions` checks visible rebound, body collisions, sliding and
material/rotation controls against the dev server.
`npm run test:editor` runs Chromium integration checks against the running dev
server (override `EDITOR_TEST_URL` / `BAANPHYS_CHROMIUM_PATH` if needed). Install
Playwright Chromium with `npx playwright install chromium` and point the latter
variable to that executable if `/usr/bin/chromium` is absent. Screenshots are in
[docs/preview](docs/preview). Tablet touch emulation is not real Safari/iPad testing.

## Check and build

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run preview
```

The production preview is **http://localhost:4173/-baanphys-physics-sandbox/**. `build` typechecks before
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

## GitHub Pages deployment (M1-01.5)

`.github/workflows/deploy.yml` checks every push and PR with Node **24**, `npm ci`,
typecheck, lint, application tests, existing M0/physics verification, build and
`npm run test:pages`. Only successful **main** runs deploy the verified `dist/`
artifact; feature branches and PRs run checks only. No custom deployment secret
is needed: deployment uses GitHub's Pages/OIDC permissions. Use development
branches and PRs for subsequent work.

Vite's base is `/-baanphys-physics-sandbox/` in local and deployed previews. The
local URLs above include that path. After building, `npm run test:pages` checks
that the project index, JavaScript, CSS and index refresh work (temporary local
port 4175). Future history-based player routes need a separate Pages routing
decision; this task does not add a router.

**Live preview:** https://pxtape.github.io/-baanphys-physics-sandbox/

**Repository:** https://github.com/pxtape/-baanphys-physics-sandbox

The leading hyphen is part of the owner-created name and is retained. The first
main deployment [completed successfully](https://github.com/pxtape/-baanphys-physics-sandbox/actions/runs/44270951839).
The public index, JavaScript, CSS and refresh returned 200; shared Chrome rendered
and reloaded the page. Physical iPad/Safari testing remains outstanding.
[DEPLOYMENT.md](DEPLOYMENT.md) records evidence and deployment commands. M1-01.5 is
complete; this paragraph records its original foundation deployment.

## Historical M1-02 review branch — domain and validation

The earlier task branch added strongly typed, schema-derived Scene v1 documents and
`parseSceneJson` / `validateScene` in `src/schema/index.ts`. They validate input,
structure/formats, references, geometry, resources, controls and identity; return
structured diagnostics; and detach/freeze successful authored data. The existing
schema and scene JSON format are unchanged. [API and limits](src/schema/README.md).

Run `npm run generate:scene` after an intentional schema change;
`npm run check:generated` (also part of typecheck/build) detects generated drift.
Runtime validation is precompiled: no untrusted schema selection, network
resolution, eval or runtime Ajv compiler. Successful validation is **inspection
only**, always executionReady=false until a trusted production adapter qualifies
it in M1-03. Saved identity also needs future repository lineage/ownership checks.

That earlier task added no UI/editor/physics adapter or domain-state store. The
MVP branch described above now builds on the accepted domain and runtime.

Select an object to reveal canvas handles: drag the circular handle to rotate,
or the square handle to resize about its centre. Undo reverses a complete drag.
Numeric property fields remain available for precise and keyboard-based edits.

Motion switches between movable bodies and fixed surfaces. Remove forces/joints
before fixing an attached body; fixing explicitly zeros initial velocity.
Choose fixed mass or uniform 2D areal density (kg/m²); density-mode resizing changes
mass. Try the inclined-plane example and ½×/¼× playback; Step always advances 1/120 s.

Triangle and pentagon tools use centred convex Scene v1 polygons. Scale them
uniformly with the square handle or Polygon radius field. Polygon contacts are
available only in the opted-in experimental collision preview, not free-flight mode.

With a force-bearing body selected, drag the amber square to edit force direction
and magnitude; drag the amber circle to move its body-local application point.
The display scale is capped; numeric Newton components remain authoritative.
Force handles edit initial conditions and are locked during preview.

Quick + Hinge / + Rod / + Rope buttons attach the selected dynamic body to a
world anchor. Drag its blue crosshair to move the anchor and body together;
Fixed-pivot drag instead moves a body around the anchor. Numeric joint fields
remain available. All these mechanisms are experimental, not numerically certified.

Fit scene brings bodies and fixed anchors into view. During preview, Follow
preview centres the selected body's actual solver position. Pan/Home/Fit stop
following; camera movement never changes authored data or physics.
