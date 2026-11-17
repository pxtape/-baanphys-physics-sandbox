# Engine feasibility and engine decision


## M0.5 decision update — 2026-11-17

**Recommend Planck.js 1.5.1 for M1**, based on executed headless tests, not API availability alone. See [BENCHMARKS.md](BENCHMARKS.md) for every case's references, measured metrics, solver settings, stability, limitations and raw data; [DECISIONS.md](DECISIONS.md) contains the priority-ordered tradeoffs and capability policy.

93 configurations executed: 59 PASS, 34 FAIL across both candidates, three integration steps and supplemental masses. Three Matter rope entries are unsupported and unexecuted, never counted as passes. At h=1/480 s Planck passes the basic mechanics and pendulum/spring/rope probes. Matter's elastic collision, point pendulum accuracy, offset pin stability and rolling profiles fail. Both fail the rolling feasibility variant. Four additional boundary probes, 21 replay comparisons, two CPU load probes and 13 verification tests also ran; M0 schema checks were rerun. No browser/iPad or production tests were run.

Use a planned Planck profile with logical dt=1/120 s, 4 substeps, velocity/position iterations=12/12, sleeping/drag off, continuous physics on and restitution velocity threshold explicitly zero. Springs tested here use a custom SI Hooke force law in both engines; they are not native soft-constraint accuracy claims. Planck's single friction coefficient means unequal static/dynamic authored coefficients remain blocked for execution in the initial profile. Rolling and advanced mechanisms are not certified. Production must reimplement/test the adapter and detect native motion clamps; the PoC is isolated from production.

M1 is technically READY for the basic editor/S0 scope, **pending user approval**. Native pulley/gear/motor APIs, cross-browser reproducibility and iPad performance still require their own validation. Neither engine is a guarantee of scientific accuracy.

## Historical M0 research baseline

The source-review assessment below is retained as historical context. Its “not executed” and “selection pending” statements describe M0, not the completed M0.5 results above.

Research date: 2026-11-17. Scope: official documentation/source review, not an executed solver comparison. Matter references describe version 0.20.0; pin exact installed versions during the spike. No numerical accuracy, performance or determinism claim has been verified in this workspace.

## Recommendation

React + TypeScript + Vite is feasible for authoring and player shells. Use a shared SVG renderer initially, isolated behind a viewport interface; React must not own engine bodies or update application state every substep. SVG gives direct shape hit-testing and handles for modest educational scenes; switch body rendering to Canvas only after profiling while retaining DOM controls and a shared transform.

Keep the physics adapter replaceable. Matter.js can prototype translation/collision scenes quickly, but should not yet be selected for the full product. Planck.js is the preferred comparison because its native joint family better matches the mechanism roadmap. Neither is a scientific accuracy guarantee. Do not build a custom general collision solver for the MVP.

## Findings and implications

| Topic | Matter.js assessment | Product implication |
| --- | --- | --- |
| Core bodies | Circle/rectangle/polygon creation, mass and rigid-body collision APIs exist. [S1, S2] | Basic editor feasible; geometry/mass conversion still needs tests. |
| Geometry | Concave input needs decomposition; fallback can replace it with a convex hull. [S1] | Restrict v1 to validated convex polygons; never silently change geometry. |
| Rotation | Source uses an inertia multiplier of 4 in default construction. [S3] | Compute uniform-lamina inertia in SI and set it explicitly after shape/mass changes. Test disk, rectangle and polygon torque response. |
| Time and units | Engine update uses milliseconds; velocity accessors normalize against a base delta. [S3, S4] | Adapter must convert m/s, rad/s, N and torque deliberately; inspect source instead of treating raw velocity as pixels/s. |
| Joints | Distance constraints and zero-length pin approximations exist; stiffness is solver tuning. [S5] | Rod/hinge drift is iterative. Soft constraint stiffness must not be labeled N/m. |
| Springs | A soft distance constraint is available. [S5] | Implement physical force law F = -k extension - c relative axial speed (equal/opposite anchored forces), then qualify stability. This is planned, not validated. |
| Ropes/mechanisms | Core constraint API is not an ideal tension-only rope, pulley or gear system. [S5] | No claim of native support; capability-reject until a separately tested implementation exists. |
| Fast collisions | No built-in CCD is documented; upstream tracks tunneling. [S6] | Smaller fixed substeps mitigate but do not guarantee collision detection. Establish a tested speed/size envelope. |
| Rolling | Factory circle hull is polygonal. [S2] | Analytic disk inertia alone cannot fix faceted contacts; rolling validation can disqualify Matter for that capability. |
| Observables | Applied forces are available, but solver contact/constraint corrections are not a calibrated force instrument. [S3, S5] | Do not display invented tension or instantaneous collision force. Distinguish impulses and finite-difference estimates. |
| Determinism | Fixed updates are controllable; iterative contacts remain order/version sensitive. [S4] | Stable creation order, pinned settings, fresh engine and replay tests; no universal bitwise claim. |

## Alternatives

Planck.js is a JavaScript/TypeScript Box2D rewrite. Its documented joints include revolute, rope, distance, weld, gear, pulley and motors. [S7] It reduces bespoke mechanism work and offers continuous-physics facilities [S8], but still needs step-size, contact, friction, spring-parameter conversion and reaction-force validation. Native joint existence does not establish textbook ideality or ≤1% accuracy. A pulley joint constrains ideal lengths; it does not automatically model a massive pulley, bearing friction or an extensible string.

Box2D via WASM is a later alternative if JS engines fail scale/performance requirements; investigate binding maintenance, version pinning, asset loading, worker integration and replay behavior before adopting. A specialized ideal-mechanism solver may serve advanced competition models later, but is a new solver product with a separate validation burden.

## Required engine qualification spike (next authorized work, before M1)

1. Pin Matter.js 0.20.0 and an exact Planck release; record licenses, lockfile, runtime and adapter versions. No editor implementation is required for the comparison.
2. Use a headless shared SI harness with physical inertia and drag disabled; execute B1–B4 and B7 from TEST_PLAN.md plus unit/torque tests. Run B5/B6 as capability-risk probes. Publish raw trajectories, settings, formulas and errors in a checked-in report.
3. Sweep h = 1/120, 1/240, 1/480 s using saved solver iterations; compare convergence. Test mass ratios 1:1, 10:1 and 100:1 separately from the basic benchmark claim. Test thin floor/high speed to expose tunneling rather than hide it.
4. Compare replay stability, 100-body/100-joint cost, iPad main-thread responsiveness and accessible SVG selection. Record unsuccessful cases, not just best runs.
5. Approve a versioned engine capability profile only for passing cases. Free fall, projectile, elastic collision, torque/inertia and persistence replay are mandatory for the thin slice. If these fail, investigate conversion/integration and change engine before authoring depends on it. Pendulum/rope/spring/rolling/Atwood remain blocked individually until qualified.
6. Record an engine decision with supported envelope and measured limitations. If neither meets the basic targets, pause implementation and revise solver choice; never loosen ≤1% targets without an explicit product decision.

## Sources

Reviewed primary sources (links identify the research basis, not executed tests):

- S0: [Interactive Physics product workflow](https://www.physicscurriculum.com/interactivephysics). Authoring, mechanisms and graphical/numerical meters inform scope; no proprietary behavior is assumed.
- S1: [Matter.Bodies 0.20.0 API](https://brm.io/matter-js/docs/classes/Bodies.html): geometry factories, concave decomposition requirements and caveats.
- S2: [Matter factory source](https://brm.io/matter-js/docs/files/src_factory_Bodies.js.html): circle hull implementation.
- S3: [Matter Body source](https://brm.io/matter-js/docs/files/src_body_Body.js.html): inertia scaling, normalized velocities and force integration.
- S4: [Matter Engine source](https://brm.io/matter-js/docs/files/src_core_Engine.js.html): update delta, iterations and force lifecycle.
- S5: [Matter.Constraint API](https://brm.io/matter-js/docs/classes/Constraint.html): distance/pin behavior and solver stiffness.
- S6: [Matter upstream CCD issue #5](https://github.com/liabru/matter-js/issues/5): tunneling and mitigation limits.
- S7: [Planck documentation index](https://piqnt.github.io/planck.js/docs/): documented joint families and engine lineage.
- S8: [Planck core concepts](https://piqnt.dev/planck.js/docs/core-concepts.html): continuous collision overview. Exact release behavior must be verified in the spike.
