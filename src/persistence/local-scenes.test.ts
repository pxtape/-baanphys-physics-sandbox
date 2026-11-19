import { afterEach, expect, it, vi } from "vitest";
import { IDBFactory, IDBObjectStore } from "fake-indexeddb";
import example from "../../examples/falling-ball.scene.json";
import type { SceneV1 } from "../domain/scene-v1.generated";
import type { SceneDocument } from "../domain/scene";
import { LocalSceneRepository } from "./local-scenes";
const name = "test-scenes";
function draft() {
  const d = structuredClone(example) as SceneV1;
  d.identity = { state: "draft" };
  return d;
}
function changed(s: SceneDocument, x: number) {
  const d = structuredClone(s) as SceneV1;
  d.bodies[0]!.position.x = x;
  return d;
}
function identity(s: SceneDocument) {
  if (s.identity.state !== "saved") throw Error("Expected saved identity");
  return s.identity;
}
async function database(factory: IDBFactory) {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const r = factory.open(name, 1);
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}
async function countRevisions(factory: IDBFactory) {
  const db = await database(factory);
  try {
    return await new Promise<number>((resolve, reject) => {
      const r = db
        .transaction("revisions", "readonly")
        .objectStore("revisions")
        .count();
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
  } finally {
    db.close();
  }
}
afterEach(() => vi.restoreAllMocks());
it("saves immutable authored Scene v1 snapshots and reopens across repository instances with stable object IDs", async () => {
  const factory = new IDBFactory(),
    repo = new LocalSceneRepository(factory, name),
    source = draft(),
    text = JSON.stringify(source);
  const saved = await repo.save(source),
    id = identity(saved);
  expect(id.revisionNumber).toBe(1);
  expect(id.parentRevisionId).toBe(null);
  expect(id.simulationId).not.toBe(id.revisionId);
  expect(JSON.stringify(source)).toBe(text);
  expect(saved.bodies).toEqual(source.bodies);
  const reopened = await new LocalSceneRepository(factory, name).load(
    id.simulationId,
  );
  expect(reopened).toEqual(saved);
  expect(reopened).not.toBe(saved);
  expect(Object.isFrozen(reopened.bodies[0])).toBe(true);
});
it("creates a new revision on rename and retains the original immutable revision", async () => {
  const repo = new LocalSceneRepository(new IDBFactory(), name),
    first = await repo.save(draft()),
    a = identity(first);
  const next = await repo.rename(
      a.simulationId,
      a.revisionId,
      "  Renamed lab  ",
    ),
    b = identity(next);
  expect(b.revisionNumber).toBe(2);
  expect(b.parentRevisionId).toBe(a.revisionId);
  expect(b.createdAt).toBe(a.createdAt);
  expect(next.bodies).toEqual(first.bodies);
  expect(next.title).toBe("Renamed lab");
  expect((await repo.load(a.simulationId, a.revisionId)).title).toBe(
    first.title,
  );
  expect((await repo.list())[0]!.title).toBe("Renamed lab");
});
it("serializes competing saves so exactly one stale-tab write succeeds", async () => {
  const repo = new LocalSceneRepository(new IDBFactory(), name),
    first = await repo.save(draft());
  const outcomes = await Promise.allSettled([
    repo.save(changed(first, 1)),
    repo.save(changed(first, 2)),
  ]);
  expect(outcomes.filter((r) => r.status === "fulfilled")).toHaveLength(1);
  expect(outcomes.filter((r) => r.status === "rejected")).toHaveLength(1);
  const loser = outcomes.find((r) => r.status === "rejected");
  if (loser?.status === "rejected")
    expect(String(loser.reason)).toMatch(/newer revision/);
});
it("aborts both head and revision insertion when quota fails after the revision is queued", async () => {
  const factory = new IDBFactory(),
    repo = new LocalSceneRepository(factory, name),
    first = await repo.save(draft()),
    id = identity(first);
  vi.spyOn(IDBObjectStore.prototype, "put").mockImplementationOnce(() => {
    throw new DOMException("quota", "QuotaExceededError");
  });
  await expect(repo.save(changed(first, 9))).rejects.toThrow(/storage is full/);
  expect(await repo.load(id.simulationId)).toEqual(first);
  expect(await countRevisions(factory)).toBe(1);
});
it("checks expected head before deleting and atomically removes every revision", async () => {
  const factory = new IDBFactory(),
    repo = new LocalSceneRepository(factory, name),
    first = await repo.save(draft()),
    a = identity(first),
    next = await repo.save(changed(first, 2)),
    b = identity(next);
  await expect(repo.remove(a.simulationId, a.revisionId)).rejects.toThrow(
    /changed in another tab/,
  );
  expect(await countRevisions(factory)).toBe(2);
  await repo.remove(b.simulationId, b.revisionId);
  expect(await repo.list()).toEqual([]);
  expect(await countRevisions(factory)).toBe(0);
  await expect(repo.load(b.simulationId)).rejects.toThrow(/not found/);
});
it("reports unavailable storage and corrupt saved JSON without rewriting data", async () => {
  const bad = {
    open() {
      throw new DOMException("denied", "SecurityError");
    },
  } as unknown as IDBFactory;
  await expect(new LocalSceneRepository(bad).save(draft())).rejects.toThrow(
    /unavailable/,
  );
  const factory = new IDBFactory(),
    repo = new LocalSceneRepository(factory, name),
    saved = await repo.save(draft()),
    id = identity(saved),
    db = await database(factory);
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction("revisions", "readwrite");
    tx.objectStore("revisions").put({
      simulationId: id.simulationId,
      revisionId: id.revisionId,
      json: '{"schemaVersion":999}',
    });
    tx.oncomplete = () => resolve();
    tx.onabort = () => reject(tx.error);
  });
  db.close();
  await expect(repo.load(id.simulationId)).rejects.toThrow(/invalid/);
  expect((await repo.list())[0]!.headRevisionId).toBe(id.revisionId);
});
it("keeps repository timestamps ordered after a clock rollback", async () => {
  const repo = new LocalSceneRepository(new IDBFactory(), name),
    first = await repo.save(draft()),
    a = identity(first);
  vi.spyOn(Date, "now").mockReturnValue(Date.parse(a.savedAt) - 100000);
  const next = await repo.save(changed(first, 1));
  expect(Date.parse(identity(next).savedAt)).toBeGreaterThan(
    Date.parse(a.savedAt),
  );
});
