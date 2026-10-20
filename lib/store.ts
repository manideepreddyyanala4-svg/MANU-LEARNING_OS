import { createClient } from '@/lib/supabase';
export type RoadmapItem = { id:string; title:string; slug:string; order_index:number; status:'upcoming'|'current'|'in_progress'|'completed'|'review'; is_current:boolean };
export type SettingsData = { mission:string; current_mode:string; focus_rule:string; note_workflow:string[] };
export type Priority = { id:string; title:string; sort_order:number };
export function configured(){return Boolean(createClient());}
export async function owner(){const client=createClient(); if(!client) return null; const {data:{user}}=await client.auth.getUser(); return user;}
export async function loadRoadmap(){const client=createClient(); if(!client) return [] as RoadmapItem[]; const {data,error}=await client.from('roadmap_items').select('id,title,slug,order_index,status,is_current').order('order_index'); if(error) throw error; return data as RoadmapItem[];}
export async function loadSettings(){const client=createClient(); if(!client) return null; const {data,error}=await client.from('app_settings').select('mission,current_mode,focus_rule,note_workflow').single(); if(error) throw error; return data as SettingsData;}
export async function loadPriorities(){const client=createClient(); if(!client) return [] as Priority[]; const {data,error}=await client.from('priority_items').select('id,title,sort_order').order('sort_order'); if(error) throw error; return data as Priority[];}
