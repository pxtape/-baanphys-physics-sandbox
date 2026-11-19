import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SceneV1 } from "../domain/scene-v1.generated";
import type { PhysicsRuntime, SimulationSnapshot } from "../physics";
import { createTeacherPreview } from "../physics/teacher-preview";
import { newScene, editScene, makeBody } from "../editor/scene-commands";
import type { ObjectKind } from "../editor/scene-commands";
import { SceneLibrary } from "../editor/SceneLibrary";
import { downloadScene, importSceneFile } from "../editor/scene-files";
import { LocalSceneRepository } from "../persistence/local-scenes";
import type { SceneDocument } from "../domain/scene";
import { validateDraft } from "../editor/scene-commands";
import { SceneCanvas } from "../renderer/SceneCanvas";

function NumberField({
  label,
  value,
  unit,
  onCommit,
  disabled = false,
  step = 0.1,
}: {
  label: string;
  value: number;
  unit: string;
  onCommit: (n: number) => boolean;
  disabled?: boolean;
  step?: number;
}) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  return (
    <label className="number-field">
      <span>
        {label} <small>{unit}</small>
      </span>
      <input
        type="number"
        aria-label={label}
        step={step}
        disabled={disabled}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "Escape") {
            setDraft(String(value));
            e.currentTarget.blur();
          }
        }}
        onBlur={() => {
          if (draft === String(value)) return;
          const n = draft.trim() ? Number(draft) : NaN;
          if (!Number.isFinite(n) || !onCommit(n)) setDraft(String(value));
        }}
      />
    </label>
  );
}
const teacherEnabled =
  import.meta.env.DEV || import.meta.env.VITE_ENABLE_TEACHER_PREVIEW === "true";
const studentSurface =
  window.self !== window.top ||
  new URLSearchParams(window.location.search).get("mode") === "student" ||
  window.location.pathname.includes("/player");
export function App() {
  const [scene, setScene] = useState(() => newScene()),
    [selected, setSelected] = useState<string | null>(
      () => scene.bodies[0]!.id,
    );
  const [repository] = useState(() => new LocalSceneRepository());
  const [dirty, setDirty] = useState(true),
    [fileBusy, setFileBusy] = useState(false),
    [libraryOpen, setLibraryOpen] = useState(false);
  const [documentMessage, setDocumentMessage] = useState<{
    error: boolean;
    text: string;
  } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [frame, setFrame] = useState<SimulationSnapshot | null>(null),
    [mode, setMode] = useState<"edit" | "running" | "paused" | "stopped">(
      "edit",
    );
  const [optIn, setOptIn] = useState(false),
    [notice, setNotice] = useState("");
  const runtime = useRef<PhysicsRuntime | null>(null),
    locked = frame !== null || fileBusy;
  const body = scene.bodies.find((b) => b.id === selected),
    live = frame?.bodies.find((b) => b.id === selected);
  const poses = useMemo(
    () => new Map(frame?.bodies.map((b) => [b.id, b]) ?? []),
    [frame],
  );
  const stepOnce = useCallback(() => {
    const r = runtime.current?.step([]);
    if (!r) return false;
    if (!r.ok) {
      setMode("stopped");
      setNotice(r.diagnostics[0]!.message);
      return false;
    }
    setFrame(r.value);
    return true;
  }, []);
  useEffect(
    () => () => {
      runtime.current?.dispose();
    },
    [],
  );
  useEffect(() => {
    if (mode !== "running") return;
    let handle = 0,
      last = performance.now(),
      accumulator = 0;
    const animate = (now: number) => {
      const delta = (now - last) / 1000;
      last = now;
      if (delta > 0.25) {
        setMode("paused");
        setNotice(
          "Preview paused after a scheduling delay. Press Play to resume.",
        );
        return;
      }
      accumulator += delta;
      let count = 0;
      while (accumulator >= 1 / 120 && count < 8) {
        if (!stepOnce()) return;
        accumulator -= 1 / 120;
        count++;
      }
      if (accumulator >= 1 / 120) {
        setMode("paused");
        setNotice("Preview paused to avoid skipping physics ticks.");
        return;
      }
      handle = requestAnimationFrame(animate);
    };
    const visibility = () => {
      if (document.hidden) setMode("paused");
    };
    document.addEventListener("visibilitychange", visibility);
    handle = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(handle);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [mode, stepOnce]);
  function change(edit: (draft: SceneV1) => void) {
    if (locked) return false;
    const result = editScene(scene, edit);
    if (!result.ok) {
      setNotice(result.message);
      return false;
    }
    setScene(result.scene);
    setDirty(true);
    setDocumentMessage(null);
    setNotice("");
    return true;
  }
  function updateBody(edit: (b: SceneV1["bodies"][number]) => void) {
    if (!body) return false;
    return change((s) => {
      const b = s.bodies.find((x) => x.id === body.id);
      if (b) edit(b);
    });
  }
  function add(kind: ObjectKind) {
    const count = scene.bodies.filter((b) => b.motionType === "dynamic").length;
    const added = makeBody(
      kind,
      undefined,
      [-2.5, 2.5, -4, 4, 0][(count - 1) % 5] ?? 0,
    );
    if (kind === "floor")
      added.position.y -= scene.bodies.filter(
        (b) => b.motionType === "static",
      ).length;
    if (change((s) => s.bodies.push(added))) setSelected(added.id);
  }
  function reset() {
    runtime.current?.dispose();
    runtime.current = null;
    setFrame(null);
    setMode("edit");
    setNotice("");
  }
  function start(single = false) {
    if (fileBusy || !teacherEnabled || !optIn || studentSurface) {
      setNotice(
        "Enable the experimental teacher preview first. Public and student execution remain blocked.",
      );
      return;
    }
    if (!runtime.current) {
      const created = createTeacherPreview(scene, optIn);
      if (!created.ok) {
        setNotice(created.diagnostics[0]!.message);
        return;
      }
      runtime.current = created.value;
      const initial = created.value.snapshot();
      if (initial.ok) setFrame(initial.value);
    }
    setNotice("");
    setMode(single ? "paused" : "running");
    if (single) stepOnce();
  }
  function preset(name: "free-fall" | "projectile") {
    if (locked) return;
    const s = newScene(name);
    setScene(s);
    setDirty(true);
    setDocumentMessage(null);
    setSelected(s.bodies[0]!.id);
    setNotice("");
  }
  function replaceDocument(next: SceneDocument, imported = false) {
    if (
      dirty &&
      !window.confirm(
        "Replace the unsaved draft? Export JSON first if you want to keep it.",
      )
    )
      return false;
    reset();
    setScene(next);
    setSelected(next.bodies[0]?.id ?? null);
    setDirty(imported);
    setDocumentMessage({
      error: false,
      text: imported
        ? "Imported as a new unsaved local copy. Object IDs and authored properties are preserved."
        : "Opened saved scene.",
    });
    return true;
  }
  async function saveLocally() {
    if (fileBusy) return;
    setFileBusy(true);
    setDocumentMessage(null);
    try {
      const saved = await repository.save(scene);
      setScene(saved);
      setDirty(false);
      setDocumentMessage({
        error: false,
        text: "Saved locally in this browser. Export JSON for a portable backup.",
      });
    } catch (e) {
      setDocumentMessage({
        error: true,
        text:
          e instanceof Error
            ? e.message
            : "Save failed. Your draft is unchanged.",
      });
    } finally {
      setFileBusy(false);
    }
  }
  async function importFile(file: File) {
    if (fileBusy) return;
    setFileBusy(true);
    setDocumentMessage(null);
    try {
      const imported = await importSceneFile(file);
      replaceDocument(imported, true);
    } catch (e) {
      setDocumentMessage({
        error: true,
        text:
          e instanceof Error
            ? e.message
            : "File import failed. Your draft is unchanged.",
      });
    } finally {
      setFileBusy(false);
    }
  }
  function renamed(saved: SceneDocument, oldHead: string) {
    if (
      scene.identity.state === "saved" &&
      saved.identity.state === "saved" &&
      scene.identity.simulationId === saved.identity.simulationId &&
      scene.identity.revisionId === oldHead
    ) {
      const draft = structuredClone(scene) as SceneV1;
      draft.identity = structuredClone(saved.identity);
      draft.title = saved.title;
      const v = validateDraft(draft);
      if (v.ok) setScene(v.scene);
    }
    setDocumentMessage({
      error: false,
      text: "Saved scene renamed. Any unsaved object edits remain in your draft.",
    });
  }
  function deleted(id: string) {
    if (
      scene.identity.state === "saved" &&
      scene.identity.simulationId === id
    ) {
      const draft = structuredClone(scene) as SceneV1;
      draft.identity = { state: "draft" };
      const v = validateDraft(draft);
      if (v.ok) setScene(v.scene);
      setDirty(true);
    }
    setDocumentMessage({
      error: false,
      text: "Local saved scene deleted. Your current draft is still open.",
    });
  }
  if (studentSurface)
    return (
      <main className="student-block">
        <h1>Student playback is not available yet.</h1>
        <p>
          The public physics adapter remains blocked pending numerical
          qualification. This experimental workspace cannot run in an embed.
        </p>
      </main>
    );
  return (
    <div className="application">
      <header className="topbar">
        <a className="brand" href="./">
          <span className="brand-mark">b.</span>
          <strong>BaanPhys</strong>
          <span className="brand-detail">/ Physics Sandbox</span>
        </a>
        <div className="topbar-meta">
          <span className="teacher-badge">TEACHER WORKSPACE</span>
          <span className="draft-badge" role="status">
            {dirty
              ? scene.identity.state === "saved"
                ? "● Unsaved changes"
                : "● Unsaved draft"
              : scene.identity.state === "saved"
                ? `Saved locally · revision ${scene.identity.revisionNumber}`
                : "● Unsaved draft"}
          </span>
        </div>
      </header>
      <div className="workspace-title">
        <div>
          <p className="eyebrow">BUILD · EXPERIMENT · UNDERSTAND</p>
          <h1>{scene.title}</h1>
        </div>
        <label className="preset-picker">
          Start with an example
          <select
            aria-label="Scene example"
            disabled={locked}
            value={
              scene.title === "Projectile motion"
                ? "projectile"
                : scene.title === "Free fall"
                  ? "free-fall"
                  : "custom"
            }
            onChange={(e) =>
              preset(e.target.value as "free-fall" | "projectile")
            }
          >
            <option value="custom" disabled>
              Current scene
            </option>
            <option value="free-fall">Free fall</option>
            <option value="projectile">Projectile motion</option>
          </select>
        </label>
      </div>
      <div className="document-toolbar" aria-label="Scene files">
        <button
          className="save-scene"
          disabled={fileBusy}
          onClick={() => void saveLocally()}
        >
          {fileBusy ? "Working…" : "Save locally"}
        </button>
        <button disabled={locked} onClick={() => setLibraryOpen(true)}>
          Saved scenes
        </button>
        <button
          disabled={fileBusy}
          onClick={() => {
            try {
              downloadScene(scene, dirty);
              setDocumentMessage({
                error: false,
                text: "Scene JSON exported from authored initial conditions.",
              });
            } catch (e) {
              setDocumentMessage({
                error: true,
                text: e instanceof Error ? e.message : "Export failed.",
              });
            }
          }}
        >
          Export JSON
        </button>
        <button disabled={locked} onClick={() => fileInput.current?.click()}>
          Import JSON
        </button>
        <input
          ref={fileInput}
          type="file"
          accept=".json,application/json"
          aria-label="Import Scene JSON file"
          hidden
          onChange={(e) => {
            const file = e.currentTarget.files?.[0];
            e.currentTarget.value = "";
            if (file) void importFile(file);
          }}
        />
        <span>Local to this browser · JSON backups are portable</span>
      </div>
      {documentMessage && (
        <div
          className={`document-message ${documentMessage.error ? "error" : "success"}`}
          role={documentMessage.error ? "alert" : "status"}
        >
          {documentMessage.text}
        </div>
      )}
      {libraryOpen && (
        <SceneLibrary
          repository={repository}
          onClose={() => setLibraryOpen(false)}
          onOpen={(s) => replaceDocument(s)}
          onRename={renamed}
          onDelete={deleted}
        />
      )}
      <main className="workspace" id="main-content">
        <aside className="tools-panel">
          <div className="panel-heading">
            <h2>Objects</h2>
            <span className="count">{scene.bodies.length}</span>
          </div>
          <p className="muted">Add an object, then place it in the scene.</p>
          <div className="add-tools">
            <button disabled={locked} onClick={() => add("circle")}>
              <span className="shape-icon">○</span>Circle
              <span className="plus">+</span>
            </button>
            <button disabled={locked} onClick={() => add("rectangle")}>
              <span className="shape-icon">▭</span>Rectangle
              <span className="plus">+</span>
            </button>
            <button disabled={locked} onClick={() => add("floor")}>
              <span className="shape-icon">━</span>Static floor
              <span className="plus">+</span>
            </button>
          </div>
          <div className="scene-list" aria-label="Scene objects">
            {scene.bodies.map((b) => (
              <button
                key={b.id}
                className={
                  selected === b.id ? "object-row active" : "object-row"
                }
                onClick={() => setSelected(b.id)}
                aria-pressed={selected === b.id}
              >
                <span>
                  {b.motionType === "static"
                    ? "▰"
                    : b.shape.type === "circle"
                      ? "●"
                      : "■"}
                </span>
                <span>
                  {b.name}
                  <small>
                    {b.motionType === "static"
                      ? "Fixed surface"
                      : "Dynamic body"}
                  </small>
                </span>
              </button>
            ))}
          </div>
          <section className="gravity-settings">
            <h2>World</h2>
            <div className="field-pair">
              <NumberField
                label="Gravity x"
                unit="m/s²"
                value={scene.world.gravity.x}
                disabled={locked}
                onCommit={(x) =>
                  change((s) => {
                    s.world.gravity.x = x;
                  })
                }
              />
              <NumberField
                label="Gravity y"
                unit="m/s²"
                value={scene.world.gravity.y}
                disabled={locked}
                onCommit={(y) =>
                  change((s) => {
                    s.world.gravity.y = y;
                  })
                }
              />
            </div>
            <p className="muted">
              Metres · kilograms · seconds
              <br />
              Positive y points upward.
            </p>
          </section>
        </aside>
        <section className="stage-panel" aria-label="Scene workspace">
          <div className="stage-heading">
            <span>
              <i
                className={`state-dot ${mode === "running" ? "is-running" : ""}`}
              />
              {mode === "edit"
                ? "EDITING INITIAL CONDITIONS"
                : mode === "running"
                  ? "EXPERIMENTAL PREVIEW RUNNING"
                  : mode === "paused"
                    ? "PREVIEW PAUSED"
                    : "PREVIEW STOPPED"}
            </span>
            <span>1 grid square = 1 m</span>
          </div>
          <SceneCanvas
            scene={scene}
            selected={selected}
            poses={poses}
            locked={locked}
            onSelect={setSelected}
            onMove={(id, x, y) => {
              change((s) => {
                const b = s.bodies.find((b) => b.id === id);
                if (b)
                  b.position = {
                    x: Math.round(x * 100) / 100,
                    y: Math.round(y * 100) / 100,
                  };
              });
            }}
          />
          <div className="playbar">
            <div className="playback-actions">
              <button
                className="play-button"
                aria-label={
                  mode === "running" ? "Pause simulation" : "Play simulation"
                }
                disabled={
                  (fileBusy && mode !== "running") ||
                  !teacherEnabled ||
                  !optIn ||
                  mode === "stopped"
                }
                onClick={() =>
                  mode === "running" ? setMode("paused") : start()
                }
              >
                {mode === "running" ? "Ⅱ Pause" : "▶ Play"}
              </button>
              <button
                aria-label="Step simulation"
                disabled={
                  fileBusy ||
                  !teacherEnabled ||
                  !optIn ||
                  mode === "running" ||
                  mode === "stopped"
                }
                onClick={() => start(true)}
              >
                Step <span>1/120 s</span>
              </button>
              <button aria-label="Reset simulation" onClick={reset}>
                ↺ Reset
              </button>
            </div>
            <output className="clock" aria-label="Elapsed simulation time">
              {(frame?.timeSeconds ?? 0).toFixed(3)} <small>s</small>
            </output>
          </div>
          <div className="preview-notice">
            <span className="experiment-icon">!</span>
            <div>
              <strong>Experimental teacher preview · free flight only</strong>
              <p>
                Stops before possible contact. Collisions, rolling and
                mechanisms are not qualified.
              </p>
              {teacherEnabled ? (
                <label className="opt-in">
                  <input
                    type="checkbox"
                    checked={optIn}
                    disabled={locked}
                    onChange={(e) => setOptIn(e.target.checked)}
                  />
                  Enable experimental preview in this teacher workspace
                </label>
              ) : (
                <p>
                  Preview is disabled in the public build. Use the local teacher
                  development workspace.
                </p>
              )}
            </div>
          </div>
          {notice && (
            <div className="notice" role="alert">
              {notice}
            </div>
          )}
          <p className="stage-hint">
            {locked
              ? "Reset to edit initial conditions. Preview never changes your authored scene."
              : "Drag to position · Select an object to edit · Arrow keys move by 0.1 m (Shift: 0.5 m)"}
          </p>
        </section>
        <aside className="inspector">
          <div className="panel-heading">
            <h2>Inspector</h2>
            <span className="inspector-tag">SI UNITS</span>
          </div>
          {body ? (
            <>
              <label className="name-field">
                Object name
                <input
                  aria-label="Object name"
                  key={body.id + body.name}
                  defaultValue={body.name}
                  disabled={locked}
                  maxLength={120}
                  onBlur={(e) => {
                    if (e.currentTarget.value === body.name) return;
                    const name = e.target.value.trim();
                    if (
                      !name ||
                      !updateBody((b) => {
                        b.name = name;
                      })
                    )
                      e.target.value = body.name;
                  }}
                />
              </label>
              <p className="body-type">
                {body.motionType === "static"
                  ? "STATIC SURFACE"
                  : "DYNAMIC BODY"}
              </p>
              <h3>Initial position</h3>
              <div className="field-pair">
                <NumberField
                  label="Position x"
                  unit="m"
                  value={body.position.x}
                  disabled={locked}
                  onCommit={(x) =>
                    updateBody((b) => {
                      b.position.x = x;
                    })
                  }
                />
                <NumberField
                  label="Position y"
                  unit="m"
                  value={body.position.y}
                  disabled={locked}
                  onCommit={(y) =>
                    updateBody((b) => {
                      b.position.y = y;
                    })
                  }
                />
              </div>
              <h3>Geometry & mass</h3>
              {body.shape.type === "circle" ? (
                <NumberField
                  label="Radius"
                  unit="m"
                  value={body.shape.radius}
                  disabled={locked}
                  onCommit={(radius) =>
                    updateBody((b) => {
                      if (b.shape.type === "circle") b.shape.radius = radius;
                    })
                  }
                />
              ) : body.shape.type === "rectangle" ? (
                <div className="field-pair">
                  <NumberField
                    label="Width"
                    unit="m"
                    value={body.shape.width}
                    disabled={locked}
                    onCommit={(width) =>
                      updateBody((b) => {
                        if (b.shape.type === "rectangle") b.shape.width = width;
                      })
                    }
                  />
                  <NumberField
                    label="Height"
                    unit="m"
                    value={body.shape.height}
                    disabled={locked}
                    onCommit={(height) =>
                      updateBody((b) => {
                        if (b.shape.type === "rectangle")
                          b.shape.height = height;
                      })
                    }
                  />
                </div>
              ) : null}
              <NumberField
                label="Angle"
                unit="°"
                value={(body.angle * 180) / Math.PI}
                disabled={locked}
                onCommit={(angle) =>
                  updateBody((b) => {
                    b.angle = (angle * Math.PI) / 180;
                  })
                }
              />
              {body.motionType === "dynamic" && (
                <>
                  <NumberField
                    label="Mass"
                    unit="kg"
                    value={
                      body.massModel.mode === "mass" ? body.massModel.mass : 0
                    }
                    disabled={locked}
                    onCommit={(mass) =>
                      updateBody((b) => {
                        b.massModel = { mode: "mass", mass };
                      })
                    }
                  />
                  <h3>Initial velocity</h3>
                  <div className="field-pair">
                    <NumberField
                      label="Velocity x"
                      unit="m/s"
                      value={body.velocity.x}
                      disabled={locked}
                      onCommit={(x) =>
                        updateBody((b) => {
                          b.velocity.x = x;
                        })
                      }
                    />
                    <NumberField
                      label="Velocity y"
                      unit="m/s"
                      value={body.velocity.y}
                      disabled={locked}
                      onCommit={(y) =>
                        updateBody((b) => {
                          b.velocity.y = y;
                        })
                      }
                    />
                  </div>
                </>
              )}
              <section className="live-readout">
                <h3>Live measurements</h3>
                <dl>
                  <div>
                    <dt>x</dt>
                    <dd>
                      {(live?.position.x ?? body.position.x).toFixed(3)}{" "}
                      <small>m</small>
                    </dd>
                  </div>
                  <div>
                    <dt>y</dt>
                    <dd>
                      {(live?.position.y ?? body.position.y).toFixed(3)}{" "}
                      <small>m</small>
                    </dd>
                  </div>
                  <div>
                    <dt>
                      v<sub>x</sub>
                    </dt>
                    <dd>
                      {(live?.velocity.x ?? body.velocity.x).toFixed(3)}{" "}
                      <small>m/s</small>
                    </dd>
                  </div>
                  <div>
                    <dt>
                      v<sub>y</sub>
                    </dt>
                    <dd>
                      {(live?.velocity.y ?? body.velocity.y).toFixed(3)}{" "}
                      <small>m/s</small>
                    </dd>
                  </div>
                </dl>
              </section>
              <button
                className="delete-button"
                disabled={locked}
                onClick={() => {
                  if (
                    change((s) => {
                      s.bodies = s.bodies.filter((b) => b.id !== body.id);
                    })
                  )
                    setSelected(null);
                }}
              >
                Delete object
              </button>
            </>
          ) : (
            <p className="empty-state">
              Select an object in the scene or object list to inspect its
              properties.
            </p>
          )}
        </aside>
      </main>
      <footer className="footer">
        <span>Save and export authored conditions, never preview state.</span>
        <span>Planck 1.5.1 · fixed 120 Hz · teacher experiment</span>
      </footer>
    </div>
  );
}
