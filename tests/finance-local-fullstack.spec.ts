import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';

const loopback=Boolean(
  process.env.MANU_FINANCE_ISOLATED_DB==='1' &&
  process.env.MANU_FINANCE_TEST_READY==='1' &&
  /^http:\/\/(127\.0\.0\.1|localhost):[0-9]+$/.test(process.env.MANU_FINANCE_TEST_URL??'') &&
  process.env.MANU_FINANCE_UI_EMAIL && process.env.MANU_FINANCE_UI_PASSWORD
);
test.describe('Finance free local Supabase Auth + browser release smoke',()=>{
 test.skip(!loopback,'Only runs against disposable localhost Supabase');
 test('real browser sign-in, first-time account bootstrap, navigation and reload',async({page})=>{
   test.setTimeout(120_000);
   await page.goto('/login?next=/finance');
   await page.getByLabel('Email address').fill(process.env.MANU_FINANCE_UI_EMAIL!);
   await page.getByLabel('Password').fill(process.env.MANU_FINANCE_UI_PASSWORD!);
   await page.getByRole('button',{name:'Continue'}).click();
   await expect(page).toHaveURL(/\/finance(?:[#?].*)?$/,{timeout:45_000});
   await expect(page.getByRole('heading',{name:'Your money, clearly.'})).toBeVisible();
   const nav=page.getByRole('navigation',{name:'Finance sections'});
   await expect(nav.getByRole('button',{name:'Accounts'})).toBeVisible();
   await expect(page.getByText('Post Bank (Chunghwa Post)').first()).toBeVisible({timeout:40_000});
   await expect(page.getByText('CTBC Bank (China Trust)').first()).toBeVisible();
   await expect(page.getByText('Cash Wallet').first()).toBeVisible();
   for(const section of ['Transactions','Budget','Calendar','Analytics','Data & backups','Overview']){
     await nav.getByRole('button',{name:section,exact:true}).click();
     await expect(nav.getByRole('button',{name:section,exact:true})).toHaveAttribute('aria-current','page');
   }
   await page.reload();
   await expect(page.getByRole('heading',{name:'Your money, clearly.'})).toBeVisible({timeout:45_000});
   await expect(page.getByText('Post Bank (Chunghwa Post)').first()).toBeVisible({timeout:40_000});
   await expect(page.locator('body')).not.toContainText('Workspace initialization failed');
 });
 test('independent signed-in owner cannot read or post against another owner',async()=>{
   test.setTimeout(60_000);
   const api=process.env.MANU_FINANCE_TEST_URL!;
   const anon=process.env.MANU_FINANCE_TEST_ANON_KEY!;
   const first=createClient(api,anon);
   const other=createClient(api,anon);
   const a=await first.auth.signInWithPassword({
     email:process.env.MANU_FINANCE_TEST_EMAIL!,
     password:process.env.MANU_FINANCE_TEST_PASSWORD!
   });
   const b=await other.auth.signInWithPassword({
     email:process.env.MANU_FINANCE_OTHER_EMAIL!,
     password:process.env.MANU_FINANCE_OTHER_PASSWORD!
   });
   expect(a.error).toBeNull();expect(b.error).toBeNull();
   expect(a.data.user?.id).not.toEqual(b.data.user?.id);
   const setup=await first.rpc('finance_bootstrap');
   const setupOther=await other.rpc('finance_bootstrap');
   expect(setup.error).toBeNull();expect(setupOther.error).toBeNull();
   const owned=await first.from('finance_accounts').select('id,user_id').limit(1);
   expect(owned.error).toBeNull();
   const foreignId=owned.data?.[0]?.id;
   expect(foreignId).toBeTruthy();
   const read=await other.from('finance_accounts').select('id').eq('id',foreignId);
   expect(read.error).toBeNull();
   expect(read.data).toEqual([]);
   const illegal=await other.rpc('finance_put_transaction',{
     p_operation_key:randomUUID(),p_kind:'expense',p_amount_minor:'100',
     p_txn_date:'2026-10-30',p_source_account_id:foreignId
   });
   expect(illegal.error).not.toBeNull();
   await first.auth.signOut();await other.auth.signOut();
 });
});
