import { describe, expect, expectTypeOf, it } from 'vitest';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import example from '../../examples/falling-ball.scene.json';
import { validateScene } from '../schema';
import type { SceneDocument } from '../domain/scene';
import { PLANCK_IDENTITY, PLANCK_SETTINGS, checkPlanckContract, planckAdapterContract, orderTickInputs } from './index';
import type { PhysicsAdapter, PhysicsRuntime, BodySnapshot, SimulationSnapshot, TickInput } from './index';

function scene(change?: (s: typeof example) => void): SceneDocument {
  const value = structuredClone(example);
  Object.assign(value.simulation.engine, PLANCK_IDENTITY);
  Object.assign(value.simulation, structuredClone(PLANCK_SETTINGS));
  change?.(value);
  const result = validateScene(value);
  if (!result.ok) throw Error(JSON.stringify(result.diagnostics));
  return result.scene;
}
const input = (sequence: number): TickInput => ({ tick: 1, sequence, kind: 'apply-force', bodyId: example.bodies[0]!.id, vector: { x: 4, y: 0 }, localPoint: { x: 0, y: 1 } });

describe('adapter contracts and trust gate', () => {
  it('defines exact pinned identity/settings without qualifying execution', () => {
    expect(PLANCK_IDENTITY).toEqual({ name: 'planck', version: '1.5.1', adapterVersion: '1.0.0', profile: 'planck-1.5.1-si-v1' });
    expect(PLANCK_SETTINGS).toEqual({ timestepSeconds: 1 / 120, substeps: 4, solverIterations: { position: 12, velocity: 12, constraint: 12 }, sleeping: false });
    expect(Object.isFrozen(PLANCK_SETTINGS.solverIterations)).toBe(true);
    const report = checkPlanckContract(scene());
    expect(report.profileCompatible).toBe(true); expect(report.executionReady).toBe(false);
    expect(report.diagnostics[0]?.code).toBe('FEATURE_NOT_QUALIFIED');
  });
  it.each([
    ['name', 'matter-js', 'ENGINE_UNSUPPORTED'],
    ['version', '1.5.2', 'ENGINE_VERSION_UNSUPPORTED'],
    ['version', '99.0.0', 'ENGINE_VERSION_UNSUPPORTED'],
    ['adapterVersion', '0.0.0', 'ADAPTER_VERSION_UNSUPPORTED'],
    ['profile', 'untrusted-profile', 'PROFILE_UNSUPPORTED'],
  ])('rejects mismatched %s=%s without partial construction', (key, value, code) => {
    const s = scene(s => { Reflect.set(s.simulation.engine, key, value); });
    const report = planckAdapterContract.capabilities(s);
    expect(report.profileCompatible).toBe(false); expect(report.executionReady).toBe(false);
    expect(report.diagnostics).toContainEqual(expect.objectContaining({ code, path: `/simulation/engine/${key}`, stage: 'execution', severity: 'error' }));
    const initialized = planckAdapterContract.initialize(s);
    expect(initialized.ok).toBe(false); expect(initialized).not.toHaveProperty('value'); expect(initialized).not.toHaveProperty('runtime');
  });
  it.each([
    ['timestepSeconds', 1 / 60], ['substeps', 2],
    ['position', 8], ['velocity', 8], ['constraint', 8],
  ])('rejects incompatible persisted %s', (key, value) => {
    const s = scene(s => { Reflect.set(['position', 'velocity', 'constraint'].includes(String(key)) ? s.simulation.solverIterations : s.simulation, key, value); });
    const report = checkPlanckContract(s);
    expect(report.profileCompatible).toBe(false);
    expect(report.diagnostics.some(d => d.code === 'SETTINGS_UNSUPPORTED')).toBe(true);
  });
  it('structural validation rejects invalid sleeping/nonfinite settings first', () => {
    const s = structuredClone(scene());
    Reflect.set(s.simulation, 'sleeping', true); expect(validateScene(s).ok).toBe(false);
    Reflect.set(s.simulation, 'substeps', NaN); expect(validateScene(s).ok).toBe(false);
  });
  it('even matching profiles cannot construct a runtime or mutate authored state', () => {
    const s = scene(), before = JSON.stringify(s);
    const result = planckAdapterContract.initialize(s);
    expect(result.ok).toBe(false); expect(result).not.toHaveProperty('value');
    if (!result.ok) expect(result.diagnostics.some(d => d.code === 'ADAPTER_NOT_IMPLEMENTED')).toBe(true);
    expect(JSON.stringify(s)).toBe(before); expect(Object.isFrozen(s.bodies[0]!.position)).toBe(true);
    expect(Object.isFrozen(result)).toBe(true);
  });
  it('retains canonical schema/settings and old unqualified examples', () => {
    const old = validateScene(example); expect(old.ok).toBe(true);
    if (old.ok) expect(checkPlanckContract(old.scene).profileCompatible).toBe(false);
  });
  it('uses only the authored model and narrow SI runtime types', () => {
    expectTypeOf<Parameters<PhysicsAdapter['initialize']>[0]>().toEqualTypeOf<SceneDocument>();
    expectTypeOf<Parameters<PhysicsRuntime['step']>>().toEqualTypeOf<[inputs: readonly TickInput[]]>();
    expectTypeOf<keyof PhysicsRuntime>().toEqualTypeOf<'step' | 'snapshot' | 'dispose'>();
    expectTypeOf<keyof BodySnapshot>().toEqualTypeOf<'id' | 'position' | 'velocity' | 'angle' | 'angularVelocity'>();
    expectTypeOf<keyof SimulationSnapshot>().toEqualTypeOf<'identity' | 'tick' | 'timeSeconds' | 'bodies'>();
    const compileChecks = (s: SceneDocument, snapshot: SimulationSnapshot) => {
      // @ts-expect-error The existing authored scene stays deeply readonly.
      s.bodies[0]!.position.x = 2;
      // @ts-expect-error Snapshots expose no native world handle.
      void snapshot.world;
      // @ts-expect-error Runtime cannot accept a variable numerical dt.
      ({} as PhysicsRuntime).step(0.1, []);
      // @ts-expect-error Snapshot position is readonly.
      snapshot.bodies[0]!.position.y = 3;
    };
    expect(typeof compileChecks).toBe('function');
  });
  it('public declaration dependency closure contains no native types, handles or any', () => {
    const options: ts.CompilerOptions = { declaration: true, emitDeclarationOnly: true, removeComments: true, strict: true, skipLibCheck: true, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler };
    const program = ts.createProgram(['src/physics/index.ts'], options);
    const emitted: string[] = [];
    const result = program.emit(undefined, (name, content) => { if (name.includes('/physics/') || name.includes('/domain/')) emitted.push(content); });
    expect(result.emitSkipped).toBe(false); expect(emitted.length).toBeGreaterThan(0);
    expect(emitted.join('\n')).not.toMatch(/\bany\b|from ["']planck|import\(["']planck|\bWorld\b|\bFixture\b/);
    for (const file of ['contracts.ts', 'profile.ts', 'tick-inputs.ts', 'index.ts']) {
      expect(readFileSync(`src/physics/${file}`, 'utf8')).not.toMatch(/from ["']planck|import\(["']planck/);
    }
  });
});

describe('deterministic trusted tick input batches', () => {
  it('orders permutations identically without mutating or retaining caller references', () => {
    const a = input(2), b = input(0), c = input(1);
    const original = [a, b, c]; const result = orderTickInputs(1, original);
    const permuted = orderTickInputs(1, [c, a, b]); expect(result).toEqual(permuted);
    expect(original.map(i => i.sequence)).toEqual([2, 0, 1]);
    if (!result.ok) throw Error('valid batch rejected');
    expect(result.value.map(i => i.sequence)).toEqual([0, 1, 2]);
    expect(result.value[2]).not.toBe(a); expect(result.value[2]!.vector).not.toBe(a.vector);
    expect(Object.isFrozen(result.value[0]!.vector)).toBe(true);
    Reflect.set(a.vector, 'x', 999); expect(result.value[2]!.vector.x).toBe(4);
  });
  it.each([-1, 0.5, Infinity, NaN, Number.MAX_SAFE_INTEGER + 1])('rejects invalid sequence %s', sequence => {
    expect(orderTickInputs(1, [input(sequence)]).ok).toBe(false);
  });
  it.each([0, -1, 1.5, Infinity, Number.MAX_SAFE_INTEGER + 1])('rejects invalid tick %s', tick => {
    expect(orderTickInputs(tick, []).ok).toBe(false);
  });
  it('rejects duplicate sequence, mismatched tick, unknown kind and nonfinite values atomically', () => {
    for (const batch of [[input(1), input(1)], [{ ...input(1), tick: 2 }], [{ ...input(1), vector: { x: NaN, y: 0 } }]]) {
      const result = orderTickInputs(1, batch); expect(result.ok).toBe(false); expect(result).not.toHaveProperty('value');
    }
    const wrong = input(1); Reflect.set(wrong, 'kind', 'script'); expect(orderTickInputs(1, [wrong]).ok).toBe(false);
  });
  it('accepts no-input ticks and safe-integer boundaries', () => {
    expect(orderTickInputs(1, [])).toEqual({ ok: true, value: [] });
    expect(orderTickInputs(Number.MAX_SAFE_INTEGER, [{ ...input(Number.MAX_SAFE_INTEGER), tick: Number.MAX_SAFE_INTEGER }]).ok).toBe(true);
  });
});
