import { World, Circle, Polygon, Box, Settings } from 'planck';
import type { Body, Shape } from 'planck';
import type { SceneDocument, SceneBody, WorldVector } from '../../domain/scene';
import { freezeJson } from '../../domain/scene';
import { validateScene } from '../../schema';
import { checkPlanckCapabilities } from '../capabilities';
import { physicalProperties } from '../physical-properties';
import type { PhysicsResult, SimulationSnapshot } from '../contracts';
import type { InitialWorldSession, ConstructionObserver } from '../construction-contract';
import { physicsDiagnostic, PLANCK_IDENTITY } from '../profile';
import { NATIVE_ENVELOPE } from '../limits';

let configured = false;
function configureNative(): boolean {
  if (Settings.lengthUnitsPerMeter !== 1 || Settings.maxPolygonVertices !== 12 ||
    Settings.linearSlop !== NATIVE_ENVELOPE.linearSlop || Settings.polygonRadius !== NATIVE_ENVELOPE.polygonRadius ||
    Settings.maxTranslation !== NATIVE_ENVELOPE.maxTranslation || Settings.maxRotation !== NATIVE_ENVELOPE.maxRotation) return false;
  if (!configured) { Settings.velocityThreshold = 0; configured = true; }
  return Settings.velocityThreshold === 0;
}
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
  if (shape.getType() !== 'polygon') return false;
  const p = shape as Polygon, vertices = sourceVertices(body);
  return p.m_count === vertices.length && vertices.some((_, offset) =>
    vertices.every((v, i) => same(v, p.m_vertices[(i + offset) % p.m_count]!)));
}

/** Internal construction only. Public adapter initialization remains blocked.
 * Revalidate before native allocation; publish only after the transaction commits.
 */
export function constructInitialWorld(input: SceneDocument, observe?: ConstructionObserver): PhysicsResult<InitialWorldSession> {
  const parsed = validateScene(input);
  if (!parsed.ok) return freezeJson({ ok: false as const, diagnostics: parsed.diagnostics.map(d => physicsDiagnostic('CONSTRUCTION_FAILED', d.path, d.message, d.suggestion)) });
  const scene = parsed.scene, policy = checkPlanckCapabilities(scene);
  if (!policy.policyCompatible) return freezeJson({ ok: false as const, diagnostics: policy.diagnostics });
  const sorted = [...scene.bodies].sort((a, b) => a.id.toLowerCase() < b.id.toLowerCase() ? -1 : 1);
  const prepared = sorted.map(body => ({ body, properties: physicalProperties(body) }));
  const failed = prepared.find(p => !p.properties.ok);
  if (failed && !failed.properties.ok) return failed.properties;
  if (!configureNative()) return freezeJson({ ok: false as const, diagnostics: [physicsDiagnostic('NATIVE_SETTINGS_MISMATCH', '/simulation', 'Native SI/contact settings differ from the approved profile.', 'Restore the trusted engine configuration; no scene-specific tuning is allowed.')] });
  let world: World | undefined;
  const bodies: { id: string; native: Body }[] = [];
  let disposed = false;
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    if (world) while (world.getBodyList()) world.destroyBody(world.getBodyList()!);
    bodies.length = 0; world = undefined;
  };
  let path = '';
  try {
    world = new World({ gravity: { ...scene.world.gravity }, allowSleep: false, warmStarting: true, continuousPhysics: true });
    observe?.('world', -1);
    prepared.forEach(({ body, properties }, i) => {
      path = `/bodies/${scene.bodies.findIndex(b => b.id === body.id)}`;
      if (!properties.ok) throw Error('Preflight properties failed');
      const p = properties.value;
      const native = world!.createBody({ type: body.motionType, position: { ...body.position }, angle: body.angle,
        linearDamping: 0, angularDamping: 0, allowSleep: false, fixedRotation: false, bullet: false });
      bodies.push({ id: body.id, native }); observe?.('body', i);
      const shape = body.shape.type === 'circle' ? new Circle(body.shape.radius)
        : body.shape.type === 'rectangle' ? new Box(body.shape.width / 2, body.shape.height / 2)
          : new Polygon(body.shape.vertices.map(v => ({ ...v })));
      if (!preserved(body, shape)) throw new GeometryAltered();
      const fixture = native.createFixture({ shape, density: p.arealDensity, friction: body.material.friction, restitution: body.material.restitution, isSensor: false });
      if (!preserved(body, fixture.getShape())) throw new GeometryAltered();
      observe?.('fixture', i);
      if (body.motionType === 'dynamic') native.setMassData({ mass: p.mass, center: { x: 0, y: 0 }, I: p.inertia });
      // setMassData/resetMassData may change COM velocity: set final values last.
      native.setLinearVelocity({ ...body.velocity }); native.setAngularVelocity(body.angularVelocity);
      observe?.('mass', i);
    });
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
    return freezeJson({ ok: false as const, diagnostics: [physicsDiagnostic(error instanceof GeometryAltered ? 'NATIVE_GEOMETRY_ALTERED' : 'CONSTRUCTION_FAILED', path,
      error instanceof GeometryAltered ? 'Native polygon construction altered the authored boundary.' : 'Private world construction failed; all temporary resources were released.',
      'Correct unsupported geometry or investigate construction; no partial world was published.')] });
  }
}
class GeometryAltered extends Error {}
