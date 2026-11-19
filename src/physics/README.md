# Physics boundary — M1-03A contracts only

Public entry: `index.ts`. No native Planck imports, constructor, solver or world
exists in this task. The existing SceneDocument is the sole authored model.
Callers obtain it from M1-02 validation; these APIs are trusted typed internal
contracts, not replacements for untrusted JSON parsing/validation.

`PhysicsAdapter` defines capabilities and initialization; `PhysicsRuntime` defines
snapshot, one-logical-tick step and idempotent disposal. Initialization failure
contains diagnostics only, never a partial runtime. Future construction must
clean up on failure. Future runtime validates complete next-tick inputs before
mutation, stops on numerical failure, returns detached frozen SI snapshots and
rejects use after disposal. Those lifecycle behaviors are requirements, not an
implemented runtime or tested numerical capability in M1-03A.

`planckAdapterContract` is intentionally non-executable: even exact identity and
settings produce executionReady=false and initialization returns
ADAPTER_NOT_IMPLEMENTED. No injectable runtime factory or fallback exists.
`profileCompatible` means identity/settings match only; it is not permission to
simulate. Geometry, materials, student ranges and physical envelopes await B.

Exact identity: engine `planck` version `1.5.1`, adapterVersion `1.0.0`, profile
`planck-1.5.1-si-v1`. Version 1.0.0 identifies this initial adapter contract, not
numerical certification. No semver ranges are accepted. A change to adapter
behavior/version or profile requires explicit registration and qualification;
never rewrite saved scenes or fall back to a new engine. Approved settings remain
logical dt=1/120 s, four substeps, 12/12 iterations and constraint budget 12 mapped
to the shared solver. Restitution threshold zero/native contact settings remain
requirements for later implementation; no global Planck settings are touched.
Seed stays in the existing scene; M1-02 validates its bounds. V1 has no random
physics inputs, so no random engine behavior is introduced here.

Tick 0 is initial state. Inputs address a positive safe-integer next tick and
unique nonnegative safe-integer sequence within that tick; sequence determines
application order independently of arrival order. `orderTickInputs` validates
ordering and finite vector/point values, copies only contract fields and deeply
freezes output. It rejects the whole batch on duplicate sequence, wrong tick or
invalid values. Runtime must reject exhausted tick counters before mutation.
Body existence/dynamic status, force envelopes and student permissions require
later runtime/capability validation; this helper authorizes nothing.

The sole reserved input kind applies a world-space Newton force at a moving
body-local metre point for that logical tick, reapplied each substep. It does
not modify persisted forces or enable live controls. No force is actually applied
by this task. Empty batches are valid. No generic executable payloads are used.

Snapshots expose only identity, logical tick/time and stable-ID body positions,
velocities, CCW angles and angular velocities. Values use SI and y up; no pixels,
engine body/fixture/world/contact objects, opaque handles or writable authored
references. Existing lint boundaries plus public declaration-emission and exact
key/type tests guard native leakage. Numerical correctness and actual runtime
isolation/replay remain later gates, not passes inferred from these contracts.

## M1-03B capability-policy layer

See [CAPABILITY_LIMITS.md](CAPABILITY_LIMITS.md) for the current API, provisional
bounds, evidence, mixing semantics and mandatory future runtime checks. The
historical M1-03A description above defines the contracts; B now implements pure
policy checks, not a runtime. `checkPlanckContract` remains identity/settings-only;
`checkPlanckCapabilities` and the facade revalidate a detached scene, reject
unsupported requirements and return explicit `policyCompatible` separately from
`profileCompatible`. Both retain `executionReady=false`; initialize always fails.
No native Planck module is imported and no authored model/schema changes.

## M1-03C internal construction

The private harness and measured analytical evidence are documented in
[adapters/CONSTRUCTION.md](adapters/CONSTRUCTION.md). Only that internal module
constructs native objects; it exports an engine-independent snapshot/dispose
session and is absent from the public physics barrel. Public initialization,
capability execution readiness and numerical qualification remain blocked.
