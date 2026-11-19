# M1-03E production-runtime qualification

Status: evidence implementation; **NOT qualified for public execution**. Public
initialization stays blocked and every capability result has executionReady=false.
No UI, scheduler, persistence or native production behavior is changed.

## Reproduce

Use Node.js 24, `npm ci`, then:

```sh
npm run typecheck
npm run lint
npm test
npm run test:m0
npm --prefix poc/engine-comparison ci --ignore-scripts
npm run test:poc
npm run build
npm run test:pages
npm run qualify:physics -- --strict
npx playwright install chromium webkit
# On a machine with OS-package installation privileges:
npx playwright install-deps chromium webkit
npm run qualify:browser -- --strict
```

`BAANPHYS_CHROMIUM_PATH=/path/to/chromium` overrides the browser executable; the
runner first tries `/usr/bin/chromium`, otherwise Playwright's pinned browser.
The browser server binds only loopback and is not the application or deployment.
`--quick` on qualify:physics runs only 10 simulated seconds: it **cannot** replace
the 600-second qualification evidence. Outputs overwrite results in place; retain
the committed evidence when comparing environments. Native hooks are synchronous,
restore in finally and must not be run concurrently within the same JS realm.
No native handle is returned through the probe API.

All commands must be considered individually: a successful build is not a physics
pass. Numerical tests deliberately fail when original TEST_PLAN gates fail. Do
not skip them, turn them into expected-failure tests, or relax tolerances to make
CI green. The strict runner additionally fails unqualified clamp observability,
failed stress checks and unavailable browser engines. Default commands still
return failure for failed B1/B2/B3 or executed browser benchmark failures.

## Contracts and analytical references

The trusted profile is Planck 1.5.1 / adapter 1.0.0 /
planck-1.5.1-si-v1: logical dt=1/120 s, four h=1/480 s substeps,
velocity/position iterations 12/12; sleeping/drag off, CCD/warm-starting on,
restitution threshold zero. Full settings guards, geometry and mass audits remain
unchanged. Units: metre, kilogram, second; y-up/CCW. Uniform disk I=mr²/2.
Friction mixing is geometric mean, restitution mixing maximum. Fixtures use
friction zero/restitution one. Seed=1; no stochastic operations. UUIDs and body
creation/snapshot order are canonical. Scene v1 remains the only authored model.

B1/B2/B3 use TEST_PLAN.md oracles and original gates. B1 repeats .1/1/10 kg.
B2 checks the full trajectory, endpoint displacement, velocity and apex. B3 checks
post-separation averages, momentum/energy, transverse motion/spin, first contact,
and **physical surface penetration after every native substep**, supplementing
the archived logical-tick sampling with a stricter temporal audit at the same
unchanged .0025 m bound. Logical-tick overlap and substep overlap must not be
conflated: the original PoC can pass its sampled overlap gate while this new audit
fails. The contact listener observes native begin-contact time. The penetration
observer uses actual centre distance and authored radii, not contact skin or
solver impulse as a force measurement. Equal masses supplement the original
case; its zero outgoing velocity uses an explicit 1e-8 m/s absolute gate rather
than dividing by zero. Ratios 10 and 100 are additional provisional-envelope
probes, not new broad accuracy guarantees.

Convergence uses fresh C-constructed worlds at h=1/120,1/240,1/480,1/960 s with
12/12 iterations and frozen native settings. Those are **unregistered native
convergence probes**, not accepted runtime profiles. B1/B2/ratio-2 B3 are rerun;
all raw gate outcomes, including failures at coarse h, are retained. The selected
h trajectory is compared with the D production runtime. Production never accepts
alternate settings and no archived PoC trajectory is used as production evidence.

Replay records fresh-world same-runtime absolute SI component errors at every
logical tick for the basic cases (<=1e-10). Browser comparison uses fresh 2-second
fall/projectile/collision cases against Node at matching tick/time/UUID, normalized
by max(1,abs(reference component)); gates 1e-7 before contact, 1e-5 after analytic
contact time .75 s. No cross-browser bitwise guarantee.

## Evidence and limits

See [RESULTS.md](RESULTS.md), results/physics.json and results/browser.json.
Evidence tests recompute source/CSV digests, retain failed outcomes and reject
quick-mode artifacts as full long-run evidence. Each physics report records environment, exact profile, complete scenes, native
step/contact counts, source digests, numerical errors and CSV SHA256 digests.
Raw CSV includes every tick for basic/convergence/thin-wall probes. Long-run
sampling is every 10 s, so no claim is made about unsampled energy excursions.
Native contact counters confirm stress contacts; timing includes guards, input
validation and snapshot copying, not rendering. Wall time/GC observations are
machine-specific, not a device performance guarantee.

The bounded stress fixture has 96 dynamic disks and four static walls, no gravity,
100 total bodies, 600 simulated seconds/72,000 logical ticks. CPU p95 target is
1000/120 ms. Exploratory energy drift <=1% is additional evidence, not a substitute
for B3 or original release load (100 constraints/20 series are unsupported). A
fresh 600-second reconstruction compares 10-second samples at <=1e-10 normalized
error, separately from short all-tick absolute replay. Lifecycle testing runs 100
normal and 30 injected-locked failures, observes native body release/WeakRefs
following event-loop turns and exposed GC. Reclamation timing is nondeterministic;
this does not establish a general memory ceiling or leak-free proof.

Thin-wall probes use 80 m/s and radii .25/.1/.01 against a .02 m static wall;
no crossing, actual rebound, complete horizon and sampled penetration <=1% radius
are required. Passing those particular probes does not certify all CCD contacts.
Global CCD does not enable dynamic/dynamic bullet processing: C construction
explicitly uses bullet=false, and pinned Planck Solver.ts skips TOI for pairs of
non-bullet dynamic bodies. The added B3 substep audit exposes that limitation;
no bullet flag is silently enabled to make it pass. Contact-induced speed >100 m/s is rejected terminally by production envelope
checks; a focused test uses the independent elastic light-body reference
2*100/(1+.01) m/s. This is a policy rejection, not successful physical execution.

Planck's discrete and TOI solvers clamp translation/rotation internally and emit
no clamp event. Existing runtime tests inject real native clamp conditions and
verify terminal rejection; native motion/envelope guards remain active. But
transient internal CCD clamps that leave no final-state evidence are **not proven
observable**. General clamp observability remains UNQUALIFIED. No silent engine
patch, settings retune or state repair is used to conceal this limitation.

Actual Safari/physical iPad and rendering FPS remain untested. Linux WebKit is
only a useful engine proxy when its libraries are available, not Apple-platform
certification. Unsupported constraints, rolling, pulleys and other mechanisms
remain rejected. Numerical evidence does not upgrade capability policy to an
execution certificate or authorize public initialization.
