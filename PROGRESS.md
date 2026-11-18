# Progress

Updated: 2026-11-17.

## Current state

**M1-01 COMPLETE; M1-01.5 deployment configuration prepared and locally verified, external publication BLOCKED.** GitHub authenticates as pxtape but denies repository creation. No successful push, remote Actions run or public Pages preview exists. M1-02 and later tasks are NOT STARTED. No scene editor, production physics adapter, persistence server or M1-02 features were implemented. A gated deployment workflow exists but has not run on GitHub.

## M1-01.5 prepared — 2026-11-17

- Preserved M0/M0.5 commits and committed all existing M1-01 files as `97d0fa8` on main before creating `chore/m1-01-5-pages`. No history rewrite, deletion, force-push or remote replacement occurred.
- Authenticated GitHub connector and CLI as `pxtape`; confirmed no existing local remote and got 404 for the target repository. Actual `gh repo create pxtape/baanphys-physics-sandbox --public` was denied: `GraphQL: Resource not accessible by integration (createRepository)`.
- Added `.github/workflows/deploy.yml`: Node 24, npm ci, typecheck, lint, 23 application tests, 25 M0 fixtures, 13 PoC verification tests, production build, artifact smoke test. Only a successful main run may upload/deploy dist; feature/PR runs check only. Pages/OIDC permissions are isolated to deploy, with official actions pinned to release SHAs.
- Set Vite base `/baanphys-physics-sandbox/` and updated local preview URLs. Added `npm run test:pages` and `tooling/verify-pages.mjs` to check the actual built index, JavaScript/CSS paths, status/MIME types and index refresh using production preview on loopback port 4175.
- Local checks pass on Node 24.22.1: npm ci, typecheck, lint, 23 Vitest boundary cases, 25 M0 schema fixtures, 13 archived PoC verification cases, production build, and Pages artifact smoke check. Numerical failures/thresholds and original tests remain unchanged; no new claim of physics qualification.
- Updated README deployment guide, DEPLOYMENT.md authorization/push/runbook, ROADMAP.md and M1_TASKS.md. No repository was created, origin configured, source pushed, GitHub Actions executed or public URL verified because creation permissions are unavailable.
- Required owner action: create the empty public repository under pxtape, grant the integration source/workflow and Pages/access permissions or use an authorized local gh login, and select Settings → Pages → GitHub Actions. Exact safe commands and permissions are in DEPLOYMENT.md. Never provide credentials in project files or chat.

Intended (NOT created/live-verified) targets: `https://github.com/pxtape/baanphys-physics-sandbox` and `https://pxtape.github.io/baanphys-physics-sandbox/`. Do not mark the task complete until push, successful main Actions and public index/assets/refresh checks succeed. Real iPad verification remains manual.

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

## Git and changed artifacts

M0.5 artifacts are recorded in a separate local validation commit (`test: qualify physics engines and prepare M1`). Original M0 history remains available at the baseline. No remote is configured. See final delivered Git status for the validation commit hash.

Added: `.gitignore`, `DECISIONS.md`, `BENCHMARKS.md`, `M1_TASKS.md`, `PROGRESS.md`, isolated PoC package/lockfile, adapters, harness, stress/verification scripts, README and generated results/trajectories.

Updated: ENGINE_FEASIBILITY.md, ARCHITECTURE.md, ROADMAP.md, SPEC.md, TEST_PLAN.md and the M0 check's scope message. Existing schema, example, AGENTS.md and M0_VALIDATION.md retain their historical baseline contents.

## Next action

Stop with M1-01.5 BLOCKED externally. Owner repository/access/Pages setup is needed to finish publication; follow DEPLOYMENT.md. M1-02 (Domain and validation) remains NOT STARTED and requires separate approval. Safari/iPad testing, production physics, supported material/geometry envelopes, scene validation, storage and the pinned-player integration remain explicit later gates. Rolling and advanced mechanisms remain unimplemented/unqualified.

## Publication resumed — 2026-11-18

The owner-created public repository was found as `pxtape/-baanphys-physics-sandbox`.
The original 404 was due to its leading hyphen. Access and workflow-based Pages
are now confirmed. The integration cannot rename the repository (HTTP 403), so
its existing name and `/-baanphys-physics-sandbox/` Vite base are retained. Local
checks pass and publication is in progress. Earlier BLOCKED status is historical;
remote Actions/live checks are pending. M1-02 remains NOT STARTED.
