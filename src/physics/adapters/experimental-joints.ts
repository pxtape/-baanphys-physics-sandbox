/** Native mechanics exist only inside the explicit experimental construction path. */
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
  const ids = new Map([...bodies].map(([id, body]) => [body, id])),
    blockedPairs = new Set<string>();
  const pair = (a: string, b: string) => [a, b].sort().join("|");
  for (const c of scene.constraints)
    if (
      c.type === "spring" &&
      !c.collideConnected &&
      c.anchorA.type === "body" &&
      c.anchorB.type === "body"
    )
      blockedPairs.add(
        pair(c.anchorA.bodyId.toLowerCase(), c.anchorB.bodyId.toLowerCase()),
      );
  if (blockedPairs.size)
    world.on("pre-solve", (contact) => {
      verify();
      const a = ids.get(contact.getFixtureA().getBody()),
        b = ids.get(contact.getFixtureB().getBody());
      if (a && b && blockedPairs.has(pair(a, b))) contact.setEnabled(false);
      verify();
    });
  for (const c of [...scene.constraints].sort((a, b) =>
    a.id.toLowerCase() < b.id.toLowerCase() ? -1 : 1,
  )) {
    verify();
    if (c.type === "spring") continue; // Hooke forces are applied per substep, not a soft distance joint.
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
