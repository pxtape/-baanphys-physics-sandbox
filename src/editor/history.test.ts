import { expect, it } from "vitest";
import { SceneHistory } from "./history";
import { newScene, editScene, duplicateBody } from "./scene-commands";
it("groups a complete drag into one undo and restores exact object IDs/quantities on redo", () => {
  const history = new SceneHistory(),
    a = newScene();
  history.begin(a);
  const moved = editScene(a, (s) => {
    s.bodies[0]!.position.x = 1;
  });
  if (!moved.ok) throw Error(moved.message);
  history.record(a, moved.scene);
  const end = editScene(moved.scene, (s) => {
    s.bodies[0]!.position.x = 2;
  });
  if (!end.ok) throw Error(end.message);
  history.record(moved.scene, end.scene);
  history.end(end.scene);
  expect(history.undo(end.scene)).toBe(a);
  expect(history.canUndo).toBe(false);
  expect(history.redo(a)).toBe(end.scene);
});
it("duplicate remaps body/force identities without accidentally copying joints", () => {
  const source = newScene("forces"),
    id = source.bodies[0]!.id,
    result = duplicateBody(source, id);
  if (!result.ok) throw Error(result.message);
  expect(result.scene.bodies).toHaveLength(source.bodies.length + 1);
  expect(result.bodyId).not.toBe(id);
  expect(result.scene.forces).toHaveLength(2);
  expect(result.scene.forces[1]!.bodyId).toBe(result.bodyId);
  expect(result.scene.forces[1]!.id).not.toBe(source.forces[0]!.id);
  expect(source.forces).toHaveLength(1);
});
it("fixed-pivot authoring changes pendulum pose without moving the world pivot", async () => {
  const { positionBody } = await import("./scene-commands");
  const { anchorPosition } = await import("../domain/anchors");
  const source = newScene("pendulum"),
    joint = source.constraints[0]!;
  const next = positionBody(
    source,
    source.bodies[0]!.id,
    { x: 1.2, y: 3.8 },
    true,
  );
  if (!next.ok) throw Error(next.message);
  expect(next.scene.constraints[0]!.anchorB).toEqual(joint.anchorB);
  const a = anchorPosition(next.scene, next.scene.constraints[0]!.anchorA),
    b = anchorPosition(next.scene, next.scene.constraints[0]!.anchorB);
  expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeLessThan(1e-10);
  expect(next.scene.bodies[0]!.angle).not.toBe(source.bodies[0]!.angle);
});
