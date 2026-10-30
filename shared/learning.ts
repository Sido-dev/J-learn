import type { Exercise, Skill } from './content.js';
export function normalize(input:string){return input.normalize('NFKC').toLowerCase().trim().replace(/[āīūēō]/g,c=>({ā:'aa',ī:'ii',ū:'uu',ē:'ee',ō:'oo'}[c]!)).replace(/[\s。、,.!?！？・/]+/g,'');}
export function evaluate(q:Exercise,input:string){
 const correct=q.type==='handwriting'?false:q.answer.some(a=>normalize(a)===normalize(input));
 let detail=q.explanation;
 const n=normalize(input);
 if(q.display==='ほし'&&n==='hashi')detail='You read ほ as は. ほ is ho; は is ha. ほ ho + し shi = hoshi. Compare ほし (star) and はし (bridge/chopsticks, depending on context).';
 if(q.display==='かぎ'&&n==='gagi')detail='You added voicing to か. Only ぎ has dakuten: か ka + ぎ gi = kagi.';
 if(q.display==='ぱ'&&n==='ba')detail='You read the circle as two marks. Handakuten ゜ makes pa; dakuten ゛makes ba. Compare ぱ and ば.';
 if(q.display==='きゃく'&&n==='kyuku')detail='You read small ゃ as small ゅ. ゃ = ya; ゅ = yu. きゃ kya + く ku = kyaku.';
 return {id:q.id,concept:q.concept,skill:q.skill,correct,unanswered:!input.trim(),submitted:input,expected:q.answer[0],explanation:correct?q.explanation+' Recall it again on a later day to strengthen it.':detail,units:q.units||q.display||'',targeted:correct?undefined:{prompt:`Try again after comparing: ${q.display||q.prompt}`,qid:q.id}};
}
export function grade(questions:Exercise[],answers:Record<string,string>){
 const ids=new Set(questions.map(q=>q.id));
 if(Object.keys(answers).some(id=>!ids.has(id)))throw new Error('Unknown question ID');
 const results=questions.map(q=>evaluate(q,answers[q.id]||''));
 return {score:results.filter(r=>r.correct).length,total:results.length,results};
}
export type Progress={concept:string;skill:Skill;introduced:boolean;attempts:number;successes:number;streak:number;days:string[];lastAt:number;dueAt:number;interval:number;mastered:boolean;method?:'recognition'|'recall';displayConcept?:string};
export function localDay(now:number,zone:string){return new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(now));}
export function schedule(previous:Progress|undefined,concept:string,skill:Skill,correct:boolean,now:number,zone:string):Progress{
 const day=localDay(now,zone),days=[...new Set([...(previous?.days||[]),...(correct?[day]:[])])];
 const isNewDay=!previous||localDay(previous.lastAt,zone)!==day;
 const streak=correct?(previous?.streak||0)+(isNewDay?1:0):0;
 const attempts=(previous?.attempts||0)+1,successes=(previous?.successes||0)+(correct?1:0);
 const interval=correct?(isNewDay?Math.min(30,[1,3,7,14,30][Math.min(streak-1,4)]):previous?.interval||1):0;
 return {concept,skill,introduced:true,attempts,successes,streak,days,lastAt:now,dueAt:correct?now+interval*86400000:now+600000,interval,mastered:correct&&days.length>=3&&successes>=4&&streak>=3&&successes/attempts>=0.85};
}
export function streakDays(timestamps:number[],zone:string,now:number){
 const days=new Set(timestamps.map(t=>localDay(t,zone)));
 const today=localDay(now,zone);let date=new Date(today+'T12:00:00Z');
 if(!days.has(today))date=new Date(date.getTime()-86400000);
 let count=0;while(days.has(date.toISOString().slice(0,10))){count++;date=new Date(date.getTime()-86400000);}return count;
}
