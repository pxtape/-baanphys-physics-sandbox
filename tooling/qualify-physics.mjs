import process from 'node:process';
import { Buffer } from 'node:buffer';
import { performance } from 'node:perf_hooks';
import { Console } from 'node:console';
const console = new Console(process.stdout, process.stderr);
import { build } from 'vite';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import os from 'node:os';
import { setImmediate as nextTurn } from 'node:timers/promises';

const output = 'qualification/results'; await mkdir(output, { recursive: true });
const built = await build({ configFile: false, logLevel: 'silent', build: { write: false, minify: false, lib: { entry: 'qualification/entry.ts', formats: ['es'], fileName: 'qualification' } } });
const code = (Array.isArray(built) ? built[0] : built).output.filter(x => x.type === 'chunk').map(x => x.code).join('\n');
const q = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
const stringify = value => JSON.stringify(value, (_k, v) => typeof v === 'number' && !Number.isFinite(v) ? String(v) : v, 2) + '\n';
const sources = ['schemas/scene-v1.schema.json', 'package-lock.json', 'src/physics/adapters/planck-runtime.ts', 'src/physics/adapters/planck-construction.ts', 'src/physics/adapters/native-settings.ts', 'src/physics/capabilities.ts', 'qualification/core.ts', 'qualification/scenes.ts', 'tooling/qualify-physics.mjs', 'src/physics/adapters/qualification-native-probes.ts'];
const sha256 = buffer => createHash('sha256').update(buffer).digest('hex');
const provenance = Object.fromEntries(await Promise.all(sources.map(async path => [path, sha256(await readFile(path))])));
const report = { recordedAt: new Date().toISOString(), environment: { node: process.version, platform: process.platform, arch: process.arch, cpu: os.cpus()[0]?.model, cores: os.cpus().length, totalMemory: os.totalmem() },
  profile: { engine: 'planck', version: '1.5.1', adapter: '1.0.0', profile: 'planck-1.5.1-si-v1', logicalDt: 1 / 120, substeps: 4, velocityIterations: 12, positionIterations: 12, constraintBudget: 12, seed: 1, sleeping: false, drag: 0, units: 'SI/y-up/CCW', frictionMix: 'sqrt', restitutionMix: 'max', velocityThreshold: 0 },
  provenance, basic: [], convergence: [], probes: [], replay: [], lifecycle: {}, longRun: null,
  executionReady: q.planckAdapterContract.capabilities(q.scene()).executionReady, publicInitializationBlocked: !q.planckAdapterContract.initialize(q.scene()).ok,
};
async function csv(name, frames) {
  const rows = ['tick,timeSeconds,id,x,y,vx,vy,angle,angularVelocity'];
  for (const f of frames) for (const b of f.bodies) rows.push([f.tick, f.timeSeconds, b.id, b.position.x, b.position.y, b.velocity.x, b.velocity.y, b.angle, b.angularVelocity].join(','));
  const data = rows.join('\n') + '\n', path = `${output}/${name}.csv`; await writeFile(path, data); return { path, sha256: sha256(data), frames: frames.length };
}
for (const def of q.basicCases()) {
  const r = q.observeProduction(def.scene, () => q.runProduction(def.scene, def.ticks));
  const evaluated = q.evaluate(def, r.value, r.native);
  const entry = { ...evaluated, scene: def.scene, native: r.native, trajectory: await csv(def.id, r.value.frames) }; report.basic.push(entry);
  console.log(`${def.id}: ${evaluated.status}`);
  if (def.kind === 'fall' || def.kind === 'projectile' || def.id === 'B3-ratio2') for (const substeps of [1, 2, 4, 8]) {
    const probe = q.convergenceProbe(def.scene, def.ticks, substeps);
    const trace = { frames: probe.value, completedTicks: def.ticks, failure: null, tickTimesMs: [] };
    report.convergence.push({ ...q.evaluate(def, trace, probe.native), substeps, h: (1 / 120) / substeps,
      path: 'fresh native solver convergence on production C construction; NOT an executable registered alternate profile',
      selectedProductionNormalizedDifference: substeps === 4 ? q.normalizedDifference(r.value.frames, probe.value) : null,
      native: probe.native, trajectory: await csv(`${def.id}-native-h${substeps}`, probe.value) });
  }
  const replay = q.runProduction(def.scene, def.ticks);
  let absolute = 0;
  if (r.value.frames.length !== replay.frames.length) absolute = Infinity;
  else r.value.frames.forEach((f, i) => f.bodies.forEach((a, j) => {
    const b = replay.frames[i].bodies[j];
    for (const d of [a.position.x - b.position.x, a.position.y - b.position.y, a.velocity.x - b.velocity.x, a.velocity.y - b.velocity.y, a.angle - b.angle, a.angularVelocity - b.angularVelocity]) absolute = Math.max(absolute, Math.abs(d));
  }));
  report.replay.push({ id: def.id, absolute, tolerance: 1e-10, pass: !replay.failure && !r.value.failure && absolute <= 1e-10 });
}
// Explicit CCD/contact-scale probes: report actual failures, never widen B3 tolerances.
for (const radius of [.25, .1, .01]) {
  const s = q.scene([q.disk(1, -1, 0, 1, radius, 80), q.wall(2, 0, 0, .02, 4)]); s.world.gravity.y = 0;
  const r = q.observeProduction(s, () => q.runProduction(s, 12));
  const frames = r.value.frames;
  const crossed = frames.some(f => f.bodies[0].position.x > .01 + radius);
  const bounced = frames.some(f => f.bodies[0].velocity.x < 0);
  const penetration = Math.max(0, ...frames.map(f => radius + .01 - Math.abs(f.bodies[0].position.x)));
  // Original B3 penetration bound is .0025 m; this is a stricter scale-relative
  // stress target (1% radius), never a replacement for the original B3 gate.
  const tolerance = .01 * radius;
  report.probes.push({ id: `thin-wall-r${radius}`, scene: s, completedTicks: r.value.completedTicks, failure: r.value.failure, crossed, bounced, penetration, penetrationTolerance: tolerance,
    status: !r.value.failure && !crossed && bounced && penetration <= tolerance ? 'PASS' : 'FAIL', native: r.native, trajectory: await csv(`thin-wall-r${radius}`, frames) });
}
// Long-run bounded headless simulation with real contacts; not a rendered FPS claim.
const stress = q.stressScene(), ticks = process.argv.includes('--quick') ? 1200 : 72000;
console.log(`Long run: ${ticks} ticks, ${stress.bodies.length} bodies`);
const start = performance.now(), longObserved = q.observeProduction(stress, () => q.runProduction(stress, ticks, 1200)), long = longObserved.value;
const mass = new Map(stress.bodies.map(b => [b.id, b.motionType === 'static' ? 0 : 1]));
const energy = f => f.bodies.reduce((sum, b) => sum + .5 * mass.get(b.id) * (b.velocity.x ** 2 + b.velocity.y ** 2) + .25 * mass.get(b.id) * .1 ** 2 * b.angularVelocity ** 2, 0);
const initialEnergy = energy(long.frames[0]), energyDrift = Math.max(...long.frames.map(f => Math.abs(energy(f) - initialEnergy) / initialEnergy));
const times = [...long.tickTimesMs].sort((a,b) => a-b), p95 = times[Math.floor(.95 * (times.length - 1))];
report.longRun = { native: longObserved.native, scene: stress, requestedSeconds: ticks / 120, completedTicks: long.completedTicks, failure: long.failure, wallSeconds: (performance.now() - start) / 1000,
  p95TickMs: p95, targetTickMs: 1000 / 120, performancePass: p95 <= 1000 / 120, initialEnergy, maxSampledRelativeEnergyDrift: energyDrift,
  exploratoryEnergyTolerance: .01, energyPass: energyDrift <= .01, sampleEveryTicks: 1200, maxRetainedFrames: 61,
  trajectory: await csv('long-run', long.frames), limitations: 'CPU runtime tick timing, not rendering FPS. 100 bodies incl. four static walls; no constraints/graphs; energy sampled each 10 s, no intermediate drift claim.' };
const replayStart = performance.now(), longReplay = q.runProduction(stress, ticks, 1200);
report.longRun.replay = { completedTicks: longReplay.completedTicks, failure: longReplay.failure, wallSeconds: (performance.now() - replayStart) / 1000,
  normalizedError: q.normalizedDifference(long.frames, longReplay.frames), tolerance: 1e-10, sampling: 'every 1200 ticks (10 s), not an all-tick long-run guarantee' };
report.longRun.replay.pass = !longReplay.failure && longReplay.completedTicks === ticks && report.longRun.replay.normalizedError <= 1e-10;
report.clampObservability = { status: 'UNQUALIFIED', evidence: 'Production runtime rejects predicted/observed envelope and native displacement clamp indicators; native solver has no per-clamp event.',
  source: 'planck/src/dynamics/Solver.ts: discrete and TOI velocity caps',
  limitation: 'A transient internal CCD/TOI clamp that leaves no final-state evidence is not proven observable. No blanket contact-envelope execution certificate.' };
// Explicit GC observation: timing is nondeterministic, not proof of universal leak absence.
if (globalThis.gc) {
  globalThis.gc(); await nextTurn(); const before = process.memoryUsage();
  const s = q.scene(); s.world.gravity.y = 0;
  const normal = q.lifecycleProbe(s, 100, () => q.constructSteppingRuntime(s));
  const locked = q.lifecycleProbe(s, 30, () => q.constructSteppingRuntime(s), true);
  for (let i = 0; i < 5; i++) { await nextTurn(); globalThis.gc(); }
  report.lifecycle = { exposedGc: true, cycles: { normal: normal.cycles, locked: locked.cycles }, normalBodiesRemaining: normal.bodiesRemaining,
    nativeWorldsStillAlive: { normal: normal.aliveWorlds(), locked: locked.aliveWorlds() }, before, after: process.memoryUsage(), limitation: 'Observed forced-GC ownership release; nondeterministic reclamation is not a general memory-bound certificate.' };
} else report.lifecycle = { exposedGc: false, status: 'NOT EXECUTED', reason: 'Run Node with --expose-gc' };
report.basicStatus = report.basic.every(x => x.status === 'PASS') && report.replay.every(x => x.pass) ? 'PASS' : 'FAIL';
report.releaseQualification = 'INCOMPLETE: independently accepted E, device/browser matrix and full standard envelope still required; see failures/limitations';
await writeFile(`${output}/physics.json`, stringify(report));
console.log(JSON.stringify({ basicStatus: report.basicStatus, probes: report.probes.map(p=>({id:p.id,status:p.status,penetration:p.penetration})), longRun: { ticks: long.completedTicks, p95, energyDrift }, lifecycle: report.lifecycle }));
if (report.basicStatus !== 'PASS') process.exitCode = 1;
if (process.argv.includes('--strict') && (report.probes.some(p=>p.status!=='PASS') || long.failure || !report.longRun.performancePass || !report.longRun.energyPass || !report.longRun.replay.pass || report.clampObservability.status !== 'PASS')) process.exitCode = 2;
