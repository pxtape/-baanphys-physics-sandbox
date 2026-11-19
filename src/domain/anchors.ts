import type {
  SceneDocument,
  SceneConstraint,
  SceneBody,
  WorldVector,
} from "./scene";
export interface RigidPose {
  readonly position: WorldVector;
  readonly angle: number;
}
export function anchorPosition(
  scene: SceneDocument,
  anchor: SceneConstraint["anchorA"],
  poses?: ReadonlyMap<string, RigidPose>,
): WorldVector {
  if (anchor.type === "world") return { ...anchor.point };
  const body = scene.bodies.find(
    (b) => b.id.toLowerCase() === anchor.bodyId.toLowerCase(),
  );
  if (!body) throw Error("Unknown anchor body");
  const pose = poses?.get(body.id) ?? body,
    c = Math.cos(pose.angle),
    s = Math.sin(pose.angle);
  return {
    x: pose.position.x + c * anchor.localPoint.x - s * anchor.localPoint.y,
    y: pose.position.y + s * anchor.localPoint.x + c * anchor.localPoint.y,
  };
}
export function localPoint(body: SceneBody, point: WorldVector): WorldVector {
  const x = point.x - body.position.x,
    y = point.y - body.position.y,
    c = Math.cos(body.angle),
    s = Math.sin(body.angle);
  return { x: c * x + s * y, y: -s * x + c * y };
}
