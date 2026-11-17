import {readFileSync,writeFileSync} from 'node:fs';
import ts from 'typescript';
const lessons=JSON.parse(readFileSync('lib/library-cv10-lessons.json','utf8'));
const source=readFileSync('lib/cv10-document.ts','utf8').replace("import lessons from './library-cv10-lessons.json';",'const lessons='+JSON.stringify(lessons)+';');
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {cv10Document,cv10PlainText}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
if(!process.argv[2])throw Error('Provide a private output path. Do not commit generated account payloads.');
writeFileSync(process.argv[2],JSON.stringify(lessons.map(l=>({topic_id:l.topicId,title:l.title,slug:l.slug,content_json:cv10Document(l),plain_text:cv10PlainText(l)}))));
console.log('Prepared ten derived BlockNote snapshots. No database writes performed.');
