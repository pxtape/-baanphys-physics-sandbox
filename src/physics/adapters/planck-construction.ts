import { World, Circle, Polygon, Box } from 'planck';
import type { Body, Shape } from 'planck';
import type { SceneDocument, SceneBody, WorldVector } from '../../domain/scene';
import { freezeJson } from '../../domain/scene';
import { validateScene } from '../../schema';
import { checkExperimentalScene } from '../experimental-policy';
import { attachExperimentalJoints } from './experimental-joints';
import { checkPlanckCapabilities } from '../capabilities';
import { physicalProperties } from '../physical-properties';
import type { PhysicsResult, SimulationSnapshot } from '../contracts';
import type { InitialWorldSession, ConstructionObserver } from '../construction-contract';
import { physicsDiagnostic, PLANCK_IDENTITY } from '../profile';
import { NATIVE_ENVELOPE } from '../limits';

import { createSteppingSession } from './planck-runtime';
import type { InternalRuntime, RuntimePermissions } from '../runtime-contract';
import { initializeNativeSettings, nativeSettingsMatch } from './native-settings';

const same = (a: WorldVector, b: WorldVector) => a.x === b.x && a.y === b.y;
function sourceVertices(body: SceneBody): readonly WorldVector[] {
  if (body.shape.type === 'polygon') return body.shape.vertices;
  if (body.shape.type !== 'rectangle') return [];
  const x = body.shape.width / 2, y = body.shape.height / 2;
  return [{ x: -x, y: -y }, { x, y: -y }, { x, y }, { x: -x, y }];
}
/** Only cyclic ordering is permitted; no tolerance-based geometry rewriting. */
function preserved(body: SceneBody, shape: Shape): boolean {
  if (body.shape.type === 'circle') {
    const circle = shape as Circle;
    return shape.getType() === 'circle' && circle.getRadius() === body.shape.radius && same(circle.getCenter(), { x: 0, y: 0 });
  }
  if (shape.getType() !== 'polygon' || shape.getRadius() !== NATIVE_ENVELOPE.polygonRadius) return false;
  const p = shape as Polygon, vertices = sourceVertices(body);
  return p.m_count === vertices.length && vertices.some((_, offset) =>
    vertices.every((v, i) => same(v, p.m_vertices[(i + offset) % p.m_count]!)));
}

/** Internal construction only. Public adapter initialization remains blocked.
 * Revalidate before native allocation; publish only after the transaction commits.
 */
export function constructInitialWorld(input: SceneDocument, observe?: ConstructionObserver): PhysicsResult<InitialWorldSession> {
  return constructWorld(input, observe);
}
/** Internal only: no public profile execution qualification is implied. */
export function constructSteppingRuntime(input: SceneDocument, permissions: RuntimePermissions = { allowTickForces: false }): PhysicsResult<InternalRuntime> {
  return constructWorld(input, undefined, { allowTickForces: permissions?.allowTickForces === true });
}
/** Explicit experimental path; certified construction still rejects joints. */
export function constructExperimentalMechanismRuntime(input: SceneDocument): PhysicsResult<InternalRuntime> {
  return constructWorld(input, undefined, { allowTickForces: false }, true);
}
function constructWorld(input: SceneDocument, observe: undefined, permissions: RuntimePermissions, experimental: true): PhysicsResult<InternalRuntime>;
function constructWorld(input: SceneDocument, observe?: ConstructionObserver): PhysicsResult<InitialWorldSession>;
function constructWorld(input: SceneDocument, observe: undefined, permissions: RuntimePermissions): PhysicsResult<InternalRuntime>;
function constructWorld(input: SceneDocument, observe?: ConstructionObserver, permissions?: RuntimePermissions, experimental = false): PhysicsResult<InitialWorldSession | InternalRuntime> {
  const parsed = validateScene(input);
  if (!parsed.ok) return freezeJson({ ok: false as const, diagnostics: parsed.diagnostics.map(d => physicsDiagnostic('CONSTRUCTION_FAILED', d.path, d.message, d.suggestion)) });
  const scene = parsed.scene, policy = experimental ? checkExperimentalScene(scene) : checkPlanckCapabilities(scene);
  if (!policy.policyCompatible) return freezeJson({ ok: false as const, diagnostics: policy.diagnostics });
  const sorted = [...scene.bodies].sort((a, b) => a.id.toLowerCase() < b.id.toLowerCase() ? -1 : 1);
  const prepared = sorted.map(body => ({ body, properties: physicalProperties(body) }));
  const failed = prepared.find(p => !p.properties.ok);
  if (failed && !failed.properties.ok) return failed.properties;
  if (!initializeNativeSettings()) return freezeJson({ ok: false as const, diagnostics: [physicsDiagnostic('NATIVE_SETTINGS_MISMATCH', '/simulation', 'Native SI/contact settings differ from the approved profile.', 'Restore the trusted engine configuration; no scene-specific tuning is allowed.')] });
  let world: World | undefined;
  const bodies: { id: string; native: Body }[] = [];
  let disposed = false;
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    const ownedWorld = world;
    bodies.length = 0; world = undefined;
    // A native exception can leave Planck locked. Never spin on destroyBody(false)
    // or unlock/repair solver state: detach that private JS graph for GC instead.
    if (ownedWorld && !ownedWorld.isLocked()) {
      for (let body = ownedWorld.getBodyList(); body;) {
        const next = body.getNext(); ownedWorld.destroyBody(body); body = next;
      }
    }
  };
  let path = '';
  try {
    world = new World({ gravity: { ...scene.world.gravity }, allowSleep: false, warmStarting: true, continuousPhysics: true });
    const checkpoint = (stage: Parameters<NonNullable<typeof observe>>[0], index: number) => {
      observe?.(stage, index);
      if (!nativeSettingsMatch()) throw new SettingsMismatch();
    };
    checkpoint('world', -1);
    prepared.forEach(({ body, properties }, i) => {
      path = `/bodies/${scene.bodies.findIndex(b => b.id === body.id)}`;
      if (!properties.ok) throw Error('Preflight properties failed');
      const p = properties.value;
      const native = world!.createBody({ type: body.motionType, position: { ...body.position }, angle: body.angle,
        linearDamping: 0, angularDamping: 0, allowSleep: false, fixedRotation: false, bullet: false });
      bodies.push({ id: body.id, native }); checkpoint('body', i);
      const shape = body.shape.type === 'circle' ? new Circle(body.shape.radius)
        : body.shape.type === 'rectangle' ? new Box(body.shape.width / 2, body.shape.height / 2)
          : new Polygon(body.shape.vertices.map(v => ({ ...v })));
      if (!preserved(body, shape)) throw new GeometryAltered();
      const fixture = native.createFixture({ shape, density: p.arealDensity, friction: body.material.friction, restitution: body.material.restitution, isSensor: false });
      if (!preserved(body, fixture.getShape())) throw new GeometryAltered();
      checkpoint('fixture', i);
      if (body.motionType === 'dynamic') native.setMassData({ mass: p.mass, center: { x: 0, y: 0 }, I: p.inertia });
      // setMassData/resetMassData may change COM velocity: set final values last.
      native.setLinearVelocity({ ...body.velocity }); native.setAngularVelocity(body.angularVelocity);
      checkpoint('mass', i);
    });
    if (experimental) attachExperimentalJoints(scene, world, new Map(bodies.map(b => [b.id.toLowerCase(), b.native])), () => { if (!nativeSettingsMatch()) throw new SettingsMismatch(); });
    checkpoint('publish', -1);
    // Final fixture audit also catches shape-local alteration with stable globals.
    bodies.forEach(({ native }, i) => {
      if (!preserved(sorted[i]!, native.getFixtureList()!.getShape())) throw new GeometryAltered();
    });
    if (!nativeSettingsMatch()) throw new SettingsMismatch();
    if (permissions) {
      const session = createSteppingSession(world, scene, bodies, dispose,
        () => bodies.every(({ native }, i) => preserved(sorted[i]!, native.getFixtureList()!.getShape())), permissions);
      if (!nativeSettingsMatch()) throw new SettingsMismatch();
      return Object.freeze({ ok: true as const, value: session });
    }
    const session: InitialWorldSession = Object.freeze({
      snapshot(): PhysicsResult<SimulationSnapshot> {
        if (disposed) return freezeJson({ ok: false as const, diagnostics: [physicsDiagnostic('RUNTIME_DISPOSED', '', 'Construction session has been disposed.', 'Construct a fresh validated initial world.')] });
        return freezeJson({ ok: true as const, value: { identity: { ...PLANCK_IDENTITY }, tick: 0, timeSeconds: 0,
          bodies: bodies.map(({ id, native }) => ({ id, position: { ...native.getWorldCenter() }, velocity: { ...native.getLinearVelocity() }, angle: native.getAngle(), angularVelocity: native.getAngularVelocity() })),
        } });
      },
      dispose,
    });
    return Object.freeze({ ok: true as const, value: session }); // Freeze session, never recursively freeze native closure state.
  } catch (error) {
    dispose();
    return freezeJson({ ok: false as const, diagnostics: [physicsDiagnostic(error instanceof SettingsMismatch ? 'NATIVE_SETTINGS_MISMATCH' : error instanceof GeometryAltered ? 'NATIVE_GEOMETRY_ALTERED' : 'CONSTRUCTION_FAILED', error instanceof SettingsMismatch ? '/simulation' : path,
      error instanceof SettingsMismatch ? 'Native settings drifted during construction; temporary resources were released without restoring globals.' : error instanceof GeometryAltered ? 'Native polygon construction altered the authored boundary.' : 'Private world construction failed; all temporary resources were released.',
      'Correct unsupported geometry or investigate construction; no partial world was published.')] });
  }
}
class GeometryAltered extends Error {}

class SettingsMismatch extends Error {}
