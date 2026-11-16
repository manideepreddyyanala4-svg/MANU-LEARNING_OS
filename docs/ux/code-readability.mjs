// Code block readability check in both themes on Study Now (mock backend, safe seeded note).
// Measures rendered colours (contrast), indentation preservation, long-line handling (scroll inside the block, not the page),
// keyboard focusability of the scroll area, copy fidelity, and saves cropped screenshots.
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { start, state, mockUser } from './mock-supabase.mjs';
const base = process.argv[2] ?? 'http://localhost:3101'; const out = process.argv[3] ?? 'docs/ux/screenshots';
mkdirSync(out, { recursive: true });
const U = mockUser.id; const S = await start(54399);
const KEY = 'internship-v1-m01-t005';
state.roadmap_items.push({ user_id: U, slug: KEY, status: 'in_progress', title: 't' });
const LONG = 'result = ' + Array.from({ length: 40 }, (_, i) => `value_${i}`).join(' + ');
const NOTE = `## WORKED EXAMPLE\n\n\`\`\`python\ndef first_repeat(seq):\n    seen = set()\n    for item in seq:\n        if item in seen:\n            return item\n        seen.add(item)\n    return None\n\n${LONG}\n\`\`\`\n\nOutput: \`3\`\n\nInline \`code\` sits in a sentence.`;
state.curriculum_lessons.push({ user_id: U, topic_key: KEY, content: NOTE });
const session = { access_token: 'h.' + Buffer.from(JSON.stringify({ sub: U, exp: 4102444800, role: 'authenticated' })).toString('base64url') + '.s', refresh_token: 'r', expires_at: 4102444800, expires_in: 3600, token_type: 'bearer', user: mockUser };
const cv = 'base64-' + Buffer.from(JSON.stringify(session)).toString('base64url');
const lum = (rgb) => { const c = rgb.match(/\d+/g).slice(0, 3).map((v) => v / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const b = await chromium.launch({ channel: 'chrome' }); const results = [];
const rec = (n, ok, d = '') => { results.push(ok); console.log((ok ? 'PASS ' : 'FAIL ') + n + (d ? ' — ' + d : '')); };
for (const theme of ['light', 'dark']) for (const w of [1440, 375]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce', permissions: ['clipboard-read', 'clipboard-write'] });
  await ctx.addCookies([{ name: 'sb-localhost-auth-token', value: cv, url: base }]);
  await ctx.addInitScript((t) => { if (!localStorage.getItem('theme')) localStorage.setItem('theme', t); }, theme);
  const p = await ctx.newPage(); await p.goto(base + '/study-now', { waitUntil: 'networkidle' }); await p.waitForSelector('article.reading pre', { timeout: 15000 });
  const m = await p.evaluate(() => { const pre = document.querySelector('article.reading pre'), code = pre.querySelector('code'), inl = document.querySelector('article.reading p code'); const cs = getComputedStyle(pre), ci = getComputedStyle(inl);
    return { fg: getComputedStyle(code).color, bg: cs.backgroundColor, ws: cs.whiteSpace, fs: parseFloat(cs.fontSize), scroll: pre.scrollWidth > pre.clientWidth, tab: pre.tabIndex, doc: document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1, indent: code.textContent.includes('\n        if item in seen:\n            return item'), inFg: ci.color, inBg: ci.backgroundColor, text: code.textContent }; });
  const r = ratio(m.fg, m.bg), r2 = ratio(m.inFg, m.inBg.startsWith('rgba') && m.inBg.endsWith('0)') ? m.bg : m.inBg);
  rec(`${theme} ${w}px: code text contrast ${r.toFixed(2)}:1 (>= 4.5)`, r >= 4.5, `${m.fg} on ${m.bg}`);
  rec(`${theme} ${w}px: inline code contrast ${r2.toFixed(2)}:1`, r2 >= 4.5, `${m.inFg} on ${m.inBg}`);
  rec(`${theme} ${w}px: indentation preserved (white-space: ${m.ws}, 4-space nesting intact)`, m.ws === 'pre' && m.indent);
  rec(`${theme} ${w}px: long line scrolls inside the block, page does not overflow, block is keyboard-focusable`, m.scroll && m.doc && m.tab === 0, `scroll=${m.scroll} page-ok=${m.doc} tabindex=${m.tab}`);
  rec(`${theme} ${w}px: font size >= 13px (${m.fs.toFixed(1)}px)`, m.fs >= 13);
  if (w === 1440) { await p.locator('.code-copy').click(); const clip = await p.evaluate(() => navigator.clipboard.readText()); rec(`${theme}: copy returns the exact code`, clip.replace(/\r\n/g, '\n').trim() === m.text.trim()); }
  await p.locator('.code-block').first().screenshot({ path: `${out}/code-${theme}-${w}.png` });
  await ctx.close();
}
await b.close(); S.close();
console.log(`\n${results.filter(Boolean).length}/${results.length} passed`); process.exit(results.every(Boolean) ? 0 : 1);
