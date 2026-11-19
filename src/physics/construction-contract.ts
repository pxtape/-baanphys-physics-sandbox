import type { PhysicsResult, SimulationSnapshot } from './contracts';
/** Internal trusted C-only harness; never an executable PhysicsRuntime.
 * No native handles, stepping, forces or solver mutation methods.
 */
export interface InitialWorldSession {
  snapshot(): PhysicsResult<SimulationSnapshot>;
  dispose(): void;
}
export type ConstructionCheckpoint = 'world' | 'body' | 'fixture' | 'mass';
/** Trusted test instrumentation only; receives no engine handles or source data. */
export type ConstructionObserver = (stage: ConstructionCheckpoint, index: number) => void;
