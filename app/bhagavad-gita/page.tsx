'use client';

import { useEffect, useMemo, useState } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, Check, Search, X, Bookmark, Type, List, ScrollText, BookMarked } from 'lucide-react';
import { gitaChapterOne } from '@/lib/bhagavad-gita-ch1';

const STORAGE_LAST = 'manuos:gita:ch1:last';
const STORAGE_READ = 'manuos:gita:ch1:read';
const pdfStart = 42;
const pdfEnd = 89;

function devanagariFromIast(source: string): string {
  const vowels: Record<string, [string, string]> = {
    a:['अ',''], ā:['आ','ा'], i:['इ','ि'], ī:['ई','ी'],
    u:['उ','ु'], ū:['ऊ','ू'], ṛ:['ऋ','ृ'], ṝ:['ॠ','ॄ'],
    ḷ:['ऌ','ॢ'], e:['ए','े'], ai:['ऐ','ै'], o:['ओ','ो'], au:['औ','ौ']
  };
  const consonants: Record<string, string> = {
    kh:'ख',gh:'घ',ch:'छ',jh:'झ',ṭh:'ठ',ḍh:'ढ',th:'थ',dh:'ध',ph:'फ',bh:'भ',
    k:'क',g:'ग',ṅ:'ङ',c:'च',j:'ज',ñ:'ञ',ṭ:'ट',ḍ:'ड',ṇ:'ण',
    t:'त',d:'द',n:'न',p:'प',b:'ब',m:'म',y:'य',r:'र',l:'ल',v:'व',
    ś:'श',ṣ:'ष',s:'स',h:'ह'
  };
  const special: Record<string,string> = {ṃ:'ं',ḥ:'ः',ṁ:'ं',"'":'ऽ','’':'ऽ', '—':'—'};
  const tokens = [...Object.keys(vowels), ...Object.keys(consonants), ...Object.keys(special)]
    .sort((a,b) => b.length-a.length);
  let out = '', pending = false;
  for (let i=0;i<source.length;) {
    if (source[i]==='-') { i++; continue; }
    let found = tokens.find(t => source.startsWith(t,i));
    if (!found) {
      out += source[i];
      pending = false;
      i++;
      continue;
    }
    if (consonants[found]) {
      if (pending) out += '्';
      out += consonants[found];
      pending = true;
    } else if (vowels[found]) {
      const [full,matra] = vowels[found];
      out += pending ? matra : full;
      pending = false;
    } else {
      out += special[found];
      pending = false;
    }
    i += found.length;
  }
  return out.replace(/[ ]{2,}/g,' ');
}

const covered = (start:number,end:number) => end-start+1;

export default function BhagavadGitaPage() {
  const [selected,setSelected] = useState(0);
  const [read,setRead] = useState<number[]>([]);
  const [query,setQuery] = useState('');
  const [contentsOpen,setContentsOpen] = useState(true);
  const [showMeanings,setShowMeanings] = useState(true);
  const [size,setSize] = useState(18);
  const [ready,setReady] = useState(false);
  useEffect(()=>{
    try {
      const stored = Number(window.localStorage.getItem(STORAGE_LAST) || 0);
      if(Number.isInteger(stored) && stored >= 0 && stored < gitaChapterOne.length) setSelected(stored);
      const raw=JSON.parse(window.localStorage.getItem(STORAGE_READ) || '[]');
      if(Array.isArray(raw)) setRead(raw.filter((x:unknown) => typeof x==='number' && x>=1 && x<=46));
    } catch { /* local progress is optional */ }
    setReady(true);
  },[]);
  const passage=gitaChapterOne[selected];
  const title = passage.start === passage.end ? String(passage.start) : passage.start + '–' + passage.end;
  const isRead = Array.from({length:covered(passage.start,passage.end)},(_,i)=>passage.start+i)
    .every(n=>read.includes(n));
  const completed = read.length;
  const results=useMemo(()=>{
    const q=query.trim().toLowerCase();
    if(!q)return gitaChapterOne.map((p,i)=>({p,i}));
    return gitaChapterOne.map((p,i)=>({p,i})).filter(({p})=>
      [String(p.start),p.transliteration,p.synonyms,p.translation,p.simplePurport || '']
        .some(text=>text.toLowerCase().includes(q)));
  },[query]);
  const sanskrit=useMemo(()=>devanagariFromIast(passage.transliteration),[passage.transliteration]);
  function select(index:number) {
    if(index<0||index>=gitaChapterOne.length)return;
    setSelected(index);
    try{window.localStorage.setItem(STORAGE_LAST,String(index))}catch{}
    document.getElementById('gita-reader')?.scrollIntoView({behavior:'smooth',block:'start'});
  }
  function toggleRead() {
    const ids=Array.from({length:covered(passage.start,passage.end)},(_,i)=>passage.start+i);
    const updated=isRead?read.filter(x=>!ids.includes(x)):[...new Set([...read,...ids])].sort((a,b)=>a-b);
    setRead(updated);
    try{window.localStorage.setItem(STORAGE_READ,JSON.stringify(updated))}catch{}
  }

  return (
    <div className="mx-auto max-w-[1250px] px-4 pb-20 pt-7 sm:px-7 lg:px-9">
      <div className="mb-7 rounded-[26px] border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-7">
        <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-[var(--accent)]">
          <BookMarked size={15}/> Spiritual reading · Bhagavad-gītā
        </div>
        <h1 className="max-w-3xl text-3xl font-extrabold tracking-tight text-[var(--fg)] sm:text-4xl">
          Chapter 1 <span className="font-normal text-[var(--muted)]">—</span> Observing the Armies on the Battlefield of Kurukshetra
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)]">
          Study every verse in the same order as your uploaded <em>Bhagavad-gītā As It Is</em>.
          The Sanskrit, transliteration, word meanings and book translation come first.
          Only the author’s explanation (purport) is rewritten in simple English.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3">
            <p className="text-2xl font-extrabold text-[var(--fg)]">46</p><p className="text-xs text-[var(--muted)]">All verses covered · 39 book sections</p>
          </div>
          <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3">
            <p className="text-2xl font-extrabold text-[var(--fg)]">{completed}<span className="text-base font-normal text-[var(--muted)]"> / 46</span></p>
            <p className="text-xs text-[var(--muted)]">Verses marked as read on this device</p>
          </div>
          <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3">
            <p className="text-2xl font-extrabold text-[var(--fg)]">{pdfStart}–{pdfEnd}</p>
            <p className="text-xs text-[var(--muted)]">PDF page references from your uploaded edition</p>
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--bg)]" role="progressbar" aria-label="Reading progress" aria-valuemin={0} aria-valuemax={46} aria-valuenow={completed}>
          <div className="h-full rounded-full bg-[var(--accent)] transition-all" style={{width:(completed/46*100)+'%'}} />
        </div>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className={contentsOpen?'lg:sticky lg:top-[75px]':'lg:sticky lg:top-[75px]'}>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 font-bold text-[var(--fg)]"><List size={17}/> Verses</h2>
              <button type="button" onClick={()=>setContentsOpen(!contentsOpen)} className="rounded-lg border border-[var(--line)] p-2 text-[var(--muted)]" aria-label={contentsOpen?'Hide chapter index':'Show chapter index'}>
                {contentsOpen?<X size={14}/>:<List size={14}/>}
              </button>
            </div>
            {contentsOpen && <>
              <label className="mt-4 flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-[var(--muted)]">
                <Search size={15}/><input aria-label="Search this chapter" className="w-full min-w-0 bg-transparent text-sm text-[var(--fg)] outline-none" placeholder="Search words or verses" value={query} onChange={e=>setQuery(e.target.value)}/>
              </label>
              <div className="mt-3 max-h-[50vh] space-y-1 overflow-y-auto pr-1 lg:max-h-[65vh]">
                {results.map(({p,i})=>{
                  const nums=Array.from({length:covered(p.start,p.end)},(_,j)=>p.start+j);
                  const done=nums.every(n=>read.includes(n));
                  return <button key={i} onClick={()=>select(i)} type="button" className={'flex w-full items-start justify-between rounded-xl px-3 py-2 text-left text-sm transition '+(i===selected?'bg-[var(--accent-subtle)] font-bold text-[var(--accent)]':'text-[var(--fg)] hover:bg-[var(--bg)]')}>
                    <span>Verse {p.start}{p.end>p.start?'–'+p.end:''}<span className="block text-[11px] font-normal text-[var(--muted)]">PDF p. {p.pageStart}</span></span>
                    {done&&<Check size={15} className="mt-1 text-emerald-600" aria-label="Read"/>}
                  </button>
                })}
                {results.length===0&&<p className="p-3 text-sm text-[var(--muted)]">Nothing matched your search.</p>}
              </div>
            </>}
          </div>
        </aside>

        <main id="gita-reader" className="min-w-0 scroll-mt-20">
          <article className="overflow-hidden rounded-[26px] border border-[var(--line)] bg-[var(--surface)]">
            <header className="border-b border-[var(--line)] p-5 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-subtle)] px-3 py-1.5 text-xs font-bold text-[var(--accent)]">
                  <ScrollText size={14}/> Text {title}
                </span>
                <span className="text-xs font-semibold text-[var(--muted)]">
                  PDF page {passage.pageStart}{passage.pageEnd>passage.pageStart?'–'+passage.pageEnd:''}
                </span>
              </div>
              <h2 className="mt-4 text-2xl font-extrabold text-[var(--fg)]">Verse {title}</h2>
              <p className="mt-1 text-xs text-[var(--muted)]">Original reading order from the book · Section {selected+1} of {gitaChapterOne.length}</p>
            </header>

            <div className="space-y-8 p-5 sm:p-8">
              <section aria-labelledby="sanskrit-title">
                <h3 id="sanskrit-title" className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Sanskrit śloka</h3>
                <p className="whitespace-pre-line rounded-2xl bg-[var(--bg)] px-4 py-6 text-center text-[21px] leading-[2.1] text-[var(--fg)] sm:text-[25px]" lang="sa">
                  {sanskrit}
                </p>
                <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
                  Devanāgarī script is reconstructed from the book’s Roman transliteration because the uploaded PDF’s embedded Sanskrit font does not extract correctly.
                </p>
              </section>

              <section>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Book transliteration · IAST characters restored</h3>
                <p className="whitespace-pre-line break-words text-center font-serif italic leading-[1.9] text-[var(--fg)]" style={{fontSize:size}}>
                  {passage.transliteration}
                </p>
              </section>

              <section>
                <button type="button" onClick={()=>setShowMeanings(!showMeanings)} className="flex w-full items-center justify-between gap-3 border-b border-[var(--line)] pb-3 text-left text-sm font-bold text-[var(--fg)]" aria-expanded={showMeanings}>
                  <span>Word-for-word Sanskrit–English meanings (original)</span>
                  <span className="text-xs text-[var(--accent)]">{showMeanings?'Hide':'Show'}</span>
                </button>
                {showMeanings&&<p className="mt-4 whitespace-pre-line break-words text-sm leading-8 text-[var(--fg)]">{passage.synonyms}</p>}
              </section>

              <section className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-5">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Translation · original book wording</h3>
                <p className="whitespace-pre-line font-serif text-lg leading-8 text-[var(--fg)]">{passage.translation}</p>
              </section>

              <section className="rounded-2xl border-l-4 border-[var(--accent)] bg-[var(--accent-subtle)]/50 p-5 sm:p-6">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <BookOpen size={18} className="text-[var(--accent)]"/>
                  <h3 className="text-lg font-extrabold text-[var(--fg)]">Purport — in simple English</h3>
                </div>
                {passage.simplePurport
                  ? passage.simplePurport.split('\n\n').map((part,i)=><p key={i} className="mt-3 whitespace-pre-line text-[15px] leading-8 text-[var(--fg)]">{part}</p>)
                  : <p className="text-sm leading-7 text-[var(--muted)]">This verse has no separate purport in the uploaded edition. The complete original translation and word meanings appear above; no additional commentary has been invented.</p>}
              </section>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-5">
                <button type="button" onClick={toggleRead} className={'inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition '+(isRead?'border border-emerald-600/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300':'bg-[var(--accent)] text-white')}>
                  {isRead?<Check size={17}/>:<Bookmark size={17}/>} {isRead?'Marked as read':'Mark verse as read'}
                </button>
                <div className="flex items-center gap-2">
                  <Type size={15} className="text-[var(--muted)]"/>
                  <button type="button" onClick={()=>setSize(v=>Math.max(15,v-2))} className="h-9 w-9 rounded-lg border border-[var(--line)] text-[var(--fg)]" aria-label="Decrease transliteration text size">−</button>
                  <button type="button" onClick={()=>setSize(v=>Math.min(28,v+2))} className="h-9 w-9 rounded-lg border border-[var(--line)] text-[var(--fg)]" aria-label="Increase transliteration text size">+</button>
                </div>
              </div>
            </div>
          </article>
          <div className="mt-5 flex items-center justify-between gap-3">
            <button onClick={()=>select(selected-1)} disabled={selected===0} className="inline-flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm font-bold text-[var(--fg)] disabled:opacity-40"><ChevronLeft size={18}/> Previous</button>
            <span className="text-center text-xs text-[var(--muted)]">{selected+1} / {gitaChapterOne.length} sections</span>
            <button onClick={()=>select(selected+1)} disabled={selected===gitaChapterOne.length-1} className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-bold text-white disabled:opacity-40">Next <ChevronRight size={18}/></button>
          </div>
          <p className="mt-6 text-center text-xs leading-6 text-[var(--muted)]">
            Source: <em>Bhagavad-gītā As It Is</em>, A. C. Bhaktivedanta Swami Prabhupada, Bhaktivedanta Book Trust, 1998. 
            Page references refer to the 1,029-page uploaded PDF. Reading progress is saved in this browser, not synchronized to your ManuOS account.
          </p>
        </main>
      </div>
    </div>
  );
}
