/** Persist only the digest of an unconfirmed transaction form and its UUID.
 * Never store amounts, account IDs or merchant text in browser storage.
 * A retry with the same signed user intent gets the same operation UUID,
 * even if a mobile browser refreshes after the database succeeded but the
 * response was lost. Only a confirmed server success clears the key.
 */
const KEY='manuos.finance.unconfirmedOperation.v1';
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
export async function persistentFinanceOperationKey(fingerprint:string,scope='transaction'):Promise<string>{
 const hash=await fingerprintHash(fingerprint);
 const store=readStorage(),storeKey=KEY+'.'+scope;
 try{
   const raw=store?.getItem(storeKey);
   if(raw){
     const old=JSON.parse(raw) as {digest?:string;key?:string};
     if(old.digest===hash&&old.key&&/^[0-9a-f-]{36}$/i.test(old.key))
       return old.key;
   }
 }catch{ /* Session storage may be disabled; database still enforces explicit UUID. */ }
 const key=crypto.randomUUID();
 try{store?.setItem(storeKey,JSON.stringify({digest:hash,key}));}catch{}
 return key;
}
export async function clearConfirmedFinanceOperation(fingerprint:string,scope='transaction'):Promise<void>{
 const hash=await fingerprintHash(fingerprint);
 try{
   const store=readStorage(),storeKey=KEY+'.'+scope,raw=store?.getItem(storeKey);
   if(raw&&(JSON.parse(raw) as {digest?:string}).digest===hash)
     store?.removeItem(storeKey);
 }catch{}
}
