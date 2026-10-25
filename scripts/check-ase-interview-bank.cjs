const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const Module = require('node:module');
const base = path.resolve(__dirname, '../components/ase-final-interview');
function load(file) {
  const filename = path.resolve(base, file);
  const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020 }
  }).outputText;
  const m = new Module(filename, module);
  m.filename = filename; m.paths = Module._nodeModulePaths(path.dirname(filename));
  const originalRequire = m.require.bind(m);
  m.require = id => id.startsWith('./') ? load(id + (id.endsWith('.ts') ? '' : '.ts')) : originalRequire(id);
  m._compile(output, filename);
  return m.exports;
}
const categories = [1,2,3,4,5].flatMap(n => load(`data-part${n}.ts`)[`interviewCategoriesPart${n}`]);
const items = categories.flatMap(c => c.items);
const { coreStories } = load('stories.ts');
assert.equal(items.length, 397);
assert.deepEqual(items.map(i => i.number), Array.from({length:397}, (_, i) => i+1));
assert.equal(new Set(categories.map(c => c.id)).size, 15);
assert.deepEqual(categories.map(c => c.title[0]), 'ABCDEFGHIJKLMNO'.split(''));
assert.equal(coreStories.length, 12);
for (const item of items) {
  assert.ok(item.answer.trim() && item.memory.trim() && item.seconds, `Missing content Q${item.number}`);
  assert.ok(['CORE','PREPARE','BACKUP'].includes(item.priority));
  assert.ok(item.answer.split(/\s+/).length <= 110, `Long answer Q${item.number}`);
  assert.ok(item.memory.split(/\s+/).length <= 14, `Long cue Q${item.number}`);
  assert.ok(!item.story || coreStories.some(s => s.id === item.story));
  assert.ok(!item.answer.includes('[') || item.needsFact, `Unmarked template Q${item.number}`);
  assert.ok(!/ASK THIS|I would answer|I should answer|I would use a real|spearheaded|synergize|multifaceted/.test(item.answer), `Coaching or jargon Q${item.number}`);
}
const audit = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../docs/ase-question-audit.json')));
assert.deepEqual(audit.records.map(r=>r.number),items.map(i=>i.number));
assert.equal(audit.records.filter(r=>r.answerChanged).length,146);
assert.equal(items.filter(i=>i.priority==='CORE').length,67);
for(const i of items) {
 const r=audit.records.find(r=>r.number===i.number);
 assert.equal(r.words,i.answer.split(/\s+/).length);
 assert.equal(r.priorityAfter,i.priority);
}
const { renderToStaticMarkup } = require('react-dom/server');
const React = require('react');
const { AseFinalInterviewBank } = load('ase-final-interview-bank.tsx');
const html = renderToStaticMarkup(React.createElement(AseFinalInterviewBank));
assert.equal((html.match(/id="question-\d+"/g)||[]).length,397);
assert.ok(html.includes('Search interview questions'));
assert.ok(html.includes('Memory practice'));
assert.ok(html.includes('Facts to confirm'));
assert.ok(html.includes('L. Very Simple Questions'));
assert.ok(html.includes('397 of 397 questions'));
console.log('PASS: 397 unique ordered questions; categories A–O; 12 stories; 67 CORE; 146 revised answers; all cues, timings, fact flags and rendered question cards present.');
