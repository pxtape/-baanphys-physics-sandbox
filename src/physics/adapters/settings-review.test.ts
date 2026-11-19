import { afterEach, expect, it, vi } from 'vitest';
import { Body, World, Settings } from 'planck';
import * as Planck from 'planck';
const SettingsInternal: object = Reflect.get(Planck, 'SettingsInternal');
import example from '../../../examples/falling-ball.scene.json';
import type { SceneV1 } from '../../domain/scene-v1.generated';
import { PLANCK_IDENTITY, PLANCK_SETTINGS } from '../index';
import type { InitialWorldSession } from '../construction-contract';
import { constructInitialWorld } from './planck-construction';
import { APPROVED_NATIVE_SETTINGS, APPROVED_INTERNAL_SETTINGS, initializeNativeSettings, nativeSettingsMatch } from './native-settings';

// Trusted bootstrap once; test teardown is the ONLY drift restoration path.
expect(initializeNativeSettings()).toBe(true);
const nativeDescriptors = Object.getOwnPropertyDescriptors(Settings);
const internalDescriptors = Object.getOwnPropertyDescriptors(SettingsInternal);
const sessions: InitialWorldSession[] = [];
afterEach(() => {
  vi.restoreAllMocks();
  sessions.splice(0).forEach(s => s.dispose());
  Object.defineProperties(Settings, nativeDescriptors);
  Object.defineProperties(SettingsInternal, internalDescriptors);
});
function scene(): SceneV1 {
  const s = structuredClone(example) as SceneV1;
  Object.assign(s.simulation, structuredClone(PLANCK_SETTINGS)); s.simulation.engine = { ...PLANCK_IDENTITY };
  s.bodies.forEach(b => { b.material.staticFriction = b.material.friction; }); return s;
}
function open() {
  const r = constructInitialWorld(scene()); expect(r.ok).toBe(true);
  if (!r.ok) throw Error('expected success'); sessions.push(r.value); return r.value;
}
function reject(r: ReturnType<typeof constructInitialWorld>, code = 'NATIVE_SETTINGS_MISMATCH') {
  if (r.ok) sessions.push(r.value); // Release even on a regression failure.
  expect(r.ok).toBe(false); expect(r).not.toHaveProperty('value');
  if (!r.ok) expect(r.diagnostics.some(d => d.code === code)).toBe(true);
}
function drift(target: object, key: string, value: number) {
  // Also permits testing getter-derived values without mutating production code.
  Object.defineProperty(target, key, { configurable: true, enumerable: true, writable: true, value });
}

it('preserves the exact linearSlop reproduction and rejects before altered fixtures exist', () => {
  const original = Settings.linearSlop, radii: number[] = [];
  const createFixture = Body.prototype.createFixture;
  vi.spyOn(Body.prototype, 'createFixture').mockImplementation(function (this: Body, ...args: Parameters<Body['createFixture']>) {
    const fixture = createFixture.apply(this, args);
    if (fixture.getShape().getType() === 'polygon') radii.push(fixture.getShape().getRadius());
    return fixture;
  });
  const r = constructInitialWorld(scene(), stage => { if (stage === 'world') Settings.linearSlop = original * 2; });
  reject(r); expect(radii).toEqual([]);
  expect(Settings.linearSlop).toBe(0.01); // Production did NOT silently repair it.
});

it('audits every native Settings and SettingsInternal value, including derived guards', () => {
  const keys = (target: object) => Object.getOwnPropertyNames(target).filter(k => !['name', 'length', 'prototype'].includes(k)).sort();
  expect(keys(Settings)).toEqual(Object.keys(APPROVED_NATIVE_SETTINGS).sort());
  expect(keys(SettingsInternal)).toEqual(Object.keys(APPROVED_INTERNAL_SETTINGS).filter(k => k !== 'lengthUnitsPerMeter').sort());
  expect(nativeSettingsMatch()).toBe(true);
});

it.each(Object.entries(APPROVED_NATIVE_SETTINGS))('rejects native %s mismatch before allocation without restoring it', (key, value) => {
  const created = vi.spyOn(World.prototype, 'createBody'), observe = vi.fn();
  drift(Settings, key, value + 1);
  reject(constructInitialWorld(scene(), observe));
  expect(observe).not.toHaveBeenCalled(); expect(created).not.toHaveBeenCalled();
  expect(Reflect.get(Settings, key)).toBe(value + 1);
});

it.each(Object.entries(APPROVED_INTERNAL_SETTINGS).filter(([key]) => key !== 'lengthUnitsPerMeter'))('rejects derived/internal %s mismatch before allocation', (key, value) => {
  const observe = vi.fn(); drift(SettingsInternal, key, value + 1);
  reject(constructInitialWorld(scene(), observe)); expect(observe).not.toHaveBeenCalled();
  expect(Reflect.get(SettingsInternal, key)).toBe(value + 1);
});

it.each(['world', 'body', 'fixture', 'mass', 'publish'] as const)('rejects drift at %s, cleans only failed world, preserves source and prior session', stage => {
  const prior = open(), before = prior.snapshot();
  const worlds: World[] = [], create = World.prototype.createBody;
  vi.spyOn(World.prototype, 'createBody').mockImplementation(function (this: World, ...args: Parameters<World['createBody']>) {
    if (!worlds.includes(this)) worlds.push(this); return create.apply(this, args);
  });
  const s = scene(), source = JSON.stringify(s);
  const r = constructInitialWorld(s, point => { if (point === stage) Settings.linearSlop = 0.01; });
  reject(r); for (const w of worlds) expect(w.getBodyCount()).toBe(0);
  expect(JSON.stringify(s)).toBe(source); expect(prior.snapshot()).toEqual(before);
  expect(Settings.linearSlop).toBe(0.01);
});

it.each(Object.entries(APPROVED_NATIVE_SETTINGS))('rejects native %s drift immediately before publication', (key, value) => {
  reject(constructInitialWorld(scene(), stage => { if (stage === 'publish') drift(Settings, key, value + 1); }));
  expect(Reflect.get(Settings, key)).toBe(value + 1);
});

it('rejects polygon skin corruption with unchanged vertices and unchanged globals', () => {
  const create = Body.prototype.createFixture, worlds: World[] = [];
  vi.spyOn(Body.prototype, 'createFixture').mockImplementation(function (this: Body, ...args: Parameters<Body['createFixture']>) {
    const f = create.apply(this, args); worlds.push(this.getWorld());
    if (f.getShape().getType() === 'polygon') Reflect.set(f.getShape(), 'm_radius', 0.02);
    return f;
  });
  reject(constructInitialWorld(scene()), 'NATIVE_GEOMETRY_ALTERED');
  expect(nativeSettingsMatch()).toBe(true); worlds.forEach(w => expect(w.getBodyCount()).toBe(0));
});

it('audits all completed fixture skins again after the final checkpoint', () => {
  let fixture: ReturnType<Body['createFixture']> | undefined;
  const create = Body.prototype.createFixture;
  vi.spyOn(Body.prototype, 'createFixture').mockImplementation(function (this: Body, ...args: Parameters<Body['createFixture']>) {
    const f = create.apply(this, args); if (f.getShape().getType() === 'polygon') fixture = f; return f;
  });
  reject(constructInitialWorld(scene(), stage => { if (stage === 'publish') Reflect.set(fixture!.getShape(), 'm_radius', 0.02); }), 'NATIVE_GEOMETRY_ALTERED');
  expect(fixture!.getBody().getWorld().getBodyCount()).toBe(0);
});

it('constructs independent worlds successfully without settings drift', () => {
  const s = scene(), before = JSON.stringify(s), a = open(), b = open();
  expect(a.snapshot()).toEqual(b.snapshot()); a.dispose(); expect(b.snapshot().ok).toBe(true);
  expect(JSON.stringify(s)).toBe(before); expect(nativeSettingsMatch()).toBe(true);
});
