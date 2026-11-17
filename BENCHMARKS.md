# M0.5 executable benchmark report

Executed 2026-11-17. This report supersedes the M0 statement that no engine comparisons have run. The original M0 files are preserved in baseline commit `65dfde9`. No editor or production physics adapter has been implemented.

## Scope and reproducibility

Environment: v24.22.1, linux x64, AMD EPYC 9V74 80-Core Processor. Exact dependencies: Matter.js 0.20.0, Planck.js 1.5.1; PoC adapter 0.1.0-poc. Source/lockfile SHA-256, per-trajectory SHA-256 and timestamp are in [results.json](poc/engine-comparison/results/results.json). Reproduction instructions: [PoC README](poc/engine-comparison/README.md).

93 benchmark configurations actually executed: 59 PASS and 34 FAIL; 3 additional Matter rope entries are UNSUPPORTED and were not executed. These totals include all step sizes and supplemental masses, not just the recommended settings. Each executed configuration has a committed raw trajectory. Additionally executed: 21 same-runtime replay comparisons, 2 CPU load probes, 4 boundary probes, 13 verification tests and the 25 existing M0 structural checks. A verification-suite pass does not certify a failed physics benchmark.

No browser/iPad, production build/typecheck, persistence, full editor, real embed, Atwood/pulley, cross-browser determinism or production schema semantic-validator test was run. Node CPU timing is not browser fps or iPad evidence.

## Frozen integration and contact configuration

All scenes use SI with y up, gravity (0,-9.81) m/s² where applicable, explicit physical uniform-lamina inertia, no drag, sleeping disabled and deterministic creation order. Logical tick=1/120 s. Executed integration steps h=1/120, 1/240 and 1/480 s (1, 2 and 4 fixed substeps per logical tick). Report tables below use h=1/480 unless indicated. All time samples are integer logical ticks; there is no analytic trajectory injection or post-hoc time shift.

| Setting | Matter.js | Planck.js |
| --- | --- | --- |
| Solver | Position 12, velocity 12, constraint 8 iterations | Position 12, velocity 12; joints share those budgets, no independent constraint-iteration parameter |
| Units | 100 native length units/m; ms; mass kg | m, s, kg directly |
| Velocity conversion | native v = SI v ×100/60; angular v = SI angular v/60 | direct |
| Force/torque conversion | Fnative = FSI ×100/10⁶; torque native = SI torque ×100²/10⁶; Inative = ISI ×100² | direct |
| Collision geometry | Default circle factory polygon hull, fixed by native radius; no hidden resolution increase | Native circle and polygon skin |
| Collision tolerances | slop 0.0001 m | upstream linearSlop 0.005 m and polygonRadius 0.01 m unchanged |
| Restitution | max of pair values, e=1 in elastic test | max; **velocityThreshold explicitly set to 0 m/s**, replacing upstream game default 1 m/s |
| Friction | Both surfaces dynamic mu=0.4, static multiplier=1 | Both surfaces single Coulomb mu=0.4 (pair mix sqrt) |
| Continuous physics | No built-in CCD | continuous physics and warm starting on |

Equivalent physics does not mean identical engine internals. Both receive the same mass, geometry, velocities, forces, desired material coefficient and h. Distinct native iteration meanings, contact skins and circle approximations are documented rather than concealed. Planck global maxTranslation=2 m/substep and maxRotation=π/2 rad/substep remain enabled; benchmark bodies do not reach them. Production must detect out-of-envelope motion before these clamps silently alter an experiment.

## Fixtures, references and support

| Case | Conditions, duration and independent reference | Implementation |
| --- | --- | --- |
| Free fall B1 | 1 kg, r=0.1 m at (0,20), rest; 1 s; y=20−gt²/2, vy=−gt. Repeat m=0.1,10 kg. | Built-in gravity/integration, both |
| Projectile B2 | Same disk, v=(8,6) m/s, 1 s; x=8t, y=20+6t−gt²/2; apex t=6/g. Endpoint vertical displacement 1.095 m has its own relative-error gate. | Built-in both |
| Elastic collision B3 | Gravity/friction/drag zero; r=0.25 m, centres (−1,0),(1,0), masses 1,2 kg, vx=2,0 m/s, e=1; 1.5 s. First contact 0.75 s; separated velocities −2/3,4/3 m/s. Conservation and penetration also checked. | Built-in both |
| Revolute pendulum (additional physical model) | 1 kg disk, r=0.1 m, COM distance L=1 m, Icom=0.005 kg·m², hinge at origin, initial theta=0.1 rad; 10 s. Equation theta″=−mgL/(Icom+mL²) sin(theta). Exact period=2.012333237 s via elliptic integral/AGM; independent RK4 reference for theta. | Native Planck RevoluteJoint; Matter documented zero-length distance-pin approximation |
| Point pendulum B4 | Same COM geometry but a massless length constraint at disk centre, rotation decoupled; 10 s. theta″=−g/L sin(theta); period=2.007321191 s. | Built-in distance constraints, both |
| Spring B7 | m=1 kg, x=1.1 m, anchor 0, rest=1 m, k=10 N/m, c=0; 10 s. q=0.1 cos(√10 t), T=1.986917653 s. | **Custom physical force law**, built-in force integration in both; not a native soft-constraint claim |
| Damped spring B7 extension | c=0.2 N·s/m; alpha=0.1, wd=√9.99; q=0.1 exp(−alpha t)[cos(wd t)+(alpha/wd)sin(wd t)]. | Same custom force law; energy monotonicity checked |
| Rotation | 2 kg, 2×1 m rectangle, I=5/6 kg·m²; force couple gives torque=1 N·m with zero net force; 1 s. omega=1.2 rad/s, angle=0.6 rad. Additional disk torque test: I=0.02, omega=50 rad/s. | Built-in rigid-body integration, both; explicit physical inertia |
| Rolling B6 feasibility variant | 1 kg solid disk, r=0.2, I=0.02, 30° incline, rest/tangent start; 1 s. a=(2/3)g sin30°=3.27; s=1.635 m, v=3.27 m/s, abs(omega)=16.35 rad/s. | Native contacts/friction, both; no imposed no-slip velocities |
| Length constraint | 1 kg at (0,−1), world anchor origin, length=1 m, gravity, rest; 2 s. Stationary; length drift≤0.001 m and speed≤0.001 m/s. | Native bilateral distance constraints, both |
| Rope feasibility | Same taut hanging fixture, plus slack body x=0.5 m, vx=−0.2 m/s, gravity=0, maxLength=1 m; after 1 s x=0.3 and vx=−0.2 (no compression/pushing). | Native Planck RopeJoint; no native Matter rope, no custom rope implemented |

Important differences from the M0 plan: the requested revolute test is a physical pendulum, not the point-mass B4 model; both are executed and compared to their own references. The rolling comparison uses common mu=0.4, sufficient for ideal rolling (minimum tan30°/3≈0.19245), instead of B6 distinct static/dynamic 0.5/0.4: Planck exposes a single Coulomb coefficient. Therefore it is a documented feasibility variant, **not full certification of original B6**. The same ideal rolling acceleration remains applicable while sticking. Initial placement is the same nominal disk-plane tangency; native skin/faceted support differences are part of the measured limits.

## Numerical results at h=1/480 s

PASS means **all** metrics for that case passed. Percent errors below use either relative error for a nonzero oracle or the fixed characteristic scales in TEST_PLAN.md; near-zero quantities use absolute error. Exact tolerances are recorded with every metric in results.json.

| Case | Matter.js | Planck.js |
| --- | --- | --- |
| freeFall | PASS | PASS |
| projectile | PASS | PASS |
| elasticCollision | FAIL | PASS |
| revolutePendulum | FAIL | PASS |
| spring | PASS | PASS |
| rotation | PASS | PASS |
| rolling | FAIL | FAIL |
| rope | UNSUPPORTED | PASS |
| lengthConstraint | PASS | PASS |
| pointPendulum | FAIL | PASS |
| dampedSpring | PASS | PASS |

Detailed results (errors shown in % except explicitly absolute or interval-count metrics):

### matter-js — freeFall

Result: **PASS**. Support: built-in. All sampled states finite; max speed=9.81 m/s, max abs angular speed=0 rad/s. Finiteness alone does not establish stability.

| Metric | Reference | Simulated | Error | Limit |
| --- | --- | --- | --- | --- |
| endpoint downward displacement (m) | 4.905 | 4.91521875 | 0.20833334% | 1% |
| endpoint vy (m/s) | -9.81 | -9.81 | 2.349662e-09% | 1% |
| max normalized position error | 0 | 0.002083333357 | 0.20833334% | 1% |
| max normalized velocity error | 0 | 2.349661976e-11 | 2.349662e-09% | 1% |
| max x drift (m) | 0 | 0 | 0 absolute | 1e-08 |
| max vx (m/s) | 0 | 0 | 0% | 1e-06% |

[Raw trajectory](poc/engine-comparison/results/022-matter-js-freeFall-h480.csv)

### matter-js — projectile

Result: **PASS**. Support: built-in. All sampled states finite; max speed=10 m/s, max abs angular speed=0 rad/s. Finiteness alone does not establish stability.

| Metric | Reference | Simulated | Error | Limit |
| --- | --- | --- | --- | --- |
| endpoint x (m) | 8 | 8 | 1.6098234e-12% | 1% |
| endpoint vertical displacement (m) | 1.095 | 1.08478125 | 0.93321917% | 1% |
| apex time (s) | 0.6116207951 | 0.6116207951 | 2.226506e-09% | 1% |
| apex height gain (m) | 1.834862385 | 1.828592969 | 0.3416832% | 1% |
| max normalized position error | 0 | 0.001277343737 | 0.12773437% | 1% |
| max normalized velocity error | 0 | 2.475287312e-11 | 2.4752873e-09% | 1% |

[Raw trajectory](poc/engine-comparison/results/023-matter-js-projectile-h480.csv)

### matter-js — elasticCollision

Result: **FAIL**. Support: built-in. All sampled states finite; max speed=2 m/s, max abs angular speed=0 rad/s. Finiteness alone does not establish stability.

| Metric | Reference | Simulated | Error | Limit |
| --- | --- | --- | --- | --- |
| post-collision v1 (m/s) | -0.6666666667 | -0.5913865233 | 11.292022% | 1% |
| post-collision v2 (m/s) | 1.333333333 | 1.295693262 | 2.8230054% | 1% |
| contact onset (s) | 0.75 | 0.7520833333 | 0.0020833333 absolute | 0.015833333 |
| max relative momentum drift | 0 | 4.52970994e-14 | 4.5297099e-12% | 1% |
| max relative energy drift | 0 | 0.07315498087 | 7.3154981% | 1% |
| max transverse speed | 0 | 0 | 0 absolute | 1e-06 |
| max spin (rad/s) | 0 | 0 | 0% | 0.0001% |
| max geometric overlap (m) | 0 | 1.709743458e-14 | 1.7097435e-14 absolute | 0.0025 |

[Raw trajectory](poc/engine-comparison/results/024-matter-js-elasticCollision-h480.csv)

### matter-js — revolutePendulum

Result: **FAIL**. Support: built-in zero-length distance pin approximation (not a native revolute solver). All sampled states finite; max speed=477.69866 m/s, max abs angular speed=1577311.4 rad/s. Finiteness alone does not establish stability.

| Metric | Reference | Simulated | Error | Limit |
| --- | --- | --- | --- | --- |
| period (s) | 2.012333237 | 0.03364948079 | 98.327838% | 1% |
| max theta error / initial amplitude | 0 | 32.06743913 | 3206.7439% | 1% |
| max radius drift (m) | 0 | 0.9876920703 | 0.98769207 absolute | 0.001 |
| max relative energy drift | 0 | 1.269107159e+11 | 1.2691072e+13% | 1% |
| measured same-direction period intervals | 4 | 296 | 292 absolute | 0 |
| max local hinge separation (m) | 0 | 1.618346592 | 1.6183466 absolute | 0.001 |

[Raw trajectory](poc/engine-comparison/results/025-matter-js-revolutePendulum-h480.csv)

### matter-js — spring

Result: **PASS**. Support: custom SI Hooke/damping force law over built-in force integration; no solver stiffness mapping. All sampled states finite; max speed=0.31622933 m/s, max abs angular speed=0 rad/s. Finiteness alone does not establish stability.

| Metric | Reference | Simulated | Error | Limit |
| --- | --- | --- | --- | --- |
| period (s) | 1.986917653 | 1.986914081 | 0.00017978638% | 1% |
| max displacement error / amplitude | 0 | 0.003347807651 | 0.33478077% | 1% |
| max velocity error / amplitude speed | 0 | 5.727185413e-05 | 0.0057271854% | 1% |
| measured same-direction period intervals | 4 | 4 | 0 absolute | 0 |
| max relative energy drift | 0 | 0.003304925562 | 0.33049256% | 1% |

[Raw trajectory](poc/engine-comparison/results/026-matter-js-spring-h480.csv)

### matter-js — rotation

Result: **PASS**. Support: built-in. All sampled states finite; max speed=0 m/s, max abs angular speed=1.2 rad/s. Finiteness alone does not establish stability.

| Metric | Reference | Simulated | Error | Limit |
| --- | --- | --- | --- | --- |
| endpoint omega (rad/s) | 1.2 | 1.2 | 1.5450604e-11% | 1% |
| endpoint angle (rad) | 0.6 | 0.60125 | 0.20833333% | 1% |
| max COM drift (m) | 0 | 0 | 0 absolute | 1e-08 |
| max COM velocity (m/s) | 0 | 0 | 0% | 1e-06% |

[Raw trajectory](poc/engine-comparison/results/027-matter-js-rotation-h480.csv)

### matter-js — rolling

Result: **FAIL**. Support: built-in. All sampled states finite; max speed=2.8845944 m/s, max abs angular speed=14.260537 rad/s. Finiteness alone does not establish stability.

| Metric | Reference | Simulated | Error | Limit |
| --- | --- | --- | --- | --- |
| endpoint displacement (m) | 1.635 | 1.457798689 | 10.838001% | 1% |
| endpoint speed (m/s) | 3.27 | 2.778340922 | 15.035446% | 1% |
| endpoint angular speed (rad/s) | 16.35 | 14.26053657 | 12.779593% | 1% |
| max displacement error / 1.635m | 0 | 0.1083800066 | 10.838001% | 1% |
| max speed error / 3.27m/s | 0 | 0.1503544582 | 15.035446% | 1% |
| max angular error / 16.35rad/s | 0 | 0.2031241499 | 20.312415% | 1% |
| max slip / terminal speed | 0 | 0.1065921797 | 10.659218% | 1% |
| max energy drift / released PE at 1s | 0 | 0.156121738 | 15.612174% | 1% |
| max contact penetration (m) | 0 | 0.0005586090981 | 0.0005586091 absolute | 0.002 |

[Raw trajectory](poc/engine-comparison/results/028-matter-js-rolling-h480.csv)

### matter-js — lengthConstraint

Result: **PASS**. Support: built-in bilateral distance constraint. All sampled states finite; max speed=3.7162539e-05 m/s, max abs angular speed=0 rad/s. Finiteness alone does not establish stability.

| Metric | Reference | Simulated | Error | Limit |
| --- | --- | --- | --- | --- |
| max relative length drift (taut) | 0 | 3.754073046e-07 | 3.754073e-05% | 0.1% |
| max stationary speed (m/s) | 0 | 3.716253912e-05 | 0.0037162539% | 0.1% |

[Raw trajectory](poc/engine-comparison/results/030-matter-js-lengthConstraint-h480.csv)

### matter-js — pointPendulum

Result: **FAIL**. Support: built-in. All sampled states finite; max speed=0.31178593 m/s, max abs angular speed=0 rad/s. Finiteness alone does not establish stability.

| Metric | Reference | Simulated | Error | Limit |
| --- | --- | --- | --- | --- |
| period (s) | 2.007321191 | 2.007254319 | 0.0033313994% | 1% |
| max theta error / initial amplitude | 0 | 0.07843436203 | 7.8434362% | 1% |
| max radius drift (m) | 0 | 3.735377416e-07 | 3.7353774e-07 absolute | 0.001 |
| max relative energy drift | 0 | 0.1518637245 | 15.186372% | 1% |
| measured same-direction period intervals | 4 | 4 | 0 absolute | 0 |

[Raw trajectory](poc/engine-comparison/results/031-matter-js-pointPendulum-h480.csv)

### matter-js — dampedSpring

Result: **PASS**. Support: custom SI Hooke/damping force law over built-in force integration; no solver stiffness mapping. All sampled states finite; max speed=0.3012095 m/s, max abs angular speed=0 rad/s. Finiteness alone does not establish stability.

| Metric | Reference | Simulated | Error | Limit |
| --- | --- | --- | --- | --- |
| period (s) | 1.987911858 | 1.987701279 | 0.010592981% | 1% |
| max displacement error / amplitude | 0 | 0.00329126634 | 0.32912663% | 1% |
| max velocity error / amplitude speed | 0 | 0.001232296977 | 0.1232297% | 1% |
| measured same-direction period intervals | 4 | 4 | 0 absolute | 0 |
| max per-tick energy increase / E0 | 0 | 0 | 0% | 0.1% |

[Raw trajectory](poc/engine-comparison/results/032-matter-js-dampedSpring-h480.csv)

### planck — freeFall

Result: **PASS**. Support: built-in. All sampled states finite; max speed=9.81 m/s, max abs angular speed=0 rad/s. Finiteness alone does not establish stability.

| Metric | Reference | Simulated | Error | Limit |
| --- | --- | --- | --- | --- |
| endpoint downward displacement (m) | 4.905 | 4.91521875 | 0.20833333% | 1% |
| endpoint vy (m/s) | -9.81 | -9.81 | 3.8025987e-13% | 1% |
| max normalized position error | 0 | 0.002083333333 | 0.20833333% | 1% |
| max normalized velocity error | 0 | 3.802598739e-15 | 3.8025987e-13% | 1% |
| max x drift (m) | 0 | 0 | 0 absolute | 1e-08 |
| max vx (m/s) | 0 | 0 | 0% | 1e-06% |

[Raw trajectory](poc/engine-comparison/results/055-planck-freeFall-h480.csv)

### planck — projectile

Result: **PASS**. Support: built-in. All sampled states finite; max speed=10 m/s, max abs angular speed=0 rad/s. Finiteness alone does not establish stability.

| Metric | Reference | Simulated | Error | Limit |
| --- | --- | --- | --- | --- |
| endpoint x (m) | 8 | 8 | 2.8865799e-13% | 1% |
| endpoint vertical displacement (m) | 1.095 | 1.08478125 | 0.93321918% | 1% |
| apex time (s) | 0.6116207951 | 0.6116207951 | 2.722822e-13% | 1% |
| apex height gain (m) | 1.834862385 | 1.828592969 | 0.3416832% | 1% |
| max normalized position error | 0 | 0.00127734375 | 0.12773437% | 1% |
| max normalized velocity error | 0 | 2.220446049e-15 | 2.220446e-13% | 1% |

[Raw trajectory](poc/engine-comparison/results/056-planck-projectile-h480.csv)

### planck — elasticCollision

Result: **PASS**. Support: built-in. All sampled states finite; max speed=2 m/s, max abs angular speed=0 rad/s. Finiteness alone does not establish stability.

| Metric | Reference | Simulated | Error | Limit |
| --- | --- | --- | --- | --- |
| post-collision v1 (m/s) | -0.6666666667 | -0.6666666667 | 0% | 1% |
| post-collision v2 (m/s) | 1.333333333 | 1.333333333 | 1.6653345e-14% | 1% |
| contact onset (s) | 0.75 | 0.7541666667 | 0.0041666667 absolute | 0.015833333 |
| max relative momentum drift | 0 | 0 | 0% | 1% |
| max relative energy drift | 0 | 1.110223025e-16 | 1.110223e-14% | 1% |
| max transverse speed | 0 | 0 | 0 absolute | 1e-06 |
| max spin (rad/s) | 0 | 0 | 0% | 0.0001% |
| max geometric overlap (m) | 0 | 0 | 0 absolute | 0.0025 |

[Raw trajectory](poc/engine-comparison/results/057-planck-elasticCollision-h480.csv)

### planck — revolutePendulum

Result: **PASS**. Support: built-in RevoluteJoint. All sampled states finite; max speed=0.31228151 m/s, max abs angular speed=0.31228151 rad/s. Finiteness alone does not establish stability.

| Metric | Reference | Simulated | Error | Limit |
| --- | --- | --- | --- | --- |
| period (s) | 2.012333237 | 2.012329296 | 0.00019582606% | 1% |
| max theta error / initial amplitude | 0 | 0.003322035236 | 0.33220352% | 1% |
| max radius drift (m) | 0 | 3.330669074e-16 | 3.3306691e-16 absolute | 0.001 |
| max relative energy drift | 0 | 0.003928195113 | 0.39281951% | 1% |
| measured same-direction period intervals | 4 | 4 | 0 absolute | 0 |
| max local hinge separation (m) | 0 | 2.288783399e-16 | 2.2887834e-16 absolute | 0.001 |

[Raw trajectory](poc/engine-comparison/results/058-planck-revolutePendulum-h480.csv)

### planck — spring

Result: **PASS**. Support: custom SI Hooke/damping force law over built-in force integration; no solver stiffness mapping. All sampled states finite; max speed=0.31622933 m/s, max abs angular speed=0 rad/s. Finiteness alone does not establish stability.

| Metric | Reference | Simulated | Error | Limit |
| --- | --- | --- | --- | --- |
| period (s) | 1.986917653 | 1.986914081 | 0.00017978638% | 1% |
| max displacement error / amplitude | 0 | 0.003347807653 | 0.33478077% | 1% |
| max velocity error / amplitude speed | 0 | 5.727185717e-05 | 0.0057271857% | 1% |
| measured same-direction period intervals | 4 | 4 | 0 absolute | 0 |
| max relative energy drift | 0 | 0.003304925571 | 0.33049256% | 1% |

[Raw trajectory](poc/engine-comparison/results/059-planck-spring-h480.csv)

### planck — rotation

Result: **PASS**. Support: built-in. All sampled states finite; max speed=0 m/s, max abs angular speed=1.2 rad/s. Finiteness alone does not establish stability.

| Metric | Reference | Simulated | Error | Limit |
| --- | --- | --- | --- | --- |
| endpoint omega (rad/s) | 1.2 | 1.2 | 1.2027416e-12% | 1% |
| endpoint angle (rad) | 0.6 | 0.60125 | 0.20833333% | 1% |
| max COM drift (m) | 0 | 0 | 0 absolute | 1e-08 |
| max COM velocity (m/s) | 0 | 0 | 0% | 1e-06% |

[Raw trajectory](poc/engine-comparison/results/060-planck-rotation-h480.csv)

### planck — rolling

Result: **FAIL**. Support: built-in. All sampled states finite; max speed=3.2423183 m/s, max abs angular speed=16.416801 rad/s. Finiteness alone does not establish stability.

| Metric | Reference | Simulated | Error | Limit |
| --- | --- | --- | --- | --- |
| endpoint displacement (m) | 1.635 | 1.624463424 | 0.64443893% | 1% |
| endpoint speed (m/s) | 3.27 | 3.242318282 | 0.84653571% | 1% |
| endpoint angular speed (rad/s) | 16.35 | 16.41680143 | 0.40857144% | 1% |
| max displacement error / 1.635m | 0 | 0.006444389281 | 0.64443893% | 1% |
| max speed error / 3.27m/s | 0 | 0.00846535705 | 0.84653571% | 1% |
| max angular error / 16.35rad/s | 0 | 0.004085714379 | 0.40857144% | 1% |
| max slip / terminal speed | 0 | 0.01255107143 | 1.2551071% | 1% |
| max energy drift / released PE at 1s | 0 | 0.005168673194 | 0.51686732% | 1% |
| max contact penetration (m) | 0 | 0.007048 | 0.007048 absolute | 0.002 |

[Raw trajectory](poc/engine-comparison/results/061-planck-rolling-h480.csv)

### planck — rope

Result: **PASS**. Support: built-in unilateral RopeJoint. All sampled states finite; max speed=0 m/s, max abs angular speed=0 rad/s. Finiteness alone does not establish stability.

| Metric | Reference | Simulated | Error | Limit |
| --- | --- | --- | --- | --- |
| max relative length drift (taut) | 0 | 0 | 0% | 0.1% |
| max stationary speed (m/s) | 0 | 0 | 0% | 0.1% |
| slack free endpoint x (m) | 0.3 | 0.3 | 1.5358085e-12% | 1e-06% |
| slack free vx (m/s) | -0.2 | -0.2 | 0% | 1e-06% |

[Raw trajectory](poc/engine-comparison/results/062-planck-rope-h480.csv)

### planck — lengthConstraint

Result: **PASS**. Support: built-in bilateral distance constraint. All sampled states finite; max speed=0 m/s, max abs angular speed=0 rad/s. Finiteness alone does not establish stability.

| Metric | Reference | Simulated | Error | Limit |
| --- | --- | --- | --- | --- |
| max relative length drift (taut) | 0 | 0 | 0% | 0.1% |
| max stationary speed (m/s) | 0 | 0 | 0% | 0.1% |

[Raw trajectory](poc/engine-comparison/results/063-planck-lengthConstraint-h480.csv)

### planck — pointPendulum

Result: **PASS**. Support: built-in. All sampled states finite; max speed=0.3130693 m/s, max abs angular speed=0 rad/s. Finiteness alone does not establish stability.

| Metric | Reference | Simulated | Error | Limit |
| --- | --- | --- | --- | --- |
| period (s) | 2.007321191 | 2.007317212 | 0.00019823834% | 1% |
| max theta error / initial amplitude | 0 | 0.003330647607 | 0.33306476% | 1% |
| max radius drift (m) | 0 | 3.330669074e-16 | 3.3306691e-16 absolute | 0.001 |
| max relative energy drift | 0 | 0.003941484017 | 0.3941484% | 1% |
| measured same-direction period intervals | 4 | 4 | 0 absolute | 0 |

[Raw trajectory](poc/engine-comparison/results/064-planck-pointPendulum-h480.csv)

### planck — dampedSpring

Result: **PASS**. Support: custom SI Hooke/damping force law over built-in force integration; no solver stiffness mapping. All sampled states finite; max speed=0.3012095 m/s, max abs angular speed=0 rad/s. Finiteness alone does not establish stability.

| Metric | Reference | Simulated | Error | Limit |
| --- | --- | --- | --- | --- |
| period (s) | 1.987911858 | 1.987701279 | 0.010592981% | 1% |
| max displacement error / amplitude | 0 | 0.00329126634 | 0.32912663% | 1% |
| max velocity error / amplitude speed | 0 | 0.001232296976 | 0.1232297% | 1% |
| measured same-direction period intervals | 4 | 4 | 0 absolute | 0 |
| max per-tick energy increase / E0 | 0 | 0 | 0% | 0.1% |

[Raw trajectory](poc/engine-comparison/results/065-planck-dampedSpring-h480.csv)

## Step-size convergence and stability

| Engine / metric | h=1/120 | h=1/240 | h=1/480 |
| --- | --- | --- | --- |
| planck / freeFall: endpoint downward displacement (m) | 0.833333% | 0.416667% | 0.208333% |
| planck / projectile: endpoint vertical displacement (m) | 3.73288% | 1.86644% | 0.933219% |
| planck / revolutePendulum: max relative energy drift | 1.55534% | 0.782973% | 0.39282% |
| planck / spring: max displacement error / amplitude | 1.40401% | 0.68037% | 0.334781% |
| matter-js / elasticCollision: max relative energy drift | 7.3155% | 7.3155% | 7.3155% |
| matter-js / pointPendulum: max relative energy drift | 55.8284% | 31.3963% | 15.1864% |
| planck / rolling: max slip / terminal speed | 1.25494% | 1.25505% | 1.25511% |

The fixed 1/480 step is selected because projectile endpoint displacement fails at 1/240 (1.86644%) but passes at 1/480 (0.933219%). This is a narrow 1 s basic fixture, not a general guarantee; longer horizons can require different qualified profiles. Both engines integrate constant acceleration with a first-order positional bias. Planck pendulum and spring errors decrease over this sweep; contact/slip floors do not necessarily converge away.

Matter zero-length pin is unstable in this SI profile: at h=1/480 the maximum angular speed grows to ≈1.58×10⁶ rad/s and energy error exceeds 10¹¹. Its distance-rod pendulum stays bounded but dissipates ≈15.2% of initial swing energy over 10 s. These are failures of the tested settings/model, not proof that every possible Matter tuning fails. Do not reuse this pin as a physically qualified revolute joint.

Planck remains bounded over the tested pendulum, spring and rope horizons. Rolling stays bounded but fails maximum slip (1.2551%) and penetration (7.048 mm against 2 mm limit). Its native contact skin/slop and single friction coefficient need a separately named/profiled investigation; no tolerance was relaxed and no velocity overwrite was applied. Matter rolling is bounded but has ≈10.84% endpoint displacement error and ≈15.04% endpoint speed error with faceted hull contacts.

Mass supplement: free fall repeated at 0.1/1/10 kg; trajectory agreement was independently checked to 1e-7 m. Elastic collision m2=1,10,100 kg (m1=1) executed at all three steps. Planck passes all those collision cases. Matter fails all those profiles; reducing h does not remove its restitution/energy-error floor. A single two-body mass-ratio success does not validate a high-ratio mechanism chain.

## Boundary probes and performance

Four [boundary probes](poc/engine-comparison/results/stress.json) actually ran at h=1/480. Low-speed 0.2 m/s elastic collision: Planck yields −0.0666667 and 0.1333333 m/s (PASS with threshold=0); Matter yields 0.066385 and 0.066808 m/s (FAIL, almost inelastic). The upstream Planck threshold=1 m/s is a known model policy changed explicitly for educational elasticity; an unmodified-default control was not run, so its numerical result is not claimed here.

Thin-floor probe: r=0.01 m at y=0.2, vy=−200 m/s, 0.01 m thick floor, no gravity, 24 substeps. Matter tunnels to y=−9.8 m (FAIL); Planck keeps COM at or above 0.019375 m (PASS). There is no hidden thickening, speed clamp or raycast correction. This is one CCD boundary example, not unrestricted high-speed qualification.

21 fresh-engine replay comparisons at h=1/240 produced zero maximum absolute state difference in this Node runtime, including deterministic failed trajectories. Verification tests additionally repeat projectile/collision/revolute at the chosen h=1/480. Determinism is distinct from correctness. Cross-browser/iPad replay remains untested.

CPU-only 100-body/100-independent-distance-joint probe: 240 warmup ticks and 1200 measured ticks (10 simulated seconds), four substeps per logical tick:

| Engine | p50 logical tick ms | p95 ms | Max ms | Max rod length error m |
| --- | --- | --- | --- | --- |
| matter-js | 0.298641 | 0.427926 | 5.199268 | 3.73538e-07 |
| planck | 0.407925 | 0.554547 | 1.538132 | 2.88658e-15 |

Both p95 solver times are below the 8.333 ms logical-tick budget on this host, but this probe contains no colliding stack, renderer, graphs or touch input. Matter is faster in this specific workload; correctness and mechanism support outweigh that advantage. It does not meet the planned 10-minute browser/iPad performance qualification.

## Limitations and workarounds

- Select Planck for M1 basic rigid bodies. Reimplement a production adapter with these explicit settings and reuse the qualification fixtures as independent acceptance tests; do not import PoC classes into the app.
- Keep springs as a separately tested SI force law if introduced in M3. Planck has frequency/damping-ratio distance-joint APIs, but those are not qualified here as exact N/m and N·s/m springs; Matter relaxation stiffness also is not a physical k.
- Keep rolling, arbitrary high ratios, complex ropes/mechanisms and reaction-force meters disabled until their own acceptance tests pass. Native API availability alone is not certification. Slack-to-taut impact, rope chains and tension metering have not been tested.
- Use equal static/dynamic coefficients in the initial Planck material profile; reject unequal authored coefficients for execution, with an actionable message. Planck cannot independently represent both through its default fixture API. Do not silently map staticFriction to a multiplier or discard it.
- Detect Planck per-step translation/rotation limits and geometry/slop envelope; no hidden educational speed limit. Investigate contact skin/initial contact handling as an explicit alternative profile before claiming precise rolling.
- Browser/real iPad compatibility, graph/render cost, long runs and cross-browser replay are still required during M1 and later release gates. Neither engine is certified as scientific software.

Decision and readiness: [DECISIONS.md](DECISIONS.md), [M1_TASKS.md](M1_TASKS.md), [PROGRESS.md](PROGRESS.md).
