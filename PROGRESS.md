# Progress

Updated: 2026-11-19.

## Current state

**M1-01 and M1-01.5 COMPLETE. M1-02 NOT STARTED — awaiting separate approval.**

- Repository: https://github.com/pxtape/-baanphys-physics-sandbox
- Live foundation preview: https://pxtape.github.io/-baanphys-physics-sandbox/
- Successful first main deployment: https://github.com/pxtape/-baanphys-physics-sandbox/actions/runs/44270951839

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

No actual Safari/iPad compatibility/performance measurement, cross-browser replay, repository/embedding integration tests or production Scene semantic validator exists. M1-01 now has a typechecked/built foundation application and a shared-Chrome launch/reload smoke check only. Rolling fails the executed common-friction feasibility variant; the original distinct-static/dynamic B6 case is not certified. Atwood, pulley/gear/motor behavior, slack-to-taut rope impacts, contact-force instrumentation and long-run stress qualification are not tested.

## Git and deployment artifacts

Original baseline commits are preserved. Production source is on stable main;
the deployment development branch remains separate. Remote origin points to the
owner-created public repository. Deployment files: .github/workflows/deploy.yml,
vite.config.ts base, package.json smoke-test command, tooling/verify-pages.mjs,
and README/DEPLOYMENT/ROADMAP/M1_TASKS/PROGRESS documentation. All original physics,
schema and architecture tests/reports are intact.

## Next action

Review the live foundation preview and this completion summary. M1-02 (Domain
and validation) is NOT STARTED. Wait for separate user approval before proceeding.
No blocker remains for M1-01.5. Physical iPad/Safari validation, production scene
validation/physics, storage and embedded player remain later gates.
