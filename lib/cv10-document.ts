import type {PartialBlock} from '@blocknote/core';
import lessons from './library-cv10-lessons.json';
/** Single source: lesson JSON. BlockNote documents are generated snapshots; never auto-overwrite edits. */
export const cv10Lessons = lessons;
export type Cv10Lesson = typeof lessons[number];
export function lessonMarker(l:Cv10Lesson,suffix:string){return `cv10-${l.kind}-${suffix}`;}
export function cv10Document(l:Cv10Lesson) {
 const result:{id:string;type:string;props?:Record<string,unknown>;content:{type:string;text:string;styles:Record<string,never>}[]}[]=[];
 let n=0;
 const block=(type:string,text:string,id?:string,props?:Record<string,unknown>)=>{result.push({id:id??lessonMarker(l,String(n++)),type,...(props?{props}:{}),content:[{type:'text',text,styles:{}}]});};
 const heading=(text:string)=>block('heading',text,undefined,{level:2});
 heading('UNDERSTAND');l.understand.forEach(t=>block('paragraph',t));
 block('paragraph','Visual exploration: foreground and background, input and result are labelled separately.',lessonMarker(l,'visual'));
 heading('MECHANISM');l.mechanism.forEach(t=>block('paragraph',t));
 block('paragraph','Try the interactive mechanism below. The written steps remain readable if the demonstration is unavailable.',lessonMarker(l,'demo'));
 heading('WORKED EXAMPLE');l.worked.forEach(t=>block('paragraph',t));block('codeBlock',l.code,undefined,{language:'python'});
 block('paragraph','Verified output:');block('codeBlock',l.output,undefined,{language:'text'});l.lines.forEach(t=>block('paragraph',t));
 heading('COMMON MISTAKES');l.mistakes.forEach(t=>block('bulletListItem',t));
 heading('INTERVIEW CHECK');block('paragraph',l.question);block('paragraph',l.task);
 block('paragraph','Independent coding task and completion criteria: '+l.rubric);
 block('paragraph','Attempt your explanation and calculation before revealing the solution. This practice never marks your topic complete.',lessonMarker(l,'check'));
 return result as PartialBlock[];
}
export function cv10PlainText(l:Cv10Lesson){return cv10Document(l).map(b=>Array.isArray(b.content)?b.content.map(c=>typeof c==='string'?c:c&&typeof c==='object'&&'text' in c?String(c.text):'').join(''):'').join('\n\n');}
