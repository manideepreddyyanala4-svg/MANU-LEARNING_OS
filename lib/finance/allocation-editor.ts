import { allocatePurchase, assertISODate, shiftCalendarDay } from './allocations';
import { minorBigInt, parseMoney } from './money';
import type { DailyAllocation, GroceryRule, MoneyMinor } from './types';

export type AllocationMode='single'|'whole'|'items';
export type AllocationItemDraft={
  id:string; name:string; amount:string; startDate:string; duration:string;
};
export type PurchaseAllocationDraft={
  mode:AllocationMode;
  amountInput:string;
  purchaseDate:string;
  startDate:string;
  duration:string;
  items:AllocationItemDraft[];
};

export const MAX_PURCHASE_DAYS=365;

/** Validate once, before presenting a preview and again before persisting.
 * The exact same integer-cent allocation algorithm is used by the SQL ledger.
 */
export function allocationRulesForDraft(draft:PurchaseAllocationDraft):GroceryRule[] {
  assertISODate(draft.purchaseDate);
  const amountMinor=parseMoney(draft.amountInput);
  if(minorBigInt(amountMinor)<=BigInt(0))throw new Error('Enter a purchase amount greater than zero');
  if(draft.mode==='single')return [];
  if(draft.mode==='whole'){
    assertISODate(draft.startDate);
    const days=validDays(draft.duration);
    return [{amountMinor,startDate:draft.startDate,durationDays:days}];
  }
  if(draft.mode!=='items')throw new Error('Invalid allocation mode');
  if(draft.items.length<1||draft.items.length>100)throw new Error('Add between 1 and 100 basket items');
  let sum=BigInt(0);
  const rules=draft.items.map((item,i)=>{
    if(!item.name.trim()||item.name.trim().length>200)
      throw new Error('Enter a name for item '+(i+1));
    assertISODate(item.startDate);
    const durationDays=validDays(item.duration);
    const itemAmount=parseMoney(item.amount);
    const cents=minorBigInt(itemAmount);
    if(cents<=BigInt(0))throw new Error('Item '+(i+1)+' must have a positive amount');
    sum+=cents;
    return {itemName:item.name.trim(),amountMinor:itemAmount,startDate:item.startDate,durationDays};
  });
  if(sum!==minorBigInt(amountMinor))throw new Error(
    'Basket items must total the exact paid amount, including cents.'
  );
  return rules;
}
function validDays(raw:string):number {
  if(!/^[1-9]\d{0,2}$/.test(raw.trim()))
    throw new Error('Enter a whole number of days from 1 to '+MAX_PURCHASE_DAYS);
  const count=Number(raw);
  if(count<1||count>MAX_PURCHASE_DAYS)
    throw new Error('Duration must be between 1 and '+MAX_PURCHASE_DAYS+' days');
  return count;
}

export function purchasePreview(draft:PurchaseAllocationDraft):{
  totalMinor:MoneyMinor;
  rules:GroceryRule[];
  daily:DailyAllocation[];
  lastDate:string;
}{
  const totalMinor=parseMoney(draft.amountInput);
  const rules=allocationRulesForDraft(draft);
  const daily=allocatePurchase('preview',totalMinor,draft.purchaseDate,rules);
  const total=daily.reduce((sum,day)=>sum+minorBigInt(day.amountMinor),BigInt(0));
  if(total!==minorBigInt(totalMinor))throw new Error('Allocated cost does not equal purchase amount');
  let lastDate=draft.purchaseDate;
  for(const rule of rules){
    const end=shiftCalendarDay(rule.startDate,rule.durationDays-1);
    if(end>lastDate)lastDate=end;
  }
  return {totalMinor,rules,daily,lastDate};
}

/** Owner-authenticated saved definitions from finance_allocation_details. */
export function draftFromSavedRules(
  amountMinor:MoneyMinor,purchaseDate:string,
  rules:{itemName:string;amountMinor:MoneyMinor;startDate:string;durationDays:number}[]
):Pick<PurchaseAllocationDraft,'mode'|'startDate'|'duration'|'items'> {
  assertISODate(purchaseDate);
  if(rules.length===0)return {mode:'single',startDate:purchaseDate,duration:'3',items:[]};
  if(rules.length===1&&!rules[0].itemName.trim()&&minorBigInt(rules[0].amountMinor)===minorBigInt(amountMinor)){
    return {mode:'whole',startDate:rules[0].startDate,duration:String(rules[0].durationDays),items:[]};
  }
  return {
    mode:'items',startDate:purchaseDate,duration:'3',
    items:rules.map((r,i)=>({
      id:'saved-'+i,name:r.itemName,amount:minorAsDecimal(r.amountMinor),
      startDate:r.startDate,duration:String(r.durationDays)
    }))
  };
}
function minorAsDecimal(value:MoneyMinor):string {
  const n=minorBigInt(value),abs=n<BigInt(0)?-n:n;
  return (n<BigInt(0)?'-':'')+(abs/BigInt(100)).toString()+'.'+
    (abs%BigInt(100)).toString().padStart(2,'0');
}

export function aggregateDailyCost(days:DailyAllocation[]):{
 date:string;amountMinor:MoneyMinor;items:DailyAllocation[]
}[]{
  const lookup=new Map<string,DailyAllocation[]>();
  for(const d of days){
    const items=lookup.get(d.date)??[];
    items.push(d);lookup.set(d.date,items);
  }
  return Array.from(lookup.entries()).sort(([a],[b])=>a.localeCompare(b))
    .map(([date,items])=>({
      date,items,amountMinor:items.reduce((n,d)=>n+minorBigInt(d.amountMinor),BigInt(0)).toString()
    }));
}
