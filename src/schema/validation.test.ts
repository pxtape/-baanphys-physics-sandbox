import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import { spawnSync } from 'node:child_process';
import example from '../../examples/falling-ball.scene.json';
import { parseSceneJson, validateScene } from './index';
import type { SceneValidationResult } from './index';
import { INPUT_LIMITS } from './input';
import type { SceneV1, Shape } from '../domain/scene-v1.generated';
import type { SceneBody, SceneDocument } from '../domain/scene';
import { validateGeometry } from '../domain/geometry';

const uuid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
function makeScene(): SceneV1 { return structuredClone(example) as unknown as SceneV1; }
function body(scene: SceneV1) { return scene.bodies[0]!; }
function force(scene: SceneV1): SceneV1['forces'][number] { return { id: uuid(800), type: 'constantForce', bodyId: body(scene).id, vector: { x: 1, y: 0 }, localPoint: { x: 0, y: 0 } }; }
function measurement(scene: SceneV1): SceneV1['measurements'][number] { return { id: uuid(801), bodyId: body(scene).id, quantity: 'velocityY', display: 'both', sampleEveryTicks: 1, maxSamples: 100 }; }
function fixtureRod(s: SceneV1): SceneV1['constraints'][number] { return { id: uuid(850), name: 'Rod', type: 'rod', length: 1, anchorA: { type: 'world', point: { x: 0, y: 0 } }, anchorB: { type: 'body', bodyId: body(s).id, localPoint: { x: 0, y: 0 } }, collideConnected: false }; }

function rejected(result: SceneValidationResult, code?: string, path?: string) {
  expect(result.ok).toBe(false);
  expect(result).not.toHaveProperty('scene');
  if (code) expect(result.diagnostics).toContainEqual(expect.objectContaining({ code, ...(path === undefined ? {} : { path }) }));
  for (const d of result.diagnostics) {
    expect(d.path === '' || d.path.startsWith('/')).toBe(true);
    expect(d.message.length).toBeGreaterThan(0); expect(d.suggestion.length).toBeGreaterThan(0);
  }
}
function changed(change: (scene: SceneV1) => void) { const scene = makeScene(); change(scene); return validateScene(scene); }
afterEach(() => vi.restoreAllMocks());

describe('canonical Scene v1 and format assertions', () => {
  it('accepts the existing saved example, preserving all physical values and identity', () => {
    const scene = makeScene(), before = JSON.stringify(scene), result = validateScene(scene);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expectTypeOf(result.scene).toEqualTypeOf<SceneDocument>();
    expect(JSON.stringify(result.scene)).toBe(before);
    expect(result.executionReady).toBe(false);
    expect(result.diagnostics.map(d => d.code)).toEqual(['EXECUTION_NOT_VALIDATED', 'REVISION_HISTORY_NOT_VALIDATED']);
    expect(result.scene).not.toBe(scene); expect(Object.isFrozen(scene)).toBe(false);
  });
  it('accepts empty/draft scenes without silently filling defaults', () => {
    const scene = makeScene(); scene.identity = { state: 'draft' }; scene.bodies = [];
    expect(validateScene(scene).ok).toBe(true);
    const result = changed(scene => { Reflect.deleteProperty(scene, 'world'); });
    rejected(result, 'SCHEMA_INVALID', '/world');
  });
  it.each<Shape>([{ type: 'circle', radius: 0.2 }, { type: 'rectangle', width: 2, height: 1 }, regular(3), regular(8), regular(128)])('accepts geometry branch %#', shape => {
    expect(changed(scene => { body(scene).shape = shape; }).ok).toBe(true);
  });
  it('accepts density mode and finite static material data without serializing infinity', () => {
    expect(changed(scene => { body(scene).massModel = { mode: 'density', arealDensity: 100 }; }).ok).toBe(true);
  });
  it.each([
    ['future version', (s: SceneV1) => Object.assign(s, { schemaVersion: 2 }), 'SCHEMA_VERSION_UNSUPPORTED'],
    ['script field', (s: SceneV1) => Object.assign(s, { script: 'throw new Error("executed")' }), 'SCHEMA_INVALID'],
    ['unknown property', (s: SceneV1) => Object.assign(body(s), { selection: true }), 'SCHEMA_INVALID'],
    ['bad UUID', (s: SceneV1) => { body(s).id = 'invalid'; }, 'FORMAT_INVALID'],
    ['urn UUID', (s: SceneV1) => { body(s).id = 'urn:uuid:' + body(s).id; }, 'FORMAT_INVALID'],
    ['bad timestamp', (s: SceneV1) => { if (s.identity.state === 'saved') s.identity.savedAt = 'yesterday'; }, 'FORMAT_INVALID'],
    ['invalid calendar date', (s: SceneV1) => { if (s.identity.state === 'saved') s.identity.savedAt = '2026-02-30T00:00:00Z'; }, 'FORMAT_INVALID'],
    ['negative mass', (s: SceneV1) => { body(s).massModel = { mode: 'mass', mass: -1 }; }, 'SCHEMA_INVALID'],
    ['zero radius', (s: SceneV1) => { body(s).shape = { type: 'circle', radius: 0 }; }, 'SCHEMA_INVALID'],
    ['irrelevant shape field', (s: SceneV1) => Object.assign(body(s).shape, { width: 1 }), 'SCHEMA_INVALID'],
    ['unbounded step', (s: SceneV1) => { Object.assign(s.simulation, { timestepSeconds: 1 }); }, 'SCHEMA_INVALID'],
    ['unknown engine', (s: SceneV1) => Object.assign(s.simulation.engine, { name: 'custom' }), 'SCHEMA_INVALID'],
    ['unknown control target', (s: SceneV1) => { s.studentPolicy.controls = [control(s)]; Object.assign(s.studentPolicy.controls[0]!.target, { parameter: 'engine' }); }, 'SCHEMA_INVALID'],
    ['sleeping override', (s: SceneV1) => Object.assign(s.simulation, { sleeping: true }), 'SCHEMA_INVALID'],
    ['both mass modes', (s: SceneV1) => Object.assign(body(s).massModel, { arealDensity: 1 }), 'SCHEMA_INVALID'],
  ] as const)('rejects existing/structural invalid fixture: %s', (_name, change, code) => rejected(changed(change), code));
  it('asserts Unicode codepoint lengths and does not coerce types', () => {
    expect(changed(s => { s.title = '🧲'.repeat(200); }).ok).toBe(true);
    rejected(changed(s => { s.title = '🧲'.repeat(201); }), 'SCHEMA_INVALID', '/title');
    rejected(changed(s => { Object.assign(body(s).position, { x: '1' }); }), 'SCHEMA_INVALID');
  });
  it('never loads schemas from data and does not mutate invalid input', () => {
    const network = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network forbidden'));
    const s = Object.assign(makeScene(), { $schema: 'https://untrusted.example/execute', $ref: 'https://untrusted.example/schema' });
    const before = JSON.stringify(s); rejected(validateScene(s));
    expect(JSON.stringify(s)).toBe(before); expect(network).not.toHaveBeenCalled();
  });
});

describe('resource limits and safe JSON parsing', () => {
  it('round-trips a valid JSON file and escaped strings/numbers', () => {
    const s = makeScene(); s.title = 'quoted "value" \\ test'; body(s).velocity = { x: -0.125e-3, y: 2.3e2 };
    const result = parseSceneJson(JSON.stringify(s)); expect(result.ok).toBe(true);
    if (result.ok) expect(result.scene).toEqual(s);
  });
  it.each(['', '{', '[1,]', '{"a":1,}', '{"a" 1}', '{"a":undefined}', '{"a":NaN}', '{"a":Infinity}', '{"a":01}', '{"a":+1}', '{"a":1.}', '{"a":true false}', '/* comment */{}', 'null false', '{"a":"\\q"}', '{"a":"line\nfeed"}', '{"a":"unterminated}'])('rejects malformed JSON: %s', text => rejected(parseSceneJson(text), 'JSON_SYNTAX'));
  it.each(['{"x":1,"x":2}', '{"x":1,"\\u0078":2}', '{"nested":{"a":1,"a":2}}'])('rejects decoded duplicate keys: %s', text => rejected(parseSceneJson(text), 'JSON_DUPLICATE_KEY'));
  it('allows the same property names in separate objects', () => expect(parseSceneJson(JSON.stringify(makeScene())).ok).toBe(true));
  it('rejects numeric overflow and nonfinite object values', () => {
    rejected(parseSceneJson('{"value":1e999}'), 'INPUT_NONFINITE_NUMBER', '/value');
    for (const n of [NaN, Infinity, -Infinity]) rejected(changed(s => { body(s).position.x = n; }), 'INPUT_NONFINITE_NUMBER');
  });
  it('enforces UTF-8 bytes before parsing, including the exact 2 MiB boundary', () => {
    const json = JSON.stringify(makeScene()), bytes = new TextEncoder().encode(json).length;
    expect(parseSceneJson(json + ' '.repeat(INPUT_LIMITS.bytes - bytes)).ok).toBe(true);
    rejected(parseSceneJson(json + ' '.repeat(INPUT_LIMITS.bytes - bytes + 1)), 'RESOURCE_BYTES_EXCEEDED');
    rejected(parseSceneJson('🧲'.repeat(INPUT_LIMITS.bytes / 4 + 1)), 'RESOURCE_BYTES_EXCEEDED');
  });
  it('accepts container depth 32 for input checking, rejects 33 before recursion', () => {
    const at32 = parseSceneJson('['.repeat(32) + '0' + ']'.repeat(32));
    expect(at32.diagnostics.some(d => d.code === 'RESOURCE_DEPTH_EXCEEDED')).toBe(false);
    rejected(parseSceneJson('['.repeat(33) + '0' + ']'.repeat(33)), 'RESOURCE_DEPTH_EXCEEDED');
    let value: unknown = 0; for (let i = 0; i < 33; i++) value = [value];
    rejected(validateScene(value), 'RESOURCE_DEPTH_EXCEEDED');
  });
  it.each(['bodies', 'constraints', 'forces', 'measurements', 'controls', 'vertices'] as const)('rejects oversized %s before schema/geometry work', name => {
    const s = makeScene();
    if (name === 'controls') s.studentPolicy.controls = Array.from({ length: 51 }, () => control(s));
    else if (name === 'vertices') body(s).shape = regular(129);
    else if (name === 'bodies') s.bodies = Array.from({ length: 101 }, () => structuredClone(body(s)));
    else if (name === 'constraints') s.constraints = Array.from({ length: 101 }, () => fixtureRod(s));
    else if (name === 'forces') s.forces = Array.from({ length: 201 }, () => force(s));
    else s.measurements = Array.from({ length: 21 }, () => measurement(s));
    rejected(validateScene(s), 'RESOURCE_COLLECTION_LIMIT'); rejected(parseSceneJson(JSON.stringify(s)), 'RESOURCE_COLLECTION_LIMIT');
  });
  it('does not invoke getters, toJSON or execute data; rejects cycles and non-JSON hosts', () => {
    const getter = vi.fn(() => 1), toJSON = vi.fn(() => makeScene());
    const input = makeScene(); Object.defineProperty(input, 'evil', { enumerable: true, get: getter });
    rejected(validateScene(input), 'INPUT_NOT_JSON'); expect(getter).not.toHaveBeenCalled();
    rejected(validateScene({ toJSON }), 'INPUT_NOT_JSON'); expect(toJSON).not.toHaveBeenCalled();
    const cycle: Record<string, unknown> = {}; cycle.self = cycle; rejected(validateScene(cycle), 'INPUT_CYCLE');
    for (const value of [new Date(), new Map(), 1n, undefined, () => 1, Symbol('x')]) rejected(validateScene(value), 'INPUT_NOT_JSON');
    const symbol = Object.assign(makeScene(), { [Symbol('x')]: 1 }); rejected(validateScene(symbol), 'INPUT_NOT_JSON');
    rejected(validateScene(new Array(3)), 'INPUT_NOT_JSON');
    const named = [1]; Object.assign(named, { label: 'not JSON' }); rejected(validateScene(named), 'INPUT_NOT_JSON');
  });
  it('handles hostile prototype names as inert JSON data', () => {
    rejected(parseSceneJson('{"__proto__":{"polluted":true}}'), 'SCHEMA_INVALID');
    expect(Object.prototype).not.toHaveProperty('polluted');
    const result = parseSceneJson('{"a~b/c":1}');
    expect(result.diagnostics.some(d => d.path === '/a~0b~1c')).toBe(true);
  });
  it('bounds diagnostics and returns no invalid scene', () => {
    const s = makeScene(); s.bodies = Array.from({ length: 100 }, () => structuredClone(body(s)));
    for (const b of s.bodies) Object.assign(b.shape, { radius: -1, extra: true });
    const result = validateScene(s); rejected(result);
    expect(result.diagnostics.length).toBeLessThanOrEqual(100);
    expect(result.diagnostics.some(d => d.code === 'DIAGNOSTICS_TRUNCATED')).toBe(true);
  });
});


const polygon = (width = 2, height = 2) => ({ type: 'polygon' as const, vertices: [
  { x: -width / 2, y: -height / 2 }, { x: width / 2, y: -height / 2 },
  { x: width / 2, y: height / 2 }, { x: -width / 2, y: height / 2 },
] });
function regular(n: number): Extract<SceneV1['bodies'][number]['shape'], { type: 'polygon' }> {
  return { type: 'polygon', vertices: Array.from({ length: n }, (_, i) => ({ x: Math.cos(2 * Math.PI * i / n), y: Math.sin(2 * Math.PI * i / n) })) };
}
function control(scene: SceneV1): SceneV1['studentPolicy']['controls'][number] {
  return { id: uuid(900), label: 'Mass', min: 0.1, max: 10, step: 0.1, target: { type: 'body', bodyId: scene.bodies[0]!.id, parameter: 'mass' } };
}

describe('geometry and physical data', () => {
  it.each([
    ['clockwise', () => { const p = polygon(); p.vertices.reverse(); return p; }, 'POLYGON_NOT_CCW'],
    ['offset centroid', () => { const p = polygon(); p.vertices.forEach(v => { v.x += 1e-7; }); return p; }, 'POLYGON_CENTROID_OFFSET'],
    ['short edge at the boundary', () => polygon(1e-6, 1), 'POLYGON_EDGE_TOO_SHORT'],
    ['area below the boundary', () => polygon(5e-6, 1e-5), 'POLYGON_AREA_TOO_SMALL'],
    ['concave', () => ({ type: 'polygon' as const, vertices: [{ x: -1, y: -1 }, { x: 1, y: -1 }, { x: 0, y: 0 }, { x: 1, y: 1 }, { x: -1, y: 1 }] }), 'POLYGON_NOT_CONVEX'],
    ['crossing edges', () => ({ type: 'polygon' as const, vertices: [{ x: -1, y: -1 }, { x: 1, y: 1 }, { x: -1, y: 1 }, { x: 1, y: -1 }] }), 'POLYGON_SELF_INTERSECTION'],
    ['star with consistent local turns', () => { const p = regular(5); return { ...p, vertices: [0, 2, 4, 1, 3].map(i => p.vertices[i]!) }; }, 'POLYGON_SELF_INTERSECTION'],
    ['collinear', () => ({ type: 'polygon' as const, vertices: [{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }] }), 'POLYGON_AREA_TOO_SMALL'],
    ['repeated vertex', () => { const p = polygon(); p.vertices[1] = p.vertices[0]!; return p; }, 'POLYGON_EDGE_TOO_SHORT'],
  ] as const)('rejects %s without recentering or changing anchors', (_name, shape, code) => rejected(changed(s => { body(s).shape = shape(); }), code));
  it.each([polygon(2e-6, 1), polygon(2e-5, 1e-5)])('accepts dimensions above the geometric boundaries', shape => expect(changed(s => { body(s).shape = shape; }).ok).toBe(true));
  it('permits centroid roundoff within 1e-8 m', () => {
    const p = polygon(); p.vertices.forEach(v => { v.x += 0.5e-8; });
    expect(changed(s => { body(s).shape = p; }).ok).toBe(true);
  });
  it('rejects degenerate/underflowing physical area or inertia in every shape branch', () => {
    for (const shape of [{ type: 'circle' as const, radius: 1e-300 }, { type: 'rectangle' as const, width: 1e-300, height: 1e-300 }]) {
      rejected(changed(s => { body(s).shape = shape; }), 'BODY_PHYSICAL_PROPERTIES_INVALID');
    }
  });
  it('rejects static velocities and invalid friction ordering', () => {
    rejected(changed(s => { s.bodies[1]!.velocity.y = 1; }), 'STATIC_BODY_VELOCITY');
    rejected(changed(s => { s.bodies[1]!.angularVelocity = 0.01; }), 'STATIC_BODY_VELOCITY');
    rejected(changed(s => { body(s).material.staticFriction = 0; }), 'MATERIAL_FRICTION_ORDER');
  });
});

describe('references, constraints and controls', () => {
  function constraint(s: SceneV1, type: 'hinge' | 'rod' | 'rope' | 'spring'): SceneV1['constraints'][number] {
    const common = { id: uuid(1000), name: 'Constraint', anchorA: { type: 'world' as const, point: { x: 0, y: 0 } }, anchorB: { type: 'body' as const, bodyId: body(s).id, localPoint: { x: 0, y: 0 } }, collideConnected: false };
    switch (type) {
      case 'hinge': return { ...common, type };
      case 'rod': return { ...common, type, length: 1 };
      case 'rope': return { ...common, type, maxLength: 1 };
      case 'spring': return { ...common, type, restLength: 1, springConstant: 10, dampingCoefficient: 0.2 };
    }
  }
  it.each(['hinge', 'rod', 'rope', 'spring'] as const)('validates the %s data branch without implying solver support', type => {
    const result = changed(s => { s.constraints = [constraint(s, type)]; });
    expect(result.ok).toBe(true); if (result.ok) expect(result.executionReady).toBe(false);
  });
  it('accepts forces, measurements, body/world controls and body-body anchors', () => {
    const result = changed(s => {
      s.forces = [force(s)]; s.measurements = [measurement(s)];
      s.studentPolicy.controls = [control(s), { id: uuid(901), label: 'Gravity', min: -20, max: 0, step: 1, target: { type: 'world', parameter: 'gravityY' } }];
      s.constraints = [constraint(s, 'hinge')]; s.constraints[0]!.anchorA = { type: 'body', bodyId: s.bodies[1]!.id, localPoint: { x: 0, y: 0 } };
    }); expect(result.ok).toBe(true);
  });
  it('rejects UUID collisions globally, including case variants', () => {
    rejected(changed(s => { s.forces = [force(s)]; s.forces[0]!.id = body(s).id; }), 'DUPLICATE_ID', '/forces/0/id');
    rejected(changed(s => { s.bodies[1]!.id = body(s).id.toUpperCase(); }), 'DUPLICATE_ID');
  });
  it.each(['constraint', 'force', 'measurement', 'control'] as const)('rejects dangling or wrong-type %s body references', kind => {
    const result = changed(s => {
      const missing = uuid(99999);
      if (kind === 'constraint') { s.constraints = [constraint(s, 'hinge')]; s.constraints[0]!.anchorB = { type: 'body', bodyId: missing, localPoint: { x: 0, y: 0 } }; }
      if (kind === 'force') { s.forces = [force(s)]; s.forces[0]!.bodyId = s.forces[0]!.id; }
      if (kind === 'measurement') { s.measurements = [measurement(s)]; s.measurements[0]!.bodyId = missing; }
      if (kind === 'control') { const c = control(s); if (c.target.type === 'body') c.target.bodyId = missing; s.studentPolicy.controls = [c]; }
    }); rejected(result, 'REFERENCE_NOT_FOUND');
  });
  it('resolves UUID case variants without rewriting saved values', () => {
    const result = changed(s => { s.forces = [force(s)]; s.forces[0]!.bodyId = body(s).id.toUpperCase(); });
    expect(result.ok).toBe(true); if (result.ok) expect(result.scene.forces[0]!.bodyId).toBe(example.bodies[0]!.id.toUpperCase());
  });
  it('rejects same-body, world/world and static/world constraints', () => {
    rejected(changed(s => { const c = constraint(s, 'hinge'); c.anchorA = c.anchorB; s.constraints = [c]; }), 'CONSTRAINT_SAME_BODY');
    rejected(changed(s => { const c = constraint(s, 'hinge'); c.anchorB = c.anchorA; s.constraints = [c]; }), 'CONSTRAINT_NO_DYNAMIC_BODY');
    rejected(changed(s => { const c = constraint(s, 'hinge'); if (c.anchorB.type === 'body') c.anchorB.bodyId = s.bodies[1]!.id; s.constraints = [c]; }), 'CONSTRAINT_NO_DYNAMIC_BODY');
  });
  it('rejects forces and body controls on static targets', () => {
    rejected(changed(s => { const f = force(s); f.bodyId = s.bodies[1]!.id; s.forces = [f]; }), 'FORCE_STATIC_TARGET');
    rejected(changed(s => { const c = control(s); if (c.target.type === 'body') c.target.bodyId = s.bodies[1]!.id; s.studentPolicy.controls = [c]; }), 'CONTROL_STATIC_TARGET');
  });
  it.each([
    ['equal endpoints', (c: ReturnType<typeof control>) => { c.min = c.max; }, 'CONTROL_RANGE_INVALID'],
    ['reversed interval', (c: ReturnType<typeof control>) => { c.min = 20; }, 'CONTROL_RANGE_INVALID'],
    ['oversized step', (c: ReturnType<typeof control>) => { c.step = 100; }, 'CONTROL_RANGE_INVALID'],
    ['zero step', (c: ReturnType<typeof control>) => { c.step = 0; }, 'SCHEMA_INVALID'],
    ['default excluded', (c: ReturnType<typeof control>) => { c.min = 2; }, 'CONTROL_DEFAULT_OUTSIDE_RANGE'],
    ['mass below bounds', (c: ReturnType<typeof control>) => { c.min = 0; }, 'CONTROL_MASS_RANGE'],
  ] as const)('rejects control %s', (_name, change, code) => rejected(changed(s => { const c = control(s); change(c); s.studentPolicy.controls = [c]; }), code));
  it('rejects duplicate target parameters and density-mode mass controls', () => {
    rejected(changed(s => { const c = control(s); s.studentPolicy.controls = [c, { ...structuredClone(c), id: uuid(902) }]; }), 'CONTROL_DUPLICATE_TARGET');
    rejected(changed(s => { body(s).massModel = { mode: 'density', arealDensity: 1 }; s.studentPolicy.controls = [control(s)]; }), 'CONTROL_MASS_MODE');
  });
  it('accepts range endpoints/defaults and exact maximum collection budgets', () => {
    const s = makeScene();
    s.bodies = Array.from({ length: 100 }, (_, i) => ({ ...structuredClone(body(s)), id: uuid(i + 1) }));
    s.forces = Array.from({ length: 200 }, (_, i) => ({ ...force(s), id: uuid(2000 + i) }));
    s.measurements = Array.from({ length: 20 }, (_, i) => ({ ...measurement(s), id: uuid(3000 + i), maxSamples: 72000 }));
    s.constraints = Array.from({ length: 100 }, (_, i) => ({ ...constraint(s, 'rod'), id: uuid(4000 + i) }));
    s.studentPolicy.controls = Array.from({ length: 50 }, (_, i) => ({ ...control(s), id: uuid(5000 + i), min: 1, max: 2, step: 1, target: { type: 'body', bodyId: s.bodies[i]!.id, parameter: 'mass' } }));
    expect(validateScene(s).ok).toBe(true);
  });
});

describe('identity, immutability and execution separation', () => {
  it.each([
    ['simulation/revision collision', (s: SceneV1) => { if (s.identity.state === 'saved') s.identity.revisionId = s.identity.simulationId; }, 'IDENTITY_ID_COLLISION'],
    ['first revision parent', (s: SceneV1) => { if (s.identity.state === 'saved') s.identity.parentRevisionId = uuid(200); }, 'REVISION_PARENT_INVALID'],
    ['later revision without parent', (s: SceneV1) => { if (s.identity.state === 'saved') s.identity.revisionNumber = 2; }, 'REVISION_PARENT_INVALID'],
    ['self parent', (s: SceneV1) => { if (s.identity.state === 'saved') { s.identity.revisionNumber = 2; s.identity.parentRevisionId = s.identity.revisionId.toUpperCase(); } }, 'REVISION_SELF_PARENT'],
    ['non UTC offset', (s: SceneV1) => { if (s.identity.state === 'saved') s.identity.savedAt = '2026-11-17T01:00:00+01:00'; }, 'TIMESTAMP_NOT_UTC'],
    ['saved before created', (s: SceneV1) => { if (s.identity.state === 'saved') s.identity.savedAt = '2026-11-16T00:00:00Z'; }, 'TIMESTAMP_ORDER'],
    ['sub-millisecond reversal', (s: SceneV1) => { if (s.identity.state === 'saved') { s.identity.createdAt = '2026-11-17T00:00:00.00000002Z'; s.identity.savedAt = '2026-11-17T00:00:00.00000001Z'; } }, 'TIMESTAMP_ORDER'],
  ] as const)('rejects %s', (_name, change, code) => rejected(changed(change), code));
  it('accepts later revisions without pretending to resolve repository history', () => {
    const result = changed(s => { if (s.identity.state === 'saved') { s.identity.revisionNumber = 2; s.identity.parentRevisionId = uuid(42); } });
    expect(result.ok).toBe(true); expect(result.diagnostics.some(d => d.code === 'REVISION_HISTORY_NOT_VALIDATED')).toBe(true);
  });
  it('keeps validated authored data deeply immutable and detached from the caller', () => {
    const input = makeScene(), result = validateScene(input); expect(result.ok).toBe(true);
    if (!result.ok) throw Error('Fixture invalid');
    expect(Object.isFrozen(result.scene.bodies[0]!.position)).toBe(true);
    expect(Object.isFrozen(result.scene.bodies)).toBe(true); expect(Object.isFrozen(result.diagnostics[0])).toBe(true);
    body(input).position.x = 999;
    expect(result.scene.bodies[0]!.position.x).toBe(0);
    expect(() => Reflect.set(result.scene.bodies[0]!.position, 'x', 2)).not.toThrow();
    expect(Reflect.set(result.scene, 'title', 'mutated')).toBe(false);
    expect(result.scene.title).toBe(example.title);
    const copy = structuredClone(result.scene); Reflect.set(copy.bodies[0]!.position, 'x', 2);
    expect(result.scene.bodies[0]!.position.x).toBe(0);
  });
  it('exposes one schema-derived readonly shape, without UI/runtime properties', () => {
    expectTypeOf<SceneDocument['schemaVersion']>().toEqualTypeOf<1>();
    expectTypeOf<SceneDocument['bodies']>().toEqualTypeOf<readonly SceneBody[]>();
    expectTypeOf<SceneBody['shape']>().extract<{ type: 'circle' }>().toHaveProperty('radius').toEqualTypeOf<number>();
    const typeContract = (scene: SceneDocument) => {
      // @ts-expect-error Authored properties are readonly.
      scene.title = 'invalid mutation';
      // @ts-expect-error Nested coordinates are readonly.
      scene.bodies[0]!.position.x = 10;
      // @ts-expect-error Array commands cannot mutate a validated scene.
      scene.bodies.push(scene.bodies[0]!);
      // @ts-expect-error Engine handles are not scene fields.
      scene.engineWorld = {};
    };
    expect(typeof typeContract).toBe('function');
  });
  it('does not coerce numeric strings, remove unknown keys or assign defaults', () => {
    rejected(changed(s => { Object.assign(body(s).shape, { radius: '1' }); }), 'SCHEMA_INVALID');
    rejected(changed(s => { Object.assign(body(s).massModel, { mass: '1 + 2' }); }), 'SCHEMA_INVALID');
    rejected(changed(s => { Reflect.deleteProperty(s.simulation, 'substeps'); }), 'SCHEMA_INVALID');
  });
  it('does not execute untrusted scene code or fetch schema/profile URLs', () => {
    const fetch = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Unexpected network request'));
    const text = JSON.stringify({ ...makeScene(), $schema: 'https://attacker.invalid/schema', script: 'globalThis.pwned=true' });
    rejected(parseSceneJson(text)); expect(fetch).not.toHaveBeenCalled(); expect(globalThis).not.toHaveProperty('pwned');
    const result = changed(s => { s.simulation.engine.profile = 'unregistered-profile'; s.simulation.engine.version = '99.0.0'; });
    expect(result.ok).toBe(true); if (result.ok) expect(result.executionReady).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });
  it('runs the static format validator with dynamic string compilation disabled', () => {
    const url = new URL('./generated/scene-v1.validator.js', import.meta.url).href;
    const program = `import validate from ${JSON.stringify(url)}; import assert from 'node:assert/strict'; const scene=${JSON.stringify(example)}; assert.equal(validate(scene),true); scene.bodies[0].id='bad'; assert.equal(validate(scene),false);`;
    const process = spawnSync(globalThis.process.execPath, ['--disallow-code-generation-from-strings', '--input-type=module', '-e', program], { encoding: 'utf8' });
    expect(process.status, process.stderr).toBe(0);
  });

});


it('computes uniform-lamina area/inertia from every shape without native engines', () => {
  const issues: unknown[] = [];
  const square = validateGeometry(polygon(2, 2), '/shape', d => issues.push(d));
  expect(square?.area).toBe(4); expect(square?.inertiaPerMass).toBeCloseTo(2 / 3, 14);
  const disk = validateGeometry({ type: 'circle', radius: 2 }, '/shape', d => issues.push(d));
  expect(disk?.area).toBeCloseTo(4 * Math.PI); expect(disk?.inertiaPerMass).toBe(2);
  const rectangle = validateGeometry({ type: 'rectangle', width: 2, height: 1 }, '/shape', d => issues.push(d));
  expect(rectangle?.area).toBe(2); expect(rectangle?.inertiaPerMass).toBeCloseTo(5 / 12, 14);
  expect(issues).toEqual([]);
});


it('validates rectangle bounds, mass boundaries and density values', () => {
  for (const shape of [{ type: 'rectangle' as const, width: 0, height: 1 }, { type: 'rectangle' as const, width: 1, height: -1 }]) rejected(changed(s => { body(s).shape = shape; }), 'SCHEMA_INVALID');
  for (const mass of [1e-6, 1e6]) expect(changed(s => { body(s).massModel = { mode: 'mass', mass }; }).ok).toBe(true);
  rejected(changed(s => { body(s).massModel = { mode: 'mass', mass: 1e-7 }; }), 'SCHEMA_INVALID');
  rejected(changed(s => { body(s).massModel = { mode: 'density', arealDensity: 0 }; }), 'SCHEMA_INVALID');
});
it.each(['velocityX', 'velocityY'] as const)('accepts the %s initial-parameter control branch', parameter => {
  const result = changed(s => { const c = control(s); c.min = -1; c.max = 1; if (c.target.type === 'body') c.target.parameter = parameter; s.studentPolicy.controls = [c]; });
  expect(result.ok).toBe(true);
});
it('rejects a control range excluding the world gravity default', () => {
  rejected(changed(s => { s.studentPolicy.controls = [{ id: uuid(700), label: 'Gravity', min: 0, max: 1, step: 1, target: { type: 'world', parameter: 'gravityY' } }]; }), 'CONTROL_DEFAULT_OUTSIDE_RANGE');
});
it('enforces the in-memory serialized UTF-8 byte limit before AJV', () => {
  rejected(validateScene({ text: '🧲'.repeat(INPUT_LIMITS.bytes / 4) }), 'RESOURCE_BYTES_EXCEEDED');
});
