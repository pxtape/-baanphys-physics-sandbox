import schema from '../../schemas/scene-v1.schema.json';
import { pointer } from '../domain/diagnostics';
import type { ValidationDiagnostic } from '../domain/diagnostics';

export const INPUT_LIMITS = Object.freeze({ bytes: 2 * 1024 * 1024, depth: 32, diagnostics: 100 });
const collectionLimits = new Map<string, number>([
  ['/bodies', schema.properties.bodies.maxItems], ['/constraints', schema.properties.constraints.maxItems],
  ['/forces', schema.properties.forces.maxItems], ['/measurements', schema.properties.measurements.maxItems],
  ['/studentPolicy/controls', schema.properties.studentPolicy.properties.controls.maxItems],
]);
const polygonLimit = schema.$defs.shape.oneOf.find((branch) => branch.properties.type.const === 'polygon')!.properties.vertices!.maxItems;
export class InputError extends Error {
  readonly diagnostic: ValidationDiagnostic;
  constructor(code: string, path: string, message: string, suggestion: string) {
    super(message); this.diagnostic = { code, path, stage: 'input', severity: 'error', message, suggestion };
  }
}
function fail(code: string, path: string, message: string, suggestion = 'Supply plain finite JSON data conforming to Scene v1.'): never {
  throw new InputError(code, path, message, suggestion);
}
function checkArray(path: string, length: number) {
  const maximum = collectionLimits.get(path) ?? (/^\/bodies\/\d+\/shape\/vertices$/u.test(path) ? polygonLimit : undefined);
  if (maximum !== undefined && length > maximum) fail('RESOURCE_COLLECTION_LIMIT', path, `Collection exceeds the maximum of ${maximum} entries.`, 'Split the scene or remove excess entries before importing.');
}
export function checkBytes(text: string): void {
  if (text.length > INPUT_LIMITS.bytes || new TextEncoder().encode(text).byteLength > INPUT_LIMITS.bytes) {
    fail('RESOURCE_BYTES_EXCEEDED', '', 'Scene JSON exceeds 2 MiB UTF-8.', 'Reduce the scene file size to at most 2 MiB.');
  }
}
const own = (object: object, key: string, value: unknown) => Object.defineProperty(object, key, { value, writable: true, enumerable: true, configurable: true });

/** Bounded JSON parser: decoded duplicate names are rejected before they can be lost.
 * Native JSON.parse is used only for individual strings/numbers, never as eval.
 */
export function parseJson(text: string): unknown {
  checkBytes(text);
  let cursor = 0;
  const scalarPattern = /(?:true|false|null|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)/uy;
  const whitespace = () => { while (cursor < text.length && /[\x20\t\r\n]/u.test(text[cursor]!)) cursor++; };
  const syntax = (path: string): never => fail('JSON_SYNTAX', path, `Invalid JSON near character ${cursor}.`, 'Use standard JSON syntax without comments, trailing commas or executable expressions.');
  const string = (path: string): string => {
    const start = cursor++;
    while (cursor < text.length) {
      const char = text[cursor++];
      if (char === '\\') cursor++;
      else if (char === '"') {
        try { return JSON.parse(text.slice(start, cursor)) as string; } catch { return syntax(path); }
      }
    }
    return syntax(path);
  };
  const value = (path: string, depth: number): unknown => {
    whitespace(); const char = text[cursor];
    if (char === '{' || char === '[') {
      if (depth > INPUT_LIMITS.depth) fail('RESOURCE_DEPTH_EXCEEDED', path, 'JSON container nesting exceeds 32.', 'Flatten nested input to at most 32 containers.');
      cursor++; whitespace();
      if (char === '{') {
        const object: Record<string, unknown> = {}; const keys = new Set<string>();
        if (text[cursor] === '}') { cursor++; return object; }
        while (cursor < text.length) {
          if (text[cursor] !== '"') return syntax(path);
          const key = string(path), child = pointer(path, key);
          if (keys.has(key)) fail('JSON_DUPLICATE_KEY', child, 'Duplicate JSON object member.', 'Keep exactly one occurrence of each decoded member name.');
          keys.add(key); whitespace(); if (text[cursor++] !== ':') return syntax(child);
          own(object, key, value(child, depth + 1)); whitespace();
          if (text[cursor] === '}') { cursor++; return object; }
          if (text[cursor++] !== ',') return syntax(path);
          whitespace();
        }
      } else {
        const array: unknown[] = [];
        if (text[cursor] === ']') { cursor++; return array; }
        while (cursor < text.length) {
          checkArray(path, array.length + 1); array.push(value(pointer(path, array.length), depth + 1)); whitespace();
          if (text[cursor] === ']') { cursor++; return array; }
          if (text[cursor++] !== ',') return syntax(path);
          whitespace();
        }
      }
      return syntax(path);
    }
    if (char === '"') return string(path);
    scalarPattern.lastIndex = cursor;
    const token = scalarPattern.exec(text)?.[0];
    if (!token) return syntax(path);
    cursor += token.length;
    const scalar: unknown = JSON.parse(token);
    if (typeof scalar === 'number' && !Number.isFinite(scalar)) fail('INPUT_NONFINITE_NUMBER', path, 'Numbers must remain finite after JSON parsing.');
    return scalar;
  };
  const result = value('', 1); whitespace(); if (cursor !== text.length) return syntax('');
  return result;
}

/** Snapshot plain JSON values without invoking accessors or toJSON; no caller aliases.
 * Use parseSceneJson for untrusted text. Arbitrary JS Proxy traps cannot be made inert.
 */
export function snapshotJson(input: unknown): unknown {
  const ancestors = new Set<object>(); let budget = 0;
  const charge = (bytes: number, path: string) => {
    budget += bytes;
    if (budget > INPUT_LIMITS.bytes) fail('RESOURCE_BYTES_EXCEEDED', path, 'Input exceeds 2 MiB serialized UTF-8.');
  };
  const scalarBytes = (value: string | number | boolean | null) => new TextEncoder().encode(JSON.stringify(value)).byteLength;
  const copy = (value: unknown, path: string, depth: number): unknown => {
    if (value === null || typeof value === 'boolean') { charge(scalarBytes(value), path); return value; }
    if (typeof value === 'number') {
      if (!Number.isFinite(value)) fail('INPUT_NONFINITE_NUMBER', path, 'Numbers must be finite.');
      charge(scalarBytes(value), path); return value;
    }
    if (typeof value === 'string') {
      if (value.length > INPUT_LIMITS.bytes) fail('RESOURCE_BYTES_EXCEEDED', path, 'A string exceeds the input size limit.');
      charge(scalarBytes(value), path);
      return value;
    }
    if (typeof value !== 'object') fail('INPUT_NOT_JSON', path, 'Only JSON values are accepted; undefined, functions, symbols and bigint are not JSON.');
    if (depth > INPUT_LIMITS.depth) fail('RESOURCE_DEPTH_EXCEEDED', path, 'JSON container nesting exceeds 32.');
    if (ancestors.has(value)) fail('INPUT_CYCLE', path, 'Scene input contains a cycle.');
    const array = Array.isArray(value);
    const prototype: unknown = Object.getPrototypeOf(value);
    if (!array && prototype !== Object.prototype && prototype !== null) fail('INPUT_NOT_JSON', path, 'Scene members must be plain JSON objects, not class instances.');
    const descriptors = Object.getOwnPropertyDescriptors(value);
    if (Object.getOwnPropertySymbols(value).length) fail('INPUT_NOT_JSON', path, 'Symbol-keyed properties are not JSON.');
    const length = array ? (descriptors.length!.value as number) : 0;
    if (array) checkArray(path, length);
    charge(2, path); ancestors.add(value);
    const output: Record<string, unknown> | unknown[] = array ? [] : {};
    let entries = 0;
    for (const [key, descriptor] of Object.entries(descriptors)) {
      if (array && key === 'length') continue;
      if (!('value' in descriptor) || !descriptor.enumerable) fail('INPUT_NOT_JSON', pointer(path, key), 'Accessors and non-enumerable properties are not JSON data.');
      if (array && (!/^(0|[1-9]\d*)$/u.test(key) || Number(key) >= length)) fail('INPUT_NOT_JSON', pointer(path, key), 'Named array properties are not JSON data.');
      charge((array ? 0 : scalarBytes(key) + 1) + (entries ? 1 : 0), path);
      own(output, key, copy(descriptor.value, pointer(path, key), depth + 1)); entries++;
    }
    ancestors.delete(value);
    if (array && entries !== length) fail('INPUT_NOT_JSON', path, 'Sparse arrays are not JSON data.');
    return output;
  };
  const snapshot = copy(input, '', 1); checkBytes(JSON.stringify(snapshot)); return snapshot;
}
