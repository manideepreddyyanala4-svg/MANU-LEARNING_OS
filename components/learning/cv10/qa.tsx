'use client';
import {useState} from 'react';
import {cv10Lessons} from '@/lib/cv10-document';
export function Cv10Qa(){
 const [kind,setKind]=useState('binary'),[width,setWidth]=useState(375);
 return <div className="p-4 text-[var(--fg)]"><h1 className="text-2xl font-bold">Lesson preview review</h1><p className="my-3">The frame below loads the real lesson renderer at the selected viewport width. No account data is read or written.</p><div className="my-4 flex flex-wrap gap-4"><label>Lesson <select aria-label="Review lesson" value={kind} onChange={e=>setKind(e.target.value)} className="min-h-11 max-w-full bg-[var(--surface)]">{cv10Lessons.map(l=><option value={l.kind} key={l.kind}>{l.title}</option>)}</select></label><label>Viewport <select aria-label="Review viewport" value={width} onChange={e=>setWidth(Number(e.target.value))} className="min-h-11 bg-[var(--surface)]">{[320,375,430,768,1440].map(w=><option key={w} value={w}>{w}px</option>)}</select></label></div><div className="overflow-auto rounded-xl border border-[var(--line-strong)]"><iframe title="Interactive lesson review" src={`/learning-preview/cv10/${kind}`} style={{width,height:'85vh',maxWidth:'none',display:'block',border:0}}/></div></div>;
}
