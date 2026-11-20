import { useMemo, useState } from "react";
import type { SceneBody } from "../domain/scene";
import type { SimulationSnapshot } from "../physics/contracts";
import { physicalProperties } from "../physics/physical-properties";
import { kineticEnergy } from "../measurements/samples";

const quantities = {
  x: { label: "Position x", unit: "m" },
  y: { label: "Position y", unit: "m" },
  vx: { label: "Velocity x", unit: "m/s" },
  vy: { label: "Velocity y", unit: "m/s" },
  speed: { label: "Speed", unit: "m/s" },
  energy: { label: "Kinetic energy", unit: "J" },
  ax: { label: "Acceleration x (tick average)", unit: "m/s²" },
  ay: { label: "Acceleration y (tick average)", unit: "m/s²" },
  px: { label: "Momentum x", unit: "kg·m/s" },
  py: { label: "Momentum y", unit: "kg·m/s" },
  omega: { label: "Angular velocity", unit: "rad/s" },
} as const;
export function MeasurementGraph({
  body,
  samples,
  acceleration,
}: {
  body: SceneBody | undefined;
  samples: readonly SimulationSnapshot[];
  acceleration: (
    snapshot: SimulationSnapshot,
    id: string,
  ) => { x: number; y: number } | undefined;
}) {
  const [quantity, setQuantity] = useState<keyof typeof quantities>("y");
  const properties = useMemo(
    () => (body ? physicalProperties(body) : null),
    [body],
  );
  const data = useMemo(() => {
    if (!body) return [];
    const index = samples[0]?.bodies.findIndex((b) => b.id === body.id) ?? -1;
    return samples.flatMap((s) => {
      const b = s.bodies[index];
      if (!b || b.id !== body.id) return [{ t: s.timeSeconds, v: NaN }];
      if (quantity === "ax" || quantity === "ay") {
        const a = acceleration(s, body.id);
        return a
          ? [{ t: s.timeSeconds, v: quantity === "ax" ? a.x : a.y }]
          : []; // t=0 has no measured interval.
      }
      if (quantity === "omega")
        return [{ t: s.timeSeconds, v: b.angularVelocity }];
      if (quantity === "px" || quantity === "py")
        return [
          {
            t: s.timeSeconds,
            v: properties?.ok
              ? properties.value.mass *
                (quantity === "px" ? b.velocity.x : b.velocity.y)
              : NaN,
          },
        ];
      const v =
        quantity === "x"
          ? b.position.x
          : quantity === "y"
            ? b.position.y
            : quantity === "vx"
              ? b.velocity.x
              : quantity === "vy"
                ? b.velocity.y
                : quantity === "speed"
                  ? Math.hypot(b.velocity.x, b.velocity.y)
                  : properties?.ok
                    ? (kineticEnergy(properties.value, b)?.total ?? NaN)
                    : NaN;
      return [{ t: s.timeSeconds, v }];
    });
  }, [body, samples, quantity, properties, acceleration]);
  const q = quantities[quantity],
    valid = data.length > 0 && data.every((p) => Number.isFinite(p.v)),
    low = valid ? Math.min(...data.map((p) => p.v)) : 0,
    high = valid ? Math.max(...data.map((p) => p.v)) : 1,
    margin = Math.max(
      (high - low) * 0.1,
      Math.max(Math.abs(low), Math.abs(high)) * 0.02,
      0.01,
    ),
    min =
      quantity === "speed" || quantity === "energy"
        ? Math.max(0, low - margin)
        : low - margin,
    max = high + margin,
    start = data[0]?.t ?? 0,
    end = data.at(-1)?.t ?? 0,
    span = Math.max(end - start, 1 / 120),
    sx = (t: number) => 66 + ((t - start) / span) * 630,
    sy = (v: number) => 162 - ((v - min) / (max - min)) * 130,
    points = data.map((p) => `${sx(p.t)},${sy(p.v)}`).join(" ");
  const fmt = (n: number) =>
    Math.abs(n) >= 10000 || (Math.abs(n) > 0 && Math.abs(n) < 0.001)
      ? n.toExponential(2)
      : Number(n.toFixed(3)).toString();
  function exportCsv() {
    if (!valid || !body) return;
    const csv = [
      `time_s,${quantity}_${q.unit.replace("/", "_per_").replace("²", "2").replace("·", "_")}`,
      ...data.map((p) => `${p.t},${p.v}`),
    ].join("\r\n");
    const url = URL.createObjectURL(
        new Blob([csv], { type: "text/csv;charset=utf-8" }),
      ),
      a = document.createElement("a");
    a.href = url;
    a.download = `baanphys-${body.id}-${quantity}.csv`;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <section className="measurement-graph" aria-label="Simulation measurements">
      <div className="graph-heading">
        <strong>{body?.name ?? "Select a body"}</strong>
        <label>
          Graph{" "}
          <select
            aria-label="Graph quantity"
            value={quantity}
            onChange={(e) =>
              setQuantity(e.target.value as keyof typeof quantities)
            }
          >
            {Object.entries(quantities).map(([id, v]) => (
              <option key={id} value={id}>
                {v.label} ({v.unit})
              </option>
            ))}
          </select>
        </label>
        <button disabled={!valid} onClick={exportCsv}>
          Export CSV
        </button>
        <output aria-label="Graph latest value">
          {valid ? fmt(data.at(-1)!.v) : "—"} {q.unit}
        </output>
      </div>
      {valid ? (
        <svg
          viewBox="0 0 720 205"
          role="img"
          aria-label={`${q.label} versus simulation time for ${body!.name}`}
        >
          {[0, 0.5, 1].map((f) => {
            const v = min + (max - min) * f;
            return (
              <g key={f}>
                <line
                  x1="66"
                  x2="696"
                  y1={sy(v)}
                  y2={sy(v)}
                  className="graph-grid"
                />
                <text x="58" y={sy(v) + 4} textAnchor="end">
                  {fmt(v)}
                </text>
              </g>
            );
          })}
          <line x1="66" x2="696" y1="162" y2="162" className="graph-axis" />
          <text x="12" y="18">
            {q.unit}
          </text>
          <text x="66" y="181">
            {start.toFixed(3)}
          </text>
          <text x="696" y="181" textAnchor="end">
            {end.toFixed(3)}
          </text>
          <text x="380" y="199" textAnchor="middle">
            Simulation time (s)
          </text>
          <polyline
            className="measurement-line"
            data-sample-count={data.length}
            points={points}
          />
          <circle
            cx={sx(data.at(-1)!.t)}
            cy={sy(data.at(-1)!.v)}
            r="3"
            fill="#7c68b4"
          />
        </svg>
      ) : (
        <p className="graph-empty">
          {samples.length
            ? "Measurement unavailable for this body."
            : "Press Play or Step to record actual simulation samples."}
        </p>
      )}
      <p className="graph-note">
        30 Hz from solver ticks + latest tick · up to 600 stored samples (~20 s)
        · Reset clears the run.{" "}
        {(quantity === "ax" || quantity === "ay") &&
          "Acceleration is Δv/Δt over the last logical tick; collisions give tick-averaged peaks, not instantaneous contact force. "}
        {quantity === "energy"
          ? "K = ½mv² + ½Iω² for this body; excludes potential energy and work."
          : "Trails connect sampled positions; graphs do not predict motion."}
      </p>
    </section>
  );
}
