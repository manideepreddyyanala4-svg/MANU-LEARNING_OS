// axe-core accessibility scan of every static route (WCAG 2.0/2.1/2.2 A+AA tags) in the real browser.
// axe-core is NOT a project dependency: pass its path, e.g. node docs/ux/axe-audit.mjs http://localhost:3100 out light /path/to/axe.min.js
import { chromium } from '@playwright/test';
import { writeFileSync, mkdirSync } from 'node:fs';
const [base = 'http://localhost:3100', out = 'docs/ux/screenshots', theme = 'light', axePath] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const routes = ['/', '/study-now', '/learning', '/python-lab', '/roadmap', '/internship-sprint', '/job-preparation', '/finance', '/life-vision', '/bhagavad-gita', '/files', '/inbox', '/progress', '/settings', '/login', '/ideas', '/today-learning', '/roadmap/cv-interview', '/roadmap/rag-interview', '/roadmap/production-ai', '/roadmap/agent-reliability', '/roadmap/evidenceops-from-zero', '/job-preparation/ase-day-1', '/job-preparation/ase-day-2', '/job-preparation/ase-final-interview-bank', '/job-preparation/ase-archive', '/roadmap/python/1', '/roadmap/numpy/1', '/roadmap/pandas/1', '/roadmap/python-interviews/1'];
const browser = await chromium.launch({ channel: 'chrome' });
const res = [];
for (const [w, h] of [[1440, 900], [375, 800]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
  await ctx.addInitScript((t) => { try { localStorage.setItem('theme', t); } catch {} }, theme);
  const page = await ctx.newPage();
  for (const r of routes) {
    try {
      await page.goto(base + r, { waitUntil: 'networkidle', timeout: 45000 });
      await page.waitForTimeout(1200);
      await page.addScriptTag({ path: axePath });
      const v = await page.evaluate(async () => {
        const r = await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] } });
        return r.violations.map((x) => ({ id: x.id, impact: x.impact, n: x.nodes.length, sample: x.nodes.slice(0, 2).map((n) => n.target.join(' ') + ' :: ' + (n.failureSummary || '').split('\n').slice(1, 2).join(' ').slice(0, 140)) }));
      });
      res.push({ route: r, width: w, theme, violations: v });
    } catch (e) { res.push({ route: r, width: w, theme, error: String(e).slice(0, 120) }); }
  }
  await ctx.close();
}
await browser.close();
writeFileSync(`${out}/axe-${theme}.json`, JSON.stringify(res, null, 1));
const agg = {};
for (const r of res) for (const v of r.violations ?? []) { const k = v.id + ' (' + v.impact + ')'; agg[k] ??= { nodes: 0, routes: new Set() }; agg[k].nodes += v.n; agg[k].routes.add(r.route); }
console.log(`scanned ${res.length} page-views, errors: ${res.filter((r) => r.error).length}`);
for (const [k, v] of Object.entries(agg).sort((a, b) => b[1].nodes - a[1].nodes)) console.log(k.padEnd(40), 'nodes', v.nodes, 'routes', v.routes.size);
