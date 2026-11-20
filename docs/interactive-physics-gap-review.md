# Interactive Physics gap review — 2026-11-20

Compared public documentation, not a hands-on licensed-app evaluation:
- [User-supplied product page](https://www.physicscurriculum.com/interactivephysics): bodies, mechanical elements, forces and live meters.
- [Manufacturer Web features](https://www.design-simulation.com/IPWeb/features.php): drawing, springs, air resistance, live measurements and CSV.
- [Manufacturer Web announcement](https://www.design-simulation.com/News/IPWeb.php): browser edition released November 5, 2026; also describes live controls, vectors and tracking. The supplied reseller page describes older Windows software.

| MVP | Gap found in BaanPhys | Added in this delivery |
| --- | --- | --- |
| 1 | Objects could be added then resized, but not drawn directly. | Drag circle/rectangle/static floor on the canvas; one immutable undoable creation. Existing buttons/fields remain keyboard alternatives. |
| 2 | Hinges/rods/ropes existed; spring and damping were rejected. | Actual bilateral Hooke spring + axial viscous damping, two-click/world tools, k/c/rest-length fields, oscillator examples. |
| 3 | Position/velocity/K existed; acceleration and momentum were missing. | Last-logical-tick acceleration meter/vector/graphs, momentum components and angular-velocity graphs; CSV includes these observables. |

## Spring model and experimental bounds

F_A = [k(L−L0) + c((v_B−v_A)·n)] n; F_B = −F_A. Anchor velocities
include omega cross local lever. Recompute and apply these Newton loads every
native substep (1/480 s); use native rigid-body integration and off-centre torque.
This is **not** a Planck soft joint with Hz passed off as N/m. Native damping
remains zero. Spring-connected contact suppression is world-local and respects
collideConnected. No saved/source coordinates or mass/inertia are repaired.

Provisional rejection bounds: L0=.05..50 m, k<=1000 N/m, c<=100 N·s/m,
L>=10% L0. Initial stiffness/damping trace restrictions use worst local-lever
inverse mass/inertia: h*sqrt(20*sum(k*inverse))<=.25 and
2*h*sum(c*inverse)<=.25. These deliberately conservative eligibility checks
are **not a stability/accuracy proof**. Existing per-substep force/torque,
acceleration, speed, geometry and native-settings limits still apply; unsafe
motion terminates the run without publishing the failed tick or retuning settings.

## Actual production-browser observations

Fixed logical dt=1/120 s, four native substeps, 12/12 iterations, Planck 1.5.1.
For m=1 kg, k=10 N/m, L0=2.5 m, world anchor (0,6), initial COM (0,3),
v=0, gravity=0: y=3.5−.5*cos(sqrt(10)*t), period=1.986917653 s.
Over ~2.1 s of actual CSV samples, maximum position error was .001650523 m.
With c=.8 N·s/m, the corresponding underdamped analytical solution gave
maximum error .001610687 m. These short smoke cases do not qualify the engine.
Two equal masses showed opposite displayed velocities ±1.759 m/s. An initially
overlapping spring pair stayed at .500 m separation with contacts off and .596 m
with contacts on; this checks the switch, not contact accuracy. Free-fall meter
and graph read ay=−9.81 m/s². Drawing/Undo and CSV were reviewed in Chromium.
No automated suites were added; typecheck/lint/build are the CI checks.

Remaining gaps: arbitrary polygon drawing, air resistance, pulleys/gears/slots/
motors, live parameter sliders and multi-body graph comparison. Air/advanced mechanism models need explicit data/physics contracts;
none are approximated by relabelling rods, solver stiffness or damping. Scene
saving remains deferred. Login, licenses and role locks from the reference are
intentionally not copied: this stays an open public sandbox, including iframes.

## Canvas-first connector editing

Hinge pivots and rod/rope/spring ends are now directly selectable/draggable on top
of bodies. Connector translation edits local/world attachment coordinates without
changing body poses; endpoint drops can reconnect to another body. Commands pass
through existing immutable Scene v1 validation, preserve UUIDs, and form one undo
gesture. Numeric fields are optional. Physics models/settings are unchanged.
