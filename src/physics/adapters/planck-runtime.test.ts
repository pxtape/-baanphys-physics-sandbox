import { afterEach, describe, expect, it, vi } from 'vitest';
import { World, Body, Settings } from 'planck';
import * as Planck from 'planck';
import example from '../../../examples/falling-ball.scene.json';
import type { SceneV1 } from '../../domain/scene-v1.generated';
import type { SimulationSnapshot, TickInput } from '../contracts';
import type { InternalRuntime } from '../runtime-contract';
import { PLANCK_IDENTITY, PLANCK_SETTINGS, planckAdapterContract } from '../index';
import { constructSteppingRuntime } from './planck-construction';
import { initializeNativeSettings } from './native-settings';
import { validateTickInputs, MAX_TICK_INPUTS } from '../validate-tick-inputs';

expect(initializeNativeSettings()).toBe(true);
const internal: object = Reflect.get(Planck, 'SettingsInternal');
const globals = Object.getOwnPropertyDescriptors(Settings), derived = Object.getOwnPropertyDescriptors(internal);
const runtimes: InternalRuntime[] = [];
afterEach(() => { vi.restoreAllMocks(); runtimes.splice(0).forEach(r => r.dispose()); Object.defineProperties(Settings, globals); Object.defineProperties(internal, derived); });
const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
function scene(): SceneV1 {
  const s = structuredClone(example) as SceneV1;
  Object.assign(s.simulation, structuredClone(PLANCK_SETTINGS)); s.simulation.engine = { ...PLANCK_IDENTITY };
  s.world.gravity = { x: 0, y: 0 }; s.bodies = [s.bodies[0]!];
  const b = s.bodies[0]!; b.position = { x: 0, y: 20 }; b.material = { friction: 0, staticFriction: 0, restitution: 1 };
  b.shape = { type: 'rectangle', width: 2, height: 1 }; b.massModel = { mode: 'mass', mass: 2 }; return s;
}
function open(s = scene(), allowed = false) {
  const r = constructSteppingRuntime(s, { allowTickForces: allowed }); if (!r.ok) throw Error(JSON.stringify(r));
  runtimes.push(r.value); return r.value;
}
function snap(r: InternalRuntime): SimulationSnapshot { const s = r.snapshot(); if (!s.ok) throw Error(JSON.stringify(s)); return s.value; }
function step(r: InternalRuntime, inputs: unknown = []) { const s = r.step(inputs); if (!s.ok) throw Error(JSON.stringify(s)); return s.value; }
function input(s: SceneV1, tick = 1, sequence = 0, x = 1, y = 0): TickInput {
  return { tick, sequence, kind: 'apply-force', bodyId: s.bodies[0]!.id, vector: { x, y }, localPoint: { x: 0, y: 0 } };
}
function saved(s: SceneV1, x: number, y = 0, px = 0, py = 0) {
  s.forces.push({ id: id(100 + s.forces.length), type: 'constantForce', bodyId: s.bodies[0]!.id, vector: { x, y }, localPoint: { x: px, y: py } });
}
const rel = (v: number, reference: number, scale = Math.abs(reference)) => Math.abs(v - reference) / scale;

describe('production-boundary fixed stepping and SI force smoke tests', () => {
  it('executes precisely four h=1/480,12/12 calls per logical tick and snapshots exact tick*time', () => {
    const r = open(), calls = vi.spyOn(World.prototype, 'step'); const initial = snap(r);
    const s = step(r); expect(calls).toHaveBeenCalledTimes(4);
    calls.mock.calls.forEach(args => expect(args).toEqual([1 / 480, 12, 12]));
    expect(s.tick).toBe(1); expect(s.timeSeconds).toBe(1 / 120); expect(initial.tick).toBe(0);
    for (let i = 1; i < 120; i++) step(r);
    expect(snap(r).timeSeconds).toBe(1); expect(snap(r).tick).toBe(120);
    expect(planckAdapterContract.capabilities(scene()).executionReady).toBe(false);
  });
  it('free-fall smoke uses actual production runtime and an analytical SI oracle', () => {
    const s = scene(); s.world.gravity.y = -9.81; const r = open(s);
    for (let i = 0; i < 120; i++) step(r);
    const b = snap(r).bodies[0]!;
    expect(rel(b.position.y, 15.095, 4.905)).toBeLessThanOrEqual(.01);
    expect(rel(b.velocity.y, -9.81)).toBeLessThanOrEqual(.01);
    console.info(JSON.stringify({ smoke: 'free fall', y: b.position.y, vy: b.velocity.y, displacementRelativeError: rel(b.position.y, 15.095, 4.905) }));
  });
  it('reapplies saved Newton force every substep without multiplying by h', () => {
    const s = scene(); saved(s, 4); const before = JSON.stringify(s), r = open(s), force = vi.spyOn(Body.prototype, 'applyForce');
    for (let i = 0; i < 120; i++) step(r);
    const b = snap(r).bodies[0]!; expect(force).toHaveBeenCalledTimes(480);
    expect(rel(b.velocity.x, 2)).toBeLessThanOrEqual(.01); expect(rel(b.position.x, 1)).toBeLessThanOrEqual(.01);
    expect(JSON.stringify(s)).toBe(before);
    console.info(JSON.stringify({ smoke: 'constant 4 N / 2 kg', x: b.position.x, vx: b.velocity.x, positionRelativeError: rel(b.position.x, 1), velocityRelativeError: rel(b.velocity.x, 2) }));
  });
  it('maps rotating local application points each substep, world direction unchanged', () => {
    const s = scene(); s.bodies[0]!.angle = .5; s.bodies[0]!.angularVelocity = 2; saved(s, 0, 1, .5, 0);
    const r = open(s), points: { x: number; y: number }[] = [], force = Body.prototype.applyForce;
    vi.spyOn(Body.prototype, 'applyForce').mockImplementation(function (this: Body, ...args: Parameters<Body['applyForce']>) {
      const expected = this.getWorldPoint({ x: .5, y: 0 }); expect(args[0]).toEqual({ x: 0, y: 1 });
      expect(args[1]).toEqual(expected); points.push({ ...args[1] }); return force.apply(this, args);
    });
    const next = step(r); expect(points).toHaveLength(4); expect(points[0]).not.toEqual(points[3]);
    expect(next.bodies[0]!.angularVelocity).toBeGreaterThan(2); // positive r x F
  });
  it('net-zero force couple with tick-oriented forces approximates constant 1 N*m for 1 s', () => {
    const s = scene(), r = open(s, true);
    for (let tick = 1; tick <= 120; tick++) {
      const angle = snap(r).bodies[0]!.angle;
      // Direction updated once per logical tick, held world-fixed for four substeps.
      const a = { ...input(s, tick, 0, -Math.sin(angle), Math.cos(angle)), localPoint: { x: .5, y: 0 } };
      const b = { ...input(s, tick, 1, Math.sin(angle), -Math.cos(angle)), localPoint: { x: -.5, y: 0 } };
      step(r, [b, a]);
    }
    const b = snap(r).bodies[0]!;
    expect(Math.abs(b.position.x)).toBeLessThanOrEqual(1e-12); expect(Math.abs(b.position.y - 20)).toBeLessThanOrEqual(1e-12);
    expect(rel(b.angularVelocity, 1.2)).toBeLessThanOrEqual(.01); expect(rel(b.angle, .6)).toBeLessThanOrEqual(.01);
    console.info(JSON.stringify({ smoke: 'tick-oriented 1 Nm couple', omega: b.angularVelocity, angle: b.angle, omegaRelativeError: rel(b.angularVelocity, 1.2), angleRelativeError: rel(b.angle, .6) }));
  });
  it('world-fixed saved couple follows nonlinear torque, not a faked constant torque', () => {
    const s = scene(); saved(s, 0, 1, .5); saved(s, 0, -1, -.5); const r = open(s);
    for (let i = 0; i < 120; i++) step(r);
    // Independent midpoint ODE reference theta''=1.2*cos(theta), step-halved.
    const reference = (h: number) => {
      let theta = 0, omega = 0;
      for (let i = 0; i < Math.round(1 / h); i++) { const midTheta = theta + .5 * h * omega, midOmega = omega + .5 * h * 1.2 * Math.cos(theta); theta += h * midOmega; omega += h * 1.2 * Math.cos(midTheta); }
      return { theta, omega };
    };
    const a = reference(1e-5), b = reference(5e-6);
    expect(Math.abs(a.theta - b.theta)).toBeLessThanOrEqual(1e-8); expect(Math.abs(a.omega - b.omega)).toBeLessThanOrEqual(1e-8);
    const got = snap(r).bodies[0]!; expect(rel(got.angle, b.theta, .6)).toBeLessThanOrEqual(.01); expect(rel(got.angularVelocity, b.omega, 1.2)).toBeLessThanOrEqual(.01);
    console.info(JSON.stringify({ smoke: 'world-fixed saved couple', angle: got.angle, omega: got.angularVelocity, reference: b, normalizedAngleError: rel(got.angle, b.theta, .6), normalizedOmegaError: rel(got.angularVelocity, b.omega, 1.2) }));
  });
});

describe('strict atomic next-tick batches and permissions', () => {
  it('permits empty batches, defaults to denying live forces, stays usable after rejection', () => {
    const s = scene(), r = open(s), before = snap(r), apply = vi.spyOn(Body.prototype, 'applyForce'), native = vi.spyOn(World.prototype, 'step');
    expect(r.step([input(s)]).ok).toBe(false); expect(apply).not.toHaveBeenCalled(); expect(native).not.toHaveBeenCalled(); expect(snap(r)).toEqual(before);
    expect(step(r).tick).toBe(1);
  });
  it('copies and orders inputs, applies them for one tick only', () => {
    const s = scene(), r = open(s, true), batch = [input(s, 1, 2, 4), input(s, 1, 0, 2)]; const old = snap(r);
    const next = step(r, batch); expect(batch.map(x => x.sequence)).toEqual([2, 0]);
    Reflect.set(batch[0]!.vector, 'x', 999); const after = step(r);
    expect(after.bodies[0]!.velocity.x).toBe(next.bodies[0]!.velocity.x); expect(old.tick).toBe(0);
    expect(Object.isFrozen(next.bodies[0]!.velocity)).toBe(true); expect(Reflect.set(next.bodies[0]!.position, 'x', 90)).toBe(false);
  });
  it.each(['stale', 'future', 'fractional', 'duplicate', 'negative sequence', 'unsafe sequence', 'missing', 'static', 'extra', 'kind', 'nonfinite', 'sparse', 'oversized', 'host', 'cycle', 'getter'])("rejects %s atomically before any native mutation", kind => {
    const s = scene(); s.bodies.push({ ...structuredClone(s.bodies[0]!), id: id(5), motionType: 'static', position: { x: 10, y: 20 } });
    const r = open(s, true), before = snap(r), apply = vi.spyOn(Body.prototype, 'applyForce'), native = vi.spyOn(World.prototype, 'step');
    let batch: unknown = [input(s)]; const event = (batch as TickInput[])[0]!; const getter = vi.fn(() => 1);
    if (kind === 'stale') Reflect.set(event, 'tick', 0);
    if (kind === 'future') Reflect.set(event, 'tick', 2);
    if (kind === 'fractional') Reflect.set(event, 'tick', 1.5);
    if (kind === 'duplicate') batch = [event, event];
    if (kind === 'negative sequence') Reflect.set(event, 'sequence', -1);
    if (kind === 'unsafe sequence') Reflect.set(event, 'sequence', Number.MAX_SAFE_INTEGER + 1);
    if (kind === 'missing') Reflect.set(event, 'bodyId', id(99));
    if (kind === 'static') Reflect.set(event, 'bodyId', s.bodies[1]!.id);
    if (kind === 'extra') Object.assign(event, { script: 'anything' });
    if (kind === 'kind') Reflect.set(event, 'kind', 'teleport');
    if (kind === 'nonfinite') Reflect.set(event.vector, 'x', Infinity);
    if (kind === 'sparse') batch = new Array(1);
    if (kind === 'oversized') batch = new Array(MAX_TICK_INPUTS + 1);
    if (kind === 'host') batch = new Date();
    if (kind === 'cycle') Reflect.set(event, 'vector', event);
    if (kind === 'getter') Object.defineProperty(event, 'vector', { enumerable: true, get: getter });
    expect(r.step(batch).ok).toBe(false); expect(getter).not.toHaveBeenCalled(); expect(native).not.toHaveBeenCalled(); expect(apply).not.toHaveBeenCalled();
    expect(snap(r)).toEqual(before); expect(step(r).tick).toBe(1);
  });
  it('rejects aggregate persisted+transient loads, torque, lever and acceleration before applying anything', () => {
    const s = scene(); s.bodies[0]!.massModel = { mode: 'mass', mass: 100 }; saved(s, 600); const r = open(s, true), before = snap(r);
    const apply = vi.spyOn(Body.prototype, 'applyForce'); expect(r.step([input(s, 1, 0, -600)]).ok).toBe(false); expect(apply).not.toHaveBeenCalled(); expect(snap(r)).toEqual(before);
    expect(r.step([{ ...input(s), localPoint: { x: 51, y: 0 } }]).ok).toBe(false);
    expect(r.step([{ ...input(s, 1, 0, 100), localPoint: { x: 20, y: 0 } }]).ok).toBe(false);
    expect(step(r).tick).toBe(1);
  });
  it('enforces exact resource/clock boundaries and rejects deep/oversized vector payloads', () => {
    const s = scene();
    const at = Array.from({ length: 200 }, (_, i) => input(s, Number.MAX_SAFE_INTEGER, i, 0));
    expect(validateTickInputs(at, Number.MAX_SAFE_INTEGER, s, true).ok).toBe(true);
    expect(validateTickInputs([], Number.MAX_SAFE_INTEGER + 1, s, true).ok).toBe(false);
    expect(validateTickInputs([input(s)], 1, s, true).ok).toBe(true);
    expect(validateTickInputs([{ ...input(s), extra: 'x'.repeat(2 * 1024 * 1024) }], 1, s, true).ok).toBe(false);
    let nested: unknown = 1; for (let i = 0; i < 33; i++) nested = { child: nested };
    expect(validateTickInputs([{ ...input(s), vector: nested }], 1, s, true).ok).toBe(false);
  });
});

describe('terminal failure, settings, envelopes and lifecycle', () => {
  it.each(['before', 'during', 'after', 'publication', 'internal'])('fails closed for settings drift %s without repairing globals', point => {
    const r = open(), prior = snap(r), native = World.prototype.step; let calls = 0;
    if (point === 'before') Settings.linearSlop = .01;
    if (point === 'internal') Object.defineProperty(internal, 'maxTranslationSquared', { configurable: true, value: 5 });
    vi.spyOn(World.prototype, 'step').mockImplementation(function (this: World, ...args: Parameters<World['step']>) {
      calls++; if (point === 'during') Settings.linearSlop = .01; native.apply(this, args); if (point === 'after') Settings.linearSlop = .01;
    });
    if (point === 'publication') {
      const get = Body.prototype.getWorldCenter;
      vi.spyOn(Body.prototype, 'getWorldCenter').mockImplementation(function (this: Body) { if (calls === 4) Settings.linearSlop = .01; return get.call(this); });
    }
    const failed = r.step([]); expect(failed.ok).toBe(false); expect(failed).not.toHaveProperty('value'); expect(r.snapshot().ok).toBe(false); expect(r.step([]).ok).toBe(false);
    expect(prior.tick).toBe(0); expect(prior.timeSeconds).toBe(0);
    if (point !== 'internal') expect(Settings.linearSlop).toBe(.01);
  });
  it.each(['throw', 'locked throw', 'nan', 'finite speed', 'translation clamp', 'rotation clamp', 'mass reset'])('terminates on %s and never publishes partial tick', fault => {
    const r = open(), old = snap(r), native = World.prototype.step; let world: World | undefined; let clamped: number | undefined;
    vi.spyOn(World.prototype, 'step').mockImplementation(function (this: World, ...args: Parameters<World['step']>) {
      world = this.getBodyList()!.getWorld();
      if (fault === 'throw') throw Error('native');
      if (fault === 'locked throw') { Reflect.set(this, 'm_locked', true); throw Error('locked native'); }
      if (fault === 'translation clamp') this.getBodyList()!.setLinearVelocity({ x: 10000, y: 0 });
      if (fault === 'rotation clamp') this.getBodyList()!.setAngularVelocity(10000);
      native.apply(this, args); const body = this.getBodyList()!;
      if (fault === 'translation clamp') clamped = body.getLinearVelocity().x;
      if (fault === 'rotation clamp') clamped = body.getAngularVelocity();
      if (fault === 'nan') body.setLinearVelocity({ x: NaN, y: 0 });
      if (fault === 'finite speed') body.setLinearVelocity({ x: 101, y: 0 });
      if (fault === 'mass reset') body.setMassData({ mass: 1, I: 1, center: { x: 0, y: 0 } });
    });
    expect(r.step([]).ok).toBe(false); expect(r.snapshot().ok).toBe(false); expect(r.step([]).ok).toBe(false); r.dispose(); r.dispose();
    if (fault === 'translation clamp') expect(clamped).toBeCloseTo(2 * 480, 10);
    if (fault === 'rotation clamp') expect(clamped).toBeCloseTo(Math.PI / 2 * 480, 10);
    expect(old.tick).toBe(0); if (fault !== 'locked throw') expect(world!.getBodyCount()).toBe(0);
  });
  it('double-disposes, guards reentrancy and preserves an independent world after failure', () => {
    const a = open(), b = open(), before = snap(b), native = World.prototype.step; let nested: unknown;
    vi.spyOn(World.prototype, 'step').mockImplementation(function (this: World, ...args: Parameters<World['step']>) {
      nested = a.step([]); expect(a.snapshot().ok).toBe(false); return native.apply(this, args);
    });
    step(a); expect(nested).toEqual(expect.objectContaining({ ok: false }));
    vi.restoreAllMocks(); a.dispose(); a.dispose(); expect(a.step([]).ok).toBe(false); expect(a.snapshot().ok).toBe(false); expect(snap(b)).toEqual(before); step(b);
  });
  it('fresh worlds replay identical input logs within 1e-10 and do not share snapshots/source', () => {
    const s = scene(), before = JSON.stringify(s), a = open(s, true), b = open(s, true); const old = snap(a);
    let maximum = 0;
    for (let tick = 1; tick <= 120; tick++) {
      const log = [input(s, tick, 2, 1), input(s, tick, 0, 2)]; const x = step(a, log), y = step(b, [...log].reverse());
      const u = x.bodies[0]!, v = y.bodies[0]!;
      for (const value of [u.position.x - v.position.x, u.position.y - v.position.y, u.velocity.x - v.velocity.x, u.velocity.y - v.velocity.y, u.angle - v.angle, u.angularVelocity - v.angularVelocity]) maximum = Math.max(maximum, Math.abs(value));
      expect(x).not.toBe(y);
    }
    expect(maximum).toBeLessThanOrEqual(1e-10); expect(JSON.stringify(s)).toBe(before); expect(old.tick).toBe(0);
    console.info(JSON.stringify({ smoke: 'fresh-runtime replay, 120 input ticks', maxAbsoluteSIError: maximum }));
  });
});


describe('late failures and additional rejection boundaries', () => {
  it.each([1, 4])('native exception at substep %s preserves the previous committed frame only', at => {
    const r = open(); const previous = step(r); const native = World.prototype.step; let calls = 0;
    vi.spyOn(World.prototype, 'step').mockImplementation(function (this: World, ...args: Parameters<World['step']>) {
      calls++; if (calls === at) throw Error('substep fault'); return native.apply(this, args);
    });
    expect(r.step([]).ok).toBe(false); expect(calls).toBe(at); expect(previous.tick).toBe(1); expect(previous.timeSeconds).toBe(1 / 120); expect(r.snapshot().ok).toBe(false);
  });
  it('catches settings drift after applying force and before any native step', () => {
    const s = scene(); saved(s, 4); const r = open(s), apply = Body.prototype.applyForce, native = vi.spyOn(World.prototype, 'step');
    vi.spyOn(Body.prototype, 'applyForce').mockImplementation(function (this: Body, ...args: Parameters<Body['applyForce']>) { apply.apply(this, args); Settings.linearSlop = .01; });
    expect(r.step([]).ok).toBe(false); expect(native).not.toHaveBeenCalled(); expect(r.snapshot().ok).toBe(false); expect(Settings.linearSlop).toBe(.01);
  });
  it.each(['translation', 'rotation'])('rejects native %s clamp even when final velocity was zeroed', kind => {
    const r = open(), original = World.prototype.step; let displacement = 0;
    vi.spyOn(World.prototype, 'step').mockImplementation(function (this: World, ...args: Parameters<World['step']>) {
      const b = this.getBodyList()!;
      if (kind === 'translation') b.setLinearVelocity({ x: 10000, y: 0 }); else b.setAngularVelocity(10000);
      original.apply(this, args);
      displacement = kind === 'translation' ? b.getPosition().x : b.getAngle();
      b.setLinearVelocity({ x: 0, y: 0 }); b.setAngularVelocity(0);
    });
    expect(r.step([]).ok).toBe(false); expect(displacement).toBeCloseTo(kind === 'translation' ? 2 : Math.PI / 2, 10); expect(r.snapshot().ok).toBe(false);
  });
  it('rejects unsafe finite world position, altered type, material and geometry', () => {
    for (const kind of ['position', 'position jump', 'type', 'material', 'geometry']) {
      const r = open(), original = World.prototype.step;
      const spy = vi.spyOn(World.prototype, 'step').mockImplementation(function (this: World, ...args: Parameters<World['step']>) {
        original.apply(this, args); const b = this.getBodyList()!;
        if (kind === 'position') b.setPosition({ x: 1001, y: 0 });
        if (kind === 'position jump') b.setPosition({ x: 1, y: 20 });
        if (kind === 'type') b.setType('static');
        if (kind === 'material') b.getFixtureList()!.setFriction(1);
        if (kind === 'geometry') Reflect.set(b.getFixtureList()!.getShape(), 'm_radius', .02);
      });
      expect(r.step([]).ok).toBe(false); expect(r.snapshot().ok).toBe(false); spy.mockRestore();
    }
  });
  it('keeps another native world usable when the first fails', () => {
    const a = open(), b = open(), before = snap(b);
    vi.spyOn(World.prototype, 'step').mockImplementationOnce(() => { throw Error('only first world'); });
    expect(a.step([]).ok).toBe(false); expect(snap(b)).toEqual(before); expect(step(b).tick).toBe(1);
  });
  it('accepts 200 zero-load events and rejects malformed nested data without running getters', () => {
    const s = scene(), r = open(s, true);
    expect(step(r, Array.from({ length: 200 }, (_, i) => input(s, 1, i, 0))).tick).toBe(1);
    const bad = { ...input(s, 2), vector: { x: 0, y: 0, extra: 1 } }; expect(r.step([bad]).ok).toBe(false);
    const getter = vi.fn(() => 0), event = input(s, 2); Object.defineProperty(event.vector, 'x', { get: getter, enumerable: true });
    expect(r.step([event]).ok).toBe(false); expect(getter).not.toHaveBeenCalled(); expect(snap(r).tick).toBe(1); expect(step(r).tick).toBe(2);
  });
});


it('release exceptions cannot leak native errors or revive a disposed runtime', () => {
  const r = open();
  vi.spyOn(World.prototype, 'destroyBody').mockImplementation(() => { throw Object.assign(new Error('native release'), { secretNativeHandle: {} }); });
  expect(() => r.dispose()).not.toThrow(); expect(() => r.dispose()).not.toThrow();
  expect(r.step([]).ok).toBe(false); expect(r.snapshot().ok).toBe(false);
});


it('preserves inclusive speed limits despite coordinate-subtraction roundoff', () => {
  const s = scene(); s.bodies[0]!.velocity.x = 100; s.bodies[0]!.angularVelocity = 100; s.bodies[0]!.angle = 10000;
  const r = open(s); const next = step(r); expect(next.bodies[0]!.velocity.x).toBe(100); expect(next.bodies[0]!.angularVelocity).toBe(100);
});
