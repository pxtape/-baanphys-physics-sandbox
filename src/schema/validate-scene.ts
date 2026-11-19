import structural from './generated/scene-v1.validator.js';
import { InputError, INPUT_LIMITS, parseJson, snapshotJson } from './input';
import { validateSemantics } from './semantics';
import { freezeJson } from '../domain/scene';
import type { SceneDocument } from '../domain/scene';
import { pointer } from '../domain/diagnostics';
import type { ValidationDiagnostic } from '../domain/diagnostics';

export type SceneValidationResult =
  | { readonly ok: true; readonly scene: SceneDocument; readonly executionReady: false; readonly diagnostics: readonly ValidationDiagnostic[] }
  | { readonly ok: false; readonly diagnostics: readonly ValidationDiagnostic[] };

function failure(diagnostics: readonly ValidationDiagnostic[]): SceneValidationResult {
  return freezeJson({ ok: false as const, diagnostics: [...diagnostics] });
}
function validateSnapshot(value: unknown): SceneValidationResult {
  const diagnostics: ValidationDiagnostic[] = [];
  let truncated = false;
  const add = (diagnostic: ValidationDiagnostic) => {
    if (diagnostics.length < INPUT_LIMITS.diagnostics - 1) diagnostics.push(diagnostic);
    else if (!truncated) {
      truncated = true; diagnostics.push({ code: 'DIAGNOSTICS_TRUNCATED', path: '', stage: diagnostic.stage, severity: 'error', message: 'Further diagnostics were omitted after the reporting limit.', suggestion: 'Fix the reported problems and validate again.' });
    }
  };
  if (!structural(value)) {
    for (const error of structural.errors ?? []) {
      const property: unknown = error.params.missingProperty ?? error.params.additionalProperty;
      const path = typeof property === 'string' ? pointer(error.instancePath, property) : error.instancePath;
      add({
        code: error.instancePath === '/schemaVersion' ? 'SCHEMA_VERSION_UNSUPPORTED' : error.keyword === 'format' ? 'FORMAT_INVALID' : 'SCHEMA_INVALID',
        path, stage: 'schema', severity: 'error', message: `Scene v1 ${error.message ?? 'structural validation failed'}.`,
        suggestion: error.keyword === 'format' ? `Use a valid ${String(error.params.format)} value.` : `Correct this field according to the bundled Scene v1 schema (${error.keyword}).`,
      });
    }
    return failure(diagnostics);
  }
  validateSemantics(value, add);
  if (diagnostics.length) return failure(diagnostics);
  add({ code: 'EXECUTION_NOT_VALIDATED', path: '/simulation/engine', stage: 'execution', severity: 'warning', message: 'This document is valid for inspection; execution is not qualified by M1-02.', suggestion: 'A future trusted physics adapter must validate the exact profile, settings, capabilities and all student ranges before execution.' });
  if (value.identity.state === 'saved') add({ code: 'REVISION_HISTORY_NOT_VALIDATED', path: '/identity', stage: 'semantic', severity: 'warning', message: 'A file cannot establish ownership, parent existence or repository revision history.', suggestion: 'The future repository must check parent lineage, sequence, identity conflicts and expected head before saving.' });
  return freezeJson({ ok: true as const, scene: value, executionReady: false as const, diagnostics });
}
function inputFailure(error: unknown): SceneValidationResult {
  return failure([error instanceof InputError ? error.diagnostic : {
    code: 'INPUT_NOT_JSON', path: '', stage: 'input', severity: 'error',
    message: 'Input could not be read as plain JSON data.', suggestion: 'Import JSON text or supply an acyclic plain data object without getters or custom behavior.',
  }]);
}
/** Untrusted imports: bounded UTF-8, depth and duplicate-key validation, no network. */
export function parseSceneJson(text: string): SceneValidationResult {
  try {
    if (typeof text !== 'string') throw new InputError('JSON_TEXT_REQUIRED', '', 'Expected JSON text.', 'Supply a UTF-8 JSON string.');
    return validateSnapshot(parseJson(text));
  } catch (error) { return inputFailure(error); }
}
/** Plain in-memory JSON data. Copies before checking/freezing; never mutates the caller. */
export function validateScene(value: unknown): SceneValidationResult {
  try { return validateSnapshot(snapshotJson(value)); } catch (error) { return inputFailure(error); }
}
