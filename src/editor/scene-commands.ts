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
    material: { friction: 0, staticFriction: 0, restitution: 1 },
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
  const policy = checkPlanckCapabilities(v.scene);
  if (!policy.policyCompatible)
    return {
      ok: false,
      message: `${policy.diagnostics[0]!.message} (${policy.diagnostics[0]!.path || "/"})`,
    };
  return { ok: true, scene: v.scene };
}
export function newScene(
  preset: "free-fall" | "projectile" = "free-fall",
): SceneDocument {
  const s = structuredClone(example) as SceneV1;
  s.identity = { state: "draft" };
  s.title = preset === "projectile" ? "Projectile motion" : "Free fall";
  s.description =
    "Teacher-authored initial conditions. Experimental free-flight preview only.";
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
  s.forces = [];
  s.constraints = [];
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
) {
  const draft = structuredClone(scene) as SceneV1;
  change(draft);
  return validateDraft(draft);
}
