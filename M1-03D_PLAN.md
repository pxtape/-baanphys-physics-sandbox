# M1-03D — Fixed stepping, forces and snapshots

Status: PLAN ONLY; implementation requires approval. Depends on accepted M1-02,
M1-03A/B and M1-03C, PR #4 merge 68d856ed99506890b3903301980607be3636b01e
(reviewed head a57e1a072fe14ea467aff6d6344734abcde791de).
Sources: M1-03_PLAN.md step 4, ARCHITECTURE.md, TEST_PLAN.md, SCENE_FORMAT.md,
DECISIONS.md, BENCHMARKS.md and physics capability/construction documentation.
No schema, physics settings, tolerance or engine change is proposed.

## Small implementation tasks

1. Extend private native ownership for an engine-independent internal runtime;
   native bodies/fixtures/world stay inside adapters. Preserve C's complete
   preflight, source cloning, explicit mass/inertia, geometry and settings checks,
   canonical UUID creation and transactional cleanup. Public execution remains
   blocked until E numerical qualification; an internal test runtime is not a
   certified public profile. Do not implement UI, scheduling or new mechanisms.
2. Implement exactly one logical tick per step call: dt=1/120 s, four h=1/480 s
   native calls world.step(h,12,12). Persisted constraint iteration budget 12 maps
   to Planck's shared joint solver, not a third native iteration argument. No
   variable dt, adaptive substeps or hidden performance tuning. Sleeping/drag off,
   warm starting/continuous physics on, restitution threshold zero, native
   slop/skin/clamps unchanged; use C's shared read-only settings guard.
3. Apply gravity as uniform world acceleration and saved constant world-space
   Newton forces at moving body-local metre points. Resolve references by stable
   case-insensitive UUID, create/apply saved loads in canonical ID order; preserve
   authored spelling. Transform each local application point to its current
   world position every substep. Reapply each force each substep because native
   force accumulators clear; never multiply Newton values by dt before applyForce.
   Off-centre torque is cross(rotatedLocalPoint,worldForce), positive CCW. Gravity
   must not be applied twice or given a spurious COM torque.
4. Validate the entire next-tick batch atomically before any native mutation,
   including waking bodies or accumulating forces. Then deterministically apply
   ephemeral inputs by unique sequence, on top of saved forces, for this logical
   tick only (all four substeps). No persisted mutation, scene replacement or
   live mass/velocity/geometry edits. An empty batch is valid.
5. Commit a detached frozen SI snapshot only after four successful substeps and
   all safety checks. Tick starts at 0, first successful step returns tick 1;
   timeSeconds=tick*(1/120), never accumulated wall-clock time. Keep body order
   canonical, old snapshots immutable and source scene/IDs unchanged. Snapshot is
   observable SI state, not a solver-cache serialization or restart mechanism.
6. Add terminal-failure/disposal handling and replay/isolation tests. Reconstruct
   fresh worlds from validated initial conditions and deterministic input logs;
   never imply caches can be restored from exported positions/velocities alone.

## Strict next-tick validation

Add a pure validator before trusted orderTickInputs, not a cast to TickInput[].
Validate plain own data and reject accessors/custom prototypes, malformed arrays,
cycles/nonfinite numbers, unknown keys/kinds and invalid field types. Reuse bounded
JSON snapshot primitives carefully; enforce a root batch length limit before deep
traversal. Proposed internal limit is 200 ephemeral inputs per tick (matching the
existing force-resource scale), <=2 MiB and depth<=32; document and test exact
boundaries. This is runtime policy, not a Scene v1 schema change. Persisted and
transient loads must also meet aggregate physical limits together.

Require exact next safe-integer tick, nonnegative safe-integer unique sequence,
known UUID resolving to a dynamic body, finite SI vectors/local points, and
current-state numerical envelopes. Reject stale/future ticks, duplicate sequences,
missing/static targets, counter exhaustion and use after disposal. Copy/freeze the
complete validated batch; never reread mutable caller data after checking.

Permissions come from trusted session context, never scene/URL/user-supplied engine
options. Default deny ephemeral live forces for student sessions; no live-force
student UI is introduced. A teacher/internal harness may explicitly receive the
narrow permission needed for tests. Permission rejection precedes native mutation.
Player policy/host authorization is not inferred from this internal capability.

Check all saved+tick loads together: vector force norms, sum-of-norm conservative
bounds, lever arms, worst torque, mass/inertia, acceleration, prospective speed/
rotation and occupied geometry bounds. Include current state, not only authored
values or individual-input limits. Existing student ranges have already been
qualified by B, but actual initial overrides must be validated before construction.
Invalid input must leave native state, tick, time, force accumulators and last-good
snapshot unchanged. Return bounded structured diagnostics with stable codes/paths.

## Settings, clamping and numerical failure

Use nativeSettingsMatch before a tick, before/after each force/native-step boundary
and immediately before publishing snapshots. Never restore/retune shared globals
as error recovery. On mismatch, stop/fail closed. All worlds share native settings;
validate each independently, coordinate trusted ownership, and do not present C's
checkpoint guard as per-world isolation or a sandbox against hostile native code.
Transient unobserved mutations cannot be disproved by sampling checks.

Check finite position/velocity/angular values, source-consistent mass/inertia,
force/torque and profile envelopes each substep. Initial estimates cannot bound
collision impulses. Combine conservative pre-step checks with post-native checks
for out-of-envelope motion and evidence of native translation/rotation clamping;
reject questionable results before publication, never clamp/repair state or infer
accuracy from a plausible animation. Keep native skin/slop/contact corrections
visible in limitations. Do not treat corrections/impulses as calibrated force data.

Input rejection is atomic and leaves the runtime usable. A native failure, drift
or unsafe result after mutation is different: mark the runtime terminal, dispose
its private world, reject subsequent step/snapshot and publish no successful frame
or advanced successful tick/time. Do not attempt rollback by setting kinematic
properties; that would omit contact caches. Recovery requires explicit fresh-world
reconstruction (and replay of validated inputs if designed), not continuation of a
possibly corrupted world. Preserve earlier immutable snapshots as historical data.
Dispose must remain idempotent and must not destroy an independent world.

## Tests and exact acceptance

- Instrument native calls: exactly four steps at h=1/480 with 12/12 iterations;
  one logical tick/time increment, empty-input ticks, no variable-dt argument.
- Gravity-only free motion; persistent force on every substep; off-centre force
  and net-zero-force couple signs/torque; rotating local points with world-fixed
  force direction. Use independent SI oracles, not prescribed trajectories.
- Freeze TEST_PLAN expectations: 2 kg with 4 N for 1 s gives v=2 m/s,x=1 m;
  2 kg 2×1 m rectangle with 1 N·m for 1 s gives omega=1.2 rad/s,angle=.6 rad,
  all specified errors <=1%. These are planned implementation tests, not executed
  production evidence. Full B1/B2/B3/torque report/convergence remains E's gate;
  basic smoke tests must not count as complete profile qualification.
- Input schema/resource/permission/reference cases, all integer boundaries,
  unknown fields, malformed/cyclic/getter input, permutations/duplicates and
  caller mutation. Multiple individually safe inputs whose sum violates limits
  reject before any native call; persisted+transient load interaction included.
- Settings drift before/mid/after substeps and during final snapshot audit;
  SettingsInternal disagreement, shared-world interference and repeated calls
  after mismatch. No silent repairs; no invalid snapshot or success time advance.
- Native failure/unsafe finite or nonfinite state and clamp cases at early/late
  substeps; terminal cleanup, use after disposal and unaffected independent world.
- Old snapshot/source hash and IDs unchanged; canonical output order; session
  forces do not leak between ticks/worlds. Fresh-engine same-runtime replay
  max absolute SI state difference <=1e-10 for defined short test scenes/input
  logs. Stable ordering and exact engine/settings recorded. No bitwise guarantee
  across browsers; TEST_PLAN cross-browser tolerances remain later evidence gates.
- All existing tests (currently 372), generated consistency/typecheck, lint, 25 M0
  fixtures, 13 PoC verification tests and build remain passing. Add meaningful
  adapter/runtime tests; do not import PoC code into production or alter thresholds.
- Public executionReady remains false until E acceptance. No renderer/editor,
  wall-clock scheduler, persistence, constraints/rolling, reaction-force meters,
  new engine or M1-03E implementation in D. Submit a dedicated task branch/PR
  after approval; no automatic merge or deployment.

## Expected files and risks

Private native construction/runtime composition, pure bounded tick-input validation,
small snapshot/lifecycle contracts and diagnostics, focused adapter/runtime tests,
physics docs/M1_TASKS/PROGRESS. Keep native imports in adapters, one authored scene
representation and no native types in public interfaces. Review any necessary
adapter/profile contract change explicitly before publishing compatibility claims.

Main risks: shared mutable native state; contact impulses and native clamps;
accumulator clearing and force ordering; atomic input checks versus irrecoverable
mid-tick numerical failures; long-run drift/tunneling and narrow projectile error
margin; browser/iPad and performance evidence still missing. B limits are
provisional restrictions, not continuous accuracy certificates. No requested
acceptance threshold or persisted numerical setting changes.
