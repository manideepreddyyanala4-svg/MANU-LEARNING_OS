import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'node:fs';

const email = process.env.MANU_TEST_EMAIL || 'man@gmail.com';
const password = process.env.MANU_TEST_PASSWORD || 'manu1234';

const env = {
  ...process.env,
  ...Object.fromEntries(
    (existsSync('.env.local') ? readFileSync('.env.local', 'utf8') : '')
      .split(/\r?\n/)
      .filter((x) => x.includes('=') && !x.startsWith('#'))
      .map((x) => {
        const i = x.indexOf('=');
        return [x.slice(0, i), x.slice(i + 1).replace(/^['"]|['"]$/g, '')];
      })
  ),
};

const artifactDir = '/home/tonyai/.gemini/antigravity/brain/b96275fc-528e-4c4c-898f-50dc43e3e17f/audit-screenshots';

test('manu learn image-first note study experience and rich structured notes', async ({ page }) => {
  test.setTimeout(180000);

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
  const client = createClient(supabaseUrl, supabaseKey);

  const { data: auth, error: authError } = await client.auth.signInWithPassword({
    email,
    password,
  });
  if (authError) throw authError;

  const suffix = Date.now();
  const subjectTitle = `Computer Vision & Features ${suffix}`;
  const { data: subject, error: subError } = await client
    .from('subjects')
    .insert({
      user_id: auth.user.id,
      title: subjectTitle,
      slug: `comp-vision-${suffix}`,
      order_index: 998,
    })
    .select()
    .single();
  if (subError) throw subError;

  let storagePath = '';

  try {
    const { data: section, error: secError } = await client
      .from('learning_sections')
      .insert({
        user_id: auth.user.id,
        subject_id: subject.id,
        title: 'Edge Operators',
        order_index: 0,
      })
      .select()
      .single();
    if (secError) throw secError;

    const topicTitle = 'Edge Basics & 2D Image Gradient Operators';
    const { data: topic, error: topError } = await client
      .from('topics')
      .insert({
        user_id: auth.user.id,
        subject_id: subject.id,
        section_id: section.id,
        title: topicTitle,
        slug: `edge-basics-${suffix}`,
        order_index: 0,
        status: 'learning',
      })
      .select()
      .single();
    if (topError) throw topError;

    // Upload the realistic handwritten study note fixture
    const noteBuffer = readFileSync('tests/fixtures/edge-basics-note.png');
    storagePath = `${auth.user.id}/${topic.id}/edge-basics-note.png`;
    const { error: upErr } = await client.storage
      .from('learning-assets')
      .upload(storagePath, noteBuffer, {
        contentType: 'image/png',
        upsert: true,
      });
    if (upErr) throw upErr;

    const imageUrl = `/api/learning-assets?path=${encodeURIComponent(storagePath)}`;

    // Prepare rich document with image-first study note, callout, table, code
    const documentContent = [
      {
        type: 'heading',
        props: { level: 1 },
        content: 'Edge Basics & 2D Image Gradient Operators',
      },
      {
        type: 'quote',
        content: 'NOTE: Numerical differentiation amplifies high-frequency noise. Always apply a Gaussian smoothing stage before taking discrete gradients.',
      },
      {
        type: 'image',
        props: {
          url: imageUrl,
          name: 'edge-basics-note.png',
          caption: 'Visual Handwritten Notebook: 1st Derivative, 2nd Derivative zero-crossing, and 3x3 Sobel kernels',
        },
      },
      {
        type: 'heading',
        props: { level: 2 },
        content: 'ChatGPT Technical Summary: Kernel Comparisons',
      },
      {
        type: 'paragraph',
        content: 'Key spatial filter comparisons derived from ChatGPT study sessions:',
      },
      {
        type: 'table',
        content: {
          type: 'tableContent',
          rows: [
            {
              cells: ['Operator', 'Kernel Size', 'Separable?', 'Noise Handling'],
            },
            {
              cells: ['Sobel', '3x3', 'Yes [1, 2, 1]ᵀ * [-1, 0, 1]', 'Gaussian smoothing built-in'],
            },
            {
              cells: ['Prewitt', '3x3', 'Yes [1, 1, 1]ᵀ * [-1, 0, 1]', 'Simple uniform box smoothing'],
            },
            {
              cells: ['Scharr', '3x3', 'Yes [3, 10, 3]ᵀ * [-1, 0, 1]', 'Maximum rotational symmetry'],
            },
          ],
        },
      },
      {
        type: 'heading',
        props: { level: 3 },
        content: 'Implementation: Sobel Gradient Magnitude in Python',
      },
      {
        type: 'codeBlock',
        props: { language: 'python' },
        content: `import cv2\nimport numpy as np\n\ndef compute_gradient_magnitude(img_gray):\n    # 1. Gaussian blur to suppress camera noise\n    blurred = cv2.GaussianBlur(img_gray, (3, 3), 0)\n    # 2. Compute 1st order derivatives along X and Y\n    gx = cv2.Sobel(blurred, cv2.CV_64F, 1, 0, ksize=3)\n    gy = cv2.Sobel(blurred, cv2.CV_64F, 0, 1, ksize=3)\n    # 3. Magnitude and orientation\n    magnitude = np.hypot(gx, gy)\n    angle = np.arctan2(gy, gx) * 180.0 / np.pi\n    return magnitude, angle`,
      },
    ];

    const { error: docError } = await client.from('topic_documents').insert({
      user_id: auth.user.id,
      topic_id: topic.id,
      content_json: documentContent,
      plain_text: 'Edge Basics & 2D Image Gradient Operators. Hand written study notes on 1st derivative.',
      version: 1,
    });
    if (docError) throw docError;

    // Login via browser
    await page.goto('/login');
    await page.getByPlaceholder('Email address').fill(email);
    await page.getByPlaceholder('Password').fill(password);
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page).toHaveURL('/');

    // Navigate to topic
    await page.goto(`/learning/${subject.slug}/${topic.slug}`);
    await page.waitForLoadState('networkidle');

    // 1. Verify Light Mode is default
    const isDark = await page.locator('html').evaluate((el) => el.classList.contains('dark'));
    expect(isDark).toBe(false);

    // 2. Viewport and zero-clipping audit across all required monitor sizes
    const viewports = [
      { name: '1920', width: 1920, height: 1080 },
      { name: '1440', width: 1440, height: 900 },
      { name: '1024', width: 1024, height: 768 },
      { name: '768', width: 768, height: 1024 },
      { name: '390', width: 390, height: 844 },
    ] as const;

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.waitForTimeout(300);

      // Verify header height
      const headerBox = await page.locator('.learning-context > header').boundingBox();
      expect(headerBox).not.toBeNull();
      const headerBottom = (headerBox?.y ?? 0) + (headerBox?.height ?? 54);

      // Verify topic crumbs and title are completely below the header
      const crumbsBox = await page.locator('.topic-crumbs').boundingBox();
      expect(crumbsBox).not.toBeNull();
      expect(crumbsBox!.y).toBeGreaterThanOrEqual(headerBottom);

      const titleBox = await page.locator('.topic-title').boundingBox();
      expect(titleBox).not.toBeNull();
      expect(titleBox!.y).toBeGreaterThan(crumbsBox!.y);

      // Screenshot for audit
      await page.screenshot({
        path: `${artifactDir}/learn-topic-${vp.name}.png`,
        fullPage: false,
      });
    }

    // 3. Verify breakout image sizing & floating toolbar at 1440x900
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(200);

    const figure = page.locator('.study-figure');
    await expect(figure).toBeVisible();
    await expect(figure).toHaveClass(/mode-wide/);

    const figureBox = await figure.boundingBox();
    const proseBox = await page.locator('.study-quote').boundingBox();
    expect(figureBox).not.toBeNull();
    expect(proseBox).not.toBeNull();
    // Wide mode breakout is wider than standard prose
    expect(figureBox!.width).toBeGreaterThan(proseBox!.width);
    expect(figureBox!.width).toBeGreaterThanOrEqual(1000);

    // Test width toggling
    await figure.hover();
    const toolbar = page.locator('.study-figure-toolbar');
    await expect(toolbar).toBeVisible();

    // Toggle to Fit
    await toolbar.getByRole('button', { name: 'Fit' }).click();
    await expect(figure).toHaveClass(/mode-normal/);

    // Toggle to Full
    await toolbar.getByRole('button', { name: 'Full' }).click();
    await expect(figure).toHaveClass(/mode-full/);

    // Toggle back to Wide
    await toolbar.getByRole('button', { name: 'Wide' }).click();
    await expect(figure).toHaveClass(/mode-wide/);

    // 4. Verify Fullscreen Study Lightbox
    await figure.locator('img').click();
    const lightbox = page.getByRole('dialog', { name: 'Study note inspection viewer' });
    await expect(lightbox).toBeVisible();

    // Take screenshot of lightbox inspection
    await page.screenshot({
      path: `${artifactDir}/learn-lightbox-inspect.png`,
    });

    // Zoom in
    await lightbox.getByRole('button', { name: 'Zoom in' }).click();
    await expect(lightbox.getByText('125%')).toBeVisible();

    // Fit reset
    await lightbox.getByRole('button', { name: 'Fit to screen' }).click();
    await expect(lightbox.locator('span.font-mono', { hasText: '100%' })).toBeVisible();

    // Close via Escape
    await page.keyboard.press('Escape');
    await expect(lightbox).toBeHidden();

    // 5. Verify rich elements: callout, table, code block
    await expect(page.locator('.study-callout')).toContainText('NOTE: Numerical differentiation');
    await expect(page.locator('.study-table-wrap')).toContainText('Sobel');
    await expect(page.locator('.study-table-wrap')).toContainText('Prewitt');
    await expect(page.locator('.study-code')).toContainText('compute_gradient_magnitude');

    // 6. Verify Edit mode & upload tools
    await page.getByRole('button', { name: 'Edit' }).click();
    await expect(page.getByText('Writing Mode')).toBeVisible();
    await expect(page.getByRole('toolbar', { name: 'Text formatting' })).toBeVisible();

    // Click Done to finish editing
    await page.getByRole('button', { name: 'Done' }).click();
    await expect(page.getByText('Study Mode')).toBeVisible();
  } finally {
    // Cleanup created records and storage asset
    if (storagePath) {
      await client.storage.from('learning-assets').remove([storagePath]);
    }
    await client.from('subjects').delete().eq('id', subject.id);
  }
});

test('multi-page notebook scans and page navigation in study lightbox', async ({ page }) => {
  test.setTimeout(180000);

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
  const client = createClient(supabaseUrl, supabaseKey);

  const { data: auth, error: authError } = await client.auth.signInWithPassword({
    email,
    password,
  });
  if (authError) throw authError;

  const suffix = Date.now();
  const { data: subject, error: subError } = await client
    .from('subjects')
    .insert({
      user_id: auth.user.id,
      title: `Multi-page Study Notes ${suffix}`,
      slug: `multipage-${suffix}`,
      order_index: 999,
    })
    .select()
    .single();
  if (subError) throw subError;

  const paths: string[] = [];

  try {
    const { data: section, error: secError } = await client
      .from('learning_sections')
      .insert({
        user_id: auth.user.id,
        subject_id: subject.id,
        title: 'Notebook Scans',
        order_index: 0,
      })
      .select()
      .single();
    if (secError) throw secError;

    const { data: topic, error: topError } = await client
      .from('topics')
      .insert({
        user_id: auth.user.id,
        subject_id: subject.id,
        section_id: section.id,
        title: '2D Convolution & Gaussian Derivation',
        slug: `conv-notes-${suffix}`,
        order_index: 0,
        status: 'learning',
      })
      .select()
      .single();
    if (topError) throw topError;

    // Upload 2 notebook page sheets
    const noteBuffer = readFileSync('tests/fixtures/edge-basics-note.png');
    const path1 = `${auth.user.id}/${topic.id}/page-1-${suffix}.png`;
    const path2 = `${auth.user.id}/${topic.id}/page-2-${suffix}.png`;
    paths.push(path1, path2);

    await client.storage.from('learning-assets').upload(path1, noteBuffer, { contentType: 'image/png' });
    await client.storage.from('learning-assets').upload(path2, noteBuffer, { contentType: 'image/png' });

    const docContent = [
      {
        type: 'heading',
        props: { level: 1 },
        content: '2D Convolution & Gaussian Derivation Notes',
      },
      {
        type: 'image',
        props: {
          url: `/api/learning-assets?path=${encodeURIComponent(path1)}`,
          name: 'notebook-page-1.png',
          caption: 'Notebook Scan: Page 1 — Continuous to discrete 2D convolution integral',
        },
      },
      {
        type: 'image',
        props: {
          url: `/api/learning-assets?path=${encodeURIComponent(path2)}`,
          name: 'notebook-page-2.png',
          caption: 'Notebook Scan: Page 2 — Gaussian kernel normalization & sigma cutoff',
        },
      },
    ];

    await client.from('topic_documents').insert({
      user_id: auth.user.id,
      topic_id: topic.id,
      content_json: docContent,
      plain_text: '2D Convolution & Gaussian Derivation Notes',
      version: 1,
    });

    // Login via browser
    await page.goto('/login');
    await page.getByPlaceholder('Email address').fill(email);
    await page.getByPlaceholder('Password').fill(password);
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page).toHaveURL('/');

    // Navigate to topic
    await page.goto(`/learning/${subject.slug}/${topic.slug}`);
    await page.waitForLoadState('networkidle');

    // 1. Verify multi-page note badge in topline
    await expect(page.locator('.topic-note-badge')).toContainText('2 note sheets');

    // 2. Verify page badges on individual figures
    await expect(page.locator('.study-figure-page-badge').first()).toContainText('Page 1 of 2');
    await expect(page.locator('.study-figure-page-badge').nth(1)).toContainText('Page 2 of 2');

    // 3. Open Lightbox on first page
    await page.locator('.study-figure img').first().click();
    const lightbox = page.getByRole('dialog', { name: 'Study note inspection viewer' });
    await expect(lightbox).toBeVisible();
    await expect(lightbox.getByText('Page 1 of 2')).toBeVisible();

    // 4. Navigate to next page using the next button in lightbox
    await lightbox.getByRole('button', { name: 'Next note page' }).click();
    await expect(lightbox.getByText('Page 2 of 2')).toBeVisible();

    // 5. Navigate back to previous page using keyboard ArrowLeft
    await page.keyboard.press('ArrowLeft');
    await expect(lightbox.getByText('Page 1 of 2')).toBeVisible();

    // 6. Close lightbox via Esc
    await page.keyboard.press('Escape');
    await expect(lightbox).toBeHidden();
  } finally {
    for (const p of paths) {
      await client.storage.from('learning-assets').remove([p]);
    }
    await client.from('subjects').delete().eq('id', subject.id);
  }
});
