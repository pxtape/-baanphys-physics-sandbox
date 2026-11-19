import { afterEach, expect, it, vi } from "vitest";
import { World } from "planck";
import { createTeacherPreview } from "../teacher-preview";
import example from "../../../examples/falling-ball.scene.json";
import type { SceneV1 } from "../../domain/scene-v1.generated";
import type { SceneDocument } from "../../domain/scene";
import { validateScene } from "../../schema";
import { PLANCK_IDENTITY, PLANCK_SETTINGS } from "../profile";
import { planckAdapterContract } from "../index";
import type { PhysicsRuntime } from "../contracts";
function newScene(
  preset: "free-fall" | "projectile" = "free-fall",
): SceneDocument {
  const s = structuredClone(example) as SceneV1;
  s.identity = { state: "draft" };
  Object.assign(s.simulation, structuredClone(PLANCK_SETTINGS));
  s.simulation.engine = { ...PLANCK_IDENTITY };
  s.bodies.forEach((b) => {
    b.material = { friction: 0, staticFriction: 0, restitution: 1 };
  });
  s.bodies[0]!.shape = { type: "circle", radius: 0.3 };
  if (preset === "projectile") {
    s.bodies[0]!.position = { x: -3, y: 2.5 };
    s.bodies[0]!.velocity = { x: 4, y: 5 };
  }
  const parsed = validateScene(s);
  if (!parsed.ok) throw Error(parsed.diagnostics[0]!.message);
  return parsed.scene;
}
function editScene(source: SceneDocument, edit: (s: SceneV1) => void) {
  const s = structuredClone(source) as SceneV1;
  edit(s);
  const v = validateScene(s);
  return v.ok
    ? { ok: true as const, scene: v.scene }
    : { ok: false as const, message: v.diagnostics[0]!.message };
}
const sessions: PhysicsRuntime[] = [];
afterEach(() => {
  sessions.splice(0).forEach((s) => s.dispose());
  vi.restoreAllMocks();
});
function open(scene = newScene()) {
  const r = createTeacherPreview(scene, true);
  if (!r.ok) throw Error(r.diagnostics[0]!.message);
  sessions.push(r.value);
  return r.value;
}
it("requires explicit teacher opt-in before allocation and keeps public execution blocked", () => {
  const source = newScene(),
    allocate = vi.spyOn(World.prototype, "createBody");
  expect(createTeacherPreview(source, false).ok).toBe(false);
  expect(allocate).not.toHaveBeenCalled();
  expect(planckAdapterContract.initialize(source).ok).toBe(false);
  expect(planckAdapterContract.capabilities(source).executionReady).toBe(false);
});
it.each(["free-fall", "projectile"] as const)(
  "%s preview advances fixed ticks with detached snapshots and immutable authored state",
  (preset) => {
    const source = newScene(preset),
      text = JSON.stringify(source),
      session = open(source),
      initial = session.snapshot();
    expect(initial.ok).toBe(true);
    const native = vi.spyOn(World.prototype, "step");
    const next = session.step([]);
    expect(next.ok).toBe(true);
    if (!next.ok) return;
    expect(next.value.tick).toBe(1);
    expect(next.value.timeSeconds).toBe(1 / 120);
    expect(native).toHaveBeenCalledTimes(4);
    native.mock.calls.forEach((args) =>
      expect(args).toEqual([1 / 480, 12, 12]),
    );
    expect(JSON.stringify(source)).toBe(text);
    expect(Object.isFrozen(next.value.bodies)).toBe(true);
    session.dispose();
    session.dispose();
    expect(session.step([]).ok).toBe(false);
  },
);
it("stops conservatively before contact, without executing another native step or modifying the last good snapshot", () => {
  const session = open(),
    native = vi.spyOn(World.prototype, "step");
  let previous = session.snapshot();
  let stopped = false;
  for (let i = 0; i < 240; i++) {
    const count = native.mock.calls.length,
      next = session.step([]);
    if (!next.ok) {
      expect(next.diagnostics[0]!.message).toMatch(/contact/);
      expect(native).toHaveBeenCalledTimes(count);
      stopped = true;
      break;
    }
    previous = next;
  }
  expect(stopped).toBe(true);
  expect(previous.ok).toBe(true);
  if (previous.ok) {
    expect(
      previous.value.bodies.find((b) => b.position.y > 0)!.position.y,
    ).toBeGreaterThan(0.3);
    expect(previous.value.timeSeconds).toBeGreaterThan(0.7);
  }
});
it("rejects overlapping authored objects before any native stepping", () => {
  const source = newScene(),
    edited = editScene(source, (s) => {
      s.bodies[0]!.position.y = 0;
    });
  expect(edited.ok).toBe(true);
  if (!edited.ok) return;
  const step = vi.spyOn(World.prototype, "step");
  expect(createTeacherPreview(edited.scene, true).ok).toBe(false);
  expect(step).not.toHaveBeenCalled();
});
it("rejects unsupported preview features and live forces instead of bypassing qualification", () => {
  const source = newScene(),
    edited = editScene(source, (s) => {
      s.bodies[0]!.angularVelocity = 1;
    });
  if (!edited.ok) throw Error(edited.message);
  const allocate = vi.spyOn(World.prototype, "createBody");
  expect(createTeacherPreview(edited.scene, true).ok).toBe(false);
  expect(allocate).not.toHaveBeenCalled();
  const session = open(source),
    before = session.snapshot();
  expect(
    session.step([
      {
        tick: 1,
        sequence: 0,
        kind: "apply-force",
        bodyId: source.bodies[0]!.id,
        vector: { x: 1, y: 0 },
        localPoint: { x: 0, y: 0 },
      },
    ]).ok,
  ).toBe(false);
  expect(session.snapshot()).toEqual(before);
});
it("guards a fast body crossing the floor within one logical tick", () => {
  const source = newScene(),
    edited = editScene(source, (s) => {
      s.bodies[0]!.position.y = 0.4;
      s.bodies[0]!.velocity.y = -20;
    });
  if (!edited.ok) throw Error(edited.message);
  const native = vi.spyOn(World.prototype, "step");
  expect(createTeacherPreview(edited.scene, true).ok).toBe(false);
  expect(native).not.toHaveBeenCalled();
});
