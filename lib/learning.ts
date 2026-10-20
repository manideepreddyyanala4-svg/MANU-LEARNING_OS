import {createClient} from '@/lib/supabase';
export type Subject={id:string;user_id:string;title:string;slug:string;description:string|null;order_index:number;created_at:string;updated_at:string};
export type Topic={id:string;user_id:string;subject_id:string;title:string;slug:string;status:'not_started'|'learning'|'understood'|'review'|'mastered';order_index:number;created_at:string;updated_at:string};
export type Note={id:string;user_id:string;topic_id:string;markdown_content:string;created_at:string;updated_at:string};
export type Asset={id:string;user_id:string;topic_id:string;storage_path:string;original_filename:string;mime_type:string;created_at:string};
export type TopicBlock={id:string;user_id:string;topic_id:string;block_type:'text'|'image'|'file';text_content:string|null;storage_path:string|null;original_filename:string|null;mime_type:string|null;caption:string|null;order_index:number;created_at:string;updated_at:string};
export const statuses=['not_started','learning','understood','review','mastered'] as const;
export function slugFor(title:string){const base=title.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,120)||'item';return `${base}-${crypto.randomUUID().slice(0,8)}`}
export function requireClient(){const client=createClient();if(!client)throw new Error('Supabase is not configured');return client}
export async function requireUser(){const client=requireClient();const {data:{user},error}=await client.auth.getUser();if(error||!user)throw new Error('Sign in required');return user}
export async function subjects(){const {data,error}=await requireClient().from('subjects').select('*').order('order_index').order('created_at');if(error)throw error;return data as Subject[]}
export async function topics(subjectId:string){const {data,error}=await requireClient().from('topics').select('*').eq('subject_id',subjectId).order('order_index').order('created_at');if(error)throw error;return data as Topic[]}
export async function removeAssetsForTopics(topicIds:string[]){if(!topicIds.length)return;const client=requireClient();const {data,error}=await client.from('topic_assets').select('storage_path').in('topic_id',topicIds);if(error)throw error;if(data?.length){const {error:storageError}=await client.storage.from('learning-assets').remove(data.map(x=>x.storage_path));if(storageError)throw storageError}}
export async function logLearning(eventType:string,metadata:Record<string,string>){const client=requireClient(),user=await requireUser();await client.from('activity_events').insert({user_id:user.id,event_type:eventType,metadata})}
