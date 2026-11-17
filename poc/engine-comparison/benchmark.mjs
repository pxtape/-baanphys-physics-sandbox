import {createAdapter,settings,V} from './adapters.mjs';
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
import os from 'node:os';
import {performance} from 'node:perf_hooks';
import {createHash} from 'node:crypto';
export const LOGICAL_DT=1/120;
export const CASES=['freeFall','projectile','elasticCollision','revolutePendulum','spring','rotation','rolling','rope','lengthConstraint','pointPendulum','dampedSpring'];
const G=9.81, sq=x=>x*x, norm=Math.hypot;
const max=(rows,f)=>Math.max(...rows.map(f));
const mean=xs=>xs.reduce((a,b)=>a+b,0)/xs.length;
function metric(name,actual,reference,tolerance=0.01,scale) {
  const denominator=scale??Math.abs(reference);
  const error=Math.abs(actual-reference)/(denominator||1);
  return {name,actual,reference,error,errorKind:scale===undefined&&reference!==0?'relative':scale?'normalized absolute':'absolute',scale:denominator||1,tolerance,pass:Number.isFinite(actual)&&error<=tolerance};
}
function maxMetric(name,value,limit=0.01) {return metric(name,value,0,limit);}
function period(rows,f) {
  const crossings=[];
  for(let i=1;i<rows.length;i++){const a=f(rows[i-1]),b=f(rows[i]);if(a>0&&b<=0)crossings.push(rows[i-1].t+(rows[i].t-rows[i-1].t)*a/(a-b));}
  return {value:crossings.length>1?mean(crossings.slice(1).map((t,i)=>t-crossings[i])):NaN,intervals:crossings.length-1};
}
// Independent RK4 reference; it is never injected into engine state.
export function pendulumReference(lambda,dt=1e-5,duration=10) {
  const rows=[{theta:0.1,omega:0}];let q=0.1,v=0;
  const perTick=Math.round(LOGICAL_DT/dt),h=LOGICAL_DT/perTick;
  for(let tick=1;tick<=duration/LOGICAL_DT;tick++){
    for(let i=0;i<perTick;i++){
      const a1=-lambda*Math.sin(q),q2=q+v*h/2,v2=v+a1*h/2;
      const a2=-lambda*Math.sin(q2),q3=q+v2*h/2,v3=v+a2*h/2;
      const a3=-lambda*Math.sin(q3),q4=q+v3*h,v4=v+a3*h;
      const a4=-lambda*Math.sin(q4);
      q+=h*(v+2*v2+2*v3+v4)/6;v+=h*(a1+2*a2+2*a3+a4)/6;
    }rows.push({theta:q,omega:v});
  }return rows;
}
const pendRefs=new Map();
function referenceFor(lambda){if(!pendRefs.has(lambda))pendRefs.set(lambda,pendulumReference(lambda));return pendRefs.get(lambda);}
export function runCase(engine,name,h=1/240,variant={}) {
  const substeps=Math.round(LOGICAL_DT/h);if(Math.abs(substeps*h-LOGICAL_DT)>1e-14)throw Error('inexact timestep');
  if(name==='rope'&&engine==='matter-js')return {engine,name,h,variant,status:'UNSUPPORTED',executed:false,support:'No built-in unilateral rope; bilateral lengthConstraint is tested separately.',metrics:[],rows:[]};
  const gravity=['freeFall','projectile','revolutePendulum','rolling','rope','lengthConstraint','pointPendulum'].includes(name)?V(0,-G):V();
  const a=createAdapter(engine,gravity);const bodies=[];let duration=1,pre=()=>{},extra=()=>({}),metrics=[],support='built-in';
  let init;
  if(name==='freeFall')bodies.push(a.body({x:0,y:20,m:variant.mass??1}));
  if(name==='projectile')bodies.push(a.body({x:0,y:20,vx:8,vy:6}));
  if(name==='elasticCollision'){
    duration=1.5;bodies.push(a.body({x:-1,r:0.25,m:1,vx:2,restitution:1}),a.body({x:1,r:0.25,m:variant.mass2??2,restitution:1}));
  }
  if(['pointPendulum','revolutePendulum'].includes(name)){
    duration=10;const b=a.body({x:Math.sin(0.1),y:-Math.cos(0.1),r:0.1});bodies.push(b);
    if(name==='pointPendulum')a.rod(b,1);else {a.hinge(b);support=engine==='planck'?'built-in RevoluteJoint':'built-in zero-length distance pin approximation (not a native revolute solver)';}
  }
  if(['spring','dampedSpring'].includes(name)){
    duration=10;const b=a.body({x:1.1});bodies.push(b);const c=name==='spring'?0:0.2;
    pre=()=>{const s=a.state(b);const length=norm(s.x,s.y),radialVelocity=(s.x*s.vx+s.y*s.vy)/length;const f=-10*(length-1)-c*radialVelocity;a.force(b,V(f*s.x/length,f*s.y/length));};
    support='custom SI Hooke/damping force law over built-in force integration; no solver stiffness mapping';
  }
  if(name==='rotation'){
    const b=a.body({w:2,h:1,m:2});bodies.push(b);
    // Equal/opposite world forces create a real couple, net force zero, torque 1 N m.
    pre=()=>{const s=a.state(b);a.force(b,V(0,0.5),V(s.x+1,s.y));a.force(b,V(0,-0.5),V(s.x-1,s.y));};
  }
  if(name==='rolling'){
    const theta=Math.PI/6,normal=V(Math.sin(theta),Math.cos(theta));
    a.body({x:-normal.x*0.25,y:-normal.y*0.25,w:20,h:0.5,angle:-theta,static:true,mu:0.4});
    bodies.push(a.body({x:normal.x*0.2,y:normal.y*0.2,r:0.2,mu:0.4}));
    extra=()=>({penetration:a.penetration()});
  }
  if(['rope','lengthConstraint'].includes(name)){
    const b=a.body({y:-1});bodies.push(b);
    if(name==='rope')a.rope(b,1);else a.rod(b,1);
    duration=2;support=name==='rope'?'built-in unilateral RopeJoint':'built-in bilateral distance constraint';
  }
  const rows=[];
  const capture=t=>{const row={t,states:bodies.map(b=>a.state(b)),...extra()};if(!row.states.every(s=>Object.values(s).every(Number.isFinite)))throw Error('Nonfinite state');rows.push(row);};
  capture(0);init=rows[0].states[0];
  for(let tick=1;tick<=Math.round(duration/LOGICAL_DT);tick++){
    for(let j=0;j<substeps;j++){pre();a.step(h);}capture(tick*LOGICAL_DT);
  }
  const end=rows.at(-1).states[0];
  if(name==='freeFall'){
    metrics=[metric('endpoint downward displacement (m)',20-end.y,4.905),metric('endpoint vy (m/s)',end.vy,-9.81),
      maxMetric('max normalized position error',max(rows,r=>Math.abs(r.states[0].y-(20-G*r.t*r.t/2))/4.905)),
      maxMetric('max normalized velocity error',max(rows,r=>Math.abs(r.states[0].vy+G*r.t)/9.81)),maxMetric('max x drift (m)',max(rows,r=>Math.abs(r.states[0].x)),1e-8),maxMetric('max vx (m/s)',max(rows,r=>Math.abs(r.states[0].vx)),1e-8)];
  }
  if(name==='projectile'){
    const apex=rows.reduce((best,r)=>r.states[0].y>best.states[0].y?r:best,rows[0]);
    let apexTime=NaN;for(let i=1;i<rows.length;i++)if(rows[i-1].states[0].vy>0&&rows[i].states[0].vy<=0){const x=rows[i-1],y=rows[i];apexTime=x.t+LOGICAL_DT*x.states[0].vy/(x.states[0].vy-y.states[0].vy);break;}
    metrics=[metric('endpoint x (m)',end.x,8),metric('endpoint vertical displacement (m)',end.y-20,1.095),metric('apex time (s)',apexTime,6/G),metric('apex height gain (m)',apex.states[0].y-20,36/(2*G)),maxMetric('max normalized position error',max(rows,r=>norm(r.states[0].x-8*r.t,r.states[0].y-(20+6*r.t-G*r.t*r.t/2))/8)),maxMetric('max normalized velocity error',max(rows,r=>norm(r.states[0].vx-8,r.states[0].vy-(6-G*r.t))/10))];
  }
  if(name==='elasticCollision'){
    const m2=variant.mass2??2,window=rows.filter(r=>r.t>=1&&r.t<=1.25);
    const v1=mean(window.map(r=>r.states[0].vx)),v2=mean(window.map(r=>r.states[1].vx));
    metrics=[metric('post-collision v1 (m/s)',v1,2*(1-m2)/(1+m2),0.01,m2===1?2:undefined),metric('post-collision v2 (m/s)',v2,4/(1+m2)),metric('contact onset (s)',a.firstContact,0.75,LOGICAL_DT+0.0075,1),
      maxMetric('max relative momentum drift',max(rows,r=>Math.abs(r.states[0].vx+m2*r.states[1].vx-2)/2)),
      maxMetric('max relative energy drift',max(rows,r=>Math.abs(0.5*(sq(r.states[0].vx)+sq(r.states[0].vy))+0.5*m2*(sq(r.states[1].vx)+sq(r.states[1].vy))+0.5*0.03125*sq(r.states[0].omega)+0.5*m2*0.03125*sq(r.states[1].omega)-2)/2)),
      maxMetric('max transverse speed',max(rows,r=>Math.max(...r.states.map(s=>Math.abs(s.vy)))),1e-6),maxMetric('max spin (rad/s)',max(rows,r=>Math.max(...r.states.map(s=>Math.abs(s.omega)))),1e-6),
      maxMetric('max geometric overlap (m)',max(rows,r=>Math.max(0,0.5-norm(r.states[0].x-r.states[1].x,r.states[0].y-r.states[1].y))),0.0025)];
  }
  if(['pointPendulum','revolutePendulum'].includes(name)){
    const physical=name==='revolutePendulum',I=0.005,lambda=G/(1+(physical?I:0)),ref=referenceFor(lambda);
    // AGM formula for complete elliptic K(m), m=sin(theta0/2)^2.
    let ag=1,bg=Math.cos(0.05);for(let i=0;i<8;i++){const an=(ag+bg)/2;bg=Math.sqrt(ag*bg);ag=an;}
    const exactPeriod=2*Math.PI/(ag*Math.sqrt(lambda)),p=period(rows,r=>Math.atan2(r.states[0].x,-r.states[0].y));
    const E0=G*(1-Math.cos(0.1));
    metrics=[metric('period (s)',p.value,exactPeriod),maxMetric('max theta error / initial amplitude',max(rows,(r)=>Math.abs(Math.atan2(r.states[0].x,-r.states[0].y)-ref[Math.round(r.t/LOGICAL_DT)].theta)/0.1)),
      maxMetric('max radius drift (m)',max(rows,r=>Math.abs(norm(r.states[0].x,r.states[0].y)-1)),0.001),
      maxMetric('max relative energy drift',max(rows,r=>{const s=r.states[0];return Math.abs(0.5*(sq(s.vx)+sq(s.vy))+(physical?0.5*I*sq(s.omega):0)+G*(s.y+1)-E0)/E0;})),
      metric('measured same-direction period intervals',p.intervals,4,0,1)];
    if(physical)metrics.push(maxMetric('max local hinge separation (m)',max(rows,r=>{const s=r.states[0],ax=-init.x,ay=-init.y;return norm(s.x+Math.cos(s.angle)*ax-Math.sin(s.angle)*ay,s.y+Math.sin(s.angle)*ax+Math.cos(s.angle)*ay);}),0.001));
  }
  if(['spring','dampedSpring'].includes(name)){
    const c=name==='spring'?0:0.2,alpha=c/2,w=Math.sqrt(10-alpha*alpha),q=t=>0.1*Math.exp(-alpha*t)*(Math.cos(w*t)+alpha/w*Math.sin(w*t)),vel=t=>-0.1*Math.exp(-alpha*t)*10/w*Math.sin(w*t);
    const p=period(rows,r=>r.states[0].x-1);
    metrics=[metric('period (s)',p.value,2*Math.PI/w),maxMetric('max displacement error / amplitude',max(rows,r=>Math.abs(r.states[0].x-1-q(r.t))/0.1)),maxMetric('max velocity error / amplitude speed',max(rows,r=>Math.abs(r.states[0].vx-vel(r.t))/Math.sqrt(0.1))),metric('measured same-direction period intervals',p.intervals,4,0,1)];
    const energy=r=>0.5*sq(r.states[0].vx)+5*sq(r.states[0].x-1);
    if(c===0)metrics.push(maxMetric('max relative energy drift',max(rows,r=>Math.abs(energy(r)-0.05)/0.05)));
    else metrics.push(maxMetric('max per-tick energy increase / E0',Math.max(0,...rows.slice(1).map((r,i)=>(energy(r)-energy(rows[i]))/0.05)),0.001));
  }
  if(name==='rotation')metrics=[metric('endpoint omega (rad/s)',end.omega,1.2),metric('endpoint angle (rad)',end.angle,0.6),maxMetric('max COM drift (m)',max(rows,r=>norm(r.states[0].x,r.states[0].y)),1e-8),maxMetric('max COM velocity (m/s)',max(rows,r=>norm(r.states[0].vx,r.states[0].vy)),1e-8)];
  if(name==='rolling'){
    const tangent=V(Math.cos(Math.PI/6),-0.5),v=s=>s.vx*tangent.x+s.vy*tangent.y,dis=s=>(s.x-init.x)*tangent.x+(s.y-init.y)*tangent.y;
    metrics=[metric('endpoint displacement (m)',dis(end),1.635),metric('endpoint speed (m/s)',v(end),3.27),metric('endpoint angular speed (rad/s)',Math.abs(end.omega),16.35),
      maxMetric('max displacement error / 1.635m',max(rows,r=>Math.abs(dis(r.states[0])-1.635*r.t*r.t)/1.635)),maxMetric('max speed error / 3.27m/s',max(rows,r=>Math.abs(v(r.states[0])-3.27*r.t)/3.27)),maxMetric('max angular error / 16.35rad/s',max(rows,r=>Math.abs(Math.abs(r.states[0].omega)-16.35*r.t)/16.35)),
      maxMetric('max slip / terminal speed',max(rows,r=>Math.abs(v(r.states[0])-0.2*Math.abs(r.states[0].omega))/3.27)),
      maxMetric('max energy drift / released PE at 1s',max(rows,r=>{const s=r.states[0];return Math.abs(0.5*(sq(s.vx)+sq(s.vy))+0.01*sq(s.omega)+G*(s.y-init.y))/(G*0.8175);})),maxMetric('max contact penetration (m)',max(rows,r=>r.penetration),0.002)];
  }
  if(['rope','lengthConstraint'].includes(name)){
    metrics=[maxMetric('max relative length drift (taut)',max(rows,r=>Math.abs(norm(r.states[0].x,r.states[0].y)-1)),0.001),maxMetric('max stationary speed (m/s)',max(rows,r=>norm(r.states[0].vx,r.states[0].vy)),0.001)];
    if(name==='rope'){
      const slack=createAdapter(engine,V());const b=slack.body({x:0.5,vx:-0.2});slack.rope(b,1);
      for(let i=0;i<Math.round(1/h);i++)slack.step(h);
      const s=slack.state(b);metrics.push(metric('slack free endpoint x (m)',s.x,0.3,1e-8),metric('slack free vx (m/s)',s.vx,-0.2,1e-8));
    }
  }
  return {engine,name,h,logicalTimestep:LOGICAL_DT,substeps,variant,executed:true,status:metrics.every(m=>m.pass)?'PASS':'FAIL',stability:{finite:true,maxSpeed:max(rows,r=>Math.max(...r.states.map(s=>norm(s.vx,s.vy)))),maxAbsOmega:max(rows,r=>Math.max(...r.states.map(s=>Math.abs(s.omega))))},support,metrics,rows};
}
export function performanceProbe(engine,h=1/480) {
  const a=createAdapter(engine),bodies=[];
  for(let i=0;i<100;i++){const b=a.body({x:i*3+Math.sin(0.1),y:-Math.cos(0.1)});bodies.push(b);a.rod(b,1,V(i*3,0));}
  const durations=[];let maxLengthError=0;
  for(let tick=0;tick<1440;tick++){
    const start=performance.now();for(let j=0;j<Math.round(LOGICAL_DT/h);j++)a.step(h);const elapsed=performance.now()-start;
    if(tick>=240)durations.push(elapsed);
    for(let i=0;i<100;i++){const s=a.state(bodies[i]);maxLengthError=Math.max(maxLengthError,Math.abs(norm(s.x-i*3,s.y)-1));}
  }
  durations.sort((a,b)=>a-b);
  return {engine,bodies:100,constraints:100,warmupTicks:240,measuredTicks:1200,logicalTimestep:LOGICAL_DT,h,p50TickMs:durations[600],p95TickMs:durations[1140],maxTickMs:durations.at(-1),maxLengthError,scope:'Node CPU-only independent pendulums, no collisions/rendering/graphs; not an iPad or browser measurement'};
}
function main(){
  const here=dirname(fileURLToPath(import.meta.url)),out=join(here,'results');mkdirSync(out,{recursive:true});
  const results=[];
  for(const engine of ['matter-js','planck'])for(const h of [1/120,1/240,1/480])for(const name of CASES){const r=runCase(engine,name,h);results.push(r);console.log(`${engine} h=1/${Math.round(1/h)} ${name}: ${r.status}${r.metrics.filter(m=>!m.pass).map(m=>` | ${m.name}: ${m.error.toPrecision(4)} > ${m.tolerance}`).join('')}`);}
  for(const engine of ['matter-js','planck'])for(const h of [1/120,1/240,1/480]){
    for(const mass of [0.1,10])results.push(runCase(engine,'freeFall',h,{mass}));
    for(const mass2 of [1,10,100])results.push(runCase(engine,'elasticCollision',h,{mass2}));
  }
  const replay=[];
  for(const engine of ['matter-js','planck'])for(const name of CASES.filter(n=>n!=='rope'||engine==='planck')){
    const first=results.find(r=>r.engine===engine&&r.name===name&&r.h===1/240&&Object.keys(r.variant).length===0),second=runCase(engine,name,1/240);
    let error=0;first.rows.forEach((r,i)=>r.states.forEach((s,j)=>Object.keys(s).forEach(k=>{error=Math.max(error,Math.abs(s[k]-second.rows[i].states[j][k]));})));
    replay.push({engine,name,maxAbsoluteStateError:error,pass:error<=1e-10});
  }
  for(let i=0;i<results.length;i++){
    const r=results[i];if(!r.executed)continue;
    const csv=['t,body,x,y,vx,vy,angle,omega,penetration'];
    for(const row of r.rows)row.states.forEach((s,j)=>csv.push([row.t,j,s.x,s.y,s.vx,s.vy,s.angle,s.omega,row.penetration??''].join(',')));
    const filename=`${String(i).padStart(3,'0')}-${r.engine}-${r.name}-h${Math.round(1/r.h)}.csv`;writeFileSync(join(out,filename),csv.join('\n')+'\n');r.trajectory=filename;r.trajectorySha256=createHash('sha256').update(csv.join('\n')+'\n').digest('hex');delete r.rows;
  }
  const packageInfo=JSON.parse(readFileSync(join(here,'package-lock.json'),'utf8'));
  const report={generatedAt:new Date().toISOString(),environment:{node:process.version,platform:process.platform,arch:process.arch,cpu:os.cpus()[0]?.model},adapterVersion:'0.1.0-poc',sourceSha256:Object.fromEntries(['adapters.mjs','benchmark.mjs','package-lock.json'].map(f=>[f,createHash('sha256').update(readFileSync(join(here,f))).digest('hex')])),settings,packageLockVersion:packageInfo.lockfileVersion,results,replay,performance:['matter-js','planck'].map(engine=>performanceProbe(engine))};
  writeFileSync(join(out,'results.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({executed:results.filter(r=>r.executed).length,passed:results.filter(r=>r.status==='PASS').length,failed:results.filter(r=>r.status==='FAIL').length,unsupported:results.filter(r=>r.status==='UNSUPPORTED').length,replay,performance:report.performance},null,2));
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1])main();
