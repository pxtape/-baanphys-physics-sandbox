import type { PhysicsResult, PhysicsRuntime, SimulationSnapshot } from './contracts';
/** Trusted composition context, never read from authored scene/student data. */
export interface RuntimePermissions { readonly allowTickForces: boolean }
/** Internal only until E qualification; unknown inputs require runtime validation. */
export interface InternalRuntime extends PhysicsRuntime {
  step(inputs: unknown): PhysicsResult<SimulationSnapshot>;
}
