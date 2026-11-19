import { describe, expect, expectTypeOf, it } from 'vitest';
import example from '../../examples/falling-ball.scene.json';
import type { SceneV1, Control, Shape } from '../domain/scene-v1.generated';
import { checkPlanckCapabilities, planckAdapterContract, PLANCK_IDENTITY, PLANCK_SETTINGS } from './index';
import type { CapabilityPolicyReport } from './index';

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
function scene(): SceneV1 {
  const s = structuredClone(example) as SceneV1;
  Object.assign(s.simulation, structuredClone(PLANCK_SETTINGS));
  s.simulation.engine = { ...PLANCK_IDENTITY };
  s.bodies[0]!.shape = { type: 'circle', radius: 0.1 };
  s.bodies.forEach(b => { b.material.staticFriction = b.material.friction; });
  s.world.gravity = { x: 0, y: 0 };
  return s;
}
function result(change: (s: SceneV1) => void = () => {}) { const s = scene(); change(s); return checkPlanckCapabilities(s); }
function fails(r: CapabilityPolicyReport, code = 'CAPABILITY_LIMIT_EXCEEDED', path?: string) {
  expect(r.policyCompatible).toBe(false); expect(r.executionReady).toBe(false);
  expect(r.diagnostics).toContainEqual(expect.objectContaining({ code, ...(path ? { path } : {}) }));
}
function pass(r: CapabilityPolicyReport) {
  expect(r.profileCompatible).toBe(true); expect(r.policyCompatible).toBe(true); expect(r.executionReady).toBe(false);
  expect(r.diagnostics.map(d => d.code)).toEqual(['FEATURE_NOT_QUALIFIED']);
}
function polygon(n: number, r = 1): Shape {
  return { type: 'polygon', vertices: Array.from({ length: n }, (_, i) => ({ x: r * Math.cos(2 * Math.PI * i / n), y: r * Math.sin(2 * Math.PI * i / n) })) };
}
function control(s: SceneV1, parameter: 'mass' | 'velocityX' | 'velocityY' | 'gravityX' | 'gravityY', min: number, max: number, bodyIndex = 0) {
  const target: Control['target'] = parameter === 'gravityX' || parameter === 'gravityY'
    ? { type: 'world', parameter } : { type: 'body', bodyId: s.bodies[bodyIndex]!.id, parameter };
  const common = { id: id(900 + s.studentPolicy.controls.length), label: parameter, min, max, step: Math.min(0.01, max - min) };
  s.studentPolicy.controls.push(target.type === 'world' ? { ...common, target } : { ...common, target });
}
function force(s: SceneV1, x: number, y = 0, lever = 0) {
  s.forces.push({ id: id(800 + s.forces.length), type: 'constantForce', bodyId: s.bodies[0]!.id, vector: { x, y }, localPoint: { x: 0, y: lever } });
}
function secondDynamic(s: SceneV1) {
  s.bodies[1] = { ...structuredClone(s.bodies[0]!), id: id(2) };
}

describe('geometry and material capability policy', () => {
  it('preserves settings/profile and separate readiness semantics', () => {
    pass(result());
    expectTypeOf<CapabilityPolicyReport['executionReady']>().toEqualTypeOf<false>();
    expectTypeOf<ReturnType<typeof planckAdapterContract.capabilities>>().toEqualTypeOf<CapabilityPolicyReport>();
    const r = result(s => { s.simulation.engine.version = '2.0.0'; });
    expect(r.profileCompatible).toBe(false); fails(r, 'ENGINE_VERSION_UNSUPPORTED');
    expect(result(s => { s.simulation.substeps = 2; }).policyCompatible).toBe(false);
  });
  it.each([3, 4, 8])('accepts centred strictly convex %s vertex polygons for policy only', n => pass(result(s => { s.bodies[0]!.shape = polygon(n); })));
  it.each([9, 128])('rejects %s vertices without decomposition', n => fails(result(s => { s.bodies[0]!.shape = polygon(n); }), 'CAPABILITY_GEOMETRY_UNSUPPORTED', '/bodies/0/shape/vertices'));
  it.each([
    { type: 'circle', radius: 0.01 }, { type: 'circle', radius: 50 },
    { type: 'rectangle', width: 0.02, height: 1 }, { type: 'rectangle', width: 100, height: 100 },
  ] as const)('accepts inclusive shape boundary %o', shape => pass(result(s => { s.bodies[0]!.shape = shape; })));
  it.each([
    { type: 'circle', radius: 0.0099 }, { type: 'circle', radius: 50.01 },
    { type: 'rectangle', width: 0.0199, height: 1 }, { type: 'rectangle', width: 100.01, height: 1 },
    { type: 'rectangle', width: 1, height: 0.0199 },
  ] as const)('rejects out-of-policy shape %o', shape => fails(result(s => { s.bodies[0]!.shape = shape; })));
  it('checks polygon edge/radius and COM clearance, not just vertex count', () => {
    const thin: Shape = { type: 'polygon', vertices: [{ x: -1, y: -0.009 }, { x: 1, y: -0.009 }, { x: 1, y: 0.009 }, { x: -1, y: 0.009 }] };
    fails(result(s => { s.bodies[0]!.shape = thin; }));
    fails(result(s => { s.bodies[0]!.shape = polygon(3, 51); }));
    fails(result(s => { s.bodies[0]!.shape = polygon(8, 0.02); })); // tiny edges
  });
  it('retains semantic rejection for clockwise, concave, crossing or offset polygons', () => {
    const shapes: Shape[] = [
      { type: 'polygon', vertices: [{ x: -1, y: -1 }, { x: -1, y: 1 }, { x: 1, y: 1 }, { x: 1, y: -1 }] },
      { type: 'polygon', vertices: [{ x: -1, y: -1 }, { x: 1, y: -1 }, { x: 0, y: 0 }, { x: 1, y: 1 }, { x: -1, y: 1 }] },
      { type: 'polygon', vertices: [{ x: -1, y: -1 }, { x: 1, y: 1 }, { x: -1, y: 1 }, { x: 1, y: -1 }] },
      { type: 'polygon', vertices: [{ x: 0, y: -1 }, { x: 2, y: -1 }, { x: 2, y: 1 }, { x: 0, y: 1 }] },
    ];
    for (const shape of shapes) fails(result(s => { s.bodies[0]!.shape = shape; }), 'CAPABILITY_SCENE_INVALID');
  });
  it('rejects invalid shapes even when a caller forges the readonly type', () => {
    fails(result(s => { Reflect.set(s.bodies[0]!.shape, 'type', 'capsule'); }), 'CAPABILITY_SCENE_INVALID');
    fails(result(s => { s.bodies[0]!.shape = { type: 'circle', radius: 0 }; }), 'CAPABILITY_SCENE_INVALID');
  });
  it('applies geometry/occupied-world bounds to static floors too', () => {
    pass(result(s => { s.bodies[1]!.shape = { type: 'rectangle', width: 100, height: 0.02 }; }));
    fails(result(s => { s.bodies[1]!.shape = { type: 'rectangle', width: 100, height: 0.001 }; }));
    pass(result(s => { s.bodies[0]!.position = { x: 999.9, y: 0 }; }));
    fails(result(s => { s.bodies[0]!.position = { x: 999.91, y: 0 }; }));
  });
  it.each([0, 0.4, 2])('accepts equal coefficients %s and restitution endpoints', friction => {
    for (const restitution of [0, 1]) pass(result(s => { s.bodies[0]!.material = { friction, staticFriction: friction, restitution }; }));
  });
  it('rejects even tiny coefficient mismatch with no tolerance or rewriting', () => {
    fails(result(s => { s.bodies[0]!.material = { friction: 0.4, staticFriction: 0.4000000000000001, restitution: 1 }; }), 'CAPABILITY_MATERIAL_UNSUPPORTED', '/bodies/0/material/staticFriction');
  });
});

describe('numerical bounds and simultaneous student ranges', () => {
  it.each([0.01, 1000])('accepts mass boundary %s', mass => pass(result(s => { s.bodies[0]!.massModel = { mode: 'mass', mass }; })));
  it.each([0.0099, 1000.01])('rejects mass outside policy %s', mass => fails(result(s => { s.bodies[0]!.massModel = { mode: 'mass', mass }; })));
  it('checks density-derived mass and inertia in all supported shapes', () => {
    for (const shape of [{ type: 'circle', radius: 1 }, { type: 'rectangle', width: 1, height: 1 }, polygon(4)] as Shape[]) {
      pass(result(s => { s.bodies[0]!.shape = shape; s.bodies[0]!.massModel = { mode: 'density', arealDensity: 1 }; }));
      fails(result(s => { s.bodies[0]!.shape = shape; s.bodies[0]!.massModel = { mode: 'density', arealDensity: 10000 }; }));
    }
  });
  it('uses vector norms for velocity/gravity and inclusive boundaries', () => {
    for (const field of ['velocity', 'gravity'] as const) {
      pass(result(s => { if (field === 'velocity') s.bodies[0]!.velocity = { x: 60, y: 80 }; else s.world.gravity = { x: 60, y: 80 }; }));
      fails(result(s => { if (field === 'velocity') s.bodies[0]!.velocity = { x: 80, y: 80 }; else s.world.gravity = { x: 80, y: 80 }; }));
    }
    pass(result(s => { s.bodies[0]!.angularVelocity = 100; }));
    fails(result(s => { s.bodies[0]!.angularVelocity = 100.01; }));
  });
  it('checks force magnitudes, conservative sums and cancellation', () => {
    pass(result(s => { s.bodies[0]!.massModel = { mode: 'mass', mass: 10 }; force(s, 600, 800); }));
    fails(result(s => { s.bodies[0]!.massModel = { mode: 'mass', mass: 100 }; force(s, 800, 800); }), 'CAPABILITY_LIMIT_EXCEEDED', '/forces/0/vector');
    fails(result(s => { s.bodies[0]!.massModel = { mode: 'mass', mass: 100 }; force(s, 600); force(s, -600); }), 'CAPABILITY_LIMIT_EXCEEDED', '/bodies/0/id');
  });
  it('checks lever, worst-orientation torque and angular acceleration', () => {
    pass(result(s => { s.bodies[0]!.shape = { type: 'rectangle', width: 2, height: 1 }; s.bodies[0]!.massModel = { mode: 'mass', mass: 100 }; force(s, 500, 0, 2); }));
    fails(result(s => { s.bodies[0]!.shape = { type: 'rectangle', width: 2, height: 1 }; s.bodies[0]!.massModel = { mode: 'mass', mass: 100 }; force(s, 500, 0, 2.01); }));
    fails(result(s => { force(s, 0, 0, 50.01); }), 'CAPABILITY_LIMIT_EXCEEDED', '/forces/0/localPoint');
    pass(result(s => { force(s, 1, 0, 50); })); // max lever, angular acceleration=10000
    fails(result(s => { force(s, 50.01, 0, 1); })); // angular acceleration >10000
  });
  it('checks pairwise mass-ratio boundaries but excludes static/intra-body ranges', () => {
    pass(result(s => { secondDynamic(s); s.bodies[1]!.massModel = { mode: 'mass', mass: 100 }; }));
    fails(result(s => { secondDynamic(s); s.bodies[1]!.massModel = { mode: 'mass', mass: 100.01 }; }));
    pass(result(s => { control(s, 'mass', 0.01, 1000); })); // one dynamic body, not two simultaneous masses
  });
  it('checks both endpoints, not just defaults or a sampled step grid', () => {
    pass(result(s => { control(s, 'velocityX', -100, 100); }));
    fails(result(s => { control(s, 'velocityX', -101, 100); }), 'CAPABILITY_LIMIT_EXCEEDED', '/studentPolicy/controls/0');
    fails(result(s => { control(s, 'mass', 0.001, 1); }));
  });
  it('catches interacting velocity and gravity intervals', () => {
    for (const pair of [['velocityX', 'velocityY'], ['gravityX', 'gravityY']] as const) {
      pass(result(s => { control(s, pair[0], -80, 80); }));
      pass(result(s => { control(s, pair[1], -80, 80); }));
      fails(result(s => { control(s, pair[0], -80, 80); control(s, pair[1], -80, 80); }));
    }
  });
  it('catches simultaneous gravity and low-mass acceleration amplification', () => {
    pass(result(s => { force(s, 3); control(s, 'mass', 0.1, 1); }));
    pass(result(s => { force(s, 3); control(s, 'gravityY', -80, 0); }));
    fails(result(s => { force(s, 3); control(s, 'mass', 0.1, 1); control(s, 'gravityY', -80, 0); }));
  });
  it('catches interacting independent body mass ranges', () => {
    pass(result(s => { secondDynamic(s); control(s, 'mass', 0.1, 1); }));
    pass(result(s => { secondDynamic(s); control(s, 'mass', 1, 100, 1); }));
    fails(result(s => { secondDynamic(s); control(s, 'mass', 0.1, 1); control(s, 'mass', 1, 100, 1); }));
  });
  it('resolves case-variant UUID controls and forces without rewriting IDs', () => {
    fails(result(s => { force(s, 3); s.forces[0]!.bodyId = s.bodies[0]!.id.toUpperCase(); control(s, 'mass', 0.01, 1); const t = s.studentPolicy.controls[0]!.target; if (t.type === 'body') t.bodyId = t.bodyId.toUpperCase(); }));
  });
  it('safely rejects nonfinite/invalid JSON data before policy', () => {
    fails(result(s => { s.bodies[0]!.velocity.x = Infinity; }), 'CAPABILITY_SCENE_INVALID');
    fails(result(s => { s.bodies[0]!.shape = { type: 'circle', radius: 1e-300 }; }), 'CAPABILITY_SCENE_INVALID');
  });
});

describe('unsupported features, diagnostics and isolation', () => {
  it.each(['hinge', 'rod', 'rope', 'spring'] as const)('rejects %s constraints atomically', type => {
    const s = scene();
    const common = { id: id(700), name: type, anchorA: { type: 'world' as const, point: { x: 0, y: 0 } }, anchorB: { type: 'body' as const, bodyId: s.bodies[0]!.id, localPoint: { x: 0, y: 0 } }, collideConnected: false };
    s.constraints = [type === 'hinge' ? { ...common, type } : type === 'rod' ? { ...common, type, length: 1 } : type === 'rope' ? { ...common, type, maxLength: 1 } : { ...common, type, restLength: 1, springConstant: 10, dampingCoefficient: 0 }];
    fails(checkPlanckCapabilities(s), 'CAPABILITY_FEATURE_UNSUPPORTED', '/constraints/0/type');
    const initialized = planckAdapterContract.initialize(s); expect(initialized.ok).toBe(false); expect(initialized).not.toHaveProperty('value');
  });
  it('rejects every requested measurement branch instead of ignoring it', () => {
    for (const quantity of ['positionX', 'positionY', 'velocityX', 'velocityY', 'accelerationX', 'accelerationY', 'angularVelocity', 'kineticEnergy'] as const) {
      fails(result(s => { s.measurements = [{ id: id(600), bodyId: s.bodies[0]!.id, quantity, display: 'both', sampleEveryTicks: 1, maxSamples: 100 }]; }), 'CAPABILITY_FEATURE_UNSUPPORTED', '/measurements/0');
    }
  });
  it('produces deterministic bounded mixed diagnostics with actionable pointers', () => {
    const s = scene(); const base = s.bodies[0]!;
    s.bodies = Array.from({ length: 100 }, (_, i) => ({ ...structuredClone(base), id: id(i), material: { friction: 0, staticFriction: 1, restitution: 0 } }));
    const r = checkPlanckCapabilities(s); fails(r, 'CAPABILITY_DIAGNOSTICS_TRUNCATED');
    expect(r.diagnostics.length).toBe(100); expect(checkPlanckCapabilities(s)).toEqual(r);
    for (const d of r.diagnostics) {
      expect(d.path === '' || d.path.startsWith('/')).toBe(true); expect(d.suggestion.length).toBeGreaterThan(0);
      expect(d.stage).toBe('execution'); expect(d.severity).toBe('error');
    }
    const init = planckAdapterContract.initialize(s); expect(init.ok).toBe(false);
    if (!init.ok) { expect(init.diagnostics.length).toBe(100); expect(init.diagnostics[0]!.code).toBe('ADAPTER_NOT_IMPLEMENTED'); }
  });
  it('combines geometry, material and force failures in stable traversal order', () => {
    const r = result(s => { s.bodies[0]!.shape = polygon(9); s.bodies[0]!.material.staticFriction = 1; force(s, 2000); });
    expect(r.profileCompatible).toBe(true); expect(r.policyCompatible).toBe(false);
    const codes = r.diagnostics.map(d => d.code);
    expect(codes[0]).toBe('FEATURE_NOT_QUALIFIED');
    expect(codes).toContain('CAPABILITY_GEOMETRY_UNSUPPORTED'); expect(codes).toContain('CAPABILITY_MATERIAL_UNSUPPORTED');
  });
  it('never mutates/freezes caller data, leaks a runtime or falsely qualifies valid policy', () => {
    const s = scene(), before = JSON.stringify(s); const r = checkPlanckCapabilities(s);
    pass(r); expect(JSON.stringify(s)).toBe(before); expect(Object.isFrozen(s.bodies[0]!.position)).toBe(false);
    expect(Object.isFrozen(r.diagnostics[0])).toBe(true);
    const init = planckAdapterContract.initialize(s); expect(init.ok).toBe(false); expect(init).not.toHaveProperty('value');
    expect(JSON.stringify(s)).toBe(before);
  });
});
