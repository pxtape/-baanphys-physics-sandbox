import { freezeJson } from '../domain/scene';
import type { SceneDocument } from '../domain/scene';
import type { PhysicsAdapter } from './contracts';
import { INPUT_LIMITS } from '../schema/input';
import { PLANCK_IDENTITY, physicsDiagnostic } from './profile';
import { checkPlanckCapabilities } from './capabilities';

/** Contract-only facade. Policy eligibility never constructs a native runtime. */
export const planckAdapterContract = Object.freeze({
  identity: PLANCK_IDENTITY,
  capabilities: checkPlanckCapabilities,
  initialize(scene: SceneDocument) {
    const report = checkPlanckCapabilities(scene);
    const diagnostics = [physicsDiagnostic('ADAPTER_NOT_IMPLEMENTED', '', 'No qualified production runtime is implemented.', 'Await M1-03C/D/E; no runtime was constructed.'), ...report.diagnostics];
    if (diagnostics.length > INPUT_LIMITS.diagnostics) diagnostics.splice(INPUT_LIMITS.diagnostics - 1, diagnostics.length, physicsDiagnostic('CAPABILITY_DIAGNOSTICS_TRUNCATED', '', 'Further diagnostics were omitted.', 'Fix reported problems and validate again.'));
    return freezeJson({ ok: false as const, diagnostics });
  },
}) satisfies PhysicsAdapter;
