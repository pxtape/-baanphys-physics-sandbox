import type { SceneDocument } from "../domain/scene";
import type { SceneV1 } from "../domain/scene-v1.generated";
import { parseSceneJson, validateScene } from "../schema";
import { INPUT_LIMITS } from "../schema/input";
import { validateDraft } from "./scene-commands";

export async function importSceneFile(
  file: Pick<File, "size" | "text">,
): Promise<SceneDocument> {
  if (file.size > INPUT_LIMITS.bytes)
    throw Error(
      "Scene file exceeds the 2 MiB limit. The current draft is unchanged.",
    );
  let text: string;
  try {
    text = await file.text();
  } catch {
    throw Error("The selected file could not be read. Try a local JSON file.");
  }
  const parsed = parseSceneJson(text);
  if (!parsed.ok)
    throw Error(
      `Invalid Scene JSON: ${parsed.diagnostics[0]!.message} (${parsed.diagnostics[0]!.path || "/"})`,
    );
  // Import is explicitly a new local copy; preserve every entity/reference ID,
  // but never impersonate or overwrite the imported simulation's saved identity.
  const draft = structuredClone(parsed.scene) as SceneV1;
  draft.identity = { state: "draft" };
  const admitted = validateDraft(draft);
  if (!admitted.ok) throw Error(admitted.message);
  return admitted.scene;
}
export function exportSceneJson(scene: SceneDocument, dirty: boolean): string {
  const draft = structuredClone(scene) as SceneV1;
  if (dirty) draft.identity = { state: "draft" }; // Unsaved edits are not an immutable saved revision.
  const v = validateScene(draft);
  if (!v.ok)
    throw Error(`Cannot export invalid scene: ${v.diagnostics[0]!.message}`);
  return JSON.stringify(v.scene, null, 2) + "\n";
}
export function downloadScene(scene: SceneDocument, dirty: boolean) {
  const url = URL.createObjectURL(
    new Blob([exportSceneJson(scene, dirty)], { type: "application/json" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `${scene.title.replace(/[^a-z0-9_-]+/giu, "-").replace(/^-+|-+$/gu, "") || "physics-scene"}.scene.json`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
