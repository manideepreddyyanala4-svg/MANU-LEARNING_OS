// Production checks that need NO credentials:
//  (a) real-browser check of the live /login page in light and dark at 5 widths (overflow, console errors, theme, axe),
//  (b) every app route redirects an anonymous visitor to /login (auth wall),
//  (c) anonymous (no session) reads of user tables via the public Supabase client config must return no rows (RLS).
// The public Supabase URL and publishable key are read from the site's own JavaScript (they are public by design) and are NEVER printed.
// Usage: node docs/ux/production-check.mjs [siteURL] [axe.min.js]
import { chromium } from '@playwright/test';
const site = process.argv[2] ?? 'https://manu-learning-os.vercel.app'; const axePath = process.argv[3];
const out = []; const rec = (n, ok, d = '') => { out.push(ok); console.log((ok ? 'PASS ' : ok === null ? 'INFO ' : 'FAIL ') + n + (d ? ' — ' + d : '')); };
const browser = await chromium.launch({ channel: 'chrome' });
for (const theme of ['light', 'dark']) for (const w of [320, 375, 430, 768, 1440]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce' });
  await ctx.addInitScript((t) => { try { localStorage.setItem('theme', t); } catch {} }, theme);
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 120))); p.on('console', (m) => { if (m.type() === 'error' && !/favicon|404/.test(m.text())) errs.push(m.text().slice(0, 120)); });
  await p.goto(site + '/login', { waitUntil: 'networkidle' }); await p.waitForTimeout(1200);
  const m = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, bg: getComputedStyle(document.body).backgroundColor, h: document.querySelector('h1,h2')?.textContent?.slice(0, 40), dark: document.documentElement.classList.contains('dark') }));
  let ax = 'n/a'; if (axePath) { await p.addScriptTag({ path: axePath }); ax = await p.evaluate(async () => (await axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] })).violations.map((v) => v.id + ':' + v.nodes.length).join(',') || 'none'); }
  const bgOk = theme === 'light' ? m.bg === 'rgb(245, 241, 232)' : m.bg === 'rgb(30, 35, 35)';
  rec(`/login ${theme} ${w}px`, bgOk && m.sw <= m.cw + 1 && errs.length === 0 && (ax === 'none' || ax === 'n/a') && m.dark === (theme === 'dark'), `bg ${m.bg}, overflow ${m.sw}/${m.cw}, axe ${ax}${errs.length ? ', errors ' + errs.join('|') : ''}`);
  await ctx.close();
}
const routes = ['/', '/study-now', '/learning', '/python-lab', '/roadmap', '/internship-sprint', '/job-preparation', '/finance', '/life-vision', '/bhagavad-gita', '/files', '/inbox', '/progress', '/settings', '/ideas', '/today-learning'];
const ctx = await browser.newContext(); const page = await ctx.newPage(); let walled = 0; const bad = [];
for (const r of routes) { await page.goto(site + r, { waitUntil: 'domcontentloaded' }); if (/\/login/.test(page.url())) walled++; else bad.push(r); }
rec(`Auth wall: ${walled}/${routes.length} app routes redirect an anonymous visitor to /login`, bad.length === 0, bad.join(','));
// public client config from the site's own JS (not printed)
const html = await (await fetch(site + '/login')).text(); const chunks = [...new Set([...html.matchAll(/\/_next\/static\/[^"']+\.js/g)].map((x) => x[0]))];
let url = '', key = '';
for (const c of chunks) { const js = await (await fetch(site + c)).text(); const u = js.match(/https:\/\/[a-z0-9]+\.supabase\.co/); const k = js.match(/sb_publishable_[A-Za-z0-9_-]+|eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/); if (u) url = u[0]; if (k) key = k[0]; if (url && key) break; }
rec('Production uses a hosted Supabase project (public client config found in the bundle)', !!(url && key), url ? 'host: ' + new URL(url).hostname.replace(/^[a-z0-9]{6}/, '••••••') : 'not found');
if (url && key) {
  for (const t of ['curriculum_lessons', 'roadmap_items', 'subjects', 'topics', 'topic_documents', 'app_settings', 'activity_events']) {
    const r = await fetch(`${url}/rest/v1/${t}?select=*&limit=3`, { headers: { apikey: key, Authorization: 'Bearer ' + key } });
    const body = await r.text(); let n = -1; try { const j = JSON.parse(body); n = Array.isArray(j) ? j.length : -1; } catch {}
    rec(`Anonymous read of "${t}" returns no rows (RLS)`, r.status === 200 ? n === 0 : [401, 403, 404].includes(r.status), `HTTP ${r.status}, rows ${n}`);
  }
}
await browser.close();
console.log(`\n${out.filter((x) => x === true).length}/${out.filter((x) => x !== null).length} passed`); process.exit(out.every((x) => x !== false) ? 0 : 1);
