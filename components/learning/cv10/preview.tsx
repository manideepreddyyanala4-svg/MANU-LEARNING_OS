'use client';
import {useEffect,useState} from 'react';
import {useTheme} from 'next-themes';
import {StudyDocument} from '@/components/document-canvas';
import type {PartialBlock} from '@blocknote/core';
export function Cv10Preview({topicId,blocks}:{topicId:string;blocks:PartialBlock[]}){
 const [focus,setFocus]=useState(false);const {resolvedTheme,setTheme}=useTheme();
 useEffect(()=>{document.documentElement.classList.toggle('focus-mode',focus);const esc=(e:KeyboardEvent)=>{if(e.key==='Escape')setFocus(false);};window.addEventListener('keydown',esc);return()=>{document.documentElement.classList.remove('focus-mode');window.removeEventListener('keydown',esc);};},[focus]);
 return <><div className="mb-6 flex flex-wrap gap-3"><button className="min-h-11 rounded-lg border border-[var(--line-strong)] px-4 text-[var(--fg)]" onClick={()=>setTheme(resolvedTheme==='dark'?'light':'dark')}>Switch theme</button><button className="min-h-11 rounded-lg border border-[var(--line-strong)] px-4 text-[var(--fg)]" onClick={()=>setFocus(!focus)}>{focus?'Exit focus mode':'Focus mode'}</button></div><StudyDocument interactiveTopicId={topicId} blocks={blocks}/></>;
}
