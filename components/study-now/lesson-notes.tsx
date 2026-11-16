'use client';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BookOpen, FileUp } from 'lucide-react';
import { createClient } from '@/lib/supabase';

type Lesson = { topic_key: string; content: string };
const MAX_CHARS = 40000;
const MAX_BYTES = 12 * 1024 * 1024;

export function LessonNotes({topicKey,topicTitle,validKeys}:{
  topicKey:string; topicTitle:string; validKeys:string[];
}) {
  const [text,setText] = useState('');
  const [draft,setDraft] = useState('');
  const [loaded,setLoaded] = useState(false);
  const [editing,setEditing] = useState(false);
  const [working,setWorking] = useState(false);
  const [error,setError] = useState('');
  const [message,setMessage] = useState('');
  const [importOpen,setImportOpen] = useState(false);
  const [pack,setPack] = useState<Lesson[] | null>(null);
  const [overwrite,setOverwrite] = useState(false);
  async function auth() {
    const client=createClient();
    if(!client)throw new Error('Cloud storage is not configured.');
    const {data:{user},error:authError}=await client.auth.getUser();
    if(authError||!user)throw new Error('Sign in to use your study notes.');
    return {client,user};
  }
  async function read(key:string) {
    const {client}=await auth();
    const {data,error:dbError}=await client.from('curriculum_lessons')
      .select('content').eq('topic_key',key).maybeSingle();
    if(dbError)throw dbError;
    return (data?.content ?? '') as string;
  }
  useEffect(()=>{
    let alive=true;
    const timer=window.setTimeout(()=>{
      setLoaded(false);setEditing(false);setError('');setMessage('');
      void read(topicKey).then(value=>{
        if(!alive)return;
        setText(value);setDraft(value);
      }).catch(e=>{
        if(alive)setError(e instanceof Error?e.message:'Could not load notes.');
      }).finally(()=>{if(alive)setLoaded(true);});
    },0);
    return ()=>{alive=false;window.clearTimeout(timer);};
  },[topicKey]);
  async function save() {
    if(draft.length>MAX_CHARS){setError('Maximum 40,000 characters.');return;}
    setWorking(true);setError('');setMessage('');
    try {
      const {client,user}=await auth();
      const {error:dbError}=await client.from('curriculum_lessons')
        .upsert({user_id:user.id,topic_key:topicKey,content:draft},{onConflict:'user_id,topic_key'});
      if(dbError)throw dbError;
      setText(draft);setEditing(false);setMessage('Notes saved.');
    }catch(e){setError(e instanceof Error?e.message:'Could not save.');}
    finally{setWorking(false);}
  }
  async function choose(file?:File) {
    setPack(null);setError('');setMessage('');
    if(!file)return;
    if(!file.name.toLowerCase().endsWith('.json')||file.size>MAX_BYTES){
      setError('Use a .json file smaller than 12 MB.');return;
    }
    try {
      const data:unknown=JSON.parse(await file.text());
      const items:unknown=Array.isArray(data)?data:(data&&typeof data==='object'?(data as {lessons?:unknown}).lessons:null);
      if(!Array.isArray(items)||!items.length||items.length>validKeys.length)
        throw new Error('Expected a nonempty lessons array within the curriculum topic count.');
      const keys=new Set(validKeys),seen=new Set<string>(),out:Lesson[]=[];
      for(const [index,item] of items.entries()){
        if(!item||typeof item!=='object'||typeof (item as Lesson).topic_key!=='string'||typeof (item as Lesson).content!=='string')
          throw new Error('Invalid entry at row '+(index+1)+'.');
        const {topic_key,content} = item as Lesson;
        if(!keys.has(topic_key))throw new Error('Unknown topic key: '+topic_key);
        if(seen.has(topic_key))throw new Error('Repeated topic key: '+topic_key);
        if(!content.trim()||content.length>MAX_CHARS)throw new Error('Empty or oversized lesson: '+topic_key);
        seen.add(topic_key);out.push({topic_key,content});
      }
      setPack(out);
    }catch(e){setError(e instanceof Error?e.message:'Invalid JSON pack.');}
  }
  async function importPack(){
    if(!pack||working)return;
    setWorking(true);setError('');setMessage('');
    let processed=0;
    try{
      const {client,user}=await auth();
      for(let i=0;i<pack.length;i+=40){
        const batch=pack.slice(i,i+40).map(item=>({...item,user_id:user.id}));
        const {error:dbError}=await client.from('curriculum_lessons')
          .upsert(batch,{onConflict:'user_id,topic_key',ignoreDuplicates:!overwrite});
        if(dbError)throw dbError;
        processed+=batch.length;
      }
      const current=await read(topicKey);
      setText(current);setDraft(current);setEditing(false);
      setPack(null);setImportOpen(false);
      setMessage('Import finished: '+processed+' topics processed. '+
        (overwrite?'Matching existing notes were replaced.':'Existing notes were preserved.'));
    }catch(e){
      setError('Import stopped after '+processed+' entries were processed. '+
        (e instanceof Error?e.message:'Unknown error.')+' You can retry safely.');
    }finally{setWorking(false);}
  }
  const sample=JSON.stringify({lessons:[{
    topic_key:'internship-v1-m01-t001',
    content:'# UNDERSTAND\nA Python script is a .py file.\n\n## MECHANISM\nFile → interpreter → output\n\n## WORKED EXAMPLE\n~~~python\nprint("Hello")\n~~~\nOutput: Hello\n\n## COMMON MISTAKES\nConfusing the file with the interpreter.\n\n## INTERVIEW CHECK\nWhat runs Python code?'
  }]},null,2);
  return <section aria-label="Study notes" className="mt-5 rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-4 sm:p-5">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h3 className="flex items-center gap-2 text-lg font-black text-[var(--fg)]"><BookOpen size={20}/> Notes on this topic</h3>
        <p className="mt-1 text-sm text-[var(--muted)]">{topicTitle}</p>
      </div>
      {loaded&&!editing&&<button type="button" onClick={()=>{setDraft(text);setEditing(true);}}
        className="min-h-11 rounded-xl border border-[var(--line)] px-4 py-2 text-sm font-bold text-[var(--fg)]">
        {text?'Edit notes':'Add notes'}
      </button>}
    </div>
    {error&&<p role="alert" className="mt-3 text-sm font-semibold text-rose-600">{error}</p>}
    {message&&<p role="status" className="mt-3 text-sm font-semibold text-emerald-600">{message}</p>}
    {!loaded?<p className="mt-4 text-sm text-[var(--muted)]">Loading notes…</p>:editing?
      <div className="mt-4 space-y-3">
        <label htmlFor="study-lesson-text" className="block text-sm font-semibold text-[var(--fg)]">Lesson content (Markdown)</label>
        <textarea id="study-lesson-text" rows={15} value={draft} onChange={e=>setDraft(e.target.value)}
          className="w-full resize-y rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 font-mono text-sm leading-6 text-[var(--fg)] outline-none focus:border-sky-500"
          placeholder="## UNDERSTAND; ## MECHANISM; ## WORKED EXAMPLE; ## COMMON MISTAKES; ## INTERVIEW CHECK"/>
        <p className="text-xs text-[var(--muted)]">{draft.length.toLocaleString()} / 40,000 characters</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={working||draft.length>MAX_CHARS} onClick={()=>void save()}
            className="min-h-11 rounded-xl bg-sky-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-40">Save notes</button>
          <button type="button" disabled={working} onClick={()=>{setDraft(text);setEditing(false);}}
            className="min-h-11 rounded-xl border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--fg)]">Cancel</button>
        </div>
      </div>:text.trim()?
      <article className="mt-5 space-y-3 break-words text-base leading-8 text-[var(--fg)] [&_h1]:mt-6 [&_h1]:text-2xl [&_h1]:font-black [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-extrabold [&_h3]:mt-5 [&_h3]:text-lg [&_h3]:font-bold [&_p]:my-3 [&_li]:ml-5 [&_li]:list-disc [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-slate-900 [&_pre]:p-4 [&_pre]:text-sm [&_pre]:text-white [&_table]:block [&_table]:overflow-x-auto [&_th]:border [&_th]:p-2 [&_td]:border [&_td]:p-2">
        <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml>{text}</ReactMarkdown>
      </article>:
      <p className="mt-4 rounded-xl border border-dashed border-[var(--line)] p-4 text-sm leading-6 text-[var(--muted)]">
        No lesson notes prepared yet. Add notes here or import your prepared course in one batch.
      </p>}
    <div className="mt-6 border-t border-[var(--line)] pt-4">
      <button type="button" onClick={()=>setImportOpen(v=>!v)}
        className="inline-flex min-h-11 items-center gap-2 text-left text-sm font-bold text-sky-600">
        <FileUp size={18}/> {importOpen?'Hide bulk importer':'Prepare once: import lessons in bulk'}
      </button>
      {importOpen&&<div className="mt-3 space-y-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4">
        <p className="text-sm leading-6 text-[var(--fg)]">
          Prepare a JSON file with lesson content and matching topic keys. Upload once; each topic then opens its own saved notes.
          Your original learning notes and completed-topic records stay separate.
        </p>
        <details className="rounded-xl border border-[var(--line)] p-3">
          <summary className="cursor-pointer text-sm font-bold text-[var(--fg)]">Show the required JSON format</summary>
          <pre className="mt-3 max-h-64 overflow-auto rounded-lg bg-slate-900 p-3 text-xs text-white">{sample}</pre>
          <button type="button" onClick={()=>{
            const url=URL.createObjectURL(new Blob([sample],{type:'application/json'}));
            const link=document.createElement('a');link.href=url;link.download='manuos-lesson-example.json';link.click();URL.revokeObjectURL(url);
          }} className="mt-2 min-h-10 rounded-lg border border-[var(--line)] px-3 py-2 text-xs font-semibold text-[var(--fg)]">Download example</button>
        </details>
        <label htmlFor="lesson-pack-input" className="block text-sm font-semibold text-[var(--fg)]">Choose .json lesson pack (max 12 MB)</label>
        <input id="lesson-pack-input" type="file" accept=".json,application/json" onChange={e=>void choose(e.target.files?.[0])}
          className="block w-full text-sm text-[var(--fg)]"/>
        {pack&&<div className="space-y-3 rounded-xl border border-sky-500/30 bg-sky-500/5 p-3">
          <p className="text-sm font-bold text-[var(--fg)]">{pack.length} valid lesson keys checked against existing curriculum.</p>
          <label className="flex items-start gap-2 text-sm leading-6 text-[var(--fg)]">
            <input type="checkbox" checked={overwrite} onChange={e=>setOverwrite(e.target.checked)} className="mt-1 h-4 w-4 shrink-0"/>
            Replace matching existing notes. Leave unchecked to keep all existing notes.
          </label>
          <button type="button" disabled={working} onClick={()=>void importPack()}
            className="min-h-11 rounded-xl bg-sky-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-40">
            {working?'Importing…':'Import prepared lessons'}
          </button>
        </div>}
      </div>}
    </div>
  </section>;
}
