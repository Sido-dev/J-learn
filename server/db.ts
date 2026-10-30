import { DatabaseSync } from 'node:sqlite';
import { mkdirSync,readFileSync } from 'node:fs';
import { dirname,resolve } from 'node:path';
import pg from 'pg';
import { lessons } from '../shared/content.js';
import { bankSnapshotLessons } from './practice/bank.js';
export type Row=Record<string,unknown>;
export interface Connection{query(sql:string,params?:unknown[]):Promise<Row[]>;}
export interface Store extends Connection{dialect:'postgres'|'sqlite';transaction<T>(work:(c:Connection)=>Promise<T>):Promise<T>;close():Promise<void>;migrate():Promise<void>;}
export async function recordCompletion(c:Connection,user:string,lesson:string,score:number,now:number){
 await c.query('INSERT INTO lesson_completions(user_id,lesson_id,best_score,passed_at) VALUES(?,?,?,?) ON CONFLICT(user_id,lesson_id) DO UPDATE SET best_score=CASE WHEN excluded.best_score>lesson_completions.best_score THEN excluded.best_score ELSE lesson_completions.best_score END',[user,lesson,score,now]);
}
export async function openStore(url:string|null=process.env.DATABASE_URL||null):Promise<Store>{
 let query:Connection['query'];let close:()=>Promise<void>;let transaction:Store['transaction'];
 if(url){
  const pool=new pg.Pool({connectionString:url,max:10,connectionTimeoutMillis:5000,idleTimeoutMillis:30000,statement_timeout:10000});pool.on('error',()=>process.stderr.write('{"level":"error","event":"database_pool_error"}\n'));
  const sql=(text:string)=>{let n=0;return text.replace(/\?/g,()=>`$${++n}`);};
  query=async(text,params=[])=>(await pool.query(sql(text),params)).rows;close=()=>pool.end();
  transaction=async work=>{const client=await pool.connect();try{await client.query('BEGIN');const value=await work({query:async(text,params=[])=>(await client.query(sql(text),params)).rows});await client.query('COMMIT');return value;}catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}};
 }else{
  if(process.env.NODE_ENV==='production'&&process.env.ALLOW_SQLITE!=='true')throw new Error('Production requires DATABASE_URL, or explicit ALLOW_SQLITE=true with a persistent single-instance disk.');
  const file=process.env.SQLITE_PATH||'.data/sumi.sqlite';if(file!==':memory:')mkdirSync(dirname(resolve(file)),{recursive:true,mode:0o700});
  const sqlite=new DatabaseSync(file);sqlite.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;');
  const raw:Connection['query']=async(text,params=[])=>{const stmt=sqlite.prepare(text);if(/^\s*(SELECT|PRAGMA|WITH)/i.test(text)||/RETURNING/i.test(text))return stmt.all(...params as (string|number|null)[]) as Row[];stmt.run(...params as (string|number|null)[]);return [];};
  let tail=Promise.resolve();
  async function exclusive<T>(work:()=>Promise<T>){let release!:()=>void;const previous=tail;tail=new Promise<void>(r=>{release=r;});await previous;try{return await work();}finally{release();}}
  // All access shares one queue. Unrelated reads cannot observe another request's uncommitted writes.
  query=(text,params=[])=>exclusive(()=>raw(text,params));
  transaction=work=>exclusive(async()=>{sqlite.exec('BEGIN IMMEDIATE');try{const value=await work({query:raw});sqlite.exec('COMMIT');return value;}catch(error){sqlite.exec('ROLLBACK');throw error;}});
  close=()=>exclusive(async()=>sqlite.close());
 }
 const store:Store={dialect:url?'postgres':'sqlite',query,transaction,close,migrate:async()=>{
  await transaction(async c=>{
   if(url)await c.query('SELECT pg_advisory_xact_lock(742019865)');
   const schema=readFileSync(resolve('migrations/001-initial.sql'),'utf8');for(const statement of schema.split(';').map(s=>s.trim()).filter(Boolean))await c.query(statement);
   await c.query('INSERT INTO schema_migrations(version,applied_at) VALUES(1,?) ON CONFLICT(version) DO NOTHING',[Date.now()]);
   const [migrated]=await c.query('SELECT version FROM schema_migrations WHERE version=2');
   if(!migrated){const upgrade=readFileSync(resolve('migrations/002-learning-sessions.sql'),'utf8');for(const statement of upgrade.split(';').map(s=>s.trim()).filter(Boolean))await c.query(statement);
    // Backfill from the entire history, not the API's recent-activity page.
    const history=await c.query("SELECT user_id,lesson_id,result,created_at FROM attempts WHERE mode='lesson'");for(const a of history){const result=JSON.parse(String(a.result)) as {score:number;total:number};if(result.total>0&&result.score/result.total>=0.8)await recordCompletion(c,String(a.user_id),String(a.lesson_id),result.score/result.total,Number(a.created_at));}
    await c.query('INSERT INTO schema_migrations(version,applied_at) VALUES(2,?)',[Date.now()]);
   }
   for(const l of [...lessons,...bankSnapshotLessons()]){const [existing]=await c.query('SELECT snapshot FROM lesson_versions WHERE id=? AND version=?',[l.id,l.version]);if(existing&&existing.snapshot!==JSON.stringify(l))throw new Error('Content changed without a version bump: '+l.id);await c.query('INSERT INTO lesson_versions(id,version,snapshot) VALUES(?,?,?) ON CONFLICT(id,version) DO NOTHING',[l.id,l.version,JSON.stringify(l)]);for(const q of [...l.exercises,...('guided'in l?[...l.guided||[],...l.corrections||[]]:[])])await c.query('INSERT INTO exercise_versions(id,version,lesson_id,snapshot) VALUES(?,?,?,?) ON CONFLICT(id,version) DO NOTHING',[q.id,l.version,l.id,JSON.stringify(q)]);}
  });
 }};return store;
}
