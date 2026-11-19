# Progress

Updated: 2026-11-19.

## Current state

**M1-02 COMPLETE ON TASK BRANCH — awaiting acceptance/merge approval.** Branch: feat/m1-02-domain-validation. Main remains abf556e; GitHub Pages is unchanged. M1-03 and later tasks are NOT STARTED.

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
