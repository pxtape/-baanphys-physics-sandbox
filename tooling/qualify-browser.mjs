import process from 'node:process';
import { Buffer } from 'node:buffer';
import { Console } from 'node:console';
import { createServer } from 'node:http';
import { access, mkdir, writeFile, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { build } from 'vite';
import { chromium, webkit } from 'playwright';
const console = new Console(process.stdout, process.stderr);
async function bundle(entry) {
  const result = await build({ configFile: false, logLevel: 'silent', build: { write: false, minify: false,
    lib: { entry, formats: ['es'], fileName: 'qualification' } } });
  return (Array.isArray(result) ? result[0] : result).output.filter(x => x.type === 'chunk').map(x => x.code).join('\n');
}
const code = await bundle('qualification/browser-entry.ts');
const node = await import(`data:text/javascript;base64,${Buffer.from(await bundle('qualification/entry.ts')).toString('base64')}`);
const cases = [{id:'fall',scene:node.scene()}, {id:'projectile',scene:node.scene([node.disk(1,0,20,1,.1,8,6)])}, {id:'collision',scene:node.collision()}];
const references = cases.map(c => ({id:c.id,trace:node.runProduction(c.scene,240)}));
const server = createServer((req,res) => {
  if (req.url === '/') { res.writeHead(200, {'Content-Type':'text/html'}); res.end('<!doctype html><title>Physics qualification only</title><script type="module" src="/qualification.js"></script>'); }
  else if (req.url === '/qualification.js') { res.writeHead(200, {'Content-Type':'text/javascript'}); res.end(code); }
  else { res.writeHead(404); res.end(); }
});
await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
const sources = ['package-lock.json', 'qualification/browser-entry.ts', 'qualification/core.ts', 'qualification/scenes.ts', 'tooling/qualify-browser.mjs', 'src/physics/adapters/qualification-native-probes.ts', 'src/physics/adapters/planck-runtime.ts', 'src/physics/adapters/planck-construction.ts', 'src/physics/adapters/native-settings.ts'];
const provenance = Object.fromEntries(await Promise.all(sources.map(async path => [path,createHash('sha256').update(await readFile(path)).digest('hex')])));
const report = { provenance, referenceTraces:references, recordedAt:new Date().toISOString(),node:process.version, platform:process.platform, browsers:[],
  limitations:['Headless physics module tests, not editor rendering/FPS or touch interaction tests.', 'Linux WebKit is not Apple Safari. No physical iPad or Safari device was available.', 'No cross-browser bitwise determinism claim.'], executionReady:false };
try {
  for (const [name,type] of [['chromium',chromium],['webkit',webkit]]) {
    let browser;
    try {
      let executablePath;
      if (name === 'chromium') { const path=process.env.BAANPHYS_CHROMIUM_PATH ?? '/usr/bin/chromium'; try { await access(path); executablePath=path; } catch { /* Use installed Playwright browser. */ } }
      browser=await type.launch({headless:true,...(executablePath ? {executablePath} : {})});
    } catch (error) {
      report.browsers.push({name,status:'UNAVAILABLE',reason:String(error.message).slice(0,2000)}); continue;
    }
    try {
      const context=await browser.newContext(),page=await context.newPage();
      const errors=[];page.on('pageerror',e=>errors.push(e.message));
      await page.goto(`http://127.0.0.1:${server.address().port}/`);
      await page.waitForFunction(()=>Reflect.has(globalThis,'__qualificationResult'),{},{timeout:60000});
      const result=await page.evaluate(()=>Reflect.get(globalThis,'__qualificationResult'));
      const comparisons=result.replay.map((candidate,i)=>{
        const reference=references[i]; let before=0,after=0;
        if (candidate.trace.frames.length!==reference.trace.frames.length || candidate.trace.failure || reference.trace.failure) before=after=Infinity;
        else candidate.trace.frames.forEach((f,k)=>f.bodies.forEach((b,j)=>{
          const r=reference.trace.frames[k].bodies[j];
          const xs=[b.position.x,b.position.y,b.velocity.x,b.velocity.y,b.angle,b.angularVelocity];
          const ys=[r.position.x,r.position.y,r.velocity.x,r.velocity.y,r.angle,r.angularVelocity];
          let error=b.id===r.id && f.tick===reference.trace.frames[k].tick && f.timeSeconds===reference.trace.frames[k].timeSeconds ? 0 : Infinity;
          xs.forEach((x,n)=>error=Math.max(error,Math.abs(x-ys[n])/Math.max(1,Math.abs(ys[n]))));
          if (candidate.id==='collision' && f.timeSeconds>=.75) after=Math.max(after,error); else before=Math.max(before,error);
        }));
        return {id:candidate.id,preContactNormalized:before,postContactNormalized:after,preContactTolerance:1e-7,postContactTolerance:1e-5,pass:before<=1e-7 && after<=1e-5};
      });
      const transportPass=errors.length===0 && result.executionReady===false && result.publicInitializationBlocked;
      report.browsers.push({name,version:browser.version(),userAgent:await page.evaluate(()=>globalThis.navigator.userAgent),
        status:transportPass && comparisons.every(c=>c.pass) && result.basic.every(c=>c.status==='PASS') ? 'PASS':'FAIL',
        transportPass,errors,basic:result.basic,comparisons,traces:result.replay});
      await context.close();
    } catch(error) {report.browsers.push({name,status:'FAIL',reason:String(error.message).slice(0,2000)});} finally {await browser.close();}
  }
} finally {await new Promise(resolve=>server.close(resolve));}
await mkdir('qualification/results',{recursive:true});
await writeFile('qualification/results/browser.json',JSON.stringify(report,(_k,v)=>typeof v==='number'&&!Number.isFinite(v)?String(v):v,2)+'\n');
console.log(JSON.stringify(report.browsers.map(b=>({name:b.name,status:b.status,comparisons:b.comparisons,reason:b.reason}))));
if (report.browsers.some(b=>b.status==='FAIL')) process.exitCode=1;
if (process.argv.includes('--strict') && report.browsers.some(b=>b.status!=='PASS')) process.exitCode=1;
