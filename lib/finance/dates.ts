import { assertISODate } from './allocations';

/** Use Taiwan calendar day, independent of browser locale or device timezone. */
export function todayInTaipei(now:Date=new Date()):string {
  const parts=new Intl.DateTimeFormat('en-US',{
    timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'
  }).formatToParts(now);
  const value=(kind:string)=>parts.find(p=>p.type===kind)?.value;
  const result=[value('year'),value('month'),value('day')].join('-');
  assertISODate(result);
  return result;
}

export function formatFinanceDate(date:string):string {
  assertISODate(date);
  return new Intl.DateTimeFormat('en-US',{
    month:'short',day:'numeric',year:'numeric',timeZone:'UTC'
  }).format(new Date(date+'T12:00:00Z'));
}

export function formatFinanceTimestamp(timestamp:string|null):string {
  if(!timestamp)return 'No recorded activity';
  const parsed=new Date(timestamp);
  if(Number.isNaN(parsed.getTime()))return 'Date unavailable';
  return new Intl.DateTimeFormat('en-US',{
    month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit',
    timeZone:'Asia/Taipei',hour12:true
  }).format(parsed)+' (Taipei)';
}
