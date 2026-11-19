import type { SceneDocument } from '../src/domain/scene';
import type { SimulationSnapshot, TickInput } from '../src/physics/index';
import type { ValidationDiagnostic } from '../src/domain/diagnostics';
import { constructSteppingRuntime } from '../src/physics/adapters/planck-construction';
import type { CaseDefinition } from './scenes';

export interface Trace { frames: SimulationSnapshot[]; completedTicks: number; failure: readonly ValidationDiagnostic[] | null; tickTimesMs: number[] }
export function runProduction(scene: SceneDocument, ticks: number, every = 1, inputs?: (tick: number, frame: SimulationSnapshot) => readonly TickInput[]): Trace {
  const trace: Trace = { frames: [], completedTicks: 0, failure: null, tickTimesMs: [] };
  const made = constructSteppingRuntime(scene, { allowTickForces: !!inputs });
  if (!made.ok) { trace.failure = made.diagnostics; return trace; }
  const runtime = made.value;
  try {
    const initial = runtime.snapshot(); if (!initial.ok) { trace.failure = initial.diagnostics; return trace; }
    let current = initial.value; trace.frames.push(current);
    for (let tick = 1; tick <= ticks; tick++) {
      const batch = inputs ? inputs(tick, current) : [];
      const start = performance.now(), result = runtime.step(batch); trace.tickTimesMs.push(performance.now() - start);
      if (!result.ok) { trace.failure = result.diagnostics; break; }
      current = result.value; trace.completedTicks = tick;
      if (tick % every === 0 || tick === ticks) trace.frames.push(current);
    }
  } finally { runtime.dispose(); }
  return trace;
}
export interface Metric { name: string; reference: number; measured: number; error: number; tolerance: number; pass: boolean }
export interface Evaluation { id: string; status: 'PASS' | 'FAIL'; metrics: Metric[]; failure: Trace['failure'] }
export interface ContactEvidence { firstContactSeconds: number | null; maxPenetration: number | null }
export function evaluate(def: CaseDefinition, trace: Trace, contacts?: ContactEvidence): Evaluation {
  const metrics: Metric[] = [];
  const metric = (name: string, measured: number, reference: number, tolerance: number, scale = 1) => {
    const error = Math.abs(measured - reference) / scale; metrics.push({ name, measured, reference, tolerance, error, pass: Number.isFinite(error) && error <= tolerance });
  };
  const end = trace.frames.at(-1)!;
  if (!end) return { id: def.id, status: 'FAIL', metrics, failure: trace.failure };
  metric('completed ticks', trace.completedTicks, def.ticks, 0);
  if (def.kind === 'fall' || def.kind === 'projectile') {
    const projectile = def.kind === 'projectile', vx = projectile ? 8 : 0, vy = projectile ? 6 : 0;
    let position = 0, velocity = 0, driftX = 0, driftVx = 0;
    for (const frame of trace.frames) {
      const t = frame.timeSeconds, b = frame.bodies[0]!;
      position = Math.max(position, Math.hypot(b.position.x - vx * t, b.position.y - (20 + vy * t - .5 * 9.81 * t * t)));
      velocity = Math.max(velocity, Math.hypot(b.velocity.x - vx, b.velocity.y - (vy - 9.81 * t)));
      driftX = Math.max(driftX, Math.abs(b.position.x)); driftVx = Math.max(driftVx, Math.abs(b.velocity.x));
    }
    metric('maximum trajectory position normalized error', position, 0, .01, projectile ? 8 : 4.905);
    metric('maximum trajectory velocity normalized error', velocity, 0, .01, projectile ? 10 : 9.81);
    const b = end.bodies[0]!;
    metric('endpoint displacement relative error', b.position.y - 20, projectile ? 1.095 : -4.905, .01, projectile ? 1.095 : 4.905);
    metric('endpoint vertical velocity relative error', b.velocity.y, vy - 9.81, .01, Math.abs(vy - 9.81));
    if (projectile) {
      metric('endpoint x relative error', b.position.x, 8, .01, 8);
      let apexTime = NaN;
      for (let i = 1; i < trace.frames.length; i++) {
        const a = trace.frames[i - 1]!, b = trace.frames[i]!;
        if (a.bodies[0]!.velocity.y >= 0 && b.bodies[0]!.velocity.y < 0) {
          const fraction = a.bodies[0]!.velocity.y / (a.bodies[0]!.velocity.y - b.bodies[0]!.velocity.y);
          apexTime = a.timeSeconds + fraction * (b.timeSeconds - a.timeSeconds); break;
        }
      }
      const peak = Math.max(...trace.frames.map(f => f.bodies[0]!.position.y - 20));
      metric('apex time relative error', apexTime, 6 / 9.81, .01, 6 / 9.81);
      metric('apex height relative error', peak, 36 / (2 * 9.81), .01, 36 / (2 * 9.81));
    } else { metric('transverse position absolute error', driftX, 0, 1e-8); metric('transverse speed absolute error', driftVx, 0, 1e-8); }
  } else {
    const a = def.scene.bodies[0]!, b = def.scene.bodies[1]!;
    const m1 = a.massModel.mode === 'mass' ? a.massModel.mass : NaN, m2 = b.massModel.mode === 'mass' ? b.massModel.mass : NaN;
    const initialP = m1 * a.velocity.x + m2 * b.velocity.x, initialE = .5 * m1 * a.velocity.x ** 2 + .5 * m2 * b.velocity.x ** 2;
    const v1 = ((m1 - m2) * a.velocity.x + 2 * m2 * b.velocity.x) / (m1 + m2), v2 = (2 * m1 * a.velocity.x + (m2 - m1) * b.velocity.x) / (m1 + m2);
    const after = trace.frames.filter(f => f.timeSeconds >= 1 && f.timeSeconds <= 1.25);
    metric(v1 === 0 ? 'separated v1 absolute error' : 'separated v1 relative error', after.reduce((sum, f) => sum + f.bodies[0]!.velocity.x, 0) / after.length, v1, v1 === 0 ? 1e-8 : .01, v1 === 0 ? 1 : Math.abs(v1));
    metric('separated v2 relative error', after.reduce((sum, f) => sum + f.bodies[1]!.velocity.x, 0) / after.length, v2, .01, Math.abs(v2));
    let momentumError = 0, energyError = 0, transverse = 0, spin = 0;
    for (const f of trace.frames) {
      const x = f.bodies[0]!, y = f.bodies[1]!;
      const p = m1 * x.velocity.x + m2 * y.velocity.x;
      const e = .5 * m1 * (x.velocity.x ** 2 + x.velocity.y ** 2) + .5 * m2 * (y.velocity.x ** 2 + y.velocity.y ** 2) + .25 * .25 ** 2 * (m1 * x.angularVelocity ** 2 + m2 * y.angularVelocity ** 2);
      momentumError = Math.max(momentumError, Math.abs(p - initialP)); energyError = Math.max(energyError, Math.abs(e - initialE));
      transverse = Math.max(transverse, Math.abs(x.velocity.y), Math.abs(y.velocity.y)); spin = Math.max(spin, Math.abs(x.angularVelocity), Math.abs(y.angularVelocity));
    }
    metric('maximum momentum relative drift', momentumError, 0, .01, Math.abs(initialP)); metric('maximum energy relative drift', energyError, 0, .01, initialE);
    metric('transverse speed', transverse, 0, 1e-6); metric('angular speed', spin, 0, 1e-6);
    metric('first contact timing', contacts?.firstContactSeconds ?? NaN, .75, 1 / 120 + .0075);
    metric('substep penetration', contacts?.maxPenetration ?? NaN, 0, .0025);
  }
  return { id: def.id, status: !trace.failure && metrics.every(m => m.pass) ? 'PASS' : 'FAIL', metrics, failure: trace.failure };
}
export function normalizedDifference(a: readonly SimulationSnapshot[], b: readonly SimulationSnapshot[]): number {
  if (a.length !== b.length) return Infinity;
  let max = 0;
  a.forEach((f, i) => {
    if (f.tick !== b[i]?.tick || f.bodies.length !== b[i]?.bodies.length || Math.abs(f.timeSeconds - b[i]!.timeSeconds) > 1e-14) { max = Infinity; return; }
    f.bodies.forEach((body, j) => {
    const other = b[i]?.bodies[j]; if (!other || body.id !== other.id) { max = Infinity; return; }
    const x = [body.position.x, body.position.y, body.velocity.x, body.velocity.y, body.angle, body.angularVelocity];
    const y = [other.position.x, other.position.y, other.velocity.x, other.velocity.y, other.angle, other.angularVelocity];
    x.forEach((v, k) => { max = Math.max(max, Math.abs(v - y[k]!) / Math.max(1, Math.abs(v))); });
    });
  }); return max;
}
