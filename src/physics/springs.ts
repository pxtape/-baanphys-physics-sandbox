/** Real Hooke/dashpot loads in SI, evaluated from current COM/anchor velocities. */
import type {
  SceneDocument,
  SceneConstraint,
  WorldVector,
} from "../domain/scene";
import type { BodySnapshot } from "./contracts";
export interface SpringLoad {
  readonly bodyId: string;
  readonly vector: WorldVector;
  readonly localPoint: WorldVector;
}
export function springLoads(
  scene: SceneDocument,
  states: readonly BodySnapshot[],
): { ok: true; loads: SpringLoad[] } | { ok: false; message: string } {
  if (!scene.constraints.some((c) => c.type === "spring"))
    return { ok: true, loads: [] };
  const sources = new Map(scene.bodies.map((b) => [b.id.toLowerCase(), b])),
    poses = new Map(states.map((b) => [b.id.toLowerCase(), b]));
  const endpoint = (a: SceneConstraint["anchorA"]) => {
    if (a.type === "world")
      return { p: a.point, v: { x: 0, y: 0 }, dynamic: false };
    const b = poses.get(a.bodyId.toLowerCase())!,
      c = Math.cos(b.angle),
      s = Math.sin(b.angle),
      rx = c * a.localPoint.x - s * a.localPoint.y,
      ry = s * a.localPoint.x + c * a.localPoint.y;
    return {
      p: { x: b.position.x + rx, y: b.position.y + ry },
      v: {
        x: b.velocity.x - b.angularVelocity * ry,
        y: b.velocity.y + b.angularVelocity * rx,
      },
      dynamic: sources.get(a.bodyId.toLowerCase())!.motionType === "dynamic",
    };
  };
  const loads: SpringLoad[] = [];
  for (const c of [...scene.constraints].sort((a, b) =>
    a.id.toLowerCase() < b.id.toLowerCase() ? -1 : 1,
  )) {
    if (c.type !== "spring") continue;
    const a = endpoint(c.anchorA),
      b = endpoint(c.anchorB),
      dx = b.p.x - a.p.x,
      dy = b.p.y - a.p.y,
      d = Math.hypot(dx, dy);
    if (!Number.isFinite(d) || d < Math.max(1e-6, 0.1 * c.restLength))
      return {
        ok: false,
        message:
          "Spring compressed below 10% of rest length or became nonfinite; reset and separate the anchors.",
      };
    const nx = dx / d,
      ny = dy / d,
      rate = (b.v.x - a.v.x) * nx + (b.v.y - a.v.y) * ny,
      force =
        c.springConstant * (d - c.restLength) + c.dampingCoefficient * rate;
    if (!Number.isFinite(force))
      return {
        ok: false,
        message:
          "Spring force is nonfinite. Reset and reduce stiffness/damping or extension.",
      };
    if (a.dynamic && c.anchorA.type === "body")
      loads.push({
        bodyId: c.anchorA.bodyId,
        localPoint: c.anchorA.localPoint,
        vector: { x: force * nx, y: force * ny },
      });
    if (b.dynamic && c.anchorB.type === "body")
      loads.push({
        bodyId: c.anchorB.bodyId,
        localPoint: c.anchorB.localPoint,
        vector: { x: -force * nx, y: -force * ny },
      });
  }
  return { ok: true, loads };
}
