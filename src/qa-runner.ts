import axe from 'axe-core';
// Imported only in Vite development mode when qa=1; never in production output.
const noMotion=document.createElement('style');noMotion.textContent='*,*::before,*::after{transition:none!important;animation:none!important}';document.head.append(noMotion);
document.documentElement.dataset.qaReady='true';
window.addEventListener('message',async(event:MessageEvent)=>{
 if(event.origin!==location.origin||event.source!==parent||event.data?.kind!=='sumi-qa-run')return;
 document.documentElement.dataset.theme=event.data.theme==='dark'?'dark':'light';
 await new Promise<void>(resolve=>setTimeout(resolve,220));
 try{const report=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}});parent.postMessage({kind:'sumi-qa-result',id:event.data.id,appReady:!!document.querySelector('.app-shell'),heading:document.querySelector('h1')?.textContent,utilitySubmitIssues:[...document.querySelectorAll<HTMLButtonElement>('.quiz-question button')].filter(b=>b.type==='submit').map(b=>b.textContent),overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+1,violations:report.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary})).slice(0,10)}))},location.origin);}catch(e){parent.postMessage({kind:'sumi-qa-result',id:event.data.id,error:String(e)},location.origin);}
});
