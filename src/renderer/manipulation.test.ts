import { expect, it } from "vitest";
import { pointerTransform } from "./manipulation";
const rect = {
  position: { x: -2, y: 3 },
  angle: Math.PI / 2,
  shape: { type: "rectangle" as const, width: 2, height: 1 },
};
it("resizes a rotated rectangle in local axes without changing its COM", () => {
  const result = pointerTransform(
    rect,
    "resize",
    { x: 0, y: 0 },
    { x: -3, y: 5 },
  );
  expect(result).toEqual({
    shape: { type: "rectangle", width: 4, height: expect.closeTo(2, 12) },
  });
  expect(rect.position).toEqual({ x: -2, y: 3 });
});
it("rotates relative to pointer start and preserves y-up/CCW convention", () => {
  expect(
    pointerTransform(rect, "rotate", { x: -2, y: 5 }, { x: -4, y: 3 }),
  ).toEqual({ angle: Math.PI });
  expect(
    pointerTransform(rect, "rotate", { x: -2, y: 5 }, rect.position),
  ).toBeNull();
});
it("derives circle radius geometrically and rejects nonfinite input", () => {
  const circle = { ...rect, shape: { type: "circle" as const, radius: 1 } };
  expect(
    pointerTransform(circle, "resize", { x: 0, y: 0 }, { x: 1, y: 7 }),
  ).toEqual({ shape: { type: "circle", radius: 5 } });
  expect(
    pointerTransform(circle, "resize", { x: 0, y: 0 }, { x: NaN, y: 7 }),
  ).toBeNull();
});
it("force dragging converts screen-equivalent displacement to Newtons and body-local points", async () => {
  const { forcePointerTransform } = await import("./manipulation");
  const force = { vector: { x: 0, y: 2 }, localPoint: { x: 0.5, y: 0 } };
  const moved = forcePointerTransform(
    rect,
    force,
    "point",
    { x: 0, y: 0 },
    { x: 0, y: 1 },
  );
  expect(moved).toEqual({ localPoint: { x: 1.5, y: expect.closeTo(0, 12) } });
  expect(
    forcePointerTransform(
      rect,
      force,
      "vector",
      { x: 0, y: 0 },
      { x: 18 / 64, y: 0 },
    ),
  ).toEqual({ vector: { x: 1, y: 2 } });
  expect(force.localPoint).toEqual({ x: 0.5, y: 0 });
});
