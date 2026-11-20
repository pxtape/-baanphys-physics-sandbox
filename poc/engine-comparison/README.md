# M0.5 engine comparison — isolated proof of concept

This is qualification code, not the visual editor, production adapter or Scene JSON importer. JavaScript keeps this experiment independent of the future React/TypeScript/Vite app. Both package versions are exact and the npm lockfile is committed. Node ≥24 is required by the selected Planck package metadata. MIT engine licenses are in the installed packages; `stage-js` is an auto-installed peer, not used by the harness or required by our core physics import.

From this directory:

```sh
npm ci --ignore-scripts
npm run benchmark
npm run stress
```

The automated verification suite was removed for the MVP1 restart. Recorded
benchmark data and manual experiment sources are retained as historical evidence.
Benchmark commands may report FAIL/UNSUPPORTED; command success does not qualify
physics or enable public execution.

- `adapters.mjs`: native-engine boundary, SI conversions, mass/inertia and explicit contact settings.
- `benchmark.mjs`: fixtures, independent analytical/RK4 references, frozen tolerances, timestep sweep, replay, CPU-only load probe, trajectory writer.
- `stress.mjs`: low-speed elasticity and high-speed/thin-floor probes, with raw states in stress.json.
- `results/results.json`: all benchmark metrics, error definitions, tolerances, statuses, exact settings and machine identity.
- `results/*.csv`: sampled raw states for each executed comparison (logical ticks, all bodies).
- `results/stress.json`: additional boundary probes.

See [BENCHMARKS.md](../../BENCHMARKS.md) for physical conditions, measured results, adjustments from the M0 plan, limitations and decision. Fixed settings are part of these experiments. Do not reuse these adapters in production without the M1 adapter/contract tests and profile registry. All Planck worlds share the configured global restitution threshold of zero; never silently change this after creating worlds.

To reproduce the archived metrics, retain source/lockfile hashes, same runtime, versions and settings. Timing values depend on machine load; numerical trajectories are the accuracy evidence. No benchmark overwrites M0 documents or examples. Regenerating results changes tracked evidence deliberately.
