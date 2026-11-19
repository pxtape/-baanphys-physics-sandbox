# M1-03B — Capability Validation

Status: plan only, awaiting user approval. Depends on accepted M1-02 and M1-03A
(PR #2, reviewed head 33cfb2ea0f424716bde34feb2b265d48c9f24748,
merge 15a8f480e47e30997b714a0b88dca6ebdc30cf62).
Implements step 2 of M1-03_PLAN.md, without native construction or stepping.
Sources: ARCHITECTURE.md, SCENE_FORMAT.md, TEST_PLAN.md, BENCHMARKS.md and
DECISIONS.md. No Scene v1 or numerical-threshold change is proposed.

## Validation sequence and qualification

1. Keep untrusted input on the M1-02 bounded parse/schema/semantic path. Capability
   APIs consume that detached readonly SceneDocument; runtime initialization must
   not bypass validation based only on a TypeScript annotation or stale report.
2. Reuse exact engine Planck 1.5.1 / adapter 1.0.0 / planck-1.5.1-si-v1 and all
   approved settings from A. No fallback, coercion or hidden accuracy changes.
3. Evaluate every body, force, constraint, measurement and student control, with
   bounded deterministic structured diagnostics. Policy acceptance is distinct
   from production qualification: profileCompatible remains identity/settings
   matching only. B must keep executionReady=false and initialize rejecting while
   C/D implementation and E numerical evidence are absent. If policy status needs
   a separate result field, add it explicitly with type/consumer regression tests;
   never overload profileCompatible or remove unqualified diagnostics early.
4. Any unsupported or out-of-range requirement rejects the entire scene for
   execution. No partial body filtering, substituted constraints or approximated
   geometry. Inspection/export preserves original values and IDs. A future
   successful qualification must belong to the exact scene/profile/settings and
   full allowed parameter domain; it cannot be reused after an authored edit.

## Policy tasks and required tests

| Area | Required policy | Tests / boundary evidence |
| --- | --- | --- |
| Geometry | Circle, rectangle/finite floor and simple centred strictly convex CCW 3–8 vertex polygons only. Reuse M1-02 geometry checks; reject >8, no recentering/hull/decomposition. Native skin/slop envelope must be explicit. | All shape and mass/density branches; 3/8 accepted policy boundaries, 9/128 rejected; tiny/large/nearly degenerate geometry; static floors; preserve anchors and source JSON. |
| Materials | staticFriction=friction exactly; no tolerance-based rewriting. Document geometric-mean friction and max restitution mixing. No claim that native friction certifies rolling. | Equal zero/positive/boundary coefficients; unequal but schema-valid values reject at precise pointer; restitution boundaries; combinations; immutable authored data. |
| Numerical envelope | Use fixed logical 1/120 s, four h=1/480 substeps, solver 12/12 and shared constraint budget 12. Keep native slop .005 m, polygon skin .01 m, maxTranslation 2 m/substep and maxRotation pi/2/substep. Bounds must account for position/size, density-derived mass/inertia, mass ratios, speed, gravity, force and off-centre torque. | Below/at/above each documented bound; finite overflow/underflow; vector norm rather than per-component speed only; aggregate forces and lever arms; static/dynamic distinctions; extreme mass ratios. |
| Student ranges | Validate the entire continuous min/max domain, not only default or step grid. Jointly consider mass, both velocity components and both gravity components; mass minimum maximizes acceleration, relevant extrema maximize norms/ratios. | Default passes but endpoint fails; interacting ranges fail though individually safe; all control target branches; endpoints, zero crossings, step/default rules retained; no student permission inferred for live forces. |
| Unsupported features | Reject every nonempty constraint collection for now (hinge/rod/rope/spring), >8 vertex geometry and any unimplemented feature requirement. Decide support for saved forces/meters explicitly; block requirements that cannot yet be fulfilled, never ignore them. | All four constraint branches, world/body anchors, mixed supported/unsupported scenes, nonempty force/meter requirements. No unsupported case counted as a passing physics test. |
| Diagnostics and isolation | Stable capability codes, execution stage, actionable suggestion and exact RFC6901 pointer; deterministic ordering and cap at existing diagnostic budget. Never mutate/freeze caller-owned mutable data or retain runtime/native handles. | Multiple independent failures; diagnostic truncation; repeated result determinism; detached/frozen result; original scene hash/IDs unchanged; no native import/construction; no partial runtime. |

## Numerical limits: evidence versus safety checks

The native clamp constants provide necessary safety ceilings, not an accuracy
certificate. Initial motion estimates must include gravity, total applied force,
minimum possible mass and torque/inertia across all controls. Contact impulses
can invalidate an initial-speed-only prediction; C/D must add pre-step and
per-substep runtime checks before invisible clamping, with a diagnostic stop on
unexpected limits. B defines these obligations but does not implement stepping.

Concrete tighter limits for geometry scale, world extent, speed, mass ratio and
force must be traced to existing measured evidence or explicitly labelled
provisional conservative policy, with boundary tests and a qualification backlog.
Do not invent a certified continuous envelope from a handful of PoC fixtures.
If evidence is insufficient, return an unqualified-capability diagnostic and keep
execution blocked. Review the actual proposed bound table during implementation;
changes requiring a new profile/schema/settings need explicit approval.

B1/B2/B3, force/torque and replay gates remain as written in M1-03_PLAN.md and
TEST_PLAN.md for E through production code. B does not change thresholds, rerun a
PoC as production proof or certify rolling/constraints. Tests of policy rejection
are contract tests, not accuracy passes.

## Future runtime input boundary (C/D requirement)

orderTickInputs is for trusted typed ordering, not a security or capability gate.
Before any mutation, runtime must validate an entire bounded batch: correct next
safe-integer tick, unique sequence, allowed kind/own data shape, finite numbers,
UUID resolution to dynamic bodies, session permission where applicable, and
aggregate force/torque/motion envelope against current runtime state. Handle
missing objects, static targets, NaN/Infinity, stale ticks, duplicates, exhausted
counters, oversized/malformed batches and inputs after disposal. Snapshot/copy
before use to prevent mutation between checking and stepping. Invalid batch must
leave tick, time and state unchanged. Do not expose live force controls merely
because an internal contract can describe them. Dynamic values cannot be fully
qualified by the authored initial-scene validator alone.

## Expected affected files

- src/physics/capabilities.ts and focused capability tests (new), with small pure
  policy helpers if needed; no Planck imports.
- src/physics/profile.ts, contracts.ts and index.ts for delegation/diagnostic codes
  and explicit result types, preserving A behavior and tests.
- src/physics/README.md, M1_TASKS.md, PROGRESS.md; record evidence/policy limits in
  the capability documentation. Keep canonical schema, fixtures, PoC and thresholds
  untouched. No UI, persistence, adapters/world construction or solver changes.

## Exact acceptance criteria

- All policy areas above have positive, negative and exact-boundary tests; every
  schema-valid unsupported feature is diagnosed, with no source mutation.
- All student-range combinations stay inside policy or are execution-blocked.
- Identity/settings remain exact; readiness cannot become true merely because
  policy checks pass. No partial runtime exists and no native types/imports leak.
- Numerical bounds, provenance and limitations are documented; missing measured
  evidence remains visibly unqualified. No silent geometry/material adjustments.
- Future runtime batch-validation obligations are explicit and implementable;
  implementation of those runtime checks remains C/D, not falsely claimed in B.
- Existing A/validation/timestamp/architecture suites remain unchanged and pass,
  with typecheck/generated sync, lint, new/full tests, M0 schema fixtures, existing
  PoC verification and production build. Report actual executions only.
- Commit/push a dedicated B task branch and PR after approval; do not merge,
  deploy or proceed to C/D/E without their respective acceptance/authorization.
