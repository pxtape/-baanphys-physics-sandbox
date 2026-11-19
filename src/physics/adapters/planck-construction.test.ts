import { afterEach, describe, expect, it, vi } from 'vitest';
import { World, Body, Polygon, Settings } from 'planck';
import { readFileSync } from 'node:fs';
import example from '../../../examples/falling-ball.scene.json';
import type { SceneV1, Shape } from '../../domain/scene-v1.generated';
import { PLANCK_IDENTITY, PLANCK_SETTINGS, planckAdapterContract } from '../index';
import { physicalProperties } from '../physical-properties';
import { validateScene } from '../../schema';
import { constructInitialWorld } from './planck-construction';
import type { InitialWorldSession } from '../construction-contract';

const sessions: InitialWorldSession[] = [];
afterEach(() => { vi.restoreAllMocks(); sessions.splice(0).forEach(s => s.dispose()); });
function scene(): SceneV1 {
  const s = structuredClone(example) as SceneV1;
  Object.assign(s.simulation, structuredClone(PLANCK_SETTINGS)); s.simulation.engine = { ...PLANCK_IDENTITY };
  s.bodies.forEach(b => { b.material.staticFriction = b.material.friction; }); return s;
}
function open(s = scene(), observer?: Parameters<typeof constructInitialWorld>[1]) {
  const r = constructInitialWorld(s, observer); expect(r.ok, JSON.stringify(r)).toBe(true);
  if (!r.ok) throw Error('construction rejected'); sessions.push(r.value); return r.value;
}
function snapshot(session: InitialWorldSession) {
  const r = session.snapshot(); if (!r.ok) throw Error('snapshot rejected'); return r.value;
}
function near(value: number, expected: number) { expect(Math.abs(value - expected)).toBeLessThanOrEqual(1e-12 * Math.max(1, Math.abs(expected))); }
const rectangle: Shape = { type: 'polygon', vertices: [{ x: -1, y: -0.5 }, { x: 1, y: -0.5 }, { x: 1, y: 0.5 }, { x: -1, y: 0.5 }] };
const triangle: Shape = { type: 'polygon', vertices: [{ x: -1, y: -1 }, { x: 1, y: -1 }, { x: 0, y: 2 }] };

const oracles = [
  { name: 'disk', shape: { type: 'circle', radius: 0.2 } as Shape, mass: 1, area: Math.PI * 0.04, inertia: 0.02 },
  { name: 'rectangle', shape: { type: 'rectangle', width: 2, height: 1 } as Shape, mass: 2, area: 2, inertia: 5 / 6 },
  { name: 'rectangle polygon', shape: rectangle, mass: 2, area: 2, inertia: 5 / 6 },
  { name: 'triangle', shape: triangle, mass: 3, area: 3, inertia: 2 },
];
describe('independent analytical SI properties and native construction', () => {
  it.each(oracles)('$name mass/density references agree with native values', oracle => {
    for (const mode of ['mass', 'density'] as const) {
      const s = scene(), b = s.bodies[0]!; b.shape = structuredClone(oracle.shape);
      b.massModel = mode === 'mass' ? { mode, mass: oracle.mass } : { mode, arealDensity: oracle.mass / oracle.area };
      const p = physicalProperties(b); expect(p.ok).toBe(true); if (!p.ok) throw Error('properties rejected');
      near(p.value.area, oracle.area); near(p.value.mass, oracle.mass); near(p.value.inertia, oracle.inertia);
      near(p.value.arealDensity, oracle.mass / oracle.area); near(p.value.centroid.x, 0); near(p.value.centroid.y, 0);
      const native: Body[] = [];
      const original = World.prototype.createBody;
      const spy = vi.spyOn(World.prototype, 'createBody').mockImplementation(function (this: World, ...args: Parameters<World['createBody']>) {
        const body = original.apply(this, args); native.push(body); return body;
      });
      open(s); const body = native.find(n => n.isDynamic())!;
      near(body.getMass(), oracle.mass); near(body.getInertia(), oracle.inertia);
      near(body.getFixtureList()!.getDensity(), oracle.mass / oracle.area);
      expect(body.getLocalCenter()).toEqual({ x: 0, y: 0 });
      const nativeShape = body.getFixtureList()!.getShape();
      if (oracle.shape.type === 'circle') expect(nativeShape.getRadius()).toBe(oracle.shape.radius);
      else {
        const poly = nativeShape as Polygon;
        const expected = oracle.shape.type === 'polygon' ? oracle.shape.vertices : [{ x: -1, y: -0.5 }, { x: 1, y: -0.5 }, { x: 1, y: 0.5 }, { x: -1, y: 0.5 }];
        expect(poly.m_count).toBe(expected.length);
        for (const v of expected) expect(poly.m_vertices.some(n => n.x === v.x && n.y === v.y)).toBe(true);
      }
      console.info(JSON.stringify({ case: oracle.name, mode, area: p.value.area, mass: body.getMass(), inertia: body.getInertia(), areaError: Math.abs(p.value.area - oracle.area), massError: Math.abs(body.getMass() - oracle.mass), inertiaError: Math.abs(body.getInertia() - oracle.inertia) }));
      expect(body.getFixtureList()!.getFriction()).toBe(b.material.friction);
      expect(body.getFixtureList()!.getRestitution()).toBe(b.material.restitution);
      const stat = native.find(n => n.isStatic())!;
      expect(Reflect.get(stat, 'm_invMass')).toBe(0); expect(Reflect.get(stat, 'm_invI')).toBe(0); expect(stat.getMass()).toBe(0); expect(stat.getInertia()).toBe(0);
      spy.mockRestore();
    }
  });
  it('maps negative positions, rotations, velocities and tiny centroid offsets without rewriting', () => {
    const s = scene(), b = s.bodies[0]!;
    b.shape = structuredClone(rectangle); if (b.shape.type === 'polygon') b.shape.vertices.forEach(v => { v.x += 5e-9; });
    b.position = { x: -3.25, y: -7.5 }; b.angle = 0.73; b.velocity = { x: -4.5, y: 2.3 }; b.angularVelocity = 1.7;
    const before = JSON.stringify(s), session = open(s);
    const got = snapshot(session).bodies.find(n => n.id === b.id)!;
    near(got.position.x, b.position.x); near(got.position.y, b.position.y);
    near(got.velocity.x, b.velocity.x); near(got.velocity.y, b.velocity.y); near(got.angle, b.angle); near(got.angularVelocity, b.angularVelocity);
    expect(JSON.stringify(s)).toBe(before); expect(Object.isFrozen(s.bodies[0]!.position)).toBe(false);
    expect(Object.isFrozen(got.position)).toBe(true); expect(Object.isFrozen(snapshot(session))).toBe(true);
    b.position.x = 900; expect(snapshot(session).bodies.find(n => n.id === b.id)!.position.x).toBe(got.position.x);
  });
  it.each([3, 8])('preserves native %s-vertex polygon vertices up to cyclic ordering', n => {
    const s = scene(); s.bodies[0]!.shape = { type: 'polygon', vertices: Array.from({ length: n }, (_, i) => ({ x: Math.cos(2 * Math.PI * i / n), y: Math.sin(2 * Math.PI * i / n) })) };
    const input = structuredClone(s), session = open(s); expect(snapshot(session).tick).toBe(0); expect(s).toEqual(input);
  });
  it.each([0.01, 1000])('accepts policy mass boundary %s', mass => { const s = scene(); s.bodies[0]!.massModel = { mode: 'mass', mass }; open(s); });
  it.each([0.01, 50])('accepts circle radius boundary %s', radius => { const s = scene(); s.bodies[0]!.shape = { type: 'circle', radius }; open(s); });
  it('orders by canonical UUID independently of source array order and preserves spelling', () => {
    const s = scene(); s.bodies[0]!.id = s.bodies[0]!.id.toUpperCase();
    const positions: unknown[] = [], original = World.prototype.createBody;
    vi.spyOn(World.prototype, 'createBody').mockImplementation(function (this: World, ...args: Parameters<World['createBody']>) {
      const body = original.apply(this, args); positions.push({ ...body.getPosition() }); return body;
    });
    const a = open(s); s.bodies.reverse(); const b = open(s);
    const expectedPositions = [...s.bodies].sort((a, b) => a.id.toLowerCase() < b.id.toLowerCase() ? -1 : 1).map(b => b.position);
    expect(positions).toEqual([...expectedPositions, ...expectedPositions]);
    expect(snapshot(a)).toEqual(snapshot(b));
    expect(snapshot(a).bodies.map(n => n.id)).toEqual([...s.bodies].sort((a, b) => a.id.toLowerCase() < b.id.toLowerCase() ? -1 : 1).map(n => n.id));
    expect(snapshot(a).timeSeconds).toBe(0); expect(Object.keys(a).sort()).toEqual(['dispose', 'snapshot']);
  });
  it('isolates worlds, keeps settings explicit and rejects global setting interference', () => {
    const worlds: World[] = []; const original = World.prototype.createBody;
    vi.spyOn(World.prototype, 'createBody').mockImplementation(function (this: World, ...args: Parameters<World['createBody']>) { if (!worlds.includes(this)) worlds.push(this); return original.apply(this, args); });
    const a = open(), b = open(); const before = snapshot(b);
    expect(worlds.length).toBe(2); expect(worlds[0]).not.toBe(worlds[1]);
    for (const w of worlds) {
      expect(w.getAllowSleeping()).toBe(false); expect(w.getWarmStarting()).toBe(true); expect(w.getContinuousPhysics()).toBe(true);
      for (let body = w.getBodyList(); body; body = body.getNext()) {
        expect(body.getLinearDamping()).toBe(0); expect(body.getAngularDamping()).toBe(0); expect(body.isFixedRotation()).toBe(false);
      }
    }
    expect(Settings.velocityThreshold).toBe(0);
    a.dispose(); a.dispose(); expect(worlds[0]!.getBodyCount()).toBe(0); expect(snapshot(b)).toEqual(before);
    expect(a.snapshot().ok).toBe(false);
    const previous = Settings.velocityThreshold;
    try { Settings.velocityThreshold = 1; expect(constructInitialWorld(scene()).ok).toBe(false); }
    finally { Settings.velocityThreshold = previous; }
  });
  it('accepts frozen validated source and isolates it from failed transactions', () => {
    const parsed = validateScene(scene()); if (!parsed.ok) throw Error('invalid fixture');
    const before = JSON.stringify(parsed.scene), success = constructInitialWorld(parsed.scene);
    expect(success.ok).toBe(true); if (!success.ok) throw Error('construction failed');
    sessions.push(success.value); const first = snapshot(success.value);
    const failure = constructInitialWorld(parsed.scene, stage => { if (stage === 'world') throw Error('world checkpoint'); });
    expect(failure.ok).toBe(false); expect(failure).not.toHaveProperty('value');
    expect(snapshot(success.value)).toEqual(first); expect(JSON.stringify(parsed.scene)).toBe(before);
    expect(Object.isFrozen(parsed.scene.bodies[0]!.position)).toBe(true);
  });
  it('uses the pinned native package version', () => { expect(JSON.parse(readFileSync('node_modules/planck/package.json', 'utf8')).version).toBe('1.5.1'); });
});

describe('atomic construction failure and unsupported input', () => {
  it.each(['body', 'fixture', 'mass'] as const)('cleans up failures after first/middle/final %s checkpoint', stage => {
    for (const index of [0, 1, 2]) {
      const s = scene(); s.bodies.push({ ...structuredClone(s.bodies[0]!), id: 'ffffffff-ffff-4fff-8fff-ffffffffffff' });
      const worlds: World[] = [], original = World.prototype.createBody;
      const spy = vi.spyOn(World.prototype, 'createBody').mockImplementation(function (this: World, ...args: Parameters<World['createBody']>) { if (!worlds.includes(this)) worlds.push(this); return original.apply(this, args); });
      const r = constructInitialWorld(s, (point, i) => { if (point === stage && i === index) throw Error('injected failure'); });
      expect(r.ok).toBe(false); expect(r).not.toHaveProperty('value'); expect(worlds).toHaveLength(1); expect(worlds[0]!.getBodyCount()).toBe(0); spy.mockRestore();
    }
  });
  it('cleans up when native creation throws after allocating an unreturned body', () => {
    const original = World.prototype.createBody; const worlds: World[] = [];
    vi.spyOn(World.prototype, 'createBody').mockImplementation(function (this: World, ...args: Parameters<World['createBody']>) { worlds.push(this); original.apply(this, args); throw Error('native failure after allocation'); });
    expect(constructInitialWorld(scene()).ok).toBe(false); expect(worlds[0]!.getBodyCount()).toBe(0);
  });
  it('rejects native polygon alteration and releases the temporary world', () => {
    const original = Body.prototype.createFixture; let body: Body | undefined;
    vi.spyOn(Body.prototype, 'createFixture').mockImplementation(function (this: Body, ...args: Parameters<Body['createFixture']>) {
      const fixture = original.apply(this, args); body = fixture.getBody();
      if (fixture.getShape().getType() === 'polygon') (fixture.getShape() as Polygon).m_vertices[0]!.x += 0.01;
      return fixture;
    });
    const s = scene(); s.bodies[0]!.shape = structuredClone(rectangle);
    const r = constructInitialWorld(s); expect(r.ok).toBe(false);
    if (!r.ok) expect(r.diagnostics[0]!.code).toBe('NATIVE_GEOMETRY_ALTERED');
    expect(body!.getWorld().getBodyCount()).toBe(0);
  });
  it('rejects before allocation for wrong profile, unsupported features, invalid math or stale policy', () => {
    const observe = vi.fn(), spy = vi.spyOn(World.prototype, 'createBody');
    for (const change of [
      (s: SceneV1) => { s.simulation.engine.version = '99.0.0'; },
      (s: SceneV1) => { s.bodies[0]!.shape = { type: 'circle', radius: 1e-300 }; },
      (s: SceneV1) => { s.bodies[0]!.velocity.x = 101; },
      (s: SceneV1) => { s.constraints = [{ id: 'ffffffff-ffff-4fff-8fff-ffffffffffff', name: 'hinge', type: 'hinge', anchorA: { type: 'world', point: { x: 0, y: 0 } }, anchorB: { type: 'body', bodyId: s.bodies[0]!.id, localPoint: { x: 0, y: 0 } }, collideConnected: false }]; },
      (s: SceneV1) => { s.measurements = [{ id: 'ffffffff-ffff-4fff-8fff-ffffffffffff', bodyId: s.bodies[0]!.id, quantity: 'positionX', display: 'meter', sampleEveryTicks: 1, maxSamples: 2 }]; },
    ]) { const s = scene(); change(s); expect(constructInitialWorld(s, observe).ok).toBe(false); }
    expect(observe).not.toHaveBeenCalled(); expect(spy).not.toHaveBeenCalled();
    expect(planckAdapterContract.capabilities(scene()).executionReady).toBe(false); expect(planckAdapterContract.initialize(scene()).ok).toBe(false);
  });
  it('pure property helper rejects invalid/underflow dimensions and nonpositive mass', () => {
    for (const radius of [-1, 0, NaN, 1e-300]) { const s = scene(); s.bodies[0]!.shape = { type: 'circle', radius }; expect(physicalProperties(s.bodies[0]!).ok).toBe(false); }
    const s = scene(); s.bodies[0]!.massModel = { mode: 'mass', mass: -1 }; expect(physicalProperties(s.bodies[0]!).ok).toBe(false);
  });
});
