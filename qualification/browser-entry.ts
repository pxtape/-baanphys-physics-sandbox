import { basicCases, collision, disk, scene } from './scenes';
import { evaluate, runProduction } from './core';
import { observeProduction } from '../src/physics/adapters/qualification-native-probes';
import { planckAdapterContract } from '../src/physics';

// Only the local qualification server loads this entry. No renderer/editor API.
const basic = basicCases().map(def => {
  const observed = observeProduction(def.scene, () => runProduction(def.scene, def.ticks));
  return { ...evaluate(def, observed.value, observed.native), native: observed.native };
});
const replayCases = [
  { id: 'fall', scene: scene() },
  { id: 'projectile', scene: scene([disk(1, 0, 20, 1, .1, 8, 6)]) },
  { id: 'collision', scene: collision() },
];
const replay = replayCases.map(def => ({ id: def.id, trace: runProduction(def.scene, 240) }));
Reflect.set(window, '__qualificationResult', { basic, replay,
  executionReady: planckAdapterContract.capabilities(scene()).executionReady,
  publicInitializationBlocked: !planckAdapterContract.initialize(scene()).ok,
});
