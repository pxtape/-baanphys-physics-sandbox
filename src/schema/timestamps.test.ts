import { describe, expect, it } from 'vitest';
import example from '../../examples/falling-ball.scene.json';
import { parseSceneJson, validateScene } from './index';

// All ECMAScript \s code points, plus the two letter separators accepted by
// pinned ajv-formats 3.0.1. U+0085 and U+180E are deliberately not whitespace.
const separators = ['T', 't', ...[
  0x0009, 0x000a, 0x000b, 0x000c, 0x000d, 0x0020, 0x00a0, 0x1680,
  0x2000, 0x2001, 0x2002, 0x2003, 0x2004, 0x2005, 0x2006, 0x2007,
  0x2008, 0x2009, 0x200a, 0x2028, 0x2029, 0x202f, 0x205f, 0x3000, 0xfeff,
].map(n => String.fromCodePoint(n))];
function check(createdAt: string, savedAt: string, error?: string) {
  const scene = structuredClone(example);
  scene.identity.createdAt = createdAt;
  scene.identity.savedAt = savedAt;
  const before = JSON.stringify(scene);
  for (const result of [validateScene(scene), parseSceneJson(before)]) {
    expect(result.ok).toBe(error === undefined);
    if (error) {
      expect(result.diagnostics).toContainEqual(expect.objectContaining({ code: error }));
      expect(result).not.toHaveProperty('scene');
    } else if (result.ok && result.scene.identity.state === 'saved') {
      expect(result.scene.identity.createdAt).toBe(createdAt);
      expect(result.scene.identity.savedAt).toBe(savedAt);
      expect(result.executionReady).toBe(false);
    }
  }
  expect(JSON.stringify(scene)).toBe(before);
}

describe('UTC timestamp ordering regression', () => {
  it('rejects the exact reported tab-separated reproduction', () => {
    check('2026-11-19\t23:00:00Z', '2026-11-19T12:00:00Z', 'TIMESTAMP_ORDER');
  });
  it.each(separators.map(s => [JSON.stringify(s), s]))('orders every accepted separator %s against every other separator', (_label, a) => {
    for (const b of separators) {
      check(`2026-11-19${a}12:00:00Z`, `2026-11-19${b}23:00:00Z`);
      check(`2026-11-19${a}23:00:00Z`, `2026-11-19${b}12:00:00Z`, 'TIMESTAMP_ORDER');
      check(`2026-11-19${a}12:00:00.10Z`, `2026-11-19${b}12:00:00.1000Z`);
    }
  });
  it.each([
    ['2026-11-19T12:00:00Z', '2026-11-19T12:00:00.000000000Z'],
    ['2026-11-19T12:00:00.1Z', '2026-11-19t12:00:00.100000000000000000000Z'],
    ['2026-11-19T12:00:00Z', '2026-11-19T12:00:00Z'],
  ])('accepts equivalent instants %s and %s', (a, b) => { check(a, b); check(b, a); });
  it.each([
    ['2026-11-19T12:00:00.00000001Z', '2026-11-19T12:00:00.00000002Z'],
    ['2026-11-19T12:00:00.1Z', '2026-11-19T12:00:00.100000000000000000001Z'],
    ['2026-11-19T12:00:00.09Z', '2026-11-19T12:00:00.1Z'],
    ['2026-11-19T23:59:59.999Z', '2026-11-20T00:00:00Z'],
    ['2024-02-29T23:59:59Z', '2024-03-01T00:00:00Z'],
    ['0099-12-31T23:59:59Z', '0100-01-01T00:00:00Z'],
    ['0000-01-01T00:00:00Z', '9999-12-31T23:59:59Z'],
    ['2016-12-31T23:59:59Z', '2016-12-31T23:59:60.1Z'],
    ['2016-12-31T23:59:60.999Z', '2017-01-01T00:00:00Z'],
  ])('orders precision/calendar boundaries %s before %s', (a, b) => { check(a, b); check(b, a, 'TIMESTAMP_ORDER'); });
  it.each([
    '2026-02-29T12:00:00Z', '1900-02-29T12:00:00Z', '2026-13-01T00:00:00Z',
    '2026-11-19T24:00:00Z', '2026-11-19T12:60:00Z', '2026-11-19T12:00:60Z',
    '2026-11-19T23:59:61Z', '2026-11-19T12:00:00.Z', '2026-11-19TT12:00:00Z',
    '2026-11-19\r\n12:00:00Z', '2026-11-19\u008512:00:00Z', '2026-11-19\u180e12:00:00Z',
    '2026-11-19T12:00:00', '2026-11-19T12:00:00Z ',
  ])('rejects invalid timestamp %s in either field', value => {
    check(value, '2026-11-19T12:00:00Z', 'FORMAT_INVALID');
    check('2026-11-19T12:00:00Z', value, 'FORMAT_INVALID');
  });
  it.each(['2026-11-19T12:00:00z', '2026-11-19T12:00:00+00:00', '2026-11-19T13:00:00+01', '2026-11-19T13:00:00+0100'])('preserves UTC-Z semantic restriction for %s', value => {
    check(value, '2026-11-19T12:00:00Z', 'TIMESTAMP_NOT_UTC');
    check('2026-11-19T12:00:00Z', value, 'TIMESTAMP_NOT_UTC');
  });
});
