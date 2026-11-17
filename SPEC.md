# BaanPhys Physics Sandbox specification

Status: M0 design baseline, 2026-11-17. No application or engine benchmarks have been implemented. Requirements below are acceptance targets, not claims of existing capability.

## Repository inspection

The supplied `/workspace` contains environment directories and empty support directories (`library-files`, `scratch`, `shared`); no application files, package manifest, tests, or existing AGENTS.md were found. `git status` reports no usable Git repository despite a reserved `.git` directory. No existing architecture, scripts, or dependencies can be assessed. This baseline adds documentation, a schema and an example only; initialize the actual project when implementation is authorized.

## Product scope and actors

Teachers author reproducible 2D educational experiments, save initial conditions under a stable simulation ID, and attach a specific immutable revision to a BaanPhys problem. Students run isolated copies and change only explicitly permitted initial parameters. The authored revision never changes through student interaction. Read-only means read-only authorship, not frozen playback.

Interactive Physics is a workflow reference, not an accuracy specification or a commitment to feature parity. The application must disclose supported models and numerical limitations. Electromagnetism, fluids, deformable bodies, 3D, symbolic solutions, arbitrary scripts, grading and collaboration are outside the initial scope.

## Functional requirements

| ID | Requirement and observable acceptance | Delivery |
| --- | --- | --- |
| FR-001 | Create circles, rectangles, convex polygons and static surfaces with dimensions in metres. A surface is a static rectangle/polygon with finite physical thickness. Reject degenerate/self-intersecting geometry; concavity is deferred until decomposition is validated. | M1 |
| FR-002 | Select, drag, rotate, resize, duplicate and delete using pointer or keyboard. A gesture is one undo command. Duplication remaps IDs and internal references. Deleting referenced bodies requires explicit cascade preview. | M1 |
| FR-003 | Inspector edits position (m), angle (rad with optional degree display), linear velocity (m/s), angular velocity (rad/s), mass (kg), areal density (kg/m²), friction and restitution. Exactly one mass/density source is authoritative; derived values update with shape changes. Static bodies retain finite material data but have zero inverse mass at runtime. | M1–M2 |
| FR-004 | Set uniform gravity (m/s²) and constant world-space forces (N) applied at local body anchors. Reapply forces every physics substep. Off-centre forces generate torque. Time-dependent formulas are deferred. | M2 |
| FR-005 | Simulate rigid-body translation, rotation and collisions, with declared friction/restitution combination rules and validated mass/inertia. Unsupported scale/speed ranges produce diagnostics. No hidden speed clamps or geometry changes to conceal tunneling. | M2 |
| FR-006 | Add fixed world anchors, hinges, bilateral rods, tension-only ropes and physical Hooke springs with damping. Each is capability-gated and must pass its tests before use. A fixed point is an anchor; it is not a welded body. | M3 |
| FR-007 | Later add ideal pulleys, gears, dampers and motors with explicit assumptions and force/torque limits. Never render an unsupported mechanism as if solved. | M7 |
| FR-008 | Play, Pause, Reset, single Step and Slow Motion. Step advances one configured logical timestep. Reset reconstructs the authored initial state and clears graphs. Slow motion changes tick scheduling, not integration timestep. Editing requires stopping/resetting the preview, with a visible prompt before discarding runtime progress. | M2 |
| FR-009 | Toggle velocity, acceleration and force vectors with units, legend and separate visual scale. Distinguish applied forces, gravity, inferred average net force, constraint reactions and collision impulses; unavailable reaction forces are labeled unavailable. | M4 |
| FR-010 | Numerical meters and bounded time-series graphs for position, velocity, acceleration and energy; sample on simulation ticks, label axes/units, allow CSV export. Mark collision acceleration as timestep-dependent. | M4 |
| FR-011 | Save/load/list/duplicate local scenes; import/export validated JSON. Save always captures authored initial conditions, never incidental runtime state. Explicit dirty/error status; failed writes never show Saved. | Thin slice, M5 completion |
| FR-012 | First save assigns a UUID simulation ID. Each subsequent save creates an immutable UUID revision ID with parent and sequence. Duplicate creates a new simulation ID and revision history. Export preserves identity; import collision handling never silently overwrites. | Thin slice, M5 |
| FR-013 | Embed a revision-pinned player in an iframe, with playback controls and no authoring or repository write capability. Missing/inaccessible revisions show a recoverable error. Local embeds are device/origin-local; remote sharing requires published server storage. | Thin slice, M5 |
| FR-014 | Teacher allowlist defines body mass or initial velocity parameter controls with finite min/max/step and defaults derived from the scene. Everything else is locked. Student overrides are ephemeral, validated and applied before reconstructing the run. Reset run retains overrides; Restore defaults clears them. | M6 |
| FR-015 | Full-screen teaching view retains playback and measurements; handle unavailable Fullscreen API, escape and orientation changes with an in-page expanded fallback. | M6 |
| FR-016 | Undo/redo authored transactions, independent of simulation ticks; save revisions persist across reloads. Undo never deletes historical saved revisions. Migration creates a new revision and preserves the original. | M1, M5 |

## Nonfunctional requirements

| ID | Contract |
| --- | --- |
| NFR-001 Correctness | Numerical physics takes priority over animation. Use real equations and documented approximation envelopes. Target ≤1% only for the explicit cases/settings in TEST_PLAN.md. A visually plausible animation is not validation. |
| NFR-002 Units | Scene/domain/runtime adapter interface use SI: m, kg, s, N, rad; density is areal density for the 2D uniform-lamina model. Screen pixels and engine-native units exist only at adapter boundaries. |
| NFR-003 Timing | Fixed logical timestep, fixed substeps and fixed solver iterations are persisted. Rendering interpolates independent snapshots. A throttled tab pauses rather than jumping simulated time. |
| NFR-004 Reproducibility | Same scene, exact engine/adapter versions, settings and ordered tick-input log reproduce within declared tolerances. No cross-engine or cross-browser bitwise guarantee; certified browser comparisons use 1e-7 relative/absolute-scaled state tolerance before a collision and 1e-5 after contacts for the short replay fixtures. Failing cases narrow the certified envelope explicitly. |
| NFR-005 Safety | No eval, Function constructors or executable imported code. Validate structure, semantics, capabilities and resource limits before construction. Render titles as text. No arbitrary URLs, HTML or engine option bags in scenes. |
| NFR-006 Durability | IndexedDB atomic revision/head writes. Quota/private-mode/unavailable-storage errors are visible and offer export; retain unsaved edits in memory. No claim of backup or multi-device access for local storage. |
| NFR-007 Isolation | Player works on a deep validated clone; teacher data is immutable. Future server authorizes all writes independent of UI mode. Public player payload contains no secrets or answer keys. |
| NFR-008 Compatibility | Desktop current Chrome/Edge, Firefox and Safari, plus current and previous major iPadOS Safari at release; record actual tested versions. Pointer Events, touch pan/pinch, keyboard alternatives, 44px controls, focus and screen-reader labels. Target WCAG 2.2 AA for controls; provide an accessible object list and numerical scene description. |
| NFR-009 Performance | Provisional standard envelope: 100 bodies, 100 constraints, 20 plotted series, 10 minutes of bounded samples. Target ≥30 rendered fps and p95 solver cost below logical tick budget on a named reference iPad and desktop to be selected during M1. Physics settings never silently degrade to hit fps. No measured performance yet. |
| NFR-010 Maintainability | TypeScript strict mode; pure domain/math utilities; isolated engine adapter; automated physics, schema, repository and browser tests. Exact dependency lockfile and versioned capability profiles. |
| NFR-011 Limits | Import ≤2 MiB UTF-8, ≤100 bodies, ≤100 constraints, ≤200 forces, ≤128 vertices/body, ≤20 measurements, ≤50 student controls, bounded depth 32. Reject nonfinite and out-of-envelope values before allocations. These are MVP limits, adjustable only with documented tests/schema changes. |

## Smallest end-to-end slice

After an engine qualification spike, build only a circle, dynamic rectangle and static rectangular floor; select/drag and inspector position, dimensions, mass and velocity; uniform gravity; Play/Pause/Reset/Step. Add local revisioned save/load, JSON export/import, and `/player/:simulationId?revision=:revisionId`. Demonstrate: author a falling ball and floor, run, reset, save, reload after a browser restart, embed a pinned local player, run independently and confirm the source and revision are unchanged. Basic undo for creation/movement/property edits is included. No polygons, joints, graphing, arbitrary forces or student controls are needed for this slice.

A same-origin parent harness must embed the local player successfully in the same browser profile. A BaanPhys problem on another origin/device cannot resolve its IndexedDB ID. That use requires M5 publication; before then a portable JSON handoff through an explicit, validated host protocol can demonstrate portability, but is not a durable public embed. Do not advertise a local URL as a shareable simulation.

## Open decisions

1. Select the solver only after the qualification tests; Matter.js is a candidate, Planck.js is the leading comparison. See ENGINE_FEASIBILITY.md.
2. Confirm real BaanPhys host origins, problem-content format, authentication, publication lifecycle and whether access is public or enrolled-only. No host integration is assumed to exist.
3. Choose reference iPad/desktop and exact supported scene scale/speed envelope based on measured qualification.
4. Confirm whether future ideal strings/pulleys should be constrained rigid-body models or a separately validated educational solver. Never mix solvers within one interacting world without a coupling design.
5. Confirm whether students need live forces/dragging later; initial MVP interaction is playback and allowed initial-parameter controls only.
6. Decide hosting/backend at M5. Repository interface does not prescribe a vendor.

## M0.5 status update

The repository inspection and “no benchmarks” statements at the start of this M0 baseline describe the original inspection. A working local Git repository now preserves that baseline, and isolated engine tests have executed. Planck.js 1.5.1 is selected for the future M1 adapter; see DECISIONS.md and BENCHMARKS.md. No application or visual editor exists yet.

Engine selection (open decision 1) is resolved for basic M1: logical dt=1/120 s, 4 substeps. Basic Planck mechanics meet defined fixtures; rolling is unqualified and native APIs do not establish advanced-mechanism accuracy. The initial capability profile only supports equal static/dynamic friction values and convex fixtures of 3–8 vertices; other schema-valid data may be inspected but must be blocked for execution with actionable diagnostics. No schema data is silently approximated. Device baselines, BaanPhys integration and later physical-model decisions remain open. M1 work and acceptance are defined in M1_TASKS.md and await user approval.
