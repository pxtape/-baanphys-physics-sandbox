// Isolated qualification adapters. Not production code or a scene importer.
import Matter from 'matter-js';
import * as P from 'planck';
// Educational elastic collisions must not become inelastic below the game default 1 m/s.
// Global engine constant: configure once; all worlds in this PoC use this same profile.
P.Settings.velocityThreshold=0;
export const SCALE = 100; // engine length units/metre, independent of any viewport
export const BASE_HZ = 60; // Matter normalizes its velocity API to a 1/60 s base
export const V = (x=0,y=0) => ({x,y});
export const settings = {
  'matter-js': {version:'0.20.0',positionIterations:12,velocityIterations:12,constraintIterations:8,
    lengthUnitsPerMetre:SCALE,slopMetres:0.0001,circleHull:'Matter default: ceil(max(10,min(25,r*100))) rounded to even',
    frictionMix:'min(dynamic), max(static multiplier); multiplier=1 so nominal static=dynamic',restitutionMix:'max',sleeping:false,seed:1},
  planck: {version:'1.5.1',positionIterations:12,velocityIterations:12,constraintIterations:null,
    lengthUnitsPerMetre:1,linearSlop:P.Settings.linearSlop,polygonRadius:P.Settings.polygonRadius,
    restitutionThreshold:P.Settings.velocityThreshold,upstreamDefaultRestitutionThreshold:1,maxTranslation:P.Settings.maxTranslation,maxRotation:P.Settings.maxRotation,
    frictionMix:'sqrt(muA*muB); single Coulomb coefficient',restitutionMix:'max',continuousPhysics:true,warmStarting:true,sleeping:false,seed:1},
};
export function createAdapter(name, gravity=V(0,-9.81)) {
  if(name==='matter-js') return new MatterAdapter(gravity);
  if(name==='planck') return new PlanckAdapter(gravity);
  throw new Error('Unknown engine');
}
class MatterAdapter {
  constructor(g) {
    Matter.Common._seed=1;
    this.world=Matter.Engine.create({enableSleeping:false,positionIterations:12,velocityIterations:12,constraintIterations:8,
      gravity:{x:g.x,y:g.y,scale:SCALE/1e6}});
    this.elapsed=0; this.firstContact=null;
    Matter.Events.on(this.world,'collisionStart',()=>{this.firstContact??=this.elapsed;});
  }
  body({x=0,y=0,r=0.1,w,h,m=1,I,angle=0,vx=0,vy=0,omega=0,static:fixed=false,mu=0,restitution=0}={}) {
    const options={frictionAir:0,friction:mu,frictionStatic:mu ? 1:0,restitution,slop:0.01};
    const b=w===undefined?Matter.Bodies.circle(x*SCALE,y*SCALE,r*SCALE,options):Matter.Bodies.rectangle(x*SCALE,y*SCALE,w*SCALE,h*SCALE,options);
    Matter.Body.setMass(b,m);
    Matter.Body.setInertia(b,(I??(w===undefined?m*r*r/2:m*(w*w+h*h)/12))*SCALE*SCALE);
    Matter.Body.setAngle(b,angle);
    Matter.Body.setVelocity(b,V(vx*SCALE/BASE_HZ,vy*SCALE/BASE_HZ));
    Matter.Body.setAngularVelocity(b,omega/BASE_HZ);
    if(fixed) Matter.Body.setStatic(b,true);
    Matter.Composite.add(this.world.world,b); return b;
  }
  state(b) {const v=Matter.Body.getVelocity(b);return {x:b.position.x/SCALE,y:b.position.y/SCALE,vx:v.x*BASE_HZ/SCALE,vy:v.y*BASE_HZ/SCALE,angle:b.angle,omega:Matter.Body.getAngularVelocity(b)*BASE_HZ};}
  force(b,f,point) {const s=this.state(b);Matter.Body.applyForce(b,V((point?.x??s.x)*SCALE,(point?.y??s.y)*SCALE),V(f.x*SCALE/1e6,f.y*SCALE/1e6));}
  torque(b,t) {b.torque+=t*SCALE*SCALE/1e6;}
  rod(b,length,anchor=V()) {const c=Matter.Constraint.create({bodyB:b,pointB:V(),pointA:V(anchor.x*SCALE,anchor.y*SCALE),length:length*SCALE,stiffness:1,damping:0});Matter.Composite.add(this.world.world,c);return c;}
  hinge(b,anchor=V()) {
    const c=Matter.Constraint.create({bodyB:b,pointA:V(anchor.x*SCALE,anchor.y*SCALE),pointB:V((anchor.x-b.position.x/SCALE)*SCALE,(anchor.y-b.position.y/SCALE)*SCALE),length:0,stiffness:1,damping:0});
    Matter.Composite.add(this.world.world,c);return c;
  }
  rope() {throw new Error('Matter has no native unilateral rope joint');}
  step(h) {this.elapsed+=h;Matter.Engine.update(this.world,h*1000);}
  penetration() {return Math.max(0,...this.world.pairs.list.filter(p=>p.isActive).map(p=>p.collision.depth/SCALE));}
}
class PlanckAdapter {
  constructor(g) {
    this.world=new P.World({gravity:P.Vec2(g.x,g.y),allowSleep:false,continuousPhysics:true,warmStarting:true});
    this.elapsed=0;this.firstContact=null;
    this.world.on('begin-contact',()=>{this.firstContact??=this.elapsed;});
    this.ground=this.world.createBody();
  }
  body({x=0,y=0,r=0.1,w,h,m=1,I,angle=0,vx=0,vy=0,omega=0,static:fixed=false,mu=0,restitution=0}={}) {
    const b=this.world.createBody({type:fixed?'static':'dynamic',position:P.Vec2(x,y),angle,linearVelocity:P.Vec2(vx,vy),angularVelocity:omega,linearDamping:0,angularDamping:0,allowSleep:false});
    b.createFixture(w===undefined?new P.Circle(r):new P.Box(w/2,h/2),{density:1,friction:mu,restitution});
    if(!fixed) b.setMassData({mass:m,center:P.Vec2(),I:I??(w===undefined?m*r*r/2:m*(w*w+h*h)/12)});
    return b;
  }
  state(b) {const p=b.getPosition(),v=b.getLinearVelocity();return {x:p.x,y:p.y,vx:v.x,vy:v.y,angle:b.getAngle(),omega:b.getAngularVelocity()};}
  force(b,f,point) {b.applyForce(P.Vec2(f.x,f.y),point?P.Vec2(point.x,point.y):b.getWorldCenter(),true);}
  torque(b,t) {b.applyTorque(t,true);}
  rod(b,length,anchor=V()) {return this.world.createJoint(new P.DistanceJoint({bodyA:this.ground,bodyB:b,localAnchorA:P.Vec2(anchor.x,anchor.y),localAnchorB:P.Vec2(),length,frequencyHz:0,dampingRatio:0,collideConnected:false}));}
  hinge(b,anchor=V()) {return this.world.createJoint(new P.RevoluteJoint({collideConnected:false},this.ground,b,P.Vec2(anchor.x,anchor.y)));}
  rope(b,length) {return this.world.createJoint(new P.RopeJoint({bodyA:this.ground,bodyB:b,localAnchorA:P.Vec2(),localAnchorB:P.Vec2(),maxLength:length,collideConnected:false}));}
  step(h) {this.elapsed+=h;this.world.step(h,12,12);}
  penetration() {let d=0;for(let c=this.world.getContactList();c;c=c.getNext()){if(c.isTouching()){const m=c.getWorldManifold(null);if(m)for(const s of m.separations)d=Math.max(d,-s);}}return d;}
}
