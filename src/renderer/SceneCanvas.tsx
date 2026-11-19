import { anchorPosition } from "../domain/anchors";
import { useRef } from "react";
import type { SceneDocument } from "../domain/scene";
export const CAMERA = {
  width: 1000,
  height: 600,
  scale: 64,
  originX: 500,
  originY: 492,
};
export const toScreen = (p: { x: number; y: number }) => ({
  x: CAMERA.originX + p.x * CAMERA.scale,
  y: CAMERA.originY - p.y * CAMERA.scale,
});
export const toWorld = (p: { x: number; y: number }) => ({
  x: (p.x - CAMERA.originX) / CAMERA.scale,
  y: (CAMERA.originY - p.y) / CAMERA.scale,
});
interface Pose {
  position: { readonly x: number; readonly y: number };
  readonly angle: number;
}
interface Props {
  scene: SceneDocument;
  selected: string | null;
  poses: ReadonlyMap<string, Pose>;
  locked: boolean;
  onSelect: (id: string | null) => void;
  onMove: (id: string, x: number, y: number) => void;
}
export function SceneCanvas({
  scene,
  selected,
  poses,
  locked,
  onSelect,
  onMove,
}: Props) {
  const drag = useRef<{
    id: string;
    dx: number;
    dy: number;
    pointer: number;
  } | null>(null);
  function pointer(e: React.PointerEvent<SVGSVGElement>) {
    const p = e.currentTarget.createSVGPoint();
    p.x = e.clientX;
    p.y = e.clientY;
    const matrix = e.currentTarget.getScreenCTM();
    return matrix
      ? toWorld(p.matrixTransform(matrix.inverse()))
      : { x: 0, y: 0 };
  }
  return (
    <svg
      className="scene-canvas"
      viewBox="0 0 1000 600"
      aria-label="Physics scene canvas"
      role="group"
      onPointerDown={(e) => {
        const node = (e.target as Element).closest("[data-body]"),
          id = node?.getAttribute("data-body");
        onSelect(id ?? null);
        if (!id || locked) return;
        const body = scene.bodies.find((b) => b.id === id)!;
        const p = pointer(e);
        drag.current = {
          id,
          dx: body.position.x - p.x,
          dy: body.position.y - p.y,
          pointer: e.pointerId,
        };
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!drag.current || locked) return;
        const p = pointer(e);
        onMove(drag.current.id, p.x + drag.current.dx, p.y + drag.current.dy);
      }}
      onPointerUp={(e) => {
        drag.current = null;
        if (e.currentTarget.hasPointerCapture(e.pointerId))
          e.currentTarget.releasePointerCapture(e.pointerId);
      }}
      onPointerCancel={() => {
        drag.current = null;
      }}
    >
      <defs>
        <marker
          id="force-head"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M0 0L10 5L0 10z" fill="#b77914" />
        </marker>
        <pattern
          id="grid"
          width="64"
          height="64"
          patternUnits="userSpaceOnUse"
          x="500"
          y="492"
        >
          <path d="M64 0H0V64" fill="none" stroke="#dce5e8" strokeWidth="1" />
        </pattern>
        <pattern
          id="floor-hatch"
          width="10"
          height="10"
          patternUnits="userSpaceOnUse"
        >
          <path d="M-2 10L10-2M8 12L12 8" stroke="#8b9ba6" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="1000" height="600" fill="url(#grid)" />
      <line x1="0" x2="1000" y1="492" y2="492" stroke="#aebec6" />
      <line x1="500" x2="500" y1="0" y2="600" stroke="#aebec6" />
      {[-6, -4, -2, 0, 2, 4, 6].map((x) => (
        <text key={x} x={500 + x * 64 + 6} y="510" className="axis-label">
          {x} m
        </text>
      ))}
      {[2, 4, 6].map((y) => (
        <text key={y} x="508" y={492 - y * 64 - 7} className="axis-label">
          {y} m
        </text>
      ))}
      <text x="960" y="480" className="axis-title">
        x →
      </text>
      <text x="513" y="27" className="axis-title">
        y ↑
      </text>
      {scene.constraints.map((c) => {
        const aw = anchorPosition(scene, c.anchorA, poses),
          bw = anchorPosition(scene, c.anchorB, poses),
          a = toScreen(aw),
          b = toScreen(bw),
          slack =
            c.type === "rope" &&
            Math.hypot(aw.x - bw.x, aw.y - bw.y) < c.maxLength - 0.005;
        return (
          <g key={c.id} className="joint-indicator" pointerEvents="none">
            <line
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={c.type === "rope" ? "#ad873d" : "#576fbd"}
              strokeWidth="3"
              strokeDasharray={c.type === "rope" ? "6 4" : undefined}
            />
            <circle
              cx={b.x}
              cy={b.y}
              r={c.type === "hinge" ? 7 : 4}
              fill="white"
              stroke="#576fbd"
              strokeWidth="2"
            />
            <circle cx={a.x} cy={a.y} r="3" fill="#576fbd" />
            <text
              x={(a.x + b.x) / 2 + 9}
              y={(a.y + b.y) / 2 - 9}
              fontSize="11"
              fill="#6f7c93"
            >
              {c.type === "rope"
                ? slack
                  ? "Slack rope"
                  : "Taut rope"
                : c.type === "rod"
                  ? "Rod"
                  : "Hinge"}
            </text>
          </g>
        );
      })}
      {scene.bodies.map((body) => {
        const pose = poses.get(body.id) ?? body,
          p = toScreen(pose.position),
          shape = body.shape;
        return (
          <g
            key={body.id}
            data-body={body.id}
            role="button"
            aria-label={`Select ${body.name}`}
            tabIndex={0}
            onFocus={() => onSelect(body.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(body.id);
              }
              if (
                !locked &&
                ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(
                  e.key,
                )
              ) {
                e.preventDefault();
                const d = e.shiftKey ? 0.5 : 0.1;
                onMove(
                  body.id,
                  body.position.x +
                    (e.key === "ArrowRight"
                      ? d
                      : e.key === "ArrowLeft"
                        ? -d
                        : 0),
                  body.position.y +
                    (e.key === "ArrowUp" ? d : e.key === "ArrowDown" ? -d : 0),
                );
              }
            }}
            transform={`translate(${p.x} ${p.y}) rotate(${(-pose.angle * 180) / Math.PI})`}
            className={`body ${body.motionType === "static" ? "static-body" : "dynamic-body"} ${selected === body.id ? "selected" : ""}`}
          >
            {shape.type === "circle" ? (
              <circle r={shape.radius * 64} />
            ) : shape.type === "rectangle" ? (
              <rect
                x={-shape.width * 32}
                y={-shape.height * 32}
                width={shape.width * 64}
                height={shape.height * 64}
                rx="2"
              />
            ) : null}
            {body.motionType === "static" && shape.type === "rectangle" && (
              <rect
                className="hatching"
                x={-shape.width * 32}
                y={-shape.height * 32}
                width={shape.width * 64}
                height={shape.height * 64}
                fill="url(#floor-hatch)"
              />
            )}
            {body.motionType === "dynamic" && (
              <>
                {shape.type === "circle" && (
                  <line
                    className="rotation-mark"
                    x1="0"
                    y1="0"
                    x2={shape.radius * 64 * 0.75}
                    y2="0"
                  />
                )}
                <circle className="centre-dot" r="3" />
                <text
                  className="object-label"
                  y={shape.type === "circle" ? -shape.radius * 64 - 12 : -40}
                  textAnchor="middle"
                >
                  {body.name}
                </text>
              </>
            )}
          </g>
        );
      })}
      {scene.forces.map((f) => {
        const b = scene.bodies.find((b) => b.id === f.bodyId);
        if (!b) return null;
        const pose = poses.get(b.id) ?? b,
          c = Math.cos(pose.angle),
          sn = Math.sin(pose.angle),
          start = toScreen({
            x: pose.position.x + c * f.localPoint.x - sn * f.localPoint.y,
            y: pose.position.y + sn * f.localPoint.x + c * f.localPoint.y,
          });
        const m = Math.hypot(f.vector.x, f.vector.y),
          scale = m ? Math.min(18, 100 / m) : 18;
        return (
          <g key={f.id} pointerEvents="none" className="force-arrow">
            <line
              x1={start.x}
              y1={start.y}
              x2={start.x + f.vector.x * scale}
              y2={start.y - f.vector.y * scale}
              stroke="#b77914"
              strokeWidth="2.5"
              markerEnd="url(#force-head)"
            />
            <circle cx={start.x} cy={start.y} r="3" fill="#b77914" />
            <text
              x={start.x + f.vector.x * scale + 7}
              y={start.y - f.vector.y * scale - 7}
              fontSize="12"
              fill="#98620b"
            >
              {m.toFixed(1)} N
            </text>
          </g>
        );
      })}
    </svg>
  );
}
