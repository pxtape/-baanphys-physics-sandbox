/** Separate experimental sandbox admission. Never changes the certified capability policy. */
import { springLoads } from "./springs";
import { physicalProperties } from "./physical-properties";
import { PLANCK_SETTINGS } from "./profile";
import { CAPABILITY_LIMITS as L } from "./limits";
import type { SceneDocument } from "../domain/scene";
import { freezeJson } from "../domain/scene";
import { anchorPosition } from "../domain/anchors";
import { validateScene } from "../schema";
import { checkPlanckCapabilities } from "./capabilities";
import type { CapabilityPolicyReport } from "./capabilities";
import type { PhysicsDiagnostic } from "./contracts";
import { physicsDiagnostic } from "./profile";
export function checkExperimentalScene(
  input: SceneDocument,
): CapabilityPolicyReport {
  const parsed = validateScene(input);
  if (!parsed.ok) return checkPlanckCapabilities(input);
  const scene = parsed.scene,
    base = checkPlanckCapabilities({ ...scene, constraints: [] }),
    extra: PhysicsDiagnostic[] = [];
  const fail = (path: string, message: string) =>
    extra.push(
      physicsDiagnostic(
        "CAPABILITY_FEATURE_UNSUPPORTED",
        path,
        message,
        "Edit the experimental mechanism. No approximation or automatic repair is performed.",
      ),
    );
  if (scene.constraints.length > 20)
    fail(
      "/constraints",
      "Experimental previews support at most 20 constraints.",
    );
  scene.constraints.forEach((c, i) => {
    const p = `/constraints/${i}`;
    for (const [name, a] of [
      ["anchorA", c.anchorA],
      ["anchorB", c.anchorB],
    ] as const) {
      const v = a.type === "world" ? a.point : a.localPoint;
      if (Math.hypot(v.x, v.y) > (a.type === "world" ? 100 : 50))
        fail(
          `${p}/${name}`,
          "Anchor exceeds provisional experimental limits (100 m world / 50 m local).",
        );
    }
    const a = anchorPosition(scene, c.anchorA),
      b = anchorPosition(scene, c.anchorB),
      distance = Math.hypot(a.x - b.x, a.y - b.y);
    if (
      c.type === "spring" &&
      (distance < Math.max(1e-6, 0.1 * c.restLength) ||
        c.restLength < 0.05 ||
        c.restLength > 50 ||
        c.springConstant > 1000 ||
        c.dampingCoefficient > 100)
    )
      fail(
        p,
        "Experimental springs require separation ≥10% of rest length, rest length 0.05–50 m, k ≤1000 N/m and c ≤100 N·s/m.",
      );
    if (c.type === "hinge" && distance > 1e-8)
      fail(
        p,
        "Hinge anchor points must coincide initially; move the pivot or body together.",
      );
    if (c.type === "rod" || c.type === "rope") {
      const length = c.type === "rod" ? c.length : c.maxLength;
      if (length < 0.05 || length > 50)
        fail(p, "Experimental rod/rope length must be 0.05–50 m.");
      if (c.type === "rod" && Math.abs(distance - length) > 0.005)
        fail(p, "Rod anchors must initially match the authored length.");
      if (c.type === "rope" && distance > length + 0.005)
        fail(p, "Rope starts stretched beyond its maximum length.");
    }
  });
  // Conservative provisional stability restriction, not a qualification tolerance.
  let stiffness = 0,
    damping = 0;
  for (const c of scene.constraints) {
    if (c.type !== "spring") continue;
    let inverse = 0;
    for (const anchor of [c.anchorA, c.anchorB]) {
      if (anchor.type !== "body") continue;
      const b = scene.bodies.find(
        (b) => b.id.toLowerCase() === anchor.bodyId.toLowerCase(),
      )!;
      if (b.motionType === "static") continue;
      const p = physicalProperties(b);
      if (!p.ok) continue;
      inverse +=
        1 / p.value.mass +
        (anchor.localPoint.x ** 2 + anchor.localPoint.y ** 2) / p.value.inertia;
    }
    stiffness += c.springConstant * inverse;
    damping += c.dampingCoefficient * inverse;
  }
  const h = PLANCK_SETTINGS.timestepSeconds / PLANCK_SETTINGS.substeps;
  if (
    !Number.isFinite(stiffness) ||
    !Number.isFinite(damping) ||
    h * Math.sqrt(20 * stiffness) > 0.25 ||
    2 * h * damping > 0.25
  )
    fail(
      "/constraints",
      "Spring network is too stiff or strongly damped for the fixed timestep. Reduce k/c, shorten local levers or increase mass; no settings are retuned.",
    );
  const initial = springLoads(scene, scene.bodies);
  if (!initial.ok) fail("/constraints", initial.message);
  else if (scene.constraints.some((c) => c.type === "spring")) {
    for (const b of scene.bodies) {
      if (b.motionType === "static") continue;
      const p = physicalProperties(b);
      if (!p.ok) continue;
      let f = 0,
        t = 0;
      for (const load of [...scene.forces, ...initial.loads].filter(
        (l) => l.bodyId.toLowerCase() === b.id.toLowerCase(),
      )) {
        const magnitude = Math.hypot(load.vector.x, load.vector.y);
        f += magnitude;
        t += magnitude * Math.hypot(load.localPoint.x, load.localPoint.y);
      }
      if (
        ![f, t].every(Number.isFinite) ||
        f > L.maxAggregateForce ||
        t > L.maxTorque ||
        Math.hypot(scene.world.gravity.x, scene.world.gravity.y) +
          f / p.value.mass >
          L.maxAcceleration ||
        t / p.value.inertia > L.maxAngularAcceleration
      )
        fail(
          "/constraints",
          "Initial spring + saved loads exceed aggregate force/torque/acceleration bounds. Reduce extension, stiffness or applied force.",
        );
    }
  }
  return freezeJson({
    ...base,
    policyCompatible: base.policyCompatible && !extra.length,
    executionReady: false as const,
    diagnostics: [...extra, ...base.diagnostics].slice(0, 100),
  });
}
