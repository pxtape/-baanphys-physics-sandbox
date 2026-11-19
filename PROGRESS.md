# Progress

Updated: 2026-11-19.

## Current state

**M1-02 ACCEPTED AND MERGED.** PR #1 merged as 00fe21a5df232d9bde879323baebdc9be00edf89 after exact-head review of dfdaa65f45c20a877bb49d4ed5f2a5396866727c. Main CI/Pages passed. M1-03A is ACCEPTED and merged (PR #2, 15a8f48); B capability policy is ACCEPTED and merged (PR #3, 1250efd); C is ACCEPTED and merged (PR #4, 68d856e); D is ACCEPTED and merged (PR #5, e3fa893); E is authorized for implementation on a separate feature branch. Historical records below describe their original checkpoints.

- Repository: https://github.com/pxtape/-baanphys-physics-sandbox
- Live foundation preview: https://pxtape.github.io/-baanphys-physics-sandbox/
- Successful first main deployment: https://github.com/pxtape/-baanphys-physics-sandbox/actions/runs/44270951839

## M1-02 implemented — 2026-11-19

- Kept Scene v1 schema/example byte-for-byte unchanged. Added schema-generated TypeScript types and a single deep-readonly SceneDocument projection in domain; no alternate runtime representation, UI state or native-engine handles.
- Added precompiled Draft 2020-12 validation with UUID/full date-time assertions, no coercion/default filling/field removal. A trusted development-only generator emits types/static ESM; check:generated runs before typecheck/build to reject drift. Runtime imports no Ajv compiler and cannot resolve input-selected schemas or URLs.
- Added bounded JSON parsing (2 MiB UTF-8, depth 32, decoded duplicate keys), safe object snapshotting, canonical collection limits, finite-number checks and bounded structured diagnostics with JSON pointers and fixes. No rejected result contains a partial scene.
- Added global UUID uniqueness and body references; constraint/force/control target rules; static velocity/material ordering; finite positive lamina properties; simple/CCW/strict-convex polygon area/edge/centroid checks; control ranges/defaults/mass mode; revision metadata and exact UTC timestamp ordering.
- Successful data is detached from caller objects and deeply frozen, preserving IDs/settings/values. executionReady remains false until M1-03 trusted profile qualification; saved metadata warns that M1-07 must verify ownership/lineage/expected head.
- Ran clean npm ci, generated consistency/typecheck, lint, 137 Vitest tests, existing 25 M0 fixtures, existing 13 PoC verification tests production build and Pages artifact/path/refresh smoke check successfully. Validation tests include no-compilation CSP-style execution and a complete browser-target bundle smoke test. No numerical benchmark was rerun or threshold weakened.
- Added domain/schema modules, generated artifacts, validation/browser-bundle tests and codegen tool; updated package/lockfile, generated-code lint exclusion, README, src/README, src/schema/README, M1_TASKS and this progress record. Canonical schema, existing fixtures/tests, UI, workflow, Vite base, physics/benchmark sources and approved timing are unchanged.

There is no visual feature to test in this task: the app and published foundation
page remain unchanged. A browser-target ESM validation bundle was built and run,
but real Safari/iPad was not tested. Engine profiles/envelopes and repository
history checks remain later-task risks, not falsely certified capabilities.
M1-02 is committed/pushed for PR review; see the completion report/Git history for
its exact SHA and PR URL. No main push, merge or Pages deployment is authorized
by this task. Stop before M1-03.

## M1-01.5 completed — 2026-11-19

- Found the owner-created repository by public search: its name starts with a
  hyphen. It was empty, public and already configured for workflow Pages. The
  integration cannot rename it (HTTP 403), so its existing name was retained.
- Preserved M0 65dfde9, M0.5 f1f5ad0 and M1-01 97d0fa8. Added deployment commit
  268e98d on chore/m1-01-5-pages, ran successful remote development checks, then
  fast-forwarded main and pushed without force. Origin and both branches exist.
- Added .github/workflows/deploy.yml with Node 24, npm ci, typecheck, lint,
  23 application boundary tests, 25 M0 schema fixtures, 13 PoC verification cases,
  production build and real built-artifact Pages smoke check. Only successful
  main runs upload/deploy dist; feature/PR runs check only. Official actions are
  SHA-pinned; deploy-only permissions use GitHub Pages/OIDC, not personal secrets.
- Vite base and smoke check match /-baanphys-physics-sandbox/. Package name,
  engine choice, 1/120 s logical tick and four 1/480 s substeps are unchanged.
- Local checks passed, development run 44269819955 succeeded, and main run
  44270951839 completed checks and Pages deployment successfully for 268e98d.
- Live verification: index and refreshed index returned 200 text/html (627 bytes),
  JS 200 application/javascript (220668 bytes), CSS 200 text/css (1709 bytes).
  Shared Chrome displayed the React page and stylesheet before and after reload.
- README, DEPLOYMENT.md, ROADMAP.md and M1_TASKS.md now record actual URLs,
  completed status and verification. Earlier missing-repository permissions are
  resolved by owner creation/access. No remote/history replacement, secret
  commit, force-push, M1-02 feature or physics-threshold change occurred.

The public link can be opened without local services or sign-in. Actual iPad/
Safari testing has not been performed. The website is still the foundation page;
scene creation, validation, editing and physics controls are not implemented.
Future player deep-link refresh requires an explicit Pages routing decision.

## M1-01 completed — 2026-11-17

- React 19.3.1 + TypeScript 5.9.3 strict + Vite 8.3.8 root application, with a minimal honest foundation page. Planck 1.5.1 is pinned but not imported or constructed by the app.
- Exact dependency versions, root lockfile, Node 24+ requirement, `.nvmrc`, reproducible npm scripts and `.npmrc` save-exact policy.
- Reserved domain/schema/physics/adapter/renderer/editor/measurements/persistence/player/integration modules. No speculative scene model or production adapter was introduced.
- Automated ESLint import rules and 23 boundary tests: reject Planck/type leaks, PoC dependencies, runtime/UI imports in the domain/schema, renderer coupling and player writes. Five intended import paths also pass.
- Ran clean offline lockfile install, typecheck, lint, 23 Vitest checks and production build successfully. Reran 25 M0 structural fixtures and 13 PoC verification tests successfully. No previous test was removed or weakened; no benchmark trajectory or threshold was changed.
- Opened the dev application in shared Chrome, inspected the rendered page and reloaded it successfully. Started the production preview and checked its HTML/asset responses. Browser preview is smoke evidence only, not Safari/iPad certification.
- Added root README with exact run/check/manual-review commands; updated M1_TASKS status. The approved future physics profile remains logical 1/120 s, 4 substeps (1/480 s), 12/12 Planck iterations and zero restitution threshold; this task does not activate it.

Scene values/IDs, scene validation, SI/screen transforms and engine stepping are not implemented yet. No scene mutations or ID generation exist in this task. Those requirements remain with M1-02 through M1-05 rather than being bypassed by a temporary model.

## Changed files for M1-01

- App/tooling: `package.json`, `package-lock.json`, `.npmrc`, `.nvmrc`, `tsconfig.json`, `vite.config.ts`, `eslint.config.mjs`, `index.html`, `.gitignore`.
- Application: `src/main.tsx`, `src/app/App.tsx`, `src/app/styles.css`, `src/README.md` and `.gitkeep` files reserving the ten architecture directories (including physics/adapters).
- Verification: `tooling/architecture-rule.mjs`, `tests/tooling/architecture.test.ts`.
- Documentation: `README.md`, `M1_TASKS.md`, `PROGRESS.md`.

Historical M1-01 scope: M0/M0.5 baseline commits and architecture decisions are retained. The existing scene schema/example, AGENTS.md, PoC sources/lockfile/results, BENCHMARKS.md and DECISIONS.md are unchanged. No remote was added and nothing was pushed/deployed.

## Completed M0.5 (historical record)

- Preserved all supplied M0 documents/schema/example/checks in Git baseline `65dfde9` (`docs: preserve M0 planning baseline`).
- Initialized a working `main` repository. Checked remotes before setup and after initialization: none configured. Retained existing author identity; no external repository created, remote invented or push attempted.
- Installed exact Matter.js 0.20.0 and Planck.js 1.5.1 only in `poc/engine-comparison`, with npm lockfile and ignore rules for dependencies/environment files.
- Ran 93 numerical comparison configurations (59 PASS, 34 FAIL) and recorded 3 explicitly unsupported/unexecuted Matter rope entries. Cases cover all eight requested topics plus point pendulum, damped spring, bilateral length and mass supplements, over three fixed timesteps.
- Saved raw CSV trajectories, metric/reference/error/tolerance/status JSON, machine/settings metadata and SHA-256 provenance. Ran 21 fresh-engine replay comparisons and 2 CPU-only 100-body/100-rod load probes.
- Ran 4 additional low-speed-elasticity/thin-floor boundary probes. Planck passes both with the selected restitution-threshold policy; Matter fails both.
- Ran 13 reference/conversion/force/inertia/replay/provenance/basic-gate verification tests and reran 25 M0 schema fixtures; all passed. Comparison failures remain failures and are visible in BENCHMARKS.md.
- Selected Planck.js for the future production adapter; documented profile, physical material limitations, engine tradeoffs and capability restrictions in DECISIONS.md and ENGINE_FEASIBILITY.md. Added M1 tasks/acceptance criteria.

## Not completed or claimed

No actual Safari/iPad compatibility/performance measurement, cross-browser replay or repository/embedding integration tests exist. M1-02 domain/schema/semantic validation is implemented on the review branch only; production physics and repository qualification remain deferred. M1-01 now has a typechecked/built foundation application and a shared-Chrome launch/reload smoke check only. Rolling fails the executed common-friction feasibility variant; the original distinct-static/dynamic B6 case is not certified. Atwood, pulley/gear/motor behavior, slack-to-taut rope impacts, contact-force instrumentation and long-run stress qualification are not tested.

## Git and deployment artifacts

Original baseline commits are preserved. Production source is on stable main;
the deployment development branch remains separate. Remote origin points to the
owner-created public repository. Deployment files: .github/workflows/deploy.yml,
vite.config.ts base, package.json smoke-test command, tooling/verify-pages.mjs,
and README/DEPLOYMENT/ROADMAP/M1_TASKS/PROGRESS documentation. All original physics,
schema and architecture tests/reports are intact.

## Next action

Review the M1-02 pull request and acceptance evidence. Do not merge it or begin
M1-03 without separate approval. The published foundation preview and main are
stable. Remaining work includes trusted engine/profile/range qualification,
repository lineage/ownership, UI/file flows and actual Safari/iPad validation.


## M1-02 timestamp blocker resolution — 2026-11-19

Final review of PR #1 at 383e090 found that tab-separated createdAt could bypass
savedAt ordering. Fixed only UTC ordering: parse numeric calendar components,
ignore the validated single separator, and compare exact decimal fraction digits.
Canonical schema/generated artifacts and accepted formats are unchanged; no Date
rounding, data rewriting, physics settings or threshold changes. Repository-wide
search found no other production timestamp comparisons.

Added 58 regression cases: exact reproduction, all 27 accepted separators against
each other (729 pairs, forward/reverse/equivalent instants), equal timestamps,
unequal-length/sub-millisecond fractions, day/leap-day/year/year-0000 boundaries,
accepted leap seconds, invalid calendar/time/separator/zone cases and unchanged
uppercase-Z requirement. Each case exercises both public validation entry points
and checks authored timestamp preservation. Compatibility details are recorded
in src/schema/README.md.

Verification: targeted 58-case suite, full 195-test suite, generated consistency
and typecheck, lint, 25 M0 fixtures/schema checks, 13 existing PoC verification
tests and production build passed on Node 24.22.1. PoC verification reruns adapter probes/replay and checks archived
evidence; no new benchmark qualification or changed tolerances is claimed.

Blocker fix is submitted for review on feat/m1-02-domain-validation / PR #1;
final acceptance remains pending review of the new commit. No merge, deployment
or M1-03 implementation. Historical completion counts above describe the original
383e090 submission. Remaining risks: pinned format-library compatibility (including
permissive leap-second dates), future repository lineage checks and untested real
Safari/iPad behavior. All successful documents still have executionReady=false.


## M1-02 final acceptance — 2026-11-19

All mandatory criteria PASS; no unresolved critical/major findings identified.
Exact PR head dfdaa65f45c20a877bb49d4ed5f2a5396866727c had successful push run
44498428228 and PR run 44498437777; no review threads existed. Re-ran typecheck /
generated consistency, lint, all 195 tests (including 58 timestamp regressions),
25 M0 fixtures, 13 PoC verification tests and production build successfully.
Scene v1 schema is byte-identical to the prior main; format dependency, generator
and generated validator are unchanged by the fix. Resource/reference/geometry,
immutable authored state and executionReady=false tests remain passing.

PR #1 merged normally, preserving history, as
00fe21a5df232d9bde879323baebdc9be00edf89. Main run 44499277414 passed checks and
Pages deployment for that exact merge SHA. Public project index, JavaScript and
CSS returned HTTP 200 with correct MIME types; JS/CSS matched local build bytes;
reloading the public index returned identical HTML. This is an HTTP/artifact smoke
check, not a new visual Safari/iPad qualification. Documentation follow-up
commits have their own deployment records in Actions; the verified code merge
SHA above is retained as the acceptance evidence.

Leap-second limitation: pinned ajv-formats permits second 60 at 23:59 on dates
without checking a historical leap-second table. Ordering preserves those accepted
representations, exact decimal fractions, and all single T/t/ECMAScript-whitespace
separators. No schema/accepted-format restriction or migration was introduced.

M1-03_PLAN.md decomposes the existing adapter task and records physics references,
unchanged numerical gates, supported-envelope risks and exit criteria. No M1-03
production code was implemented. Await user approval before starting it.


## M1-03A adapter contracts — 2026-11-19 (task branch only)

Branched from latest main e2674ece96113cea73e0eaea6a4bd081802033fc; accepted
M1-02 and its timestamp regression remain present. Added engine-independent
interfaces for initialization, logical-tick stepping, disposal, immutable SI
snapshots and trusted ordered tick inputs. Existing SceneDocument is reused.
Defined structured execution diagnostics and exact Planck 1.5.1 / adapter 1.0.0 /
planck-1.5.1-si-v1 identity. Profile/settings mismatch diagnostics never yield a
runtime. Even matching profiles remain unqualified and initialize fails explicitly.

Added 29 tests covering profile/version/settings rejection, no partial runtime,
readonly authored and snapshot types, native-free declaration dependency closure,
ordering permutations/duplicates/invalid ticks/finite values and detached frozen
batches. Full 224 tests, generated consistency/typecheck, lint, 25 M0 fixtures,
13 existing PoC verification tests and build pass. No existing tests were changed.
No UI/browser test was needed: foundation assets remain unchanged. No numerical
adapter qualification or Safari/iPad test is claimed.

Changed src/physics/{contracts.ts,profile.ts,tick-inputs.ts,index.ts,
contracts.test.ts,README.md}, M1_TASKS.md and this file. Schema, benchmarks,
profile numerical settings, existing validation and main/Pages are unchanged.

Remaining: capability geometry/material/student-range checks (recommended next
M1-03B), actual construction, lifecycle execution tests, fixed solver and
production numerical qualification. Inputs here are trusted typed data; future
runtime must check dynamic targets/envelopes before applying them. No runtime
or native object exists yet. Stop after PR submission for acceptance; do not
merge, deploy or implement M1-03B–E without approval.


## M1-03A final acceptance and B preparation — 2026-11-19

Independent final review at exact PR #2 head
33cfb2ea0f424716bde34feb2b265d48c9f24748 found no critical/major blocker.
PR head matched, no review threads, required Checks and build run 44503465766
passed every required step; PR deployment was correctly skipped. Local generated
consistency/typecheck, lint, 224 tests, 25 M0 fixtures, 13 existing PoC verification
tests and build passed again. Existing architecture test emits a non-failing
TSImportType argument deprecation warning; no test or rule was weakened.

Normal merge SHA: 15a8f480e47e30997b714a0b88dca6ebdc30cf62.
Main checks and Pages deployment run 44503938253 passed at that exact SHA.
The Pages deployment API confirmed that deployed SHA. Public index/JS/CSS
returned HTTP 200 with correct MIME types, code assets matched local build,
and repeat index fetch/refresh was identical. This is an HTTP/artifact smoke
check, not a new browser or Safari/iPad qualification. Documentation follow-up
commits have separate Actions/deployment history; retain this merge evidence.

Contracts are implementable without variable-step input or native handle exposure.
All construction currently rejects; future initialization must validate first and
clean up failures. orderTickInputs only orders trusted typed inputs: dynamic body
references, permissions, aggregate force/torque and current-state safety checks
are mandatory at the future runtime boundary before any mutation. Profile identity
and approved numerical settings remain exact; executionReady is still false.
Canonical Scene v1, benchmark sources/results/thresholds and dependencies unchanged.

Added M1-03B_PLAN.md for approval only: geometry, equal-friction materials,
evidence-based numerical bounds, entire interacting student ranges, unsupported
features, structured bounded diagnostics and all-or-nothing qualification. It
lists boundary/negative/isolation tests, expected affected files and explicit
acceptance. Policy success alone cannot certify execution before C/D/E evidence.
No B production code was implemented. Stop and await user approval.


## M1-03B capability-policy review submission — 2026-11-19

Started feat/m1-03b-capability-validation from latest accepted main
61f78a0743a95668a3b6052e865d632cfb87a438. Pure, native-free checks reuse canonical
SceneDocument and M1-02 bounded structural/semantic validation on a detached copy.
Exact Planck 1.5.1 / adapter 1.0.0 / profile/settings are retained. New explicit
policyCompatible is separate from profileCompatible; executionReady remains false.
The facade delegates to the full policy and always rejects initialization without
partial native construction. No world/fixtures/solver/UI are implemented.

Checks include circle/rectangle/static floors, centred simple strict-convex CCW
3–8 vertex polygons, equal authored friction, initial occupied extent, mass/density
and lamina inertia bounds, vector norms, summed force/torque, conservative linear
and angular acceleration, initial prospective native clamp ceilings and pairwise
dynamic mass ratios. Entire simultaneous mass/velocity/gravity control intervals
are evaluated, including cross-body combinations and worst mass/inertia.
All constraints and requested measurements reject policy. Constant-force data is
policy-eligible for planned C/D, still unimplemented/execution-blocked. Diagnostics
are deterministic, actionable JSON pointers capped at 100 with truncation.

All continuous envelope bounds are labelled provisional, not inferred accuracy
certificates. Sources/native constants/mixing semantics and limitations are in
src/physics/CAPABILITY_LIMITS.md. Contact impulses, long-run state, permissions,
resource-bounded dynamic input snapshots and aggregate pre-substep checks remain
future C/D obligations; no live-force controls are exposed.

Verification: 46 new capability tests plus all 224 existing tests pass (270 total),
generated consistency/typecheck, lint, 25 M0 fixtures, 13 existing PoC verification
tests and production build pass. Existing TSImportType deprecation warning remains
non-failing. No tests/thresholds/schema/dependencies/PoC sources were changed.
Tests cover shape and material boundaries, norms/forces/torque, mass ratios,
interacting ranges, all four constraints, requested measurements, mixed failures,
bounded deterministic diagnostics, immutability and no partial runtime.

Changed files are the capability checker/tests/limits documentation/constants,
separate contract facade, narrow diagnostic/result exports, profile gate wording,
physics README, M1_TASKS.md and this record. Main/Pages remain unchanged. Await
acceptance before any merge or C/D/E work; runtime and numerical qualification,
real Safari/iPad and long-duration stress remain unexecuted risks.


## M1-03B independent final acceptance — 2026-11-19

Reviewed exact PR #3 head 95cbd750e88e9020f9b4654f50f88cce8db150e1 against every
M1-03B_PLAN.md criterion. Exact-head push/PR runs 44505942005/44505952936 passed;
no unresolved review threads. Findings: zero CRITICAL, zero MAJOR. One MINOR
maintenance warning exists in prior architecture tooling (deprecated TSImportType
argument access); it is non-failing and unrelated to policy correctness.

Verified geometry/material/unsupported-feature gates; continuous independent
control extrema and interacting gravity/mass/velocity/ratio bounds; conservative
force and torque sums; finite-value checks; immutable source/IDs; deterministic
bounded diagnostics independent of rejection state. The checker revalidates a
fresh snapshot on every call, never trusts an old report and never constructs
native objects. profileCompatible and policyCompatible do not imply execution;
executionReady stays false. Existing numerical limits are provisional restrictions,
not continuous accuracy certificates, exactly as documented.

Re-ran typecheck/generated sync, lint, 270 automated tests, 25 M0 fixtures, 13
PoC verification tests and production build successfully. Also executed a temporary
Vite browser-target bundle harness with 14 adversarial probes: extreme continuous
ranges; derived inertia underflow; NaN/Infinity; all measurement display modes;
opposing forces with reinforcing torque; unknown feature key; stale immutable
report after edit; accessor without invocation; cycle; and diagnostic saturation.
All rejected safely as expected. No confirmed issue required new regression tests
or production edits. These probes execute bundled JS in Node, not a browser/device.

PR #3 merged normally as 1250efd7dc90fac6d33289254df3004a98090ebb.
Main CI and Pages run 44506580035 passed and deployment API confirmed the same
SHA. Public index, JS and CSS returned HTTP 200/correct MIME; assets matched
local build and repeat index fetch/refresh was identical. No new browser/Safari/
iPad qualification. Documentation follow-ups have separate deployment records;
retain the code merge SHA above as acceptance provenance.

Added M1-03C_PLAN.md: explicit uniform-lamina mass/inertia, private native world/
fixture construction, stable UUID order, SI initial-state mapping, explicit native
mass/density/COM handling, source isolation, geometry verification and transactional
cleanup. Public execution remains blocked until D/E; C tests must not masquerade
as trajectory qualification. No C/D/E code was implemented. Await approval.


## M1-03C SI properties/private construction — 2026-11-19

Branched from latest main b55c086dc73e3800f1080ef33eed3b02f5b8df2a. Added pure
physicalProperties for disk/rectangle/centred convex polygon, explicit mass and
areal density; existing geometry formulas now expose their already-calculated
centroid without changing numerical tolerances or Scene v1. Native construction
is confined to physics/adapters and omitted from public barrel/facade.

Harness revalidates detached complete scene and B policy before allocation,
precomputes properties, verifies native settings and constructs canonical lowercase
UUID order. Fixture density/material explicit; dynamic MassData sets physical
mass, COM inertia and local centre zero; final initial velocities assigned after
mass changes. Static inverse mass/inertia remain zero. Native vertices must match
source exactly up to cyclic order; mismatch rejects and cleans up. Temporary-world
failure never publishes a session. Session exposes only frozen detached tick-zero
SI snapshots and idempotent disposal; use after disposal fails.

Executed analytical tests in both mass/density modes: disk r=.2,m=1,I=.02,
measured .020000000000000004 (error 3.469446951953614e-18); rectangle 2×1,m=2
and identical polygon I=5/6 (error 0); centred triangle area=3,m=3,I=2 (error 0).
All area/mass errors 0. Evidence/command: src/physics/adapters/CONSTRUCTION.md.
No tolerance was widened; boundary comparisons use 1e-12 scaled, centroid 1e-8 m.

22 new tests cover shapes/mass models, native fixture data and static inverse
quantities, initial velocities/transforms, negative/rotated positions, centroid
residual, boundaries, immutable/frozen source, actual native creation order,
isolation, first/middle/final body/fixture/mass injection, world/native failure,
native geometry corruption, preflight rejection and disposal. All 292 tests,
typecheck/generated sync, lint, 25 M0 fixtures, 13 PoC verification tests and build
pass. Existing architecture deprecation warning remains non-failing. No UI/browser
change; no Safari/iPad, stepping/replay or production trajectory qualification.

Source inspection corrected prior documentation: native Planck 1.5.1 supports
12 polygon vertices, but BaanPhys approved policy remains 3–8. Native setting
verification uses 12; no policy/schema/numerical setting/threshold expansion.
Architecture and capability notes now distinguish native and approved limits.

Main/Pages unchanged; no public execution enabled. Global settings are shared
within the native module and must not be modified by other consumers; future
fixture changes reset mass and require revalidation/reassignment. C/D/E still
need current-state guards, fixed stepping and numerical qualification. Do not
merge/deploy or start M1-03D until this task is reviewed/accepted.


## M1-03C settings blocker resolution — 2026-11-19

Integrated the previously uncommitted settings-review.test.ts reproduction.
Root cause: only pre-allocation global validation and vertex-only polygon audit.
Added one read-only settings guard covering all 22 native Settings values and 27
SettingsInternal accessors, reused at world/body/fixture/mass/pre-publication
checkpoints and after final fixture auditing. Polygon skin/radius is checked in
addition to source vertices; every completed fixture is audited before publication.
Mismatch rejects with NATIVE_SETTINGS_MISMATCH and cleans all temporary bodies,
without restoring globals or leaking a partial session. Existing worlds retain
their bodies/snapshots; native settings are still shared module state.

80 targeted regression cases pass: exact linearSlop drift, every native/internal
mismatch before allocation, each native mismatch before publication, all stage
checkpoints, local polygon-skin corruption with identical vertices, final audit,
source preservation and independent-session cleanup. All 372 automated tests,
generated consistency/typecheck, lint, 25 M0 fixtures, 13 PoC verification tests
and build pass. Existing numerical/property checks remain unchanged. Detailed
settings manifest/ownership and future M1-03D fail-closed stepping obligations:
src/physics/adapters/CONSTRUCTION.md. Test teardown alone restores injected drift.

Fix submitted on the existing PR #4 branch; final acceptance remains pending.
No merge, deployment, schema/threshold/settings change or M1-03D implementation.


## M1-03C final independent acceptance — 2026-11-19

Reviewed exact PR #4 head a57e1a072fe14ea467aff6d6344734abcde791de. Required
push/PR runs 44512430119/44512438037 passed; no unresolved review threads. No
CRITICAL/MAJOR findings remain. The only MINOR maintenance warning is the existing
non-failing TSImportType argument deprecation in architecture tooling.

Mandatory C checks PASS: original linearSlop reproduction now rejects; complete
22 native/27 derived settings guard; pre-allocation and construction/publication
checks; vertex/skin preservation; no partial session; atomic cleanup and prior
session preservation; no production settings restoration; immutable source/stable
IDs/frozen detached SI snapshots; public executionReady=false. Explicit mass and
COM inertia/native setup remain at the unchanged analytical tolerances.

Executed typecheck/generated sync, lint, all 372 automated tests (including the
80 settings regressions), 25 M0 fixtures, 13 PoC verification tests and build.
Also ran 5 temporary adapter-local adversarial probes with all passing: drift
inside final fixture audit, derived SettingsInternal inconsistency there, settings
drift during cleanup and rejection on repeated construction, circle radius change
without vertices, and post-construction global interference/snapshot isolation/
use-after-disposal. Temporary probe source preserved in /tmp for this environment;
not counted as a committed regression suite. No remaining defect needed a fix.

Post-construction shared settings changes can affect future simulation but do not
alter the private tick-zero snapshot data observed in C; D must guard actual
stepping and reject untrustworthy frames. Checkpoints are not isolation against
hostile transient mutation between observations. This documented D risk does not
permit public execution in C. Failed cleanup-path construction still rejects,
leaves foreign globals untouched and does not destroy prior world bodies.

PR #4 normal merge SHA: 68d856ed99506890b3903301980607be3636b01e.
Main CI and Pages run 44513487864 succeeded at that SHA; deployment API confirmed
it. Public HTML/JS/CSS returned 200/correct MIME, assets matched local build and
repeat index refresh was identical. No visual/device qualification was claimed.
Documentation follow-up commits have separate CI/deployed SHA records in Actions;
retain the reviewed-code merge evidence above.

Created M1-03D_PLAN.md only: exact four-substep stepping/12-12 mapping, persistent
and off-centre forces, strict bounded atomic input validation/permissions,
snapshots/time, settings/envelope guards, terminal numerical failures, disposal,
world isolation and deterministic replay. Policy/input rejection leaves a usable
unchanged run; unsafe native mutation requires terminal failure and fresh-world
recovery. No D/E implementation, schema/settings/threshold/benchmark change.
Stop for approval before implementing D.


## M1-03D fixed stepping and forces — 2026-11-19 (task branch)

Started from latest accepted main 0918bf672b15e6d6e259200727bd1452538bc896.
Extended private construction with an internal step/snapshot/dispose runtime;
public initialization and executionReady remain blocked. Exactly four h=1/480
native calls with velocity/position iterations 12/12 per dt=1/120 tick. Gravity,
saved world-fixed Newton forces and rotating local application points are applied
with correct torque and substep force persistence. Stable UUID/sequence ordering,
authored immutability and detached frozen snapshots/time are preserved.

Added strict plain-data batch validation: <=200 inputs, existing 2 MiB/depth32
budgets, exact field/kind/vector types, no getters/cycles/host objects/unknown
fields/nonfinite data, exact next safe-integer tick, unique sequences, dynamic
UUID resolution and trusted default-deny permission. Copied/frozen loads combine
with saved loads for current-state force/torque/acceleration/motion envelope checks.
Invalid batches never mutate native state/tick/forces and keep the run usable.

Settings/world/geometry/mass/material/type and finite/motion checks surround native
force and step boundaries and snapshot publication. Native exceptions or unsafe
state are terminal; no fake rollback, successful partial frame or time increment.
Old snapshots remain immutable. Cleanup destroys unlocked bodies; for a native
exception leaving World locked, private references are released for GC without
spinning, unlocking to resume, leaking handles or changing another world's state.
Native cleanup exceptions are contained and all ownership references detached.
Shared Settings cannot be isolated per world; foreign drift is not repaired.

Production runtime smoke (1 s, independent references): gravity y=15.084781250000004,
vy=-9.809999999999963; 4 N/2 kg x=1.002083333333331,vx=1.9999999999999942;
tick-oriented 1 Nm couple omega=1.1999956309556095,angle=.6012489133781379.
Position/angle errors ~.2083%, below unchanged 1% preliminary gates. Couple force
directions update once per logical tick, not per substep; saved constant-world
couple separately follows an independent nonlinear ODE reference. Fresh engines
with 120 ordered force-input ticks agree with max absolute SI error 0 (<=1e-10).
This is not M1-03E full production benchmark qualification.

Verification: 50 new runtime/input/lifecycle tests plus 372 existing tests (422)
pass; generated consistency/typecheck, lint, 25 M0 fixtures, 13 PoC verification
tests and production build pass. Existing architecture warning remains non-failing.
Exact commands/results and all limitations: src/physics/adapters/RUNTIME.md.
No schema, benchmark source/result/threshold, dependency or approved setting change.
Main/Pages unchanged; no UI/editor/persistence, scheduler, mechanisms or E work.
Stop for final review before merge/deployment or further milestone implementation.


## M1-03D independent acceptance and merge — 2026-11-19

User acceptance: PASS with zero blocking issues, recorded in PR review
5974545626 (COMMENTED; connected owner cannot formally approve own PR):
https://github.com/pxtape/-baanphys-physics-sandbox/pull/5#pullrequestreview-5974545626
Verified exact head 9f6aa64e82d1c4f5ffb7166fc8f48caf9d4b8bfb and successful
Actions run 44519082926. PR #5 merged normally without force as
e3fa893cc9447b07ce39c046ddd4338f84e9f4f2. Post-merge main checks and Pages run
44519698017 succeeded at that exact SHA; deployment API confirmed it. Public
HTML/JS/CSS and repeat refresh returned 200 with correct MIME and built asset
bytes. No actual Safari/iPad test is implied by that HTTP smoke verification.

M1-03E implementation is now explicitly authorized separately. Public
executionReady remains false and public initialization remains blocked pending
independent E acceptance. No UI/editor/persistence/scheduler feature is authorized.

## MVP-first teacher vertical slice — 2026-11-19

Built from accepted main cc8b9ac on feat/teacher-editor-mvp. Working responsive SVG
editor: circles/rectangles/static floors; selection and mouse/touch/keyboard
positioning; validated immutable Scene v1 edits; geometry, mass, gravity and initial
velocity; fixed-step Play/Pause/Reset/Step, live positions/velocities and time.

Experimental teacher preview is explicit opt-in, development/teacher-build only;
default production builds disable it, and student/iframe surfaces block execution.
It uses the internal D runtime with unchanged 1/120, four 1/480 substeps and 12/12.
Conservative swept bounds stop BEFORE possible contact (including polygon skin).
No spin, applied forces, mechanisms or student controls; five-second limit.
No numerical qualification or authenticated role enforcement is claimed.
Public executionReady stays false; source scene never becomes preview state.

Verification: 432 tests pass (422 accepted regressions +10 integration tests),
typecheck/generated consistency, lint, 25 M0 fixtures, 13 PoC verification, build
and Pages smoke pass. Chromium browser checks cover the full editing/playback
flow, contact stop, immutable reset/IDs, default-build disablement, student/iframe
lockout and tablet touch emulation. Screenshots: docs/preview/. Real Safari/iPad
is not tested. Existing non-failing architecture-tool deprecation and build chunk
size warnings remain. Drafts are memory-only; no save/undo/embed implementation.

No E work was deleted or accepted: draft PR #6 remains at 1256487 with its failing
assertions/evidence. In-progress collision diagnostics are preserved separately at
e91732815ffa0946c720a8d47baa93e2a1e379c7 on local branch
investigation/m1-03e-collision-diagnostics. MVP branch includes all accepted tests;
it neither removes nor converts E qualification failures into passes.
Submit one feature PR; do not merge or deploy automatically.

## Core-physics priority: experimental collisions — 2026-11-19

Feature branch from accepted main, excluding the separate Save/Load PR. Teacher
UI now defaults to explicit uncertified collision mode: real native body/floor
contacts, friction/restitution, visible spin and existing size/angle editing.
Added body-collision/sliding examples; free-flight mode and its original contact
stop remain available. Collision runs are bounded to 30 s. Certified/public
initialization stays blocked; default public build execution stays disabled.
No engine settings, Scene v1, thresholds or qualification failures were changed.
Three focused functional solver regressions and a browser walkthrough cover
rebound, body exchange and friction. These are not numerical qualification.
No forces/joints/ropes, Save/Load, auth, cloud or embed implementation is included.
Verification: typecheck/generated consistency, lint, all 435 tests (432 existing
plus 3 focused contact regressions), 25 M0 fixtures, 13 existing PoC checks,
build and Pages smoke pass. Chromium verified visible bounce, body collisions,
sliding, material/size/spin edits and unchanged authored state. Original free-flight,
editing/touch and default-production lockout browser checks also passed.
No Safari/iPad hardware or numerical certification is claimed. Screenshot:
docs/preview/experimental-collisions.png. Submit one PR; no merge/deployment.

Continuous delivery: PR #9 merged as 118d8baf13b8960df7fb1a0ce4956e7be7a47985;
main run 44589820342 and Pages passed. Live collision editor verified; public
playback remains disabled. Next: teacher force vectors/local anchors, visible
applied torque, world-force couples and a force/torque example. Existing native
force stepping is reused without changing profile/settings or qualification.

Forces PR #10 merged as ee4cea50d3cbbaffa809dc7cde1928ef6c6d6013; main/Pages
run 44591225846 passed and live force controls were verified with playback disabled.
Experimental hinges/rigid rods/unilateral ropes now use native joints in a separate
teacher-only construction path. Certified policy/construction still reject them.
Joint anchors render from solver snapshots; authoring moves world pivots coherently.
442 tests and essential checks pass, including native slack-rope behavior and
construction cleanup. Browser verified hinge swing, slack indication and pivot edits.
Pulley is not approximated: Scene v1 has no pulley contract. No qualification claim.

Mechanisms PR #11 merged as 66104ff8ad9d17e5f21f12585477be6c3e8becc4; main/Pages
44594090292 passed and live rope authoring was verified with public execution off.
Editing now has grouped-drag Undo/Redo, body/force duplication with fresh IDs,
keyboard commands, fixed-pivot dragging, zoom/pan and velocity vectors. Rendering
backlog remains bounded without pausing for one brief delayed frame; native fixed
steps/iteration settings are unchanged. 445 tests and essential checks pass;
browser verified duplication/undo/redo, zoomed dragging and vector display.

Editing PR #12 merged as 431b103f753fc30d060a97638118ab7b4a54dc3f; main/Pages
44598222891 passed. Live toolbar and page refresh verified; public playback off.
Direct canvas rotation/resize handles now update validated authored geometry;
centre/IDs are preserved and each gesture is undoable. 448 tests plus typecheck,
lint, M0/PoC, build/Pages and editor/collision browser checks pass. Browser also
verified rotated resizing, one-gesture undo and handles hidden during simulation.
No schema, native settings, qualification thresholds or public execution changes.

Canvas handles PR #13 merged as 642cb9b20ae3e9aba1bb41dab47bb15bfdea1a3d;
main/Pages 44598918409 passed; live handles and public lockout verified.
Added explicit fixed/movable switching (never deletes forces/joints), mass/density
controls using existing SI physical properties, an inclined-plane example and
quarter/half-speed scheduling. Solver dt/substeps/iterations unchanged. 450 tests,
typecheck/generated consistency, lint, build and Pages checks passed; Chromium
verified density/motion edits, inclined sliding (vx=0.428 m/s in smoke run), and
Step still advancing 1/120 s at quarter speed. No numerical certification claim.

Physical controls PR #14 merged as eda2bcbf1937002a3906c2db9c8a6fa53b0ac3f5;
main/Pages 44599452768 passed; live controls and public lockout verified.
Triangle/pentagon creation, rendering and uniform scaling expose the existing
centred convex Scene v1/native geometry support. The teacher bridge explicitly
admits these only in experimental collision mode; free-flight/public gates remain.
453 tests, typecheck/generated consistency, lint, build/Pages pass. Chromium
verified polygon creation/scale/rotation, native rebound and authored-state isolation.

Polygon PR #15 merged as 9bf281d72d5019179f4e4486342c6c1271cfeaeb;
main/Pages 44600246657 passed and live polygon tools/public lockout verified.
Force arrows now have authoring-only vector and application-point drag handles.
SI/body-local conversions and validation preserve real force/torque semantics;
each gesture is undoable and handles are absent during preview. 454 tests,
typecheck/generated consistency, lint, build/Pages pass; Chromium verified force,
torque, Undo and runtime lockout. No live-force permissions or profile changes.

Force handles PR #16 merged as 7f4aeeac12e707476bd16d0c5e693bf7255351fe;
main/Pages 44600693627 passed; live handles/public lockout verified.
Added quick joint buttons and direct world-pivot dragging. Pivot and attached body
move as one validated authored edit with stable IDs; Undo restores the gesture.
455 tests, typecheck/generated consistency, lint, build/Pages pass. Chromium
verified pivot dragging, Undo, native hinge initialization and preview lockout.
Pulley/spring remain unsupported; no schema or numerical profile changes.
