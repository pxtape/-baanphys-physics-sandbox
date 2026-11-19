import { afterEach, expect, it, vi } from "vitest";
import { World } from "planck";
import example from "../../../examples/falling-ball.scene.json";
import type { SceneV1 } from "../../domain/scene-v1.generated";
import { createTeacherPreview } from "../teacher-preview";
import {
  PLANCK_IDENTITY,
  PLANCK_SETTINGS,
  planckAdapterContract,
} from "../index";
import type { PhysicsRuntime } from "../contracts";
const sessions: PhysicsRuntime[] = [];
afterEach(() => {
  sessions.splice(0).forEach((s) => s.dispose());
  vi.restoreAllMocks();
});
function scene() {
  const s = structuredClone(example) as SceneV1;
  s.identity = { state: "draft" };
  Object.assign(s.simulation, structuredClone(PLANCK_SETTINGS));
  s.simulation.engine = { ...PLANCK_IDENTITY };
  s.bodies.forEach((b) => {
    b.material = { friction: 0, staticFriction: 0, restitution: 0 };
  });
  return s;
}
function open(s: SceneV1) {
  const r = createTeacherPreview(s, true, { collisions: true });
  if (!r.ok) throw Error(r.diagnostics[0]!.message);
  sessions.push(r.value);
  return r.value;
}
function step(runtime: PhysicsRuntime) {
  const r = runtime.step([]);
  if (!r.ok) throw Error(r.diagnostics[0]!.message);
  return r.value;
}
it("opted-in collision mode uses native contacts to bounce without enabling the public adapter", () => {
  const s = scene(),
    id = s.bodies[0]!.id;
  s.bodies[0]!.position = { x: 0, y: 1 };
  s.bodies[0]!.material.restitution = 0.8;
  const source = JSON.stringify(s),
    r = open(s),
    native = vi.spyOn(World.prototype, "step");
  let descending = false,
    bounced = false;
  for (let i = 0; i < 180; i++) {
    const b = step(r).bodies.find((b) => b.id === id)!;
    if (b.velocity.y < -1) descending = true;
    if (descending && b.velocity.y > 1) bounced = true;
  }
  expect(bounced).toBe(true);
  expect(native).toHaveBeenCalledTimes(720);
  expect(native.mock.calls[0]).toEqual([1 / 480, 12, 12]);
  expect(JSON.stringify(s)).toBe(source);
  expect(planckAdapterContract.capabilities(s).executionReady).toBe(false);
  expect(planckAdapterContract.initialize(s).ok).toBe(false);
});
it("equal-mass bodies exchange motion through actual solver contacts", () => {
  const s = scene(),
    a = s.bodies[0]!;
  s.world.gravity = { x: 0, y: 0 };
  a.position = { x: -1, y: 2 };
  a.velocity = { x: 2, y: 0 };
  a.material.restitution = 1;
  const b = structuredClone(a);
  b.id = "00000000-0000-4000-8000-000000000002";
  b.position.x = 1;
  b.velocity.x = 0;
  s.bodies = [a, b];
  const r = open(s);
  let final = step(r);
  for (let i = 1; i < 180; i++) final = step(r);
  expect(
    Math.abs(final.bodies.find((x) => x.id === a.id)!.velocity.x),
  ).toBeLessThan(0.01);
  expect(final.bodies.find((x) => x.id === b.id)!.velocity.x).toBeGreaterThan(
    1.9,
  );
  // Functional contact regression only; original B3 penetration qualification is unchanged.
});
it("contact friction slows a sliding rectangle compared with a frictionless surface", () => {
  const speeds = [0, 0.6].map((mu) => {
    const s = scene(),
      a = s.bodies[0]!;
    a.shape = { type: "rectangle", width: 1, height: 0.6 };
    a.position = { x: -2, y: 0.31 };
    a.velocity = { x: 3, y: 0 };
    s.bodies.forEach((b) => {
      b.material = { friction: mu, staticFriction: mu, restitution: 0 };
    });
    const r = open(s);
    let final = step(r);
    for (let i = 1; i < 180; i++) final = step(r);
    return Math.abs(final.bodies.find((b) => b.id === a.id)!.velocity.x);
  });
  expect(speeds[0]).toBeGreaterThan(2.9);
  expect(speeds[1]).toBeLessThan(0.1);
});
it("experimental saved off-centre forces accelerate and rotate the body without changing authored conditions", () => {
  const s = scene(),
    a = s.bodies[0]!;
  s.world.gravity = { x: 0, y: 0 };
  a.shape = { type: "rectangle", width: 2, height: 1 };
  a.massModel = { mode: "mass", mass: 2 };
  a.position = { x: 0, y: 3 };
  s.forces = [
    {
      id: "00000000-0000-4000-8000-000000000010",
      type: "constantForce",
      bodyId: a.id,
      vector: { x: 0, y: 2 },
      localPoint: { x: 0.5, y: 0 },
    },
  ];
  const original = JSON.stringify(s),
    r = open(s);
  let frame = step(r);
  for (let i = 1; i < 120; i++) frame = step(r);
  const b = frame.bodies.find((b) => b.id === a.id)!;
  expect(b.position.y).toBeGreaterThan(3.4);
  expect(b.angularVelocity).toBeGreaterThan(0.9);
  expect(JSON.stringify(s)).toBe(original);
});
