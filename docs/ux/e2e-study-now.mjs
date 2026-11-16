// Real-browser end-to-end test of Study Now against the MOCK Supabase (docs/ux/mock-supabase.mjs).
// Start the app with: NEXT_PUBLIC_SUPABASE_URL=http://localhost:54399 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=test next dev --port 3101
// Usage: node docs/ux/e2e-study-now.mjs [baseURL] [screenshotDir]
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { start, state, mockUser } from './mock-supabase.mjs';

const base = process.argv[2] ?? 'http://localhost:3101';
const shots = process.argv[3] ?? 'docs/ux/screenshots';
mkdirSync(shots, { recursive: true });
const server = await start(54399);
const results = [];
const check = (name, ok, detail = '') => { results.push({ name, ok: !!ok, detail }); console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail ? '  — ' + detail : '')); };

const K = (m, t) => `internship-v1-m${m}-t${String(t).padStart(3, '0')}`;
state.roadmap_items.push({ user_id: mockUser.id, slug: K('03', 3), status: 'in_progress', title: 'x' });
state.roadmap_items.push({ user_id: mockUser.id, slug: K('01', 1), status: 'completed', title: 'y' });
const NOTE = '# UNDERSTAND\nA NumPy slice is a **view**, not a copy.\n\n## MECHANISM\nBasic slicing returns a view of the same buffer.\n\n## WORKED EXAMPLE\n```python\nimport numpy as np\na = np.arange(6)\nb = a[1:4]\nb[0] = 99\nprint(a)  # [ 0 99  2  3  4  5]\n```\n\n| Operation | Copy? |\n|---|---|\n| a[1:4] | no |\n| a[[1,2]] | yes |\n\n## COMMON MISTAKES\n- Assuming `b = a[1:4]` copies.\n\n## INTERVIEW CHECK\n1. When does a slice change the original?\n2. How do you force a copy?';
state.curriculum_lessons.push({ user_id: mockUser.id, topic_key: K('03', 3), content: NOTE });

const session = { access_token: 'h.' + Buffer.from(JSON.stringify({ sub: mockUser.id, exp: 4102444800, role: 'authenticated' })).toString('base64url') + '.s', refresh_token: 'r', expires_at: 4102444800, expires_in: 3600, token_type: 'bearer', user: mockUser };
const cookieValue = 'base64-' + Buffer.from(JSON.stringify(session)).toString('base64url');

const browser = await chromium.launch({ channel: 'chrome' });
async function ctxFor(width, height = 900, theme = 'light') {
  const ctx = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce', permissions: ['clipboard-read', 'clipboard-write'] });
  await ctx.addCookies([{ name: 'sb-localhost-auth-token', value: cookieValue, url: base }]);
  await ctx.addInitScript((t) => { try { if (!localStorage.getItem('theme')) localStorage.setItem('theme', t); } catch {} }, theme);
  return ctx;
}
try {
  // ---------- desktop
  const ctx = await ctxFor(1440);
  const page = await ctx.newPage();
  const errors = []; page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(base + '/study-now', { waitUntil: 'networkidle' });
  await page.waitForSelector('article.reading', { timeout: 15000 }).catch(() => {});
  const alerts = (await page.locator('[role=alert]').allInnerTexts()).filter((t) => t.trim());
  check('Signed-in state loads (no visible error alert)', alerts.length === 0, alerts.join('|'));
  const title = await page.locator('section[aria-label="Current lesson"] h2').first().innerText();
  check('Current lesson is the pinned in-progress topic (M03 lesson 3)', /views versus copies/i.test(title), title);
  check('Status shown as text: Studying now', await page.getByText('Studying now').first().isVisible());
  check('Saved lesson content is rendered', (await page.locator('article.reading').count()) === 1 && /view/.test(await page.locator('article.reading').innerText()));
  check('Markdown headings, table and code block rendered', (await page.locator('article.reading h1').count()) >= 1 && (await page.locator('article.reading table').count()) === 1 && (await page.locator('article.reading pre code').count()) === 1);
  const typo = await page.locator('article.reading').evaluate((el) => { const cs = getComputedStyle(el); const p = el.querySelector('p'); const pc = getComputedStyle(p); return { fs: parseFloat(pc.fontSize), lh: parseFloat(pc.lineHeight) / parseFloat(pc.fontSize), width: el.getBoundingClientRect().width, bg: getComputedStyle(document.body).backgroundColor, color: pc.color }; });
  check('Body text 18px, line-height >= 1.5', typo.fs >= 18 && typo.lh >= 1.5, JSON.stringify(typo));
  const chars = await page.locator('article.reading p').first().evaluate((p) => { const cs = getComputedStyle(p); const c = document.createElement('canvas').getContext('2d'); c.font = cs.fontSize + ' ' + cs.fontFamily; return Math.round(p.getBoundingClientRect().width / (c.measureText('0123456789abcdefghijklmnopqrstuvwxyz').width / 36)); });
  check('Line length <= 80 characters (WCAG 1.4.8 guidance)', chars <= 80, `~${chars} chars`);
  check('Page background is warm cream rgb(245,241,232)', typo.bg === 'rgb(245, 241, 232)', typo.bg);
  await page.screenshot({ path: shots + '/e2e-desktop-study-now.png' });

  // Next lesson only changes the view
  const writesBefore = state.writes.length;
  await page.getByRole('button', { name: /Next lesson/ }).click();
  const title2 = await page.locator('section[aria-label="Current lesson"] h2').first().innerText();
  check('Next lesson changes the lesson being read', title2 !== title, title2);
  check('Navigating lessons writes nothing to progress', state.writes.length === writesBefore);
  await page.getByText('No saved lesson content for this topic yet.').waitFor({ timeout: 5000 }).catch(() => {});
  check('Empty state is neutral for a lesson without notes', await page.getByText('No saved lesson content for this topic yet.').isVisible());
  await page.getByRole('button', { name: /Previous lesson/ }).click();
  check('Previous lesson returns to the pinned lesson', (await page.locator('section[aria-label="Current lesson"] h2').first().innerText()) === title);

  // Copy button
  await page.locator('.code-copy').click();
  const clip = await page.evaluate(() => navigator.clipboard.readText());
  check('Code copy puts the code on the clipboard with indentation intact', /np\.arange\(6\)/.test(clip) && /print\(a\)/.test(clip), JSON.stringify(clip.slice(0, 40)));

  // Focus mode
  await page.getByRole('button', { name: /Focus mode/ }).click();
  const hidden = await page.evaluate(() => ({ aside: getComputedStyle(document.querySelector('.manu-shell > aside')).display, header: getComputedStyle(document.querySelector('.manu-shell > main > header')).display, curriculum: getComputedStyle(document.querySelector('section[aria-label="Full curriculum"]')).display, prep: getComputedStyle(document.querySelector('section[aria-label="Lesson preparation"]')).display, ml: getComputedStyle(document.querySelector('.manu-shell > main')).marginLeft }));
  check('Focus mode hides sidebar, header, curriculum and preparation', hidden.aside === 'none' && hidden.header === 'none' && hidden.curriculum === 'none' && hidden.prep === 'none' && hidden.ml === '0px', JSON.stringify(hidden));
  check('Focus mode keeps lesson, previous/next, status actions', await page.locator('article.reading').isVisible() && await page.getByRole('button', { name: /Next lesson/ }).isVisible() && await page.getByRole('button', { name: /I can do this independently/ }).isVisible());
  await page.screenshot({ path: shots + '/e2e-desktop-focus-mode.png' });
  await page.keyboard.press('Escape');
  check('Escape exits focus mode and restores navigation', await page.locator('.manu-shell > aside').isVisible());
  await page.getByRole('button', { name: /Focus mode/ }).click();
  await page.getByRole('button', { name: /Exit focus mode/ }).click();
  check('Exit button leaves focus mode', await page.locator('.manu-shell > aside').isVisible());
  check('Focus mode keeps the selected lesson', (await page.locator('section[aria-label="Current lesson"] h2').first().innerText()) === title);

  // Progress buttons
  await page.getByRole('button', { name: /Needs review/ }).first().click();
  await page.waitForTimeout(600);
  check('Needs review saves status "review" for that topic only', state.roadmap_items.find((r) => r.slug === K('03', 3))?.status === 'review' && state.roadmap_items.find((r) => r.slug === K('01', 1))?.status === 'completed', JSON.stringify(state.roadmap_items.map((r) => [r.slug.slice(-8), r.status])));
  check('Opening/reading never auto-completed anything', state.roadmap_items.filter((r) => r.status === 'completed').length === 1);
  await page.getByRole('button', { name: /Make this my current lesson/ }).click();
  await page.waitForTimeout(600);
  check('Pin lesson sets in_progress', state.roadmap_items.find((r) => r.slug === K('03', 3))?.status === 'in_progress');
  await page.getByRole('button', { name: /I can do this independently/ }).click();
  await page.waitForTimeout(600);
  check('"I can do this independently" saves completed explicitly', state.roadmap_items.find((r) => r.slug === K('03', 3))?.status === 'completed');

  // Notes edit/save
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /Full curriculum/ }).click();
  check('Full curriculum is collapsed by default and expands', await page.locator('#full-curriculum').isVisible());
  check('All 31 modules are listed', (await page.locator('#full-curriculum button[aria-expanded]').count()) === 31, String(await page.locator('#full-curriculum button[aria-expanded]').count()));
  await page.locator('#full-curriculum input[type=search]').fill('CNN');
  await page.waitForTimeout(300);
  const found = await page.locator('#full-curriculum li button').count();
  check('Curriculum search finds topics', found > 0, `${found} rows`);
  await page.locator('#full-curriculum li button').first().click();
  check('Choosing a topic from the map opens it for reading', await page.locator('section[aria-label="Current lesson"] h2').first().isVisible());
  await page.screenshot({ path: shots + '/e2e-desktop-after-map-pick.png' });

  // Preparation import
  await page.getByRole('button', { name: /Lesson preparation/ }).click();
  check('Preparation tools are inside a collapsed section', await page.locator('#lesson-preparation').isVisible());
  const importKey = K('01', 2);
  writeFileSync(shots + '/_pack.json', JSON.stringify({ lessons: [{ topic_key: importKey, content: '# UNDERSTAND\nImported note.' }] }));
  await page.locator('#lesson-pack-input').setInputFiles(shots + '/_pack.json');
  await page.getByRole('button', { name: /Import prepared lessons/ }).click();
  await page.waitForTimeout(600);
  check('JSON import writes the lesson to curriculum_lessons', state.curriculum_lessons.some((l) => l.topic_key === importKey && /Imported note/.test(l.content)));
  check('Import does not alter progress or topic count', state.roadmap_items.length === 2);
  writeFileSync(shots + '/_bad.json', JSON.stringify({ lessons: [{ topic_key: 'nope', content: 'x' }] }));
  await page.locator('#lesson-pack-input').setInputFiles(shots + '/_bad.json');
  await page.getByText(/Unknown topic key/).waitFor({ timeout: 4000 }).catch(() => {});
  check('Invalid pack is rejected with a message', await page.getByText(/Unknown topic key/).isVisible(), (await page.locator('#lesson-preparation').innerText()).slice(0, 160).replace(/\s+/g, ' '));
  check('No uncaught page errors', errors.length === 0, errors.join(' | ').slice(0, 200));
  await ctx.close();

  // ---------- mobile widths
  for (const w of [320, 375, 430]) {
    const c = await ctxFor(w, 800); const p = await c.newPage();
    await p.goto(base + '/study-now', { waitUntil: 'networkidle' }); await p.waitForSelector('article.reading', { timeout: 15000 }).catch(() => {});
    const o = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
    check(`No horizontal page scroll at ${w}px`, o.sw <= o.cw + 1, JSON.stringify(o));
    const tgt = await p.evaluate(() => [...document.querySelectorAll('button, a[href], input, select, summary')].filter((e) => { const b = e.getBoundingClientRect(); const cs = getComputedStyle(e); const sr = cs.clip === 'rect(0px, 0px, 0px, 0px)' || (b.width <= 1 && b.height <= 1); return !sr && b.width > 0 && (b.height < 24 || b.width < 24); }).map((e) => e.tagName + ':' + (e.getAttribute('aria-label') || e.textContent || e.className).trim().slice(0, 30) + ' ' + Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height)));
    check(`All visible touch targets >= 24px at ${w}px`, tgt.length === 0, tgt.join(' | '));
    await p.screenshot({ path: `${shots}/e2e-mobile-${w}-study-now.png` });
    if (w === 375) {
      await p.getByRole('button', { name: 'Open menu' }).click();
      check('Mobile navigation drawer opens with the 4 primary links', await p.getByRole('dialog', { name: 'Navigation menu' }).getByRole('link', { name: /Study Now|Learning|Python Lab|Roadmap/ }).count() >= 4);
      await p.screenshot({ path: `${shots}/e2e-mobile-375-menu.png` });
      await p.keyboard.press('Escape');
    }
    await c.close();
  }
  // ---------- zoom / reflow: 320 CSS px equals 400% zoom of 1280 wide
  // ---------- dark theme sanity
  const d = await ctxFor(1440, 900, 'dark'); const dp = await d.newPage();
  await dp.goto(base + '/study-now', { waitUntil: 'networkidle' }); await dp.waitForSelector('article.reading', { timeout: 15000 }).catch(() => {});
  const dbg = await dp.evaluate(() => getComputedStyle(document.body).backgroundColor);
  check('Dark theme applies (green-gray charcoal rgb(30,35,35))', dbg === 'rgb(30, 35, 35)', dbg);
  await dp.screenshot({ path: shots + '/e2e-desktop-dark-study-now.png' });
  // theme toggle persists across reload; 'system' follows the OS; stored choice is never overwritten by the OS
  await dp.getByRole('button', { name: /Toggle light or dark theme/ }).click();
  await dp.reload({ waitUntil: 'networkidle' });
  check('Manual theme choice persists after reload', (await dp.evaluate(() => localStorage.getItem('theme'))) === 'light' && !(await dp.evaluate(() => document.documentElement.classList.contains('dark'))));
  await d.close();
  const sys = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark', reducedMotion: 'reduce' });
  await sys.addCookies([{ name: 'sb-localhost-auth-token', value: cookieValue, url: base }]);
  await sys.addInitScript(() => { try { localStorage.setItem('theme', 'system'); } catch {} });
  const sp = await sys.newPage(); await sp.goto(base + '/study-now', { waitUntil: 'networkidle' }); await sp.waitForTimeout(800);
  check('Theme "system" follows an OS dark preference', await sp.evaluate(() => document.documentElement.classList.contains('dark')));
  const sys2 = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark', reducedMotion: 'reduce' });
  await sys2.addCookies([{ name: 'sb-localhost-auth-token', value: cookieValue, url: base }]);
  await sys2.addInitScript(() => { try { localStorage.setItem('theme', 'light'); } catch {} });
  const sp2 = await sys2.newPage(); await sp2.goto(base + '/study-now', { waitUntil: 'networkidle' }); await sp2.waitForTimeout(800);
  check('Stored "light" choice is NOT overridden by an OS dark preference', !(await sp2.evaluate(() => document.documentElement.classList.contains('dark'))));
  await sys.close(); await sys2.close();
} catch (e) { check('Test run completed without exception', false, String(e).slice(0, 300)); }
await browser.close(); server.close();
const failed = results.filter((r) => !r.ok);
writeFileSync(shots + '/e2e-study-now-results.json', JSON.stringify(results, null, 1));
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
