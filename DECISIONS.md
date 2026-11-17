# Architecture decisions

## ADR-001 — select Planck.js for the initial production adapter

Date: 2026-11-17. Status: selected for M1 planning on executable M0.5 evidence; implementation still requires user approval. This is not certification of every available joint or a release approval.

### Context and evidence

BaanPhys requires numerical fidelity and stable mechanics before visual polish. [BENCHMARKS.md](BENCHMARKS.md) and its linked raw JSON/CSV record 93 executed configurations across Matter.js 0.20.0 and Planck.js 1.5.1. Of the 96 scheduled comparison entries, 3 are explicitly unexecuted/unsupported Matter ropes. Results are 59 passes and 34 failures across both engines/step sizes/mass supplements. Failures were not removed or tolerances widened. Separate verification/reference tests do not turn physical failures into passes.

At h=1/480 s, Planck passes free fall, projectile, two-body elastic collision (also 1:1, 1:10 and 1:100 mass ratios), revolute and point pendulums, Hooke/damped spring force implementations, rigid-body torque, taut/slack rope feasibility and static rod. Matter passes translation, torque, custom springs and static rod, but fails the tested elastic collision, pendulum accuracy/stability and rolling profiles. Both fail the rolling feasibility variant. Planck also passes the executed low-speed-elasticity and thin-floor CCD probes; Matter fails them. This is evidence for the pinned profiles, not proof every alternative Matter configuration must fail.

### Priority-ordered comparison

| Priority | Decision basis and tradeoff |
| --- | --- |
| 1 Physics correctness | Planck collision velocities agree with analytics to floating-point precision in these fixtures; Matter's m1=1/m2=2 collision has 11.292%/2.823% velocity errors and 7.315% energy drift. Both need four substeps to meet the strict 1.095 m projectile-displacement gate. Rolling remains unqualified in Planck despite most trajectory metrics being within 1%. |
| 2 Constraint stability | Planck physical hinge and B4 distance pendulum satisfy period, trajectory, energy and anchor drift at selected settings. Matter pin becomes dynamically unstable in this profile; its centre-distance pendulum loses enough energy to fail despite a good period. A stationary rod test alone is insufficient. |
| 3 Educational mechanics | Native revolute/distance/rope and documented pulley/gear/motor families reduce custom solver scope. Only the joints actually tested are qualified as PoC evidence. Matter lacks a native tension-only rope; a custom implementation would add risk. |
| 4 Extensibility | Separate engine adapter, explicit SI Hooke/damping force laws and typed capabilities allow extension. A second interacting solver is not part of the decision. Keep Matter comparison code for regression evidence, not dual-engine production maintenance. |
| 5 Browser/iPad | Both ship browser-capable JS; Planck includes ESM and TypeScript declarations. Actual Safari/iPad compatibility, touch/UI cost and cross-browser determinism are untested. Pin Node 24+ for development per Planck 1.5.1 metadata; Node support is not a browser support guarantee. No device claim drives this choice. |
| 6 Performance | Node-only 100-body/100-independent-rod p95: Planck ≈0.555 ms vs Matter ≈0.428 ms per logical tick at h=1/480 on the recorded host, both below 8.333 ms. Matter is faster here; numerical/mechanical evidence takes precedence. This is not a rendering or colliding-stack benchmark. |
| 7 Maintainability | Planck's SI/seconds API and TS declarations reduce conversion and custom-joint work. Both engines use MIT licenses. Planck's single friction coefficient, global settings, collision skin and step clamps require explicit production policies. Exact versions/lockfile and independent fixtures are mandatory. |

### Decision and consequences

Use **Planck.js 1.5.1**, with a future production adapter and versioned profile, not the PoC module itself. Proposed initial registered profile `planck-1.5.1-si-v1`: logical dt=1/120 s, substeps=4, h=1/480 s; position=12, velocity=12; constraint budget=12 mapped to the same position/velocity joint solver (there is no third independent engine setting). Sleeping and drag off; continuous physics and warm starting on; restitution velocity threshold=0 m/s; native linearSlop=0.005 m, polygonRadius=0.01 m, maxTranslation=2 m/substep and maxRotation=π/2 retained and surfaced in compatibility/envelope checks. Configure global constants once before worlds; do not run conflicting global profiles concurrently.

The M0.5 report proves this PoC configuration, not a production importer/profile registry. Production authoring cannot select the profile until M1 implements and tests it. Retain the existing unqualified M0 sample unchanged; do not silently reinterpret it with Planck. Any explicit engine conversion must create a new validated revision.

M1 execution supports basic circles/rectangles/static rectangles, gravity, mass/inertia and explicit bounded material settings. Planck has one Coulomb friction coefficient: require `staticFriction == friction` for executable scenes in the initial profile. Preserve unequal values on inspection but block preview with a useful message; never silently discard authored physics. Distinct static/dynamic friction needs a separately validated model/decision. Restitution threshold=0 is deliberate because the upstream default 1 m/s would change the intended elastic model; the low-speed test ran with the selected zero threshold, not with stock defaults.

Hinges/ropes/springs remain M3 features even though their PoC feasibility is positive. Slack-to-taut transients, chains, off-centre spring torques, reaction-force meters and complex mechanisms remain unqualified. Rolling stays disabled as an accuracy-certified teaching model until slip≤1% and penetration≤2 mm pass with a separately documented contact profile. Do not fix the failure by imposing angular velocity or widening tolerance.

M1 may start after user approval: no critical technical blocker for the basic editor slice remains. Browser/iPad, production adapter replay, storage and embedding tests are required M1 deliverables/later gates, not already completed work. There is no readiness claim for M3/M7 or production release.

## ADR-002 — local Git baseline, no inferred remote

Date: 2026-11-17. No usable repository or remote existed. Initialized `main` in `/workspace/.git` using narrowly scoped write permission for the environment-protected Git metadata. Existing configured author identity was retained. Baseline commit `65dfde9` preserves the supplied M0 files exactly as inspected. No files were deleted and no existing remote was overwritten. No remote URL was supplied, so none was invented or configured; no push or external repository creation occurred. A remote is optional for local M1 work and remains an owner setup task before collaboration/backup.

## ADR-003 — retain initial-state persistence and pinned-player architecture

No engine finding changes the separation of authored state, runtime state, immutable revisions and student sessions. Pull save/reload/export/import and a revision-pinned local read-only iframe into the initial vertical slice. Local IndexedDB IDs are browser/origin-local. Real cross-device BaanPhys embeds still require publication and an agreed host/auth contract at M5. No backend is provisioned in M0.5.
