import type { SceneV1 } from './scene-v1.generated';

/** One JSON representation, derived from the canonical schema; never engine handles.
 * Domain values use SI (metres, kilograms, seconds, radians), y up and CCW angles.
 * view.pixelsPerMeter is presentation metadata, not a physics length scale.
 */
export type DeepReadonly<T> = T extends readonly (infer Item)[]
  ? readonly DeepReadonly<Item>[]
  : T extends object ? { readonly [Key in keyof T]: DeepReadonly<T[Key]> } : T;
export type SceneDocument = DeepReadonly<SceneV1>;
export type SceneBody = SceneDocument['bodies'][number];
export type BodyShape = SceneBody['shape'];
export type WorldVector = SceneBody['position'];
export type SceneConstraint = SceneDocument['constraints'][number];

/** Freeze only fresh, validated JSON data; callers' objects are never frozen. */
export function freezeJson<T>(value: T): DeepReadonly<T> {
  if (value !== null && typeof value === 'object') {
    for (const child of Object.values(value)) freezeJson(child);
    Object.freeze(value);
  }
  return value as DeepReadonly<T>;
}
