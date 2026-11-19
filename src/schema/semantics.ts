import type { SceneDocument, SceneBody, SceneConstraint } from '../domain/scene';
import type { DiagnosticSink } from '../domain/diagnostics';
import { validateGeometry } from '../domain/geometry';

const key = (id: string) => id.toLowerCase();
/** Compare parsed UTC instants after schema/uppercase-Z validation.
 * Fixed-width calendar fields are independent of the single T/t/\s separator.
 * Keep decimal fractions exact; Date/Number would discard sub-ms precision.
 * Second 60 stays after 59 and before the next date (accepted leap seconds).
 */
function utcOrder(a: string, b: string): number {
  const components = (value: string) => [
    Number(value.slice(0, 4)), Number(value.slice(5, 7)), Number(value.slice(8, 10)),
    Number(value.slice(11, 13)), Number(value.slice(14, 16)), Number(value.slice(17, 19)),
  ];
  const x = components(a), y = components(b);
  for (let i = 0; i < x.length; i++) {
    if (x[i] !== y[i]) return x[i]! < y[i]! ? -1 : 1;
  }
  const fraction = (value: string) => value[19] === '.' ? value.slice(20, -1) : '';
  const fracA = fraction(a), fracB = fraction(b);
  const n = Math.max(fracA.length, fracB.length);
  const digitsA = fracA.padEnd(n, '0'), digitsB = fracB.padEnd(n, '0');
  return digitsA === digitsB ? 0 : digitsA < digitsB ? -1 : 1;
}
export function validateSemantics(scene: SceneDocument, add: DiagnosticSink): void {
  const fail = (code: string, path: string, message: string, suggestion: string) =>
    add({ code, path, stage: 'semantic', severity: 'error', message, suggestion });
  const ids = new Map<string, string>();
  const collections = [
    ['bodies', scene.bodies], ['constraints', scene.constraints], ['forces', scene.forces],
    ['measurements', scene.measurements], ['studentPolicy/controls', scene.studentPolicy.controls],
  ] as const;
  for (const [name, entries] of collections) entries.forEach((entry, i) => {
    const path = `/${name}/${i}/id`, prior = ids.get(key(entry.id));
    if (prior !== undefined) fail('DUPLICATE_ID', path, `UUID is already used at ${prior}.`, 'Assign a unique UUID and update its references explicitly.');
    else ids.set(key(entry.id), path);
  });
  const bodies = new Map(scene.bodies.map((body) => [key(body.id), body]));
  const lookup = (id: string, path: string): SceneBody | undefined => {
    const body = bodies.get(key(id));
    if (!body) fail('REFERENCE_NOT_FOUND', path, 'Reference does not resolve to a body in this scene.', 'Choose an existing body UUID; references to other entity types are invalid.');
    return body;
  };
  scene.bodies.forEach((body, i) => {
    const path = `/bodies/${i}`;
    if (body.motionType === 'static' && (body.velocity.x !== 0 || body.velocity.y !== 0 || body.angularVelocity !== 0)) {
      fail('STATIC_BODY_VELOCITY', path, 'Static bodies must have zero initial linear and angular velocity.', 'Set velocities to zero or change the body to dynamic.');
    }
    if (body.material.staticFriction < body.material.friction) {
      fail('MATERIAL_FRICTION_ORDER', `${path}/material/staticFriction`, 'Static friction must not be smaller than dynamic friction.', 'Increase staticFriction or lower friction; no values are changed automatically.');
    }
    const properties = validateGeometry(body.shape, `${path}/shape`, add);
    if (properties) {
      const mass = body.massModel.mode === 'mass' ? body.massModel.mass : properties.area * body.massModel.arealDensity;
      const inertia = mass * properties.inertiaPerMass;
      if (![properties.area, mass, inertia].every((value) => Number.isFinite(value) && value > 0)) {
        fail('BODY_PHYSICAL_PROPERTIES_INVALID', path, 'Derived area, mass and physical inertia must be finite and positive.', 'Use nondegenerate dimensions and mass/density values that do not underflow or overflow.');
      }
    }
  });
  scene.constraints.forEach((constraint, i) => {
    const path = `/constraints/${i}`;
    const endpoint = (anchor: SceneConstraint['anchorA'], side: string) => anchor.type === 'body' ? lookup(anchor.bodyId, `${path}/${side}/bodyId`) : undefined;
    const a = endpoint(constraint.anchorA, 'anchorA'), b = endpoint(constraint.anchorB, 'anchorB');
    if (a && b && key(a.id) === key(b.id)) fail('CONSTRAINT_SAME_BODY', path, 'Both constraint anchors refer to the same body.', 'Choose two distinct bodies or a body and a world anchor.');
    if (a?.motionType !== 'dynamic' && b?.motionType !== 'dynamic') {
      fail('CONSTRAINT_NO_DYNAMIC_BODY', path, 'A constraint needs at least one dynamic body endpoint.', 'Connect a dynamic body; two static/world endpoints cannot form this constraint.');
    }
  });
  scene.forces.forEach((force, i) => {
    const body = lookup(force.bodyId, `/forces/${i}/bodyId`);
    if (body?.motionType === 'static') fail('FORCE_STATIC_TARGET', `/forces/${i}/bodyId`, 'External force target must be dynamic.', 'Choose a dynamic body or remove the force.');
  });
  scene.measurements.forEach((measurement, i) => lookup(measurement.bodyId, `/measurements/${i}/bodyId`));
  const targets = new Set<string>();
  scene.studentPolicy.controls.forEach((control, i) => {
    const path = `/studentPolicy/controls/${i}`, target = control.target;
    const targetKey = target.type === 'world' ? `world:${target.parameter}` : `body:${key(target.bodyId)}:${target.parameter}`;
    if (targets.has(targetKey)) fail('CONTROL_DUPLICATE_TARGET', `${path}/target`, 'A control already exists for this parameter.', 'Keep only one control per body/world parameter.');
    targets.add(targetKey);
    if (!(control.min < control.max) || control.step > control.max - control.min) {
      fail('CONTROL_RANGE_INVALID', path, 'Controls require min < max and step <= max - min.', 'Set an increasing finite interval and a positive step within that interval.');
    }
    let initial: number | undefined;
    if (target.type === 'world') initial = target.parameter === 'gravityX' ? scene.world.gravity.x : scene.world.gravity.y;
    else {
      const body = lookup(target.bodyId, `${path}/target/bodyId`);
      if (body) {
        if (body.motionType !== 'dynamic') fail('CONTROL_STATIC_TARGET', `${path}/target/bodyId`, 'Student body controls require a dynamic target.', 'Choose a dynamic body.');
        if (target.parameter === 'mass') {
          if (body.massModel.mode !== 'mass') fail('CONTROL_MASS_MODE', `${path}/target/parameter`, 'Mass controls require an authoritative mass model.', 'Use mass mode or remove this control; density is not silently converted.');
          else initial = body.massModel.mass;
          if (control.min < 1e-6 || control.max > 1e6) fail('CONTROL_MASS_RANGE', path, 'The entire mass range must stay within 1e-6..1e6 kg.', 'Keep both endpoints within the Scene v1 mass bounds.');
        } else initial = target.parameter === 'velocityX' ? body.velocity.x : body.velocity.y;
      }
    }
    if (initial !== undefined && (initial < control.min || initial > control.max)) {
      fail('CONTROL_DEFAULT_OUTSIDE_RANGE', path, 'The authored initial value is outside the control interval.', 'Include the authored default within min/max or explicitly edit the initial value.');
    }
  });
  const identity = scene.identity;
  if (identity.state === 'saved') {
    if (key(identity.simulationId) === key(identity.revisionId)) fail('IDENTITY_ID_COLLISION', '/identity/revisionId', 'Simulation and revision UUIDs must differ.', 'Assign a distinct revision UUID through the repository save operation.');
    if ((identity.revisionNumber === 1) !== (identity.parentRevisionId === null)) {
      fail('REVISION_PARENT_INVALID', '/identity/parentRevisionId', 'Revision 1 must have no parent; later revisions must have a parent.', 'Use consistent revision number/parent metadata without rewriting an existing revision.');
    }
    if (identity.parentRevisionId !== null && key(identity.parentRevisionId) === key(identity.revisionId)) fail('REVISION_SELF_PARENT', '/identity/parentRevisionId', 'A revision cannot be its own parent.', 'Reference a different preceding revision.');
    if (!identity.createdAt.endsWith('Z') || !identity.savedAt.endsWith('Z')) {
      fail('TIMESTAMP_NOT_UTC', '/identity', 'Saved timestamps must use UTC with an uppercase Z suffix.', 'Convert timestamps to UTC while preserving the instant.');
    } else if (utcOrder(identity.savedAt, identity.createdAt) < 0) {
      fail('TIMESTAMP_ORDER', '/identity/savedAt', 'savedAt cannot precede createdAt.', 'Correct the saved revision timestamps.');
    }
  }
}
