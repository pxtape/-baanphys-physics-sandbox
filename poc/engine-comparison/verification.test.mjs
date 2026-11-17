import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createAdapter,V,SCALE,BASE_HZ} from './adapters.mjs';
import {runCase,pendulumReference} from './benchmark.mjs';
const root=new URL('./',import.meta.url), report=JSON.parse(readFileSync(new URL('results/results.json',root)));
const close=(a,b,tol=1e-10)=>assert.ok(Math.abs(a-b)<=tol,`${a} vs ${b}, tolerance ${tol}`);
for(const engine of ['matter-js','planck']){
  test(`${engine}: initial SI state and physical rectangle inertia`,()=>{
    const a=createAdapter(engine,V()),b=a.body({x:2,y:-3,w:2,h:1,m:2,vx:3,vy:-4,angle:0.4,omega:0.8});
    const s=a.state(b);for(const [k,v] of Object.entries({x:2,y:-3,vx:3,vy:-4,angle:0.4,omega:0.8}))close(s[k],v);
    close(engine==='planck'?b.getMass():b.mass,2);
    close(engine==='planck'?b.getInertia():b.inertia/(SCALE*SCALE),5/6);
  });
  test(`${engine}: constant force, off-centre torque, disk inertia`,()=>{
    const a=createAdapter(engine,V()),b=a.body({r:0.2,m:2});
    for(let i=0;i<480;i++){a.force(b,V(4,0));a.step(1/480);}
    const s=a.state(b);close(s.vx,2,1e-8);assert.ok(Math.abs(s.x-1)<=0.01);
    const c=createAdapter(engine,V()),disk=c.body({r:0.2,m:1});
    for(let i=0;i<480;i++){c.force(disk,V(0,0.5),V(c.state(disk).x+1,c.state(disk).y));c.force(disk,V(0,-0.5),V(c.state(disk).x-1,c.state(disk).y));c.step(1/480);}
    close(c.state(disk).omega,50,1e-7);assert.ok(Math.abs(c.state(disk).angle-25)/25<=0.01);
  });
  test(`${engine}: free-fall trajectories independent of mass`,()=>{
    const light=runCase(engine,'freeFall',1/480,{mass:0.1}),heavy=runCase(engine,'freeFall',1/480,{mass:10});
    light.rows.forEach((r,i)=>close(r.states[0].y,heavy.rows[i].states[0].y,1e-7));
  });
  test(`${engine}: fresh-engine replay of selected timestep`,()=>{
    for(const name of ['projectile','elasticCollision','revolutePendulum']){
      const a=runCase(engine,name,1/480),b=runCase(engine,name,1/480);
      a.rows.forEach((r,i)=>r.states.forEach((s,j)=>Object.keys(s).forEach(k=>close(s[k],b.rows[i].states[j][k],1e-10))));
    }
  });
}
test('independent nonlinear pendulum RK4 reference converges on halving step',()=>{
  const a=pendulumReference(9.81,1e-5,2),b=pendulumReference(9.81,5e-6,2);
  a.forEach((r,i)=>{close(r.theta,b[i].theta,1e-11);close(r.omega,b[i].omega,1e-11);});
});
test('stored source/lockfile and every trajectory match SHA-256 provenance',()=>{
  for(const [file,hash] of Object.entries(report.sourceSha256))assert.equal(createHash('sha256').update(readFileSync(new URL(file,root))).digest('hex'),hash,file);
  for(const r of report.results.filter(r=>r.executed))assert.equal(createHash('sha256').update(readFileSync(new URL('results/'+r.trajectory,root))).digest('hex'),r.trajectorySha256,r.trajectory);
});
test('Planck selected-step basic gates and mechanical probes actually pass',()=>{
  for(const name of ['freeFall','projectile','elasticCollision','rotation','revolutePendulum','pointPendulum','spring','dampedSpring','lengthConstraint','rope']){
    const r=report.results.find(r=>r.engine==='planck'&&r.name===name&&r.h===1/480&&Object.keys(r.variant).length===0);
    assert.equal(r.executed,true);assert.equal(r.status,'PASS',name);assert.ok(r.metrics.length>0);
  }
});
test('independently recompute endpoint free fall/projectile and collision momentum from CSV',()=>{
  for(const engine of ['matter-js','planck'])for(const name of ['freeFall','projectile','elasticCollision']){
    const r=report.results.find(r=>r.engine===engine&&r.name===name&&r.h===1/480&&Object.keys(r.variant).length===0);
    const rows=readFileSync(new URL('results/'+r.trajectory,root),'utf8').trim().split('\n').slice(1).map(line=>line.split(',').slice(0,8).map(Number));
    if(name==='freeFall')close(20-rows.at(-1)[3],r.metrics[0].actual,1e-12);
    if(name==='projectile'){close(rows.at(-1)[2],8,1e-8);assert.ok(Math.abs(rows.at(-1)[3]-21.095)/1.095<=0.01);}
    if(name==='elasticCollision'){const b=rows.slice(-2);close(b[0][4]+2*b[1][4],2,0.02);}
  }
});
test('unsupported Matter rope is explicitly unexecuted, never counted as pass',()=>{
  const r=runCase('matter-js','rope');assert.equal(r.status,'UNSUPPORTED');assert.equal(r.executed,false);assert.equal(r.metrics.length,0);
});
