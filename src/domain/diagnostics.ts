export interface ValidationDiagnostic {
  readonly code: string;
  /** RFC 6901 JSON pointer; empty string identifies the root. */
  readonly path: string;
  readonly stage: 'input' | 'schema' | 'semantic' | 'execution';
  readonly severity: 'error' | 'warning';
  readonly message: string;
  readonly suggestion: string;
}
export type DiagnosticSink = (diagnostic: ValidationDiagnostic) => void;

export function pointer(parent: string, key: string | number): string {
  return `${parent}/${String(key).replace(/~/gu, '~0').replace(/\//gu, '~1')}`;
}
