-- Phase 7: read-only, owner-scoped, one-month daily metrics for the Finance Calendar.
-- Ledger postings, FX snapshots and finance_monthly_summary are unchanged.
begin;

create function public.finance_calendar_days(
 p_month_start date,
 p_account_id uuid default null,
 p_category_id uuid default null,
 p_spending_type text default 'all'
) returns table(
 day_date date,
 filtered_cash_minor text,
 filtered_consumption_minor text,
 allocated_grocery_minor text,
 ordinary_minor text,
 allocation_count integer
) language plpgsql security invoker set search_path='' as $$
declare u uuid:=auth.uid(); next_month date;
begin
 if u is null then raise exception 'Authentication required' using errcode='28000'; end if;
 if p_month_start is null or extract(day from p_month_start)<>1
   or p_spending_type is null or p_spending_type not in ('all','groceries','other')
 then raise exception 'Invalid calendar range or filter' using errcode='22023'; end if;
 if p_account_id is not null and not exists (
   select 1 from public.finance_accounts a where a.id=p_account_id and a.user_id=u
 ) then raise exception 'Payment account not owned' using errcode='42501'; end if;
 if p_category_id is not null and not exists (
   select 1 from public.finance_categories c where c.id=p_category_id and c.user_id=u
 ) then raise exception 'Expense category not owned' using errcode='42501'; end if;
 next_month:=(p_month_start+interval '1 month')::date;
 return query
 with calendar as (
   select (p_month_start+g.n)::date as d
     from pg_catalog.generate_series(0,next_month-p_month_start-1) g(n)
 ), cash as (
   select t.txn_date as d,sum(t.amount_minor::numeric) as total
   from public.finance_transactions t
   left join public.finance_categories cat on cat.id=t.category_id and cat.user_id=u
   where t.user_id=u and t.voided_at is null and t.kind='expense'
     and t.txn_date>=p_month_start and t.txn_date<next_month
     and (p_account_id is null or t.source_account_id=p_account_id)
     and (p_category_id is null or t.category_id=p_category_id)
     and (p_spending_type='all'
       or (p_spending_type='groceries' and cat.code='groceries')
       or (p_spending_type='other' and coalesce(cat.code,'')<>'groceries'))
   group by t.txn_date
 ), regular as (
   select t.txn_date as d,sum(t.amount_minor::numeric) as total
   from public.finance_transactions t
   left join public.finance_categories cat on cat.id=t.category_id and cat.user_id=u
   where t.user_id=u and t.voided_at is null and t.kind='expense'
     and t.txn_date>=p_month_start and t.txn_date<next_month
     and not exists (
       select 1 from public.finance_allocation_rules r
       where r.transaction_id=t.id and r.user_id=u
     )
     and (p_account_id is null or t.source_account_id=p_account_id)
     and (p_category_id is null or t.category_id=p_category_id)
     and (p_spending_type='all'
       or (p_spending_type='groceries' and cat.code='groceries')
       or (p_spending_type='other' and coalesce(cat.code,'')<>'groceries'))
   group by t.txn_date
 ), spread as (
   select c.d,
     sum(pg_catalog.trunc(r.amount_minor::numeric/r.duration_days,0)+
       case when (c.d-r.start_date)<
         pg_catalog.mod(r.amount_minor::numeric,r.duration_days::numeric)
       then 1 else 0 end) as total,
     sum(case when cat.code='groceries'
       then pg_catalog.trunc(r.amount_minor::numeric/r.duration_days,0)+
         case when (c.d-r.start_date)<
           pg_catalog.mod(r.amount_minor::numeric,r.duration_days::numeric)
         then 1 else 0 end
       else 0 end) as grocery,
     count(*)::integer as rule_count
   from calendar c
   join public.finance_allocation_rules r on r.user_id=u
     and r.start_date<=c.d and (r.start_date+r.duration_days)>c.d
   join public.finance_transactions t on t.id=r.transaction_id
     and t.user_id=u and t.kind='expense' and t.voided_at is null
   left join public.finance_categories cat
     on cat.id=coalesce(r.category_id,t.category_id) and cat.user_id=u
   where (p_account_id is null or t.source_account_id=p_account_id)
     and (p_category_id is null or coalesce(r.category_id,t.category_id)=p_category_id)
     and (p_spending_type='all'
       or (p_spending_type='groceries' and cat.code='groceries')
       or (p_spending_type='other' and coalesce(cat.code,'')<>'groceries'))
   group by c.d
 )
 select c.d,coalesce(p.total,0)::text,
   (coalesce(o.total,0)+coalesce(s.total,0))::text,
   coalesce(s.grocery,0)::text,coalesce(o.total,0)::text,
   coalesce(s.rule_count,0)::integer
 from calendar c
 left join cash p on p.d=c.d
 left join regular o on o.d=c.d
 left join spread s on s.d=c.d
 order by c.d;
end $$;

revoke all on function public.finance_calendar_days(date,uuid,uuid,text) from public,anon;
grant execute on function public.finance_calendar_days(date,uuid,uuid,text) to authenticated;

-- Paginated selected-day timeline. Attribution date is independent of purchase date.
-- Cash view returns one row per real paid expense; consumption view returns
-- one row per ordinary expense or per allocation rule covering the selected day.
create function public.finance_calendar_day_details(
 p_day date,
 p_view text default 'consumption',
 p_account_id uuid default null,
 p_category_id uuid default null,
 p_spending_type text default 'all',
 p_limit integer default 50,
 p_offset integer default 0
) returns table(
 transaction_id uuid,merchant text,txn_date date,source_account_id uuid,
 category_id uuid,item_name text,amount_minor text,attribution_type text,
 allocation_start date,duration_days integer
) language plpgsql security invoker set search_path='' as $$
declare u uuid:=auth.uid();
begin
 if u is null then raise exception 'Authentication required' using errcode='28000'; end if;
 if p_day is null or p_view is null or p_view not in ('cash','consumption')
   or p_spending_type is null or p_spending_type not in ('all','groceries','other')
   or p_limit is null or p_limit not between 1 and 100
   or p_offset is null or p_offset<0
 then raise exception 'Invalid timeline filters or pagination' using errcode='22023'; end if;
 if p_account_id is not null and not exists (
   select 1 from public.finance_accounts a where a.id=p_account_id and a.user_id=u
 ) then raise exception 'Payment account not owned' using errcode='42501'; end if;
 if p_category_id is not null and not exists (
   select 1 from public.finance_categories c where c.id=p_category_id and c.user_id=u
 ) then raise exception 'Category not owned' using errcode='42501'; end if;

 return query
 with entries as (
   select t.id as txid,t.merchant as store,t.txn_date as paid_date,
     t.source_account_id as account,t.category_id as category,
     ''::text as item,t.amount_minor::numeric as cost,
     'payment'::text as attr,null::date as alloc_start,null::integer as duration
   from public.finance_transactions t
   where p_view='cash' and t.user_id=u and t.voided_at is null
     and t.kind='expense' and t.txn_date=p_day

   union all
   select t.id,t.merchant,t.txn_date,t.source_account_id,t.category_id,
     ''::text,t.amount_minor::numeric,'single'::text,null::date,null::integer
   from public.finance_transactions t
   where p_view='consumption' and t.user_id=u and t.voided_at is null
     and t.kind='expense' and t.txn_date=p_day
     and not exists (select 1 from public.finance_allocation_rules r
       where r.user_id=u and r.transaction_id=t.id)

   union all
   select t.id,t.merchant,t.txn_date,t.source_account_id,
      coalesce(r.category_id,t.category_id),r.item_name,
      pg_catalog.trunc(r.amount_minor::numeric/r.duration_days,0)+
        case when (p_day-r.start_date)<
          pg_catalog.mod(r.amount_minor::numeric,r.duration_days::numeric)
        then 1 else 0 end,
      'allocated'::text,r.start_date,r.duration_days
   from public.finance_allocation_rules r
   join public.finance_transactions t on t.id=r.transaction_id
     and t.user_id=u and t.kind='expense' and t.voided_at is null
   where p_view='consumption' and r.user_id=u
     and r.start_date<=p_day and (r.start_date+r.duration_days)>p_day
 )
 select e.txid,e.store,e.paid_date,e.account,e.category,e.item,
   e.cost::text,e.attr,e.alloc_start,e.duration
 from entries e
 left join public.finance_categories cat on cat.id=e.category and cat.user_id=u
 where (p_account_id is null or e.account=p_account_id)
   and (p_category_id is null or e.category=p_category_id)
   and (p_spending_type='all'
     or (p_spending_type='groceries' and cat.code='groceries')
     or (p_spending_type='other' and coalesce(cat.code,'')<>'groceries'))
 order by e.paid_date,e.store,e.txid,e.item,e.attr
 limit p_limit offset p_offset;
end $$;
revoke all on function public.finance_calendar_day_details(
 date,text,uuid,uuid,text,integer,integer) from public,anon;
grant execute on function public.finance_calendar_day_details(
 date,text,uuid,uuid,text,integer,integer) to authenticated;

commit;
