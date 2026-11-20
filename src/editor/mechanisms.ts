import type { SceneDocument, SceneConstraint } from "../domain/scene";
import type { Constraint } from "../domain/scene-v1.generated";
import { anchorPosition, localPoint } from "../domain/anchors";
import { editScene, objectId } from "./scene-commands";

export type JointKind = "hinge" | "rod" | "rope" | "spring";
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
        : type === "rope"
          ? { ...base, type, maxLength: distance }
          : {
              ...base,
              type,
              restLength: distance,
              springConstant: 10,
              dampingCoefficient: 0,
            };
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

export type AnchorSide = "anchorA" | "anchorB";
/** Reposition attachment geometry only; preserve joint/body UUIDs and body poses. */
export function moveJointAnchor(
  scene: SceneDocument,
  id: string,
  side: AnchorSide,
  point: { x: number; y: number },
  attachTo?: string | null,
) {
  const source = scene.constraints.find((c) => c.id === id);
  if (!source)
    return { ok: false as const, message: "Select an existing joint." };
  return editScene(
    scene,
    (s) => {
      const c = s.constraints.find((c) => c.id === id)!,
        other: AnchorSide = side === "anchorA" ? "anchorB" : "anchorA";
      let reference = c[side];
      // Dropping on a body reconnects. Empty space retains the current attachment.
      if (attachTo) {
        const target = s.bodies.find((b) => b.id === attachTo);
        if (
          target &&
          !(c[other].type === "body" && c[other].bodyId === target.id)
        )
          reference = {
            type: "body",
            bodyId: target.id,
            localPoint: { x: 0, y: 0 },
          };
      } else if (attachTo === null) reference = { type: "world", point };
      const at = (a: typeof reference) =>
        a.type === "world"
          ? { type: "world" as const, point: { ...point } }
          : {
              type: "body" as const,
              bodyId: a.bodyId,
              localPoint: localPoint(
                s.bodies.find((b) => key(b.id) === key(a.bodyId))!,
                point,
              ),
            };
      c[side] = at(reference);
      if (c.type === "hinge") c[other] = at(c[other]);
      const a = anchorPosition(s, c.anchorA),
        b = anchorPosition(s, c.anchorB),
        distance = Math.hypot(a.x - b.x, a.y - b.y);
      if (c.type === "rod") c.length = distance;
      if (c.type === "rope") c.maxLength = distance;
    },
    false,
  );
}
export function moveJoint(
  scene: SceneDocument,
  id: string,
  a: { x: number; y: number },
  b: { x: number; y: number },
) {
  if (!scene.constraints.some((c) => c.id === id))
    return { ok: false as const, message: "Select an existing joint." };
  return editScene(
    scene,
    (s) => {
      const c = s.constraints.find((c) => c.id === id)!;
      for (const [side, p] of [
        ["anchorA", a],
        ["anchorB", b],
      ] as const) {
        const anchor = c[side];
        c[side] =
          anchor.type === "world"
            ? { type: "world", point: { ...p } }
            : {
                type: "body",
                bodyId: anchor.bodyId,
                localPoint: localPoint(
                  s.bodies.find((body) => key(body.id) === key(anchor.bodyId))!,
                  p,
                ),
              };
      }
      if (c.type === "rod") c.length = Math.hypot(a.x - b.x, a.y - b.y);
      // Whole-joint translation preserves rope slack and spring rest length.
    },
    false,
  );
}
