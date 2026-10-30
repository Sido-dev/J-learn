import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync,rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';
import { openStore } from '../server/db.js';
test('file-backed progress survives reopening; online backup restores the same relational records',async()=>{const dir=mkdtempSync(join(tmpdir(),'sumi-persistence-'));const path=join(dir,'journal.sqlite'),copy=join(dir,'backup.sqlite');const previous=process.env.SQLITE_PATH;process.env.SQLITE_PATH=path;try{const db=await openStore(null);await db.migrate();await db.transaction(async c=>{await c.query('INSERT INTO users(id,name,preferences,created_at) VALUES(?,?,?,?)',['persisted','Demo','{}',1]);await c.query('INSERT INTO bookmarks(user_id,item,created_at) VALUES(?,?,?)',['persisted','word:あ',1]);await c.query('INSERT INTO progress(user_id,concept,skill,state) VALUES(?,?,?,?)',['persisted','あ','reading',JSON.stringify({attempts:2,mastered:false})]);});execFileSync(process.execPath,['--import','tsx','scripts/backup.ts',copy],{cwd:process.cwd(),env:{...process.env,DATABASE_URL:''}});await db.close();const reopened=await openStore(null);assert.equal((await reopened.query('SELECT item FROM bookmarks WHERE user_id=?',['persisted']))[0].item,'word:あ');await reopened.close();const restored=new DatabaseSync(copy,{readOnly:true});assert.equal(restored.prepare('SELECT concept FROM progress WHERE user_id=?').get('persisted')?.concept,'あ');restored.close();}finally{if(previous===undefined)delete process.env.SQLITE_PATH;else process.env.SQLITE_PATH=previous;rmSync(dir,{recursive:true,force:true});}});
