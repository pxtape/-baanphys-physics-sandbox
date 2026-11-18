# M1 implementation backlog and acceptance

Status: **M1-01 COMPLETE; M1-01.5 BLOCKED on GitHub publication permissions**. Deployment configuration is prepared and locally verified. M1-02 and later tasks are not started. M1 here means the basic editor plus S0 end-to-end slice; advanced mechanisms and certified rolling remain gated. See DECISIONS.md ADR-001 for the selected engine/profile and BENCHMARKS.md for evidence.

| Task | Dependencies | Acceptance criteria | Status |
| --- | --- | --- | --- |
| M1-01 Tooling and boundaries | User approval | React/TypeScript strict/Vite project, pinned Planck 1.5.1 and lockfile, Node 24+ documented; tests/typecheck/build scripts; domain/physics/renderer/editor/persistence/player separation. `poc` has no production imports. Keep M0 baseline/history. | COMPLETE — awaiting review |
| M1-01.5 GitHub repository and continuous deployment | M1-01; repository creation/write and Pages permissions | Preserve history in baanphys-physics-sandbox; feature/main separation; Node 24 npm ci, typecheck/lint/application/M0/PoC tests and build gates; correct Vite project base; deploy verified dist via GitHub Actions only from main; verify successful Actions, public index, JS/CSS and refresh. | BLOCKED externally — configuration/local checks complete |
| M1-02 Domain and validation | M1-01 and M1-01.5 | Typed Scene v1, bundled schema+format assertions, semantic/reference/geometry/resource validation and diagnostics. Immutable authored state distinct from UI/runtime. No eval or schema-selected network fetching. Existing invalid fixtures and all shape branches covered. | NOT STARTED |
| M1-03 Production Planck adapter | M1-02 | Explicit mass/density/inertia, y-up SI and seconds, fixed dt=1/120 with 4 substeps, 12/12 solver mapping, zero restitution threshold, documented equal-friction profile and native contact/clamp envelope. Reject unsupported profile/materials/features. Production adapter reruns B1/B2/B3 and torque within unchanged tolerances; fresh-engine replay≤1e-10 in same runtime. | NOT STARTED |
| M1-04 Shared renderer/viewport | M1-02 | SVG scene and camera separate from physics; inverse transforms at zoom/DPR; accessible object list and units. Pointer and keyboard selection; screen transforms cannot change solver states. Select named desktop/iPad baselines and check Safari rendering/input early. | NOT STARTED |
| M1-05 S0 scene authoring | M1-03/04 | Circle, rectangle, finite static floor palette; select/drag; dimensions, position, mass/velocity inspector with validation; duplicate/delete. One gesture is one undo command; undo/redo survives repeated previews without authored-state leakage. | NOT STARTED |
| M1-06 Preview controls | M1-03/05 | Play/Pause/Reset/Step, visible simulation time; Step advances one logical dt, no variable integration step; hidden-tab/backlog policy. Save/reset use authored initial values. Slow motion may follow as M2 completion but cannot alter h. | NOT STARTED |
| M1-07 Local repository | M1-02/05 | IndexedDB atomic immutable revision/head transaction; stable simulation UUID, revision UUID and sequence; list/load/save/duplicate; expected-head conflict and quota failure visible; import-as-copy/reference remapping and portable JSON export. Browser restart preserves saved revisions. | NOT STARTED |
| M1-08 Read-only local player | M1-03/04/07 | `/player/:id?revision=:revisionId`, resolver has no write capability, isolated clone. Harness embeds pinned revision, plays/resets independently; source hash unchanged and old embed stays pinned after later save. Missing revision UX. Labels explain device/origin-local scope; validate message origin/source/payload if portable host handoff is added. | NOT STARTED |
| M1-09 S0 acceptance | M1-05 through 08 | Author falling ball + block/floor, run/reset/save, restart/reload, export/import copy, local iframe playback without source mutation. Relevant numerical/schema/repository/browser tests pass, typecheck and build succeed; record actual desktop/Safari/iPad checks and outstanding limitations. No production deployment implied. | NOT STARTED |
| M1-10 Full M1 authoring completion | S0 accepted | Add convex polygon authoring, rotate/resize handles and keyboard equivalents, density-driven resizing/inertia, multi-reference duplication and deletion preview. Planck convex fixture vertex limit is 8: validate convex 3–8 vertex inputs for execution; larger schema-valid polygons remain inspectable but blocked until compound decomposition is independently validated. Tests cover geometric invariants and undo. | NOT STARTED |

## Critical blockers versus later gates

- **Critical technical blockers to start basic M1: none identified.** Local Git works; dependencies and executable evidence are available; Planck passes the defined basic mechanics at the chosen fixed settings.
- **Workflow gate: M1-01.5 is authorized; publication is blocked by GitHub permissions.** Complete its external checks and obtain review before M1-02, which remains NOT STARTED.
- Target repository is pxtape/baanphys-physics-sandbox. No remote is configured: authenticated creation was denied by the integration. Owner creation/access and Pages setup are required before publishing; see DEPLOYMENT.md.
- Safari/real iPad access and named hardware must be arranged for compatibility/performance acceptance. No claim that these were tested in M0.5; lack of evidence blocks that acceptance/release, not headless/editor construction.
- Rolling/no-slip fidelity, distinct static/dynamic friction, advanced rope transients, full 10-minute scene budget, Atwood/pulleys/gears/motors and cross-browser determinism remain separate gates. They cannot be exposed as certified capabilities based on this report.
- BaanPhys host origins/auth/problem contract and server publication are unresolved M5 dependencies. Local player tests do not establish cross-device embedding.

M1-01 is implemented; M1-01.5 configuration is implemented but external publication is blocked. Do not start M1-02 until separately instructed. Completion of the foundation does not imply that scene validation, authoring, simulation or embedding already works.

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

## M1-01.5 status — 2026-11-17

Added workflow, Pages base and built-artifact HTTP smoke check; local Node 24
install/typecheck/lint/23 boundary tests/25 M0 fixtures/13 PoC verification/build
and project-path/JS/CSS/refresh checks pass. Original tests, numerical thresholds,
archived results, schema and architecture are unchanged. Existing M1-01 work is
preserved in commit 97d0fa8; deployment changes use chore/m1-01-5-pages.

GitHub authenticated as pxtape; repository checks returned 404 and actual creation
failed with `Resource not accessible by integration (createRepository)`. Push,
GitHub Actions success and public desktop/iPad checks are **not performed**.
DEPLOYMENT.md specifies the owner authorization and safe resume steps. Overall
status remains BLOCKED until those external acceptance checks pass.

## Publication resumed — 2026-11-18

The owner-created public repository was found as `pxtape/-baanphys-physics-sandbox`.
The original 404 was due to its leading hyphen. Access and workflow-based Pages
are now confirmed. The integration cannot rename the repository (HTTP 403), so
its existing name and `/-baanphys-physics-sandbox/` Vite base are retained. Local
checks pass and publication is in progress. Earlier BLOCKED status is historical;
remote Actions/live checks are pending. M1-02 remains NOT STARTED.
