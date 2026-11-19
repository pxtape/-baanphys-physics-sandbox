import { afterEach, expect, it, vi } from "vitest";
import { World } from "planck";
import example from "../../../examples/falling-ball.scene.json";
import type { SceneV1 } from "../../domain/scene-v1.generated";
import { anchorPosition } from "../../domain/anchors";
import {
  PLANCK_SETTINGS,
  PLANCK_IDENTITY,
  planckAdapterContract,
} from "../index";
import {
  constructExperimentalMechanismRuntime,
  constructSteppingRuntime,
} from "./planck-construction";
import type { InternalRuntime } from "../runtime-contract";
const sessions: InternalRuntime[] = [];
afterEach(() => {
  sessions.splice(0).forEach((s) => s.dispose());
  vi.restoreAllMocks();
});
function scene(type: "hinge" | "rod" | "rope") {
  const s = structuredClone(example) as SceneV1;
  s.identity = { state: "draft" };
  Object.assign(s.simulation, structuredClone(PLANCK_SETTINGS));
  s.simulation.engine = { ...PLANCK_IDENTITY };
  s.bodies = [s.bodies[0]!];
  const b = s.bodies[0]!;
  b.material = { friction: 0, staticFriction: 0, restitution: 0 };
  b.angle = type === "hinge" ? 0.4 : 0;
  b.shape =
    type === "hinge"
      ? { type: "rectangle", width: 0.3, height: 2 }
      : { type: "circle", radius: 0.2 };
  b.position = {
    x: Math.sin(0.4) * (type === "hinge" ? 1 : 2),
    y: 5 - Math.cos(0.4) * (type === "hinge" ? 1 : 2),
  };
  const base = {
    id: "00000000-0000-4000-8000-000000000010",
    name: type,
    anchorA: {
      type: "body" as const,
      bodyId: b.id,
      localPoint: { x: 0, y: type === "hinge" ? 1 : 0 },
    },
    anchorB: { type: "world" as const, point: { x: 0, y: 5 } },
    collideConnected: false,
  };
  s.constraints = [
    type === "hinge"
      ? { ...base, type }
      : type === "rod"
        ? { ...base, type, length: 2 }
        : { ...base, type, maxLength: 2 },
  ];
  return s;
}
it.each(["hinge", "rod", "rope"] as const)(
  "native experimental %s moves a constrained body with isolated immutable snapshots",
  (type) => {
    const s = scene(type),
      original = JSON.stringify(s),
      made = constructExperimentalMechanismRuntime(s);
    if (!made.ok) throw Error(made.diagnostics[0]!.message);
    sessions.push(made.value);
    const initial = made.value.snapshot();
    if (!initial.ok) throw Error("snapshot");
    let last = initial.value;
    for (let i = 0; i < 240; i++) {
      const r = made.value.step([]);
      if (!r.ok) throw Error(r.diagnostics[0]!.message);
      last = r.value;
    }
    expect(last.bodies).toHaveLength(1);
    expect(
      Math.abs(last.bodies[0]!.position.x - s.bodies[0]!.position.x),
    ).toBeGreaterThan(0.05);
    const a = anchorPosition(
      s,
      s.constraints[0]!.anchorA,
      new Map(last.bodies.map((b) => [b.id, b])),
    );
    const b = anchorPosition(s, s.constraints[0]!.anchorB);
    expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeLessThan(
      type === "hinge" ? 0.03 : 2.05,
    );
    expect(JSON.stringify(s)).toBe(original);
    expect(Object.isFrozen(last.bodies)).toBe(true);
    // Functional smoke, not B4/rope numerical certification.
  },
);
it("native rope allows initial slack/free fall rather than substituting a bilateral rod", () => {
  const s = scene("rope");
  s.bodies[0]!.position = { x: 0, y: 4 };
  const made = constructExperimentalMechanismRuntime(s);
  if (!made.ok) throw Error(made.diagnostics[0]!.message);
  sessions.push(made.value);
  const first = made.value.step([]);
  if (!first.ok) throw Error(first.diagnostics[0]!.message);
  expect(first.value.bodies[0]!.position.y).toBeLessThan(4);
  expect(first.value.bodies[0]!.position.y).toBeGreaterThan(3.99);
});
it("certified construction still rejects joints before native allocation", () => {
  const s = scene("hinge"),
    create = vi.spyOn(World.prototype, "createBody");
  expect(constructSteppingRuntime(s).ok).toBe(false);
  expect(create).not.toHaveBeenCalled();
  expect(planckAdapterContract.capabilities(s).executionReady).toBe(false);
  expect(planckAdapterContract.initialize(s).ok).toBe(false);
});
it("joint-construction failure destroys all partially allocated native bodies", () => {
  const worlds: World[] = [];
  const original = World.prototype.createBody;
  vi.spyOn(World.prototype, "createBody").mockImplementation(function (
    this: World,
    ...args: Parameters<World["createBody"]>
  ) {
    worlds.push(this);
    return original.apply(this, args);
  } as World["createBody"]);
  vi.spyOn(World.prototype, "createJoint").mockImplementationOnce(() => {
    throw Error("injected joint failure");
  });
  expect(constructExperimentalMechanismRuntime(scene("rod")).ok).toBe(false);
  expect(worlds.at(-1)?.getBodyCount()).toBe(0);
  expect(worlds.at(-1)?.getJointCount()).toBe(0);
});
