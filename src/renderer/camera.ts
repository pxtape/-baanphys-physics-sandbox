import type { SceneDocument } from "../domain/scene";
import { anchorPosition } from "../domain/anchors";
export const CAMERA = {
  width: 1000,
  height: 600,
  scale: 64,
  originX: 500,
  originY: 492,
};
export const toScreen = (p: { x: number; y: number }) => ({
  x: CAMERA.originX + p.x * CAMERA.scale,
  y: CAMERA.originY - p.y * CAMERA.scale,
});
export const toWorld = (p: { x: number; y: number }) => ({
  x: (p.x - CAMERA.originX) / CAMERA.scale,
  y: (CAMERA.originY - p.y) / CAMERA.scale,
});

export function fitSceneView(
  scene: SceneDocument,
  poses: ReadonlyMap<
    string,
    {
      readonly position: { readonly x: number; readonly y: number };
      readonly angle: number;
    }
  > = new Map(),
) {
  const points: { x: number; y: number }[] = [];
  for (const b of scene.bodies) {
    const p = poses.get(b.id) ?? b,
      c = Math.cos(p.angle),
      s = Math.sin(p.angle),
      shape = b.shape;
    if (shape.type === "circle") {
      points.push(
        { x: p.position.x - shape.radius, y: p.position.y - shape.radius },
        { x: p.position.x + shape.radius, y: p.position.y + shape.radius },
      );
    } else {
      const vertices =
        shape.type === "polygon"
          ? shape.vertices
          : [
              { x: -shape.width / 2, y: -shape.height / 2 },
              { x: shape.width / 2, y: -shape.height / 2 },
              { x: shape.width / 2, y: shape.height / 2 },
              { x: -shape.width / 2, y: shape.height / 2 },
            ];
      for (const v of vertices)
        points.push({
          x: p.position.x + c * v.x - s * v.y,
          y: p.position.y + s * v.x + c * v.y,
        });
    }
  }
  for (const c of scene.constraints)
    points.push(
      anchorPosition(scene, c.anchorA, poses),
      anchorPosition(scene, c.anchorB, poses),
    );
  if (!points.length) return { zoom: 1, x: 0, y: 0 };
  const screen = points.map(toScreen),
    minX = Math.min(...screen.map((p) => p.x)),
    maxX = Math.max(...screen.map((p) => p.x)),
    minY = Math.min(...screen.map((p) => p.y)),
    maxY = Math.max(...screen.map((p) => p.y));
  return {
    zoom: Math.min(4, 1000 / (maxX - minX + 100), 600 / (maxY - minY + 100)),
    x: (minX + maxX) / 2 - 500,
    y: (minY + maxY) / 2 - 300,
  };
}
