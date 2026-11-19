import { freezeJson } from '../domain/scene';

/** Provisional rejection policy, NOT a measured continuous accuracy envelope.
 * Provenance and uncertainty: CAPABILITY_LIMITS.md. No native settings changed.
 */
export const CAPABILITY_LIMITS = freezeJson({
  minLength: 0.02, maxLength: 100, maxWorldRadius: 1000,
  minMass: 0.01, maxMass: 1000, maxMassRatio: 100,
  minInertia: 1e-8, maxInertia: 1e7,
  maxSpeed: 100, maxAngularSpeed: 100,
  maxGravity: 100, maxAcceleration: 100, maxAngularAcceleration: 10000,
  maxForce: 1000, maxAggregateForce: 1000, maxLever: 50, maxTorque: 1000,
  maxVertices: 8,
} as const);
/** Source-reviewed native Planck 1.5.1 constants, not accuracy tolerances. */
export const NATIVE_ENVELOPE = freezeJson({
  linearSlop: 0.005, polygonRadius: 0.01,
  maxTranslation: 2, maxRotation: Math.PI / 2,
} as const);
