import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';

const eslint = new ESLint();

describe('application module boundaries', () => {
  it.each([
    ['src/editor/probe.ts', "export { World } from 'planck';"],
    ['src/domain/probe.ts', "export type { Body } from 'planck';"],
    ['src/app/probe.ts', "export { World } from 'planck/dist/planck';"],
    ['src/editor/probe.ts', "export { value } from '../physics/adapters/planck';"],
    ['src/renderer/probe.ts', "export { value } from '../domain/../physics/adapters/planck';"],
    ['src/app/probe.ts', "export { value } from '../../poc/engine-comparison/adapters.mjs';"],
    ['src/app/probe.ts', "export const load = () => import('../../poc/engine-comparison/adapters.mjs');"],
    ['src/domain/probe.ts', "export { useState } from 'react';"],
    ['src/domain/probe.ts', "export type { Runtime } from '../physics/runtime';"],
    ['src/domain/probe.ts', "export type { Repository } from '../persistence/repository';"],
    ['src/schema/probe.ts', "export { value } from '../physics/runtime';"],
    ['src/physics/probe.ts', "export { value } from '../editor/state';"],
    ['src/persistence/probe.ts', "export { value } from '../app/App';"],
    ['src/player/probe.ts', "export { value } from '../persistence/repository';"],
    ['src/renderer/probe.ts', "export { value } from '../physics/runtime';"],
    ['src/editor/probe.ts', "export type NativeBody = import('planck').Body;"],
    ['src/app/probe.ts', "export const load = (path: string) => import(path);"],
    ['src/app/probe.ts', "export const engine = require('planck');"],
  ])('rejects forbidden dependency in %s: %s', async (filePath, code) => {
    const [result] = await eslint.lintText(code, { filePath });
    expect(result?.messages.some((message) => message.ruleId === 'architecture/imports')).toBe(true);
  });

  it.each([
    ['src/physics/adapters/probe.ts', "export { World } from 'planck';"],
    ['src/physics/probe.ts', "export { value } from './adapters/planck';"],
    ['src/renderer/probe.ts', "export type { Scene } from '../domain/scene';"],
    ['src/editor/probe.ts', "export type { Scene } from '../domain/scene';"],
    ['src/player/probe.ts', "export type { Resolver } from '../integration/resolver';"],
  ])('allows the intended boundary in %s: %s', async (filePath, code) => {
    const [result] = await eslint.lintText(code, { filePath });
    expect(result?.errorCount).toBe(0);
  });
});
