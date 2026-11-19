/** Explicit experimental teacher workspace only. Not exported from physics/index.
 * Does not qualify or enable the public adapter. Production builds default OFF.
 */
import type { SceneDocument, SceneBody } from "../domain/scene";
import { validateScene } from "../schema";
import type {
  PhysicsRuntime,
  PhysicsResult,
  SimulationSnapshot,
} from "./contracts";
import { physicsDiagnostic } from "./profile";
import {
  constructExperimentalMechanismRuntime,
  constructSteppingRuntime,
} from "./adapters/planck-construction";

const blocked = (message: string): PhysicsResult<never> => ({
  ok: false,
  diagnostics: [
    physicsDiagnostic(
      "FEATURE_NOT_QUALIFIED",
      "",
      message,
      "Reset and edit initial conditions. Collision accuracy and public/student execution remain unqualified.",
    ),
  ],
});
function bounds(body: SceneBody, frame: SimulationSnapshot, gravity: number) {
  const live = frame.bodies.find((b) => b.id === body.id)!;
  const shape = body.shape;
  const x =
    shape.type === "circle"
      ? shape.radius
      : shape.type === "rectangle"
        ? (Math.abs(Math.cos(live.angle)) * shape.width +
            Math.abs(Math.sin(live.angle)) * shape.height) /
          2
        : Infinity;
  const y =
    shape.type === "circle"
      ? shape.radius
      : shape.type === "rectangle"
        ? (Math.abs(Math.sin(live.angle)) * shape.width +
            Math.abs(Math.cos(live.angle)) * shape.height) /
          2
        : Infinity;
  // Bounds the entire free-flight path for the next logical tick, including all
  // four substeps. Native polygon skin included, with conservative pair inflation.
  const travel =
    body.motionType === "static"
      ? 0
      : (Math.hypot(live.velocity.x, live.velocity.y) + gravity / 120) / 120;
  const margin = travel + 0.01 + 1e-9;
  return {
    minX: live.position.x - x - margin,
    maxX: live.position.x + x + margin,
    minY: live.position.y - y - margin,
    maxY: live.position.y + y + margin,
  };
}
export function possibleContact(
  scene: SceneDocument,
  frame: SimulationSnapshot,
): boolean {
  const boxes = scene.bodies.map((b) =>
    bounds(b, frame, Math.hypot(scene.world.gravity.x, scene.world.gravity.y)),
  );
  return scene.bodies.some((a, i) =>
    scene.bodies.some(
      (b, j) =>
        j > i &&
        (a.motionType === "dynamic" || b.motionType === "dynamic") &&
        boxes[i]!.minX <= boxes[j]!.maxX &&
        boxes[j]!.minX <= boxes[i]!.maxX &&
        boxes[i]!.minY <= boxes[j]!.maxY &&
        boxes[j]!.minY <= boxes[i]!.maxY,
    ),
  );
}
export function createTeacherPreview(
  input: SceneDocument,
  teacherOptIn: boolean,
  options: { collisions?: boolean } = {},
): PhysicsResult<PhysicsRuntime> {
  if (
    (!import.meta.env.DEV &&
      import.meta.env.VITE_ENABLE_TEACHER_PREVIEW !== "true") ||
    teacherOptIn !== true ||
    (typeof window !== "undefined" && window.self !== window.top)
  )
    return blocked(
      "Experimental preview requires a top-level teacher workspace, a teacher-enabled build and explicit opt-in.",
    );
  const v = validateScene(input);
  if (!v.ok)
    return blocked(
      "Invalid authored scene. Correct the scene before previewing.",
    );
  const scene = v.scene;
  // Explicit teacher UI choice, never an authored profile/qualification flag.
  const collisions = options.collisions === true;
  const duration = collisions ? 30 : 5;
  if (
    (!collisions && scene.forces.length) ||
    (!collisions && scene.constraints.length) ||
    scene.measurements.length ||
    scene.studentPolicy.controls.length ||
    scene.bodies.some(
      (b) =>
        (!collisions && b.shape.type === "polygon") ||
        (collisions
          ? Math.abs(b.angularVelocity) > 20
          : b.angularVelocity !== 0),
    ) ||
    Math.hypot(scene.world.gravity.x, scene.world.gravity.y) > 20 ||
    scene.bodies.some((b) => Math.hypot(b.velocity.x, b.velocity.y) > 20)
  )
    return blocked(
      "Free-flight supports circles/rectangles; experimental collisions also support validated centred convex polygons. Gravity ≤20 m/s², initial speed ≤20 m/s and, in collision mode, initial spin ≤20 rad/s. Forces require experimental collision mode. Only experimental hinges, rods and ropes are available; student controls remain unavailable.",
    );
  const made =
    collisions && scene.constraints.length
      ? constructExperimentalMechanismRuntime(scene)
      : constructSteppingRuntime(scene);
  if (!made.ok) return made;
  const runtime = made.value;
  let disposed = false;
  const first = runtime.snapshot();
  if (!first.ok || (!collisions && possibleContact(scene, first.value))) {
    runtime.dispose();
    return blocked(
      "Objects are too close for a collision-free preview. Move them apart.",
    );
  }
  const preview: PhysicsRuntime = {
    snapshot: () =>
      disposed
        ? blocked("Preview ended. Reset to reconstruct initial conditions.")
        : runtime.snapshot(),
    step(inputs) {
      if (disposed)
        return blocked(
          "Preview ended. Reset to reconstruct initial conditions.",
        );
      if (!Array.isArray(inputs) || inputs.length)
        return blocked("Live forces are unavailable in the teacher preview.");
      const frame = runtime.snapshot();
      if (!frame.ok) {
        this.dispose();
        return frame;
      }
      if (
        frame.value.timeSeconds >= duration ||
        (!collisions && possibleContact(scene, frame.value))
      ) {
        this.dispose();
        return blocked(
          frame.value.timeSeconds >= duration
            ? `${duration}-second experimental preview limit reached.`
            : "Stopped before possible contact. Collision simulation is not qualified.",
        );
      }
      const next = runtime.step([]);
      if (!next.ok) this.dispose();
      return next;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      runtime.dispose();
    },
  };
  return { ok: true, value: Object.freeze(preview) };
}
