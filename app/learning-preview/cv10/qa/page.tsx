import {notFound} from 'next/navigation';
import {Cv10Qa} from '@/components/learning/cv10/qa';
export default function Page(){if(process.env.NODE_ENV==='production'&&process.env.VERCEL_ENV!=='preview')notFound();return <Cv10Qa/>;}
