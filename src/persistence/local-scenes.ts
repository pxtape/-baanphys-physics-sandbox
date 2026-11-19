import type { SceneDocument } from "../domain/scene";
import type { SceneV1 } from "../domain/scene-v1.generated";
import { validateScene, parseSceneJson } from "../schema";

export interface SavedSceneEntry {
  simulationId: string;
  headRevisionId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}
interface Revision {
  simulationId: string;
  revisionId: string;
  json: string;
}
const DB_NAME = "baanphys-local-scenes-v1";
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu;
function uuid() {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6]! & 15) | 64;
  b[8] = (b[8]! & 63) | 128;
  const s = Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20)}`;
}
export class LocalSceneError extends Error {}
function failure(error: unknown): Error {
  if (error instanceof LocalSceneError) return error;
  const kind = error instanceof Error ? error.name : "";
  return new LocalSceneError(
    kind === "QuotaExceededError"
      ? "Browser storage is full. Your draft is still open; export JSON to keep a copy."
      : `Local storage is unavailable or the operation failed${kind ? ` (${kind})` : ""}. Your draft is unchanged; try again or export JSON.`,
  );
}
function entry(raw: unknown): SavedSceneEntry {
  if (!raw || typeof raw !== "object")
    throw new LocalSceneError(
      "Saved scene was not found. Your current draft is unchanged.",
    );
  const r = raw as Record<string, unknown>;
  if (
    typeof r.simulationId !== "string" ||
    !uuidPattern.test(r.simulationId) ||
    typeof r.headRevisionId !== "string" ||
    !uuidPattern.test(r.headRevisionId) ||
    typeof r.title !== "string" ||
    !r.title.length ||
    [...r.title].length > 200 ||
    typeof r.createdAt !== "string" ||
    !Number.isFinite(Date.parse(r.createdAt)) ||
    typeof r.updatedAt !== "string" ||
    !Number.isFinite(Date.parse(r.updatedAt))
  )
    throw new LocalSceneError(
      "The local library contains invalid metadata. No data was overwritten.",
    );
  return r as unknown as SavedSceneEntry;
}
function document(
  raw: unknown,
  simulationId: string,
  revisionId: string,
): SceneDocument {
  if (
    !raw ||
    typeof raw !== "object" ||
    typeof (raw as Revision).json !== "string"
  )
    throw new LocalSceneError(
      "Saved scene data is missing or damaged. Your current draft is unchanged.",
    );
  const r = raw as Revision,
    v = parseSceneJson(r.json);
  if (!v.ok)
    throw new LocalSceneError(
      `Saved scene is invalid: ${v.diagnostics[0]!.message}`,
    );
  const id = v.scene.identity;
  if (
    r.simulationId !== simulationId ||
    r.revisionId !== revisionId ||
    id.state !== "saved" ||
    id.simulationId !== simulationId ||
    id.revisionId !== revisionId
  )
    throw new LocalSceneError(
      "Saved scene identity does not match the local revision. No data was overwritten.",
    );
  return v.scene;
}
/** Local-only repository. Scene v1 JSON is the only scene representation.
 * Every operation closes its connection. Head checks + immutable revision inserts
 * share one read/write transaction; success is reported only after commit.
 */
export class LocalSceneRepository {
  constructor(
    private readonly factory?: IDBFactory,
    private readonly name = DB_NAME,
    private readonly newId: () => string = uuid,
  ) {}
  private open(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      let settled = false;
      const timer = setTimeout(() => {
        settled = true;
        reject(
          new LocalSceneError(
            "Opening local storage timed out. Close other tabs and retry; export your draft as a backup.",
          ),
        );
      }, 5000);
      try {
        const factory = this.factory ?? globalThis.indexedDB;
        if (!factory) throw new Error("IndexedDB unavailable");
        const r = factory.open(this.name, 1);
        r.onupgradeneeded = () => {
          const db = r.result;
          db.createObjectStore("simulations", { keyPath: "simulationId" });
          db.createObjectStore("revisions", {
            keyPath: ["simulationId", "revisionId"],
          }).createIndex("simulationId", "simulationId");
        };
        r.onblocked = () => {
          clearTimeout(timer);
          settled = true;
          reject(
            new LocalSceneError(
              "Local storage is blocked by another tab. Close it and retry, or export JSON.",
            ),
          );
        };
        r.onerror = () => {
          clearTimeout(timer);
          settled = true;
          reject(failure(r.error));
        };
        r.onsuccess = () => {
          clearTimeout(timer);
          if (settled) {
            r.result.close();
            return;
          }
          settled = true;
          r.result.onversionchange = () => r.result.close();
          resolve(r.result);
        };
      } catch (e) {
        clearTimeout(timer);
        reject(failure(e));
      }
    });
  }
  private async transaction<T>(
    mode: IDBTransactionMode,
    work: (
      tx: IDBTransaction,
      set: (value: T) => void,
      read: <V>(r: IDBRequest<V>, next: (value: V) => void) => void,
    ) => void,
  ): Promise<T> {
    const db = await this.open();
    try {
      return await new Promise<T>((resolve, reject) => {
        const tx = db.transaction(["simulations", "revisions"], mode);
        let value: T;
        let cause: unknown;
        const abort = (e: unknown) => {
          cause = e;
          try {
            tx.abort();
          } catch {
            reject(failure(e));
          }
        };
        const read = <V>(r: IDBRequest<V>, next: (v: V) => void) => {
          r.onsuccess = () => {
            try {
              next(r.result);
            } catch (e) {
              abort(e);
            }
          };
        };
        tx.oncomplete = () => resolve(value);
        tx.onabort = () => reject(failure(cause ?? tx.error));
        try {
          work(
            tx,
            (v) => {
              value = v;
            },
            read,
          );
        } catch (e) {
          abort(e);
        }
      });
    } catch (e) {
      throw failure(e);
    } finally {
      db.close();
    }
  }
  list(): Promise<SavedSceneEntry[]> {
    return this.transaction("readonly", (tx, set, read) => {
      read(tx.objectStore("simulations").getAll(), (rows) =>
        set(
          (rows as unknown[])
            .map(entry)
            .sort(
              (a, b) =>
                b.updatedAt.localeCompare(a.updatedAt) ||
                a.simulationId.localeCompare(b.simulationId),
            ),
        ),
      );
    });
  }
  load(simulationId: string, revisionId?: string): Promise<SceneDocument> {
    return this.transaction("readonly", (tx, set, read) => {
      read(tx.objectStore("simulations").get(simulationId), (raw) => {
        const meta = entry(raw),
          head = revisionId ?? meta.headRevisionId;
        read(tx.objectStore("revisions").get([simulationId, head]), (value) => {
          const doc = document(value, simulationId, head);
          if (
            doc.identity.state !== "saved" ||
            doc.identity.createdAt !== meta.createdAt ||
            (!revisionId && doc.title !== meta.title)
          )
            throw new LocalSceneError(
              "Local scene metadata and document disagree. Your draft is unchanged.",
            );
          set(doc);
        });
      });
    });
  }
  async save(source: SceneDocument): Promise<SceneDocument> {
    const parsed = validateScene(source);
    if (!parsed.ok)
      throw new LocalSceneError(
        `Cannot save an invalid scene: ${parsed.diagnostics[0]!.message}`,
      );
    const scene = parsed.scene,
      id = scene.identity,
      simulationId = id.state === "saved" ? id.simulationId : this.newId(),
      revisionId = this.newId();
    return this.transaction("readwrite", (tx, set, read) => {
      const simulations = tx.objectStore("simulations"),
        revisions = tx.objectStore("revisions");
      read(simulations.get(simulationId), (raw) => {
        const commit = (parent: SceneDocument | null) => {
          const previous = parent?.identity;
          if (previous && previous.state !== "saved")
            throw new LocalSceneError("Invalid saved revision.");
          // Repository timestamps are canonical milliseconds. +1 ms also keeps
          // ordering monotonic after a clock rollback, without rounding authored data.
          const now = new Date(
            Math.max(
              Date.now(),
              previous ? Date.parse(previous.savedAt) + 1 : 0,
            ),
          ).toISOString();
          const draft = structuredClone(scene) as SceneV1;
          draft.identity = {
            state: "saved",
            simulationId,
            revisionId,
            revisionNumber: previous ? previous.revisionNumber + 1 : 1,
            parentRevisionId: previous ? previous.revisionId : null,
            createdAt: previous ? previous.createdAt : now,
            savedAt: now,
          };
          const v = validateScene(draft);
          if (!v.ok)
            throw new LocalSceneError(
              `Cannot save scene: ${v.diagnostics[0]!.message}`,
            );
          revisions.add({
            simulationId,
            revisionId,
            json: JSON.stringify(v.scene),
          } satisfies Revision);
          const meta = {
            simulationId,
            headRevisionId: revisionId,
            title: v.scene.title,
            createdAt: draft.identity.createdAt,
            updatedAt: now,
          } satisfies SavedSceneEntry;
          if (parent) simulations.put(meta);
          else simulations.add(meta);
          set(v.scene);
        };
        if (id.state === "draft") {
          if (raw)
            throw new LocalSceneError(
              "Local identity collision. Nothing was overwritten; retry Save.",
            );
          commit(null);
        } else {
          const meta = entry(raw);
          if (meta.headRevisionId !== id.revisionId)
            throw new LocalSceneError(
              "A newer revision exists in another tab. Export your draft before reopening the saved scene; nothing was overwritten.",
            );
          read(revisions.get([simulationId, id.revisionId]), (rawParent) =>
            commit(document(rawParent, simulationId, id.revisionId)),
          );
        }
      });
    });
  }
  async rename(
    simulationId: string,
    expectedHead: string,
    title: string,
  ): Promise<SceneDocument> {
    const scene = await this.load(simulationId, expectedHead),
      draft = structuredClone(scene) as SceneV1;
    draft.title = title.trim();
    return this.save(draft);
  }
  remove(simulationId: string, expectedHead: string): Promise<void> {
    return this.transaction("readwrite", (tx, set, read) => {
      const revisions = tx.objectStore("revisions");
      read(tx.objectStore("simulations").get(simulationId), (raw) => {
        if (entry(raw).headRevisionId !== expectedHead)
          throw new LocalSceneError(
            "This saved scene changed in another tab. Refresh the library before deleting it.",
          );
        tx.objectStore("simulations").delete(simulationId);
        const cursor = revisions
          .index("simulationId")
          .openKeyCursor(simulationId);
        read(cursor, (current) => {
          if (current) {
            revisions.delete(current.primaryKey);
            current.continue();
          }
        });
        set(undefined);
      });
    });
  }
}
