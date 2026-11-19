import { Settings } from 'planck';
import * as Planck from 'planck';
// Runtime export exists in pinned 1.5.1 but is absent from its declaration file.
// Confine this reflection to the native boundary; never expose it publicly.
const SettingsInternal: object = Reflect.get(Planck, 'SettingsInternal');

/** Complete pinned Planck 1.5.1 Settings surface. Native defaults retained,
 * except the approved zero restitution threshold. Not scene-selected options.
 */
export const APPROVED_NATIVE_SETTINGS = Object.freeze({
  lengthUnitsPerMeter: 1, maxManifoldPoints: 2, maxPolygonVertices: 12,
  aabbExtension: 0.1, aabbMultiplier: 2, linearSlop: 0.005,
  angularSlop: (2 / 180) * Math.PI, polygonRadius: 0.01,
  maxSubSteps: 8, maxTOIContacts: 32, maxTOIIterations: 20, maxDistanceIterations: 20,
  velocityThreshold: 0, maxLinearCorrection: 0.2, maxAngularCorrection: (8 / 180) * Math.PI,
  maxTranslation: 2, maxRotation: 0.5 * Math.PI, baumgarte: 0.2, toiBaugarte: 0.75,
  timeToSleep: 0.5, linearSleepTolerance: 0.01, angularSleepTolerance: (2 / 180) * Math.PI,
} as const);
export const APPROVED_INTERNAL_SETTINGS = Object.freeze({
  ...APPROVED_NATIVE_SETTINGS,
  linearSlopSquared: 0.005 * 0.005,
  maxTranslationSquared: 4, maxRotationSquared: (0.5 * Math.PI) * (0.5 * Math.PI),
  linearSleepToleranceSqr: 0.01 * 0.01,
  angularSleepToleranceSqr: ((2 / 180) * Math.PI) * ((2 / 180) * Math.PI),
});
/** Shared read-only guard for construction and future runtime. Never repairs drift. */
export function nativeSettingsMatch(): boolean {
  try {
    if (!SettingsInternal || typeof SettingsInternal !== 'object' && typeof SettingsInternal !== 'function') return false;
    return Object.entries(APPROVED_NATIVE_SETTINGS).every(([key, value]) => Reflect.get(Settings, key) === value)
    && Object.entries(APPROVED_INTERNAL_SETTINGS).filter(([key]) => key !== 'lengthUnitsPerMeter')
      .every(([key, value]) => Reflect.get(SettingsInternal, key) === value);
  } catch { return false; }
}
let initialized = false;
/** One trusted bootstrap from upstream's threshold=1 to approved threshold=0.
 * All other values must already match. No bootstrap/reset on later drift.
 */
export function initializeNativeSettings(): boolean {
  try {
    if (!initialized) {
      const threshold = Settings.velocityThreshold;
      const othersMatch = Object.entries(APPROVED_NATIVE_SETTINGS)
        .filter(([key]) => key !== 'velocityThreshold').every(([key, value]) => Reflect.get(Settings, key) === value);
      if (!othersMatch || threshold !== 0 && threshold !== 1) return false;
      if (threshold === 1) Settings.velocityThreshold = 0;
      initialized = true;
    }
    return nativeSettingsMatch();
  } catch { return false; }
}
