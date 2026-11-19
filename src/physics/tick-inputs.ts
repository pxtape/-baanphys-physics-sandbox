import { freezeJson } from '../domain/scene';
import type { PhysicsResult, TickInput } from './contracts';
import { physicsDiagnostic } from './profile';

/** Pure batch ordering for trusted typed data, not an untrusted import parser.
 * Call after scene validation; future runtime must validate dynamic body targets
 * and capability bounds before applying anything. tick denotes the next tick.
 */
export function orderTickInputs(tick: number, inputs: readonly TickInput[]): PhysicsResult<readonly TickInput[]> {
  const sequences = new Set<number>();
  const valid = Number.isSafeInteger(tick) && tick > 0 && inputs.every(input => {
    const numbers = [input.vector.x, input.vector.y, input.localPoint.x, input.localPoint.y];
    if (input.tick !== tick || input.kind !== 'apply-force' || !input.bodyId ||
      !Number.isSafeInteger(input.sequence) || input.sequence < 0 || sequences.has(input.sequence) || !numbers.every(Number.isFinite)) return false;
    sequences.add(input.sequence); return true;
  });
  if (!valid) return freezeJson({ ok: false as const, diagnostics: [physicsDiagnostic('TICK_INPUT_INVALID', '', 'Inputs require the next positive safe-integer tick, unique nonnegative safe-integer sequences and finite force/point values.', 'Correct the complete batch before stepping; no inputs were applied.')] });
  const ordered = inputs.map(input => ({ tick: input.tick, sequence: input.sequence, kind: input.kind, bodyId: input.bodyId, vector: { x: input.vector.x, y: input.vector.y }, localPoint: { x: input.localPoint.x, y: input.localPoint.y } })).sort((a, b) => a.sequence - b.sequence);
  return freezeJson({ ok: true as const, value: ordered });
}
