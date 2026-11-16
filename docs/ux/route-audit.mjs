// Real-browser route audit: screenshots + programmatic checks for every static route at 5 widths.
// Usage: node docs/ux/route-audit.mjs [baseURL] [outDir] [theme: light|dark]
// Requires a running app and Google Chrome (playwright channel "chrome"). Data-dependent content is empty without Supabase.
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';

const base = process.argv[2] ?? 'http://localhost:3100';
const out = process.argv[3] ?? 'docs/ux/screenshots';
const theme = process.argv[4] ?? 'light';
mkdirSync(out, { recursive: true });
const routes = ['/', '/study-now', '/learning', '/python-lab', '/roadmap', '/internship-sprint', '/job-preparation', '/finance', '/life-vision',
  '/bhagavad-gita', '/files', '/inbox', '/progress', '/settings', '/login', '/ideas', '/today-learning', '/roadmap/cv-interview', '/roadmap/rag-interview',
  '/roadmap/production-ai', '/roadmap/agent-reliability', '/roadmap/evidenceops-from-zero', '/job-preparation/ase-day-1', '/job-preparation/ase-day-2',
  '/job-preparation/ase-final-interview-bank', '/job-preparation/ase-archive', '/roadmap/python/1', '/roadmap/numpy/1', '/roadmap/pandas/1', '/roadmap/python-interviews/1'];
const widths = [320, 375, 430, 768, 1440];
const browser = await chromium.launch({ channel: 'chrome' });
const report = [];
for (const w of widths) {
  const ctx = await browser.newContext({ viewport: { width: w, height: w >= 768 ? 900 : 800 }, reducedMotion: 'reduce' });
  await ctx.addInitScript((t) => { try { localStorage.setItem('theme', t); } catch {} }, theme);
  const page = await ctx.newPage();
  for (const r of routes) {
    const rec = { route: r, width: w, theme };
    try {
      const resp = await page.goto(base + r, { waitUntil: 'networkidle', timeout: 45000 });
      rec.status = resp?.status();
      await page.waitForTimeout(400);
      Object.assign(rec, await page.evaluate(() => {
        const de = document.documentElement;
        const bodyBg = getComputedStyle(document.body).backgroundColor;
        const h1 = [...document.querySelectorAll('h1')].length;
        const small = [...document.querySelectorAll('body *')].filter((el) => {
          if (!el.childNodes.length || ![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) return false;
          const fs = parseFloat(getComputedStyle(el).fontSize); const vis = el.offsetParent !== null;
          return vis && fs < 12;
        }).length;
        const smallTargets = [...document.querySelectorAll('a[href],button,input,select,textarea,summary')].filter((el) => {
          const b = el.getBoundingClientRect(); const cs = getComputedStyle(el);
          return b.width > 0 && b.height > 0 && cs.visibility !== 'hidden' && (b.width < 24 || b.height < 24) && !(el.tagName === 'A' && getComputedStyle(el).display === 'inline');
        }).length;
        const white = [...document.querySelectorAll('main *, aside *')].filter((el) => getComputedStyle(el).backgroundColor === 'rgb(255, 255, 255)').length;
        return { overflowX: de.scrollWidth > de.clientWidth + 1, scrollW: de.scrollWidth, clientW: de.clientWidth, bodyBg, h1, textUnder12px: small, targetsUnder24px: smallTargets, pureWhiteBgEls: white };
      }));
      await page.screenshot({ path: `${out}/${theme}-${w}${r.replace(/\//g, '_') || '_home'}.png`, fullPage: false });
    } catch (e) { rec.error = String(e).slice(0, 160); }
    report.push(rec);
  }
  await ctx.close();
}
await browser.close();
writeFileSync(`${out}/audit-${theme}.json`, JSON.stringify(report, null, 1));
const bad = report.filter((x) => x.error || x.overflowX || x.status >= 400);
console.log('checked', report.length, 'page-views;', bad.length, 'with overflow/errors');
for (const b of bad.slice(0, 40)) console.log(JSON.stringify({ route: b.route, w: b.width, overflowX: b.overflowX, scrollW: b.scrollW, status: b.status, error: b.error }));
