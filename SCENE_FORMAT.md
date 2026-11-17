# Scene JSON v1 contract

Authoritative structure: [schemas/scene-v1.schema.json](schemas/scene-v1.schema.json). Example: [examples/falling-ball.scene.json](examples/falling-ball.scene.json). Schema is Draft 2020-12; the `baanphys.example` schema ID is a placeholder namespace, not a live endpoint. Importers use a bundled trusted schema and must never fetch a schema chosen by an imported document.

## Versioning and identity

`schemaVersion: 1` identifies this format. Any structural or semantic contract change requires a new integer version and an explicit migration; engine/adapter changes have their own versions and compatibility profiles. Reject unknown future versions. Do not mutate the original file during migration. No defaults are silently filled on v1 import: all required fields must be present, including empty arrays and locked-by-default student policy.

`identity.state=draft` has no persisted IDs; first Save creates a `saved` identity with simulationId, revisionId, revisionNumber, parentRevisionId and UTC timestamps. All entity IDs are UUIDs checked with format validation. A saved first revision has number 1 and null parent; later revisions have a distinct parent and increment within the repository. UUIDs in the example are illustrative. Importing a saved JSON does not grant ownership or prove that its revision exists in a repository.

## Field semantics

| Field | Meaning |
| --- | --- |
| `world.gravity` | Uniform acceleration in m/s², y up. No default air resistance. |
| `simulation` | Exact engine/adapter version and registered capability profile, logical timestep in seconds, substeps, solver iterations, sleeping=false and deterministic seed. One logical Step advances timestepSeconds; each internal update is timestepSeconds/substeps. |
| `bodies` | Unique IDs; circle, rectangle or convex polygon; COM position in metres, CCW radians, m/s and rad/s initial velocity. Uniform lamina mass or areal density is authoritative, never both. Inertia is derived, not engine-defaulted. |
| `material` | Dimensionless friction/staticFriction and restitution. `staticFriction` means physical static coefficient; adapter must map the engine's actual semantics or reject. Profile fixes and documents pair combination (including restitution). |
| `constraints` | Hinge joins anchors without locking rotation; rod enforces positive length; rope is unilateral maximum-length, tension only; spring uses positive rest length (m), springConstant (N/m), dampingCoefficient (N·s/m). `collideConnected` is explicit. Unsupported types reject, never degrade to another type. |
| `anchor` | World point in metres, or body UUID plus local metre offset from COM. At least one end must be a dynamic body. Fixed points are world anchors. Weld constraints/pulleys/gears/motors are not part of v1. |
| `forces` | Constant world-space N vector applied at a body-local point each substep. Application point moves/rotates with body; direction stays world-fixed. No expression strings or impulses hidden in forces. |
| `measurements` | Body observable, display mode, sampling every N logical ticks, bounded sample count. Acceleration is a declared finite difference of tick velocities, not arbitrary render interpolation. Energy is kinetic only in v1; potential/system energy definitions can be added deliberately later. |
| `studentPolicy.controls` | Explicit permitted initial parameter controls only. Empty means locked. Body mass controls require mass mode. World gravity and initial velocity controls are session-local. |
| `view` | Camera centre in SI and CSS pixels/metre; vector toggles. View values affect no physical result. Selection/tool/undo state is not serialized. |

There are no arbitrary script, HTML, URL, engine-options or plugin fields. `additionalProperties=false` is used throughout. Shape-specific branches reject irrelevant fields. Physical coordinates/numbers are bounded against gross resource abuse; schema bounds are not a promise that every such scene is numerically supported. Capabilities impose narrower tested envelopes.

## Required validation pipeline

1. Check UTF-8 input ≤2 MiB before parsing. Parse JSON with depth≤32 and reject duplicate object keys and nonstandard NaN/Infinity tokens; check all in-memory numbers are finite even when documents originate outside JSON text. Do not recursively merge unknown input into application objects.
2. Validate bundled JSON Schema with UUID/date-time format assertions enabled. Ensure timestamps are UTC (`Z`), savedAt≥createdAt. JSON Schema alone cannot certify references or physics.
3. Check globally unique body/constraint/force/measurement/control UUIDs; all references resolve with correct target types. Simulation and revision IDs must differ. Body-to-same-body constraints and two-world/static endpoints are invalid. Constant forces require dynamic targets.
4. Validate polygon simple/strictly convex CCW geometry, area>1e-10 m², edges>1e-6 m, and centroid within 1e-8 m of local origin. Dynamic shape dimensions/derived mass/inertia must be positive and finite. Reject static-body nonzero velocities. Reject staticFriction<friction for this physical material contract. Validate initial overlaps for benchmark fixtures; authoring may allow nonfatal overlap warnings separately.
5. Check saved identity: number=1 iff parent=null; no parent equal to self; repository validates parent existence, same simulation, sequence and expected head. File validation cannot establish those facts. No duplicate revision UUID with different content.
6. Controls: finite min<max, step>0 and step≤max-min, initial value in range, no duplicate target/property pair; positive mass range within schema mass bounds, dynamic body target, mass mode for mass controls. Gravity/velocity ranges must satisfy capability limits over the whole allowed range. Schema numeric fields alone do not enforce cross-field comparisons.
7. Resolve an installed trusted exact engine/adapter/profile. Verify geometry scale, speed, mass ratio, material mapping, constraints, sample budgets and student ranges against its certified capabilities. All forces/constraints must be implemented; reject unknown/unqualified profiles for production playback. Unsupported scenes may be opened for inspection without constructing/running an engine, with visible diagnostics.
8. Only then construct the runtime or persist an accepted revision. Report failures by JSON pointer and stable error code; no partial save or partial simulation construction.

## Migration and round-trip policy

Pure ordered migrations produce a new validated document and diagnostics. Keep the source revision untouched and save migrated content as a new revision after explicit editor action. Older engine behavior cannot be promised under a new engine; preserve supported old profile runtime or show an incompatibility message. A schema migration never silently substitutes an engine.

Round-tripping preserves physical initial values and IDs when exporting/reloading an existing revision; import-as-copy deliberately remaps identity/references. Canonical key ordering may be used for content comparison, but never hash raw formatting to identify physics equality. Runtime frames/contacts and student overrides are not authored scene exports. The sample intentionally names an unqualified profile and is structurally valid but must be blocked for production execution until qualification.
