import type { SceneDocument } from '../domain/scene';
import { freezeJson } from '../domain/scene';
import { snapshotJson } from '../schema/input';
import type { PhysicsResult, TickInput, PhysicsDiagnosticCode } from './contracts';
import { physicsDiagnostic } from './profile';
import { orderTickInputs } from './tick-inputs';

export const MAX_TICK_INPUTS = 200;
export function tickFailure(code: PhysicsDiagnosticCode, path: string, message: string): PhysicsResult<never> {
  return freezeJson({ ok: false as const, diagnostics: [physicsDiagnostic(code, path, message, 'Correct the entire next-tick batch within the trusted session permissions and physical limits, then retry; no inputs were applied.')] });
}
const record = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === 'object' && !Array.isArray(v);
const keys = (v: Record<string, unknown>, expected: readonly string[]) => Object.keys(v).length === expected.length && expected.every(k => Object.hasOwn(v, k));
const vector = (v: unknown): v is { x: number; y: number } => record(v) && keys(v, ['x', 'y']) && typeof v.x === 'number' && typeof v.y === 'number' && Number.isFinite(v.x) && Number.isFinite(v.y);
/** Bounded plain in-memory JSON. Proxies are not a security sandbox; external
 * transports must parse data before entering the trusted runtime composition.
 */
export function validateTickInputs(value: unknown, nextTick: number, scene: SceneDocument, allowForces: boolean): PhysicsResult<readonly TickInput[]> {
  try {
    if (!Number.isSafeInteger(nextTick) || nextTick <= 0) return tickFailure('TICK_INPUT_INVALID', '', 'Next tick exceeds the safe integer clock.');
    if (!Array.isArray(value) || Object.getPrototypeOf(value) !== Array.prototype ||
      (Object.getOwnPropertyDescriptor(value, 'length')?.value as number) > MAX_TICK_INPUTS) {
      return tickFailure('TICK_INPUT_INVALID', '', 'Expected a plain batch with at most 200 inputs.');
    }
    const copy = snapshotJson(value);
    if (!Array.isArray(copy)) return tickFailure('TICK_INPUT_INVALID', '', 'Expected an input array.');
    const inputs: TickInput[] = [];
    for (let i = 0; i < copy.length; i++) {
      const input: unknown = copy[i], path = `/${i}`;
      if (!record(input) || !keys(input, ['tick', 'sequence', 'kind', 'bodyId', 'vector', 'localPoint']) ||
        input.kind !== 'apply-force' || typeof input.tick !== 'number' || typeof input.sequence !== 'number' || typeof input.bodyId !== 'string' || !vector(input.vector) || !vector(input.localPoint)) {
        return tickFailure('TICK_INPUT_INVALID', path, 'Unknown fields/kind or malformed tick/sequence/UUID/force/point.');
      }
      const bodyId = input.bodyId;
      const body = scene.bodies.find(b => b.id.toLowerCase() === bodyId.toLowerCase());
      if (!body || body.motionType !== 'dynamic') return tickFailure('TICK_TARGET_INVALID', `${path}/bodyId`, 'Tick force target must resolve to an existing dynamic body UUID.');
      if (!allowForces) return tickFailure('TICK_PERMISSION_DENIED', path, 'This trusted session does not permit ephemeral forces.');
      inputs.push({ tick: input.tick, sequence: input.sequence, kind: input.kind, bodyId: input.bodyId, vector: input.vector, localPoint: input.localPoint });
    }
    return orderTickInputs(nextTick, inputs);
  } catch {
    return tickFailure('TICK_INPUT_INVALID', '', 'Input is not bounded finite plain JSON data (getters, cycles, host objects and malformed arrays reject).');
  }
}
