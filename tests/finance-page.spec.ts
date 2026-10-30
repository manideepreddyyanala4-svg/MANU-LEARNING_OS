import { test, expect } from '@playwright/test';

test('Finance is a native ManuOS page and never invents balances when unconfigured',async({page})=>{
  test.skip(Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),'Unconfigured-only smoke test');
  await page.goto('/finance');
  await expect(page.getByRole('heading',{name:'Your money, clearly.'})).toBeVisible();
  await expect(page.getByRole('heading',{name:'Finance is not available yet'})).toBeVisible();
  await expect(page.getByText('No placeholder money is shown.')).toBeVisible();
  const overflows=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
  expect(overflows).toBe(false);
});

test('Finance entry is available in the desktop sidebar and mobile drawer',async({page},testInfo)=>{
  test.skip(Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),'Unconfigured-only navigation test');
  await page.goto('/');
  if(testInfo.project.name==='mobile-chrome'){
    // Wait for client hydration; a server-rendered button can receive a click
    // before its React handler is attached during CI cold startup.
    await page.waitForLoadState('networkidle');
    const open=page.getByRole('button',{name:'Open menu'});
    await expect(open).toBeVisible();
    await open.click();
    const dialog=page.getByRole('dialog',{name:'Navigation menu'});
    await expect(dialog).toBeVisible({timeout:10000});
    await expect(dialog.getByRole('link',{name:'Finance'})).toBeVisible();
  }else{
    await expect(page.getByRole('navigation').getByRole('link',{name:'Finance'}).first()).toBeVisible();
  }
});
