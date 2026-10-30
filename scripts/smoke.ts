import { spawn } from 'node:child_process';
import { mkdtempSync,rmSync,writeFileSync,readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';
const dir=mkdtempSync(join(tmpdir(),'sumi-production-'));
const child=spawn(process.execPath,['dist/server.js'],{env:{...process.env,NODE_ENV:'production',ALLOW_SQLITE:'true',DATABASE_URL:'',SQLITE_PATH:join(dir,'smoke.sqlite'),APP_ORIGIN:'https://sumi.example.test',AUTO_MIGRATE:'true',PORT:'0'},stdio:['ignore','pipe','pipe']});
let log='';child.stderr.on('data',b=>{log+=String(b);});
try{const port=await new Promise<string>((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Production process did not start: '+log)),15000);child.stdout.on('data',b=>{const match=String(b).match(/localhost:(\d+)/);if(match){clearTimeout(timer);resolve(match[1]);}});child.once('exit',code=>{clearTimeout(timer);reject(new Error('Production process exited: '+code+' '+log));});});const base='http://127.0.0.1:'+port;
 const page=await fetch(base+'/');assert.equal(page.status,200);const html=await page.text();assert.match(html,/Sumi/);const assets=[...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map(x=>x[1]);assert.equal(assets.length,2);for(const path of assets){const r=await fetch(base+path);assert.equal(r.status,200);if(path.endsWith('.js')){const js=await r.text();assert.ok(!js.includes('sumi-qa-run')&&!js.includes('qaMic'));}}
 for(const [path,mime] of [['/icons/favicon.svg','image/svg+xml'],['/icons/favicon-32.png','image/png'],['/icons/apple-touch-icon.png','image/png'],['/favicon.ico','image/']]){const asset=await fetch(base+path);assert.equal(asset.status,200,path);assert.ok(asset.headers.get('content-type')?.includes(mime),path);assert.ok((await asset.arrayBuffer()).byteLength>100,path);}
 assert.equal((await fetch(base+'/api/ready')).status,200);assert.equal((await fetch(base+'/api/does-not-exist')).status,404);
 const publicContent=await (await fetch(base+'/api/curriculum')).json();assert.ok(publicContent.lessons.every((l:{exercises:Record<string,unknown>[]})=>l.exercises.every(q=>!('answer'in q))));
 const qa=await (await fetch(base+'/qa.html')).text();assert.ok(!qa.includes('Sumi development verification'));
 const output={status:'passed',at:new Date().toISOString(),checks:['compiled production server starts','explicit migration and seed into disposable file database','HTML and both built assets served','readiness healthy','unknown API is 404','public answer arrays omitted','development QA fixture absent from production JS and page','favicon SVG/PNG/ICO and Apple icon return valid image MIME types'],database:'SQLite smoke fixture; not PostgreSQL or Docker',buildBytes:assets.map(p=>({asset:p,bytes:readFileSync('dist/client'+p).byteLength}))};writeFileSync('docs/production-smoke.json',JSON.stringify(output,null,2)+'\n');console.log(JSON.stringify(output,null,2));
}finally{child.kill('SIGTERM');await new Promise<void>(resolve=>{if(child.exitCode!==null)resolve();else{child.once('exit',()=>resolve());setTimeout(()=>{child.kill('SIGKILL');resolve();},12000).unref();}});rmSync(dir,{recursive:true,force:true});}
