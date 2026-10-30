import { randomInt,randomUUID } from 'node:crypto';
import type { BankQuestion,PracticeOption } from '../../shared/practice.js';
export type RandomInt=(max:number)=>number;
export function shuffle<T>(values:readonly T[],random:RandomInt=randomInt):T[]{const a=[...values];for(let i=a.length-1;i>0;i--){const j=random(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
export function cycleOrder(pool:readonly BankQuestion[],wrong:Set<string>,lastId?:string,random:RandomInt=randomInt){
 const weak=shuffle(pool.filter(q=>wrong.has(q.id)),random),other=shuffle(pool.filter(q=>!wrong.has(q.id)),random);const order=[...weak,...other];
 if(order.length>1&&order[0].id===lastId){const i=order.findIndex(q=>q.id!==lastId);[order[0],order[i]]=[order[i],order[0]];}
 return order;
}
export function randomOptions(question:BankQuestion,random:RandomInt=randomInt,id=()=>randomUUID()):PracticeOption[]{return shuffle(question.options,random).map(label=>({id:id(),label}));}
