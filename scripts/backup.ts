import { DatabaseSync,backup } from 'node:sqlite';
if(process.env.DATABASE_URL)throw new Error('Use pg_dump for PostgreSQL, as documented in docs/OPERATIONS.md');
const target=process.argv[2];if(!target)throw new Error('Usage: npm run backup -- /absolute/path/backup.sqlite');
const db=new DatabaseSync(process.env.SQLITE_PATH||'.data/sumi.sqlite');try{await backup(db,target);console.log('Consistent SQLite backup completed.');}finally{db.close();}
