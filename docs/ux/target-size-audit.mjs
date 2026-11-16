// Lists visible interactive elements smaller than 24x24 CSS px (WCAG 2.5.8) or, with MIN=44, smaller than 44 px tall, on study/navigation routes.
// Inline links inside running text and sr-only elements are excluded (WCAG exceptions). Uses the mock backend so signed-in views render.
import { chromium } from '@playwright/test';
import { start, state, mockUser } from './mock-supabase.mjs';
const base = process.argv[2] ?? 'http://localhost:3101'; const MIN = Number(process.env.MIN ?? 24);
const U = mockUser.id; const S = await start(54399);
for (const t of ['subjects', 'learning_sections', 'topics', 'topic_documents']) state[t] ??= [];
state.subjects.push({ id: 's1', user_id: U, title: 'CV', slug: 'computer-vision', order_index: 0 });
state.learning_sections.push({ id: 'sec1', user_id: U, subject_id: 's1', title: 'Filtering', order_index: 0 });
state.topics.push({ id: 't1', user_id: U, subject_id: 's1', section_id: 'sec1', title: 'Gaussian filter', slug: 'gaussian-filter', status: 'learning', order_index: 0 }, { id: 't2', user_id: U, subject_id: 's1', section_id: 'sec1', title: 'Median filter', slug: 'median-filter', status: 'not_started', order_index: 1 });
const session = { access_token: 'h.' + Buffer.from(JSON.stringify({ sub: U, exp: 4102444800, role: 'authenticated' })).toString('base64url') + '.s', refresh_token: 'r', expires_at: 4102444800, expires_in: 3600, token_type: 'bearer', user: mockUser };
const cv = 'base64-' + Buffer.from(JSON.stringify(session)).toString('base64url');
const routes = ['/study-now', '/', '/learning', '/learning/computer-vision', '/learning/computer-vision/gaussian-filter', '/roadmap', '/python-lab', '/roadmap/python/1', '/settings'];
const b = await chromium.launch({ channel: 'chrome' }); const out = {};
for (const w of [1440, 375]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce' }); await ctx.addCookies([{ name: 'sb-localhost-auth-token', value: cv, url: base }]);
  const p = await ctx.newPage();
  for (const r of routes) {
    await p.goto(base + r, { waitUntil: 'networkidle' }); await p.waitForTimeout(1200);
    const list = await p.evaluate((MIN) => [...document.querySelectorAll('a[href],button,input:not([type=hidden]),select,textarea,summary,[role=button]')].filter((e) => {
      const b = e.getBoundingClientRect(), cs = getComputedStyle(e);
      if (!(b.width > 0 && b.height > 0) || cs.visibility === 'hidden' || cs.clip === 'rect(0px, 0px, 0px, 0px)' || (b.width <= 1 && b.height <= 1)) return false;
      if (e.tagName === 'A' && e.closest('p, li, td, .reading') && cs.display === 'inline') return false; // inline-in-text exception
      return b.height < MIN || b.width < 24;
    }).map((e) => e.tagName + ':' + (e.getAttribute('aria-label') || e.textContent || e.getAttribute('placeholder') || '').trim().replace(/\s+/g, ' ').slice(0, 26) + ' ' + Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height)), MIN);
    out[`${w} ${r}`] = list;
  }
  await ctx.close();
}
await b.close(); S.close();
let total = 0; for (const [k, v] of Object.entries(out)) { total += v.length; console.log(k.padEnd(48), v.length, v.slice(0, 6).join(' | ')); }
console.log('TOTAL', total, '(min height', MIN + ')');
