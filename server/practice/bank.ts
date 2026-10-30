import { createHash } from 'node:crypto';
import { kana,lessons } from '../../shared/content.js';
import { kanaExamples } from '../../shared/kana-words.js';
import { kanji } from '../../shared/kanji.js';
import { normalize } from '../../shared/learning.js';
import type { BankQuestion,PracticeConfig,Script } from '../../shared/practice.js';
const variants:Record<string,string[]>={shi:['si'],chi:['ti'],tsu:['tu'],fu:['hu'],wo:['o'],ji:['zi'],sha:['sya'],shu:['syu'],sho:['syo'],cha:['tya'],chu:['tyu'],cho:['tyo']};
const marked=[['がぎぐげご','ga gi gu ge go'],['ざじずぜぞ','za ji zu ze zo'],['だぢづでど','da ji zu de do'],['ばびぶべぼ','ba bi bu be bo'],['ぱぴぷぺぽ','pa pi pu pe po']];
const pairs=[['き','ky'],['し','sh'],['ち','ch'],['に','ny'],['ひ','hy'],['み','my'],['り','ry'],['ぎ','gy'],['じ','j'],['び','by'],['ぴ','py']];
export const kanaEntries=[...kana.map(k=>({id:'kana-'+k.char,char:k.char,kata:k.kata,reading:k.romaji,row:k.row,group:'basic',note:k.char==='を'?'As an object particle, を is usually pronounced o. Wo is accepted as a transliteration of the written character.':k.char==='ん'?'ん is its own mora. Its articulation depends on the following sound.':'Each full-sized kana normally represents one mora.'})),...marked.flatMap(([chars,sounds],idx)=>[...chars].map((char,i)=>({id:'kana-'+char,char,kata:String.fromCharCode(char.charCodeAt(0)+0x60),reading:sounds.split(' ')[i],row:['g','z','d','b','p'][idx],group:idx===4?'handakuten':'dakuten',note:char==='ぢ'||char==='づ'?'The spelling of this voiced kana depends on the word; its sound often merges with じ/ず in standard Japanese.':idx===4?'The small circle is handakuten: h-row sounds become p-row sounds.':'The two small marks are dakuten: they voice the base consonant.'}))),...pairs.flatMap(([base,sound])=>[...'ゃゅょ'].map((small,i)=>{const char=base+small;return {id:'kana-'+char,char,kata:[...char].map(c=>String.fromCharCode(c.charCodeAt(0)+0x60)).join(''),reading:sound+['a','u','o'][i],row:base,group:'combined',note:'Small ゃ/ゅ/ょ joins the preceding i-row kana into one mora. Compare full-sized や/ゆ/よ.'};}))];
const confusion:Record<string,string[]>={shi:['chi','tsu','su'],chi:['shi','tsu','ki'],tsu:['su','shi','chi'],ka:['ki','ku','ko'],ha:['ho','ba','pa'],ho:['ha','he','fu'],pa:['ba','ha','po'],ba:['pa','ha','bi'],kya:['kyu','kyo','ka'],kyu:['kya','kyo','ku']};
export function choices(correct:string,accepted:string[],universe:string[],preferred:string[]=[]){
 const blocked=new Set(accepted.map(normalize));const choices=[correct];
 for(const value of [...preferred,...universe])if(!blocked.has(normalize(value))&&!choices.some(v=>normalize(v)===normalize(value))){choices.push(value);if(choices.length===4)break;}
 if(choices.length!==4)throw new Error('Four unambiguous options require a larger category.');return choices;
}
/** Prefer the eligible material while keeping meaning, kana, and vocabulary tasks distinct. */
export function scopedChoices(question:BankQuestion,pool:readonly BankQuestion[]){
 const family=(q:BankQuestion)=>['meaning','readings','vocabulary'].includes(q.category)?q.category:'kana';
 const related=new Set(['tree','grove','forest']);
 const selected=pool.filter(q=>q.script===question.script&&family(q)===family(question)).map(q=>q.answer[0]).filter(value=>!(question.category==='meaning'&&related.has(question.answer[0])&&related.has(value)&&value!==question.answer[0]));
 const available=new Set(selected.map(normalize));
 return choices(question.answer[0],question.answer,[...selected,...question.options],question.options.filter(value=>available.has(normalize(value))));
}
export function createBank():BankQuestion[]{
 const bank:BankQuestion[]=[];
 for(const script of ['hiragana','katakana'] as const)for(const entry of kanaEntries){const display=script==='hiragana'?entry.char:entry.kata;const accepted=[entry.reading,...variants[entry.reading]||[]];const group=kanaEntries.filter(e=>e.group===entry.group).map(e=>e.reading);const options=choices(entry.reading,accepted,[...kanaEntries.filter(e=>e.group===entry.group&&e.row===entry.row).map(e=>e.reading),...group],confusion[entry.reading]?.filter(p=>group.includes(p)));bank.push({id:`mcq-${script}-${entry.char}`,version:2,concept:display,skill:'reading',type:'choice',script,category:entry.group,row:entry.row,difficulty:entry.group==='basic'?'starter':'standard',lessonId:'bank-'+script,prompt:'Choose the reading of this character or sound combination.',display,options,answer:accepted,explanation:`${display} = ${entry.reading}. ${entry.note}`,units:[...display].join(' · '),help:`Study first: ${display} is ${entry.reading}. ${entry.note}`});}
 for(const entry of kanji){const correct=entry.meanings[0];const related=entry.topic==='nature'&&['木','林','森'].includes(entry.char)?new Set(['tree','grove','forest']):new Set<string>();const options=choices(correct,entry.meanings,kanji.map(k=>k.meanings[0]).filter(m=>!related.has(m)));bank.push({id:`mcq-kanji-${entry.char}-meaning`,version:2,script:'kanji',category:'meaning',row:'',topic:entry.topic,difficulty:'starter',lessonId:'bank-kanji',concept:entry.char,skill:'comprehension',type:'choice',prompt:'What is a core meaning of this kanji?',display:entry.char,options,answer:entry.meanings,explanation:`${entry.char}: ${entry.meanings.join(' / ')}. Example: ${entry.words[0].jp} (${entry.words[0].kana}) means ${entry.words[0].en}.`,units:entry.components,help:`${entry.char}: ${entry.meanings.join(' / ')}. Readings depend on the word.`});
 const word=entry.words[0],meaning=word.en;bank.push({id:`mcq-kanji-${entry.char}-word`,version:2,script:'kanji',category:'readings',row:'',topic:entry.topic,difficulty:'standard',lessonId:'bank-kanji',concept:entry.char,skill:'reading',type:'choice',prompt:`Choose the kana reading of the taught word meaning “${meaning}”. Use this standalone word, not an unrelated compound reading.`,display:word.jp,options:choices(word.kana,[word.kana],kanji.map(k=>k.words[0].kana)),answer:[word.kana],explanation:`${word.jp} (${word.kana}) = ${word.en}. Other readings of ${entry.char} occur in other words; there is no universal kanji pronunciation.`,units:`Taught context: ${entry.sentence.jp} (${entry.sentence.kana}) — ${entry.sentence.en}`,help:`Study the word: ${word.jp} = ${word.kana}, ${word.en}.`});}
 for(const word of vocabulary){if(!/^[ぁ-ヶ一-龯ー]+$/.test(word.jp))continue;const script:Script=/[一-龯]/.test(word.jp)?'kanji':/[ァ-ヶ]/.test(word.jp)?'katakana':'hiragana';const universe=vocabulary.filter(w=>script==='kanji'?/[一-龯]/.test(w.jp):script==='katakana'?/[ァ-ヶ]/.test(w.jp):!/[^ぁ-ゖー]/.test(w.jp)).map(w=>w.reading);if(new Set(universe).size<4)continue;bank.push({id:'mcq-word-'+createHash('sha256').update(word.jp).digest('hex').slice(0,20),version:2,script,category:'vocabulary',row:'',difficulty:'standard',lessonId:'bank-'+script,concept:word.jp,skill:'reading',type:'choice',prompt:`Choose the taught reading of “${word.jp}” (${word.en}).`,display:word.jp,options:choices(word.reading,[word.reading],universe),answer:[word.reading],explanation:`${word.jp} = ${word.reading}, ${word.en}. Revisit this word in its study example.`,units:word.jp,help:`Study first: ${word.jp} (${word.reading}) means ${word.en}.`});}
 return bank;
}
export type LearningFilter={learned:Set<string>;weak:Set<string>;wrongIds:Set<string>;bookmarks?:Set<string>;dueIds?:Set<string>};
export function eligibleQuestions(config:PracticeConfig,known:LearningFilter,bank=questionBank){
 let pool=bank.filter(q=>q.script===config.script);
 if(config.category==='bookmarks'){pool=pool.filter(q=>known.bookmarks?.has(q.display||q.concept));}
 else if(config.category==='vocabulary')pool=pool.filter(q=>q.category==='vocabulary');
 else {pool=pool.filter(q=>q.category!=='vocabulary');
 if(config.script==='kanji'){
  if(['starter','meaning','learned','weak'].includes(config.category))pool=pool.filter(q=>q.category==='meaning');
  else if(config.category==='readings')pool=pool.filter(q=>q.category==='readings');
  else pool=pool.filter(q=>q.category==='meaning'&&q.topic===config.category);
 }else if(config.category==='rows')pool=pool.filter(q=>q.category==='basic'&&config.rows.includes(q.row));
 else if(!['mixed','learned','weak'].includes(config.category))pool=pool.filter(q=>q.category===config.category);
 }
 if(config.category==='learned'||config.daily)pool=pool.filter(q=>known.learned.has(q.concept));
 if(config.category==='weak'||config.focus==='mistakes')pool=pool.filter(q=>known.weak.has(q.concept)||known.wrongIds.has(q.id));
 if(config.difficulty!=='any')pool=pool.filter(q=>q.difficulty===config.difficulty);
 if(config.questionId)pool=pool.filter(q=>q.id===config.questionId);
 return pool;
}
export function findBankQuestion(id:string){return questionBank.find(q=>q.id===id);}
export function bankSnapshotLessons(){return (['hiragana','katakana','kanji'] as Script[]).map(script=>({id:'bank-'+script,version:2,title:'Versioned '+script+' MCQ bank',exercises:questionBank.filter(q=>q.script===script)}));}
export const vocabulary=[...kanaEntries.flatMap(k=>[...kanaExamples(k.char),...kanaExamples(k.char,true)].map(w=>({id:'word-'+w.jp,jp:w.jp,reading:w.reading,en:w.en,kanji:''}))),...kanji.flatMap(k=>k.words.map(w=>({id:'word-'+w.jp,jp:w.jp,reading:w.kana,en:w.en,kanji:k.char}))),...lessons.flatMap(l=>l.examples.filter(e=>[...e.jp].length>1&&!e.jp.includes('。')).map(e=>({id:'word-'+e.jp,jp:e.jp,reading:e.reading,en:e.en,kanji:''})))].filter((w,i,all)=>all.findIndex(x=>x.id===w.id)===i);

export const questionBank=createBank();
