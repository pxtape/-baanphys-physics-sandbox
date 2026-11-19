# M1 implementation backlog and acceptance

Status: **M1-02 ACCEPTED AND MERGED** (PR #1, 00fe21a; exact reviewed head dfdaa65). Main CI and Pages passed. Historical records below retain their original checkpoint context. M1-03A is ACCEPTED and merged (PR #2, 15a8f48); M1-03B is planned only and B–E implementation is NOT STARTED. See DECISIONS.md and BENCHMARKS.md for the unchanged engine decision and numerical limitations.

| Task | Dependencies | Acceptance criteria | Status |
| --- | --- | --- | --- |
| M1-01 Tooling and boundaries | User approval | React/TypeScript strict/Vite project, pinned Planck 1.5.1 and lockfile, Node 24+ documented; tests/typecheck/build scripts; domain/physics/renderer/editor/persistence/player separation. `poc` has no production imports. Keep M0 baseline/history. | COMPLETE — awaiting review |
| M1-01.5 GitHub repository and continuous deployment | M1-01; repository creation/write and Pages permissions | Preserve history in owner-created pxtape/-baanphys-physics-sandbox; feature/main separation; Node 24 npm ci, typecheck/lint/application/M0/PoC tests and build gates; correct Vite project base; deploy verified dist via GitHub Actions only from main; verify successful Actions, public index, JS/CSS and refresh. | COMPLETE — live deployment verified |
| M1-02 Domain and validation | M1-01 and M1-01.5 | Typed Scene v1, bundled schema+format assertions, semantic/reference/geometry/resource validation and diagnostics. Immutable authored state distinct from UI/runtime. No eval or schema-selected network fetching. Existing invalid fixtures and all shape branches covered. | ACCEPTED — PR #1 merged as 00fe21a |
| M1-03 Production Planck adapter | M1-02 | Explicit mass/density/inertia, y-up SI and seconds, fixed dt=1/120 with 4 substeps, 12/12 solver mapping, zero restitution threshold, documented equal-friction profile and native contact/clamp envelope. Reject unsupported profile/materials/features. Production adapter reruns B1/B2/B3 and torque within unchanged tolerances; fresh-engine replay≤1e-10 in same runtime. | A ACCEPTED; B–E NOT STARTED |
| M1-03A Adapter contracts | Accepted M1-02 | Engine-independent initialization/step/disposal interfaces; ordered tick inputs and SI snapshots; structured diagnostics; exact Planck 1.5.1 / adapter 1.0.0 / profile identity; mismatches reject, all scenes stay non-executable; immutable authored data and no native type leakage. No world construction or solver. | ACCEPTED — PR #2 merged as 15a8f48 |
| M1-04 Shared renderer/viewport | M1-02 | SVG scene and camera separate from physics; inverse transforms at zoom/DPR; accessible object list and units. Pointer and keyboard selection; screen transforms cannot change solver states. Select named desktop/iPad baselines and check Safari rendering/input early. | NOT STARTED |
| M1-05 S0 scene authoring | M1-03/04 | Circle, rectangle, finite static floor palette; select/drag; dimensions, position, mass/velocity inspector with validation; duplicate/delete. One gesture is one undo command; undo/redo survives repeated previews without authored-state leakage. | NOT STARTED |
| M1-06 Preview controls | M1-03/05 | Play/Pause/Reset/Step, visible simulation time; Step advances one logical dt, no variable integration step; hidden-tab/backlog policy. Save/reset use authored initial values. Slow motion may follow as M2 completion but cannot alter h. | NOT STARTED |
| M1-07 Local repository | M1-02/05 | IndexedDB atomic immutable revision/head transaction; stable simulation UUID, revision UUID and sequence; list/load/save/duplicate; expected-head conflict and quota failure visible; import-as-copy/reference remapping and portable JSON export. Browser restart preserves saved revisions. | NOT STARTED |
| M1-08 Read-only local player | M1-03/04/07 | `/player/:id?revision=:revisionId`, resolver has no write capability, isolated clone. Harness embeds pinned revision, plays/resets independently; source hash unchanged and old embed stays pinned after later save. Missing revision UX. Labels explain device/origin-local scope; validate message origin/source/payload if portable host handoff is added. | NOT STARTED |
| M1-09 S0 acceptance | M1-05 through 08 | Author falling ball + block/floor, run/reset/save, restart/reload, export/import copy, local iframe playback without source mutation. Relevant numerical/schema/repository/browser tests pass, typecheck and build succeed; record actual desktop/Safari/iPad checks and outstanding limitations. No production deployment implied. | NOT STARTED |
| M1-10 Full M1 authoring completion | S0 accepted | Add convex polygon authoring, rotate/resize handles and keyboard equivalents, density-driven resizing/inertia, multi-reference duplication and deletion preview. Planck convex fixture vertex limit is 8: validate convex 3–8 vertex inputs for execution; larger schema-valid polygons remain inspectable but blocked until compound decomposition is independently validated. Tests cover geometric invariants and undo. | NOT STARTED |

## Critical blockers versus later gates

- **Critical technical blockers to start basic M1: none identified.** Local Git works; dependencies and executable evidence are available; Planck passes the defined basic mechanics at the chosen fixed settings.
- **Workflow gate: M1-02 is accepted and merged.** M1-03 is planned in [M1-03_PLAN.md](M1-03_PLAN.md); do not implement it without approval.
- Repository and live Pages preview are available under pxtape/-baanphys-physics-sandbox (leading hyphen retained). Origin and feature/main branches are configured; see DEPLOYMENT.md for verified deployment evidence.
- Safari/real iPad access and named hardware must be arranged for compatibility/performance acceptance. No claim that these were tested in M0.5; lack of evidence blocks that acceptance/release, not headless/editor construction.
- Rolling/no-slip fidelity, distinct static/dynamic friction, advanced rope transients, full 10-minute scene budget, Atwood/pulleys/gears/motors and cross-browser determinism remain separate gates. They cannot be exposed as certified capabilities based on this report.
- BaanPhys host origins/auth/problem contract and server publication are unresolved M5 dependencies. Local player tests do not establish cross-device embedding.

M1-01, M1-01.5 and M1-02 are accepted. Do not start M1-03 until separately instructed. Completion of the foundation does not imply that scene validation, authoring, simulation or embedding already works.

## M1-01 completion evidence — 2026-11-17

Acceptance: React + TypeScript strict + Vite root app, Planck 1.5.1 pinned with
an exact npm lockfile, Node 24+ setup, runnable dev/preview, typecheck/lint/test/build
scripts and reserved architecture directories. ESLint enforces native adapter,
PoC, domain/schema, renderer and player import boundaries, with 23 positive and
negative automated cases. No production code imports the PoC or Planck itself.
No scene data exists or is mutated, so no object IDs or JSON fields are rewritten.

Verification: clean offline `npm ci --ignore-scripts` from the lockfile,
`npm run typecheck`, `npm run lint`, `npm test` (23/23), `npm run build`,
`npm run test:m0` (25/25) and `npm run test:poc` (13/13). Shared Chrome rendered
and reloaded the dev page; the production preview served HTML and its built assets.
Real Safari/iPad, responsive-device behavior and production physics remain untested.
See [README.md](README.md) for exact commands and the manual smoke test.

The existing numerical reports, schema, fixtures and approved timestep are
unchanged. There is no critical blocker to reviewing this task. Later physics,
compatibility, storage and embed gates still apply. M1-01.5 was subsequently inserted before M1-02; neither completion of this historical M1-01 record nor the prepared workflow implies public deployment.

## M1-01.5 completion — 2026-11-19

Repository: https://github.com/pxtape/-baanphys-physics-sandbox

Public preview: https://pxtape.github.io/-baanphys-physics-sandbox/

The owner-created repository's leading hyphen is retained because renaming is not
permitted by the integration. Vite/smoke checks use the matching project base.
All local checks and development run 44269819955 passed before the fast-forward
into stable main. Main run 44270951839 passed checks and deployed commit 268e98d.
Public index, JS/CSS assets and index refresh returned 200 with correct MIME types;
shared Chrome rendered and reloaded the page. Original tests, benchmarks, schema
and architecture are unchanged. History and development/main branches are pushed.
No secrets or force-push were used. See DEPLOYMENT.md for the detailed record.

Physical iPad/Safari compatibility remains untested, and future player deep-link
refresh needs an explicit Pages routing design. The deployed page is the M1-01
foundation, not an editor. No deployment blocker remains. Stop here; M1-02 is
NOT STARTED and awaits separate approval.

## M1-02 completion evidence — 2026-11-19 (task branch only)

| Acceptance criterion | Result | Evidence |
| --- | --- | --- |
| Strongly typed Scene v1 | PASS | Types generated from the unchanged canonical schema; deep-readonly SceneDocument projection; compile-time discriminant/readonly tests. No alternate runtime scene model. |
| Bundled schema + format assertions | PASS | Draft 2020-12 standalone validator, full calendar-aware date-time and UUID assertions; malformed UUID/date/unknown-field/version and Unicode-length tests; deterministic check:generated runs before typecheck/build. |
| Semantic/reference/geometry/resource checks | PASS | UUID collisions/typed references, all constraint-data branches, static/material/physical checks, control/identity rules, simple CCW convex polygons and centroid/area/edge limits; exact and over-limit resource cases. |
| Structured actionable diagnostics | PASS | Stable codes, RFC6901 pointers, stage/severity/message/suggestion; input/schema/semantic failure tests, pointer escaping and bounded/truncated reports; no partial scene on rejection. |
| Immutable authored data | PASS | Deep freeze, detached caller data, readonly type guards, unchanged IDs/JSON round-trip. No UI/runtime store or engine handles introduced. |
| Invalid fixtures and every supported shape | PASS | Existing 25 M0 structural fixtures preserved; additional invalid cases; circles, rectangles/static floors and convex 3/8/128-vertex polygons, mass/density and shape-boundary tests. |
| Safe rejection/no eval or schema-selected network | PASS | Bounded duplicate-aware JSON parser, nonfinite/cycle/getter/class/sparse/prototype tests, fetch spy, static validator with dynamic compilation disabled, complete browser-target bundle execution test. |

Local results: 137 Vitest tests (113 validation cases + 23 existing architecture
cases + 1 browser-target bundle test), 25 M0 fixtures and 13 existing PoC tests
pass. Typecheck (including generated-artifact consistency), lint and production
build and Pages artifact/path/refresh smoke check pass; build retains the existing foundation UI assets. No benchmark or
schema format/threshold was changed. Commands/API/limits: src/schema/README.md.

All successful documents remain executionReady=false: M1-03 must independently
gate trusted profiles, numerical envelopes, material/geometry support and all
student ranges. Saved documents warn that ownership/lineage/expected head need
M1-07. No physics adapter/profile registry, canvas, editor store, file UI,
persistence or migrations were implemented. Physical iPad/Safari remains untested.

Main remains abf556e and Pages is not deployed from this task branch. Commit/PR
identity is supplied in the completion report and Git history. Stop after review
submission; merging and M1-03 require separate approval.


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


## Final M1-02 acceptance — 2026-11-19

PASS at dfdaa65f45c20a877bb49d4ed5f2a5396866727c; normal PR #1 merge
00fe21a5df232d9bde879323baebdc9be00edf89. Main checks and Pages run 44499277414
succeeded at the merge SHA. Public index/JS/CSS and refresh verified HTTP 200;
assets match the production build. Local re-verification: typecheck/generated
sync, lint, 195 application tests including all 58 timestamp regressions, 25 M0
fixtures, 13 PoC verification tests and build PASS. No unresolved critical/major
issue found; schema and accepted formats unchanged. Leap-second date authenticity
is not checked by the pinned format library; preserved and documented, not
silently restricted. Full acceptance evidence: PROGRESS.md.

Next task: [M1-03 implementation plan](M1-03_PLAN.md). Its original scope and
thresholds are unchanged; status remains NOT STARTED pending user approval.


## M1-03A review submission — 2026-11-19

Only step 1 of M1-03_PLAN.md is implemented. Public contracts and exact trusted
identity/settings gate live in src/physics; adapterVersion=1.0.0. All scenes remain
executionReady=false and initialization rejects without constructing a runtime.
No native imports, worlds, bodies, fixtures, mass conversions or solver stepping.
Tick-input ordering is deterministic, detached/frozen and rejects invalid batches.
SceneDocument and canonical Scene v1 remain unchanged. Contract lifecycle and
versioning details: src/physics/README.md. No benchmark thresholds/settings change.

Acceptance evidence: 29 new contract/order/declaration/type tests; full 224 tests,
typecheck/generated consistency, lint, 25 M0 fixtures, 13 existing PoC verification
tests and production build pass. Runtime/numerical gates are NOT executed by this
contract-only task. Stop for review; no merge/deployment or B–E implementation.


## M1-03A final acceptance — 2026-11-19

PASS at exact head 33cfb2ea0f424716bde34feb2b265d48c9f24748; PR #2 normal
merge 15a8f480e47e30997b714a0b88dca6ebdc30cf62. No unresolved critical/major
findings or review threads. PR run 44503465766 and main CI/Pages run 44503938253
passed. Re-ran typecheck/generated consistency, lint, 224 tests (29 contract,
including immutable boundaries/native-free declarations/order rejection), 25 M0
fixtures, 13 PoC checks and build. Exact identity/settings, rejection without
partial construction and executionReady=false are preserved. Runtime lifecycle
and dynamic-target/envelope checks remain future implementation requirements.
Public index/JS/CSS and refresh passed HTTP checks; code assets match build.

B plan: [M1-03B_PLAN.md](M1-03B_PLAN.md). Geometry/material/numerical limits,
complete student ranges, constraints, bounded diagnostics and all-or-nothing
qualification are covered. B remains unimplemented pending approval.
