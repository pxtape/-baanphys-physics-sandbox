import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { expect, it } from 'vitest';

type Trajectory = { path: string; sha256: string; frames: number };
type Case = { status: string; failure: unknown; metrics: { pass: boolean }[]; trajectory: Trajectory };
interface Report {
  provenance: Record<string, string>;
  basic: Case[]; convergence: Case[]; probes: { trajectory: Trajectory }[];
  basicStatus: string; replay: { pass: boolean }[];
  executionReady: boolean; publicInitializationBlocked: boolean;
  longRun: { requestedSeconds: number; completedTicks: number; trajectory: Trajectory; native: { nativeSteps: number }; replay: { completedTicks: number; normalizedError: number; pass: boolean } };
}
const report = async () => JSON.parse(await readFile('qualification/results/physics.json', 'utf8')) as Report;
const hash = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');
async function verifySources(provenance: Record<string, string>) {
  for (const [path, expected] of Object.entries(provenance)) expect(hash(await readFile(path)), path).toBe(expected);
}
it('recorded production qualification matches source and every raw trajectory digest', async () => {
  const r = await report(); await verifySources(r.provenance);
  for (const c of [...r.basic, ...r.convergence, ...r.probes, r.longRun]) {
    const bytes = await readFile(c.trajectory.path); expect(hash(bytes), c.trajectory.path).toBe(c.trajectory.sha256);
  }
});
it('recorded numerical outcomes cannot hide a failed metric or enable execution', async () => {
  const r = await report();
  for (const c of [...r.basic, ...r.convergence]) expect(c.status).toBe(!c.failure && c.metrics.every(m => m.pass) ? 'PASS' : 'FAIL');
  expect(r.basicStatus).toBe(r.basic.every(c => c.status === 'PASS') && r.replay.every(c => c.pass) ? 'PASS' : 'FAIL');
  expect(r.executionReady).toBe(false); expect(r.publicInitializationBlocked).toBe(true);
});
it('recorded long-run evidence is a complete 600-second run and fresh reconstruction, not quick mode', async () => {
  const r = await report(); expect(r.longRun.requestedSeconds).toBe(600); expect(r.longRun.completedTicks).toBe(72000);
  expect(r.longRun.native.nativeSteps).toBe(288000); expect(r.longRun.trajectory.frames).toBe(61);
  expect(r.longRun.replay.completedTicks).toBe(72000); expect(r.longRun.replay.pass).toBe(true);
  expect(r.longRun.replay.normalizedError).toBeLessThanOrEqual(1e-10);
});
it('browser evidence stays linked to its sources and unavailable browsers never count as passed', async () => {
  const r = JSON.parse(await readFile('qualification/results/browser.json', 'utf8')) as {
    provenance: Record<string, string>; executionReady: boolean;
    browsers: { status: string; transportPass?: boolean; comparisons?: { pass: boolean }[]; basic?: { status: string }[]; reason?: string }[];
  };
  await verifySources(r.provenance); expect(r.executionReady).toBe(false);
  for (const b of r.browsers) {
    if (b.status === 'UNAVAILABLE') expect(b.reason).toBeTruthy();
    if (b.status === 'PASS') { expect(b.transportPass).toBe(true); expect(b.comparisons?.every(c => c.pass)).toBe(true); expect(b.basic?.every(c => c.status === 'PASS')).toBe(true); }
  }
});
