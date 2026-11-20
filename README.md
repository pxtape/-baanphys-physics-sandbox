# BaanPhys Physics Sandbox

A public physics sandbox for circles, rectangles and static floors, with selection,
dragging, SI property editing, gravity, velocity and live measurements. Uses the
accepted Scene v1 domain and Planck.js **1.5.1** runtime.

**Experimental physics:** numerical qualification remains incomplete. The browser
sandbox runs real Planck collisions and mechanisms with clear limitations.
The existing qualification API remains unqualified; it is not a user-access gate. No certified collision, rolling, rope or pulley behavior is offered.

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

## Try the sandbox

1. Open the live GitHub Pages site or the local URL above. Choose a fall, collision, sliding, force/torque or hinge/rope pendulum example, or add objects.
2. Select an object in the scene/list. Drag it, use arrow keys (Shift: 0.5 m), or
   edit SI fields; blur/Enter commits a field. Invalid values leave the scene intact.
3. Press Play/Pause, Step (1/120 s), or Reset.
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
these are not accuracy-certified. SI Hooke springs with axial damping are experimental; pulleys remain unsupported.

The public GitHub Pages sandbox supports **Play/Step directly for everyone**.
No local server, cloud-workspace access, login, teacher/student mode or opt-in
checkbox is required. Simulation starts only on Play/Step. The same sandbox
works in an iframe; there is no privileged user mode. Numerical accuracy remains
experimental, with validation/settings/limits unchanged and no certification claim.

Undo/Redo groups each drag into one action. Duplicate copies a body and its forces
with fresh IDs (not joints). Ctrl/⌘ Z, Ctrl/⌘ D and Delete work outside fields.
Fixed-pivot drag sets hinge/rod poses around anchors and permits slack rope starts.
Zoom/Pan/Home and velocity vectors affect only the view; arrow lengths are display-scaled.

## MVP1 restart — lightweight checks

The previous automated test suites and test-only dependencies were removed at
user request. Keep the working application and develop the core sandbox from
this baseline. CI runs Node 24/npm ci, typecheck, lint and production build only.

```sh
npm run typecheck
npm run lint
npm run build
npm run preview
```

Production preview: **http://localhost:4173/-baanphys-physics-sandbox/**.
On the live site (or `npm run dev`), add bodies/floor and try
Play/Pause/Reset/Step, property edits, collisions and forces. Review new behavior
in the browser; do not recreate the old test matrix unless requested.
Historical benchmark data and limitations remain available. Removing tests does
not qualify physics: sandbox execution stays experimental; removing tests does not certify accuracy.
Screenshots: [docs/preview](docs/preview).

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
typecheck, lint and build. Only successful **main** runs deploy the built `dist/`
artifact; feature branches and PRs run checks only. No custom deployment secret
is needed: deployment uses GitHub's Pages/OIDC permissions. Use development
branches and PRs for subsequent work.

Vite's base is `/-baanphys-physics-sandbox/` in local and deployed previews. The
local URLs above include that path. After deployment, open the public page and
refresh it to check the UI and assets. Future player routes need a separate
Pages routing decision; this task does not add a router.

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

Quick + Hinge / + Rod / + Rope / + Spring attaches the selected movable body to
an initial world anchor and selects the connector. Connectors appear above bodies
in the object list and render on top of them. Click a connector directly:
- Drag a hinge pivot to reposition its mounting point while bodies stay in place.
- Drag A/B to move an endpoint; drop on another body to reconnect it.
- Drag the line/middle grip to translate both attachment points without moving bodies.
Rod/rope endpoint dragging sets length; whole-connector movement preserves rope
slack. Spring rest length stays unchanged (use the optional current-span button
to reset it). Empty-space drops retain the existing attachment. All gestures are
undoable, IDs stay stable, and Delete removes only the selected connector.
Arrow keys nudge a focused endpoint; optional precise values/connections remain
collapsed in the inspector. Reset the preview before editing.
All these mechanisms are experimental, not numerically certified.

Fit scene brings bodies and fixed anchors into view. During preview, Follow
preview centres the selected body's actual solver position. Pan/Home/Fit stop
following; camera movement never changes authored data or physics.

## MVP2 mechanism authoring

Use Hinge/Rod/Rope tool in the blue toolbar: click a movable body, then another
body or empty space. Rod/rope clicks set the two anchors and initial length;
for a hinge the second click sets the shared pivot. Cancel or Escape exits.
Move whole mechanism translates connected bodies and their world pivots together;
Fixed-pivot drag is a separate body-movement mode. Select the connector itself
to reposition attachments; its optional inspector also controls linked-body contact. Conflicting
single-link geometry edits are rejected rather than repaired silently.
Try Double pendulum and Linked ropes in the examples menu. These use the actual
native joints in the public sandbox.
pulleys and certified numerical mechanism accuracy remain unsupported.

## Live measurements (MVP3)

Motion trail shows the selected body's sampled centre-of-mass path. Open
Measurement graph to choose x/y position, velocity components, speed or kinetic
energy. Samples come from solver logical ticks every four ticks (30 Hz), plus the
latest tick for Step/current readings. Up to 600 snapshots are retained (~20 s);
selecting another body shows its recorded history. Reset clears the run.
Kinetic energy is ½mv² + ½Iω² using the same explicit SI mass/inertia as the
runtime. It excludes potential energy, work and any conservation guarantee.
Export CSV downloads the selected observable's current buffer with simulation
time in seconds and SI units; it does not save a scene or upload anything.

## MVP1–3 reference gap fill

Draw circle/rectangle/floor tools let you drag geometry directly on the canvas.
Circle starts at its centre; rectangle/floor start at a corner. Undo removes the
complete creation. Spring tool connects two anchors with real Hooke/dashpot loads:
edit rest length (m), spring constant (N/m) and damping (N·s/m). Try Spring oscillator
or Damped oscillator. Compression below 10% rest length or excessive stiffness/
loads is rejected/stopped; limits are provisional, not accuracy certification.
Acceleration vector/meter and ax/ay graphs use Δv/Δt over the last logical tick.
Contact peaks are tick-averaged, not instantaneous contact forces. Momentum x/y
and angular-velocity graphs/CSV are also available. Initial acceleration is unknown
until the first Step; no zero value is fabricated.
Research, measured short cases and remaining gaps: [gap review](docs/interactive-physics-gap-review.md).
