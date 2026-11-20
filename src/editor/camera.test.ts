import { expect, it } from "vitest";
import { fitSceneView, toScreen } from "../renderer/camera";
import { newScene, editScene } from "./scene-commands";
it("fits rotated authored geometry and fixed pivots without modifying the scene", () => {
  const source = newScene("pendulum"),
    before = JSON.stringify(source),
    view = fitSceneView(source);
  for (const b of source.bodies) {
    const p = toScreen(b.position);
    expect(Math.abs(p.x - (500 + view.x))).toBeLessThan(500 / view.zoom);
    expect(Math.abs(p.y - (300 + view.y))).toBeLessThan(300 / view.zoom);
  }
  expect(JSON.stringify(source)).toBe(before);
});
it("fits detached live poses far outside the initial camera without changing authored coordinates", () => {
  const original = newScene(),
    result = editScene(original, (s) => {
      s.bodies = s.bodies.slice(0, 1);
    });
  if (!result.ok) throw Error(result.message);
  const scene = result.scene,
    b = scene.bodies[0]!,
    view = fitSceneView(
      scene,
      new Map([[b.id, { position: { x: 30, y: -40 }, angle: 2 }]]),
    ),
    p = toScreen({ x: 30, y: -40 });
  expect(view.x + 500).toBeCloseTo(p.x, 12);
  expect(view.y + 300).toBeCloseTo(p.y, 12);
  expect(scene.bodies[0]!.position).toEqual(b.position);
});
