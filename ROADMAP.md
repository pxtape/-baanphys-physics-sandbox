# Roadmap

Status: planning only. Milestones are gated by evidence, not calendar dates. The user must authorize starting implementation; completion of these documents does not authorize M1.

## Delivery order and dependencies

M0 documentation → authorized engine qualification → a thin M1/M2/M5 slice → full M1/M2 → M3 → M4 → full M5 → M6 → M7. M5's storage/identity/player contracts and minimal implementation are intentionally pulled forward. Full BaanPhys integration can proceed after core playback and the host contract are agreed; it does not depend on every M3 mechanism or M4 graph.

| Milestone | Scope / dependencies | Acceptance and exit evidence |
| --- | --- | --- |
| M0 Architecture | Inspect workspace, requirements, solver research, schema, risks and test strategy. | All linked documents and example present; schema self-validates and example passes; repository limitations and unexecuted physics work explicit. Stop for user direction. |
| M0 qualification follow-up | Requires authorization. Headless Matter/Planck comparison; no full editor. | Engine decision report with versions, unit/inertia checks, B1/B2/B3 and replay results. Run B4/B7 and B5/B6 probes; mark failed features unsupported. No engine selection on visual demos alone. |
| S0 End-to-end slice | After engine gate; subset of M1/M2/M5. | Create ball/block/floor; manipulate basic geometry; inspect mass/velocity; gravity and Play/Pause/Reset/Step; basic undo; UUID immutable revision save/load across browser restart; JSON round-trip; iframe player of pinned local revision cannot mutate source. Browser walkthrough plus storage, schema and numerical tests. Clearly label local embeds as device-local. |
| M1 Visual editor | Depends on approved engine/domain boundaries and S0. FR-001/002, authoring portions of FR-003/016. | Convex polygon tool, rotation/resize, duplication/deletion with reference handling, full command undo/redo. Desktop keyboard and iPad pointer operations work at multiple zooms. Invalid geometry rejected with no partial mutation. |
| M2 Core simulation | Depends on engine gate; extends S0. FR-003/004/005/008. | SI mass/density/inertia, gravity, constant off-centre forces, contacts, angular motion and slow scheduling. B1/B2/B3, torque, reset and timestep tests pass. Failed stress cases documented with bounded supported envelope. |
| M3 Constraints | Depends on M2. FR-006. | World anchors, hinge/rod drift tests, slack/tension-only ropes and N/m springs with N·s/m damping qualify independently. B4/B7 pass ≤1%; cyclic/large mass-ratio tests disclose limits. No substitute soft spring presented as rigid rod or rope. |
| M4 Measurements | Depends on M2; constraint reactions depend on M3 support. FR-009/010. | Tick-derived SI meters, vectors, bounded graphs/CSV; numerical comparison with snapshots and finite-difference tests. No collision force or tension claim without validated observability. |
| M5 Persistence and integration | Contracts and S0 already present; full host integration requires confirmed BaanPhys API/auth/origins. FR-011/012/013/016. | Server adapter, ownership checks, immutable revision publication, head conflict handling, migrations, duplicate/import collision behavior, cross-device pinned iframe in a real/staging BaanPhys problem. Unauthorized writes rejected server-side. Unavailable/private revision errors verified. |
| M6 Teaching/student modes | Depends on S0 player and M5 access contract for hosted use. FR-014/015. | Teacher-defined typed parameter allowlist with bounded ranges, locked-by-default controls, isolated session reset and source hash unchanged. Fullscreen feature detection and iPad fallback, keyboard/focus and accessible controls verified. |
| M7 Advanced and release | Depends on qualified foundations, M5/M6; FR-007 and hardening. | Ideal pulley/Atwood B5, rolling B6, gear ratios, damping and motor limits tested before release of each feature. Full numerical/browser/security matrix, license inventory and documented model envelope; no expected-failure tests counted as release passes. |

## Definition of done

A feature has requirements traceability, typed contracts, actionable validation/errors, meaningful automated checks and updated model limitations. Physics features include analytical/convergence evidence at frozen settings. Save/embed changes include revision and student-isolation tests. CI includes typecheck, schema/semantic tests, unit/integration physics suite, production build and browser smoke tests once tooling exists. No scripts are claimed to exist during M0.

## Deferred scope

No arbitrary formulas/scripts, cloud collaboration, assessment grading, user-uploaded assets, concave decomposition, motors/pulleys/gears or scientific reaction-force meters in S0. A new need must extend the schema and capability profile explicitly. Backend vendor, host origins, device baselines and final solver remain open decisions recorded in SPEC.md and ARCHITECTURE.md.
