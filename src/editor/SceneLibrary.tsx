import { useEffect, useRef, useState } from "react";
import type { SceneDocument } from "../domain/scene";
import type {
  LocalSceneRepository,
  SavedSceneEntry,
} from "../persistence/local-scenes";
import { validateDraft } from "./scene-commands";
interface Props {
  repository: LocalSceneRepository;
  onClose: () => void;
  onOpen: (scene: SceneDocument) => boolean;
  onRename: (scene: SceneDocument, oldHead: string) => void;
  onDelete: (id: string) => void;
}
export function SceneLibrary({
  repository,
  onClose,
  onOpen,
  onRename,
  onDelete,
}: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [items, setItems] = useState<SavedSceneEntry[]>([]),
    [busy, setBusy] = useState(true),
    [error, setError] = useState("");
  const [renaming, setRenaming] = useState<string | null>(null),
    [title, setTitle] = useState(""),
    [deleting, setDeleting] = useState<string | null>(null);
  useEffect(() => {
    const node = dialog.current!;
    node.showModal();
    let active = true;
    repository
      .list()
      .then((rows) => {
        if (active) setItems(rows);
      })
      .catch((e) => {
        if (active)
          setError(
            e instanceof Error ? e.message : "Could not read local scenes.",
          );
      })
      .finally(() => {
        if (active) setBusy(false);
      });
    return () => {
      active = false;
      node.close();
    };
  }, [repository]);
  async function perform(task: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await task();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Local operation failed. Your draft is unchanged.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function refresh() {
    setItems(await repository.list());
  }
  return (
    <dialog
      ref={dialog}
      className="library-dialog"
      aria-labelledby="library-title"
      aria-busy={busy}
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onClose();
      }}
    >
      <div className="library-header">
        <div>
          <p className="eyebrow">ON THIS BROWSER ONLY</p>
          <h2 id="library-title">Saved scenes</h2>
        </div>
        <button aria-label="Close library" disabled={busy} onClick={onClose}>
          ✕
        </button>
      </div>
      <p className="library-help">
        Local saves stay on this device and origin. Export JSON for a portable
        backup.
      </p>
      {error && (
        <p role="alert" className="document-message error">
          {error}
        </p>
      )}
      <button disabled={busy} onClick={() => void perform(refresh)}>
        Refresh library
      </button>
      {!items.length && !busy && !error && (
        <p className="library-empty">
          No saved scenes yet. Close the library and choose Save locally.
        </p>
      )}
      <ul className="library-list">
        {items.map((item) => (
          <li key={item.simulationId}>
            <div className="library-scene-title">
              <strong>{item.title}</strong>
              <small>{new Date(item.updatedAt).toLocaleString()}</small>
            </div>
            {renaming === item.simulationId ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void perform(async () => {
                    const saved = await repository.rename(
                      item.simulationId,
                      item.headRevisionId,
                      title,
                    );
                    onRename(saved, item.headRevisionId);
                    setRenaming(null);
                    await refresh();
                  });
                }}
              >
                <label>
                  New scene name
                  <input
                    aria-label="New scene name"
                    maxLength={200}
                    value={title}
                    disabled={busy}
                    onChange={(e) => setTitle(e.target.value)}
                    autoFocus
                  />
                </label>
                <div className="library-actions">
                  <button disabled={busy || !title.trim()} type="submit">
                    Save name
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setRenaming(null)}
                  >
                    Cancel rename
                  </button>
                </div>
              </form>
            ) : deleting === item.simulationId ? (
              <div className="delete-confirm">
                <p>
                  Delete “{item.title}” and all its local revisions? An open
                  draft stays in the editor.
                </p>
                <button
                  disabled={busy}
                  onClick={() =>
                    void perform(async () => {
                      await repository.remove(
                        item.simulationId,
                        item.headRevisionId,
                      );
                      onDelete(item.simulationId);
                      setDeleting(null);
                      await refresh();
                    })
                  }
                >
                  Confirm delete
                </button>
                <button disabled={busy} onClick={() => setDeleting(null)}>
                  Cancel delete
                </button>
              </div>
            ) : (
              <div className="library-actions">
                <button
                  disabled={busy}
                  onClick={() =>
                    void perform(async () => {
                      const saved = await repository.load(item.simulationId),
                        v = validateDraft(saved);
                      if (!v.ok) throw Error(v.message);
                      if (onOpen(v.scene)) onClose();
                    })
                  }
                >
                  Open
                </button>
                <button
                  disabled={busy}
                  onClick={() => {
                    setRenaming(item.simulationId);
                    setTitle(item.title);
                    setDeleting(null);
                  }}
                >
                  Rename
                </button>
                <button
                  disabled={busy}
                  onClick={() => {
                    setDeleting(item.simulationId);
                    setRenaming(null);
                  }}
                >
                  Delete
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </dialog>
  );
}
