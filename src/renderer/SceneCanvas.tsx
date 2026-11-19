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
    </svg>
  );
}
