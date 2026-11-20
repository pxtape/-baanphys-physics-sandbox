import type { SimulationSnapshot } from "../physics/contracts";
import type { PhysicalProperties } from "../physics/physical-properties";

export const SAMPLE_STRIDE = 4;
export const SAMPLE_LIMIT = 600;
/** Bounded detached native snapshots, sampled on logical ticks (never render time). */
export class SnapshotLog {
  private samples: SimulationSnapshot[] = [];
  private previous: SimulationSnapshot | null = null;
  private accelerations = new WeakMap<
    SimulationSnapshot,
    ReadonlyMap<string, { x: number; y: number }>
  >();
  acceleration(snapshot: SimulationSnapshot, id: string) {
    return this.accelerations.get(snapshot)?.get(id);
  }
  clear() {
    this.samples = [];
    this.previous = null;
    this.accelerations = new WeakMap();
  }
  record(snapshot: SimulationSnapshot) {
    if (snapshot.tick === 0) this.clear();
    if (this.previous && snapshot.tick <= this.previous.tick) return;
    if (this.previous && snapshot.tick === this.previous.tick + 1) {
      const dt = snapshot.timeSeconds - this.previous.timeSeconds;
      if (Number.isFinite(dt) && dt > 0) {
        const old = new Map(this.previous.bodies.map((b) => [b.id, b])),
          values = new Map<string, { x: number; y: number }>();
        for (const b of snapshot.bodies) {
          const p = old.get(b.id);
          if (p)
            values.set(b.id, {
              x: (b.velocity.x - p.velocity.x) / dt,
              y: (b.velocity.y - p.velocity.y) / dt,
            });
        }
        this.accelerations.set(snapshot, values);
      }
    }
    this.previous = snapshot;
    if (snapshot.tick % SAMPLE_STRIDE !== 0) return;
    if (snapshot.tick <= (this.samples.at(-1)?.tick ?? -1)) return;
    this.samples.push(snapshot);
    if (this.samples.length > SAMPLE_LIMIT) this.samples.shift();
  }
  read(latest: SimulationSnapshot | null): readonly SimulationSnapshot[] {
    if (!latest) return [];
    return latest.tick > (this.samples.at(-1)?.tick ?? -1)
      ? [...this.samples, latest]
      : [...this.samples];
  }
}
export function kineticEnergy(
  properties: Pick<PhysicalProperties, "mass" | "inertia">,
  motion: {
    readonly velocity: { readonly x: number; readonly y: number };
    readonly angularVelocity: number;
  },
) {
  const translation =
      0.5 * properties.mass * (motion.velocity.x ** 2 + motion.velocity.y ** 2),
    rotation = 0.5 * properties.inertia * motion.angularVelocity ** 2,
    total = translation + rotation;
  return [translation, rotation, total].every(
    (n) => Number.isFinite(n) && n >= 0,
  )
    ? { translation, rotation, total }
    : null;
}
