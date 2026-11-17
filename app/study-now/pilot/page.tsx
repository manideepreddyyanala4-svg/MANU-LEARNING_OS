import {notFound} from 'next/navigation';
import {LessonPreview} from '@/components/study-now/pilot/lesson-preview';
import lessons from '@/lib/pilot-lessons.json';
export default async function PilotPage({searchParams}:{searchParams:Promise<{topic?:string}>}) {
 if(process.env.NEXT_PUBLIC_INTERACTIVE_PILOT!=='1') notFound();
 const {topic}=await searchParams;
 if(topic&&!lessons.some(l=>l.key===topic)) notFound();
 return <LessonPreview key={topic??lessons[0].key} initialKey={topic??lessons[0].key}/>;
}
