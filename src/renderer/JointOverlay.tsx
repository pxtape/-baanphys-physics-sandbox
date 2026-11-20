import type { SceneDocument } from "../domain/scene";
import { anchorPosition } from "../domain/anchors";
import type { RigidPose } from "../domain/anchors";
import { toScreen } from "./camera";

type Point = { x: number; y: number };
type Side = "anchorA" | "anchorB";
export function JointOverlay({
  scene,
  poses,
  selected,
  editable,
  zoom,
  onSelect,
  onAnchor,
}: {
  scene: SceneDocument;
  poses: ReadonlyMap<string, RigidPose>;
  selected: string | null;
  editable: boolean;
  zoom: number;
  onSelect: (id: string) => void;
  onAnchor: (id: string, side: Side, p: Point, target?: string | null) => void;
}) {
  return (
    <>
      {scene.constraints.map((c) => {
        const aw = anchorPosition(scene, c.anchorA, poses),
          bw = anchorPosition(scene, c.anchorB, poses),
          a = toScreen(aw),
          b = toScreen(bw),
          active = selected === c.id,
          slack =
            c.type === "rope" &&
            Math.hypot(aw.x - bw.x, aw.y - bw.y) < c.maxLength - 0.005,
          pivotSide: Side = c.anchorA.type === "world" ? "anchorA" : "anchorB",
          ends =
            c.type === "hinge"
              ? [{ side: pivotSide, p: bw, label: "Pivot" }]
              : [
                  { side: "anchorA" as const, p: aw, label: "A" },
                  { side: "anchorB" as const, p: bw, label: "B" },
                ];
        const name = (side: Side) => {
          const ref = c[side];
          return ref.type === "world"
            ? "World"
            : (scene.bodies.find((body) => body.id === ref.bodyId)?.name ??
                "Body");
        };
        return (
          <g
            key={c.id}
            className={`joint-indicator ${active ? "joint-selected" : ""}`}
            data-joint={c.id}
            role="group"
          >
            <g
              role="button"
              tabIndex={0}
              aria-label={`Select joint ${c.name}`}
              onFocus={() => onSelect(c.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(c.id);
                }
              }}
            >
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="transparent"
                strokeWidth="18"
                vectorEffect="non-scaling-stroke"
                pointerEvents="stroke"
              />
              {c.type === "spring" ? (
                <polyline
                  fill="none"
                  stroke={active ? "#b45a45" : "#b37367"}
                  strokeWidth={active ? 3 : 2}
                  pointerEvents="none"
                  points={Array.from({ length: 17 }, (_, i) => {
                    const f = i / 16,
                      d = Math.hypot(b.x - a.x, b.y - a.y),
                      offset = i < 2 || i > 14 ? 0 : i % 2 ? 5 : -5;
                    return `${a.x + (b.x - a.x) * f - ((b.y - a.y) / (d || 1)) * offset},${a.y + (b.y - a.y) * f + ((b.x - a.x) / (d || 1)) * offset}`;
                  }).join(" ")}
                />
              ) : (
                <line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={
                    active
                      ? "#4267bc"
                      : c.type === "rope"
                        ? "#ad873d"
                        : "#576fbd"
                  }
                  strokeWidth={active ? 4 : 3}
                  strokeDasharray={c.type === "rope" ? "6 4" : undefined}
                  pointerEvents="none"
                />
              )}
              <circle
                cx={b.x}
                cy={b.y}
                r={c.type === "hinge" ? 10 / zoom : 4}
                fill="white"
                stroke="#576fbd"
                strokeWidth="2"
              />
              <circle
                cx={a.x}
                cy={a.y}
                r="3"
                fill="#576fbd"
                pointerEvents="none"
              />
              {!(active && editable) && (
                <text
                  x={(a.x + b.x) / 2 + 9}
                  y={(a.y + b.y) / 2 - 9}
                  fontSize="11"
                  fill="#6f7c93"
                  pointerEvents="none"
                >
                  {c.name}
                  {slack ? " · slack" : ""}
                </text>
              )}
            </g>
            {active && editable && (
              <>
                {(["anchorA", "anchorB"] as Side[]).map((side) => {
                  const ref = c[side];
                  if (ref.type !== "body") return null;
                  const body =
                    poses.get(ref.bodyId) ??
                    scene.bodies.find((body) => body.id === ref.bodyId);
                  if (!body) return null;
                  const centre = toScreen(body.position),
                    p = side === "anchorA" ? a : b;
                  return (
                    <line
                      key={side}
                      x1={centre.x}
                      y1={centre.y}
                      x2={p.x}
                      y2={p.y}
                      stroke="#9daecb"
                      strokeWidth="1"
                      strokeDasharray="2 4"
                      pointerEvents="none"
                    />
                  );
                })}
                {c.type !== "hinge" && (
                  <g data-joint-move="true" className="joint-move-grip">
                    <circle
                      cx={(a.x + b.x) / 2}
                      cy={(a.y + b.y) / 2}
                      r={14 / zoom}
                      fill="transparent"
                    />
                    <rect
                      x={(a.x + b.x) / 2 - 5 / zoom}
                      y={(a.y + b.y) / 2 - 5 / zoom}
                      width={10 / zoom}
                      height={10 / zoom}
                      fill="white"
                      stroke="#4267bc"
                      strokeWidth="2"
                    >
                      <title>
                        Drag connector; body positions stay unchanged
                      </title>
                    </rect>
                  </g>
                )}
                {ends.map(({ side, p, label }) => {
                  const q = toScreen(p);
                  return (
                    <g
                      key={side}
                      data-joint-anchor={side}
                      role="button"
                      tabIndex={0}
                      aria-label={`Move ${c.type === "hinge" ? "pivot" : `anchor ${label}`} of ${c.name}`}
                      onFocus={() => onSelect(c.id)}
                      onKeyDown={(e) => {
                        const d = e.shiftKey ? 0.5 : 0.1;
                        if (
                          [
                            "ArrowLeft",
                            "ArrowRight",
                            "ArrowUp",
                            "ArrowDown",
                          ].includes(e.key)
                        ) {
                          e.preventDefault();
                          e.stopPropagation();
                          onAnchor(c.id, side, {
                            x:
                              p.x +
                              (e.key === "ArrowLeft"
                                ? -d
                                : e.key === "ArrowRight"
                                  ? d
                                  : 0),
                            y:
                              p.y +
                              (e.key === "ArrowDown"
                                ? -d
                                : e.key === "ArrowUp"
                                  ? d
                                  : 0),
                          });
                        }
                      }}
                      className="joint-end-handle"
                    >
                      <circle
                        cx={q.x}
                        cy={q.y}
                        r={22 / zoom}
                        fill="transparent"
                      />
                      <circle
                        cx={q.x}
                        cy={q.y}
                        r={7 / zoom}
                        fill="white"
                        stroke="#4267bc"
                        strokeWidth="2"
                        pointerEvents="none"
                      />
                      <text
                        x={q.x + 10 / zoom}
                        y={q.y - 10 / zoom}
                        fontSize={11 / zoom}
                        fill="#4267bc"
                        pointerEvents="none"
                      >
                        {label} · {name(side)}
                      </text>
                    </g>
                  );
                })}
              </>
            )}
          </g>
        );
      })}
    </>
  );
}
