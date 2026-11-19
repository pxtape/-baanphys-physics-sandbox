/* Generated from schemas/scene-v1.schema.json. Do not edit; run npm run generate:scene. */

/**
 * This interface was referenced by `SceneV1`'s JSON-Schema
 * via the `definition` "identity".
 */
export type Identity =
  | {
      state: 'draft';
    }
  | {
      state: 'saved';
      simulationId: Id;
      revisionId: Id;
      revisionNumber: number;
      parentRevisionId: Id | null;
      createdAt: string;
      savedAt: string;
    };
/**
 * This interface was referenced by `SceneV1`'s JSON-Schema
 * via the `definition` "id".
 */
export type Id = string;
/**
 * This interface was referenced by `SceneV1`'s JSON-Schema
 * via the `definition` "name".
 */
export type Name = string;
/**
 * This interface was referenced by `SceneV1`'s JSON-Schema
 * via the `definition` "shape".
 */
export type Shape =
  | {
      type: 'circle';
      radius: number;
    }
  | {
      type: 'rectangle';
      width: number;
      height: number;
    }
  | {
      type: 'polygon';
      /**
       * @minItems 3
       * @maxItems 128
       */
      vertices: Vector[];
    };
/**
 * This interface was referenced by `SceneV1`'s JSON-Schema
 * via the `definition` "massModel".
 */
export type MassModel =
  | {
      mode: 'mass';
      mass: number;
    }
  | {
      mode: 'density';
      arealDensity: number;
    };
/**
 * This interface was referenced by `SceneV1`'s JSON-Schema
 * via the `definition` "constraint".
 */
export type Constraint =
  | {
      id: Id;
      name: Name;
      anchorA: Anchor;
      anchorB: Anchor;
      collideConnected: boolean;
      type: 'hinge';
    }
  | {
      id: Id;
      name: Name;
      anchorA: Anchor;
      anchorB: Anchor;
      collideConnected: boolean;
      type: 'rod';
      length: number;
    }
  | {
      id: Id;
      name: Name;
      anchorA: Anchor;
      anchorB: Anchor;
      collideConnected: boolean;
      type: 'rope';
      maxLength: number;
    }
  | {
      id: Id;
      name: Name;
      anchorA: Anchor;
      anchorB: Anchor;
      collideConnected: boolean;
      type: 'spring';
      restLength: number;
      springConstant: number;
      dampingCoefficient: number;
    };
/**
 * This interface was referenced by `SceneV1`'s JSON-Schema
 * via the `definition` "anchor".
 */
export type Anchor =
  | {
      type: 'world';
      point: Vector;
    }
  | {
      type: 'body';
      bodyId: Id;
      localPoint: Vector;
    };
/**
 * This interface was referenced by `SceneV1`'s JSON-Schema
 * via the `definition` "control".
 */
export type Control =
  | {
      id: Id;
      label: Name;
      min: number;
      max: number;
      step: number;
      target: {
        type: 'body';
        bodyId: Id;
        parameter: 'mass' | 'velocityX' | 'velocityY';
      };
    }
  | {
      id: Id;
      label: Name;
      min: number;
      max: number;
      step: number;
      target: {
        type: 'world';
        parameter: 'gravityX' | 'gravityY';
      };
    };

/**
 * Planning contract; schema ID is a placeholder namespace, not a deployed service. SI, y-up, counterclockwise. Semantic and capability checks are mandatory.
 */
export interface SceneV1 {
  schemaVersion: 1;
  identity: Identity;
  title: string;
  description?: string;
  units: 'SI';
  world: {
    gravity: Vector;
  };
  simulation: Simulation;
  /**
   * @minItems 0
   * @maxItems 100
   */
  bodies: Body[];
  /**
   * @minItems 0
   * @maxItems 100
   */
  constraints: Constraint[];
  /**
   * @minItems 0
   * @maxItems 200
   */
  forces: Force[];
  /**
   * @minItems 0
   * @maxItems 20
   */
  measurements: Measurement[];
  studentPolicy: {
    /**
     * @minItems 0
     * @maxItems 50
     */
    controls: Control[];
  };
  view: {
    cameraCenter: Vector;
    pixelsPerMeter: number;
    vectors: {
      velocity: boolean;
      acceleration: boolean;
      appliedForce: boolean;
    };
  };
}
/**
 * This interface was referenced by `SceneV1`'s JSON-Schema
 * via the `definition` "vector".
 */
export interface Vector {
  x: number;
  y: number;
}
/**
 * This interface was referenced by `SceneV1`'s JSON-Schema
 * via the `definition` "simulation".
 */
export interface Simulation {
  engine: {
    name: 'matter-js' | 'planck';
    version: string;
    adapterVersion: string;
    profile: string;
  };
  timestepSeconds: 0.016666666666666666 | 0.008333333333333333 | 0.004166666666666667;
  substeps: number;
  solverIterations: {
    position: number;
    velocity: number;
    constraint: number;
  };
  sleeping: false;
  seed: number;
}
/**
 * This interface was referenced by `SceneV1`'s JSON-Schema
 * via the `definition` "body".
 */
export interface Body {
  id: Id;
  name: Name;
  motionType: 'dynamic' | 'static';
  shape: Shape;
  position: Vector;
  angle: number;
  velocity: Vector;
  angularVelocity: number;
  massModel: MassModel;
  material: {
    friction: number;
    staticFriction: number;
    restitution: number;
  };
}
/**
 * This interface was referenced by `SceneV1`'s JSON-Schema
 * via the `definition` "force".
 */
export interface Force {
  id: Id;
  type: 'constantForce';
  bodyId: Id;
  vector: Vector;
  localPoint: Vector;
}
/**
 * This interface was referenced by `SceneV1`'s JSON-Schema
 * via the `definition` "measurement".
 */
export interface Measurement {
  id: Id;
  bodyId: Id;
  quantity:
    | 'positionX'
    | 'positionY'
    | 'velocityX'
    | 'velocityY'
    | 'accelerationX'
    | 'accelerationY'
    | 'angularVelocity'
    | 'kineticEnergy';
  display: 'meter' | 'graph' | 'both';
  sampleEveryTicks: number;
  maxSamples: number;
}
