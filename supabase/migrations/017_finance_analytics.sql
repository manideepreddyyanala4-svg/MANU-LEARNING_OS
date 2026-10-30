-- Phase 8: read-only financial analytics. Requires 009-016.
-- No account postings, balance writes, FX changes or external analytics calls.
begin;

-- Normalize only unambiguous, explicitly curated aliases. Everything else is
-- preserved as distinct merchant text; missing merchant stays NULL.
create function public.finance_analytics_merchant(p_name text)
returns text language sql immutable set search_path='' as $$
 select case
   when nullif(pg_catalog.btrim(p_name),'') is null then null
   when pg_catalog.lower(pg_catalog.regexp_replace(pg_catalog.btrim(p_name),'[[:space:]-]','','g'))='pxmart' then 'PX Mart'
   when pg_catalog.lower(pg_catalog.regexp_replace(pg_catalog.btrim(p_name),'[[:space:]-]','','g'))='familymart' then 'FamilyMart'
   when pg_catalog.lower(pg_catalog.regexp_replace(pg_catalog.btrim(p_name),'[[:space:]-]','','g'))='7eleven' then '7-Eleven'
   else pg_catalog.btrim(p_name)
 end
$$;
revoke all on function public.finance_analytics_merchant(text) from public,anon;
grant execute on function public.finance_analytics_merchant(text) to authenticated;

-- Exact amounts are JSON strings (not IEEE754 JS numbers).
-- Income is deliberately NULL for merchant/category filtered summaries:
-- those dimensions have no meaningful income analogue.
create function public.finance_analytics_overview(
 p_from date,p_to date,p_account_id uuid default null,
 p_category_id uuid default null,p_merchant text default null
) returns jsonb language plpgsql security invoker set search_path='' as $$
declare u uuid:=auth.uid(); result jsonb;
begin
 if u is null then raise exception 'Authentication required' using errcode='28000'; end if;
 if p_from is null or p_to is null or p_from>p_to or p_to-p_from>730
   or length(coalesce(p_merchant,''))>200
 then raise exception 'Invalid analytics range or merchant' using errcode='22023'; end if;
 if p_account_id is not null and not exists(select 1 from public.finance_accounts
   where user_id=u and id=p_account_id)
 then raise exception 'Payment account not owned' using errcode='42501'; end if;
 if p_category_id is not null and not exists(select 1 from public.finance_categories
   where user_id=u and id=p_category_id)
 then raise exception 'Category not owned' using errcode='42501'; end if;
 with relevant as (
   select t.id,t.amount_minor::numeric amt,t.txn_date,t.source_account_id,
      t.category_id,public.finance_analytics_merchant(t.merchant) as merchant
   from public.finance_transactions t
   where t.user_id=u and t.kind='expense' and t.voided_at is null
     and t.txn_date between p_from and p_to
     and (p_account_id is null or t.source_account_id=p_account_id)
     and (p_category_id is null or t.category_id=p_category_id)
     and (p_merchant is null or public.finance_analytics_merchant(t.merchant)=p_merchant)
 ), sums as (
   select coalesce(sum(amt),0) expenses,count(*) as purchases,
     coalesce(max(amt),0) largest from relevant
 ), income as (
   select case when p_category_id is not null or p_merchant is not null
     then null::numeric else coalesce(sum(t.amount_minor::numeric),0) end as total
   from public.finance_transactions t where t.user_id=u
     and t.voided_at is null and t.kind='income'
     and t.txn_date between p_from and p_to
     and (p_account_id is null or t.destination_account_id=p_account_id)
 ), first_date as (
   select min(t.txn_date) as first_tracked from public.finance_transactions t
   where t.user_id=u and t.voided_at is null
 ), groups_category as (
   select r.category_id,c.code,c.name,sum(r.amt) amt,count(*) count
   from relevant r left join public.finance_categories c
     on c.user_id=u and c.id=r.category_id
   group by r.category_id,c.code,c.name
 ), groups_merchant as (
   select r.merchant,sum(r.amt) amt,count(*) count
   from relevant r group by r.merchant
 ), groups_account as (
   select r.source_account_id,a.name,sum(r.amt) amt,count(*) count
   from relevant r left join public.finance_accounts a
     on a.user_id=u and a.id=r.source_account_id
   group by r.source_account_id,a.name
 )
 select jsonb_build_object(
  'from',p_from,'to',p_to,
  'expenseMinor',(select expenses::text from sums),
  'incomeMinor',(select total::text from income),
  'expenseCount',(select purchases from sums),
  'largestMinor',(select largest::text from sums),
  'firstTracked',(select first_tracked from first_date),
  'categories',coalesce((select jsonb_agg(jsonb_build_object(
    'id',category_id,'code',code,'name',name,'amountMinor',amt::text,'count',count)
    order by amt desc,category_id) from groups_category),'[]'::jsonb),
  'merchants',coalesce((select jsonb_agg(jsonb_build_object(
    'name',merchant,'amountMinor',amt::text,'count',count)
    order by amt desc,merchant nulls last) from groups_merchant),'[]'::jsonb),
  'accounts',coalesce((select jsonb_agg(jsonb_build_object(
    'id',source_account_id,'name',name,'amountMinor',amt::text,'count',count)
    order by amt desc,source_account_id) from groups_account),'[]'::jsonb)
 ) into result;
 return result;
end $$;

-- Up to 12 consecutive calendar months in one indexed date-range aggregate.
-- 'unknown' means tracking had not yet started; do NOT label it zero spend.
-- 'partial-start' marks the month with first transaction after day 1.
create function public.finance_analytics_months(
 p_start date,p_count integer default 12,
 p_account_id uuid default null,p_category_id uuid default null,
 p_merchant text default null
) returns table(
 month_start date,expense_minor text,income_minor text,
 budget_minor text,budget_currency text,original_budget_minor text,
 coverage text,expense_count bigint
) language plpgsql security invoker set search_path='' as $$
declare u uuid:=auth.uid(); stop_date date; first_date date;
begin
 if u is null then raise exception 'Authentication required' using errcode='28000'; end if;
 if p_start is null or extract(day from p_start)<>1 or
   p_count is null or p_count not between 1 and 12 or
   length(coalesce(p_merchant,''))>200
 then raise exception 'Invalid analytics month range' using errcode='22023'; end if;
 if p_account_id is not null and not exists(select 1 from public.finance_accounts
   where user_id=u and id=p_account_id)
 then raise exception 'Account not owned' using errcode='42501'; end if;
 if p_category_id is not null and not exists(select 1 from public.finance_categories
   where user_id=u and id=p_category_id)
 then raise exception 'Category not owned' using errcode='42501'; end if;
 stop_date:=(p_start+(p_count||' months')::interval)::date;
 select min(txn_date) into first_date
 from public.finance_transactions where user_id=u and voided_at is null;
 return query
 with calendar as (
   select (p_start+(g.n||' months')::interval)::date d
   from pg_catalog.generate_series(0,p_count-1) g(n)
 ), expenses as (
   select pg_catalog.date_trunc('month',t.txn_date::timestamp)::date d,
      sum(t.amount_minor::numeric) amt,count(*) n
   from public.finance_transactions t
   where t.user_id=u and t.kind='expense' and t.voided_at is null
     and t.txn_date>=p_start and t.txn_date<stop_date
     and (p_account_id is null or t.source_account_id=p_account_id)
     and (p_category_id is null or t.category_id=p_category_id)
     and (p_merchant is null or public.finance_analytics_merchant(t.merchant)=p_merchant)
   group by 1
 ), income as (
   select pg_catalog.date_trunc('month',t.txn_date::timestamp)::date d,
      sum(t.amount_minor::numeric) amt
   from public.finance_transactions t
   where t.user_id=u and t.kind='income' and t.voided_at is null
     and t.txn_date>=p_start and t.txn_date<stop_date
     and (p_account_id is null or t.destination_account_id=p_account_id)
     and p_category_id is null and p_merchant is null
   group by 1
 )
 select c.d,coalesce(e.amt,0)::text,
   case when p_category_id is not null or p_merchant is not null then null
     else coalesce(i.amt,0)::text end,
   b.resolved_twd_minor::text,b.budget_currency,b.budget_minor::text,
   case when first_date is null or first_date >= (c.d+interval '1 month')::date
     then 'unknown'
     when first_date>c.d then 'partial-start'
     else 'recorded' end,
   coalesce(e.n,0)::bigint
 from calendar c
 left join expenses e on e.d=c.d
 left join income i on i.d=c.d
 left join public.finance_monthly_budgets b on b.user_id=u and b.month_start=c.d
 order by c.d;
end $$;

-- Drilldown only, bounded page. Original transaction amounts are unchanged.
create function public.finance_analytics_expenses(
 p_from date,p_to date,p_account_id uuid default null,
 p_category_id uuid default null,p_merchant text default null,
 p_limit integer default 20,p_offset integer default 0
) returns table(
 transaction_id uuid,txn_date date,amount_minor text,merchant text,
 normalized_merchant text,category_id uuid,source_account_id uuid
) language plpgsql security invoker set search_path='' as $$
declare u uuid:=auth.uid();
begin
 if u is null then raise exception 'Authentication required' using errcode='28000'; end if;
 if p_from is null or p_to is null or p_from>p_to or p_to-p_from>730
   or p_limit is null or p_limit not between 1 and 100 or
   p_offset is null or p_offset<0 or
   length(coalesce(p_merchant,''))>200
 then raise exception 'Invalid expenses page' using errcode='22023'; end if;
 if p_account_id is not null and not exists(select 1 from public.finance_accounts
   where user_id=u and id=p_account_id)
 then raise exception 'Account not owned' using errcode='42501'; end if;
 if p_category_id is not null and not exists(select 1 from public.finance_categories
   where user_id=u and id=p_category_id)
 then raise exception 'Category not owned' using errcode='42501'; end if;
 return query
 select t.id,t.txn_date,t.amount_minor::text,t.merchant,
   public.finance_analytics_merchant(t.merchant),t.category_id,t.source_account_id
 from public.finance_transactions t
 where t.user_id=u and t.voided_at is null and t.kind='expense'
   and t.txn_date between p_from and p_to
   and (p_account_id is null or t.source_account_id=p_account_id)
   and (p_category_id is null or t.category_id=p_category_id)
   and (p_merchant is null or public.finance_analytics_merchant(t.merchant)=p_merchant)
 order by t.txn_date desc,t.created_at desc,t.id desc
 limit p_limit offset p_offset;
end $$;

revoke all on function public.finance_analytics_overview(date,date,uuid,uuid,text) from public,anon;
revoke all on function public.finance_analytics_months(date,integer,uuid,uuid,text) from public,anon;
revoke all on function public.finance_analytics_expenses(date,date,uuid,uuid,text,integer,integer) from public,anon;
grant execute on function public.finance_analytics_overview(date,date,uuid,uuid,text) to authenticated;
grant execute on function public.finance_analytics_months(date,integer,uuid,uuid,text) to authenticated;
grant execute on function public.finance_analytics_expenses(date,date,uuid,uuid,text,integer,integer) to authenticated;
commit;
