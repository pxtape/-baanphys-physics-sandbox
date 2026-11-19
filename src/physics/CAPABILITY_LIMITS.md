# Planck capability policy B — provisional limits

This is a pure rejection policy for the planned Planck 1.5.1 / adapter 1.0.0 /
planck-1.5.1-si-v1 profile. **No scene is execution-ready.** Passing these checks
is not numerical accuracy evidence or permission to construct/run an engine.
The Scene v1 schema and existing numerical benchmark gates remain unchanged.

## API and three separate results

`checkPlanckCapabilities(scene)` revalidates a detached copy with M1-02's full
bounded schema/semantic pipeline before policy evaluation. The API uses the same
SceneDocument type; malformed in-memory objects are safely rejected as
CAPABILITY_SCENE_INVALID. It returns no authored copy or engine handle.

- profileCompatible: exact identity/settings match only (false on invalid scene).
- policyCompatible: structurally/semantically valid, exact profile/settings and
  all provisional policy requirements pass together.
- executionReady: always false, including policy-compatible scenes. A permanent
  FEATURE_NOT_QUALIFIED error explains missing production runtime/numerical proof.

The facade calls this validator and always rejects initialization, without
allocation. A successful policy report cannot be cached as authority after an
edit or used to bypass later runtime checks. Unknown engine/profile/adapter
versions never fall back. Approved dt=1/120 s, substeps=4, 12/12 solver and shared
constraint budget=12, sleeping=false are unchanged. Seed remains schema-bounded;
no randomness or native settings are introduced by this task.

## Provenance and inclusive policy bounds

Except where labelled native/schema, **all bounds below are explicitly
provisional engineering restrictions**. They are not a measured continuous
stability/accuracy envelope. They restrict obvious scale/load extremes while
keeping the basic M0.5 fixture scales inspectable. They require production
qualification in C/D/E before execution, and may reject physically valid scenes.
No tolerance for <=1% benchmarks was changed or inferred from these bounds.

| Quantity | Inclusive bound | Basis and uncertainty |
| --- | --- | --- |
| Circle diameter; rectangle width/height | .02..100 m | Provisional. .02 is twice native polygon skin and four times linear slop; this ratio alone establishes no contact accuracy. |
| Convex polygon vertices | 3..8 | Approved conservative profile limit; C source inspection confirms native Planck 1.5.1 allows 12, correcting the earlier native-limit claim. Schema permits 128 for inspection. Policy stays 3–8; no hull/decomposition. |
| Polygon edge | .02..100 m | Provisional minimum edge restriction; semantic checks alone allow much smaller. |
| Polygon COM-to-edge distance | .01..50 m | Provisional thin-sliver guard; uses supporting lines of already validated strictly convex centred polygons. |
| Polygon local vertex radius | <=50 m | Provisional extent guard; no recentering. Rectangle corner radius may reach sqrt(2)*50 m. |
| Initial occupied world radius | <=1000 m | Provisional origin-relative norm of COM plus conservative circumradius, including static floors; not a per-coordinate box. |
| Authored/allowed mass | .01..1000 kg | Provisional, including density-derived values and finite authored static-body data. Native static inverse mass remains a later adapter concern. |
| Dynamic pairwise mass ratio | <=100 | Provisional, not qualified at the extremes. Independent bodies only, static bodies excluded; each pair's worst allowed ratio checked. |
| Lamina inertia | 1e-8..1e7 kg·m² | Provisional finite/positive guard, derived from existing domain geometry and entire mass ranges; deliberately redundant with tighter geometry/mass restrictions in many cases. No native mass conversion. |
| Initial speed / angular speed | <=100 m/s / <=100 rad/s | Provisional norms, not component clamps. Disk torque PoC reaches 50 rad/s, not proof at 100. |
| Gravity / total applied+gravity acceleration bound | <=100 / <=100 m/s² | Provisional; includes entire simultaneous gravity and mass-control intervals. |
| Angular acceleration bound | <=10000 rad/s² | Provisional, checked using worst torque and smallest permitted inertia. |
| Each constant force / per-body sum of force magnitudes | <=1000 / <=1000 N | Provisional, triangle upper bound, including opposing forces without relying on cancellation. |
| Local force-point radius / worst-orientation total torque | <=50 m / <=1000 N·m | Provisional; local point need not lie inside body. Torque sum <=sum(norm(localPoint)*norm(force)), valid under rotation. |
| Friction / restitution | Schema 0..2 / 0..1 | Canonical schema unchanged. Require staticFriction===friction exactly; no epsilon or coercion. |

Native source-reviewed constants: linearSlop=.005 m, polygonRadius=.01 m,
maxTranslation=2 m/substep, maxRotation=pi/2 rad/substep. They are preserved,
not adjusted by B. Initial prospective substep motion is checked using
h=1/480: (speed+h*accelerationBound)*h and
(abs(omega)+h*angularAccelerationBound)*h against those ceilings. Tighter policy
bounds normally reject long before native clamps; this redundancy is deliberate.
These checks cover only initial applied-force evolution, not contact impulses,
long-run acceleration or all solver effects.

Evidence remains in BENCHMARKS.md and immutable poc/engine-comparison results.
B1/B2/B3 and force/torque fixtures executed at selected settings in the PoC, not
through a production runtime. For example B2's h=1/480 endpoint error .9332%
passes its unchanged 1% gate while h=1/240 fails at 1.866%. Neither proves accuracy
for the provisional extrema above. Rolling slip/penetration still fail. No new
physics benchmark, engine upgrade, solver tuning or certification occurs here.

## Mixing and feature decisions

Planck 1.5.1 src/dynamics/Contact.ts (`mixFriction`, `mixRestitution`) uses
sqrt(muA*muB) and max(eA,eB). Its single Coulomb coefficient cannot represent
independent authored static/dynamic friction; unequal values reject execution
policy and remain intact for inspection. Mixed surfaces include frictionless
pair mu=0 and restitution inherited from the more elastic surface. Intended
production velocityThreshold=0 remains a C/D requirement, not a mutation here.
Native contacts alone do not certify rolling without slipping.

Circle, finite rectangle/static floor, and simple centred strictly convex CCW
3–8 vertex polygons are policy-eligible. All M1-02 geometric semantics are
retained. Constant world-space forces at rotating body-local points are
policy-eligible data for planned C/D integration, checked against every load
bound here, but remain unimplemented and execution-blocked. Student controls
only describe allowed initial mass/velocity/gravity; they grant no live-force
permissions or UI controls. Camera/vector view fields remain presentation-only
metadata, not additional solver requirements.

Every hinge/rod/rope/spring constraint is explicitly unsupported. Every nonempty
measurement request (including meter-only and graph-only requests) is rejected
until its sampling/display requirements are implemented and qualified. No body,
force, constraint or measurement is filtered out to salvage a partially executable
scene. Unknown fields/features are rejected by canonical validation first.

## Full-range calculation and diagnostics

Controls are resolved by case-insensitive stable UUID, using the existing allowed
parameter branches. M1-02 enforces correct references, dynamic targets, unique
parameters, initial defaults and legal intervals. B evaluates each full continuous
interval, regardless of step spacing. For x/y velocities and gravity it uses the
Euclidean norm of the largest absolute endpoint in each independent component.
This includes all joint corner combinations and zero crossings. Force/mass uses
the smallest allowed mass; torque/inertia uses that same mass. Pairwise mass
ratios use max(maxA/minB,maxB/minA) for distinct dynamic bodies. Conservative
acceleration uses worst gravity norm + sum(force norms)/minimumMass, without
assuming cancellation/alignment. It may over-reject, never relies on one nominal
value or sparse grid samples. No input value is clamped or normalized.

Reports traverse profile diagnostics, gravity, forces, bodies, body pairs,
constraints and measurements in fixed source-array order. Each issue has a stable
code, execution stage, error severity, actionable message/suggestion and RFC6901
pointer. Controlled range diagnostics point to the control or identify affected
ranges in their message; aggregate issues point to the affected body. Limit is
100 diagnostics (existing M1-02 budget), reserving the final slot for a truncation
marker. Internal rejection state does not depend on whether later issues fit in
the report. Initialization adds ADAPTER_NOT_IMPLEMENTED within that same budget.

## Mandatory future runtime validation (not implemented in B)

C/D must snapshot/copy and validate the complete bounded next-tick input batch
before any mutation: plain shape/allowed kind, resource bounds, integer tick and
sequence, duplicates/stale/future ticks, counter exhaustion, finite values, UUID
resolution to dynamic targets, session permissions and current-state force,
aggregate torque/acceleration/motion limits. orderTickInputs is a trusted typed
ordering helper and authorizes none of this. Missing/static bodies, malformed or
oversized input, denied live force and use after disposal must reject atomically,
leaving tick/time/state unchanged. A typed object or prior policy report is not
proof of validity. No live-force student control is exposed by B.

Recheck before substeps: gravity/forces and contacts can exceed an initial-state
bound later. Contact impulses can defeat a simple pre-step velocity estimate;
qualified C/D must detect/stop unexpected envelope violations before silent
native clamps affect exported results. A numerical failure must stop visibly,
not return a successful accurate snapshot. Actual cleanup, replay, cross-browser
behavior, Safari/iPad and long-run performance remain unexecuted future gates.
