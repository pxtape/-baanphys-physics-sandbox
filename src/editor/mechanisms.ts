import type { SceneDocument, SceneConstraint } from "../domain/scene";
import type { Constraint } from "../domain/scene-v1.generated";
import { anchorPosition, localPoint } from "../domain/anchors";
import { editScene, objectId } from "./scene-commands";

export type JointKind = "hinge" | "rod" | "rope";
export type Anchor = SceneConstraint["anchorA"];
export type BodyAnchor = Extract<Anchor, { type: "body" }>;
export interface ConnectionTool {
  readonly type: JointKind;
  readonly start: BodyAnchor | null;
}
const key = (id: string) => id.toLowerCase();

/** Both ends remain authored Scene v1 anchors, never native joint handles. */
export function connectAnchors(
  scene: SceneDocument,
  type: JointKind,
  from: BodyAnchor,
  to: Anchor,
) {
  if (to.type === "body" && key(from.bodyId) === key(to.bodyId))
    return {
      ok: false as const,
      message: "Choose another body or an empty world point.",
    };
  const source = scene.bodies.find((b) => key(b.id) === key(from.bodyId)),
    target =
      to.type === "body"
        ? scene.bodies.find((b) => key(b.id) === key(to.bodyId))
        : null;
  if (!source || (to.type === "body" && !target))
    return {
      ok: false as const,
      message: "A selected body no longer exists. Start the connection again.",
    };
  const shared = anchorPosition(scene, to),
    anchorA =
      type === "hinge"
        ? {
            type: "body" as const,
            bodyId: source.id,
            localPoint: localPoint(source, shared),
          }
        : structuredClone(from),
    distance = Math.hypot(
      anchorPosition(scene, anchorA).x - shared.x,
      anchorPosition(scene, anchorA).y - shared.y,
    );
  const base = {
    id: objectId(),
    name: type[0]!.toUpperCase() + type.slice(1),
    anchorA,
    anchorB: structuredClone(to),
    collideConnected: false,
  };
  const joint: Constraint =
    type === "hinge"
      ? { ...base, type }
      : type === "rod"
        ? { ...base, type, length: distance }
        : { ...base, type, maxLength: distance };
  return editScene(scene, (s) => {
    s.constraints.push(joint);
  });
}

/** Inspector target is always the endpoint opposite the selected body. */
export function targetSide(
  c: SceneConstraint,
  selected: string,
): "anchorA" | "anchorB" {
  return c.anchorA.type === "body" && key(c.anchorA.bodyId) === key(selected)
    ? "anchorB"
    : "anchorA";
}
