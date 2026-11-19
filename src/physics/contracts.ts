import type { SceneDocument, WorldVector } from '../domain/scene';
import type { ValidationDiagnostic } from '../domain/diagnostics';

export type EngineIdentity = SceneDocument['simulation']['engine'];
export type PhysicsDiagnosticCode =
  | 'ENGINE_UNSUPPORTED' | 'ENGINE_VERSION_UNSUPPORTED' | 'ADAPTER_VERSION_UNSUPPORTED'
  | 'PROFILE_UNSUPPORTED' | 'SETTINGS_UNSUPPORTED' | 'FEATURE_NOT_QUALIFIED'
  | 'CAPABILITY_SCENE_INVALID' | 'CAPABILITY_LIMIT_EXCEEDED' | 'CAPABILITY_GEOMETRY_UNSUPPORTED'
  | 'CAPABILITY_MATERIAL_UNSUPPORTED' | 'CAPABILITY_FEATURE_UNSUPPORTED' | 'CAPABILITY_DIAGNOSTICS_TRUNCATED'
  | 'ADAPTER_NOT_IMPLEMENTED' | 'TICK_INPUT_INVALID' | 'RUNTIME_DISPOSED';
export interface PhysicsDiagnostic extends ValidationDiagnostic {
  readonly code: PhysicsDiagnosticCode;
  readonly stage: 'execution';
  readonly severity: 'error';
}
/** Identity/settings matching is NOT numerical or feature qualification. */
export interface CapabilityReport {
  readonly profileCompatible: boolean;
  readonly executionReady: boolean;
  readonly diagnostics: readonly PhysicsDiagnostic[];
}
/** Ephemeral trusted tick input; never an authored SceneDocument mutation.
 * Force in world N at a body-local point in metres, reapplied each substep of
 * this tick only. This contract does not enable a live-force feature.
 */
export interface TickInput {
  readonly tick: number;
  /** Unique nonnegative safe integer within a tick; ascending application order. */
  readonly sequence: number;
  readonly kind: 'apply-force';
  readonly bodyId: string;
  readonly vector: WorldVector;
  readonly localPoint: WorldVector;
}
/** Detached immutable SI values only: metres, m/s, radians CCW and rad/s; y up. */
export interface BodySnapshot {
  readonly id: string;
  readonly position: WorldVector;
  readonly velocity: WorldVector;
  readonly angle: number;
  readonly angularVelocity: number;
}
export interface SimulationSnapshot {
  readonly identity: EngineIdentity;
  /** Initial state tick=0; timeSeconds=tick*persisted timestepSeconds. */
  readonly tick: number;
  readonly timeSeconds: number;
  /** Stable UUID order. No bodies, fixtures, contacts or engine handles. */
  readonly bodies: readonly BodySnapshot[];
}
export type PhysicsResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly diagnostics: readonly PhysicsDiagnostic[] };
export interface PhysicsRuntime {
  /** Exactly one persisted logical tick including all substeps; no variable dt.
   * Validate the entire next-tick input batch before mutation; no partial step
   * for rejected inputs. Numerical failure must stop the runtime visibly.
   */
  step(inputs: readonly TickInput[]): PhysicsResult<SimulationSnapshot>;
  snapshot(): PhysicsResult<SimulationSnapshot>;
  /** Idempotent, release all native resources. Further step/snapshot reject. */
  dispose(): void;
}
export interface PhysicsAdapter {
  readonly identity: EngineIdentity;
  /** Authored input is never modified; successful construction starts at tick 0.
   * All structural, semantic and capability checks precede construction; failure
   * returns diagnostics without a runtime and cleans up any native allocations.
   */
  initialize(scene: SceneDocument): PhysicsResult<PhysicsRuntime>;
  capabilities(scene: SceneDocument): CapabilityReport;
}
