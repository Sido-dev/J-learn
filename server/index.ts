import { createApp } from './app.js';
import { openStore } from './db.js';
import express from 'express';
import { resolve } from 'node:path';
const db=await openStore();
if(process.env.NODE_ENV!=='production'||process.env.AUTO_MIGRATE==='true')await db.migrate();
else {const current=await db.query('SELECT version FROM schema_migrations WHERE version=2');if(!current.length)throw new Error('Run the current migrations before starting production.');}
const app=createApp(db);
if(process.env.NODE_ENV==='production'){
 app.use(express.static(resolve('dist/client'),{maxAge:'1h',index:false}));
 app.get('/{*path}',(_req,res)=>res.sendFile(resolve('dist/client/index.html')));
}else{
 const { createServer }=await import('vite');const vite=await createServer({server:{middlewareMode:true},appType:'spa'});app.use(vite.middlewares);
}
const portFlag=process.argv.indexOf('--port');const port=Number(process.env.PORT||(portFlag>=0?process.argv[portFlag+1]:3000));const server=app.listen(port,'0.0.0.0',()=>{const addr=server.address();console.log(`Sumi available at http://localhost:${typeof addr==='object'&&addr?addr.port:port}`);});
server.requestTimeout=15000;server.headersTimeout=10000;
let shuttingDown=false;async function stop(){if(shuttingDown)return;shuttingDown=true;server.close(async()=>{await db.close();process.exit(0);});setTimeout(()=>process.exit(1),10000).unref();}
process.on('SIGTERM',stop);process.on('SIGINT',stop);
