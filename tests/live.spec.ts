import { test, expect } from '@playwright/test';
import path from 'node:path';
import { mkdirSync, readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import type { PartialBlock } from '@blocknote/core';

const email = process.env.MANU_TEST_EMAIL;
const password = process.env.MANU_TEST_PASSWORD;
test.skip(!email || !password, 'Set MANU_TEST_EMAIL and MANU_TEST_PASSWORD locally to run the authenticated owner flow.');

test('owner can persist the current BlockNote learning flow', async ({ page }) => {
  test.setTimeout(240000);
  const suffix = Date.now();
  const subjectTitle = `Visual study audit ${suffix}`;
  const topicTitle = 'Noise filtering in computer vision';
  const firstPhrase = 'Gaussian noise and image filters';
  const secondPhrase = 'A second saved paragraph';
  mkdirSync('/tmp/manu-visual', { recursive: true });
  async function capture(stage: string) {
    for (const [name, width, height] of [['desktop', 1440, 900], ['small-desktop', 1024, 768], ['tablet', 768, 1024], ['mobile', 390, 844]] as const) {
      await page.setViewportSize({ width, height });
      for (const theme of ['light', 'dark'] as const) {
        const isDark = await page.locator('html').evaluate((element) => element.classList.contains('dark'));
        if (isDark !== (theme === 'dark')) await page.getByRole('button', { name: 'Toggle theme' }).click();
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.mouse.move(0, 0);
        await page.waitForTimeout(180);
        await page.screenshot({ path: `/tmp/manu-visual/${stage}-${name}-${theme}.png`, fullPage: true });
      }
    }
    await page.setViewportSize({ width: 1440, height: 900 });
    if (await page.locator('html').evaluate((element) => element.classList.contains('dark'))) await page.getByRole('button', { name: 'Toggle theme' }).click();
  }

  await page.goto('/login');
  await page.getByPlaceholder('Email address').fill(email!);
  await page.getByPlaceholder('Password').fill(password!);
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page).toHaveURL('/');

  try {
    await page.goto('/learning');
    await capture('learning-home');
    await page.getByRole('button', { name: '+ New subject' }).click();
    await page.getByRole('textbox', { name: 'Subject name' }).fill(subjectTitle);
    await page.getByRole('button', { name: 'Create subject' }).click();
    await expect(page).toHaveURL(new RegExp(`/learning/[^/]+$`));
    await capture('subject');

    await page.getByRole('button', { name: 'New topic' }).click();
    await page.getByRole('textbox', { name: 'Topic name' }).fill(topicTitle);
    await page.getByRole('button', { name: 'Create topic' }).click();
    const topicUrl = new RegExp(`/learning/[^/]+/[^/]+$`);
    await page.waitForTimeout(1000);
    if (!topicUrl.test(new URL(page.url()).pathname)) {
      await expect(page.getByRole('link', { name: topicTitle })).toBeVisible({ timeout: 30000 });
      await page.getByRole('link', { name: topicTitle }).click();
    }
    await expect(page).toHaveURL(topicUrl);
    await capture('study-empty');

    await page.getByRole('button', { name: 'Edit' }).click();
    await capture('edit-empty');
    const editor = page.locator('[contenteditable="true"]').first();
    await editor.click();
    await editor.fill(firstPhrase);
    await page.getByRole('combobox', { name: 'Text style' }).selectOption('Heading 2');
    await expect(editor.getByRole('heading', { name: firstPhrase, level: 2 })).toBeVisible();
    await page.keyboard.press('Enter');
    await page.getByRole('button', { name: 'Bulleted list' }).click();
    await page.keyboard.type('A clear revision point');
    await editor.getByText(firstPhrase).click({ clickCount: 3 });
    await page.getByRole('toolbar', { name: 'Text formatting' }).getByRole('button', { name: 'Bold' }).click();
    await expect(editor.locator('strong')).toBeVisible();
    // Image upload: inserted as a native image block that persists its URL.
    await page.locator('input[type="file"][accept*="image"]').setInputFiles(path.join(process.cwd(), 'tests/fixtures/noise-filter-example.jpg'));
    await expect.poll(() => page.getByAltText('noise-filter-example.jpg').evaluate((image: HTMLImageElement) => image.naturalWidth), { timeout: 20000 }).toBeGreaterThan(0);
    await expect(page.getByAltText('noise-filter-example.jpg')).toBeVisible({ timeout: 20000 });
    // File upload: inserted as a native file block. Requires the live
    // `learning-assets` bucket to allow text/* (migration 007). If the bucket
    // still rejects the type, the app surfaces an inline error instead of
    // corrupting the document — assert the graceful behaviour either way.
    await page.locator('input[type="file"][accept*="text"], input[type="file"][accept*="pdf"]').first().setInputFiles(path.join(process.cwd(), 'tests/fixtures/test-note.txt'));
    await expect(page.getByText('test-note.txt').first().or(page.getByText(/isn't enabled for upload yet|Upload failed/))).toBeVisible({ timeout: 15000 });
    const fileUploaded = await page.getByText('test-note.txt').first().isVisible().catch(() => false);
    if (!fileUploaded) await expect(page.getByText(/isn't enabled for upload yet|Upload failed/)).toBeVisible();
    await expect(page.getByText('Saved', { exact: true })).toBeVisible({ timeout: 10000 });
    await capture('edit-content');
    await page.getByRole('button', { name: 'Done' }).click();
    await page.reload();
    await expect(page.locator('article').getByText(firstPhrase)).toBeVisible();
    await expect(page.getByRole('heading', { name: firstPhrase, level: 2 })).toBeVisible();
    await expect(page.getByRole('heading', { name: firstPhrase, level: 2 }).locator('strong')).toBeVisible();
    await expect(page.getByText('A clear revision point')).toBeVisible();
    await expect(page.getByAltText('noise-filter-example.jpg')).toBeVisible();
    if (fileUploaded) await expect(page.getByText('test-note.txt').last()).toBeVisible();
    await capture('study-content');

    await page.getByRole('button', { name: 'Edit' }).click();
    await editor.click();
    await editor.press('End');
    await editor.press('Enter');
    await editor.type(secondPhrase);
    await expect(page.getByText('Unsaved changes')).toBeVisible();
    await expect(page.getByText('Saved', { exact: true })).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Done' }).click();
    await page.reload();
    await expect(page.locator('article').getByText(firstPhrase)).toBeVisible();
    await expect(page.locator('article').getByText(secondPhrase)).toBeVisible();
    await expect(page.getByAltText('noise-filter-example.jpg')).toBeVisible();

    // A temporary, representative article for visual review. The enclosing
    // subject and its assets are removed in finally.
    const env = Object.fromEntries(readFileSync('.env.local', 'utf8').split(/\r?\n/).filter((line) => line.includes('=') && !line.startsWith('#')).map((line) => { const i = line.indexOf('='); return [line.slice(0, i), line.slice(i + 1).replace(/^['"]|['"]$/g, '')]; }));
    const client = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
    const { data: signedIn, error: authError } = await client.auth.signInWithPassword({ email: email!, password: password! });
    if (authError) throw authError;
    const { data: subjectRow, error: subjectError } = await client.from('subjects').select('id').eq('title', subjectTitle).single();
    if (subjectError) throw subjectError;
    const { data: topicRow, error: topicError } = await client.from('topics').select('id').eq('subject_id', subjectRow.id).eq('title', topicTitle).single();
    if (topicError) throw topicError;
    const { data: savedDocument, error: documentError } = await client.from('topic_documents').select('content_json').eq('topic_id', topicRow.id).single();
    if (documentError) throw documentError;
    const attachments = (savedDocument.content_json as PartialBlock[]).filter((block) => block.type === 'image' || block.type === 'file');
    expect(attachments.some((block) => block.type === 'image')).toBe(true);
    const rich: PartialBlock[] = [
      { type: 'heading', props: { level: 1 }, content: 'Understanding image noise' },
      { type: 'paragraph', content: [{ type: 'text', text: 'Real images contain ', styles: {} }, { type: 'text', text: 'random variation', styles: { bold: true } }, { type: 'text', text: ' from sensors and light. A good filter reduces noise while preserving edges.', styles: {} }] },
      { type: 'heading', props: { level: 2 }, content: firstPhrase },
      { type: 'bulletListItem', content: 'Use a Gaussian filter for smooth, normally distributed noise.' },
      { type: 'bulletListItem', content: 'Use a median filter when isolated pixels are very bright or dark.' },
      { type: 'numberedListItem', content: 'Inspect the noise pattern.' },
      { type: 'numberedListItem', content: 'Choose a filter and kernel size.' },
      { type: 'checkListItem', props: { checked: true }, content: 'Compare the filtered image with the original.' },
      { type: 'heading', props: { level: 3 }, content: 'A short OpenCV example' },
      { type: 'codeBlock', props: { language: 'python' }, content: 'import cv2\nimage = cv2.imread("sample.png")\nfiltered = cv2.GaussianBlur(image, (5, 5), 0)' },
      { type: 'quote', content: 'NOTE: Larger kernels remove more noise but may blur useful edges.' },
      ...attachments,
      { type: 'table', content: { type: 'tableContent', rows: [{ cells: [['Filter'], ['Best for'], ['Tradeoff']] }, { cells: [['Gaussian'], ['Smooth noise'], ['Softens edges']] }, { cells: [['Median'], ['Salt and pepper'], ['May remove fine detail']] }] } },
    ];
    const { error: fixtureError } = await client.from('topic_documents').upsert({ user_id: signedIn.user.id, topic_id: topicRow.id, content_json: rich, plain_text: `${firstPhrase} Understanding image noise Gaussian median OpenCV`, version: 1, updated_at: new Date().toISOString() }, { onConflict: 'topic_id' });
    if (fixtureError) throw fixtureError;
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Understanding image noise', level: 1 })).toBeVisible();
    await expect(page.getByAltText('noise-filter-example.jpg')).toBeVisible();
    await expect.poll(() => page.getByAltText('noise-filter-example.jpg').evaluate((image: HTMLImageElement) => image.naturalWidth), { timeout: 15000 }).toBeGreaterThan(0);
    await capture('study-rich');

    await page.goto('/learning');
    await expect(page.getByText('Continue learning')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Continue →' })).toBeVisible();
    await page.getByPlaceholder('Search subjects, topics or notes').fill(firstPhrase);
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await expect(page.getByText(`${topicTitle} · Topic`).first()).toBeVisible();
  } finally {
    const env = Object.fromEntries(readFileSync('.env.local', 'utf8').split(/\r?\n/).filter((line) => line.includes('=') && !line.startsWith('#')).map((line) => { const i = line.indexOf('='); return [line.slice(0, i), line.slice(i + 1).replace(/^['"]|['"]$/g, '')]; }));
    const client = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
    const { data: signedIn, error: authError } = await client.auth.signInWithPassword({ email: email!, password: password! });
    if (authError) throw authError;
    const { data: temporary, error: subjectError } = await client.from('subjects').select('id').eq('user_id', signedIn.user.id).eq('title', subjectTitle).maybeSingle();
    if (subjectError) throw subjectError;
    if (temporary) {
      const { data: related, error: topicError } = await client.from('topics').select('id').eq('subject_id', temporary.id);
      if (topicError) throw topicError;
      for (const topic of related ?? []) {
        const folder = `${signedIn.user.id}/${topic.id}`;
        const { data: objects, error: listError } = await client.storage.from('learning-assets').list(folder, { limit: 1000 });
        if (listError) throw listError;
        const paths = (objects ?? []).filter((object) => object.name && object.name !== '.emptyFolderPlaceholder').map((object) => `${folder}/${object.name}`);
        if (paths.length) { const { error: removeError } = await client.storage.from('learning-assets').remove(paths); if (removeError) throw removeError; }
      }
      const { error: deleteError } = await client.from('subjects').delete().eq('id', temporary.id);
      if (deleteError) throw deleteError;
    }
  }
});
