import type { SceneBody, WorldVector } from '../domain/scene';
import { freezeJson } from '../domain/scene';
import { validateGeometry } from '../domain/geometry';
import type { PhysicsResult } from './contracts';
import { physicsDiagnostic } from './profile';

export interface PhysicalProperties {
  readonly area: number;
  readonly mass: number;
  readonly arealDensity: number;
  readonly inertia: number;
  readonly centroid: WorldVector;
}
/** Pure SI uniform-lamina properties; use validated Scene v1 body data. */
export function physicalProperties(body: SceneBody): PhysicsResult<PhysicalProperties> {
  const shape = body.shape;
  const dimensions = shape.type === 'circle' ? [shape.radius] : shape.type === 'rectangle' ? [shape.width, shape.height] : [];
  if (!dimensions.every(n => Number.isFinite(n) && n > 0)) return failure();
  let invalid = false;
  const geometry = validateGeometry(body.shape, '/shape', () => { invalid = true; });
  if (invalid || !geometry) return failure();
  const area = geometry.area;
  const mass = body.massModel.mode === 'mass' ? body.massModel.mass : body.massModel.arealDensity * area;
  const arealDensity = body.massModel.mode === 'density' ? body.massModel.arealDensity : mass / area;
  const inertia = mass * geometry.inertiaPerMass;
  if (![area, mass, arealDensity, inertia].every(n => Number.isFinite(n) && n > 0)) return failure();
  return freezeJson({ ok: true as const, value: { area, mass, arealDensity, inertia, centroid: geometry.centroid } });
}
function failure(): PhysicsResult<PhysicalProperties> {
  return freezeJson({ ok: false as const, diagnostics: [physicsDiagnostic('PHYSICAL_PROPERTIES_INVALID', '', 'Uniform-lamina properties must be finite, positive and geometrically valid.', 'Correct geometry and the authoritative mass/density; nothing is substituted.')] });
}
