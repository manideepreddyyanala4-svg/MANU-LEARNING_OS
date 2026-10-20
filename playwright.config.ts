import {defineConfig,devices} from '@playwright/test';
export default defineConfig({testDir:'./tests',use:{baseURL:'http://localhost:3000',trace:'on-first-retry'},webServer:{command:'./node_modules/.bin/next dev',url:'http://localhost:3000/login',reuseExistingServer:true},projects:[
{name:'desktop-chromium',use:{...devices['Desktop Chrome'],viewport:{width:1440,height:900}}},
{name:'tablet-chromium',use:{...devices['Desktop Chrome'],viewport:{width:768,height:1024}}},
{name:'desktop-webkit',use:{...devices['Desktop Safari'],viewport:{width:1024,height:768}}},
{name:'mobile-chrome',use:{...devices['Pixel 7'],viewport:{width:390,height:844}}},
{name:'mobile-safari',use:{...devices['iPhone 13'],viewport:{width:390,height:844}}},
]});
