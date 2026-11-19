import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { physicalProperties } from "../physics/physical-properties";
import { anchorPosition, localPoint } from "../domain/anchors";
import { SceneHistory } from "../editor/history";
import type { SceneV1 } from "../domain/scene-v1.generated";
import type { PhysicsRuntime, SimulationSnapshot } from "../physics";
import { createTeacherPreview } from "../physics/teacher-preview";
import {
  newScene,
  editScene,
  makeBody,
  objectId,
  duplicateBody,
  positionBody,
  setBodyMotion,
  setMassMode,
  moveWorldPivot,
} from "../editor/scene-commands";
import type { ObjectKind } from "../editor/scene-commands";
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
  useEffect(() => setDraft(String(Number(value.toFixed(5)))), [value]);
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
  const [history] = useState(() => new SceneHistory());
  const [, refreshHistory] = useState(0);
  const [showVelocity, setShowVelocity] = useState(false);
  const [fixedPivots, setFixedPivots] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const sceneRef = useRef(scene);
  const [frame, setFrame] = useState<SimulationSnapshot | null>(null),
    [mode, setMode] = useState<"edit" | "running" | "paused" | "stopped">(
      "edit",
    );
  const [optIn, setOptIn] = useState(false),
    [notice, setNotice] = useState("");
  const [collisionMode, setCollisionMode] = useState(true);
  const runtime = useRef<PhysicsRuntime | null>(null),
    locked = frame !== null;
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
      accumulator += delta * playbackRate;
      let count = 0;
      while (accumulator >= 1 / 120 && count < 8) {
        if (!stepOnce()) return;
        accumulator -= 1 / 120;
        count++;
      }
      if (accumulator > 0.25) {
        setMode("paused");
        setNotice(
          "Preview paused after excessive backlog; no physics ticks were skipped.",
        );
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
  }, [mode, stepOnce, playbackRate]);
  function change(edit: (draft: SceneV1) => void) {
    if (locked) return false;
    return acceptScene(editScene(sceneRef.current, edit));
  }
  function acceptScene(result: ReturnType<typeof editScene>) {
    if (!result.ok) {
      setNotice(result.message);
      return false;
    }
    if (!history.record(sceneRef.current, result.scene)) return true;
    sceneRef.current = result.scene;
    setScene(result.scene);
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
  function restoreHistory(redo = false) {
    if (locked) return;
    const current = sceneRef.current,
      next = redo ? history.redo(current) : history.undo(current);
    if (!next) return;
    const added = next.bodies.find(
      (b) => !current.bodies.some((q) => q.id === b.id),
    );
    sceneRef.current = next;
    setScene(next);
    setSelected(
      (id) =>
        added?.id ??
        (next.bodies.some((b) => b.id === id)
          ? id
          : (next.bodies[0]?.id ?? null)),
    );
    setNotice("");
  }
  function duplicateSelected() {
    if (locked || !selected) return;
    const result = duplicateBody(sceneRef.current, selected);
    if (!result.ok) {
      setNotice(result.message);
      return;
    }
    history.record(sceneRef.current, result.scene);
    sceneRef.current = result.scene;
    setScene(result.scene);
    setSelected(result.bodyId);
  }
  function deleteSelected() {
    if (!selected) return;
    if (
      change((s) => {
        s.bodies = s.bodies.filter((b) => b.id !== selected);
        s.forces = s.forces.filter((f) => f.bodyId !== selected);
        s.constraints = s.constraints.filter(
          (c) =>
            !(c.anchorA.type === "body" && c.anchorA.bodyId === selected) &&
            !(c.anchorB.type === "body" && c.anchorB.bodyId === selected),
        );
      })
    )
      setSelected(null);
  }
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      const target = e.target;
      if (
        target instanceof Element &&
        target.closest('input,textarea,select,[contenteditable="true"]')
      )
        return;
      if (locked) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        restoreHistory(e.shiftKey);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        restoreHistory(true);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
        e.preventDefault();
        duplicateSelected();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        deleteSelected();
      }
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [scene, selected, locked]);
  function addJoint(type: "hinge" | "rod" | "rope") {
    if (!body || body.motionType !== "dynamic") return;
    change((s) => {
      const local = {
        x: 0,
        y:
          type === "hinge"
            ? body.shape.type === "circle"
              ? body.shape.radius
              : body.shape.type === "rectangle"
                ? body.shape.height / 2
                : Math.max(...body.shape.vertices.map((v) => v.y))
            : 0,
      };
      const anchorA = {
          type: "body" as const,
          bodyId: body.id,
          localPoint: local,
        },
        p = anchorPosition(s, anchorA);
      const base = {
        id: objectId(),
        name: type === "hinge" ? "Hinge" : type === "rod" ? "Rod" : "Rope",
        anchorA,
        anchorB: {
          type: "world" as const,
          point: { x: p.x, y: p.y + (type === "hinge" ? 0 : 2) },
        },
        collideConnected: false,
      };
      s.constraints.push(
        type === "hinge"
          ? { ...base, type }
          : type === "rod"
            ? { ...base, type, length: 2 }
            : { ...base, type, maxLength: 2 },
      );
    });
  }
  function changeJoint(
    id: string,
    edit: (c: SceneV1["constraints"][number], s: SceneV1) => void,
  ) {
    return change((s) => {
      const c = s.constraints.find((c) => c.id === id);
      if (c) edit(c, s);
    });
  }
  function jointLength(id: string, length: number) {
    if (!Number.isFinite(length) || length < 0.05 || length > 50) {
      setNotice("Experimental link length must be 0.05–50 m.");
      return false;
    }
    return changeJoint(id, (c, s) => {
      if (c.type !== "rod" && c.type !== "rope") return;
      const a = anchorPosition(s, c.anchorA),
        b = anchorPosition(s, c.anchorB),
        d = Math.hypot(a.x - b.x, a.y - b.y);
      if (c.anchorA.type === "body" && (c.type === "rod" || length < d)) {
        const target = c.anchorA.bodyId,
          body = s.bodies.find((b) => b.id === target)!;
        body.position.x += (a.x - b.x) * (length / d - 1);
        body.position.y += (a.y - b.y) * (length / d - 1);
      }
      if (c.type === "rod") c.length = length;
      else c.maxLength = length;
    });
  }
  function jointWorldPoint(id: string, axis: "x" | "y", value: number) {
    return changeJoint(id, (c, s) => {
      if (c.anchorB.type !== "world" || c.anchorA.type !== "body") return;
      const delta = value - c.anchorB.point[axis];
      c.anchorB.point[axis] = value;
      const target = c.anchorA.bodyId;
      s.bodies.find((b) => b.id === target)!.position[axis] += delta;
    });
  }
  function connectJoint(id: string, target: string) {
    changeJoint(id, (c, s) => {
      const p = anchorPosition(s, c.anchorA),
        old = anchorPosition(s, c.anchorB),
        b = s.bodies.find((b) => b.id === target);
      c.anchorB = b
        ? {
            type: "body",
            bodyId: b.id,
            localPoint: c.type === "hinge" ? localPoint(b, p) : { x: 0, y: 0 },
          }
        : { type: "world", point: c.type === "hinge" ? p : old };
      const q = anchorPosition(s, c.anchorB),
        length = Math.hypot(p.x - q.x, p.y - q.y);
      if (c.type === "rod") c.length = length;
      if (c.type === "rope") c.maxLength = length;
    });
  }
  function addForce(couple = false) {
    if (!body || body.motionType !== "dynamic") return;
    change((s) => {
      s.forces.push({
        id: objectId(),
        type: "constantForce",
        bodyId: body.id,
        vector: { x: 0, y: couple ? 1 : 2 },
        localPoint: { x: couple ? 0.5 : 0, y: 0 },
      });
      if (couple)
        s.forces.push({
          id: objectId(),
          type: "constantForce",
          bodyId: body.id,
          vector: { x: 0, y: -1 },
          localPoint: { x: -0.5, y: 0 },
        });
    });
  }
  function updateForce(
    id: string,
    edit: (f: SceneV1["forces"][number]) => void,
  ) {
    return change((s) => {
      const f = s.forces.find((f) => f.id === id);
      if (f) edit(f);
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
    if (!teacherEnabled || !optIn || studentSurface) {
      setNotice(
        "Enable the experimental teacher preview first. Public and student execution remain blocked.",
      );
      return;
    }
    if (!runtime.current) {
      const created = createTeacherPreview(scene, optIn, {
        collisions: collisionMode,
      });
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
  function preset(
    name:
      | "free-fall"
      | "projectile"
      | "collision"
      | "sliding"
      | "forces"
      | "pendulum"
      | "rope"
      | "incline",
  ) {
    if (locked) return;
    const s = newScene(name);
    history.record(sceneRef.current, s);
    sceneRef.current = s;
    setScene(s);
    setSelected(s.bodies[0]!.id);
    setNotice("");
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
          <span className="draft-badge">● Unsaved draft</span>
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
              scene.title === "Inclined plane"
                ? "incline"
                : scene.title === "Projectile motion"
                  ? "projectile"
                  : scene.title === "Body collision"
                    ? "collision"
                    : scene.title === "Hinged pendulum"
                      ? "pendulum"
                      : scene.title === "Rope pendulum"
                        ? "rope"
                        : scene.title === "Force and torque"
                          ? "forces"
                          : scene.title === "Sliding block"
                            ? "sliding"
                            : "free-fall"
            }
            onChange={(e) =>
              preset(
                e.target.value as
                  | "free-fall"
                  | "projectile"
                  | "collision"
                  | "sliding"
                  | "forces"
                  | "pendulum"
                  | "rope"
                  | "incline",
              )
            }
          >
            <option value="free-fall">Free fall</option>
            <option value="projectile">Projectile motion</option>
            <option value="collision">Body collision</option>
            <option value="sliding">Sliding block</option>
            <option value="incline">Inclined plane</option>
            <option value="forces">Force and torque</option>
            <option value="pendulum">Hinged pendulum</option>
            <option value="rope">Rope pendulum</option>
          </select>
        </label>
      </div>
      <div className="edit-toolbar" aria-label="Scene editing tools">
        <button
          disabled={locked || !history.canUndo}
          onClick={() => restoreHistory()}
        >
          ↶ Undo
        </button>
        <button
          disabled={locked || !history.canRedo}
          onClick={() => restoreHistory(true)}
        >
          ↷ Redo
        </button>
        <button
          disabled={locked || !body}
          onClick={duplicateSelected}
          title="Copy body and its forces, not joints"
        >
          Duplicate object
        </button>
        <button disabled={locked || !body} onClick={deleteSelected}>
          Delete selected
        </button>
        <button
          disabled={locked}
          aria-pressed={fixedPivots}
          onClick={() => setFixedPivots((v) => !v)}
          title="Drag hinge/rod bodies around fixed anchors; ropes can start slack"
        >
          Fixed-pivot drag
        </button>
        <button
          aria-pressed={showVelocity}
          onClick={() => setShowVelocity((v) => !v)}
        >
          Velocity vectors
        </button>
        {(["hinge", "rod", "rope"] as const).map((type) => (
          <button
            key={type}
            disabled={locked || body?.motionType !== "dynamic"}
            onClick={() => addJoint(type)}
            title="Attach selected body to a world anchor"
          >
            + {type[0]!.toUpperCase() + type.slice(1)}
          </button>
        ))}
        <span>
          Ctrl/⌘ Z · Ctrl/⌘ D · arrows · vectors display-scaled/capped
        </span>
      </div>
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
            <button disabled={locked} onClick={() => add("triangle")}>
              <span className="shape-icon">△</span>Triangle
              <span className="plus">+</span>
            </button>
            <button disabled={locked} onClick={() => add("pentagon")}>
              <span className="shape-icon">⬠</span>Pentagon
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
            showVelocity={showVelocity}
            onGestureStart={() => history.begin(sceneRef.current)}
            onGestureEnd={() => {
              history.end(sceneRef.current);
              refreshHistory((n) => n + 1);
            }}
            onSelect={setSelected}
            onPivot={(id, point) => {
              if (!locked)
                acceptScene(moveWorldPivot(sceneRef.current, id, point));
            }}
            onForce={(id, value) =>
              updateForce(id, (f) => {
                if ("vector" in value) f.vector = { ...value.vector };
                else f.localPoint = { ...value.localPoint };
              })
            }
            onTransform={(id, value) => {
              change((draft) => {
                const target = draft.bodies.find((b) => b.id === id);
                if (!target) return;
                if ("angle" in value) target.angle = value.angle;
                else target.shape = value.shape;
              });
            }}
            onMove={(id, x, y) => {
              if (!locked)
                acceptScene(
                  positionBody(
                    sceneRef.current,
                    id,
                    {
                      x: Math.round(x * 100) / 100,
                      y: Math.round(y * 100) / 100,
                    },
                    fixedPivots,
                  ),
                );
            }}
          />
          <div className="playbar">
            <div className="playback-actions">
              <button
                className="play-button"
                aria-label={
                  mode === "running" ? "Pause simulation" : "Play simulation"
                }
                disabled={!teacherEnabled || !optIn || mode === "stopped"}
                onClick={() =>
                  mode === "running" ? setMode("paused") : start()
                }
              >
                {mode === "running" ? "Ⅱ Pause" : "▶ Play"}
              </button>
              <button
                aria-label="Step simulation"
                disabled={
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
            <label className="playback-rate">
              Speed
              <select
                aria-label="Playback speed"
                value={playbackRate}
                onChange={(e) => setPlaybackRate(Number(e.target.value))}
              >
                <option value="1">1×</option>
                <option value="0.5">½×</option>
                <option value="0.25">¼×</option>
              </select>
            </label>
            <output className="clock" aria-label="Elapsed simulation time">
              {(frame?.timeSeconds ?? 0).toFixed(3)} <small>s</small>
            </output>
          </div>
          <div className="preview-notice">
            <span className="experiment-icon">!</span>
            <div>
              <strong>
                Experimental physics · collision accuracy is NOT certified
              </strong>
              <p>
                {collisionMode
                  ? "Real solver contacts and bouncing; overlap, tunnelling and numerical errors are possible. Forces, contacts and native hinges/rods/ropes are experimental; numerical accuracy is not certified."
                  : "Free flight stops before possible contact. Collision accuracy remains unqualified."}
              </p>
              <label className="preview-model">
                Preview model
                <select
                  aria-label="Preview model"
                  value={collisionMode ? "collisions" : "free-flight"}
                  disabled={locked}
                  onChange={(e) =>
                    setCollisionMode(e.target.value === "collisions")
                  }
                >
                  <option value="collisions">
                    Experimental collisions · 30 s
                  </option>
                  <option value="free-flight">
                    Free flight only · stop before contact
                  </option>
                </select>
              </label>
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
              <label className="name-field">
                Motion
                <select
                  aria-label="Body motion"
                  disabled={locked}
                  value={body.motionType}
                  onChange={(e) => {
                    acceptScene(
                      setBodyMotion(
                        sceneRef.current,
                        body.id,
                        e.target.value as "static" | "dynamic",
                      ),
                    );
                  }}
                >
                  <option value="dynamic">Movable body</option>
                  <option value="static">Fixed surface</option>
                </select>
              </label>
              <p className="property-hint">
                Fixing a body sets its initial linear and angular velocity to
                zero. Mass and geometry are retained.
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
              {body.shape.type === "polygon" && (
                <>
                  <p className="property-hint">
                    Centred convex {body.shape.vertices.length}-vertex polygon.
                    The square canvas handle scales it uniformly.
                  </p>
                  <NumberField
                    label="Polygon radius"
                    unit="m"
                    value={Math.max(
                      ...body.shape.vertices.map((v) => Math.hypot(v.x, v.y)),
                    )}
                    disabled={locked}
                    onCommit={(radius) =>
                      radius > 0 &&
                      updateBody((b) => {
                        if (b.shape.type !== "polygon") return;
                        const old = Math.max(
                            ...b.shape.vertices.map((v) =>
                              Math.hypot(v.x, v.y),
                            ),
                          ),
                          factor = radius / old;
                        b.shape.vertices = b.shape.vertices.map((v) => ({
                          x: v.x * factor,
                          y: v.y * factor,
                        }));
                      })
                    }
                  />
                </>
              )}
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
                  <label className="name-field">
                    Mass model
                    <select
                      aria-label="Mass model"
                      disabled={locked}
                      value={body.massModel.mode}
                      onChange={(e) =>
                        acceptScene(
                          setMassMode(
                            sceneRef.current,
                            body.id,
                            e.target.value as "mass" | "density",
                          ),
                        )
                      }
                    >
                      <option value="mass">Fixed mass</option>
                      <option value="density">
                        Areal density (uniform 2D)
                      </option>
                    </select>
                  </label>
                  {body.massModel.mode === "mass" ? (
                    <NumberField
                      label="Mass"
                      unit="kg"
                      value={body.massModel.mass}
                      disabled={locked}
                      onCommit={(mass) =>
                        updateBody((b) => {
                          b.massModel = { mode: "mass", mass };
                        })
                      }
                    />
                  ) : (
                    <NumberField
                      label="Areal density"
                      unit="kg/m²"
                      value={body.massModel.arealDensity}
                      disabled={locked}
                      onCommit={(arealDensity) =>
                        updateBody((b) => {
                          b.massModel = { mode: "density", arealDensity };
                        })
                      }
                    />
                  )}
                  {(() => {
                    const p = physicalProperties(body);
                    return p.ok ? (
                      <p className="property-hint">
                        Uniform 2D body: {p.value.mass.toPrecision(4)} kg · I ={" "}
                        {p.value.inertia.toPrecision(4)} kg·m².{" "}
                        {body.massModel.mode === "density"
                          ? "Resizing changes mass."
                          : "Resizing keeps mass fixed."}
                      </p>
                    ) : null;
                  })()}
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
              {body.motionType === "dynamic" && (
                <NumberField
                  label="Angular velocity"
                  unit="rad/s"
                  value={body.angularVelocity}
                  disabled={locked}
                  onCommit={(angularVelocity) =>
                    updateBody((b) => {
                      b.angularVelocity = angularVelocity;
                    })
                  }
                />
              )}
              {body.motionType === "dynamic" && (
                <section className="force-controls">
                  <h3>Applied forces</h3>
                  <div className="force-buttons">
                    <button disabled={locked} onClick={() => addForce()}>
                      Add force
                    </button>
                    <button disabled={locked} onClick={() => addForce(true)}>
                      Add force couple
                    </button>
                  </div>
                  <output className="force-torque" aria-label="Applied torque">
                    Applied torque:{" "}
                    {scene.forces
                      .filter((f) => f.bodyId === body.id)
                      .reduce((sum, f) => {
                        const angle = live?.angle ?? body.angle,
                          c = Math.cos(angle),
                          sn = Math.sin(angle);
                        return (
                          sum +
                          (c * f.localPoint.x - sn * f.localPoint.y) *
                            f.vector.y -
                          (sn * f.localPoint.x + c * f.localPoint.y) *
                            f.vector.x
                        );
                      }, 0)
                      .toFixed(3)}{" "}
                    N·m
                  </output>
                  <p className="material-hint">
                    Vectors stay world-fixed; application points rotate with the
                    body. Off-centre forces create torque. A world-force
                    couple’s torque varies as it turns.
                  </p>
                  {scene.forces
                    .filter((f) => f.bodyId === body.id)
                    .map((f, i) => (
                      <div className="force-card" key={f.id}>
                        <strong>Force {i + 1}</strong>
                        <div className="field-pair">
                          <NumberField
                            label={`Force ${i + 1} x`}
                            unit="N"
                            value={f.vector.x}
                            disabled={locked}
                            onCommit={(x) =>
                              updateForce(f.id, (q) => {
                                q.vector.x = x;
                              })
                            }
                          />
                          <NumberField
                            label={`Force ${i + 1} y`}
                            unit="N"
                            value={f.vector.y}
                            disabled={locked}
                            onCommit={(y) =>
                              updateForce(f.id, (q) => {
                                q.vector.y = y;
                              })
                            }
                          />
                        </div>
                        <div className="field-pair">
                          <NumberField
                            label={`Force ${i + 1} point x`}
                            unit="m local"
                            value={f.localPoint.x}
                            disabled={locked}
                            onCommit={(x) =>
                              updateForce(f.id, (q) => {
                                q.localPoint.x = x;
                              })
                            }
                          />
                          <NumberField
                            label={`Force ${i + 1} point y`}
                            unit="m local"
                            value={f.localPoint.y}
                            disabled={locked}
                            onCommit={(y) =>
                              updateForce(f.id, (q) => {
                                q.localPoint.y = y;
                              })
                            }
                          />
                        </div>
                        <button
                          disabled={locked}
                          onClick={() =>
                            change((s) => {
                              s.forces = s.forces.filter((q) => q.id !== f.id);
                            })
                          }
                        >
                          Remove force {i + 1}
                        </button>
                      </div>
                    ))}
                </section>
              )}
              {body.motionType === "dynamic" && (
                <section className="joint-controls">
                  <h3>Experimental mechanisms</h3>
                  <div className="force-buttons">
                    <button disabled={locked} onClick={() => addJoint("hinge")}>
                      Add hinge
                    </button>
                    <button disabled={locked} onClick={() => addJoint("rod")}>
                      Add rod
                    </button>
                    <button disabled={locked} onClick={() => addJoint("rope")}>
                      Add rope
                    </button>
                  </div>
                  <p className="material-hint">
                    Native hinges and massless rod/rope constraints; not
                    certified. Moving a body carries its world anchor.
                    World-anchor edits move the attached body; shortening a link
                    repositions it. Springs/pulleys are not implemented.
                  </p>
                  {scene.constraints
                    .filter(
                      (c) =>
                        c.anchorA.type === "body" &&
                        c.anchorA.bodyId === body.id,
                    )
                    .map((c, i) => (
                      <div className="force-card" key={c.id}>
                        <strong>{c.name}</strong>
                        <label className="joint-target">
                          Connect to
                          <select
                            aria-label={`Joint ${i + 1} target`}
                            disabled={locked}
                            value={
                              c.anchorB.type === "world"
                                ? "world"
                                : c.anchorB.bodyId
                            }
                            onChange={(e) => connectJoint(c.id, e.target.value)}
                          >
                            <option value="world">World anchor</option>
                            {scene.bodies
                              .filter((b) => b.id !== body.id)
                              .map((b) => (
                                <option key={b.id} value={b.id}>
                                  {b.name}
                                </option>
                              ))}
                          </select>
                        </label>
                        {c.anchorB.type === "world" && (
                          <div className="field-pair">
                            <NumberField
                              label={`Joint ${i + 1} anchor x`}
                              unit="m"
                              value={c.anchorB.point.x}
                              disabled={locked}
                              onCommit={(x) => jointWorldPoint(c.id, "x", x)}
                            />
                            <NumberField
                              label={`Joint ${i + 1} anchor y`}
                              unit="m"
                              value={c.anchorB.point.y}
                              disabled={locked}
                              onCommit={(y) => jointWorldPoint(c.id, "y", y)}
                            />
                          </div>
                        )}
                        {c.type === "rod" && (
                          <NumberField
                            label={`Joint ${i + 1} length`}
                            unit="m"
                            value={c.length}
                            disabled={locked}
                            onCommit={(n) => jointLength(c.id, n)}
                          />
                        )}
                        {c.type === "rope" && (
                          <NumberField
                            label={`Joint ${i + 1} max length`}
                            unit="m"
                            value={c.maxLength}
                            disabled={locked}
                            onCommit={(n) => jointLength(c.id, n)}
                          />
                        )}
                        <button
                          disabled={locked}
                          onClick={() =>
                            change((s) => {
                              s.constraints = s.constraints.filter(
                                (q) => q.id !== c.id,
                              );
                            })
                          }
                        >
                          Remove joint {i + 1}
                        </button>
                      </div>
                    ))}
                </section>
              )}
              <h3>Contact material</h3>
              <div className="field-pair">
                <NumberField
                  label="Friction"
                  unit="μ"
                  value={body.material.friction}
                  step={0.05}
                  disabled={locked}
                  onCommit={(friction) =>
                    updateBody((b) => {
                      b.material.friction = friction;
                      b.material.staticFriction = friction;
                    })
                  }
                />
                <NumberField
                  label="Restitution"
                  unit="0–1"
                  value={body.material.restitution}
                  step={0.05}
                  disabled={locked}
                  onCommit={(restitution) =>
                    updateBody((b) => {
                      b.material.restitution = restitution;
                    })
                  }
                />
              </div>
              <p className="material-hint">
                Pairs use geometric-mean friction and maximum restitution. Set
                the floor’s restitution to 0 to control bounce with the body.
                Reset before editing.
              </p>
              <section className="live-readout">
                <h3>Live measurements</h3>
                <p className="live-rotation">
                  Angle:{" "}
                  {(((live?.angle ?? body.angle) * 180) / Math.PI).toFixed(1)}°
                  · ω:{" "}
                  {(live?.angularVelocity ?? body.angularVelocity).toFixed(2)}{" "}
                  rad/s
                </p>
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
                      s.forces = s.forces.filter((f) => f.bodyId !== body.id);
                      s.constraints = s.constraints.filter(
                        (c) =>
                          !(
                            c.anchorA.type === "body" &&
                            c.anchorA.bodyId === body.id
                          ) &&
                          !(
                            c.anchorB.type === "body" &&
                            c.anchorB.bodyId === body.id
                          ),
                      );
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
        <span>Authored scene and preview state stay separate.</span>
        <span>Planck 1.5.1 · fixed 120 Hz · teacher experiment</span>
      </footer>
    </div>
  );
}
