import type { BodyShape, WorldVector } from './scene';
import type { DiagnosticSink } from './diagnostics';

export interface LaminaProperties { readonly area: number; readonly inertiaPerMass: number; readonly centroid: WorldVector }
const cross = (a: WorldVector, b: WorldVector, c: WorldVector) =>
  (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
const onSegment = (a: WorldVector, b: WorldVector, p: WorldVector) =>
  cross(a, b, p) === 0 && p.x >= Math.min(a.x, b.x) && p.x <= Math.max(a.x, b.x)
  && p.y >= Math.min(a.y, b.y) && p.y <= Math.max(a.y, b.y);
function intersects(a: WorldVector, b: WorldVector, c: WorldVector, d: WorldVector): boolean {
  const abC = cross(a, b, c), abD = cross(a, b, d), cdA = cross(c, d, a), cdB = cross(c, d, b);
  return ((abC > 0 && abD < 0 || abC < 0 && abD > 0) && (cdA > 0 && cdB < 0 || cdA < 0 && cdB > 0))
    || onSegment(a, b, c) || onSegment(a, b, d) || onSegment(c, d, a) || onSegment(c, d, b);
}

/** Called after structural bounds (3..128 vertices) have been checked. No recentering. */
export function validateGeometry(shape: BodyShape, path: string, add: DiagnosticSink): LaminaProperties | undefined {
  if (shape.type === 'circle') return { area: Math.PI * shape.radius ** 2, inertiaPerMass: shape.radius ** 2 / 2, centroid: { x: 0, y: 0 } };
  if (shape.type === 'rectangle') return { area: shape.width * shape.height, inertiaPerMass: (shape.width ** 2 + shape.height ** 2) / 12, centroid: { x: 0, y: 0 } };
  const vertices = shape.vertices;
  const n = vertices.length;
  const vertex = (i: number): WorldVector => vertices[(i + n) % n]!;
  let invalid = false;
  const fail = (code: string, message: string, suggestion: string, suffix = '') => {
    invalid = true; add({ code, path: path + suffix, stage: 'semantic', severity: 'error', message, suggestion });
  };
  for (let i = 0; i < n; i++) {
    const a = vertex(i), b = vertex(i + 1);
    if (Math.hypot(a.x - b.x, a.y - b.y) <= 1e-6) {
      fail('POLYGON_EDGE_TOO_SHORT', 'Polygon edges must be longer than 1e-6 m.', 'Remove repeated vertices or increase the edge length.', `/vertices/${i}`); break;
    }
  }
  outer: for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
    if (j === i + 1 || i === 0 && j === n - 1) continue;
    if (intersects(vertex(i), vertex(i + 1), vertex(j), vertex(j + 1))) {
      fail('POLYGON_SELF_INTERSECTION', 'Nonadjacent polygon edges intersect or touch.', 'Supply a simple convex boundary without crossing edges.', '/vertices'); break outer;
    }
  }
  let twiceArea = 0, cx = 0, cy = 0, moment = 0;
  for (let i = 0; i < n; i++) {
    const a = vertex(i), b = vertex(i + 1), term = a.x * b.y - b.x * a.y;
    twiceArea += term; cx += (a.x + b.x) * term; cy += (a.y + b.y) * term;
    moment += term * (a.x ** 2 + a.x * b.x + b.x ** 2 + a.y ** 2 + a.y * b.y + b.y ** 2);
  }
  if (Math.abs(twiceArea) / 2 <= 1e-10) fail('POLYGON_AREA_TOO_SMALL', 'Polygon area must exceed 1e-10 m².', 'Use a nondegenerate polygon with sufficient area.');
  if (twiceArea <= 0) fail('POLYGON_NOT_CCW', 'Polygon winding must be counterclockwise in y-up coordinates.', 'Reverse clockwise vertices; correct degenerate geometry first.');
  if (twiceArea > 0 && vertices.some((_, i) => cross(vertex(i), vertex(i + 1), vertex(i + 2)) <= 0)) {
    fail('POLYGON_NOT_CONVEX', 'Every polygon corner must be strictly convex.', 'Remove collinear points and concave indentations.');
  }
  if (invalid) return undefined;
  cx /= 3 * twiceArea; cy /= 3 * twiceArea;
  if (Math.hypot(cx, cy) > 1e-8) {
    fail('POLYGON_CENTROID_OFFSET', 'Polygon centroid must be within 1e-8 m of its local origin.', 'Re-author vertices about their centre of mass and update local anchors explicitly.');
    return undefined;
  }
  return { area: twiceArea / 2, inertiaPerMass: moment / (6 * twiceArea) - cx ** 2 - cy ** 2, centroid: { x: cx, y: cy } };
}
