/** Separate teacher-only admission. Never changes the certified capability policy. */
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
      "Experimental teacher previews support at most 20 joints.",
    );
  scene.constraints.forEach((c, i) => {
    const p = `/constraints/${i}`;
    if (c.type === "spring") {
      fail(p, "Springs are not implemented in this preview.");
      return;
    }
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
  return freezeJson({
    ...base,
    policyCompatible: base.policyCompatible && !extra.length,
    executionReady: false as const,
    diagnostics: [...extra, ...base.diagnostics].slice(0, 100),
  });
}
