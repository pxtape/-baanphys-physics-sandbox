import { expect, it } from 'vitest';
import { basicCases, collision, scene } from './scenes';
import { evaluate, normalizedDifference, runProduction } from './core';
import { observeProduction, convergenceProbe } from '../src/physics/adapters/qualification-native-probes';
import { planckAdapterContract } from '../src/physics';

it.each(basicCases())('$id enforces fixed-profile basic limits including the native-substep contact audit', def => {
  const run = observeProduction(def.scene, () => runProduction(def.scene, def.ticks));
  const evaluated = evaluate(def, run.value, run.native);
  expect(evaluated.status, JSON.stringify(evaluated, null, 2)).toBe('PASS');
  expect(run.native.nativeSteps).toBe(4 * def.ticks);
  expect(run.native.bodiesRemainingAfterDispose).toBe(0);
  expect(planckAdapterContract.capabilities(def.scene).executionReady).toBe(false);
});
it('free-fall trajectories agree across 0.1/1/10 kg within 1e-7 m', () => {
  const cases = basicCases().filter(c => c.kind === 'fall'); const frames = cases.map(c => runProduction(c.scene, c.ticks).frames);
  for (const frame of frames) frame.forEach((f, i) => expect(Math.abs(f.bodies[0]!.position.y - frames[0]![i]!.bodies[0]!.position.y)).toBeLessThanOrEqual(1e-7));
});
it('raw h/2 probe agrees with production at selected h and demonstrates convergence without registering alternatives', () => {
  for (const def of basicCases().filter(c => c.kind === 'fall' || c.kind === 'projectile')) {
    const production = runProduction(def.scene, def.ticks);
    const selected = convergenceProbe(def.scene, def.ticks, 4).value;
    expect(normalizedDifference(production.frames, selected)).toBeLessThanOrEqual(1e-10);
    const errors = [1, 2, 4, 8].map(n => evaluate(def, { frames: convergenceProbe(def.scene, def.ticks, n).value, completedTicks: def.ticks, failure: null, tickTimesMs: [] }).metrics.find(m => m.name === 'endpoint displacement relative error')!.error);
    for (let i = 1; i < errors.length; i++) expect(errors[i]! / errors[i - 1]!).toBeCloseTo(.5, 8);
  }
});
it('fresh-engine collision replay has <=1e-10 absolute SI error over 2 s', () => {
  const a = runProduction(collision(), 240), b = runProduction(collision(), 240);
  expect(a.failure).toBe(null); expect(b.failure).toBe(null);
  a.frames.forEach((f, i) => f.bodies.forEach((body, j) => {
    const other = b.frames[i]!.bodies[j]!;
    for (const error of [body.position.x - other.position.x, body.position.y - other.position.y, body.velocity.x - other.velocity.x, body.velocity.y - other.velocity.y, body.angle - other.angle, body.angularVelocity - other.angularVelocity]) expect(Math.abs(error)).toBeLessThanOrEqual(1e-10);
  }));
});
it('qualification scaffolding cannot enable public initialization', () => {
  expect(planckAdapterContract.initialize(scene()).ok).toBe(false);
  expect(planckAdapterContract.capabilities(scene()).executionReady).toBe(false);
});
