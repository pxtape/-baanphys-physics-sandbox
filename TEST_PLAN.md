# Test plan and physics qualification

Status: proposed tests, not measured results. Only the JSON Schema/document checks described in the final M0 delivery are executed now. A solver must pass a case at frozen settings before that capability is advertised.

## Harness and error policy

Headless tests exercise the production SI adapter, not a separate animation or analytical integrator. Analytical results are independent oracles. Record scene JSON, engine/adapter/profile versions, browser/Node version, platform, seed, creation order, logical timestep, substeps, iterations, physical inertia, drag, sleeping, friction/restitution mixing and raw trajectory CSV. No UI/render dependence.

Baseline candidate settings: logical dt = 1/120 s, 2 substeps (h = 1/240 s), position/velocity/constraint iterations = 12/12/8, seed=1, sleeping off, air drag zero. Gravity (0,-9.81) m/s² except where specified. Use engine-specific equivalent iteration settings only in a named profile, not an undocumented substitution. Steps at h=1/120 and h=1/480 are separate convergence profiles. Initial geometry is non-overlapping except designed contact; uniform lamina inertia is explicit. No post-hoc curve fitting, time shifting or analytic state injection.

For nonzero scalar metrics use |measured-reference|/|reference| ≤0.01. For sampled vector trajectories use max norm(error) divided by a fixed characteristic scale stated per case, ≤0.01; never divide by instantaneous zero crossings. Check both stated trajectory and scalar metrics; period alone cannot excuse phase/amplitude errors. Near-zero conserved values use absolute tolerances stated below. Samples are compared at matching integer logical ticks; interpolate zero crossings linearly using adjacent tick samples only. Exclude initial t=0 from finite-difference acceleration comparisons. Do not smooth curves to hide errors.

## Analytical benchmark cases

### B1 Free fall (M2 and thin-slice gate)

A 1 kg disk of radius 0.1 m at (0,20), initially at rest, no contacts, 1 s (120 ticks). Oracles: y=20-gt²/2, vy=-gt, x=vx=0. Check all tick samples: position error / 4.905 m ≤1%, velocity error / 9.81 m/s ≤1%; endpoint displacement and speed each ≤1%. |x|≤1e-8 m, |vx|≤1e-8 m/s. Repeat with 0.1 and 10 kg; trajectories agree within 1e-7 m. Exposes gravity/time/force scaling and unintended drag.

### B2 Projectile (M2 gate)

1 kg disk at (0,20), v=(8,6) m/s, no contact, 1 s. Oracles x=8t, y=20+6t-gt²/2, v=(8,6-gt). Position error normalized by 8 m and velocity error by 10 m/s ≤1% across all samples. Endpoint x and vertical displacement (1.095 m) each ≤1% individually. Vertical apex time 6/g and height gain 36/(2g) each ≤1% using sampled crossing/extremum. Test more than the easy endpoint.

### B3 Elastic collision (M2 gate)

Gravity/drag/friction zero. Disk radii 0.25 m, centres (-1,0),(1,0); m1=1 kg, m2=2 kg; velocities (2,0),(0,0). Restitution=1, no spin; uniform disk inertias. Simulate 1.5 s; analytic first contact at 0.75 s. Check contact onset within one logical dt plus 1% of 0.75 s. Average velocities over t=1.00–1.25 s after separation: v1=-2/3, v2=4/3 m/s, each ≤1%. Initial momentum 2 kg·m/s and energy 2 J: relative drift ≤1%; |vy|≤1e-6 m/s and |omega|≤1e-6 rad/s. Also equal-mass velocity exchange fixture. Penetration bounded by 0.0025 m (1% radius). A failed contact timing or energy check cannot be hidden by only plotting trajectories.

### B4 Pendulum (M3 gate)

Ideal point-mass geometry realized by a 1 kg disk whose centre is connected by an ideal 1 m distance rod to world origin, anchor at its centre. Disk rotation is decoupled from swing. Initial angle theta0=0.1 rad from downward vertical, position (L sin theta0,-L cos theta0), v=0, no friction/drag; 10 s. Small-angle period T0=2pi sqrt(L/g); exact finite-amplitude period T=4 sqrt(L/g) K(sin²(theta0/2)), approximately 2.00732 s; small-angle truncation <0.063%. Use exact period oracle or include the stated approximation budget within 1% (not on top of it).

Mean of at least four same-direction zero-crossing intervals differs by ≤1%; max |radius-L|/L ≤0.001. Total pendulum energy relative to mgL(1-cos theta0) drifts ≤1%. Sample theta against an independently converged nonlinear pendulum ODE reference (reference dt≤1e-5 s or equivalent verified accuracy), normalized by theta0, ≤1% over 10 s. This prevents accepting a good period with excessive phase drift. Finite bob attached at its edge is a different physical-pendulum test.

### B5 Ideal Atwood machine (M7 pulley gate; M0 risk probe)

m1=1 kg, m2=2 kg, point masses initially at (-1,0),(1,0), zero velocity; two fixed guide points at (-1,3),(1,3), ideal taut massless inextensible rope, massless frictionless pulley, gravity down. No contact, 1 s. Segment lengths sum to 6 m; initial acceleration magnitude a=(m2-m1)g/(m1+m2)=3.27 m/s², tension T=2m1m2g/(m1+m2)=13.08 N. Mass 1 moves up, mass 2 down. Check displacements ±at²/2, velocities ±at with scales 1.635 m and 3.27 m/s ≤1%; rope-length drift /6 m ≤0.001. If tension is exposed, mean t=0.1–1 s ≤1%; otherwise do not offer a tension meter. No guessed forces or prescribed trajectories. Unsupported pulley returns a capability error; that is not a benchmark pass.

### B6 Rolling without slipping (M7 rolling gate; M0 risk probe)

Uniform solid disk m=1 kg, r=0.2 m, I=0.02 kg·m² on a long static 30° incline; start at rest in tangential contact, no restitution/rolling resistance/air drag. Static friction sufficient: theoretical required mu≥tan(30°)/3≈0.19245; use effective static mu=0.5 and dynamic mu=0.4, with the profile's combination rule recorded. Track tangent-down coordinate s, initial s=0; gravity normal presses disk into the surface. Simulate 1 s with no boundary impacts.

Oracle a=(2/3)g sin(30°)=3.27 m/s², s=at²/2, v=at, |omega|=v/r. Position/speed scales 1.635 m and 3.27 m/s; all-sample errors ≤1%. Angular speed normalized by 16.35 rad/s ≤1%; max |v-r|omega|| /3.27 ≤1%; total energy drift relative to released potential energy at t=1 ≤1%. Normal penetration ≤0.002 m. Faceted circles, default inertia scaling and friction approximations may fail this case; report failure instead of enforcing rolling by overwriting velocity.

### B7 Spring oscillation (M3 spring gate)

Gravity/contact/drag zero. One 1 kg body at (1.1,0), world anchor at (0,0), spring restLength=1 m, k=10 N/m, c=0; centre anchor, v=0; 10 s. Motion stays x>0, so q=x-1 obeys q=0.1 cos(sqrt(10)t), vx=-0.1 sqrt(10) sin(sqrt(10)t). T=2pi sqrt(1/10)≈1.98692 s. Period ≤1%; max q error/0.1 m and vx error/0.316228 m/s ≤1%; total energy drift relative to 0.05 J ≤1%. Check ≥4 periods. Stiffness is N/m, not an engine relaxation coefficient.

Damped extension: c=0.2 N·s/m, same initial conditions. Let alpha=c/(2m)=0.1, wd=sqrt(k/m-alpha²); q=0.1 exp(-alpha t)[cos(wd t)+(alpha/wd)sin(wd t)]. Max position error/0.1 m ≤1% over 10 s; no unforced energy increase beyond 0.1% of initial energy between consecutive samples. Validate damping signs and equal/opposite anchor torque separately.

## Additional numerical and mechanism checks

- Unit conversion: position/velocity/angular velocity/force/torque/density/inertia round-trips within 1e-12 relative or absolute-scaled error. Changing zoom/viewport/DPR must not change any tick snapshot.
- Constant force: gravity off, m=2 kg, F=(4,0) N, 1 s; v=2 m/s and displacement=1 m within 1%. Force persists on every substep.
- Torque: 2 kg 2×1 m rectangle, I=5/6 kg·m², couple with net force zero and torque=1 N·m, 1 s; omega=1.2 rad/s and angle=0.6 rad within 1%. Repeat disk/polygon inertia against independent formulas.
- Rod: max length drift ≤0.1% at benchmark load; hinge shared-anchor error ≤0.001 m at L=1 m. Rope produces no compressive force while slack, never pushes apart bodies, and limits maximum length within 0.1% under specified taut benchmark loads.
- Future gear ratio relation, pulley ratio and motor speed/torque-limit cases require separate analytic fixtures before FR-007 release. Finite-mass pulley is not the ideal B5 model.
- Repeat B1–B7 at h/2; errors should converge or a solver/contact floor must be explained. Do not make a convergence claim from a single passing step size. Mass-ratio, long-duration, stiff springs, polygon contacts and tunneling stress tests have separately published limits.
- Reset rerun: fresh engine, same scene and settings, same-runtime short fixtures agree to max absolute SI state error 1e-10 for repeated runs; cross-browser normalized tolerance 1e-7 pre-contact and 1e-5 post-contact over 2 s. Normalize each component by max(1, |reference component|). Stable tick input ordering and creation order required. Report any narrowed envelope explicitly.

## Contract, persistence and browser tests

| Area | Required checks |
| --- | --- |
| Schema | Draft 2020-12 self-validation; example; each shape/constraint branch; unknown fields/version; zero/negative mass or dimensions; bounds; nonfinite values; extra executable keys; unknown measurement/control target. Format checker required for UUID/date-time. |
| Semantics | Duplicate IDs; dangling anchors/forces/meters/control targets; polygon convexity/centroid/winding; static-body velocities; incompatible control ranges; invalid saved identity history; unqualified engine profiles; parser depth/byte limits. |
| Migrations | Golden old-version fixtures, ordered pure migrations, unknown-version rejection, no original mutation. Revalidate output and compare canonical physical data. |
| Repository | Initial save assigns identity; reload after full browser restart; authored vs runtime state; atomic quota failure; multitab expected-head conflict; immutable revision; duplicate remapping; import-as-copy and conflicting preserved identity; exported round-trip. |
| Player | Pinned old revision survives new teacher saves; student reset/play/allowed overrides never changes source hash; forbidden fields/out-of-range overrides rejected; runtime has no write repository; inaccessible/missing revision UX. |
| Embed | Same-origin local harness and later cross-origin staging host; correct/wrong origin and source; malformed/oversized messages; exact targetOrigin; resized and fullscreen layouts; CSP/access failures handled. No cross-device local-ID claim. |
| Editor | One undo per gesture; redo; duplicate/reference deletion; SI screen transforms at zoom/DPR; pause/edit/reset semantics; keyboard and iPad touch; selection through object list. |
| Scheduling | 30/60/120 Hz rendering gives identical tick state; slow motion preserves h; Step increments exactly dt; hidden-tab/backlog behavior; graph sampling independent of rendering. |
| Performance | Named reference devices, 100 bodies/100 constraints/20 series for 10 min; p95 solver tick within dt, ≥30 fps rendering, bounded graph memory, pause responsiveness. Record settings; never reduce physics quality silently. |

## Automation and release gates

Proposed tooling after authorization: Vitest for pure domain/adapter/repository tests, Ajv 2020 with formats for imports, Playwright for browser flows, and a dedicated headless numerical report job. Use a real Safari/iPad pass for touch/storage/fullscreen behavior; WebKit automation alone is insufficient. CI runs schema/type checks, unit/physics tests, production build and browser smoke tests; full convergence/stress/device matrix runs before capability releases or engine upgrades. Expected failures and skipped benchmarks cannot certify a capability.
