import { createClient } from '@supabase/supabase-js';
import { randomBytes, randomUUID } from 'node:crypto';
import { writeFileSync } from 'node:fs';

// Creates disposable identities ONLY inside the Supabase CLI loopback stack.
// Deliberately cannot run against a hosted Supabase URL.
const api=process.env.API_URL ?? '';
const service=process.env.SERVICE_ROLE_KEY ?? '';
const anon=process.env.ANON_KEY ?? '';
const output=process.env.MANU_TEST_ENV_FILE ?? '';
if(!/^http:\/\/(127\.0\.0\.1|localhost):[0-9]+$/.test(api) ||
   !service || !anon || !output ||
   process.env.MANU_FINANCE_ISOLATED_DB!=='1') {
  throw new Error('Refusing fixture creation outside explicit localhost-only Supabase CI');
}
const admin=createClient(api,service,{auth:{autoRefreshToken:false,persistSession:false}});
const users={};
for(const kind of ['ledger','isolation','browser']){
  const email=`manuos-finance-ci-${kind}-${randomUUID()}@example.test`;
  const password='CI-'+randomBytes(24).toString('hex')+'aA!';
  const {data,error}=await admin.auth.admin.createUser({
    email,password,email_confirm:true,user_metadata:{label:'disposable-ci-'+kind}
  });
  if(error||!data?.user?.id)throw new Error('Could not create disposable local auth user: '+(error?.message??'unknown'));
  users[kind]={email,password,id:data.user.id};
}
const env={
 MANU_FINANCE_ISOLATED_DB:'1',
 MANU_FINANCE_TEST_READY:'1',
 MANU_FINANCE_TEST_URL:api,
 MANU_FINANCE_TEST_ANON_KEY:anon,
 MANU_FINANCE_TEST_EMAIL:users.ledger.email,
 MANU_FINANCE_TEST_PASSWORD:users.ledger.password,
 MANU_FINANCE_OTHER_EMAIL:users.isolation.email,
 MANU_FINANCE_OTHER_PASSWORD:users.isolation.password,
 MANU_FINANCE_UI_EMAIL:users.browser.email,
 MANU_FINANCE_UI_PASSWORD:users.browser.password,
 NEXT_PUBLIC_SUPABASE_URL:api,
 NEXT_PUBLIC_SUPABASE_ANON_KEY:anon
};
// File stays on the ephemeral CI runner, not uploaded as an Actions artifact.
function shQuote(s){return "'"+String(s).replaceAll("'","'\\''")+"'";}
writeFileSync(output,Object.entries(env).map(([key,value])=>`export ${key}=${shQuote(value)}`).join('\n')+'\n',{mode:0o600});
console.log('Prepared 3 local-only Supabase identities for integration tests');
