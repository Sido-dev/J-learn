import type { Lesson } from './content.js';
export function recommendLesson<T extends Pick<Lesson,'id'|'prerequisites'>>(lessons:T[],completed:Set<string>){return lessons.find(l=>!completed.has(l.id)&&l.prerequisites.every(p=>completed.has(p)))||lessons.find(l=>completed.has(l.id))||lessons[0];}
