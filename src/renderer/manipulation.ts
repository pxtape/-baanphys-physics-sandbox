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
