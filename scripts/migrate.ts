import { openStore } from '../server/db.js';
const db=await openStore();try{await db.migrate();console.log('Schema and versioned curriculum are current. Existing versions preserved.');}finally{await db.close();}
