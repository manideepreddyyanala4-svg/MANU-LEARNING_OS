// Browser test of the B1 pack against the MOCK Supabase (never the live database):
//  1) uploads b1_lesson_pack.json through the real "Lesson preparation" importer (overwrite UNCHECKED),
//  2) verifies the existing-note-preserved rule, 3) renders all 19 lessons on Study Now at phone and desktop width in both themes.
// Usage: node docs/lesson-packs/B1/import-and-render-test.mjs [baseURL] [outDir]   (app started with the mock env, see docs/ux/GLOBAL_REDESIGN_VALIDATION.md)
import { chromium } from '@playwright/test';
import { readFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { start, state, mockUser } from '../../ux/mock-supabase.mjs';
const here = path.dirname(fileURLToPath(import.meta.url));
const [base = 'http://localhost:3101', out = path.join(here, 'screenshots')] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const pack = JSON.parse(readFileSync(path.join(here, 'b1_lesson_pack.json'), 'utf8')).lessons;
const U = mockUser.id; const S = await start(54399);
const keys = pack.map((p) => p.topic_key);
state.roadmap_items.push({ user_id: U, slug: keys[0], status: 'in_progress', title: 't' });
const EXISTING = 'EXISTING NOTE THAT MUST NOT BE OVERWRITTEN';
state.curriculum_lessons.push({ user_id: U, topic_key: keys[1], content: EXISTING });
const session = { access_token: 'h.' + Buffer.from(JSON.stringify({ sub: U, exp: 4102444800, role: 'authenticated' })).toString('base64url') + '.s', refresh_token: 'r', expires_at: 4102444800, expires_in: 3600, token_type: 'bearer', user: mockUser };
const cv = 'base64-' + Buffer.from(JSON.stringify(session)).toString('base64url');
const results = []; const rec = (n, ok, d = '') => { results.push(ok); console.log((ok ? 'PASS ' : 'FAIL ') + n + (d ? ' — ' + d : '')); };
const b = await chromium.launch({ channel: 'chrome' });
// ---- 1) import through the real UI
{
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  await ctx.addCookies([{ name: 'sb-localhost-auth-token', value: cv, url: base }]);
  const p = await ctx.newPage(); await p.goto(base + '/study-now', { waitUntil: 'networkidle' });
  await p.getByRole('button', { name: /Lesson preparation/ }).click();
  await p.locator('#lesson-pack-input').setInputFiles(path.join(here, 'b1_lesson_pack.json'));
  await p.getByText(/valid lesson keys checked/).waitFor({ timeout: 8000 }).catch(() => {});
  const msg = await p.getByText(/valid lesson keys checked/).innerText().catch(() => '');
  rec('Importer accepts the pack and reports 19 valid keys (no validation error)', /^19 valid lesson keys/.test(msg), msg);
  rec('"Replace matching existing notes" is unchecked by default', !(await p.getByLabel(/Replace matching existing notes/).isChecked()));
  await p.getByRole('button', { name: /Import prepared lessons/ }).click(); await p.waitForTimeout(1500);
  const imported = state.curriculum_lessons.filter((l) => keys.includes(l.topic_key));
  rec('After import the mock store holds 19 B1 lessons', imported.length === 19, `${imported.length}`);
  rec('The pre-existing note was preserved (not overwritten)', state.curriculum_lessons.find((l) => l.topic_key === keys[1]).content === EXISTING);
  rec('Imported lessons are byte-identical to the pack', pack.filter((x, i) => i !== 1).every((x) => state.curriculum_lessons.find((l) => l.topic_key === x.topic_key)?.content === x.content));
  rec('Progress rows untouched by the import', state.roadmap_items.length === 1 && state.roadmap_items[0].status === 'in_progress');
  await ctx.close();
}
// ---- 2) render all 19 lessons
state.curriculum_lessons.find((l) => l.topic_key === keys[1]).content = pack[1].content;   // render the pack's own text for lesson 2 as well
for (const [theme, w] of [['light', 375], ['dark', 375], ['light', 1440], ['dark', 1440]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce' });
  await ctx.addCookies([{ name: 'sb-localhost-auth-token', value: cv, url: base }]);
  await ctx.addInitScript((t) => { if (!localStorage.getItem('theme')) localStorage.setItem('theme', t); }, theme);
  const p = await ctx.newPage(); let bad = [];
  for (let i = 0; i < 19; i++) {
    state.roadmap_items[0].slug = keys[i];                                   // pin lesson i (mock only)
    await p.goto(base + '/study-now', { waitUntil: 'networkidle' }); await p.waitForSelector('article.reading', { timeout: 15000 }).catch(() => {});
    const m = await p.evaluate(() => { const a = document.querySelector('article.reading'); if (!a) return { none: true };
      const pre = [...a.querySelectorAll('pre')]; return { h2: [...a.querySelectorAll('h2')].map((h) => h.textContent.trim()), pre: pre.length, preFocus: pre.every((x) => x.tabIndex === 0), overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1, copy: a.querySelectorAll('.code-copy').length, title: document.querySelector('section[aria-label="Current lesson"] h2')?.textContent }; });
    const okSec = !m.none && JSON.stringify(m.h2) === JSON.stringify(['UNDERSTAND', 'MECHANISM', 'WORKED EXAMPLE', 'COMMON MISTAKES', 'INTERVIEW CHECK']);
    if (m.none || !okSec || m.overflow || !m.preFocus || m.copy !== m.pre || m.title !== pack[i].topic_title) bad.push(`${keys[i].slice(-8)}:${m.none ? 'none' : [!okSec && 'sections', m.overflow && 'overflow', !m.preFocus && 'focus', m.copy !== m.pre && 'copy', m.title !== pack[i].topic_title && 'title'].filter(Boolean).join('+')}`);
    if ([0, 7, 18].includes(i) && w === 375) await p.screenshot({ path: `${out}/b1-${theme}-${w}-lesson${i + 1}.png`, fullPage: false });
    if (i === 9 && w === 1440) await p.screenshot({ path: `${out}/b1-${theme}-${w}-lesson${i + 1}.png`, fullPage: false });
  }
  rec(`19/19 lessons render with the 5 sections in order, correct title, copyable focusable code, no page overflow (${theme}, ${w}px)`, bad.length === 0, bad.join(' | '));
  await ctx.close();
}
await b.close(); S.close();
console.log(`\n${results.filter(Boolean).length}/${results.length} passed`); process.exit(results.every(Boolean) ? 0 : 1);
