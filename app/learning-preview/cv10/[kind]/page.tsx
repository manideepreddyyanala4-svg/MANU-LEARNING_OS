import type {Route} from 'next';
import {notFound} from 'next/navigation';
import Link from 'next/link';
import {cv10Lessons,cv10Document} from '@/lib/cv10-document';
import {Cv10Preview} from '@/components/learning/cv10/preview';
export default async function Page({params}:{params:Promise<{kind:string}>}){
 if(process.env.NODE_ENV==='production'&&process.env.VERCEL_ENV!=='preview')notFound();
 const {kind}=await params,lesson=cv10Lessons.find(l=>l.kind===kind);if(!lesson)notFound();
 return <div className="mx-auto w-full max-w-4xl px-4 py-8"><p className="mb-4 text-sm text-[var(--muted)]">Learning Library preview · {lesson.title} · no account data loaded or saved</p><h1 className="mb-6 text-3xl font-bold text-[var(--fg)]">{lesson.title}</h1><Cv10Preview topicId={lesson.topicId} blocks={cv10Document(lesson)}/><nav className="flex flex-wrap gap-3 py-6">{cv10Lessons.map(l=><Link className="min-h-11 text-[var(--accent)] underline" href={`/learning-preview/cv10/${l.kind}` as Route} key={l.kind}>{l.title}</Link>)}</nav></div>;
}
