# M1-03D internal runtime: fixed stepping, forces and snapshots

Entry: `constructSteppingRuntime` in the private Planck construction adapter. It
is not exported by the public physics barrel. Existing `constructInitialWorld`
remains snapshot/dispose-only. Both use C's complete detached scene validation,
B capability policy, SI properties, exact profile/settings, canonical UUID order,
geometry/skin checks and atomic construction cleanup. The public facade still
rejects initialization and executionReady remains false until E qualification.
No renderer, editor, clock scheduler, persistence, joint or mechanism is added.

## Tick and load semantics

Each successful step performs exactly four `world.step(1/480,12,12)` calls, then
commits one logical tick dt=1/120. The persisted constraint budget 12 maps to the
same Planck solver budgets, not a third native argument. Simulation time is
`tick*(1/120)`, never accumulated render/wall time. Initial tick/time=0. Snapshots
contain the existing engine-independent SI fields and stable-ID canonical body
order; objects are deeply frozen/detached, and older snapshots never change.

World gravity is applied once by native integration. Saved constant forces are
applied in canonical force-UUID order; tick forces follow unique sequence order.
All Newton vectors remain world-fixed and unscaled by dt. Each body-local point
is transformed to its current world position for every force on every substep.
Native applyForce computes the corresponding CCW torque. Auto-clear is explicitly
on; all active forces are reapplied after each substep clears the accumulator.
Tick forces last one logical tick only and are never written into authored data.

## Strict atomic inputs

`validateTickInputs` accepts unknown plain in-memory JSON, with at most 200 events
checked before deep traversal, depth<=32 and <=2 MiB (existing snapshot budget).
This is runtime policy, not a Scene v1 change. Root must be a normal array;
accessors, host objects, cycles, holes, functions, symbols/nonfinite values and
extra fields/kinds reject. Event fields are exactly tick/sequence/kind/bodyId/
vector/localPoint, and vectors have exactly finite numeric x/y. The complete
next positive safe-integer tick must match; sequences must be distinct nonnegative
safe integers. UUIDs resolve case-insensitively to dynamic bodies. The copied
batch is sorted/frozen; caller data is never reread after validation.

Ephemeral force permission comes only from trusted construction context,
`allowTickForces===true`, captured once; default is deny. Scene/student controls
cannot enable it and no live-force student UI is exposed. This private context
is not a replacement for future host/server authorization. External transports
must parse data before this API: arbitrary JS Proxy traps cannot be made inert
by plain-data validation and the native adapter is not a security sandbox.

Saved and transient forces are checked together against unchanged B limits:
each force/lever, sum of magnitudes, worst-orientation torque, actual mass/inertia,
gravity+force acceleration, angular acceleration and prospective speed/rotation.
No cancellation assumption is used. Provisional limits may conservatively reject
valid mechanics. Each substep monitors current finite state, occupied radius,
source-consistent mass/inertia/density/material/type/static state, damping,
geometry, world flags and globals. Post-step translation/rotation at native clamp
ceilings and motion outside policy reject before successful frame publication.
Observed per-substep displacement/h and rotation/h are also bounded by the same
100 m/s and 100 rad/s policy ceilings, even if a suspect final native velocity
was zeroed. This is a conservative numerical guard: large contact position
corrections may reject; it is not a measured velocity/force observable. Coordinate
subtraction at the inclusive limit uses the existing 1e-12 scaled boundary
comparison tolerance; instantaneous speed ceilings and numerical benchmark gates
are unchanged.
Contact impulses are not predictably bounded by authored initial values alone;
post-check failure is a terminal rejection, not a claim that a native clamp never
occurred internally. Post-state guards cannot prove the absence of every transient
CCD clamp whose effect is no longer observable; contact/clamp observability and
the qualified envelope remain E gates, and no general contact accuracy is certified.
No state/force/mass is repaired or silently clamped by us.

## Failure, settings and disposal

A malformed/unauthorized/out-of-envelope input batch rejects before waking a
body, applying forces or calling native step. Tick/time/committed snapshot/native
state remain unchanged and the runtime stays usable. Baseline native-state or
settings failure is not an input error and terminates the run.

Global Settings/SettingsInternal use C's read-only manifest guard before tick
validation, around forces and every substep, during snapshot collection, and
before commit. No production drift recovery retunes shared globals. They cannot
be isolated per world; a foreign mutation may force all affected runtimes to
terminate on next access. Checks cannot prove absence of transient hostile
changes between observations. Native code ownership remains mandatory.

A native exception, unsafe state, drift or audit failure stops the runtime
permanently, disposes ownership and returns diagnostics without a success frame
for the failed tick. Tick/time commit only after all four substeps and final
audits. No position/velocity rollback is attempted: solver/contact caches would
make that dishonest. Only reconstruction from the validated initial scene (plus
explicit replay if required) recovers a run. Historical detached snapshots remain
valid; step/snapshot on failed or disposed runtimes reject. Reentrant step/snapshot
access while a tick is in progress rejects. Dispose is idempotent.

Planck may remain locked after an exception inside native stepping. destroyBody
then returns false without progress; cleanup must not spin or unlock solver
state to resume. The private body/map/world references are detached for JS garbage
collection in that terminal case. Normal unlocked worlds have every body explicitly
destroyed. A native destruction exception also leaves the runtime terminal and
releases ownership without leaking the native exception/handle to callers. GC
reclamation timing is not deterministic; no native world is exposed for continued
use. Tests intentionally retain native references only inside adapter-local spies.

## Executed preliminary numerical smoke evidence

Node 24.22.1, Planck 1.5.1, fixed dt/h/iterations above, production runtime code
(no PoC imports). Commands:

- `npx vitest run src/physics/adapters/planck-runtime.test.ts --silent=false`
- `npm run typecheck` (includes `check:generated`)
- `npm run lint`
- `npm test`
- `npm run test:m0`
- `npm run test:poc` (separate existing provenance/probe verification)
- `npm run build`

| One-second smoke | Independent reference | Measured | Error |
| --- | --- | --- | --- |
| Gravity, rest at y=20 | y=15.095 m; vy=-9.81 m/s | y=15.084781250000004; vy=-9.809999999999963 | displacement .20833333333326%; velocity roundoff |
| 4 N on 2 kg, no gravity | x=1 m; vx=2 m/s | x=1.002083333333331; vx=1.9999999999999942 | position .20833333333310%; velocity 2.88658e-13% |
| Tick-oriented net-zero-force 1 Nm couple, rectangle I=5/6 | constant-torque comparator: omega=1.2 rad/s; angle=.6 rad | omega=1.1999956309556095; angle=.6012489133781379 | omega .000364087%; angle .208152230% |
| Saved world-fixed couple | step-halved ODE: angle=.5929268453268178; omega=1.1580576890023768 | angle=.5941331557109142; omega=1.1580579698651166 | normalized angle .201051731%; omega .0000234052% |
| Fresh worlds, 120 force-input ticks, interleaved | same ordered input log => same SI state | max absolute component difference=0 | <=1e-10 gate passed for this short case |

Torque qualification caveat: the third row updates world force directions once
per logical tick from the current body angle, then holds them world-fixed for its
four substeps. This only approximates constant torque; it is not a native motor or
a secretly body-following saved force. The fixed-world saved couple is separately
tested against an independent nonlinear midpoint ODE reference
`theta''=1.2*cos(theta)` at h=1e-5 and 5e-6 (step-halving agreement <=1e-8), keeping its actual changing torque semantics.
All preliminary numerical checks retain <=1% gates. No B1/B2/B3 convergence/contact
report, general contact/rolling fidelity, cross-browser guarantee or full E
qualification is claimed. B's continuous numerical envelope remains provisional.

The new tests cover exact step arguments, gravity/forces/torque/point transforms,
permissions/schema/resources/atomic rejection, true native clamp injections,
finite/nonfinite/type/material/mass/geometry faults, early/late/locked native
exceptions, settings drift, terminal cleanup, reentrancy, disposal, snapshot/source
immutability, world isolation and fresh-runtime replay. Existing 372 tests are
preserved. Real Safari/iPad, long-run stress/performance and full production
numerical qualification remain future evidence gates.
