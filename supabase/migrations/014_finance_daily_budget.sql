-- Phase 5: bounded owner-scoped daily summaries; never mutate balances.
-- Apply only after isolated verification of migrations 009-013.
begin;

create function public.finance_daily_budget(p_month_start date)
returns table(day_date date,actual_expense_minor text,allocated_cost_minor text)
language plpgsql security invoker set search_path='' as $$
declare u uuid:=auth.uid(); next_month date; last_day date;
begin
  if u is null then raise exception 'Authentication required' using errcode='28000'; end if;
  if p_month_start is null or extract(day from p_month_start)<>1
    then raise exception 'Invalid month' using errcode='22023'; end if;
  next_month:=(p_month_start+interval '1 month')::date;
  last_day:=next_month-1;
  return query
  with calendar as (
    select g.day::date as d
      from pg_catalog.generate_series(p_month_start,last_day,'1 day'::interval) as g(day)
  ),
  actual as (
    select t.txn_date as d, sum(t.amount_minor::numeric) as amt
    from public.finance_transactions t
    where t.user_id=u and t.kind='expense' and t.voided_at is null
      and t.txn_date>=p_month_start and t.txn_date<next_month
    group by t.txn_date
  ),
  ordinary as (
    select t.txn_date as d, sum(t.amount_minor::numeric) as amt
    from public.finance_transactions t
    where t.user_id=u and t.kind='expense' and t.voided_at is null
      and t.txn_date>=p_month_start and t.txn_date<next_month
      and not exists(
        select 1 from public.finance_allocation_rules r
        where r.user_id=t.user_id and r.transaction_id=t.id
      )
    group by t.txn_date
  ),
  spread as (
    select c.d, sum(
      pg_catalog.trunc(r.amount_minor::numeric/r.duration_days,0) +
      case when (c.d-r.start_date) <
        pg_catalog.mod(r.amount_minor::numeric,r.duration_days::numeric)
      then 1 else 0 end
    ) as amt
    from calendar c
    join public.finance_allocation_rules r on r.user_id=u
      and r.start_date<=c.d
      and (r.start_date+r.duration_days)>c.d
    join public.finance_transactions t on t.id=r.transaction_id
      and t.user_id=u and t.kind='expense' and t.voided_at is null
    group by c.d
  )
  select c.d,coalesce(a.amt,0)::text,
    (coalesce(o.amt,0)+coalesce(s.amt,0))::text
  from calendar c
  left join actual a on a.d=c.d
  left join ordinary o on o.d=c.d
  left join spread s on s.d=c.d
  order by c.d;
end $$;

revoke all on function public.finance_daily_budget(date) from public,anon;
grant execute on function public.finance_daily_budget(date) to authenticated;

commit;
