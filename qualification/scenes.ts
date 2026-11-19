import example from '../examples/falling-ball.scene.json';
import type { SceneV1, Body } from '../src/domain/scene-v1.generated';
import { PLANCK_IDENTITY, PLANCK_SETTINGS } from '../src/physics/profile';

export const uuid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
export function disk(n: number, x: number, y: number, mass = 1, radius = .1, vx = 0, vy = 0): Body {
  return { id: uuid(n), name: `Disk ${n}`, motionType: 'dynamic', shape: { type: 'circle', radius },
    position: { x, y }, velocity: { x: vx, y: vy }, angle: 0, angularVelocity: 0,
    massModel: { mode: 'mass', mass }, material: { friction: 0, staticFriction: 0, restitution: 1 } };
}
export function scene(bodies: Body[] = [disk(1, 0, 20)]): SceneV1 {
  const s = structuredClone(example) as SceneV1;
  s.identity = { state: 'draft' }; s.title = 'E qualification fixture';
  Object.assign(s.simulation, structuredClone(PLANCK_SETTINGS)); s.simulation.engine = { ...PLANCK_IDENTITY };
  s.world.gravity = { x: 0, y: -9.81 }; s.bodies = bodies; s.forces = []; s.constraints = []; s.measurements = []; s.studentPolicy.controls = [];
  return s;
}
export function collision(mass2 = 2, speed = 2): SceneV1 {
  const s = scene([disk(1, -1, 0, 1, .25, speed), disk(2, 1, 0, mass2, .25)]); s.world.gravity.y = 0; return s;
}
export interface CaseDefinition { id: string; kind: 'fall' | 'projectile' | 'collision'; scene: SceneV1; ticks: number }
export function basicCases(): CaseDefinition[] {
  return [
    ...[.1, 1, 10].map(mass => ({ id: `B1-m${mass}`, kind: 'fall' as const, scene: scene([disk(1, 0, 20, mass)]), ticks: 120 })),
    { id: 'B2', kind: 'projectile', scene: scene([disk(1, 0, 20, 1, .1, 8, 6)]), ticks: 120 },
    ...[1, 2, 10, 100].map(mass => ({ id: `B3-ratio${mass}`, kind: 'collision' as const, scene: collision(mass), ticks: 180 })),
  ];
}
export function wall(n: number, x: number, y: number, width: number, height: number): Body {
  return { ...disk(n, x, y), name: `Wall ${n}`, motionType: 'static', shape: { type: 'rectangle', width, height } };
}
export function stressScene(): SceneV1 {
  const bodies: Body[] = [];
  for (let row = 0; row < 8; row++) for (let col = 0; col < 12; col++) bodies.push(disk(bodies.length + 1, -2.2 + .4 * col, -1.4 + .4 * row, 1, .1, col % 2 ? -.08 : .08, row % 2 ? -.06 : .06));
  bodies.push(wall(97, -5, 0, .1, 10), wall(98, 5, 0, .1, 10), wall(99, 0, -5, 10, .1), wall(100, 0, 5, 10, .1));
  const s = scene(bodies); s.world.gravity.y = 0; return s;
}
