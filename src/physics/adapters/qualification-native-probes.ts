/** Test/qualification instrumentation only; never imported by app or public API.
 * The native method hooks are synchronous, nonconcurrent and always restored.
 * They observe C/D worlds; alternate h probes are NOT registered runtime profiles.
 */
import { World } from 'planck';
import type { SceneDocument } from '../../domain/scene';
import type { SimulationSnapshot } from '../contracts';
import { constructInitialWorld } from './planck-construction';
export interface NativeEvidence {
  nativeSteps: number; elapsedSeconds: number; firstContactSeconds: number | null;
  maxPenetration: number | null; maxContacts: number; worlds: number; bodiesRemainingAfterDispose: number;
  stepsByH: Record<string, number>;
}
let active = false;
function capture<T>(scene: SceneDocument, action: (getWorld: () => World | undefined) => T): { value: T; native: NativeEvidence } {
  if (active) throw Error('Qualification instrumentation cannot nest/concurrently mutate native methods');
  active = true;
  const create = World.prototype.createBody, step = World.prototype.step, worlds = new Set<World>();
  const native: NativeEvidence = { nativeSteps: 0, elapsedSeconds: 0, firstContactSeconds: null, maxPenetration: scene.bodies.length === 2 && scene.bodies.every(b => b.shape.type === 'circle') ? 0 : null, maxContacts: 0, worlds: 0, bodiesRemainingAfterDispose: 0, stepsByH: {} };
  World.prototype.createBody = function (this: World, ...args: Parameters<World['createBody']>) {
    if (!worlds.has(this)) {
      worlds.add(this); native.worlds++;
      this.on('begin-contact', () => { if (native.firstContactSeconds === null) native.firstContactSeconds = native.elapsedSeconds; });
    }
    return create.apply(this, args);
  } as World['createBody'];
  World.prototype.step = function (this: World, h: number, velocity?: number, position?: number) {
    native.nativeSteps++; native.elapsedSeconds += h; native.stepsByH[String(h)] = (native.stepsByH[String(h)] ?? 0) + 1;
    step.call(this, h, velocity, position);
    native.maxContacts = Math.max(native.maxContacts, this.getContactCount());
    if (scene.bodies.length === 2 && scene.bodies.every(b => b.shape.type === 'circle')) {
      const a = this.getBodyList(), b = a?.getNext();
      if (a && b) {
        const r = scene.bodies.reduce((sum, x) => sum + (x.shape.type === 'circle' ? x.shape.radius : 0), 0);
        native.maxPenetration = Math.max(native.maxPenetration ?? 0, r - Math.hypot(a.getPosition().x - b.getPosition().x, a.getPosition().y - b.getPosition().y));
      }
    }
  };
  try {
    const value = action(() => worlds.values().next().value);
    native.bodiesRemainingAfterDispose = [...worlds].reduce((sum, w) => sum + w.getBodyCount(), 0);
    return { value, native };
  } finally { World.prototype.createBody = create; World.prototype.step = step; worlds.clear(); active = false; }
}
export function observeProduction<T>(scene: SceneDocument, action: () => T): { value: T; native: NativeEvidence } {
  return capture(scene, () => action());
}
/** Freshly executed raw solver convergence on C-constructed geometry/mass.
 * No force requirements may be ignored. Does not alter any accepted setting or
 * claim that public runtime accepts alternative timestep/substep configurations.
 */
export function convergenceProbe(scene: SceneDocument, ticks: number, substeps: number) {
  if (scene.forces.length || ![1, 2, 4, 8].includes(substeps)) throw Error('Unsupported convergence probe');
  return capture(scene, getWorld => {
    const made = constructInitialWorld(scene); if (!made.ok) throw Error(JSON.stringify(made));
    const frames: SimulationSnapshot[] = [];
    try {
      for (let tick = 0; tick <= ticks; tick++) {
        if (tick > 0) for (let i = 0; i < substeps; i++) getWorld()!.step((1 / 120) / substeps, 12, 12);
        const result = made.value.snapshot(); if (!result.ok) throw Error('Convergence snapshot failed');
        frames.push({ ...result.value, tick, timeSeconds: tick / 120 });
      }
    } finally { made.value.dispose(); }
    return frames;
  });
}

/** Diagnostic ownership observation; no native handle is returned to callers. */
export function lifecycleProbe(scene: SceneDocument, cycles: number, construct: () => { ok: boolean; value?: { step(input: unknown): unknown; dispose(): void } }, locked = false) {
  const weak: WeakRef<World>[] = []; let bodiesRemaining = 0;
  for (let i = 0; i < cycles; i++) capture(scene, getWorld => {
    const made = construct(); if (!made.ok || !made.value) throw Error('Lifecycle construction failed');
    const world = getWorld()!; weak.push(new WeakRef(world));
    if (locked) world.step = () => { Reflect.set(world, 'm_locked', true); throw Error('Injected locked native failure'); };
    made.value.step([]); made.value.dispose();
    if (!locked) bodiesRemaining += world.getBodyCount();
  });
  return { cycles, bodiesRemaining, aliveWorlds: () => weak.filter(ref => ref.deref() !== undefined).length };
}
