import { writeFileSync } from 'node:fs';
import { CONTENT_VERSION, lessons, kana, stages, readingStories, strokeModels, plan } from '../shared/content.js';
import { kanji } from '../shared/kanji.js';
import { questionBank, vocabulary, kanaEntries } from '../server/practice/bank.js';

const inventory = {
  contentVersion: CONTENT_VERSION,
  lessonVersions: [...new Set(lessons.map(l => l.version))],
  bankVersions: [...new Set(questionBank.map(q => q.version))],
  lessons: lessons.length,
  independentLessonItems: lessons.reduce((n, l) => n + l.exercises.length, 0),
  guidedItems: lessons.reduce((n, l) => n + (l.guided?.length || 0), 0),
  targetedCorrectionItems: lessons.reduce((n, l) => n + (l.corrections?.length || 0), 0),
  mcqBank: questionBank.length,
  mcqByScript: Object.fromEntries(['hiragana', 'katakana', 'kanji'].map(script => [script, questionBank.filter(q => q.script === script).length])),
  kanaEntriesPerScript: kanaEntries.length,
  basicKanaPerScript: kana.length,
  starterKanji: kanji.length,
  vocabularyEntries: vocabulary.length,
  originalReadingPassages: readingStories.length,
  orderedStrokeModels: Object.keys(strokeModels).length,
  beginnerPlanDays: plan.length,
  lessonsByStage: Object.fromEntries(stages.map(stage => [stage.name, lessons.filter(l => l.stage === stage.id).length])),
  scope: 'Starter collection plus intermediate/advanced samples; not complete JLPT coverage. No educator/native-speaker review is claimed.',
};
writeFileSync('docs/curriculum-inventory.json', JSON.stringify(inventory, null, 2) + '\n');
console.log(JSON.stringify(inventory, null, 2));
