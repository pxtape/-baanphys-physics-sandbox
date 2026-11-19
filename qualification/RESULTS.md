# M1-03E measured results — qualification BLOCKED

Recorded 2026-11-19T12:21:14.684Z, Node v24.22.1, Linux x64,
AMD EPYC 9V74 80-Core Processor, 3 visible cores.
Browser: Chromium 156.0.8078.79 (Linux headless). No real Safari/iPad.
Profile: Planck 1.5.1 / adapter 1.0.0 / planck-1.5.1-si-v1; 1/120 s logical,
four 1/480 s substeps, 12/12 iterations. Native settings, Scene v1, archived
benchmark files and all prior thresholds are unchanged.

## Findings

- **MAJOR qualification gap:** the native-substep B3 contact audit measures
  0.004166666666663876 m maximum physical overlap versus the unchanged .0025 m
  bound, for equal masses and ratios 2/10/100. Four tests fail, not skipped or
  marked expected failures. Original logical-tick overlap samples are zero;
  velocities/conservation/contact-timing gates pass. This is enhanced temporal
  observation, not an assertion that the archived logical-tick PoC result changed.
  Planck's global CCD flag does not cover two non-bullet dynamic bodies: C explicitly
  uses bullet=false; Solver.ts excludes such pairs from TOI. No bullet flag or
  timestep is changed to hide this gap.
- **Unqualified safety claim:** general transient discrete/TOI clamp observability
  is not established. Runtime guards and injected native-clamp regressions pass,
  but Planck emits no clamp event; a clamp leaving no final-state evidence is not
  proven observable. This is a qualification limitation, not a reproduced escape
  in the approved D runtime. Do not certify the entire provisional envelope.
- **Missing platform evidence:** Chromium executes and matches Node, while WebKit
  cannot launch (missing GTK4/Graphene/Harfbuzz-ICU/Manette/Hyphen/GLES libraries).
  Browser download succeeded; OS dependency installation failed because administrative
  access was unavailable. Linux WebKit would still not certify Apple Safari/iPad.

## Measurements

| Case | Independent reference | Measured result | Error / outcome |
| --- | --- | --- | --- |
| B1, .1/1/10 kg, 1 s | y=15.095 m, vy=-9.81 m/s | y=15.084781250000004; vy=-9.809999999999963 | displacement .20833333333324%; PASS; inter-mass position error 0 |
| B2, 1 s | x=8 m, displacement=1.095 m, vy=-3.81 | x=7.999999999999977; displacement=1.0847812500000131; vy=-3.8099999999999783 | vertical displacement .933219178081%; PASS |
| B2 apex | t=6/9.81; gain=36/(2*9.81) | t=.6116207951070354 s; gain=1.8285929687500122 m | time roundoff; height .341683203124%; PASS |
| B3 ratio 2, separation | v1=-2/3; v2=4/3 m/s | -.6666666666666666; 1.3333333333333335 | roundoff; PASS |
| B3 ratio 2 conservation | p=2 kg m/s; E=2 J | max relative drift p=0, E=1.1102230246251565e-16 | PASS |
| B3 contact onset | .75 s; tolerance .01583333333333333 s | .7541666666666647 s | .00416666666666465 s; PASS |
| B3 native-substep overlap | <=.0025 m | .004166666666663876 m | FAIL, including equal masses/ratios 10/100 |
| Thin static wall, vx=80 m/s, r=.25/.1/.01 m | no crossing; rebound; sampled overlap <=1% radius | all complete 12 ticks; rebound; sampled overlap 0 | PASS for these probes only |
| Fresh basic replay | max absolute SI component error <=1e-10 | 0 for all eight fixtures | PASS (plus 2 s collision unit test) |
| Selected-h convergence identity | native probe vs production normalized difference <=1e-10 | 0 for all five selected-h probes | PASS |
| 600 s, 100 bodies | 72,000 ticks; 288,000 substeps | 72000 ticks; 288000 substeps; first contact 1.252083333 s | complete; 224 maximum native broad-phase contact records |
| CPU p95 tick | <=8.333333 ms | 1.636752000 ms; wall 78.513 s | PASS on this machine; no rendering/FPS/device claim |
| Long-run energy | exploratory sampled relative drift <=1% from .48 J | 0 | PASS at 10 s sample intervals; intermediate excursions not measured |
| Fresh 600 s reconstruction | sampled normalized error <=1e-10 | 0 | PASS at 61 samples, not an all-tick long-run guarantee |
| Lifecycle | 100 normal +30 injected locked failures | normal bodies remaining 0; live weak worlds {'normal': 0, 'locked': 0} | observed collection; not universal memory proof |
| Chromium vs Node, 2 s | normalized <=1e-7 precontact, <=1e-5 postcontact | 0 for fall/projectile/collision | replay PASS; browser overall FAIL from contact audit |

B1/B2 displacement error halves at h=1/120,1/240,1/480,1/960. B2 errors are
3.7328767%, 1.8664384%, .9332192%, .4666096% respectively; coarse probes FAIL
original 1% scalar gates and remain recorded as failures. These fresh native
convergence experiments are unregistered profiles, not production configuration
changes. B3 native overlap audit still fails at selected h; see all probe outcomes
in results/physics.json. No numerical conclusion is taken from a different engine
or archived PoC animation.

## Verification actually executed

| Command | Result |
| --- | --- |
| npm run typecheck (includes check:generated) | PASS |
| npm run lint | PASS; existing architecture-test TSImportType deprecation warning remains non-failing |
| npm test | **438 PASS, 4 FAIL, 442 total**; all 422 pre-existing tests pass |
| npm run test:m0 | PASS, 25 fixtures plus schema/document checks |
| npm run test:poc | PASS, 13 existing verification tests; archived evidence preserved |
| npm run build | PASS; foundation bundle remains unchanged |
| npm run test:pages | PASS, local project-path/assets/refresh smoke |
| npm run qualify:physics -- --strict | **FAIL, exit 2**; contact audits + general clamp observability |
| npm run qualify:browser -- --strict | **FAIL, exit 1**; Chromium contact audits and unavailable WebKit |

Twenty new automated tests cover analytical gates, h convergence, mass independence,
replay, public lockout, missing evidence, contact-induced terminal envelope rejection,
comparison identity, source/CSV integrity and report honesty. The four failing gates
remain ordinary assertions, so required CI correctly prevents merging/deployment.
Independent acceptance is pending; this evidence PR is not ready to merge.

Source/trajectory SHA256s and full scenes: results/physics.json. Raw numerical CSVs:
results/*.csv. Browser traces/reference traces and launch limitations:
results/browser.json. Exact verification exit codes: results/verification.json.
Reproducible commands and measurement definitions: [README.md](README.md).
Timing/GC are environment observations and will vary on rerun.

## Next decision

Review the between-tick overlap bound against the approved contact profile and
establish reliable clamp observability or a defensible restricted contact envelope.
Any proposed profile/accuracy-policy change requires explicit review; this PR makes
none. Complete Safari/iPad and full release-load evidence separately. Constraints,
rolling and advanced mechanisms stay unsupported. Public executionReady=false and
initialization blocked until E is independently accepted. No E merge or deployment.
