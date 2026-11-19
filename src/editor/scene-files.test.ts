import { expect, it, vi } from "vitest";
import { newScene } from "./scene-commands";
import { exportSceneJson, importSceneFile } from "./scene-files";
import { LocalSceneRepository } from "../persistence/local-scenes";
import { IDBFactory } from "fake-indexeddb";
const file = (text: string) => ({
  size: new TextEncoder().encode(text).length,
  text: async () => text,
});
it("round-trips physical properties and entity IDs, importing as a fresh draft copy without overwriting saved identity", async () => {
  const repo = new LocalSceneRepository(new IDBFactory()),
    saved = await repo.save(newScene()),
    raw = exportSceneJson(saved, false),
    imported = await importSceneFile(file(raw));
  expect(imported.bodies).toEqual(saved.bodies);
  expect(imported.world).toEqual(saved.world);
  expect(imported.simulation).toEqual(saved.simulation);
  expect(imported.identity).toEqual({ state: "draft" });
  const copy = await repo.save(imported);
  if (copy.identity.state !== "saved" || saved.identity.state !== "saved")
    throw Error("Expected saved");
  expect(copy.identity.simulationId).not.toBe(saved.identity.simulationId);
  expect(await repo.list()).toHaveLength(2);
  expect(JSON.parse(exportSceneJson(saved, true)).identity).toEqual({
    state: "draft",
  });
});
it("rejects invalid, duplicate-key and unsupported-feature files; oversized files are rejected before reading", async () => {
  for (const text of [
    "not json",
    '{"schemaVersion":1,"schemaVersion":1}',
    JSON.stringify({ ...newScene(), schemaVersion: 999 }),
  ])
    await expect(importSceneFile(file(text))).rejects.toThrow(
      /Invalid Scene JSON/,
    );
  const text = vi.fn(async () => "");
  await expect(
    importSceneFile({ size: 2 * 1024 * 1024 + 1, text }),
  ).rejects.toThrow(/2 MiB/);
  expect(text).not.toHaveBeenCalled();
  const scene = structuredClone(newScene());
  const unsupported = {
    ...scene,
    bodies: scene.bodies.map((b, i) =>
      i === 0 ? { ...b, angularVelocity: 1 } : b,
    ),
  };
  await expect(
    importSceneFile(file(JSON.stringify(unsupported))),
  ).rejects.toThrow(/without spin/);
});
