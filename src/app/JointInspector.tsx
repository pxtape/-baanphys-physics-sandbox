import type { SceneDocument, SceneConstraint } from "../domain/scene";
import type { Constraint } from "../domain/scene-v1.generated";
import { anchorPosition } from "../domain/anchors";
import type { RigidPose } from "../domain/anchors";
import { NumberField } from "./NumberField";

type Side = "anchorA" | "anchorB";
export function JointInspector({
  scene,
  joint,
  poses,
  locked,
  onChange,
  onAnchor,
  onDelete,
}: {
  scene: SceneDocument;
  joint: SceneConstraint;
  poses: ReadonlyMap<string, RigidPose>;
  locked: boolean;
  onChange: (edit: (c: Constraint) => void) => boolean;
  onAnchor: (
    side: Side,
    point: { x: number; y: number },
    target?: string | null,
  ) => boolean;
  onDelete: () => void;
}) {
  const a = anchorPosition(scene, joint.anchorA, poses),
    b = anchorPosition(scene, joint.anchorB, poses),
    span = Math.hypot(a.x - b.x, a.y - b.y);
  return (
    <section
      className="selected-joint-inspector"
      aria-label="Selected connector"
    >
      <h3>{joint.type.toUpperCase()} · SELECTED</h3>
      <label className="name-field">
        Connector name
        <input
          aria-label="Connector name"
          key={joint.id + joint.name}
          defaultValue={joint.name}
          disabled={locked}
          onBlur={(e) => {
            const name = e.target.value.trim();
            if (
              !name ||
              !onChange((c) => {
                c.name = name;
              })
            )
              e.target.value = joint.name;
          }}
        />
      </label>
      <p className="joint-canvas-help">
        {locked
          ? "Reset to edit this connector."
          : joint.type === "hinge"
            ? "Drag the pivot directly on the canvas. Attached bodies stay in place."
            : "Drag A/B to reposition ends or drag the middle to move the connector. Drop an end on another object to reconnect."}
      </p>
      <output className="joint-span" aria-label="Connector span">
        Current span: {span.toFixed(3)} m
      </output>
      {joint.type === "spring" && (
        <button
          disabled={locked}
          onClick={() =>
            onChange((c) => {
              if (c.type === "spring") c.restLength = span;
            })
          }
        >
          Use current span as rest length
        </button>
      )}
      <details className="connector-details">
        <summary>Precise values & connections (optional)</summary>
        {(["anchorA", "anchorB"] as Side[]).map((side, i) => {
          const endpoint = joint[side],
            other = joint[side === "anchorA" ? "anchorB" : "anchorA"],
            point = i === 0 ? a : b,
            otherBody =
              other.type === "body"
                ? scene.bodies.find((body) => body.id === other.bodyId)
                : null,
            needsDynamic =
              other.type === "world" || otherBody?.motionType === "static";
          return (
            <div className="anchor-card" key={side}>
              <strong>End {i === 0 ? "A" : "B"}</strong>
              <label className="name-field">
                Attached to
                <select
                  aria-label={`Connector end ${i === 0 ? "A" : "B"} target`}
                  value={endpoint.type === "world" ? "world" : endpoint.bodyId}
                  disabled={locked}
                  onChange={(e) =>
                    onAnchor(
                      side,
                      point,
                      e.target.value === "world" ? null : e.target.value,
                    )
                  }
                >
                  <option value="world" disabled={needsDynamic}>
                    World point
                  </option>
                  {scene.bodies
                    .filter(
                      (body) =>
                        (other.type !== "body" || body.id !== other.bodyId) &&
                        (!needsDynamic || body.motionType === "dynamic"),
                    )
                    .map((body) => (
                      <option key={body.id} value={body.id}>
                        {body.name}
                      </option>
                    ))}
                </select>
              </label>
              <div className="field-pair">
                {(["x", "y"] as const).map((axis) => (
                  <NumberField
                    key={axis}
                    label={`Anchor ${i === 0 ? "A" : "B"} ${axis}`}
                    value={point[axis]}
                    unit="m world"
                    disabled={locked}
                    onCommit={(v) => onAnchor(side, { ...point, [axis]: v })}
                  />
                ))}
              </div>
            </div>
          );
        })}
        {joint.type === "rod" && (
          <NumberField
            label="Rod length"
            value={joint.length}
            unit="m"
            disabled={locked}
            onCommit={(v) =>
              span > 0 &&
              onAnchor("anchorA", {
                x: b.x + ((a.x - b.x) * v) / span,
                y: b.y + ((a.y - b.y) * v) / span,
              })
            }
          />
        )}
        {joint.type === "rope" && (
          <NumberField
            label="Rope max length"
            value={joint.maxLength}
            unit="m"
            disabled={locked}
            onCommit={(v) =>
              onChange((c) => {
                if (c.type === "rope") c.maxLength = v;
              })
            }
          />
        )}
        {joint.type === "spring" && (
          <>
            <NumberField
              label="Spring rest length"
              value={joint.restLength}
              unit="m"
              disabled={locked}
              onCommit={(v) =>
                onChange((c) => {
                  if (c.type === "spring") c.restLength = v;
                })
              }
            />
            <NumberField
              label="Spring constant"
              value={joint.springConstant}
              unit="N/m"
              disabled={locked}
              onCommit={(v) =>
                onChange((c) => {
                  if (c.type === "spring") c.springConstant = v;
                })
              }
            />
            <NumberField
              label="Spring damping"
              value={joint.dampingCoefficient}
              unit="N·s/m"
              disabled={locked}
              onCommit={(v) =>
                onChange((c) => {
                  if (c.type === "spring") c.dampingCoefficient = v;
                })
              }
            />
          </>
        )}
        <label className="joint-contact">
          <input
            type="checkbox"
            aria-label="Connector collide connected"
            checked={joint.collideConnected}
            disabled={locked}
            onChange={(e) => {
              const value = e.target.checked;
              onChange((c) => {
                c.collideConnected = value;
              });
            }}
          />
          Allow contacts between attached bodies
        </label>
      </details>
      <p className="property-hint">
        Rod/rope end dragging sets length. Spring rest length stays unchanged.
        All edits are undoable.
      </p>
      <button disabled={locked} className="delete-button" onClick={onDelete}>
        Delete connector
      </button>
    </section>
  );
}
