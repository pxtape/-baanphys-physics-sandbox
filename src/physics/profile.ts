import { freezeJson } from '../domain/scene';
import type { SceneDocument } from '../domain/scene';
import type { CapabilityReport, PhysicsDiagnostic, PhysicsDiagnosticCode } from './contracts';

/** Exact registry identity; no semver ranges or fallback. Not yet qualified. */
export const PLANCK_IDENTITY = freezeJson({
  name: 'planck' as const, version: '1.5.1', adapterVersion: '1.0.0', profile: 'planck-1.5.1-si-v1',
} as const);
export const PLANCK_SETTINGS = freezeJson({
  timestepSeconds: 1 / 120, substeps: 4,
  solverIterations: { position: 12, velocity: 12, constraint: 12 },
  sleeping: false,
} as const);
export function physicsDiagnostic(code: PhysicsDiagnosticCode, path: string, message: string, suggestion: string): PhysicsDiagnostic {
  return Object.freeze({ code, path, stage: 'execution', severity: 'error', message, suggestion });
}
/** Trusted, already structurally/semantically validated SceneDocument only.
 * Identity/settings only; use checkPlanckCapabilities for provisional policy. No native code.
 */
export function checkPlanckContract(scene: SceneDocument): CapabilityReport {
  const diagnostics: PhysicsDiagnostic[] = [];
  const engine = scene.simulation.engine;
  const codes = { name: 'ENGINE_UNSUPPORTED', version: 'ENGINE_VERSION_UNSUPPORTED', adapterVersion: 'ADAPTER_VERSION_UNSUPPORTED', profile: 'PROFILE_UNSUPPORTED' } as const;
  for (const key of ['name', 'version', 'adapterVersion', 'profile'] as const) {
    if (engine[key] !== PLANCK_IDENTITY[key]) diagnostics.push(physicsDiagnostic(codes[key], `/simulation/engine/${key}`, `Expected exactly ${PLANCK_IDENTITY[key]}.`, 'Use the registered exact identity; no fallback or scene rewriting is performed.'));
  }
  for (const key of ['timestepSeconds', 'substeps', 'sleeping'] as const) {
    if (scene.simulation[key] !== PLANCK_SETTINGS[key]) diagnostics.push(physicsDiagnostic('SETTINGS_UNSUPPORTED', `/simulation/${key}`, `Expected ${String(PLANCK_SETTINGS[key])}.`, 'Use the approved persisted settings; scheduling cannot alter numerical settings.'));
  }
  for (const key of ['position', 'velocity', 'constraint'] as const) {
    if (scene.simulation.solverIterations[key] !== PLANCK_SETTINGS.solverIterations[key]) diagnostics.push(physicsDiagnostic('SETTINGS_UNSUPPORTED', `/simulation/solverIterations/${key}`, 'Expected iteration budget 12.', 'Use 12/12 with constraint budget 12 mapped to the shared solver.'));
  }
  const profileCompatible = diagnostics.length === 0;
  diagnostics.push(physicsDiagnostic('FEATURE_NOT_QUALIFIED', '', 'Production runtime and numerical qualification are not implemented; provisional policy alone cannot qualify execution.', 'Keep this scene inspection-only until later M1-03 tasks pass.'));
  return freezeJson({ profileCompatible, executionReady: false, diagnostics });
}
