import { test, expect } from '@playwright/test';
import path from 'node:path';

const email = process.env.MANU_TEST_EMAIL;
const password = process.env.MANU_TEST_PASSWORD;
test.skip(!email || !password, 'Set MANU_TEST_EMAIL and MANU_TEST_PASSWORD locally to run the authenticated owner flow.');

test('owner can persist the current BlockNote learning flow', async ({ page }) => {
  test.setTimeout(120000);
  const suffix = Date.now();
  const subjectTitle = `ZZ_TEST_AUDIT_SUBJECT_${suffix}`;
  const topicTitle = `ZZ_TEST_AUDIT_TOPIC_${suffix}`;
  const firstPhrase = 'ZZ_UNIQUE_BLOCKNOTE_PERSISTENCE_TEST';
  const secondPhrase = 'ZZ_SECOND_SAVE_TEST';

  await page.goto('/login');
  await page.getByPlaceholder('Email address').fill(email!);
  await page.getByPlaceholder('Password').fill(password!);
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page).toHaveURL('/');

  try {
    await page.goto('/learning');
    await page.getByRole('button', { name: '+ New subject' }).click();
    await page.getByRole('textbox', { name: 'Subject name' }).fill(subjectTitle);
    await page.getByRole('button', { name: 'Create subject' }).click();
    await expect(page).toHaveURL(new RegExp(`/learning/[^/]+$`));

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

    await page.getByRole('button', { name: 'Edit' }).click();
    const editor = page.locator('[contenteditable="true"]').first();
    await editor.click();
    await editor.fill(firstPhrase);
    // Image upload: inserted as a native image block that persists its URL.
    await page.locator('input[type="file"][accept*="image"]').setInputFiles(path.join(process.cwd(), 'tests/fixtures/test-image.png'));
    await expect(page.getByAltText('test-image.png')).toBeVisible();
    // File upload: inserted as a native file block. Requires the live
    // `learning-assets` bucket to allow text/* (migration 007). If the bucket
    // still rejects the type, the app surfaces an inline error instead of
    // corrupting the document — assert the graceful behaviour either way.
    await page.locator('input[type="file"][accept*="text"], input[type="file"][accept*="pdf"]').first().setInputFiles(path.join(process.cwd(), 'tests/fixtures/test-note.txt'));
    const fileUploaded = await page.getByText('test-note.txt').first().isVisible().catch(() => false);
    if (!fileUploaded) await expect(page.getByText(/isn't enabled for upload yet|Upload failed/)).toBeVisible();
    await expect(page.getByText('Saved', { exact: true })).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Done' }).click();
    await page.reload();
    await expect(page.getByText(firstPhrase)).toBeVisible();
    await expect(page.getByAltText('test-image.png')).toBeVisible();
    if (fileUploaded) await expect(page.getByText('test-note.txt').last()).toBeVisible();

    await page.getByRole('button', { name: 'Edit' }).click();
    await editor.click();
    await editor.press('End');
    await editor.press('Enter');
    await editor.type(secondPhrase);
    await expect(page.getByText('Unsaved changes')).toBeVisible();
    await expect(page.getByText('Saved', { exact: true })).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Done' }).click();
    await page.reload();
    await expect(page.getByText(firstPhrase)).toBeVisible();
    await expect(page.getByText(secondPhrase)).toBeVisible();

    await page.goto('/learning');
    await expect(page.getByText('Continue learning')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Continue →' })).toBeVisible();
    await page.getByPlaceholder('Search learning material').fill(firstPhrase);
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await expect(page.getByText(`${topicTitle} · Topic`)).toBeVisible();
  } finally {
    if (!page.isClosed()) {
      await page.goto('/learning');
      const subjectLink = page.getByRole('link', { name: subjectTitle });
      if (await subjectLink.count()) {
        const card = subjectLink.locator('..');
        await card.getByRole('button', { name: `Actions for ${subjectTitle}` }).click();
        page.once('dialog', (dialog) => dialog.accept());
        await page.getByRole('button', { name: 'Delete', exact: true }).click();
      }
    }
  }
});
