import type { SimulationSnapshot } from "../physics/contracts";
import type { PhysicalProperties } from "../physics/physical-properties";

export const SAMPLE_STRIDE = 4;
export const SAMPLE_LIMIT = 600;
/** Bounded detached native snapshots, sampled on logical ticks (never render time). */
export class SnapshotLog {
  private samples: SimulationSnapshot[] = [];
  clear() {
    this.samples = [];
  }
  record(snapshot: SimulationSnapshot) {
    if (snapshot.tick === 0) this.clear();
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
