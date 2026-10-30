import type { Lesson, Exercise, stages, kana, plan, strokeModels, readingStories } from '../shared/content';
import type { Progress,grade } from '../shared/learning';
export type PublicExercise=Omit<Exercise,'answer'|'explanation'|'units'>;
export type PublicLesson=Omit<Lesson,'exercises'|'guided'|'corrections'> & {exercises:PublicExercise[];guided:PublicExercise[];corrections:PublicExercise[]};
export type Curriculum={version:string;stages:typeof stages;lessons:PublicLesson[];kana:typeof kana;plan:typeof plan;strokes:typeof strokeModels};
export type Preferences={goal:string;minutes:number;timezone:string;romaji:boolean;furigana:boolean;translations:boolean;theme:'light'|'dark';onboarded:boolean;streaks:boolean};
export type User={id:string;name:string;email:string|null;preferences:Preferences};
export type Result=ReturnType<typeof grade>;
export type Feedback=Result['results'][number];
export type Reading=Omit<(typeof readingStories)[number],'answer'>;
export type StudyState={user:User;completedLessons:{id:string;bestScore:number}[];quizMistakes:{sessionId:string;questionId:string;concept:string;prompt:string;display?:string;skill:string;choice:string|null;feedback:{correct:boolean;expected:string;explanation:string};createdAt:number}[];progress:Progress[];reviews:{questionId:string;lessonId:string;dueAt:number;kind:'mcq'|'lesson';retired:boolean;label:string}[];attempts:{id:string;lesson_id:string;mode:string;result:Result;created_at:number}[];bookmarks:string[];practice:{id:string;kind:string;content:{text?:string;character?:string;strokes?:number[][][];selfRating?:string};created_at:number}[];streak:number;today:number;now:number};
let csrf='';export function setCsrf(value:string){csrf=value;}
export class ApiError extends Error{constructor(message:string,public status:number){super(message);}}
export async function api<T>(path:string,method='GET',body?:unknown):Promise<T>{
 const abort=new AbortController();const timeout=setTimeout(()=>abort.abort(),12000);
 try{const response=await fetch('/api'+path,{method,credentials:'same-origin',signal:abort.signal,headers:{'Content-Type':'application/json','X-Sumi-Request':'1',...(csrf?{'X-CSRF-Token':csrf}:{})},...(body!==undefined?{body:JSON.stringify(body)}:{})});const data=await response.json();if(!response.ok){if(response.status===401&&!path.startsWith('/auth/'))window.dispatchEvent(new Event('sumi-session-expired'));throw new ApiError(data.error||'Please try again.',response.status);}return data;}catch(e){if(e instanceof ApiError)throw e;throw new Error(navigator.onLine?'The connection took too long. Your answers are kept in this tab; retry safely.':'You are offline. Your answers are kept in this tab. Reconnect to save.',{cause:e});}finally{clearTimeout(timeout);}
}
