import {
  pointerTransform,
  forcePointerTransform,
  forceDisplayScale,
} from "./manipulation";
import type { BodyTransform, Point } from "./manipulation";
import type { Body } from "../domain/scene-v1.generated";
import { anchorPosition } from "../domain/anchors";
import { useRef, useState } from "react";
import type { SceneDocument } from "../domain/scene";
import { toScreen, toWorld, fitSceneView } from "./camera";
export { CAMERA, toScreen, toWorld } from "./camera";
interface Pose {
  position: { readonly x: number; readonly y: number };
  readonly angle: number;
  readonly velocity?: { readonly x: number; readonly y: number };
}
interface Props {
  scene: SceneDocument;
  selected: string | null;
  poses: ReadonlyMap<string, Pose>;
  locked: boolean;
  showVelocity?: boolean;
  onGestureStart?: () => void;
  onGestureEnd?: () => void;
  onSelect: (id: string | null) => void;
  onMove: (id: string, x: number, y: number) => void;
  onPivot: (id: string, point: Point) => void;
  onTransform: (id: string, value: BodyTransform) => void;
  onForce: (
    id: string,
    value: { vector: Point } | { localPoint: Point },
  ) => void;
}
export function SceneCanvas({
  scene,
  selected,
  poses,
  locked,
  onSelect,
  onMove,
  onPivot,
  onTransform,
  onForce,
  showVelocity = false,
  onGestureStart,
  onGestureEnd,
}: Props) {
  const [view, setView] = useState({ zoom: 1, x: 0, y: 0 }),
    [panMode, setPanMode] = useState(false);
  const [follow, setFollow] = useState(false);
  const followed = follow && locked && selected ? poses.get(selected) : null,
    centre = followed ? toScreen(followed.position) : null,
    cameraX = centre ? centre.x - 500 : view.x,
    cameraY = centre ? centre.y - 300 : view.y,
    left = 500 + cameraX - 500 / view.zoom,
    top = 300 + cameraY - 300 / view.zoom;
  const pan = useRef<{
    inverse: DOMMatrix;
    start: DOMPoint;
    x: number;
    y: number;
    pointer: number;
  } | null>(null);
  const pivotDrag = useRef<{
    id: string;
    dx: number;
    dy: number;
    pointer: number;
  } | null>(null);
  const forceDrag = useRef<{
    id: string;
    body: Body;
    force: SceneDocument["forces"][number];
    start: Point;
    mode: "vector" | "point";
    pointer: number;
    scale: number;
  } | null>(null);
  const drag = useRef<{
    id: string;
    dx: number;
    dy: number;
    pointer: number;
    mode?: "rotate" | "resize" | undefined;
    body?: Body;
    start?: Point;
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
    <div className="canvas-wrap">
      <div className="viewport-tools">
        <button
          aria-label="Zoom in"
          disabled={view.zoom >= 4}
          onClick={() =>
            setView((v) => ({ ...v, zoom: Math.min(4, v.zoom * 1.5) }))
          }
        >
          +
        </button>
        <button
          aria-label="Zoom out"
          disabled={view.zoom <= 0.25}
          onClick={() =>
            setView((v) => ({ ...v, zoom: Math.max(0.25, v.zoom / 1.5) }))
          }
        >
          −
        </button>
        <button
          aria-label="Reset view"
          onClick={() => {
            setFollow(false);
            setView({ zoom: 1, x: 0, y: 0 });
          }}
        >
          Home
        </button>
        <button
          aria-label="Fit scene in view"
          onClick={() => {
            setFollow(false);
            setView(fitSceneView(scene, poses));
          }}
        >
          Fit scene
        </button>
        <button
          aria-pressed={follow}
          disabled={!locked || !selected}
          onClick={() => {
            if (follow) setView((v) => ({ ...v, x: cameraX, y: cameraY }));
            setFollow((v) => !v);
          }}
        >
          Follow preview
        </button>
        <button aria-pressed={panMode} onClick={() => setPanMode((p) => !p)}>
          Pan view
        </button>
        <span>{Math.round(view.zoom * 100)}%</span>
      </div>
      <svg
        className="scene-canvas"
        viewBox={`${left} ${top} ${1000 / view.zoom} ${600 / view.zoom}`}
        aria-label="Physics scene canvas"
        role="group"
        onPointerDown={(e) => {
          if (
            drag.current ||
            pan.current ||
            forceDrag.current ||
            pivotDrag.current
          )
            return;
          if (panMode || e.button === 1) {
            const inverse = e.currentTarget.getScreenCTM()?.inverse();
            if (!inverse) return;
            const point = new DOMPoint(e.clientX, e.clientY).matrixTransform(
              inverse,
            );
            setFollow(false);
            setView((v) => ({ ...v, x: cameraX, y: cameraY }));
            pan.current = {
              inverse,
              start: point,
              x: cameraX,
              y: cameraY,
              pointer: e.pointerId,
            };
            e.currentTarget.setPointerCapture(e.pointerId);
            e.preventDefault();
            return;
          }
          if (e.button !== 0) return;
          const pivotNode = (e.target as Element).closest("[data-pivot-id]");
          if (pivotNode && !locked) {
            const c = scene.constraints.find(
              (c) => c.id === pivotNode.getAttribute("data-pivot-id"),
            );
            if (!c) return;
            const a =
              c.anchorA.type === "world"
                ? c.anchorA
                : c.anchorB.type === "world"
                  ? c.anchorB
                  : null;
            if (!a) return;
            const p = pointer(e);
            pivotDrag.current = {
              id: c.id,
              dx: a.point.x - p.x,
              dy: a.point.y - p.y,
              pointer: e.pointerId,
            };
            onGestureStart?.();
            e.currentTarget.setPointerCapture(e.pointerId);
            return;
          }
          const handleNode = (e.target as Element).closest(
            "[data-force-handle]",
          );
          if (handleNode && !locked) {
            const id = handleNode.getAttribute("data-force-id"),
              force = scene.forces.find((f) => f.id === id),
              body = scene.bodies.find((b) => b.id === force?.bodyId);
            if (!force || !body) return;
            onGestureStart?.();
            forceDrag.current = {
              id: force.id,
              body: structuredClone(body) as Body,
              force,
              start: pointer(e),
              pointer: e.pointerId,
              mode:
                handleNode.getAttribute("data-force-handle") === "point"
                  ? "point"
                  : "vector",
              scale: forceDisplayScale(force.vector),
            };
            e.currentTarget.setPointerCapture(e.pointerId);
            return;
          }
          const node = (e.target as Element).closest(
              "[data-body], [data-transform-body]",
            ),
            id =
              node?.getAttribute("data-body") ??
              node?.getAttribute("data-transform-body");
          onSelect(id ?? null);
          if (!id || locked) return;
          onGestureStart?.();
          const body = scene.bodies.find((b) => b.id === id)!;
          const p = pointer(e);
          const handle = (e.target as Element)
            .closest("[data-handle]")
            ?.getAttribute("data-handle");
          drag.current = {
            id,
            mode:
              handle === "rotate" || handle === "resize" ? handle : undefined,
            body: structuredClone(body) as Body,
            start: p,
            dx: body.position.x - p.x,
            dy: body.position.y - p.y,
            pointer: e.pointerId,
          };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (pan.current && pan.current.pointer === e.pointerId) {
            const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(
                pan.current.inverse,
              ),
              start = pan.current;
            setView((v) => ({
              ...v,
              x: start.x - (p.x - start.start.x),
              y: start.y - (p.y - start.start.y),
            }));
            return;
          }
          if (
            pivotDrag.current &&
            !locked &&
            pivotDrag.current.pointer === e.pointerId
          ) {
            const p = pointer(e),
              d = pivotDrag.current;
            onPivot(d.id, { x: p.x + d.dx, y: p.y + d.dy });
            return;
          }
          if (
            forceDrag.current &&
            !locked &&
            forceDrag.current.pointer === e.pointerId
          ) {
            const f = forceDrag.current,
              value = forcePointerTransform(
                f.body,
                f.force,
                f.mode,
                f.start,
                pointer(e),
              );
            if (value) onForce(f.id, value);
            return;
          }
          if (!drag.current || locked || drag.current.pointer !== e.pointerId)
            return;
          const p = pointer(e);
          if (drag.current.mode && drag.current.body && drag.current.start) {
            const value = pointerTransform(
              drag.current.body,
              drag.current.mode,
              drag.current.start,
              p,
            );
            if (value) onTransform(drag.current.id, value);
          } else
            onMove(
              drag.current.id,
              p.x + drag.current.dx,
              p.y + drag.current.dy,
            );
        }}
        onPointerUp={(e) => {
          if (pivotDrag.current?.pointer === e.pointerId) {
            pivotDrag.current = null;
            onGestureEnd?.();
          }
          if (forceDrag.current?.pointer === e.pointerId) {
            forceDrag.current = null;
            onGestureEnd?.();
          }
          if (drag.current?.pointer === e.pointerId) {
            drag.current = null;
            onGestureEnd?.();
          }
          pan.current = null;
          if (e.currentTarget.hasPointerCapture(e.pointerId))
            e.currentTarget.releasePointerCapture(e.pointerId);
        }}
        onPointerCancel={() => {
          if (pivotDrag.current) {
            pivotDrag.current = null;
            onGestureEnd?.();
          }
          if (forceDrag.current) {
            forceDrag.current = null;
            onGestureEnd?.();
          }
          if (drag.current) {
            drag.current = null;
            onGestureEnd?.();
          }
          pan.current = null;
        }}
      >
        <defs>
          <marker
            id="velocity-head"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto"
          >
            <path d="M0 0L10 5L0 10z" fill="#4576bd" />
          </marker>
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
        <rect
          x={left}
          y={top}
          width={1000 / view.zoom}
          height={600 / view.zoom}
          fill="url(#grid)"
        />
        <line
          x1={left}
          x2={left + 1000 / view.zoom}
          y1="492"
          y2="492"
          stroke="#aebec6"
        />
        <line
          x1="500"
          x2="500"
          y1={top}
          y2={top + 600 / view.zoom}
          stroke="#aebec6"
        />
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
                      (e.key === "ArrowUp"
                        ? d
                        : e.key === "ArrowDown"
                          ? -d
                          : 0),
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
              ) : shape.type === "polygon" ? (
                <polygon
                  points={shape.vertices
                    .map((v) => `${v.x * 64},${-v.y * 64}`)
                    .join(" ")}
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
            scale =
              forceDrag.current?.id === f.id
                ? forceDrag.current.scale
                : forceDisplayScale(f.vector);
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
              {!locked && selected === b.id && (
                <>
                  <circle
                    className="force-handle"
                    data-force-id={f.id}
                    data-force-handle="point"
                    pointerEvents="all"
                    cx={start.x}
                    cy={start.y}
                    r="7"
                    aria-label="Drag force application point"
                  >
                    <title>Move application point (body-local)</title>
                  </circle>
                  <rect
                    className="force-handle"
                    data-force-id={f.id}
                    data-force-handle="vector"
                    pointerEvents="all"
                    x={start.x + f.vector.x * scale - 6}
                    y={start.y - f.vector.y * scale - 6}
                    width="12"
                    height="12"
                    aria-label="Drag force vector"
                  >
                    <title>Change force direction and magnitude (N)</title>
                  </rect>
                </>
              )}
            </g>
          );
        })}
        {showVelocity &&
          scene.bodies
            .filter((b) => b.motionType === "dynamic")
            .map((b) => {
              const pose = poses.get(b.id) ?? b,
                v = pose.velocity ?? b.velocity,
                p = toScreen(pose.position),
                m = Math.hypot(v.x, v.y),
                scale = m ? Math.min(12, 120 / m) : 12;
              return (
                <g key={b.id} className="velocity-arrow" pointerEvents="none">
                  <line
                    x1={p.x}
                    y1={p.y}
                    x2={p.x + v.x * scale}
                    y2={p.y - v.y * scale}
                    stroke="#4576bd"
                    strokeWidth="2"
                    markerEnd="url(#velocity-head)"
                  />
                  <text
                    x={p.x + v.x * scale + 6}
                    y={p.y - v.y * scale - 5}
                    fontSize="11"
                    fill="#4576bd"
                  >
                    {m.toFixed(2)} m/s
                  </text>
                </g>
              );
            })}
        {!locked &&
          scene.constraints.map((c) => {
            const world =
                c.anchorA.type === "world"
                  ? c.anchorA
                  : c.anchorB.type === "world"
                    ? c.anchorB
                    : null,
              body =
                c.anchorA.type === "body"
                  ? c.anchorA
                  : c.anchorB.type === "body"
                    ? c.anchorB
                    : null;
            if (!world || body?.bodyId !== selected) return null;
            const p = toScreen(world.point);
            return (
              <g key={c.id} className="pivot-tool">
                <circle
                  data-pivot-id={c.id}
                  aria-label="Drag fixed world pivot"
                  cx={p.x}
                  cy={p.y}
                  r="10"
                >
                  <title>Move world pivot and attached body</title>
                </circle>
                <path
                  d={`M${p.x - 4} ${p.y}h8M${p.x} ${p.y - 4}v8`}
                  pointerEvents="none"
                />
              </g>
            );
          })}
        {!locked &&
          (() => {
            const b = scene.bodies.find((q) => q.id === selected);
            if (!b) return null;
            const p = toScreen(b.position),
              hw =
                (b.shape.type === "circle"
                  ? b.shape.radius
                  : b.shape.type === "rectangle"
                    ? b.shape.width / 2
                    : Math.max(...b.shape.vertices.map((v) => Math.abs(v.x)))) *
                64,
              hh =
                (b.shape.type === "circle"
                  ? b.shape.radius
                  : b.shape.type === "rectangle"
                    ? b.shape.height / 2
                    : Math.max(...b.shape.vertices.map((v) => Math.abs(v.y)))) *
                64;
            return (
              <g
                className="transform-handles"
                data-transform-body={b.id}
                transform={`translate(${p.x} ${p.y}) rotate(${(-b.angle * 180) / Math.PI})`}
              >
                <line
                  x1="0"
                  y1={-hh}
                  x2="0"
                  y2={-hh - 32}
                  stroke="#57909b"
                  strokeWidth="1.5"
                  pointerEvents="none"
                />
                <circle
                  data-handle="rotate"
                  aria-label="Drag to rotate selected object"
                  cx="0"
                  cy={-hh - 32}
                  r="9"
                  className="rotate-handle"
                >
                  <title>Rotate — drag around the centre</title>
                </circle>
                <rect
                  data-handle="resize"
                  aria-label="Drag to resize selected object"
                  x={hw - 8}
                  y={(b.shape.type === "rectangle" ? hh : 0) - 8}
                  width="16"
                  height="16"
                  className="resize-handle"
                >
                  <title>
                    {b.shape.type === "polygon"
                      ? "Uniform scale — centre remains fixed"
                      : "Resize — centre remains fixed"}
                  </title>
                </rect>
              </g>
            );
          })()}
      </svg>
    </div>
  );
}
