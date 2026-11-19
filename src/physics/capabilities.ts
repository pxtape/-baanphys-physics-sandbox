import { freezeJson } from '../domain/scene';
import type { SceneDocument } from '../domain/scene';
import { validateGeometry } from '../domain/geometry';
import { validateScene } from '../schema';
import { INPUT_LIMITS } from '../schema/input';
import type { CapabilityReport, PhysicsDiagnostic } from './contracts';
import { checkPlanckContract, physicsDiagnostic, PLANCK_SETTINGS } from './profile';
import { CAPABILITY_LIMITS as L, NATIVE_ENVELOPE } from './limits';

export interface CapabilityPolicyReport extends CapabilityReport {
  /** Exact identity/settings AND provisional policy pass, not numerical proof. */
  readonly policyCompatible: boolean;
  readonly executionReady: false;
}
interface Range { min: number; max: number; path: string }
const magnitude = (range: Range) => Math.max(Math.abs(range.min), Math.abs(range.max));
const fixed = (value: number, path: string): Range => ({ min: value, max: value, path });

/** Revalidates a detached copy, including schema/semantics; no stale report or
 * TypeScript assertion can authorize construction. Results contain no scene.
 */
export function checkPlanckCapabilities(value: SceneDocument): CapabilityPolicyReport {
  const diagnostics: PhysicsDiagnostic[] = [];
  let policyErrors = false, truncated = false;
  const add = (d: PhysicsDiagnostic) => {
    if (diagnostics.length < INPUT_LIMITS.diagnostics - 1) diagnostics.push(d);
    else if (!truncated) {
      truncated = true;
      diagnostics.push(physicsDiagnostic('CAPABILITY_DIAGNOSTICS_TRUNCATED', '', 'Further capability diagnostics were omitted.', 'Fix reported problems and validate the whole scene again.'));
    }
  };
  const fail = (code: PhysicsDiagnostic['code'], path: string, message: string) => {
    policyErrors = true;
    add(physicsDiagnostic(code, path, message, 'Edit the authored value or all affected student ranges within CAPABILITY_LIMITS.md; unsupported requirements must be removed explicitly. Nothing is adjusted automatically.'));
  };
  const finish = (profileCompatible: boolean): CapabilityPolicyReport => freezeJson({
    profileCompatible, policyCompatible: profileCompatible && !policyErrors,
    executionReady: false as const, diagnostics,
  });
  const parsed = validateScene(value);
  if (!parsed.ok) {
    for (const d of parsed.diagnostics) fail('CAPABILITY_SCENE_INVALID', d.path, `${d.code}: ${d.message}`);
    return finish(false);
  }
  const scene = parsed.scene;
  const contract = checkPlanckContract(scene);
  contract.diagnostics.forEach(add); // Includes permanent unqualified-execution gate.
  const controls = scene.studentPolicy.controls;
  const range = (bodyId: string | null, parameter: string, initial: number, path: string): Range => {
    const i = controls.findIndex(c => c.target.parameter === parameter &&
      (bodyId === null ? c.target.type === 'world' : c.target.type === 'body' && c.target.bodyId.toLowerCase() === bodyId.toLowerCase()));
    const c = controls[i];
    return c ? { min: c.min, max: c.max, path: `/studentPolicy/controls/${i}` } : fixed(initial, path);
  };
  const bounded = (value: number, min: number, max: number, path: string, label: string) => {
    if (!Number.isFinite(value) || value < min || value > max) fail('CAPABILITY_LIMIT_EXCEEDED', path, `${label} must be within ${min}..${max}; conservative value is ${value}.`);
  };
  const gx = range(null, 'gravityX', scene.world.gravity.x, '/world/gravity/x');
  const gy = range(null, 'gravityY', scene.world.gravity.y, '/world/gravity/y');
  const gravity = Math.hypot(magnitude(gx), magnitude(gy));
  bounded(gravity, 0, L.maxGravity, gx.path.startsWith('/student') ? gx.path : gy.path, 'Gravity magnitude (m/s²), over all simultaneous ranges');

  // Aggregate triangle bounds avoid cancellation assumptions as body anchors rotate.
  const loads = new Map<string, { force: number; torque: number }>();
  scene.forces.forEach((force, i) => {
    const path = `/forces/${i}`, norm = Math.hypot(force.vector.x, force.vector.y);
    const lever = Math.hypot(force.localPoint.x, force.localPoint.y);
    bounded(norm, 0, L.maxForce, `${path}/vector`, 'Force magnitude (N)');
    bounded(lever, 0, L.maxLever, `${path}/localPoint`, 'Local lever magnitude (m)');
    const id = force.bodyId.toLowerCase(), total = loads.get(id) ?? { force: 0, torque: 0 };
    total.force += norm; total.torque += norm * lever; loads.set(id, total);
  });
  const masses: { min: number; max: number; path: string }[] = [];
  scene.bodies.forEach((body, i) => {
    const path = `/bodies/${i}`, shape = body.shape;
    // M1-02 has already checked simple/centred/strict-convex/CCW invariants.
    const properties = validateGeometry(shape, `${path}/shape`, d => fail('CAPABILITY_SCENE_INVALID', d.path, d.message));
    if (!properties) return;
    if (shape.type === 'circle') bounded(2 * shape.radius, L.minLength, L.maxLength, `${path}/shape/radius`, 'Diameter (m)');
    else if (shape.type === 'rectangle') {
      bounded(shape.width, L.minLength, L.maxLength, `${path}/shape/width`, 'Width (m)');
      bounded(shape.height, L.minLength, L.maxLength, `${path}/shape/height`, 'Height (m)');
    } else {
      if (shape.vertices.length > L.maxVertices) fail('CAPABILITY_GEOMETRY_UNSUPPORTED', `${path}/shape/vertices`, 'Only 3–8 convex vertices are policy-supported; no hull or decomposition is performed.');
      shape.vertices.forEach((a, j) => {
        const b = shape.vertices[(j + 1) % shape.vertices.length]!;
        const edge = Math.hypot(b.x - a.x, b.y - a.y);
        bounded(edge, L.minLength, L.maxLength, `${path}/shape/vertices/${j}`, 'Edge length (m)');
        bounded(Math.abs(a.x * b.y - a.y * b.x) / edge, L.minLength / 2, L.maxLength / 2, `${path}/shape/vertices/${j}`, 'COM-to-edge distance (m)');
        bounded(Math.hypot(a.x, a.y), 0, L.maxLength / 2, `${path}/shape/vertices/${j}`, 'Local vertex radius (m)');
      });
    }
    const radius = shape.type === 'circle' ? shape.radius : shape.type === 'rectangle' ? Math.hypot(shape.width, shape.height) / 2 : Math.max(...shape.vertices.map(v => Math.hypot(v.x, v.y)));
    bounded(Math.hypot(body.position.x, body.position.y) + radius, 0, L.maxWorldRadius, `${path}/position`, 'Initial occupied world radius (m)');
    if (body.material.friction !== body.material.staticFriction) fail('CAPABILITY_MATERIAL_UNSUPPORTED', `${path}/material/staticFriction`, 'Planck has one Coulomb friction coefficient; authored coefficients must be exactly equal.');
    const authoredMass = body.massModel.mode === 'mass' ? body.massModel.mass : properties.area * body.massModel.arealDensity;
    const mass = range(body.id, 'mass', authoredMass, `${path}/massModel`);
    bounded(mass.min, L.minMass, L.maxMass, mass.path, 'Minimum authored/allowed mass (kg)');
    bounded(mass.max, L.minMass, L.maxMass, mass.path, 'Maximum authored/allowed mass (kg)');
    const minInertia = mass.min * properties.inertiaPerMass, maxInertia = mass.max * properties.inertiaPerMass;
    bounded(minInertia, L.minInertia, L.maxInertia, mass.path, 'Minimum uniform-lamina inertia (kg·m²)');
    bounded(maxInertia, L.minInertia, L.maxInertia, mass.path, 'Maximum uniform-lamina inertia (kg·m²)');
    if (body.motionType === 'static') return; // Static authored data finite; no solver mass ratio/acceleration.
    masses.push(mass);
    const vx = range(body.id, 'velocityX', body.velocity.x, `${path}/velocity/x`);
    const vy = range(body.id, 'velocityY', body.velocity.y, `${path}/velocity/y`);
    const speed = Math.hypot(magnitude(vx), magnitude(vy));
    bounded(speed, 0, L.maxSpeed, vx.path.startsWith('/student') ? vx.path : vy.path, 'Speed magnitude (m/s), over all simultaneous ranges');
    bounded(Math.abs(body.angularVelocity), 0, L.maxAngularSpeed, `${path}/angularVelocity`, 'Angular speed (rad/s)');
    const load = loads.get(body.id.toLowerCase()) ?? { force: 0, torque: 0 };
    bounded(load.force, 0, L.maxAggregateForce, `${path}/id`, 'Sum of force magnitudes (N)');
    bounded(load.torque, 0, L.maxTorque, `${path}/id`, 'Worst-orientation sum of torque magnitudes (N·m)');
    const acceleration = gravity + load.force / mass.min;
    const angularAcceleration = load.torque / minInertia;
    bounded(acceleration, 0, L.maxAcceleration, mass.path, 'Conservative acceleration bound (m/s²), across gravity/mass ranges');
    bounded(angularAcceleration, 0, L.maxAngularAcceleration, mass.path, 'Conservative angular acceleration bound (rad/s²)');
    const h = PLANCK_SETTINGS.timestepSeconds / PLANCK_SETTINGS.substeps;
    bounded((speed + h * acceleration) * h, 0, NATIVE_ENVELOPE.maxTranslation, `${path}/velocity`, 'Predicted initial substep translation (m), excluding contacts');
    bounded((Math.abs(body.angularVelocity) + h * angularAcceleration) * h, 0, NATIVE_ENVELOPE.maxRotation, `${path}/angularVelocity`, 'Predicted initial substep rotation (rad), excluding contacts');
  });
  for (let i = 0; i < masses.length; i++) for (let j = i + 1; j < masses.length; j++) {
    const a = masses[i]!, b = masses[j]!;
    bounded(Math.max(a.max / b.min, b.max / a.min), 1, L.maxMassRatio, a.path, `Pairwise dynamic mass ratio against ${b.path}, across independent ranges`);
  }
  scene.constraints.forEach((c, i) => fail('CAPABILITY_FEATURE_UNSUPPORTED', `/constraints/${i}/type`, `${c.type} constraints are not supported by this production profile.`));
  scene.measurements.forEach((m, i) => fail('CAPABILITY_FEATURE_UNSUPPORTED', `/measurements/${i}`, `${m.quantity}/${m.display} measurement requirements are deferred; they cannot be silently ignored.`));
  return finish(contract.profileCompatible);
}
