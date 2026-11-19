/** Native mechanics exist only inside the explicit teacher construction path. */
import { RevoluteJoint, DistanceJoint, RopeJoint } from "planck";
import type { World, Body } from "planck";
import type { SceneDocument, SceneConstraint } from "../../domain/scene";
export function attachExperimentalJoints(
  scene: SceneDocument,
  world: World,
  bodies: ReadonlyMap<string, Body>,
  verify: () => void,
): void {
  let ground: Body | undefined;
  function endpoint(a: SceneConstraint["anchorA"]) {
    if (a.type === "body")
      return {
        body: bodies.get(a.bodyId.toLowerCase())!,
        point: { ...a.localPoint },
      };
    ground ??= world.createBody({
      type: "static",
      position: { x: 0, y: 0 },
      allowSleep: false,
    });
    return { body: ground, point: { ...a.point } };
  }
  for (const c of [...scene.constraints].sort((a, b) =>
    a.id.toLowerCase() < b.id.toLowerCase() ? -1 : 1,
  )) {
    verify();
    const a = endpoint(c.anchorA),
      b = endpoint(c.anchorB);
    const def = {
      bodyA: a.body,
      bodyB: b.body,
      localAnchorA: a.point,
      localAnchorB: b.point,
      collideConnected: c.collideConnected,
    };
    if (c.type === "hinge") world.createJoint(new RevoluteJoint(def));
    else if (c.type === "rod")
      world.createJoint(
        new DistanceJoint({
          ...def,
          length: c.length,
          frequencyHz: 0,
          dampingRatio: 0,
        }),
      );
    else if (c.type === "rope")
      world.createJoint(new RopeJoint({ ...def, maxLength: c.maxLength }));
    else throw Error("Unsupported experimental joint");
    verify();
  }
}
