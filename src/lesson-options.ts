import type { PublicExercise } from './api';

export type LessonOptionOrder=Record<string,string[]>;

/** Create one independent choice order per question, reusing a saved order on refresh. */
export function lessonOptionOrder(questions:readonly PublicExercise[],saved:LessonOptionOrder|undefined,random:()=>number=Math.random):LessonOptionOrder{
 const order:LessonOptionOrder={};
 for(const q of questions){
  if(q.type!=='choice'||!q.options?.length)continue;
  const previous=saved?.[q.id],options=q.options;
  if(Array.isArray(previous)&&previous.length===options.length&&new Set(previous).size===options.length&&previous.every(value=>options.includes(value))){order[q.id]=[...previous];continue;}
  const shuffled=[...options];
  for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
  order[q.id]=shuffled;
 }
 return order;
}

export function withLessonOptionOrder(q:PublicExercise,order:LessonOptionOrder):PublicExercise{
 return q.type==='choice'&&order[q.id]?{...q,options:order[q.id]}:q;
}
