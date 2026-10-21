import {defineConfig,devices} from '@playwright/test';
import {readFileSync,existsSync} from 'node:fs';

if (existsSync('.env.local')) {
  for (const line of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

const baseURL=process.env.MANU_BASE_URL??'http://localhost:3000';
export default defineConfig({testDir:'./tests',use:{baseURL,trace:'on-first-retry'},webServer:{command:`./node_modules/.bin/next dev --port ${new URL(baseURL).port || '3000'}`,url:`${baseURL}/login`,reuseExistingServer:true},projects:[
{name:'desktop-chromium',use:{...devices['Desktop Chrome'],viewport:{width:1440,height:900}}},
{name:'tablet-chromium',use:{...devices['Desktop Chrome'],viewport:{width:768,height:1024}}},
{name:'desktop-webkit',use:{...devices['Desktop Safari'],viewport:{width:1024,height:768}}},
{name:'mobile-chrome',use:{...devices['Pixel 7'],viewport:{width:390,height:844}}},
{name:'mobile-safari',use:{...devices['iPhone 13'],viewport:{width:390,height:844}}},
]});
