import {test,expect} from '@playwright/test';
test('home and roadmap render',async({page})=>{await page.goto('/');await expect(page.getByText('Good morning, learner.')).toBeVisible();await page.goto('/roadmap');await expect(page.getByText('Kernel')).toBeVisible();await expect(page.getByText('Convolution')).toBeVisible()});
test('navigation routes work',async({page})=>{for(const route of ['/learning','/inbox','/progress','/settings','/login']){await page.goto(route);await expect(page).toHaveURL(new RegExp(route.replace('/','\\/')))}});
