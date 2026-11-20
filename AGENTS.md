# Project-wide development rules

These rules apply to all project files beneath this directory. Follow explicit user instructions when they differ. Current stage is MVP2 experimental mechanisms, following the accepted MVP1 working app. The user explicitly requested removal of the old automated test suites. Prioritize visible core sandbox behavior; do not rebuild the app from scratch.

## Sources of truth

Read SPEC.md, ARCHITECTURE.md, ROADMAP.md, TEST_PLAN.md and SCENE_FORMAT.md before implementation. ENGINE_FEASIBILITY.md distinguishes source review from measured evidence. Do not claim tests, engine capabilities or accuracy that have not been demonstrated. Update documentation when contracts change.

## Architecture and physics

- Use React + TypeScript strict mode + Vite when implementation starts. Engine choice remains gated by the qualification report.
- Keep domain data, commands, runtime snapshots, viewport/UI state and persistence separate. Engine APIs stay inside physics adapters. Rendering never determines physics.
- Use SI throughout domain and adapter interfaces; y up and counterclockwise angles. Confine native-unit and screen conversions to their boundaries and test both directions.
- Fixed persisted timestep/substeps/iterations; slow motion changes scheduling only. Record exact engine, adapter and capability profile versions. No hidden runtime accuracy/performance changes.
- Calculate physical mass/inertia explicitly and disable unintended drag in ideal benchmarks. No fake trajectory animations or unvalidated constraint substitutions. Gate unsupported features visibly.
- Never treat solver stiffness as N/m or contact corrections as measured forces. Preserve source quantities, assumptions and units in measurements.

## Data and integration

- Validate imported data structurally, semantically, against resource bounds and engine capabilities before construction. No eval, new Function, executable scene code or arbitrary plugin installation from data.
- Scene JSON is versioned; add migration fixtures and preserve original revisions. Engine handles/caches must never appear in saved data.
- Save authored initial conditions, not preview state. Use UUID simulation/revision IDs, atomic immutable revisions and expected-head concurrency checks. Duplication/import must handle identity and reference remapping deliberately.
- Player receives a resolver with no write capability and uses a validated copy. Student controls are locked by default and allowlist-based. Server enforces ownership; UI restrictions are not authorization.
- Pin embeds to revision IDs; local IndexedDB URLs are not public cross-device embeds. Validate postMessage origin, source, envelope and payload; exact targetOrigin only.
- Never put secrets, answer keys, auth tokens or backend credentials in scenes, URLs, logs or public player bundles.

## Change and verification discipline

- Inspect existing files/instructions and preserve unrelated user changes. Prefer small reviewable modules and pure functions over speculative frameworks. Do not deploy or publish without authorization.
- Do not recreate automated suites or broad test matrices unless requested. Keep runtime scene validation and experimental/public execution restrictions intact.
- TEST_PLAN.md and prior numerical results are historical references. Do not weaken numerical thresholds or relabel failed/unqualified physics as passed.
- Run typecheck, lint and build; review changed user flows in a browser. Report actual checks briefly. No automated test gate is required for the current MVP work.
- Performance work must preserve declared physics settings. Profile before moving to Canvas/Workers. Provide keyboard/touch alternatives and accessible object descriptions.
