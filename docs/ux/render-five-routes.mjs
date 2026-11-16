// Renders the five routes that need data or are feature-flagged, against the MOCK Supabase (safe seeded data only):
//   /learning/[subjectSlug], /learning/[subjectSlug]/[topicSlug], /roadmap/[slug], /ase-final-day, /ase-quick-prep
// Also exercises Learning Library note editing (BlockNote -> topic_documents upsert).
// Usage: node docs/ux/render-five-routes.mjs [baseURL] [outDir] [axe.min.js]
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { start, state, mockUser } from './mock-supabase.mjs';

const [base = 'http://localhost:3101', out = 'docs/ux/screenshots', axePath] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const server = await start(54399);
const U = mockUser.id;
for (const t of ['subjects', 'learning_sections', 'topics', 'topic_documents', 'roadmap_items', 'activity_events']) state[t] ??= [];
state.subjects.push({ id: 's1', user_id: U, title: 'Computer Vision (test)', slug: 'computer-vision', description: 'seed', order_index: 0, created_at: '2026-01-01', updated_at: '2026-01-01' });
state.learning_sections.push({ id: 'sec1', user_id: U, subject_id: 's1', title: 'Filtering', order_index: 0, created_at: '2026-01-01', updated_at: '2026-01-01' });
state.topics.push({ id: 't1', user_id: U, subject_id: 's1', section_id: 'sec1', title: 'Gaussian filter', slug: 'gaussian-filter', status: 'learning', order_index: 0, created_at: '2026-01-01', updated_at: '2026-01-01' },
  { id: 't2', user_id: U, subject_id: 's1', section_id: 'sec1', title: 'Median filter', slug: 'median-filter', status: 'not_started', order_index: 1, created_at: '2026-01-01', updated_at: '2026-01-01' });
state.roadmap_items.push({ id: 'r1', user_id: U, slug: 'dorsal-test', title: 'Dorsal test item', status: 'learning', is_current: true, order_index: 1, description: 'seed', created_at: '2026-01-01', updated_at: '2026-01-01' },
  { id: 'r2', user_id: U, slug: 'second-test', title: 'Second test item', status: 'upcoming', is_current: false, order_index: 2, description: 'seed', created_at: '2026-01-01', updated_at: '2026-01-01' });

const session = { access_token: 'h.' + Buffer.from(JSON.stringify({ sub: U, exp: 4102444800, role: 'authenticated' })).toString('base64url') + '.s', refresh_token: 'r', expires_at: 4102444800, expires_in: 3600, token_type: 'bearer', user: mockUser };
const cookieValue = 'base64-' + Buffer.from(JSON.stringify(session)).toString('base64url');
const routes = [['/learning/computer-vision', 'learning-subject'], ['/learning/computer-vision/gaussian-filter', 'learning-topic'], ['/roadmap/dorsal-test', 'roadmap-slug'], ['/ase-final-day', 'ase-final-day'], ['/ase-quick-prep', 'ase-quick-prep']];
const results = []; const rec = (name, ok, detail = '') => { results.push({ name, ok: !!ok, detail }); console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + detail : '')); };
const browser = await chromium.launch({ channel: 'chrome' });
for (const theme of ['light', 'dark']) {
  for (const w of [320, 768, 1440]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce' });
    await ctx.addCookies([{ name: 'sb-localhost-auth-token', value: cookieValue, url: base }]);
    await ctx.addInitScript((t) => { try { if (!localStorage.getItem('theme')) localStorage.setItem('theme', t); } catch {} }, theme);
    const page = await ctx.newPage(); const errs = []; page.on('pageerror', (e) => errs.push(String(e).slice(0, 160)));
    for (const [path, tag] of routes) {
      errs.length = 0;
      const resp = await page.goto(base + path, { waitUntil: 'networkidle', timeout: 60000 }); await page.waitForTimeout(1500);
      const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, bg: getComputedStyle(document.body).backgroundColor, h: (document.querySelector('h1')?.textContent || '').slice(0, 50), cls: document.documentElement.className.includes('dark'), text: document.body.innerText.length }));
      let ax = 'n/a';
      if (axePath) { await page.addScriptTag({ path: axePath }); ax = await page.evaluate(async () => (await axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] })).violations.map((v) => v.id + ':' + v.nodes.length).join(',') || 'none'); }
      const ok = resp.status() === 200 && m.sw <= m.cw + 1 && m.text > 200 && errs.length === 0 && (theme === 'dark') === m.cls && (ax === 'none' || ax === 'n/a');
      rec(`${tag} ${theme} ${w}px`, ok, `status ${resp.status()}, h1 "${m.h}", overflow ${m.sw}/${m.cw}, axe ${ax}${errs.length ? ', errors ' + errs.join('|') : ''}`);
      if (w === 1440 || w === 320) await page.screenshot({ path: `${out}/five-${tag}-${theme}-${w}.png` });
    }
    await ctx.close();
  }
}
// Learning Library note editing against the mock (safe data only)
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  await ctx.addCookies([{ name: 'sb-localhost-auth-token', value: cookieValue, url: base }]);
  const page = await ctx.newPage();
  await page.goto(base + '/learning/computer-vision/gaussian-filter', { waitUntil: 'networkidle' }); await page.waitForTimeout(1500);
  await page.getByRole('button', { name: /Start Writing/ }).click(); await page.waitForTimeout(2000);
  const editor = page.locator('.bn-editor, [contenteditable="true"]').first();
  const found = await editor.count();
  rec('Learning topic: rich-text editor present', found > 0);
  if (found) {
    await editor.click(); await page.keyboard.type('Safe test note about Gaussian kernels.'); await page.waitForTimeout(4000);
    const saved = state.topic_documents.some((d) => d.topic_id === 't1' && JSON.stringify(d.content_json).includes('Safe test note'));
    rec('Learning topic: typing autosaves to topic_documents (mock)', saved, `${state.topic_documents.length} document rows`);
    await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(1500);
    rec('Learning topic: saved note reloads', (await page.locator('body').innerText()).includes('Safe test note about Gaussian kernels'));
  }
  await ctx.close();
}
await browser.close(); server.close();
const bad = results.filter((r) => !r.ok);
writeFileSync(`${out}/five-routes-results.json`, JSON.stringify(results, null, 1));
console.log(`\n${results.length - bad.length}/${results.length} checks passed`);
process.exit(bad.length ? 1 : 0);
