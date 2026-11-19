import { physicalProperties } from "../physics/physical-properties";
import { anchorPosition } from "../domain/anchors";
import { checkExperimentalScene } from "../physics/experimental-policy";
import example from "../../examples/falling-ball.scene.json";
import type { SceneV1, Body } from "../domain/scene-v1.generated";
import type { SceneDocument } from "../domain/scene";
import { validateScene } from "../schema";
import {
  PLANCK_IDENTITY,
  PLANCK_SETTINGS,
  checkPlanckCapabilities,
} from "../physics";

export type ObjectKind = "circle" | "rectangle" | "floor";
export function objectId(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6]! & 15) | 64;
  bytes[8] = (bytes[8]! & 63) | 128;
  const h = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
export function makeBody(kind: ObjectKind, id = objectId(), offset = 0): Body {
  return {
    id,
    name:
      kind === "circle" ? "Circle" : kind === "floor" ? "Floor" : "Rectangle",
    motionType: kind === "floor" ? "static" : "dynamic",
    shape:
      kind === "circle"
        ? { type: "circle", radius: 0.3 }
        : {
            type: "rectangle",
            width: kind === "floor" ? 12 : 1.2,
            height: kind === "floor" ? 0.3 : 0.8,
          },
    position: {
      x: kind === "floor" ? 0 : offset,
      y: kind === "floor" ? -0.15 : 4,
    },
    angle: 0,
    velocity: { x: 0, y: 0 },
    angularVelocity: 0,
    massModel: { mode: "mass", mass: 1 },
    material: {
      friction: 0.4,
      staticFriction: 0.4,
      restitution: kind === "floor" ? 0 : 0.75,
    },
  };
}
export function validateDraft(
  input: unknown,
): { ok: true; scene: SceneDocument } | { ok: false; message: string } {
  const v = validateScene(input);
  if (!v.ok)
    return {
      ok: false,
      message: `${v.diagnostics[0]!.message} (${v.diagnostics[0]!.path || "/"})`,
    };
  const policy = v.scene.constraints.length
    ? checkExperimentalScene(v.scene)
    : checkPlanckCapabilities(v.scene);
  if (!policy.policyCompatible) {
    const issue =
      policy.diagnostics.find((d) => d.code !== "FEATURE_NOT_QUALIFIED") ??
      policy.diagnostics[0]!;
    return { ok: false, message: `${issue.message} (${issue.path || "/"})` };
  }
  return { ok: true, scene: v.scene };
}
export function newScene(
  preset:
    | "free-fall"
    | "projectile"
    | "collision"
    | "sliding"
    | "forces"
    | "pendulum"
    | "rope"
    | "incline" = "free-fall",
): SceneDocument {
  const s = structuredClone(example) as SceneV1;
  s.identity = { state: "draft" };
  s.title =
    preset === "projectile"
      ? "Projectile motion"
      : preset === "collision"
        ? "Body collision"
        : preset === "sliding"
          ? "Sliding block"
          : "Free fall";
  s.description =
    "Teacher-authored initial conditions. Experimental teacher simulation; collision accuracy is not certified.";
  s.simulation = {
    ...structuredClone(PLANCK_SETTINGS),
    engine: { ...PLANCK_IDENTITY },
    timestepSeconds: 0.008333333333333333,
    seed: 1,
  };
  s.bodies = [makeBody("circle"), makeBody("floor")];
  if (preset === "projectile") {
    s.bodies[0]!.position = { x: -3, y: 2.5 };
    s.bodies[0]!.velocity = { x: 4, y: 5 };
  }
  if (preset === "collision") {
    const a = makeBody("circle"),
      b = makeBody("circle");
    a.name = "Circle A";
    b.name = "Circle B";
    a.position = { x: -2, y: 2 };
    b.position = { x: 1, y: 2 };
    a.velocity.x = 3;
    b.velocity.x = -1;
    a.material.restitution = 0.9;
    b.material.restitution = 0.9;
    s.bodies = [a, b, makeBody("floor")];
    s.world.gravity = { x: 0, y: 0 };
  }
  if (preset === "sliding") {
    const block = makeBody("rectangle");
    block.position = { x: -3, y: 0.41 };
    block.velocity.x = 4;
    block.material = { friction: 0.6, staticFriction: 0.6, restitution: 0 };
    const floor = makeBody("floor");
    floor.material = { ...block.material };
    s.bodies = [block, floor];
  }
  s.forces = [];
  if (preset === "forces") {
    const block = makeBody("rectangle");
    block.name = "Driven block";
    block.shape = { type: "rectangle", width: 2, height: 1 };
    block.position = { x: 0, y: 3 };
    block.massModel = { mode: "mass", mass: 2 };
    s.title = "Force and torque";
    s.world.gravity = { x: 0, y: 0 };
    s.bodies = [block, makeBody("floor")];
    s.forces = [
      {
        id: objectId(),
        type: "constantForce",
        bodyId: block.id,
        vector: { x: 0, y: 2 },
        localPoint: { x: 0.5, y: 0 },
      },
    ];
  }
  s.constraints = [];
  if (preset === "pendulum" || preset === "rope") {
    const b = makeBody(preset === "pendulum" ? "rectangle" : "circle");
    s.title = preset === "pendulum" ? "Hinged pendulum" : "Rope pendulum";
    s.world.gravity = { x: 0, y: -9.81 };
    b.position = {
      x: Math.sin(0.5) * (preset === "pendulum" ? 1 : 2),
      y: 5 - Math.cos(0.5) * (preset === "pendulum" ? 1 : 2),
    };
    if (preset === "pendulum") {
      b.shape = { type: "rectangle", width: 0.3, height: 2 };
      b.angle = 0.5;
    }
    s.bodies = [b, makeBody("floor")];
    const shared = {
      id: objectId(),
      name: preset === "pendulum" ? "Pivot" : "Rope",
      anchorA: {
        type: "body" as const,
        bodyId: b.id,
        localPoint: { x: 0, y: preset === "pendulum" ? 1 : 0 },
      },
      anchorB: { type: "world" as const, point: { x: 0, y: 5 } },
      collideConnected: false,
    };
    s.constraints = [
      preset === "pendulum"
        ? { ...shared, type: "hinge" }
        : { ...shared, type: "rope", maxLength: 2 },
    ];
  }
  if (preset === "incline") {
    const ramp = makeBody("floor"),
      block = makeBody("rectangle"),
      angle = -0.25,
      c = Math.cos(angle),
      sn = Math.sin(angle);
    ramp.name = "Inclined surface";
    ramp.shape = { type: "rectangle", width: 9, height: 0.3 };
    ramp.position = { x: 0, y: 1.8 };
    ramp.angle = angle;
    block.name = "Sliding block";
    block.position = { x: -2.5 * c - 0.56 * sn, y: 1.8 - 2.5 * sn + 0.56 * c };
    block.angle = angle;
    block.massModel = { mode: "mass", mass: 2 };
    ramp.material = block.material = {
      friction: 0.15,
      staticFriction: 0.15,
      restitution: 0,
    };
    s.bodies = [block, ramp, makeBody("floor")];
    s.title = "Inclined plane";
    s.world.gravity = { x: 0, y: -9.81 };
  }
  s.measurements = [];
  s.studentPolicy.controls = [];
  s.view.cameraCenter = { x: 0, y: 3 };
  s.view.pixelsPerMeter = 64;
  const result = validateDraft(s);
  if (!result.ok) throw Error(result.message);
  return result.scene;
}
export function editScene(
  scene: SceneDocument,
  change: (draft: SceneV1) => void,
  carryWorldAnchors = true,
) {
  const draft = structuredClone(scene) as SceneV1;
  change(draft);
  // Authoring movement carries an attached world pivot with its body. Native
  // runtime state never feeds back into these initial conditions.
  for (const c of carryWorldAnchors ? draft.constraints : []) {
    const old = scene.constraints.find((q) => q.id === c.id);
    if (!old) continue;
    if (
      (c.type === "rod" && old.type === "rod" && c.length !== old.length) ||
      (c.type === "rope" &&
        old.type === "rope" &&
        c.maxLength !== old.maxLength)
    )
      continue;
    for (const [key, other] of [
      ["anchorA", "anchorB"],
      ["anchorB", "anchorA"],
    ] as const) {
      const a = c[key],
        b = c[other],
        oldA = old[key],
        oldB = old[other];
      if (
        a.type !== "body" ||
        b.type !== "world" ||
        oldA.type !== "body" ||
        oldB.type !== "world" ||
        b.point.x !== oldB.point.x ||
        b.point.y !== oldB.point.y
      )
        continue;
      if (!draft.bodies.some((q) => q.id === a.bodyId)) continue;
      const before = anchorPosition(scene, oldA),
        after = anchorPosition(draft, a);
      b.point.x += after.x - before.x;
      b.point.y += after.y - before.y;
    }
  }
  return validateDraft(draft);
}

/** Copies one authored body and its force definitions; joints remain on originals. */
export function duplicateBody(scene: SceneDocument, id: string) {
  const source = scene.bodies.find((b) => b.id === id);
  if (!source) return { ok: false as const, message: "Select a body first." };
  const copy = structuredClone(source) as Body;
  copy.id = objectId();
  copy.name = Array.from(copy.name).slice(0, 115).join("") + " copy";
  const radius =
    source.shape.type === "circle"
      ? source.shape.radius
      : source.shape.type === "rectangle"
        ? Math.hypot(source.shape.width, source.shape.height) / 2
        : Math.max(...source.shape.vertices.map((p) => Math.hypot(p.x, p.y)));
  if (source.motionType === "static") copy.position.y += 2 * radius + 0.3;
  else copy.position.x += 2 * radius + 0.3;
  const result = editScene(scene, (s) => {
    s.bodies.push(copy);
    s.forces.push(
      ...scene.forces
        .filter((f) => f.bodyId === id)
        .map((f) => ({
          ...structuredClone(f),
          id: objectId(),
          bodyId: copy.id,
        })),
    );
  });
  return result.ok ? { ...result, bodyId: copy.id } : result;
}

/** Authoring-only constrained positioning, never a correction to runtime physics. */
export function positionBody(
  scene: SceneDocument,
  id: string,
  target: { x: number; y: number },
  fixedPivots = false,
) {
  return editScene(
    scene,
    (s) => {
      const b = s.bodies.find((b) => b.id === id);
      if (!b) return;
      b.position = { ...target };
      if (!fixedPivots) return;
      const joint = scene.constraints.find(
        (c) =>
          (c.anchorA.type === "body" && c.anchorA.bodyId === id) ||
          (c.anchorB.type === "body" && c.anchorB.bodyId === id),
      );
      if (!joint || joint.type === "spring") return;
      const a =
        joint.anchorA.type === "body" && joint.anchorA.bodyId === id
          ? joint.anchorA
          : joint.anchorB;
      const other = a === joint.anchorA ? joint.anchorB : joint.anchorA;
      if (a.type !== "body") return;
      const p = anchorPosition(scene, other);
      if (joint.type === "hinge") {
        const radius = Math.hypot(a.localPoint.x, a.localPoint.y),
          dx = target.x - p.x,
          dy = target.y - p.y,
          d = Math.hypot(dx, dy);
        if (radius === 0) {
          b.position = { ...p };
          return;
        }
        if (d < 1e-12) {
          b.position = { ...scene.bodies.find((q) => q.id === id)!.position };
          return;
        }
        b.position = { x: p.x + (dx * radius) / d, y: p.y + (dy * radius) / d };
        b.angle =
          Math.atan2(p.y - b.position.y, p.x - b.position.x) -
          Math.atan2(a.localPoint.y, a.localPoint.x);
      } else {
        const c = Math.cos(b.angle),
          sn = Math.sin(b.angle),
          offset = {
            x: c * a.localPoint.x - sn * a.localPoint.y,
            y: sn * a.localPoint.x + c * a.localPoint.y,
          };
        const dx = target.x + offset.x - p.x,
          dy = target.y + offset.y - p.y,
          d = Math.hypot(dx, dy),
          length = joint.type === "rod" ? joint.length : joint.maxLength;
        if (joint.type === "rod" || d > length) {
          if (d < 1e-12) {
            b.position = { ...scene.bodies.find((q) => q.id === id)!.position };
            return;
          }
          b.position = {
            x: p.x + (dx * length) / d - offset.x,
            y: p.y + (dy * length) / d - offset.y,
          };
        }
      }
    },
    !fixedPivots,
  );
}

/** An explicit authoring operation; never changes runtime state or silently drops forces. */
export function setBodyMotion(
  scene: SceneDocument,
  id: string,
  motion: "static" | "dynamic",
) {
  const body = scene.bodies.find((b) => b.id === id);
  if (!body) return { ok: false as const, message: "Select a body first." };
  if (body.motionType === motion) return { ok: true as const, scene };
  if (
    motion === "static" &&
    (scene.forces.some((f) => f.bodyId === id) ||
      scene.constraints.some(
        (c) =>
          (c.anchorA.type === "body" && c.anchorA.bodyId === id) ||
          (c.anchorB.type === "body" && c.anchorB.bodyId === id),
      ))
  ) {
    return {
      ok: false as const,
      message:
        "Remove this body's forces and joints before fixing it. They are not deleted automatically.",
    };
  }
  return editScene(scene, (s) => {
    const b = s.bodies.find((b) => b.id === id)!;
    b.motionType = motion;
    if (motion === "static") {
      b.velocity = { x: 0, y: 0 };
      b.angularVelocity = 0;
    }
  });
}
/** Switch authoritative quantity while preserving the uniform body's physical mass. */
export function setMassMode(
  scene: SceneDocument,
  id: string,
  mode: "mass" | "density",
) {
  const body = scene.bodies.find((b) => b.id === id);
  if (!body) return { ok: false as const, message: "Select a body first." };
  const p = physicalProperties(body);
  if (!p.ok) return { ok: false as const, message: p.diagnostics[0]!.message };
  return editScene(scene, (s) => {
    s.bodies.find((b) => b.id === id)!.massModel =
      mode === "mass"
        ? { mode, mass: p.value.mass }
        : { mode, arealDensity: p.value.arealDensity };
  });
}
