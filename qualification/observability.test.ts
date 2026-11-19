import { expect, it } from 'vitest';
import { collision, disk, scene } from './scenes';
import { evaluate, normalizedDifference, runProduction } from './core';
import { observeProduction } from '../src/physics/adapters/qualification-native-probes';

it('cannot report a collision pass without executed contact/penetration observations', () => {
  const s = collision(), trace = runProduction(s, 180);
  const result = evaluate({ id: 'missing-contact-evidence', kind: 'collision', scene: s, ticks: 180 }, trace);
  expect(result.status).toBe('FAIL');
  expect(result.metrics.filter(m => !m.pass).map(m => m.name)).toEqual(['first contact timing', 'substep penetration']);
});
it('retains true substep penetration even when logical tick samples look shallower', () => {
  const s = collision(), measured = observeProduction(s, () => runProduction(s, 180));
  const sampled = Math.max(...measured.value.frames.map(f => .5 - Math.abs(f.bodies[0]!.position.x - f.bodies[1]!.position.x)));
  expect(measured.native.maxPenetration).toBeGreaterThanOrEqual(sampled);
  expect(measured.native.maxPenetration).toBeGreaterThan(.0025);
  // This diagnostic test preserves the failure; basic.test.ts still enforces the original gate.
});
it('contact-generated speed outside the provisional envelope terminates without a successful failed-tick frame', () => {
  const s = scene([disk(1, -.5, 0, 1, .1, 100), disk(2, 0, 0, .01, .1)]); s.world.gravity.y = 0;
  const trace = runProduction(s, 10);
  // Independent 1D elastic light-body speed would be 2*1/(1+.01)*100 >100 m/s.
  expect(200 / 1.01).toBeGreaterThan(100);
  expect(trace.failure).not.toBe(null); expect(trace.completedTicks).toBeLessThan(10);
  expect(trace.frames.at(-1)!.tick).toBe(trace.completedTicks);
  expect(trace.failure?.some(d => d.code === 'NUMERICAL_UNSAFE')).toBe(true);
});
it('trajectory comparator rejects missing bodies and mismatched tick identities', () => {
  const trace = runProduction(scene(), 2).frames;
  expect(normalizedDifference(trace, trace.map(f => ({ ...f, bodies: [] })))).toBe(Infinity);
  expect(normalizedDifference(trace, trace.map(f => ({ ...f, tick: f.tick + 1 })))).toBe(Infinity);
});
