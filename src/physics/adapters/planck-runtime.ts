import type { Body, World } from 'planck';
import type { SceneDocument, WorldVector } from '../../domain/scene';
import { freezeJson } from '../../domain/scene';
import type { BodySnapshot, PhysicsResult, SimulationSnapshot, TickInput, PhysicsDiagnosticCode } from '../contracts';
import type { InternalRuntime, RuntimePermissions } from '../runtime-contract';
import { physicalProperties } from '../physical-properties';
import { PLANCK_IDENTITY, PLANCK_SETTINGS, physicsDiagnostic } from '../profile';
import { CAPABILITY_LIMITS as L, NATIVE_ENVELOPE as N } from '../limits';
import { validateTickInputs, tickFailure } from '../validate-tick-inputs';
import { nativeSettingsMatch } from './native-settings';

interface Entry { readonly id: string; readonly native: Body }
interface Load { readonly bodyId: string; readonly vector: WorldVector; readonly localPoint: WorldVector }
const dt = PLANCK_SETTINGS.timestepSeconds, h = dt / PLANCK_SETTINGS.substeps;
const close = (a: number, b: number) => Number.isFinite(a) && Math.abs(a - b) <= 1e-12 * Math.max(1, Math.abs(b));
const canonical = (a: string, b: string) => a.toLowerCase() < b.toLowerCase() ? -1 : 1;
/** Adapter-private native ownership; no native object leaves the session. */
export function createSteppingSession(world: World | undefined, scene: SceneDocument, entries: readonly Entry[], release: () => void, auditGeometry: () => boolean, permissions: RuntimePermissions): InternalRuntime {
  const allowed = permissions.allowTickForces === true;
  const saved: readonly Load[] = [...scene.forces].sort((a, b) => canonical(a.id, b.id));
  const targets = new Map(entries.map(e => [e.id.toLowerCase(), e.native]));
  const properties = scene.bodies.map(b => {
    const p = physicalProperties(b); if (!p.ok) throw Error('Invalid construction properties');
    const radius = b.shape.type === 'circle' ? b.shape.radius : b.shape.type === 'rectangle' ? Math.hypot(b.shape.width, b.shape.height) / 2 : Math.max(...b.shape.vertices.map(v => Math.hypot(v.x, v.y)));
    return { source: b, mass: p.value.mass, inertia: p.value.inertia, density: p.value.arealDensity, radius };
  });
  const physical = new Map(properties.map(p => [p.source.id.toLowerCase(), p]));
  let tick = 0, disposed = false, terminal = false, busy = false;
  world!.setAutoClearForces(true);
  const failure = (code: PhysicsDiagnosticCode, message: string): PhysicsResult<never> => freezeJson({ ok: false as const, diagnostics: [physicsDiagnostic(code, '', message, 'Native failure is terminal; construct a fresh validated world!. Global settings are never repaired automatically.')] });
  const dispose = () => { if (disposed) return; disposed = true; try { release(); } catch { terminal = true; } finally { targets.clear(); world = undefined; } };
  const stop = (code: PhysicsDiagnosticCode, message: string): PhysicsResult<never> => {
    terminal = true; try { dispose(); } catch { /* Retain terminal status even if a native release throws. */ }
    return failure(code, message);
  };
  const settings = () => {
    if (!nativeSettingsMatch()) throw new Unsafe('NATIVE_SETTINGS_MISMATCH');
    const g = world!.getGravity();
    if (g.x !== scene.world!.gravity.x || g.y !== scene.world!.gravity.y || world!.getAllowSleeping() || !world!.getWarmStarting() || !world!.getContinuousPhysics() || !world!.getAutoClearForces()) throw new Unsafe('NUMERICAL_UNSAFE');
  };
  const readBodies = (): BodySnapshot[] => entries.map(({ id, native }) => {
    const p = native.getWorldCenter(), v = native.getLinearVelocity(), angle = native.getAngle(), angularVelocity = native.getAngularVelocity();
    const expected = physical.get(id.toLowerCase())!;
    const isStatic = expected.source.motionType === 'static';
    const fixture = native.getFixtureList();
    if (native.isStatic() !== isStatic || native.isDynamic() === isStatic || !fixture || fixture.getNext() ||
      !close(fixture.getDensity(), expected.density) || fixture.getFriction() !== expected.source.material.friction || fixture.getRestitution() !== expected.source.material.restitution || fixture.isSensor() ||
      isStatic && (v.x !== 0 || v.y !== 0 || angularVelocity !== 0 || !close(p.x, expected.source.position.x) || !close(p.y, expected.source.position.y) || !close(angle, expected.source.angle))) throw new Unsafe('NUMERICAL_UNSAFE');
    if (![p.x, p.y, v.x, v.y, angle, angularVelocity].every(Number.isFinite) ||
      Math.hypot(p.x, p.y) + expected.radius > L.maxWorldRadius || Math.hypot(v.x, v.y) > L.maxSpeed || Math.abs(angularVelocity) > L.maxAngularSpeed ||
      !close(native.getMass(), isStatic ? 0 : expected.mass) || !close(native.getInertia(), isStatic ? 0 : expected.inertia) ||
      native.getLocalCenter().x !== 0 || native.getLocalCenter().y !== 0 || native.getLinearDamping() !== 0 || native.getAngularDamping() !== 0 || native.isFixedRotation()) throw new Unsafe('NUMERICAL_UNSAFE');
    return { id, position: { x: p.x, y: p.y }, velocity: { x: v.x, y: v.y }, angle, angularVelocity };
  });
  const collect = (next: number): SimulationSnapshot => {
    settings(); if (!auditGeometry()) throw new Unsafe('NATIVE_GEOMETRY_ALTERED');
    const bodies = readBodies(); settings();
    return freezeJson({ identity: { ...PLANCK_IDENTITY }, tick: next, timeSeconds: next * dt, bodies });
  };
  let committed = collect(0);
  /** Conservative upper bounds: no vector cancellation or favourable orientation assumed. */
  const envelope = (states: readonly BodySnapshot[], loads: readonly Load[]): boolean => {
    const totals = new Map<string, { force: number; torque: number }>();
    for (const f of loads) {
      const force = Math.hypot(f.vector.x, f.vector.y), lever = Math.hypot(f.localPoint.x, f.localPoint.y);
      if (!Number.isFinite(force) || !Number.isFinite(lever) || force > L.maxForce || lever > L.maxLever) return false;
      const id = f.bodyId.toLowerCase(), t = totals.get(id) ?? { force: 0, torque: 0 };
      t.force += force; t.torque += force * lever; totals.set(id, t);
    }
    for (const state of states) {
      const p = physical.get(state.id.toLowerCase())!; if (p.source.motionType === 'static') continue;
      const load = totals.get(state.id.toLowerCase()) ?? { force: 0, torque: 0 };
      const acceleration = Math.hypot(scene.world!.gravity.x, scene.world!.gravity.y) + load.force / p.mass;
      const angularAcceleration = load.torque / p.inertia;
      const speed = Math.hypot(state.velocity.x, state.velocity.y) + h * acceleration;
      const rotation = Math.abs(state.angularVelocity) + h * angularAcceleration;
      if (![load.force, load.torque, acceleration, angularAcceleration, speed, rotation].every(Number.isFinite) || load.force > L.maxAggregateForce || load.torque > L.maxTorque ||
        acceleration > L.maxAcceleration || angularAcceleration > L.maxAngularAcceleration || speed > L.maxSpeed || rotation > L.maxAngularSpeed || speed * h >= N.maxTranslation || rotation * h >= N.maxRotation) return false;
    }
    return true;
  };
  const unavailable = (): PhysicsResult<never> | undefined => terminal ? failure('RUNTIME_TERMINAL', 'This runtime is permanently failed.') : disposed ? failure('RUNTIME_DISPOSED', 'This runtime has been disposed.') : busy ? failure('RUNTIME_BUSY', 'Reentrant access during a tick is not allowed.') : undefined;
  return Object.freeze({
    snapshot(): PhysicsResult<SimulationSnapshot> {
      const blocked = unavailable(); if (blocked) return blocked;
      try { settings(); if (!auditGeometry()) throw new Unsafe('NATIVE_GEOMETRY_ALTERED'); readBodies(); settings(); return Object.freeze({ ok: true as const, value: committed }); }
      catch (error) { return stop(error instanceof Unsafe ? error.code : 'NUMERICAL_UNSAFE', 'Unsafe state/settings during snapshot access.'); }
    },
    step(input: unknown): PhysicsResult<SimulationSnapshot> {
      const blocked = unavailable(); if (blocked) return blocked;
      busy = true;
      try {
        settings(); const before = readBodies(); settings();
        const validated = validateTickInputs(input, tick + 1, scene, allowed);
        if (!validated.ok) return validated;
        const transient: readonly TickInput[] = validated.value;
        settings();
        if (!envelope(before, saved)) throw new Unsafe('NUMERICAL_UNSAFE');
        const loads: readonly Load[] = [...saved, ...transient];
        if (!envelope(before, loads)) return tickFailure('TICK_INPUT_INVALID', '', 'Persisted and transient loads together exceed current-state aggregate force/torque/motion limits.');
        for (let substep = 0; substep < 4; substep++) {
          settings(); if (!auditGeometry()) throw new Unsafe('NATIVE_GEOMETRY_ALTERED');
          const previous = readBodies(); if (!envelope(previous, loads)) throw new Unsafe('NUMERICAL_UNSAFE');
          for (const f of loads) {
            settings(); const body = targets.get(f.bodyId.toLowerCase())!;
            body.applyForce({ ...f.vector }, body.getWorldPoint({ ...f.localPoint }), true);
            settings();
          }
          settings(); world!.step(h, 12, 12); settings();
          const current = readBodies();
          current.forEach((state, i) => {
            const old = previous[i]!;
            const translation = Math.hypot(state.position.x - old.position.x, state.position.y - old.position.y);
            const rotation = Math.abs(state.angle - old.angle);
            if (translation >= N.maxTranslation || rotation >= N.maxRotation || translation / h > L.maxSpeed || rotation / h > L.maxAngularSpeed) throw new Unsafe('NUMERICAL_UNSAFE');
          });
          settings();
        }
        const next = collect(tick + 1); settings();
        committed = next; tick = next.tick;
        return Object.freeze({ ok: true as const, value: next });
      } catch (error) {
        return stop(error instanceof Unsafe ? error.code : 'NUMERICAL_UNSAFE', 'Native/settings/numerical failure; the failed tick produced no committed frame.');
      } finally { busy = false; }
    },
    dispose,
  });
}
class Unsafe extends Error { constructor(readonly code: PhysicsDiagnosticCode) { super(code); } }
