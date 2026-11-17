// Extra executed boundary probes. No hidden state clamping or geometry changes.
import {createAdapter,V,settings} from './adapters.mjs';
import {writeFileSync} from 'node:fs';
const h=1/480,results=[];
for(const engine of ['matter-js','planck']){
  const a=createAdapter(engine,V()),b1=a.body({x:-0.3,r:0.25,vx:0.2,m:1,restitution:1}),b2=a.body({x:0.3,r:0.25,m:2,restitution:1});
  const rows=[];for(let i=0;i<=720;i++){if(i)a.step(h);if(i%4===0)rows.push({t:i*h,body1:a.state(b1),body2:a.state(b2)});}
  const end=rows.at(-1),error1=Math.abs(end.body1.vx+0.2/3)/(0.2/3),error2=Math.abs(end.body2.vx-0.4/3)/(0.4/3);
  results.push({engine,case:'low-speed elastic collision',h,settings:settings[engine],reference:{v1:-0.2/3,v2:0.4/3},actual:{v1:end.body1.vx,v2:end.body2.vx},errors:{relativeV1:error1,relativeV2:error2},status:error1<=0.01&&error2<=0.01?'PASS':'FAIL',rows});
  const c=createAdapter(engine,V());c.body({y:0,w:10,h:0.01,static:true});const ball=c.body({y:0.2,r:0.01,vy:-200,restitution:0});
  const trajectory=[{t:0,...c.state(ball)}];for(let i=1;i<=24;i++){c.step(h);trajectory.push({t:i*h,...c.state(ball)});}
  const minY=Math.min(...trajectory.map(s=>s.y));
  results.push({engine,case:'thin-floor high-speed tunneling',h,reference:'body cannot cross floor: COM remains above floor centre (y>=0)',actual:{minY},firstContact:c.firstContact,status:minY>=0?'PASS':'FAIL',rows:trajectory,limitation:'Boundary probe only, not a universal CCD guarantee. Speed*step=0.4167m, below Planck maxTranslation=2m; no clamp.'});
}
writeFileSync(new URL('results/stress.json',import.meta.url),JSON.stringify({generatedAt:new Date().toISOString(),results},null,2)+'\n');
for(const r of results)console.log(r.engine,r.case,r.status,r.actual,r.errors??'');
