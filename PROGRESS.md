# Progress

Updated: 2026-11-17.

## Current state

**M0.5 technical validation complete. M1 readiness: READY for the scoped basic editor/S0 work after user approval. M1 implementation has not started.** No full editor, production adapter, server, publishing or deployment was created.

## Completed

- Preserved all supplied M0 documents/schema/example/checks in Git baseline `65dfde9` (`docs: preserve M0 planning baseline`).
- Initialized a working `main` repository. Checked remotes before setup and after initialization: none configured. Retained existing author identity; no external repository created, remote invented or push attempted.
- Installed exact Matter.js 0.20.0 and Planck.js 1.5.1 only in `poc/engine-comparison`, with npm lockfile and ignore rules for dependencies/environment files.
- Ran 93 numerical comparison configurations (59 PASS, 34 FAIL) and recorded 3 explicitly unsupported/unexecuted Matter rope entries. Cases cover all eight requested topics plus point pendulum, damped spring, bilateral length and mass supplements, over three fixed timesteps.
- Saved raw CSV trajectories, metric/reference/error/tolerance/status JSON, machine/settings metadata and SHA-256 provenance. Ran 21 fresh-engine replay comparisons and 2 CPU-only 100-body/100-rod load probes.
- Ran 4 additional low-speed-elasticity/thin-floor boundary probes. Planck passes both with the selected restitution-threshold policy; Matter fails both.
- Ran 13 reference/conversion/force/inertia/replay/provenance/basic-gate verification tests and reran 25 M0 schema fixtures; all passed. Comparison failures remain failures and are visible in BENCHMARKS.md.
- Selected Planck.js for the future production adapter; documented profile, physical material limitations, engine tradeoffs and capability restrictions in DECISIONS.md and ENGINE_FEASIBILITY.md. Added M1 tasks/acceptance criteria.

## Not completed or claimed

No actual browser/Safari/iPad compatibility/performance measurement, cross-browser replay, production typecheck/build, repository/embedding integration tests, production Scene semantic validator or M1 application exists. Rolling fails the executed common-friction feasibility variant; the original distinct-static/dynamic B6 case is not certified. Atwood, pulley/gear/motor behavior, slack-to-taut rope impacts, contact-force instrumentation and long-run stress qualification are not tested.

## Git and changed artifacts

M0.5 artifacts are recorded in a separate local validation commit (`test: qualify physics engines and prepare M1`). Original M0 history remains available at the baseline. No remote is configured. See final delivered Git status for the validation commit hash.

Added: `.gitignore`, `DECISIONS.md`, `BENCHMARKS.md`, `M1_TASKS.md`, `PROGRESS.md`, isolated PoC package/lockfile, adapters, harness, stress/verification scripts, README and generated results/trajectories.

Updated: ENGINE_FEASIBILITY.md, ARCHITECTURE.md, ROADMAP.md, SPEC.md, TEST_PLAN.md and the M0 check's scope message. Existing schema, example, AGENTS.md and M0_VALIDATION.md retain their historical baseline contents.

## Next action

Await approval to begin M1. Follow M1_TASKS.md; keep rolling/unsupported material models gated and preserve the save/reload/pinned-player vertical slice. Critical technical blockers to starting basic M1: none. Outstanding compatibility and advanced-physics gates are explicitly listed in that backlog.
