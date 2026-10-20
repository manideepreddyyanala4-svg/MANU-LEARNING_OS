-- Apply after 001 and 002. Existing data is preserved.
alter table public.app_settings add column if not exists mission text not null default 'Get a technical internship.';
alter table public.app_settings add column if not exists current_mode text not null default 'Internship First';
alter table public.app_settings add column if not exists focus_rule text not null default 'No business/startup research until the internship objective is achieved.';
alter table public.app_settings add column if not exists note_workflow text[] not null default array['Paper','ChatGPT','Manu Learning OS','I write the important material myself first.','ChatGPT helps me improve and organize it.','The final useful version lives here.','I do not need a tablet.','I do not need another note-taking system.','My objective is competence, not collecting tools.'];
create unique index if not exists priority_items_user_order_idx on public.priority_items(user_id, sort_order);
create unique index if not exists roadmap_items_user_order_idx on public.roadmap_items(user_id, order_index);
-- A single authenticated owner can call this after account creation. All inserts use auth.uid().
create or replace function public.bootstrap_owner() returns void language plpgsql security invoker set search_path = public as $$
declare owner_id uuid := auth.uid();
declare titles text[] := array['Kernel + Convolution','Edges + Gradient','Sobel / Scharr','Laplacian','LoG / DoG','Canny','Thresholding','Morphology','Resize / Interpolation / Model-input Preparation','CNN Fundamentals — Deep Study','PyTorch — Deep Study','MobileNet / Lightweight CNN Blocks','LAWNet + Own Project Architecture','Embeddings / Metric Learning / Biometric Verification','YOLO + Detection Fundamentals','Segmentation Basics','Git + Linux','DSA / Python Interview Coding','Deployment / ONNX','Modern CV / ViT / VLM Basics','Full Interview Revision'];
declare slugs text[] := array['kernel-convolution','edges-gradient','sobel-scharr','laplacian','log-dog','canny','thresholding','morphology','resize-interpolation-model-input-preparation','cnn-fundamentals-deep-study','pytorch-deep-study','mobilenet-lightweight-cnn-blocks','lawnet-own-project-architecture','embeddings-metric-learning-biometric-verification','yolo-detection-fundamentals','segmentation-basics','git-linux','dsa-python-interview-coding','deployment-onnx','modern-cv-vit-vlm-basics','full-interview-revision'];
declare priorities text[] := array['Internship preparation','Technical learning','Research / thesis','Internship applications','Essential Mandarin'];
declare i integer;
begin
 if owner_id is null then raise exception 'Authentication required'; end if;
 insert into public.app_settings(user_id) values(owner_id) on conflict (user_id) do nothing;
 for i in 1..array_length(priorities,1) loop
  if not exists(select 1 from public.priority_items where user_id=owner_id and sort_order=i) then
   insert into public.priority_items(user_id,title,sort_order) values(owner_id,priorities[i],i);
  end if;
 end loop;
 for i in 1..array_length(titles,1) loop
  insert into public.roadmap_items(user_id,title,slug,order_index,status,is_current)
  values(owner_id,titles[i],slugs[i],i,case when i=1 then 'current' else 'upcoming' end,i=1)
  on conflict(user_id,slug) do nothing;
 end loop;
end $$;
revoke all on function public.bootstrap_owner() from public;
grant execute on function public.bootstrap_owner() to authenticated;
-- Atomic current position change; prevents unique-index conflicts during a move.
create or replace function public.set_current_roadmap(target_id uuid) returns void language plpgsql security invoker set search_path = public as $$
declare owner_id uuid := auth.uid();
begin
 if owner_id is null or not exists(select 1 from public.roadmap_items where id=target_id and user_id=owner_id) then raise exception 'Roadmap item unavailable'; end if;
 update public.roadmap_items set is_current=false, status=case when status='current' then 'upcoming' else status end where user_id=owner_id and is_current=true;
 update public.roadmap_items set is_current=true,status='current' where id=target_id and user_id=owner_id;
 insert into public.activity_events(user_id,event_type,metadata) values(owner_id,'roadmap_current_changed',jsonb_build_object('item_id',target_id));
end $$;
revoke all on function public.set_current_roadmap(uuid) from public;
grant execute on function public.set_current_roadmap(uuid) to authenticated;
