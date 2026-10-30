import { randomUUID } from 'node:crypto';
import type { Store,Connection,Row } from '../db.js';
import { eligibleQuestions,scopedChoices,type LearningFilter } from './bank.js';
import { cycleOrder,randomOptions } from './random.js';
import { evaluate,schedule,type Progress } from '../../shared/learning.js';
import type { BankQuestion,PracticeConfig,PublicQuestion,PracticeOption,PracticeFeedback,PublicSession,PublicItem,PracticeSummary } from '../../shared/practice.js';
export class PracticeError extends Error{constructor(public status:number,message:string){super(message);}}
const fail=(status:number,message:string):never=>{throw new PracticeError(status,message);};
export function publicQuestion(q:BankQuestion):PublicQuestion{return {id:q.id,version:q.version,concept:q.concept,skill:q.skill,prompt:q.prompt,display:q.display};}
const parse=<T>(v:unknown):T=>JSON.parse(String(v));
export async function learningFilter(c:Connection,userId:string,now=Date.now()):Promise<LearningFilter>{
 const rows=await c.query('SELECT state FROM progress WHERE user_id=?',[userId]);const learned=new Set<string>(),weak=new Set<string>();
 for(const row of rows){const p=parse<Progress>(row.state);const concept=p.concept.replace(/^recognition:/,'');if(p.introduced)learned.add(concept);if(p.attempts>p.successes&&!p.mastered)weak.add(concept);}
 const wrong=await c.query("SELECT DISTINCT i.question_id FROM quiz_items i JOIN quiz_sessions s ON i.session_id=s.id WHERE s.user_id=? AND s.status='finished' AND i.correct=0",[userId]);
 const saved=await c.query('SELECT item FROM bookmarks WHERE user_id=?',[userId]);const bookmarks=new Set(saved.map(r=>String(r.item).replace(/^(word:|kanji:)/,'')));
 const due=await c.query('SELECT question_id FROM reviews WHERE user_id=? AND due_at<=?',[userId,now]);const dueIds=new Set(due.map(r=>String(r.question_id)));
 return {learned,weak,bookmarks,dueIds,wrongIds:new Set(wrong.map(r=>String(r.question_id)))};
}
async function insertItems(c:Connection,id:string,questions:BankQuestion[],start:number,cycle:number){
 for(const [i,q] of questions.entries())await c.query('INSERT INTO quiz_items(session_id,id,position,cycle,question_id,question_version,question_snapshot,options) VALUES(?,?,?,?,?,?,?,?)',[id,randomUUID(),start+i,cycle,q.id,q.version,JSON.stringify(q),JSON.stringify(randomOptions(q))]);
}
export function createPracticeService(db:Store,clock:()=>number){
 async function row(c:Connection,user:string,id:string,lock=false){const [s]=await c.query('SELECT * FROM quiz_sessions WHERE id=? AND user_id=?'+(lock&&db.dialect==='postgres'?' FOR UPDATE':''),[id,user]);return s||fail(404,'Practice session not found.');}
 async function item(c:Connection,id:string,position:number){const [i]=await c.query('SELECT * FROM quiz_items WHERE session_id=? AND position=?',[id,position]);return i||fail(409,'This session needs to be reopened.');}
 async function publicState(c:Connection,s:Row):Promise<PublicSession>{
 const config=parse<PracticeConfig>(s.config),pool=parse<BankQuestion[]>(s.pool);const counts=await c.query('SELECT COUNT(*) AS total,COALESCE(SUM(correct),0) AS score FROM quiz_items WHERE session_id=? AND answered_at IS NOT NULL',[s.id]);
 let current:PublicItem|null=null;
 if(s.status==='active'){const i=await item(c,String(s.id),Number(s.cursor));const answered=i.answered_at!==null;current={id:String(i.id),position:Number(i.position),cycle:Number(i.cycle),question:publicQuestion(parse<BankQuestion>(i.question_snapshot)),options:parse<PracticeOption[]>(i.options),answered,choiceId:i.choice_id===null?null:String(i.choice_id),...(answered&&config.mode!=='test'?{feedback:parse<PracticeFeedback>(i.feedback)}:{})};}
 const notice=Number(s.cycle)>1?`You have seen all ${pool.length} eligible questions. Previously seen material is being revisited, with mistakes first. This is round ${s.cycle}; immediate repeats are avoided.`:config.mode!=='continuous'&&Number(s.target)<config.length?`This pool contains ${pool.length} eligible question${pool.length===1?'':'s'}. Your session was shortened to ${s.target} to avoid repeats.`:`${pool.length} eligible question${pool.length===1?'':'s'}. Each appears once before any repeated practice.`;
 return {id:String(s.id),config,status:s.status as PublicSession['status'],revision:Number(s.revision),cycle:Number(s.cycle),poolSize:pool.length,target:Number(s.target),notice,current,answered:Number(counts[0].total),score:config.mode==='test'&&s.status==='active'?null:Number(counts[0].score),...(s.summary?{summary:parse<PracticeSummary>(s.summary)}:{})};
 }
 async function get(user:string,id:string){return db.transaction(async c=>publicState(c,await row(c,user,id)));}
 async function start(user:string,id:string,config:PracticeConfig){return db.transaction(async c=>{
  if(db.dialect==='postgres')await c.query('SELECT id FROM users WHERE id=? FOR UPDATE',[user]);
  const [existing]=await c.query('SELECT * FROM quiz_sessions WHERE id=? AND user_id=?',[id,user]);if(existing){if(JSON.stringify(parse(existing.config))!==JSON.stringify(config))fail(409,'This session ID already has different settings.');return publicState(c,existing);}
  const [foreign]=await c.query('SELECT id FROM quiz_sessions WHERE id=?',[id]);if(foreign)fail(409,'Please start a new session.');
  const active=await c.query("SELECT id FROM quiz_sessions WHERE user_id=? AND status='active'",[user]);if(active.length>=8)fail(409,'Finish an existing practice session before starting another.');
  const known=await learningFilter(c,user,clock());let pool=eligibleQuestions(config,known);
  if(config.sourceSessionId){const source=await row(c,user,config.sourceSessionId);if(source.status!=='finished')fail(409,'Finish the original session first.');const wrong=await c.query('SELECT DISTINCT question_id FROM quiz_items WHERE session_id=? AND correct=0',[source.id]);const ids=new Set(wrong.map(r=>r.question_id));pool=pool.filter(q=>ids.has(q.id));}
  if(!pool.length)fail(400,config.focus==='mistakes'||config.category==='weak'?'No eligible mistakes yet. Try regular practice, or broaden your filters.':'No eligible questions. Study some material or broaden your filters.');
  if(config.mode==='continuous'&&pool.length<2)fail(400,'Continuous Practice needs at least two eligible questions to avoid an immediate repeat. Broaden the category or use a short practice session.');
  // Keep distractors within the eligible material when possible; small pools retain safe bank fallbacks.
  pool=pool.map(q=>({...q,options:scopedChoices(q,pool)}));
  const target=config.mode==='continuous'?pool.length:Math.min(config.length,pool.length);
  const priority=config.daily?new Set(pool.filter(q=>known.weak.has(q.concept)||known.wrongIds.has(q.id)||known.dueIds?.has(q.id)).map(q=>q.id)):new Set<string>();
  const order=cycleOrder(pool,priority).slice(0,target);
  const now=clock();await c.query('INSERT INTO quiz_sessions(id,user_id,config,pool,status,target,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)',[id,user,JSON.stringify(config),JSON.stringify(pool),'active',target,now,now]);await insertItems(c,id,order,0,1);return publicState(c,await row(c,user,id));
 });}
 async function answer(user:string,id:string,input:{itemId:string;choiceId:string|null;revision:number}){return db.transaction(async c=>{
  const s=await row(c,user,id,true);const [i]=await c.query('SELECT * FROM quiz_items WHERE session_id=? AND id=?',[id,input.itemId]);if(!i||Number(i.position)>Number(s.cursor))fail(409,'This is not the current question. Refresh your session.');
  if(i.answered_at!==null){if(i.choice_id!==input.choiceId)fail(409,'This question has already been answered. Your saved answer is unchanged.');return publicState(c,s);}
  if(s.status!=='active'||Number(s.revision)!==input.revision||Number(i.position)!==Number(s.cursor))fail(409,'This session changed in another tab. Reload to continue.');
  const options=parse<PracticeOption[]>(i.options);const chosen=input.choiceId===null?null:options.find(o=>o.id===input.choiceId);if(input.choiceId!==null&&!chosen)fail(400,'Choose an option belonging to this question.');
  const q=parse<BankQuestion>(i.question_snapshot);const r=evaluate(q,chosen?.label||'');const feedback:PracticeFeedback={correct:r.correct,skipped:input.choiceId===null,expected:r.expected,explanation:input.choiceId===null?`Skipped. ${q.explanation}`:r.correct?`${q.explanation} Return on another day to strengthen recall.`:r.explanation,units:r.units};
  await c.query('UPDATE quiz_items SET choice_id=?,feedback=?,correct=?,answered_at=? WHERE session_id=? AND id=?',[input.choiceId,JSON.stringify(feedback),r.correct?1:0,clock(),id,input.itemId]);await c.query('UPDATE quiz_sessions SET revision=revision+1,updated_at=? WHERE id=?',[clock(),id]);return publicState(c,await row(c,user,id));
 });}
 async function next(user:string,id:string,input:{itemId:string;revision:number}){return db.transaction(async c=>{
  const s=await row(c,user,id,true);const [old]=await c.query('SELECT position FROM quiz_items WHERE session_id=? AND id=?',[id,input.itemId]);if(old&&Number(old.position)<Number(s.cursor))return publicState(c,s);
  if(s.status!=='active')return publicState(c,s);
  if(Number(s.revision)!==input.revision)fail(409,'This session changed in another tab. Reload to continue.');const current=await item(c,id,Number(s.cursor));if(current.id!==input.itemId||current.answered_at===null)fail(409,'Answer or skip the current question before continuing.');
  const [following]=await c.query('SELECT id FROM quiz_items WHERE session_id=? AND position=?',[id,Number(s.cursor)+1]);
  if(!following){const config=parse<PracticeConfig>(s.config);if(config.mode!=='continuous')return publicState(c,s);const pool=parse<BankQuestion[]>(s.pool);const misses=await c.query('SELECT DISTINCT question_id FROM quiz_items WHERE session_id=? AND correct=0',[id]);const wrong=new Set(misses.map(r=>String(r.question_id)));await insertItems(c,id,cycleOrder(pool,wrong,String(current.question_id)),Number(s.cursor)+1,Number(s.cycle)+1);await c.query('UPDATE quiz_sessions SET cycle=cycle+1 WHERE id=?',[id]);}
  await c.query('UPDATE quiz_sessions SET cursor=cursor+1,revision=revision+1,updated_at=? WHERE id=?',[clock(),id]);return publicState(c,await row(c,user,id));
 });}
 async function finish(user:string,id:string){return db.transaction(async c=>{
  // Consistent lock ordering serializes progress changes across lessons and simultaneous sessions.
  if(db.dialect==='postgres')await c.query('SELECT id FROM users WHERE id=? FOR UPDATE',[user]);
  const s=await row(c,user,id,true);if(s.status==='finished')return publicState(c,s);
  const config=parse<PracticeConfig>(s.config);const current=await item(c,id,Number(s.cursor));
  if(current.answered_at===null){const q=parse<BankQuestion>(current.question_snapshot);const f:PracticeFeedback={correct:false,skipped:true,expected:q.answer[0],explanation:`Unanswered at finish. ${q.explanation}`,units:q.units||q.display||''};await c.query('UPDATE quiz_items SET feedback=?,correct=0,answered_at=? WHERE session_id=? AND id=?',[JSON.stringify(f),clock(),id,current.id]);}
  const [totals]=await c.query('SELECT COUNT(*) AS total,COALESCE(SUM(correct),0) AS correct,COALESCE(SUM(CASE WHEN choice_id IS NULL THEN 1 ELSE 0 END),0) AS skipped FROM quiz_items WHERE session_id=? AND position<=?',[id,s.cursor]);
  const details=await c.query('SELECT * FROM quiz_items WHERE session_id=? AND position<=? ORDER BY position LIMIT 100',[id,s.cursor]);
  const firstPass=await c.query('SELECT i.* FROM quiz_items i JOIN (SELECT question_id,MIN(position) AS first_position FROM quiz_items WHERE session_id=? AND position<=? GROUP BY question_id) f ON i.question_id=f.question_id AND i.position=f.first_position WHERE i.session_id=? ORDER BY i.position',[id,s.cursor,id]);
  const misses=await c.query('SELECT DISTINCT question_id FROM quiz_items WHERE session_id=? AND position<=? AND correct=0',[id,s.cursor]);const pool=parse<BankQuestion[]>(s.pool);const total=Number(totals.total),skipped=Number(totals.skipped),correct=Number(totals.correct);
  const summary:PracticeSummary={total,answered:total-skipped,correct,skipped,notReached:config.mode==='continuous'?0:Math.max(0,Number(s.target)-total),accuracy:total?Math.round(100*correct/total):0,weakConcepts:[...new Set(misses.map(m=>pool.find(q=>q.id===m.question_id)?.concept).filter((c):c is string=>!!c))],items:details.map(i=>{const q=parse<BankQuestion>(i.question_snapshot),options=parse<PracticeOption[]>(i.options);return {id:String(i.id),question:publicQuestion(q),choice:options.find(o=>o.id===i.choice_id)?.label||null,feedback:parse<PracticeFeedback>(i.feedback)};})};
  const [u]=await c.query('SELECT preferences FROM users WHERE id=?',[user]);const zone=parse<{timezone:string}>(u.preferences).timezone;
  const graded=new Set<string>();for(const i of firstPass){const q=parse<BankQuestion>(i.question_snapshot);if(graded.has(q.id))continue;graded.add(q.id);const concept='recognition:'+q.concept;const [p]=await c.query('SELECT state FROM progress WHERE user_id=? AND concept=? AND skill=?',[user,concept,q.skill]);const state={...schedule(p?parse<Progress>(p.state):undefined,concept,q.skill,!!i.correct,clock(),zone),method:'recognition',displayConcept:q.concept};await c.query('INSERT INTO progress(user_id,concept,skill,state) VALUES(?,?,?,?) ON CONFLICT(user_id,concept,skill) DO UPDATE SET state=excluded.state',[user,concept,q.skill,JSON.stringify(state)]);await c.query('INSERT INTO reviews(user_id,question_id,version,lesson_id,due_at) VALUES(?,?,?,?,?) ON CONFLICT(user_id,question_id) DO UPDATE SET version=excluded.version,lesson_id=excluded.lesson_id,due_at=excluded.due_at',[user,q.id,q.version,q.lessonId,state.dueAt]);}
  await c.query('INSERT INTO activity_events(user_id,id,created_at) VALUES(?,?,?) ON CONFLICT(user_id,id) DO NOTHING',[user,'quiz:'+id,clock()]);await c.query("UPDATE quiz_sessions SET status='finished',summary=?,revision=revision+1,updated_at=? WHERE id=?",[JSON.stringify(summary),clock(),id]);return publicState(c,await row(c,user,id));
 });}
 async function list(user:string){const rows=await db.query('SELECT id,config,status,summary,updated_at FROM quiz_sessions WHERE user_id=? ORDER BY updated_at DESC LIMIT 40',[user]);return rows.map(r=>({id:r.id,config:parse<PracticeConfig>(r.config),status:r.status,updatedAt:Number(r.updated_at),...(r.summary?{summary:parse<PracticeSummary>(r.summary)}:{})}));}
 async function exportAll(user:string){return db.transaction(async c=>{const sessions=await c.query('SELECT * FROM quiz_sessions WHERE user_id=? ORDER BY created_at',[user]);const output=[];for(const s of sessions){const config=parse<PracticeConfig>(s.config);const rows=await c.query('SELECT * FROM quiz_items WHERE session_id=? ORDER BY position',[s.id]);output.push({id:s.id,config,status:s.status,cursor:Number(s.cursor),revision:Number(s.revision),...(s.summary?{summary:parse<PracticeSummary>(s.summary)}:{}),items:rows.map(i=>({id:i.id,position:Number(i.position),cycle:Number(i.cycle),question:publicQuestion(parse<BankQuestion>(i.question_snapshot)),options:parse<PracticeOption[]>(i.options),choiceId:i.choice_id,answeredAt:i.answered_at?Number(i.answered_at):null,...(i.feedback&&(s.status==='finished'||config.mode!=='test')?{feedback:parse<PracticeFeedback>(i.feedback)}:{})}))});}return output;});}
 return {start,get,answer,next,finish,list,exportAll};
}
