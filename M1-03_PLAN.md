# M1-03 — Production Planck Adapter implementation plan

Status: PLAN ONLY; implementation requires user approval. Dependency: accepted
M1-02 (PR #1, merge 00fe21a5df232d9bde879323baebdc9be00edf89).
Sources: M1_TASKS.md, ARCHITECTURE.md, TEST_PLAN.md, DECISIONS.md and BENCHMARKS.md.
This decomposes the existing scope; it changes no schema or numerical thresholds.

## Small implementation steps

1. Define engine-independent adapter, capability result, ordered tick-input and SI
   snapshot contracts. SceneDocument remains the only authored model. Register
   exact engine Planck 1.5.1 / adapter version / planck-1.5.1-si-v1 together;
   choose and record the adapter version before implementation. Unknown versions
   and the existing Matter example cannot fall back to this engine. Tests:
   unsupported profile/settings and no partial runtime on rejection.
2. Implement capability validation before engine construction: circles, rectangles
   (including finite static floors), and validated convex 3–8 vertex fixtures;
   equal static/dynamic friction only. Gate geometry/material/motion limits and
   complete student-control ranges, not only authored defaults. Reject constraints
   and unsupported features with structured pointers. Keep inspection validation
   separate from execution qualification; M1-02 success alone never authorizes run.
3. Construct fresh worlds in stable UUID order. Native imports remain only inside
   physics/adapters. Copy authored initial conditions; use SI metres/kg/seconds,
   y up and CCW. Explicit lamina mass/inertia: disk mr²/2, rectangle m(w²+h²)/12,
   polygon integrals; density means kg/m². Static runtime inverse mass/inertia
   zero without Infinity in JSON. Tests: shape/mass/density/inertia, coordinate
   signs, initial velocity, detached immutable source, failed construction cleanup.
4. Implement deterministic logical stepping and snapshots: dt=1/120 s, four
   substeps h=1/480 s, velocity/position iterations 12/12; persisted constraint
   budget 12 maps to shared Planck iterations, not a fictional third solver.
   Set restitution velocityThreshold=0 once before worlds, sleeping/drag off,
   warm starting and continuous physics on. Record contact mixing (Planck
   geometric-mean friction and max restitution) and native settings. Apply
   supported constant N forces at moving body-local anchors every substep;
   test torque with a net-zero-force couple. No wall-clock/UI scheduler here.
5. Publish numerical fixtures through this production boundary, independent of
   PoC imports. Record environment, profile, settings, stable creation order,
   raw trajectories and errors. Test fresh-world reconstruction/replay, dispose,
   source isolation and interleaved worlds. Keep all existing suites intact.

## Numerical acceptance (unchanged TEST_PLAN.md gates)

All basic cases use the selected fixed profile. These are expected results,
not newly executed production-adapter evidence.

| Case | Reference / mandatory criteria |
| --- | --- |
| B1 free fall, r=.1 m, m=1 kg, (0,20), rest, g=9.81, 1 s | y=15.095 m, vy=-9.81 m/s. Across ticks position/4.905 m and velocity/9.81 m/s errors ≤1%; endpoint displacement/speed separately ≤1%; transverse position/speed ≤1e-8. Repeat .1/10 kg: trajectories agree ≤1e-7 m. |
| B2 projectile, same disk, v=(8,6), 1 s | x=8 m, y=21.095 m, vy=-3.81 m/s. Trajectory position/8 m and velocity/10 m/s errors ≤1%; endpoint x and vertical displacement 1.095 m separately ≤1%; apex time 6/9.81 and height gain 36/(2×9.81) ≤1%. |
| B3 elastic disks, r=.25 m, masses 1/2 kg, centres ±1 m, vx=2/0, 1.5 s | Contact .75 s within 1/120+.0075 s; average velocities over 1–1.25 s = -2/3, 4/3 m/s, each ≤1%; momentum 2 kg·m/s and energy 2 J drift ≤1%; transverse speed/spin ≤1e-6; penetration ≤.0025 m. Repeat equal masses for velocity exchange. |
| Rectangle torque, m=2 kg, 2×1 m, 1 N·m couple, 1 s | I=5/6 kg·m²; omega=1.2 rad/s, angle=.6 rad, errors ≤1%, no resultant force. Disk/polygon inertia checked against independent formulas. |
| Force persistence, m=2 kg, F=4 N, gravity off, 1 s | v=2 m/s and x=1 m, errors ≤1%; detects missing substep force application. |
| Reproducibility/isolation | Fresh engines in the same runtime: maximum absolute SI state difference ≤1e-10 for short fixtures; unchanged authored JSON/IDs; independent worlds cannot leak state. |
| Boundary conversions | SI/native round trips ≤1e-12 relative or absolute-scaled error; screen/view values cannot affect snapshots. |

Convergence probes use separate named h=1/120,1/240,1/480 profiles and h/2 where
required by TEST_PLAN; never change the production timestep to hide a failure.
The recorded h=1/240 projectile endpoint failure (1.866%) remains documented;
selected h=1/480 PoC error was 0.9332%, so the production port has little margin.
B4/B7 joints/springs, Atwood and rolling are not passes or M1-03 supported features.

## Numerical envelope and risks

- Preserve native linearSlop=.005 m, polygonRadius=.01 m, maxTranslation=2 m per
  substep and maxRotation=pi/2 per substep. Establish measured minimum dimensions,
  speed/acceleration/mass-ratio limits. Reject predicted clamp violations before
  stepping, and detect unexpected violations with a diagnostic/stop; do not
  silently clamp state, thicken geometry or alter solver settings. Contact impulses
  can defeat a simplistic initial-speed check, so test force/contact-driven limits.
- Single Coulomb coefficient cannot represent distinct static/dynamic friction.
  Reject unequal authored values. Rolling already fails slip/penetration gates;
  do not add no-slip corrections or certify it from visual behavior.
- Polygons >8 vertices, concavity/decomposition, joints/rope/springs, pulleys,
  gears, dampers and motors stay execution-blocked. No unvalidated substitutions.
- Native global settings can affect multiple worlds; configure once and test
  interleaved isolation. Contact solver tolerances, tunneling, extreme scales and
  mass ratios need explicit supported-envelope results, not blanket accuracy.
- Same-runtime replay is the M1-03 gate. Cross-browser tolerances (1e-7 before
  contact/1e-5 after), real Safari/iPad performance and 10-minute stress remain
  separately measured release gates; no Worker or UI redesign without evidence.

## Exit criteria

Every M1-03 row requirement and numerical gate above passes through production
code; unsupported cases reject before construction; exact profile/settings and
supported envelope documented; stable IDs and immutable authored state preserved;
no engine handles escape snapshots. Run generated consistency/typecheck, lint,
application/adapter tests, M0 fixtures, unchanged PoC verification and production
build. Report raw errors/failures and actual environments. Preserve Scene v1 and
existing thresholds. No canvas/editor controls, persistence, M1-04 work or
advanced mechanism implementation belongs to this task. Stop for acceptance.
