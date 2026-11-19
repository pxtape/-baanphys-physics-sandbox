import type { Body } from "../domain/scene-v1.generated";
export type Point = { readonly x: number; readonly y: number };
export type BodyTransform = { angle: number } | { shape: Body["shape"] };
/** Pointer geometry only, in SI/y-up coordinates. Domain validation owns limits. */
export function pointerTransform(
  body: Pick<Body, "position" | "angle" | "shape">,
  mode: "rotate" | "resize",
  start: Point,
  current: Point,
): BodyTransform | null {
  const x = current.x - body.position.x,
    y = current.y - body.position.y;
  if (![x, y, start.x, start.y].every(Number.isFinite)) return null;
  if (mode === "rotate") {
    if (Math.hypot(x, y) < 1e-8) return null;
    const delta =
      Math.atan2(y, x) -
      Math.atan2(start.y - body.position.y, start.x - body.position.x);
    // Same orientation, bounded representation; no numerical engine settings change.
    const angle = body.angle + Math.atan2(Math.sin(delta), Math.cos(delta));
    return { angle };
  }
  const c = Math.cos(body.angle),
    s = Math.sin(body.angle),
    lx = c * x + s * y,
    ly = -s * x + c * y;
  if (body.shape.type === "circle")
    return { shape: { type: "circle", radius: Math.hypot(x, y) } };
  if (body.shape.type === "rectangle")
    return {
      shape: {
        type: "rectangle",
        width: 2 * Math.abs(lx),
        height: 2 * Math.abs(ly),
      },
    };
  if (body.shape.type === "polygon") {
    const initial = Math.hypot(
      start.x - body.position.x,
      start.y - body.position.y,
    );
    if (initial < 1e-8) return null;
    const scale = Math.hypot(x, y) / initial;
    return {
      shape: {
        type: "polygon",
        vertices: body.shape.vertices.map((v) => ({
          x: v.x * scale,
          y: v.y * scale,
        })),
      },
    };
  }
  return null;
}

export function forceDisplayScale(vector: Point): number {
  const n = Math.hypot(vector.x, vector.y);
  return n ? Math.min(18, 100 / n) : 18; // pixels/Newton, display only
}
export function forcePointerTransform(
  body: Pick<Body, "position" | "angle">,
  force: { readonly vector: Point; readonly localPoint: Point },
  mode: "vector" | "point",
  start: Point,
  current: Point,
): { vector: Point } | { localPoint: Point } | null {
  if (![start.x, start.y, current.x, current.y].every(Number.isFinite))
    return null;
  const c = Math.cos(body.angle),
    s = Math.sin(body.angle);
  const dx = current.x - start.x,
    dy = current.y - start.y;
  if (mode === "point")
    return {
      localPoint: {
        x: force.localPoint.x + c * dx + s * dy,
        y: force.localPoint.y - s * dx + c * dy,
      },
    };
  const scale = forceDisplayScale(force.vector);
  return {
    vector: {
      x: force.vector.x + (dx * 64) / scale,
      y: force.vector.y + (dy * 64) / scale,
    },
  };
}
