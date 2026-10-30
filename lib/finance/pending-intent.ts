/** Preserve pending operation UUIDs for several distinct payment intents per browser
 * session. A single-slot store lost the first UUID whenever a different form
 * was saved before an uncertain first network response was resolved.
 * Only SHA256 digests and random operation UUIDs are stored, not financial text.
 * This is a retry aid; server-side operation UUID uniqueness remains mandatory.
 */
const KEY='manuos.finance.unconfirmedOperation.v1';
const MAX_PENDING=32;
const MAX_AGE_MS=7*24*60*60*1000;
type PendingRecord={digest:string;key:string;createdAt:number};
type StoredPending={entries:PendingRecord[]};
function readStorage():Storage|null{
 try{return typeof window==='undefined'?null:window.sessionStorage;}
 catch{return null;}
}
async function fingerprintHash(fingerprint:string):Promise<string>{
 if(typeof crypto==='undefined'||!crypto.subtle)throw new Error(
   'Secure retry verification unavailable. Do not resubmit; refresh your history first.');
 const bytes=new TextEncoder().encode(fingerprint);
 const digest=await crypto.subtle.digest('SHA-256',bytes);
 return Array.from(new Uint8Array(digest)).map(v=>v.toString(16).padStart(2,'0')).join('');
}
function validKey(s:unknown):s is string{
 return typeof s==='string'&&
   /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}
function readEntries(store:Storage|null,scope:string):PendingRecord[]{
 if(!store)return [];
 try{
   const raw=store.getItem(KEY+'.'+scope);
   if(!raw)return [];
   const parsed=JSON.parse(raw) as StoredPending & Partial<PendingRecord>;
   const now=Date.now();
   const rows=Array.isArray(parsed.entries)?parsed.entries:
     // Migrate the Phase 9 one-slot format without losing its operation UUID.
     parsed.digest&&parsed.key?[{digest:parsed.digest,key:parsed.key,createdAt:now}]:[];
   return rows.filter((p):p is PendingRecord=>
     typeof p.digest==='string'&&/^[a-f0-9]{64}$/.test(p.digest)&&
     validKey(p.key)&&Number.isSafeInteger(p.createdAt)&&
     p.createdAt<=now&&p.createdAt>now-MAX_AGE_MS).slice(-MAX_PENDING);
 }catch{return [];}
}
function writeEntries(store:Storage|null,scope:string,rows:PendingRecord[]):void{
 try{
   if(rows.length)store?.setItem(KEY+'.'+scope,
     JSON.stringify({entries:rows.slice(-MAX_PENDING)}));
   else store?.removeItem(KEY+'.'+scope);
 }catch{ /* Storage may be disabled. Never report ledger success or failure from this. */ }
}
export async function persistentFinanceOperationKey(fingerprint:string,scope='transaction'):Promise<string>{
 const hash=await fingerprintHash(fingerprint),store=readStorage();
 const rows=readEntries(store,scope);
 const existing=rows.find(x=>x.digest===hash);
 if(existing)return existing.key;
 const key=crypto.randomUUID();
 // The oldest pending unknown response may become unprovable after 32 distinct
 // intents; users must check transaction history before retrying old payments.
 writeEntries(store,scope,[...rows,{digest:hash,key,createdAt:Date.now()}]);
 return key;
}
export async function clearConfirmedFinanceOperation(fingerprint:string,scope='transaction'):Promise<void>{
 const hash=await fingerprintHash(fingerprint),store=readStorage();
 const rows=readEntries(store,scope);
 writeEntries(store,scope,rows.filter(x=>x.digest!==hash));
}
