# M1-03C — SI mass/inertia and isolated world construction

Status: plan only; implementation requires user approval. Depends on accepted
M1-02/A/B. PR #3 was reviewed at 95cbd750e88e9020f9b4654f50f88cce8db150e1
and merged as 1250efd7dc90fac6d33289254df3004a98090ebb.
Sources: M1-03_PLAN.md step 3, ARCHITECTURE.md, SCENE_FORMAT.md, TEST_PLAN.md,
BENCHMARKS.md, DECISIONS.md and src/physics/CAPABILITY_LIMITS.md.
No schema, profile numerical settings or acceptance threshold changes are proposed.

## Scope and implementation sequence

1. Add pure SI physical-property calculation using the existing SceneDocument and
   domain geometry primitives, with independent analytical test oracles. The
   output is derived runtime construction data, not another authored scene model.
   Respect mass mode (kg) or areal density mode (kg/m²), never both. All area,
   physical mass and inertia must be finite/positive; retain the B policy bounds.
2. Add private Planck 1.5.1 construction inside src/physics/adapters only. Re-run
   full structural/semantic/capability validation on a detached immutable copy at
   construction time; no cached report can authorize an edited scene. B policy
   eligibility is necessary, not execution readiness. No arbitrary factory/native
   options from scene data. Build supported bodies only after all preflight checks
   succeed. Constraints/measurements and other unsupported requirements reject.
3. Sort bodies by canonical lowercase UUID using code-point ordering, not locale
   collation or input-array order. Semantic uniqueness already rejects case-folded
   duplicates. Preserve authored UUID spelling in snapshots; native maps keyed
   canonically stay private. Use one fixture per supported body. No cross-world
   caches, shared bodies or writable source references.
4. Map SI position/linear velocity directly to metres/metres-per-second, y up;
   angles/angular velocity directly CCW radians/rad-per-second. Body position is
   authored COM. Circle radius and rectangle half-extents map explicitly; polygon
   body-local vertices are not recentered or decomposed. Preserve local anchors.
   Supply explicit dynamic/static type, initial transform/velocity, zero damping,
   sleeping disabled and recorded approved world settings. No renderer conversion.
5. Inspect Planck shape construction: native polygon hull/welding/reordering may
   alter valid shallow corners. Verify resulting geometry matches the source
   boundary (cyclic ordering is allowed) and reject unsupported altered fixtures
   rather than silently changing authored geometry. Preserve existing centroid
   tolerance 1e-8 m and source values; explicitly set local mass centre to authored
   COM origin. Test near-centroid-tolerance cases without rewriting vertices or
   moving initial positions. If native geometry cannot preserve the contract,
   report incompatibility rather than widen tolerances.
6. Build only a private temporary world until complete. Register each created
   resource for cleanup immediately. On any exception/mismatch, destroy/release
   bodies, maps and temporary world references; return structured diagnostics
   without publishing any partially built world/runtime. Successful internal
   construction can expose detached tick-zero snapshots and a disposable opaque
   engine-independent session to trusted adapter composition, never native handles.
   Failure cleanup must leave independent worlds untouched.
7. Keep the public facade execution-blocked until D/E runtime and numerical
   qualification exist. A C-only internal construction harness is for tests and
   adapter composition, not a back door to public execution. Define the minimal
   internal ownership/dispose boundary; do not fake PhysicsRuntime.step or return
   a purported executable runtime whose mandatory methods are unimplemented.

## Explicit physical properties and native settings

| Shape/model | Area and COM moment of inertia |
| --- | --- |
| Uniform disk | A=pi*r²; I=m*r²/2 |
| Uniform rectangle | A=w*h; I=m*(w²+h²)/12 |
| Convex polygon | A=1/2 sum(cross(v_i,v_next)); centroid from signed first moments; second moment from signed polygon integral about origin, subtract m*norm(centroid)² for COM inertia. Independently test triangles/rectangles/regular polygons. |
| Mass mode | Physical m=authored mass; derived areal density=m/A |
| Density mode | Physical m=authored arealDensity*A |
| Static body | Retain finite authored quantities; native inverse mass/inertia zero. Never serialize Infinity or make static bodies dynamic to impose mass. |

Use an explicit positive fixture density consistent with the source model; after
fixture construction set dynamic MassData explicitly to physical m, local centre
(0,0) and physical COM I. Source-review and test Planck setMassData/resetMassData
semantics: it may shift velocity for a centre change, and later fixture updates
may reset custom mass. Apply final initial velocity after final mass assignment;
assert no default damping, fixedRotation, implicit unit mass or unintended inertia
scaling. Do not infer physical inertia from a game-oriented library default.

Keep friction=saved coefficient and restitution=saved coefficient; native mixing
remains sqrt(muA*muB) and max(eA,eB). velocityThreshold=0 must be configured in one
trusted adapter-owned initialization path, with tests for multiple-world use.
Preserve native slop/skin/clamps; inspect/report version/settings mismatches,
never modify globals per scene or silently tune solver/accuracy. Fixed stepping,
force application and runtime input validation belong to D, not C.

## Required tests and exact acceptance

- Analytical disk (m=1,r=.2 => I=.02), rectangle (m=2,w=2,h=1 => I=5/6), centred
  rectangle polygon and centred triangle inertia agree with independent formulas;
  use existing 1e-12 relative/absolute-scaled boundary tolerance, not widened
  benchmarks. Test both mass/density modes and inclusive B geometry/mass limits;
  reject nonfinite/underflow/unsupported data before allocation.
- Inspect native fixture dimensions/vertices and mass/inertia through adapter-local
  tests only. All supported shape branches, static floors, rotated bodies,
  nonzero linear/angular velocities, origin/negative positions and local anchors
  map correctly. Round trips follow TEST_PLAN's 1e-12 scaled boundary tolerance;
  geometric centroid tolerance remains its existing 1e-8 m contract.
- Reverse/permuted body arrays produce identical canonical creation order and
  sorted tick-zero SI snapshots. Stable authored IDs survive creation/disposal;
  two worlds and repeated construction are isolated. Source deep hash unchanged,
  source remains immutable, snapshot data detached/frozen and JSON-safe.
- Inject failure after first/middle/final body/fixture/mass assignment and verify
  cleanup of all accumulated native resources, no successful handle/snapshot of a
  partial world and unaffected prior sessions. Dispose twice safely; use-after-
  dispose fails. Preflight rejection must cause zero native allocations.
- Unsupported constraints/measurements, wrong exact identity/settings, altered
  geometry, stale qualification after editing and unqualified public execution
  reject. Public executionReady stays false and native handles/types never leak.
- Existing 270 tests, generated consistency/typecheck, lint, M0 fixtures, PoC
  verification and production build remain intact. Add focused construction/math
  tests without importing PoC production helpers or changing numerical thresholds.
  Actual trajectories, B1/B2/B3/torque and 1e-10 runtime replay remain E gates;
  initial snapshots alone are not numerical motion evidence.

## Expected files, dependencies and risks

Likely files: pure physical-properties helper/test under domain or physics;
private adapters/planck construction module and tests; a small internal
construction ownership interface if needed; physics contract diagnostics/README,
M1_TASKS.md and PROGRESS.md. Keep native imports within adapters, with existing
architecture/declaration tests. No editor, UI, persistence, new schema, mechanisms,
solver loop or production-ready capability registration.

Depends on pinned Planck 1.5.1 and A/B exact contracts; no new package is assumed.
Main risks are native hull/welding, centroid/inertia and fixture-reset semantics,
global setting interference, failed-construction cleanup and accidental public
readiness. B's numerical envelope remains provisional, contacts/long-run/current-
state limits await D/E, and Safari/iPad/native-browser behavior is not certified.
A profile/contract change discovered necessary during source review must be
reported explicitly rather than hidden behind a compatibility fallback.

Stop after an approved C implementation is tested and submitted as a task PR;
no automatic merge, D/E implementation or deployment.
