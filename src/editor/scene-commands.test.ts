import { expect, it } from "vitest";
import { editScene, makeBody, newScene } from "./scene-commands";
import { toScreen, toWorld } from "../renderer/SceneCanvas";
it("creates all three objects in one Scene v1 representation with stable IDs and immutable edits", () => {
  const source = newScene(),
    before = JSON.stringify(source),
    ids = source.bodies.map((b) => b.id);
  const next = editScene(source, (s) => {
    s.bodies.push(makeBody("rectangle"));
    s.bodies[0]!.position = { x: -2, y: 5 };
  });
  if (!next.ok) throw Error(next.message);
  expect(next.scene.schemaVersion).toBe(1);
  expect(next.scene.bodies.slice(0, 2).map((b) => b.id)).toEqual(ids);
  expect(JSON.stringify(source)).toBe(before);
  expect(Object.isFrozen(next.scene.bodies)).toBe(true);
  expect(next.scene.bodies.map((b) => b.shape.type)).toEqual([
    "circle",
    "rectangle",
    "rectangle",
  ]);
});
it("rejects invalid geometry, nonfinite numbers and invalid mass without partial authored mutation", () => {
  const source = newScene(),
    before = JSON.stringify(source);
  for (const value of [0, -1, NaN, Infinity])
    expect(
      editScene(source, (s) => {
        s.bodies[0]!.massModel = { mode: "mass", mass: value };
      }).ok,
    ).toBe(false);
  expect(
    editScene(source, (s) => {
      s.bodies[0]!.shape = { type: "circle", radius: 0 };
    }).ok,
  ).toBe(false);
  expect(JSON.stringify(source)).toBe(before);
});
it("maps SI world coordinates to SVG coordinates and back with y up", () => {
  for (const point of [
    { x: 0, y: 0 },
    { x: -4.2, y: 6 },
    { x: 3, y: -1 },
  ]) {
    const back = toWorld(toScreen(point));
    expect(back.x).toBeCloseTo(point.x, 12);
    expect(back.y).toBeCloseTo(point.y, 12);
  }
  expect(toScreen({ x: 0, y: 1 }).y).toBeLessThan(toScreen({ x: 0, y: 0 }).y);
});
