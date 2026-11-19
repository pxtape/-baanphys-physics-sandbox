# C-only Planck initial-world harness

`constructInitialWorld` is internal to physics/adapters and is NOT re-exported by
physics/index. Its session has only snapshot/dispose, not step or native handles.
Public initialization and all executionReady values stay blocked until D/E.
This is construction evidence, not a trajectory benchmark or runtime certificate.

The harness revalidates detached Scene v1 data and complete B policy, computes
all SI properties, then creates one private temporary native world. UUID ordering
uses lowercase code points and retains original spelling in snapshots. Invalid
policy or physical properties reject before native allocation. Failures after
allocation destroy every world body (including an allocated body whose creation
throws before returning), clear private references and return diagnostics only.
Dispose is idempotent; subsequent snapshot calls fail. There is no stepping,
force application, contact instrumentation or live-force permission path.

Pure physicalProperties derives area, areal density, mass, centroid and COM
inertia from the existing geometry and authoritative mass mode. The geometry
helper now exposes its already calculated centroid; existing numerical formulas,
centroid tolerance and schema are unchanged. The helper consumes typed validated
body data; complete untrusted-object validation belongs to the harness pipeline.
Fixture density is explicit m/A or authored areal density. After fixtures, dynamic
MassData explicitly uses physical mass, COM inertia and local centre=(0,0). Static
native mass/inverse mass/inertia remain zero, with finite authored data preserved.
Final velocities are assigned last because native fixture/mass changes may alter
COM velocity. No vertices, anchors or authored centre positions are recentered.
Existing <=1e-8 m polygon-centroid residual is preserved, not silently normalized.

Circle/rectangle/polygon native boundaries must match the source coordinates
exactly, allowing cyclic polygon ordering only. Test mocks deliberately corrupt a
native fixture to verify rejection/cleanup; ordinary 3/8-vertex fixtures are also
constructed and checked. Future engine upgrades must retain geometry tests; no
hull simplification or decomposition is allowed to hide a mismatch.

Native configuration is adapter-owned: lengthUnitsPerMeter=1, unmodified slop,
skin, translation/rotation ceilings, zero linear/angular damping, no fixed rotation,
sleeping disabled, warm starting and continuous physics on. velocityThreshold is
set to zero once before the first eligible world; subsequent drift rejects new
construction instead of silently retuning globals. Settings are process-global:
other native-engine consumers must not modify them while a session is active.
No tick runs in C, so ongoing global/current-state checks remain D obligations.
Native fixture updates can reset explicit mass; the harness exposes no mutation
API that could do this. Future resizing must reconstruct or revalidate/reapply mass.

## Source correction, without policy expansion

The installed, pinned Planck 1.5.1 Settings.maxPolygonVertices is **12**, not 8 as
previous source notes stated. Construction verifies native 12; BaanPhys policy
still allows only 3–8. No schema, profile/settings, benchmark or supported-feature
limit was expanded. CAPABILITY_LIMITS.md and ARCHITECTURE.md clarify this distinction.
Native setMassData/resetMassData and mixing behavior were reviewed in
node_modules/planck/src/dynamics/{Body,Contact}.ts; package metadata is tested at
1.5.1 under the unchanged pinned lockfile.

## Executed analytical evidence

Node 24.22.1, Planck 1.5.1, unchanged profile. Run:
`npx vitest run src/physics/adapters/planck-construction.test.ts --silent=false`.
Each row ran independently in both explicit mass and areal-density modes. Inertia
below is measured after explicit native MassData assignment; all mass and area
absolute errors were 0. Checks use existing <=1e-12 * max(1,abs(reference)) boundary
tolerance, with no relaxation.

| Case | Analytical area (m²) | Mass (kg) | Analytical I (kg·m²) | Native measured I | Absolute I error |
| --- | --- | --- | --- | --- | --- |
| Disk r=.2 | pi*.04 | 1 | .02 | .020000000000000004 | 3.469446951953614e-18 |
| Rectangle 2×1 | 2 | 2 | 5/6 | .8333333333333334 | 0 |
| Same rectangle as polygon | 2 | 2 | 5/6 | .8333333333333334 | 0 |
| Triangle (-1,-1),(1,-1),(0,2) | 3 | 3 | 2 | 2 | 0 |

For the centred triangle, the independent lamina identity is I/m=sum(|v_i|²)/12
=8/12=2/3. These tests do not use a second copy of the polygon integral as oracle.
Tests additionally cover finite static floors/inverse quantities, final velocities,
rotated negative coordinates, centroid residual, geometry and mass boundaries,
canonical creation order, frozen/caller-owned source, interleaved sessions,
injected body/fixture/mass failures at first/middle/final objects, world failure,
native creation failure, double disposal and preflight rejection. No numerical
stepping, replay, production benchmarks or real Safari/iPad pass is claimed.

## Settings-drift blocker resolution (PR #4 follow-up)

Root cause: the earlier harness checked settings only once before allocation and
checked polygon vertices without checking skin radius. The exact linearSlop drift
reproduction now rejects immediately after the world checkpoint, before creating
an incorrectly skinned fixture. Shared `nativeSettingsMatch` is read-only and
used after world/body/fixture/mass checkpoints, at the explicit pre-publication
checkpoint, and once more after final fixture auditing. A settings mismatch
returns NATIVE_SETTINGS_MISMATCH and disposes the temporary world without changing
global values. Polygon fixtures must retain radius .01 as well as exact vertices;
all completed fixtures are audited again before session publication. Circle radii
and centres remain checked against authored geometry.

`native-settings.ts` pins every property of Planck 1.5.1 Settings (22 values) and
all SettingsInternal accessors (27, including scaled/squared derived values).
Coverage tests compare actual exported property names with the approved manifest,
then inject mismatches for each entry. SettingsInternal is a runtime export missing
from upstream's .d.ts; access is reflected only inside the native adapter boundary,
with no added native type/handle in public interfaces.

| Group | Approved native values |
| --- | --- |
| Scale/manifolds/vertices | lengthUnitsPerMeter=1; maxManifoldPoints=2; maxPolygonVertices=12 (BaanPhys policy remains 3–8) |
| Broad phase | aabbExtension=.1; aabbMultiplier=2 |
| Contact geometry | linearSlop=.005; angularSlop=(2/180)*pi; polygonRadius=.01 |
| CCD/distance | maxSubSteps=8; maxTOIContacts=32; maxTOIIterations=20; maxDistanceIterations=20 |
| Restitution/correction | velocityThreshold=0; maxLinearCorrection=.2; maxAngularCorrection=(8/180)*pi |
| Motion/correction | maxTranslation=2; maxRotation=pi/2; baumgarte=.2; toiBaugarte=.75 |
| Sleep (guarded although disabled) | timeToSleep=.5; linearSleepTolerance=.01; angularSleepTolerance=(2/180)*pi |

All values retain upstream defaults except the previously approved zero restitution
threshold. Trusted bootstrap permits exactly the upstream threshold 1 -> approved
0 transition once, after other native values match; this is initial configuration,
not error recovery. Later drift is rejected, including threshold drift back to 1.
Scene data cannot select or override these values. Read-only validation errors
(including malformed setting getters) fail closed. Test teardown alone restores
test-induced drift. Production failure cleanup releases bodies/references only.

Planck shares module-global settings across worlds: this change does NOT provide
per-world settings isolation. Cleanup of a failed new world does not destroy or
mutate a prior world's bodies; however the foreign global mutation remains present
until its owner resolves it. Checkpoint checks cannot prove that a hostile consumer
never changed and restored globals between observations. Shared native-module
ownership is a required integration constraint, not a sandbox/security boundary.

**M1-03D requirement (documentation only):** use the same read-only guard before
each tick/substep and after native stepping, before publishing snapshots. On drift,
stop/fail closed without returning a successful qualified frame, silently restoring
globals, advancing reported time as successful, or continuing on a potentially
modified state. Define safe terminal/reset behavior, coordinate settings ownership
across all active worlds, and test cross-world drift/cleanup independently. Native
settings checks do not replace atomic tick-input validation or envelope monitoring.
No stepping/runtime-drift implementation is included in this fix.
