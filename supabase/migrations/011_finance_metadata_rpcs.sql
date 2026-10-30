-- Finance metadata, manual FX, monthly budgets, read summaries.
-- No banking APIs. No automatic live exchange rates. Requires 009–010.
begin;

create or replace function public.finance_create_account(
  p_name text,p_kind text,p_code text default null
) returns uuid language plpgsql security definer set search_path='' as $$
declare u uuid := auth.uid(); aid uuid;
begin
  if u is null then raise exception 'Authentication required' using errcode='28000'; end if;
  if length(trim(coalesce(p_name,''))) not between 1 and 100 or p_kind not in ('cash','bank')
    then raise exception 'Invalid account name or kind'; end if;
  perform 1 from public.finance_preferences where user_id=u for update;
  if not found then raise exception 'Initialize finance first'; end if;
  insert into public.finance_accounts(user_id,code,name,kind,currency)
    values(u,coalesce(p_code,'custom-'||gen_random_uuid()::text),trim(p_name),p_kind,'TWD')
    returning id into aid;
  insert into public.finance_audit_events(user_id,entity_type,entity_id,action,after_state)
    values(u,'account',aid,'create',jsonb_build_object('name',p_name,'kind',p_kind));
  return aid;
end $$;

create or replace function public.finance_update_account(
  p_account_id uuid,p_name text,p_is_active boolean
) returns void language plpgsql security definer set search_path='' as $$
declare u uuid := auth.uid(); a public.finance_accounts%rowtype; balance_minor numeric;
begin
  if u is null then raise exception 'Authentication required' using errcode='28000'; end if;
  if length(trim(coalesce(p_name,''))) not between 1 and 100 or p_is_active is null
    then raise exception 'Invalid account update'; end if;
  perform 1 from public.finance_preferences where user_id=u for update;
  if not found then raise exception 'Initialize finance first'; end if;
  select * into a from public.finance_accounts where user_id=u and id=p_account_id for update;
  if not found then raise exception 'Account not found'; end if;
  if not p_is_active then
    select coalesce(sum(delta_minor),0) into balance_minor
      from public.finance_postings where user_id=u and account_id=p_account_id;
    if balance_minor <> 0 then raise exception 'Cannot archive an account with non-zero tracked balance'; end if;
  end if;
  update public.finance_accounts set name=trim(p_name),is_active=p_is_active,updated_at=now()
    where user_id=u and id=p_account_id;
  insert into public.finance_audit_events(user_id,entity_type,entity_id,action,before_state,after_state)
    values(u,'account',p_account_id,'update',to_jsonb(a),
      jsonb_build_object('name',trim(p_name),'is_active',p_is_active));
end $$;

create or replace function public.finance_save_category(
  p_name text,p_category_id uuid default null,p_is_archived boolean default false
) returns uuid language plpgsql security definer set search_path='' as $$
declare u uuid := auth.uid(); c public.finance_categories%rowtype; cid uuid;
begin
  if u is null then raise exception 'Authentication required' using errcode='28000'; end if;
  if length(trim(coalesce(p_name,''))) not between 1 and 80 or p_is_archived is null
    then raise exception 'Invalid category'; end if;
  perform 1 from public.finance_preferences where user_id=u for update;
  if not found then raise exception 'Initialize finance first'; end if;
  if p_category_id is null then
    insert into public.finance_categories(user_id,code,name)
      values(u,'custom-'||gen_random_uuid()::text,trim(p_name)) returning id into cid;
    insert into public.finance_audit_events(user_id,entity_type,entity_id,action,after_state)
      values(u,'category',cid,'create',jsonb_build_object('name',trim(p_name)));
  else
    select * into c from public.finance_categories where id=p_category_id and user_id=u for update;
    if not found then raise exception 'Category not found'; end if;
    update public.finance_categories set name=trim(p_name),is_archived=p_is_archived,updated_at=now()
      where user_id=u and id=p_category_id;
    cid := p_category_id;
    insert into public.finance_audit_events(user_id,entity_type,entity_id,action,before_state,after_state)
      values(u,'category',cid,'update',to_jsonb(c),
        jsonb_build_object('name',trim(p_name),'is_archived',p_is_archived));
  end if;
  return cid;
end $$;

create or replace function public.finance_update_preferences(
  p_currency text,p_timezone text
) returns void language plpgsql security definer set search_path='' as $$
declare u uuid := auth.uid(); pref public.finance_preferences%rowtype;
begin
  if u is null then raise exception 'Authentication required' using errcode='28000'; end if;
  if p_currency not in ('TWD','INR') or not exists (
    select 1 from pg_catalog.pg_timezone_names where name=p_timezone
  ) then raise exception 'Invalid currency or timezone'; end if;
  select * into pref from public.finance_preferences where user_id=u for update;
  if not found then raise exception 'Initialize finance first'; end if;
  update public.finance_preferences set display_currency=p_currency,timezone=p_timezone,updated_at=now()
    where user_id=u;
  insert into public.finance_audit_events(user_id,entity_type,entity_id,action,before_state,after_state)
    values(u,'preferences',u,'update',to_jsonb(pref),
      jsonb_build_object('display_currency',p_currency,'timezone',p_timezone));
end $$;

create or replace function public.finance_add_manual_fx_rate(
  p_twd_per_inr numeric,p_note text default ''
) returns uuid language plpgsql security definer set search_path='' as $$
declare u uuid := auth.uid(); rate_id uuid; prev public.finance_preferences%rowtype;
begin
  if u is null then raise exception 'Authentication required' using errcode='28000'; end if;
  if p_twd_per_inr is null or p_twd_per_inr < 0.00000001 or p_twd_per_inr > 10000
    or length(coalesce(p_note,''))>500 then raise exception 'Invalid manual exchange rate'; end if;
  select * into prev from public.finance_preferences where user_id=u for update;
  if not found then raise exception 'Initialize finance first'; end if;
  insert into public.finance_fx_rates(user_id,twd_per_inr,note)
    values(u,p_twd_per_inr,coalesce(p_note,'')) returning id into rate_id;
  update public.finance_preferences set current_fx_rate_id=rate_id,updated_at=now() where user_id=u;
  insert into public.finance_audit_events(user_id,entity_type,entity_id,action,before_state,after_state)
    values(u,'fx_rate',rate_id,'create',
      jsonb_build_object('previousRateId',prev.current_fx_rate_id),
      jsonb_build_object('twdPerInr',p_twd_per_inr,'source','manual'));
  return rate_id;
end $$;

create or replace function public.finance_upsert_monthly_budget(
  p_month_start date,p_budget_currency text,p_budget_minor bigint,
  p_fx_rate_id uuid default null,p_expected_revision integer default null
) returns uuid language plpgsql security definer set search_path='' as $$
declare
  u uuid := auth.uid();
  b public.finance_monthly_budgets%rowtype;
  has_budget boolean := false;
  rate numeric(20,8);
  resolved numeric;
  budget_id uuid;
begin
  if u is null then raise exception 'Authentication required' using errcode='28000'; end if;
  if p_month_start is null or extract(day from p_month_start)<>1
    or p_budget_currency not in ('INR','TWD')
    or p_budget_minor is null or p_budget_minor not between 0 and 1000000000000
  then raise exception 'Invalid monthly budget'; end if;
  perform 1 from public.finance_preferences where user_id=u for update;
  if not found then raise exception 'Initialize finance first'; end if;
  if p_budget_currency='INR' then
    if p_fx_rate_id is null then raise exception 'Explicit manual FX rate required for INR budget'; end if;
    select twd_per_inr into rate from public.finance_fx_rates
      where user_id=u and id=p_fx_rate_id;
    if not found then raise exception 'FX rate not found or not owned'; end if;
    -- Positive amounts: numeric round(x,0) is deterministic half-up.
    resolved := round(p_budget_minor::numeric * rate,0);
  else
    if p_fx_rate_id is not null then raise exception 'TWD budget must not have FX rate'; end if;
    rate := null;
    resolved := p_budget_minor;
  end if;
  if resolved > 1000000000000 then raise exception 'Converted budget exceeds limit'; end if;

  select * into b from public.finance_monthly_budgets
    where user_id=u and month_start=p_month_start for update;
  has_budget := found;
  if has_budget then
    if p_expected_revision is distinct from b.revision then raise exception 'Budget revision conflict'; end if;
    update public.finance_monthly_budgets set
      budget_currency=p_budget_currency,budget_minor=p_budget_minor,fx_rate_id=p_fx_rate_id,
      fx_twd_per_inr=rate,resolved_twd_minor=resolved::bigint,
      revision=b.revision+1,updated_at=now()
    where id=b.id and user_id=u;
    budget_id := b.id;
  else
    if p_expected_revision is not null then raise exception 'Revision must be null for new budget'; end if;
    insert into public.finance_monthly_budgets(
      user_id,month_start,budget_currency,budget_minor,fx_rate_id,fx_twd_per_inr,resolved_twd_minor
    ) values(u,p_month_start,p_budget_currency,p_budget_minor,p_fx_rate_id,rate,resolved::bigint)
    returning id into budget_id;
  end if;
  insert into public.finance_audit_events(user_id,entity_type,entity_id,action,before_state,after_state)
    values(u,'budget',budget_id,case when has_budget then 'replace' else 'create' end,
      case when has_budget then to_jsonb(b) else null end,
      jsonb_build_object('monthStart',p_month_start,'currency',p_budget_currency,
        'budgetMinor',p_budget_minor::text,'resolvedTwdMinor',resolved::text,'fxRateId',p_fx_rate_id));
  return budget_id;
end $$;

-- Monthly summary: actual cash flow is separate from consumed-cost allocations.
-- Values are TEXT to avoid JSON bigint precision loss in JavaScript.
create or replace function public.finance_monthly_summary(p_month_start date)
returns table(
  month_start date,budget_currency text,budget_minor text,resolved_twd_minor text,
  actual_expense_minor text,actual_income_minor text,allocated_consumption_minor text
) language plpgsql security invoker set search_path='' as $$
declare u uuid := auth.uid(); next_month date;
begin
  if u is null then raise exception 'Authentication required' using errcode='28000'; end if;
  if p_month_start is null or extract(day from p_month_start)<>1
    then raise exception 'Invalid month'; end if;
  next_month := (p_month_start + interval '1 month')::date;
  return query
  with tx as (
    select * from public.finance_transactions t
      where t.user_id=u and t.voided_at is null
  ), actual as (
    select
      coalesce(sum(t.amount_minor) filter (where t.kind='expense'),0)::numeric as expense,
      coalesce(sum(t.amount_minor) filter (where t.kind='income'),0)::numeric as income
    from tx t where t.txn_date>=p_month_start and t.txn_date<next_month
  ), ordinary_consumption as (
    select coalesce(sum(t.amount_minor),0)::numeric as amount
    from tx t where t.kind='expense'
      and t.txn_date>=p_month_start and t.txn_date<next_month
      and not exists (
        select 1 from public.finance_allocation_rules r
        where r.user_id=u and r.transaction_id=t.id
      )
  ), scheduled_consumption as (
    select coalesce(sum(
      (r.amount_minor / r.duration_days)::bigint +
      case when g.day_index < (r.amount_minor % r.duration_days) then 1 else 0 end
    ),0)::numeric as amount
    from public.finance_allocation_rules r
    join tx t on t.id=r.transaction_id and t.user_id=r.user_id and t.kind='expense'
    cross join lateral generate_series(0,r.duration_days-1) g(day_index)
    where r.user_id=u
      and r.start_date<next_month
      and (r.start_date + r.duration_days)>p_month_start
      and (r.start_date + g.day_index)>=p_month_start
      and (r.start_date + g.day_index)<next_month
  )
  select p_month_start,b.budget_currency,b.budget_minor::text,b.resolved_twd_minor::text,
    a.expense::text,a.income::text,(o.amount+s.amount)::text
  from actual a cross join ordinary_consumption o cross join scheduled_consumption s
  left join public.finance_monthly_budgets b
    on b.user_id=u and b.month_start=p_month_start;
end $$;

revoke all on function public.finance_create_account(text,text,text) from public,anon;
revoke all on function public.finance_update_account(uuid,text,boolean) from public,anon;
revoke all on function public.finance_save_category(text,uuid,boolean) from public,anon;
revoke all on function public.finance_update_preferences(text,text) from public,anon;
revoke all on function public.finance_add_manual_fx_rate(numeric,text) from public,anon;
revoke all on function public.finance_upsert_monthly_budget(date,text,bigint,uuid,integer) from public,anon;
revoke all on function public.finance_monthly_summary(date) from public,anon;
grant execute on function public.finance_create_account(text,text,text) to authenticated;
grant execute on function public.finance_update_account(uuid,text,boolean) to authenticated;
grant execute on function public.finance_save_category(text,uuid,boolean) to authenticated;
grant execute on function public.finance_update_preferences(text,text) to authenticated;
grant execute on function public.finance_add_manual_fx_rate(numeric,text) to authenticated;
grant execute on function public.finance_upsert_monthly_budget(date,text,bigint,uuid,integer) to authenticated;
grant execute on function public.finance_monthly_summary(date) to authenticated;
commit;