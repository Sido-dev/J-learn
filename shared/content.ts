import { buildGuided } from './guided.js';
import importedStrokes from './stroke-data.json' with { type: 'json' };
export type Skill = 'reading'|'comprehension'|'writing'|'listening'|'speaking';
export type Exercise = {id:string;concept:string;skill:Skill;type:'choice'|'typed'|'matching'|'fill'|'order'|'listening'|'handwriting';prompt:string;display?:string;audio?:string;options?:string[];answer:string[];explanation:string;units?:string;rubric?:string;hints?:string[];corrects?:string;teaching?:string[];matches?:{label:string;options:string[]}[]};
export type Example = {jp:string;reading:string;en:string;furigana?:{text:string;reading?:string}[]};
export type Lesson = {id:string;version:number;stage:number;title:string;subtitle:string;minutes:number;prerequisites:string[];objectives:string[];explanation:string[];examples:Example[];exercises:Exercise[];characters?:string[];guided?:Exercise[];corrections?:Exercise[]};
export const CONTENT_VERSION = '2026.10.2';
export const stages = [
 {id:0,name:'Foundations',jp:'はじめに',level:'Start here',description:'Sounds, scripts, and a kind study routine.',planned:'More greeting and study-habit lessons.'},
 {id:1,name:'Hiragana',jp:'ひらがな',level:'Before N5',description:'All 46 basic kana, then the sounds that connect them.',planned:'More mixed reading and handwriting models.'},
 {id:2,name:'Katakana',jp:'カタカナ',level:'Before N5',description:'Read names, loanwords, and the long-vowel mark.',planned:'Extended foreign-sound combinations and more loanwords.'},
 {id:3,name:'Beginner',jp:'初級',level:'N5–N4 reference',description:'Build your first sentences and everyday conversations.',planned:'Complete N5–N4 vocabulary, kanji, and grammar sequences.'},
 {id:4,name:'Intermediate',jp:'中級',level:'N3 reference',description:'Connect ideas, tell stories, and give reasons.',planned:'A complete N3 sequence and longer listening material.'},
 {id:5,name:'Advanced',jp:'上級',level:'N2–N1 reference',description:'Explore register, nuanced arguments, and formal Japanese.',planned:'Complete N2–N1 coverage, authentic licensed texts, and educator-reviewed essays.'}
];
const ex = (id:string,prompt:string,answer:string[],display?:string,explanation='Read each sound carefully.',type:Exercise['type']='typed',options?:string[],skill:Skill='reading',units?:string):Exercise=>({id,concept:display||id,skill,type,prompt,display,options,answer,explanation,units});
const make = (id:string,stage:number,title:string,subtitle:string,explanation:string[],examples:Example[],exercises:Exercise[],prerequisites:string[]=[],characters?:string[]):Lesson=>({id,version:1,stage,title,subtitle,minutes:8,prerequisites,objectives:[subtitle,'Recall the idea independently, then return to it in a later session.'],explanation,examples,exercises,characters});
const baseRows = [
 ['a','あいうえお','a i u e o'],['k','かきくけこ','ka ki ku ke ko'],['s','さしすせそ','sa shi su se so'],['t','たちつてと','ta chi tsu te to'],['n','なにぬねの','na ni nu ne no'],['h','はひふへほ','ha hi fu he ho'],['m','まみむめも','ma mi mu me mo'],['y','やゆよ','ya yu yo'],['r','らりるれろ','ra ri ru re ro'],['w','わをん','wa wo n']
];
export const kana = baseRows.flatMap(([row,chars,readings])=>[...chars].map((char,i)=>({char,kata:String.fromCharCode(char.charCodeAt(0)+0x60),romaji:readings.split(' ')[i],row})));
const variants:Record<string,string[]>={shi:['si'],chi:['ti'],tsu:['tu'],fu:['hu'],wo:['o'],ji:['zi']};
export const lessons:Lesson[] = [make('start',0,'A small beginning','Meet Japanese sounds and its three writing systems.',[
 'Japanese uses hiragana for grammatical endings and many native words, katakana for many loanwords, and kanji for meaning-bearing characters. You will meet them gradually.',
 'Start with five steady vowels: あ a (as in father), い i (machine), う u (with relaxed, less rounded lips), え e (met), お o (a pure o sound). English comparisons are only approximations.',
 'A kana usually represents a mora: a rhythmic sound unit. Long vowels and a small っ add timing; they can change meaning. Practise for a few focused minutes and review on another day.',
 'Our 30-day plan builds kana recognition and simple reading. Advanced proficiency takes sustained study. Reading, comprehension, handwriting, listening, and speaking develop separately.'
],[{jp:'あ・い・う・え・お',reading:'a · i · u · e · o',en:'The five vowels'},{jp:'あ / ア',reading:'a / a',en:'Hiragana / katakana for the same sound'}],[ex('start-1','Which script is commonly used for loanwords?',['Katakana'],undefined,'Katakana is commonly used for loanwords.','choice',['Katakana','Hiragana only','Latin alphabet only'],'comprehension'),ex('start-2','Which vowel does い represent?',['i'],'い','い is i, as in machine.','choice',['a','i','u'])])];
for(const script of ['h','k']){
 baseRows.forEach(([row,chars,readings],idx)=>{
 const letters=[...chars].map(c=>script==='k'?String.fromCharCode(c.charCodeAt(0)+0x60):c);const sounds=readings.split(' ');const id=`${script}-${row}`;
 lessons.push(make(id,script==='h'?1:2,`${script==='h'?'Hiragana':'Katakana'} · ${sounds[0]}${sounds.length>1?' to '+sounds.at(-1):''}`,`Learn ${letters.join('　')} in one small group.`,[
 `Learn these ${letters.length} characters: ${letters.map((c,i)=>`${c} = ${sounds[i]}`).join('; ')}. Say each sound, look away, and recall it before moving on.`,
 row==='r'?'The Japanese r is a brief tongue tap. It is neither a sustained English r nor a full English l.':row==='w'?'を is usually pronounced o as the object particle. ん is its own mora; its sound changes slightly before other sounds.':row==='s'?'し is commonly written shi (si is also accepted). Keep it distinct from ち chi.':row==='t'?'ち is chi and つ is tsu. The small っ later marks a pause before the next consonant.':row==='h'?'ふ is commonly written fu (hu is also accepted). It is made with both lips, not teeth against the lip.':'Notice the shape as well as the sound. Recognition is only one part of learning; revisit these on another day.',
 'Use the audio button if your device has a Japanese speech voice. It is synthetic audio, not a native-speaker recording.'
 ],letters.map((c,i)=>({jp:c,reading:sounds[i],en:`Sound: ${sounds[i]}`})),letters.map((c,i)=>ex(`${id}-${i}`,`Type the sound of this ${script==='h'?'hiragana':'katakana'}.`,[sounds[i],...(variants[sounds[i]]||[])],c,`${c} represents ${sounds[i]}.`)),[idx?`${script}-${baseRows[idx-1][0]}`:script==='h'?'start':'h-w'],letters));
 });
}
lessons.push(
make('marks',1,'Two tiny marks, a different sound','Read dakuten and handakuten.',[
 'Dakuten ゛changes k → g, s → z, t → d, and h → b. Compare か ka and が ga. ぎ is gi, while か has no mark.',
 'Handakuten ゜changes h-row kana to p sounds: は ha → ぱ pa. The circle is different from the two strokes in ば ba.',
 'ほし hoshi means star. はし hashi can mean bridge, chopsticks, or edge depending on pitch and context. This lesson grades the segmental reading; it does not assess pitch accent.',
 'New marked kana in this lesson: が ga, ぎ gi, ば ba, ぱ pa. More combinations appear in the reference chart.'
],[{jp:'かぎ',reading:'kagi',en:'key: か ka + ぎ gi'},{jp:'ぱ',reading:'pa',en:'The circle marks p'},{jp:'ほし',reading:'hoshi',en:'star: ほ ho + し shi'}],[ex('marks-kagi','Read the word.',['kagi'],'かぎ','Only ぎ has dakuten: か ka + ぎ gi = kagi.','typed',undefined,'reading','か ka · ぎ gi'),ex('marks-pa','Read this character.',['pa'],'ぱ','The circle is handakuten: ぱ pa. Two strokes make ば ba.','typed',undefined,'reading','は ha → ぱ pa'),ex('marks-hoshi','Read the word.',['hoshi','hosi'],'ほし','ほ ho + し shi. は ha is a different character.','typed',undefined,'reading','ほ ho · し shi')],['h-w']),
make('small',1,'Small kana, big differences','Read combinations, pauses, and long vowels.',[
 'Small ゃ ya, ゅ yu, and ょ yo join an i-row character into one mora: きゃ kya, きゅ kyu, きょ kyo. Full-sized きや is ki + ya, two morae.',
 'きゃく kyaku means guest: きゃ kya + く ku. きゅく kyuku would have a different middle sound.',
 'Small っ holds the next consonant: きって kitte (stamp) has ki + pause + te. Do not drop the doubled t.',
 'A long vowel lasts two morae. おばさん obasan (aunt) and おばあさん obaasan (grandmother) differ. Write doubled vowels, or supported macrons such as ā. おう is accepted as ou, not silently collapsed to o.'
],[{jp:'きゃく',reading:'kyaku',en:'guest'},{jp:'きって',reading:'kitte',en:'postage stamp'},{jp:'おばあさん',reading:'obaasan',en:'grandmother'}],[ex('small-kya','Read the word.',['kyaku'],'きゃく','Small ゃ is ya, not yu. きゃ kya + く ku = kyaku.','typed',undefined,'reading','きゃ kya · く ku'),ex('small-stop','Read the word, preserving the pause.',['kitte'],'きって','Small っ doubles the next consonant: kitte.'),ex('small-long','Read the word, preserving the long vowel.',['obaasan'],'おばあさん','The two あ sounds make aa; obasan is a different word.')],['marks']),
make('particles',1,'When a character changes its reading','Read は, へ, and を as particles.',[
 'As a topic particle, は is pronounced wa: わたしは = watashi wa (as for me). Elsewhere は is normally ha.',
 'As a direction particle, へ is pronounced e: えきへ = eki e (toward the station). Elsewhere へ is he.',
 'The object particle を is pronounced o. We accept wo when romanizing the written character. These readings depend on grammatical role.'
],[{jp:'わたしは',reading:'watashi wa',en:'as for me'},{jp:'えきへ',reading:'eki e',en:'toward the station'},{jp:'みずを',reading:'mizu o',en:'water (as an object); みず = water'}],[ex('particle-ha','Fill the topic-particle reading: watashi __',['wa'],undefined,'は is pronounced wa when it marks the topic.','fill'),ex('particle-he','How is へ pronounced as a direction particle?',['e'],undefined,'The direction particle へ is pronounced e.','choice',['he','e','ha'])],['small']),
make('kata-marks',2,'Loanwords and longer sounds','Use katakana marks and common combinations.',[
 'Katakana has the same dakuten and handakuten pattern: カ ka → ガ ga; ハ ha → バ ba / パ pa. New marked characters: ガ ga, バ ba, パ pa.',
 'The long-vowel mark ー repeats the preceding vowel: コーヒー kōhī = koohii (coffee). In this app, type koohii or kōhī.',
 'Small ャ, ュ, ョ work like hiragana: キャ kya, キュ kyu, キョ kyo. シャツ shatsu means shirt. The loanword ティー tī (tea) uses テ + small ィ for ti.'
],[{jp:'コーヒー',reading:'koohii',en:'coffee'},{jp:'パン',reading:'pan',en:'bread'},{jp:'シャツ',reading:'shatsu',en:'shirt'}],[ex('kata-coffee','Read the loanword.',['koohii'],'コーヒー','Both ー marks lengthen a vowel: ko-o-hi-i.'),ex('kata-bread','Read the loanword.',['pan'],'パン','パ pa + ン n = pan.')],['k-w']),
make('identity',3,'A sentence about you','Use A は B です and a polite question.',[
 'A は B です is a polite sentence meaning “A is B”. わたし = I; がくせい = student; です = polite copula. The topic は is read wa.',
 'わたしはがくせいです means “I am a student.” To ask a polite question, add か: がくせいですか = “Are you a student?”',
 'です is not a general-purpose word for every English “is”. Later lessons introduce verbs, adjectives, and other patterns.'
],[{jp:'わたしはがくせいです。',reading:'watashi wa gakusei desu',en:'I am a student.'},{jp:'がくせいですか。',reading:'gakusei desu ka',en:'Are you a student?'}],[ex('identity-order','Arrange the tokens: I am a student.',['わたし は がくせい です'],undefined,'Topic + は + identity + です.','order',['です','がくせい','わたし','は'],'comprehension'),ex('identity-question','Which particle makes this a polite question?',['か'],undefined,'Add か at the end of this polite sentence.','choice',['か','を','の'],'comprehension')],['particles']),
make('objects',3,'Tea, please','Use を, ください, and a simple verb.',[
 'おちゃ = tea; みず = water. Noun + を + ください is a polite request for an item: おちゃをください (Tea, please).',
 'のみます means drink (polite nonpast). わたしはみずをのみます means “I drink water / I will drink water.” Context supplies present versus future.',
 'Japanese commonly leaves out known subjects. を marks the object. Keep the order object + を + verb.'
],[{jp:'おちゃをください。',reading:'ocha o kudasai',en:'Tea, please.'},{jp:'みずをのみます。',reading:'mizu o nomimasu',en:'I drink / will drink water.'}],[ex('object-fill','Fill the object particle: みず __ のみます',['を'],undefined,'を marks what is drunk.','fill',undefined,'writing'),ex('object-match','Match in order: おちゃ / みず',['tea / water'],undefined,'おちゃ means tea; みず means water. Type tea / water.','matching',undefined,'comprehension')],['identity']),
make('kanji',3,'One, two, three','Meet 三 introductory kanji and their readings.',[
 '一 = one, 二 = two, 三 = three. In counting, say いち ichi, に ni, さん san. Readings change in compounds, so learn each word with context.',
 'For these characters, write horizontal strokes from left to right. 一 has one stroke; 二 has a short top line then a longer bottom line; 三 has top, middle, then bottom.',
 'The writing studio demonstrates these three and three simple katakana. Other characters have a freehand canvas only; no automatic handwriting score is provided.'
],[{jp:'一',reading:'ichi',en:'one'},{jp:'二',reading:'ni',en:'two'},{jp:'三',reading:'san',en:'three'}],[ex('kanji-1','What number is 二?',['two','2'],'二','二 means two.','typed',undefined,'comprehension'),ex('kanji-2','Type the counting reading.',['san'],'三','三 is read san in counting.')],['identity']),
make('past',3,'Yesterday, today','Contrast polite nonpast and past verbs.',[
 'きのう = yesterday; きょう = today. いきます = go / will go; いきました = went. えき = station; へ marks direction.',
 'きのう、えきへいきました means “Yesterday, I went to the station.” The ending ました marks polite past.',
 'A negative polite form is いきません (do not / will not go). The past negative is いきませんでした (did not go).'
],[{jp:'きのう、えきへいきました。',reading:'kinou, eki e ikimashita',en:'Yesterday, I went to the station.'}],[ex('past-fill','Choose the polite past of いきます.',['いきました'],undefined,'ます becomes ました in this polite past form.','choice',['いきました','いきません','いきます'],'comprehension')],['objects']),
make('reasons',4,'Because it is raining','Connect a reason and a result with ので.',[
 'あめ = rain; ふっています = is falling; うち = home; います = am / stay (for animate beings). ので links a reason to a result.',
 'あめがふっているので、うちにいます means “Because it is raining, I am staying home.” Before ので, ふっています becomes the plain form ふっている.',
 'ので often presents a reason gently or as a circumstance. から also gives reasons, often more directly; context and relationship affect register. This is a sample of connected grammar, not a complete N3 course.'
],[{jp:'あめがふっているので、うちにいます。',reading:'ame ga futte iru node, uchi ni imasu',en:'Because it is raining, I am staying home.'}],[ex('reason-1','What reason does the speaker give for staying home?',['It is raining'],undefined,'あめがふっている describes falling rain.','choice',['It is raining','It is late','It is hot'],'comprehension'),ex('reason-fill','Fill the gentle reason connector: あめがふっている __、うちにいます。',['ので'],undefined,'ので connects the reason to the result.','fill',undefined,'writing')],['past']),
make('experience',4,'Things you have tried','Use the た-form + ことがある for experience.',[
 'すし = sushi; たべる = eat; たべた = ate (plain past). Verb た-form + ことがあります describes having experienced doing something.',
 'すしをたべたことがあります means “I have eaten sushi.” It describes life experience without specifying an occasion.',
 'Compare きのうすしをたべました (I ate sushi yesterday), an event at a stated time. For your journal, write one experience. Automated essay or grammar assessment is not available.'
],[{jp:'すしをたべたことがあります。',reading:'sushi o tabeta koto ga arimasu',en:'I have eaten sushi.'}],[ex('experience-1','What does the sentence emphasize?',['Life experience'],undefined,'た-form + ことがある expresses experience.','choice',['Life experience','An order','An exact date'],'comprehension')],['reasons']),
make('register',5,'Choosing a respectful voice','Distinguish plain, polite, and humble expressions.',[
 '行く（いく iku）= go (plain); 行きます（いきます ikimasu）= go (polite). 伺う（うかがう ukagau）can be a humble “visit / go to someone” in an appropriate relationship.',
 '明日、先生の研究室に伺います。（あした、せんせいのけんきゅうしつにうかがいます。）means “I will visit my teacher’s office tomorrow.” 明日 = tomorrow; 先生 = teacher; 研究室 = research office.',
 'Humble language lowers the speaker’s in-group action relative to the person respected. Do not use a humble verb to elevate someone else’s action. Keigo depends on context, roles, and the verb; it is not a word-for-word substitution system.'
],[{jp:'明日、先生の研究室に伺います。',furigana:[{text:'明日',reading:'あした'},{text:'、'},{text:'先生',reading:'せんせい'},{text:'の'},{text:'研究室',reading:'けんきゅうしつ'},{text:'に'},{text:'伺',reading:'うかが'},{text:'います。'}],reading:'ashita, sensei no kenkyuushitsu ni ukagaimasu',en:'I will visit my teacher’s office tomorrow.'}],[ex('register-1','The speaker humbly describes whose visit?',['Their own'],undefined,'伺います humbly describes the speaker’s action.','choice',['Their own','The teacher’s','Any stranger’s'],'comprehension')],['experience']),
make('argument',5,'An argument with a qualification','Read とは限らない without overgeneralizing.',[
 '必ずしも（かならずしも）= not necessarily (with a negative); 高い（たかい）= expensive; 商品（しょうひん）= product; 良い（よい）= good.',
 '高い商品が必ずしも良いとは限らない。means “Expensive products are not necessarily good.” とは限らない denies that a proposition is always true.',
 'It does not mean expensive products are always bad. In an essay, state a claim, give evidence, acknowledge a qualification, then conclude. Written work is saved for self-review, without an automatic quality score.'
],[{jp:'高い商品が必ずしも良いとは限らない。',furigana:[{text:'高',reading:'たか'},{text:'い'},{text:'商品',reading:'しょうひん'},{text:'が'},{text:'必',reading:'かなら'},{text:'ずしも'},{text:'良',reading:'よ'},{text:'いとは'},{text:'限',reading:'かぎ'},{text:'らない。'}],reading:'takai shouhin ga kanarazushimo yoi to wa kagiranai',en:'Expensive products are not necessarily good.'}],[ex('argument-1','Which interpretation preserves the qualification?',['Some expensive products may not be good'],undefined,'The sentence rejects an absolute rule; it does not assert the opposite absolute.','choice',['Some expensive products may not be good','Every expensive product is bad','Price always determines quality'],'comprehension')],['register'])
);
const smallLesson=lessons.find(l=>l.id==='small')!;
const timingExercise=smallLesson.exercises.find(q=>q.id==='small-stop')!;
const longExercise=smallLesson.exercises.find(q=>q.id==='small-long')!;
const timingLesson=make('timing',1,'One small pause','Read small っ without losing a mora.',[smallLesson.explanation[2],'Read きって as ki + pause + te. The pause occupies one mora. Compare きて kite (come, in the te-form) with きって kitte (stamp); timing distinguishes them.'],[smallLesson.examples[1]],[timingExercise],['small']);
const longLesson=make('long-vowels',1,'Give a vowel a little time','Preserve long vowels when reading.',[smallLesson.explanation[3],'For this lesson, ああ is aa / ā. Do not treat all vowel spellings as interchangeable: おう is ou in our spelling-focused exercises. Listen and learn each word with its spelling.'],[smallLesson.examples[2]],[longExercise],['timing']);
smallLesson.title='Small kana, joined sounds';smallLesson.subtitle='Read ゃ, ゅ, and ょ combinations.';smallLesson.explanation=smallLesson.explanation.slice(0,2);smallLesson.examples=smallLesson.examples.slice(0,1);smallLesson.exercises=smallLesson.exercises.slice(0,1);
lessons.splice(lessons.indexOf(smallLesson)+1,0,timingLesson,longLesson);
lessons.find(l=>l.id==='particles')!.prerequisites=['long-vowels'];
const katakanaMarks=lessons.find(l=>l.id==='kata-marks')!;
const coffee=katakanaMarks.exercises[0];const bread=katakanaMarks.exercises[1];
const katakanaLong=make('kata-long',2,'A line that lengthens a vowel','Read the katakana long-vowel mark.',[katakanaMarks.explanation[1],'The mark ー repeats the vowel before it. In コー, lengthen o; in ヒー, lengthen i. Read the whole word with four morae: ko-o-hi-i.'],[katakanaMarks.examples[0]],[coffee],['kata-marks']);
const katakanaCombinations=make('kata-combinations',2,'Katakana sounds that combine','Recognize common small-kana combinations.',[katakanaMarks.explanation[2],'In シャツ, シャ is sha and ツ is tsu. Small ャ combines with シ; it is not a separate full-sized ヤ. In ティー, ティ is ti and ー lengthens i.'],[katakanaMarks.examples[2],{jp:'ティー',reading:'tii',en:'tea'}],[ex('kata-shirt','Read the word.',['shatsu','syatu'],'シャツ','シャ sha + ツ tsu = shatsu.'),ex('kata-tea','Read the word.',['tii'],'ティー','ティ ti + the long-vowel mark = tii.')],['kata-long']);
katakanaMarks.title='Voicing in katakana';katakanaMarks.subtitle='Distinguish ガ, バ, and パ.';katakanaMarks.explanation=katakanaMarks.explanation.slice(0,1);katakanaMarks.examples=[katakanaMarks.examples[1]];katakanaMarks.exercises=[bread];
lessons.splice(lessons.indexOf(katakanaMarks)+1,0,katakanaLong,katakanaCombinations);
lessons.splice(1,0,make('greetings',0,'A greeting for the moment','Choose a polite everyday greeting.',[
 'こんにちは konnichiwa means hello / good afternoon. The final は is written ha but read wa in this fixed greeting. You can learn the phrase by meaning before you can decode every character.',
 'おはようございます ohayou gozaimasu is a polite good morning. ありがとうございます arigatou gozaimasu means thank you (polite). Learn these phrases with their context; do not translate each ending literally.',
 'Read or listen to the examples, then choose the phrase for the situation. Kana decoding is taught separately.'
 ],[{jp:'こんにちは',reading:'konnichiwa',en:'Hello / good afternoon'},{jp:'おはようございます',reading:'ohayou gozaimasu',en:'Good morning (polite)'},{jp:'ありがとうございます',reading:'arigatou gozaimasu',en:'Thank you (polite)'}],[ex('greeting-morning','Which phrase fits a polite morning greeting?',['おはようございます'],undefined,'おはようございます is a polite morning greeting.','choice',['こんにちは','おはようございます','ありがとうございます'],'comprehension')],['start']));
lessons.push(make('listen-vowels',1,'Hear the five vowels','Identify a synthetic spoken vowel without seeing its kana.',[
 'Review あ a, い i, う u, え e, お o before listening. Play each sound, then type its romanized reading.',
 'This activity needs a Japanese device speech voice. Synthetic audio is labelled; if no Japanese voice is available, use text practice instead. A transcript appears with feedback after the attempt.'
 ],[{jp:'あ い う え お',reading:'a i u e o',en:'The five steady vowels'}],kana.filter(k=>k.row==='a').map((k,i)=>({...ex(`listen-${i}`,'Listen, then type the vowel sound.',[k.romaji],undefined,`${k.char} is ${k.romaji}.`,'listening',undefined,'listening'),audio:k.char})),['h-a']));
for(const lesson of lessons){lesson.version=3;lesson.guided=buildGuided(lesson,kana);}
for(const lesson of lessons){lesson.corrections=lesson.exercises.filter(q=>q.display&&lesson.characters).map(q=>{const other=lesson.characters!.find(c=>c!==q.display)!;return {id:`correct-${q.id}`,corrects:q.id,concept:q.concept,skill:q.skill,type:'fill' as const,prompt:'In this practice sequence, type the final sound.',display:other+q.display,answer:q.answer,explanation:`The final character is ${q.display}, read ${q.answer[0]}. Read both characters in order.`,hints:['Read the sequence from left to right. Focus on its last character.']};});}
const marksLesson=lessons.find(l=>l.id==='marks')!;
marksLesson.corrections=[{id:'correct-marks-hoshi',corrects:'marks-hoshi',concept:'ほ',skill:'reading',type:'choice',prompt:'Which new word has two ho sounds?',teaching:['New examples: ほほ hoho means cheek. はは haha refers to one’s own mother. Notice the first sound in ほし hoshi (star).'],options:['ほほ','はは','ほし','はし'],answer:['ほほ'],explanation:'ほ ho + ほ ho = hoho. は is ha. This is a new contrast, not a resubmission of ほし.'},{id:'correct-marks-kagi',corrects:'marks-kagi',concept:'か',skill:'reading',type:'choice',prompt:'In the new word かご, which character is voiced?',teaching:['かご kago means basket: か ka + ご go. Dakuten is present on ご, not on か.'],options:['ご','か','こ','が'],answer:['ご'],explanation:'ご has dakuten. か has no dakuten and stays ka.'},{id:'correct-marks-pa',corrects:'marks-pa',concept:'ぱ',skill:'reading',type:'choice',prompt:'Select the p-sound character in this new pair.',teaching:['New contrast: ぴ pi uses a circle, while び bi uses two small strokes. The same mark distinction separates ぱ pa from ば ba.'],options:['ぴ','び','ひ','ふ'],answer:['ぴ'],explanation:'The circle in ぴ is handakuten and makes the p sound.'}];
lessons.find(l=>l.id==='small')!.corrections=[{id:'correct-small-kya',corrects:'small-kya',concept:'きゃ',skill:'reading',type:'choice',prompt:'Choose kyo in this fresh contrast.',teaching:['Compare the taught combinations: きゃ kya, きゅ kyu, きょ kyo. Small ょ contributes yo, not yu.'],options:['きょ','きゅ','きゃ','きよ'],answer:['きょ'],explanation:'Small ょ joins き to make kyo; full-sized よ would create a separate mora.'}];
const fourthChoices:Record<string,string[]>={
 'start-1':['Kanji'],'start-2':['e'],'particle-he':['wa'],'greeting-morning':['さようなら'],'identity-question':['は'],'past-fill':['いきませんでした'],'reason-1':['A train delay'],'experience-1':['A future appointment'],'register-1':['The listener’s'],'argument-1':['All inexpensive products are bad'],
 'guide-start-0':['山'],'guide-start-1':['え'],'guide-greetings-0':['さようなら'],'guide-greetings-1':['さようなら'],'guide-small-0':['や'],'guide-small-1':['きや'],'guide-timing-0':['きつて','きいて'],'guide-long-vowels-0':['おじさん','おじいさん'],'guide-kata-marks-0':['a long dash','no mark'],'guide-kata-marks-1':['ホ'],'guide-kata-combinations-0':['シヤ'],'guide-objects-1':['を','です'],'guide-past-1':['おちゃ','みず'],'guide-reasons-0':['ので','うち'],'guide-experience-1':['noun','particle']
};
lessons.find(l=>l.id==='start')!.explanation.push('One kanji example is 山, which means mountain. You are identifying its script here, not memorizing its readings.');
lessons.find(l=>l.id==='greetings')!.explanation.push('One further greeting to distinguish: さようなら sayounara means goodbye. It is not a morning hello or a thank-you.');
lessons.find(l=>l.id==='greetings')!.examples.push({jp:'さようなら',reading:'sayounara',en:'Goodbye'});
for(const l of lessons)for(const q of [...l.exercises,...l.guided||[]])if(q.type==='choice'&&q.options&&q.options.length<4)q.options=[...q.options,...fourthChoices[q.id]||[]].slice(0,4);
const matchQuestion=lessons.find(l=>l.id==='objects')!.exercises.find(q=>q.type==='matching')!;matchQuestion.matches=[{label:'おちゃ',options:['tea','water']},{label:'みず',options:['tea','water']}];
export const findLesson=(id:string)=>lessons.find(l=>l.id===id);
export function publicExercise({answer:_answer,explanation:_explanation,units:_units,...q}:Exercise){return q;}
export function publicLesson(l:Lesson){return {...l,exercises:l.exercises.map(publicExercise),guided:(l.guided||[]).map(publicExercise),corrections:(l.corrections||[]).map(publicExercise)};}
export const readingStories=[
 {id:'vowels',title:'Five sounds, two little words',level:'Kana · first steps',minutes:2,prerequisites:['h-a'],intro:'Learn these words before the passage: あい = love; いえ = house. Both use only the vowel kana.',segments:[{jp:'あい',reading:'ai',en:'love',note:'あ a + い i. Two different vowels.'},{jp:'いえ',reading:'ie',en:'house',note:'い i + え e. Read both vowel sounds.'}],text:'あい。いえ。',translation:'Love. A house.',question:'Which word means house?',choices:['いえ','あい'],answer:'いえ'},
 {id:'tea',title:'A quiet cup of tea',level:'Beginner · original micro-story',minutes:3,prerequisites:['objects'],intro:'New words: あさ = morning; あたたかい = warm; です = is (polite). Review おちゃ = tea and のみます = drink.',segments:[{jp:'あさ',reading:'asa',en:'morning',note:'あ a + さ sa.'},{jp:'おちゃ',reading:'ocha',en:'tea',note:'Small ゃ combines with ち: ちゃ cha.'},{jp:'を',reading:'o',en:'object particle',note:'Marks what is drunk.'},{jp:'のみます',reading:'nomimasu',en:'drink',note:'Polite nonpast verb.'},{jp:'あたたかい',reading:'atatakai',en:'warm',note:'An i-adjective.'}],text:'あさ、おちゃをのみます。おちゃはあたたかいです。',translation:'In the morning, I drink tea. The tea is warm.',question:'What is the tea like?',choices:['Warm','Cold','Bitter'],answer:'Warm'},
 {id:'rain',title:'A change of plans',level:'Intermediate · original passage',minutes:4,prerequisites:['reasons'],intro:'New vocabulary: さんぽ = walk; よてい = plan; ほん = book; よむ = read; ことにしました = decided to.',segments:[{jp:'ので',reading:'node',en:'because',note:'A reason connector.'},{jp:'ことにしました',reading:'koto ni shimashita',en:'decided to',note:'Dictionary-form verb + ことにする expresses a decision.'},{jp:'ほん',reading:'hon',en:'book',note:'Also written 本.'}],text:'きょうはさんぽのよていでした。でも、あめがふっているので、うちでほんをよむことにしました。',translation:'I planned to take a walk today. But because it is raining, I decided to read a book at home.',question:'Why did the speaker change plans?',choices:['Rain','Work','A lost book'],answer:'Rain'}
];
export const plan=Array.from({length:30},(_,i)=>({day:i+1,task:i===0?'Meet Japanese sounds and scripts':i<=10?`Hiragana: ${baseRows[i-1][2]} + yesterday’s review`:i===11?'Dakuten and handakuten':i===12?'Small kana, long vowels, and pauses':i===13?'Particle readings + mixed recall':i<=23?`Katakana: ${baseRows[i-14][2]} + due reviews`:i===24?'Loanwords and the long-vowel mark':i===25?'Read the two-word vowel passage':i===26?'Make a sentence about yourself':i===27?'Read the tea story with vocabulary help':i===28?'Listen, write, and revisit missed kana':'Mixed kana recall + plan your next month'}));
export const strokeModels:Record<string,string[]>=importedStrokes;
