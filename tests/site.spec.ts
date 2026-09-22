import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

test('homepage, navigation, contact and keyboard access', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Reliable data.',
  );
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('link', { name: 'Skip to content' }),
  ).toBeFocused();
  for (const name of ['Projects', 'Articles', 'Videos', 'About']) {
    await page
      .getByRole('navigation')
      .getByRole('link', { name, exact: true })
      .click();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(
      page.getByRole('navigation').getByRole('link', { name, exact: true }),
    ).toHaveAttribute('aria-current', 'page');
  }
  await expect(
    page.getByRole('link', { name: 'sunny_sharma2022@outlook.com' }),
  ).toHaveAttribute('href', 'mailto:sunny_sharma2022@outlook.com');
  await expect(page.getByRole('link', { name: 'LinkedIn ↗' })).toHaveAttribute(
    'href',
    'https://www.linkedin.com/in/sunny-sharma2022',
  );
});

test('published routes, metadata, images and mobile layout', async ({
  page,
}) => {
  for (const path of [
    './',
    'projects/',
    'projects/autodocs/',
    'projects/agentic-demo/',
    'projects/document-qa/',
    'projects/ai-sql-assistant/',
    'articles/',
    'articles/evidence-before-confidence/',
    'videos/',
    'about/',
  ]) {
    const response = await page.goto(path);
    expect(response?.ok()).toBeTruthy();
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      /https:\/\/sunshine-engineer.github.io\//,
    );
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      /\/social-card.png$/,
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBeTruthy();
    expect(
      await page
        .locator('img')
        .evaluateAll((images) =>
          images.every(
            (img) =>
              img instanceof HTMLImageElement &&
              img.complete &&
              img.naturalWidth > 0,
          ),
        ),
    ).toBeTruthy();
  }
});

test('article code, headings and internal links resolve', async ({
  page,
  request,
}) => {
  await page.goto('articles/evidence-before-confidence/');
  await expect(page.locator('pre code')).toContainText(
    'test_write_requires_approval',
  );
  await page.locator('.toc').getByRole('link').first().click();
  expect(new URL(page.url()).hash).toBeTruthy();
  const links = await page
    .locator('a')
    .evaluateAll((nodes) =>
      nodes
        .map((node) => (node as HTMLAnchorElement).href)
        .filter((url) => url.startsWith(location.origin)),
    );
  for (const link of new Set(links))
    expect((await request.get(link.split('#')[0])).ok()).toBeTruthy();
});

test('drafts absent from output and feeds retain base path', async ({
  request,
}) => {
  expect(existsSync('dist/videos/agentic-walkthrough/index.html')).toBeFalsy();
  expect(existsSync('dist/articles/test-draft-fixture/index.html')).toBeFalsy();
  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((name) => {
      const path = join(dir, name);
      return statSync(path).isDirectory() ? walk(path) : [path];
    });
  for (const path of walk('dist').filter((path) =>
    /\.(html|xml)$/.test(path),
  )) {
    const text = readFileSync(path, 'utf8');
    expect(text).not.toContain('DRAFT_SENTINEL_8372');
    expect(text).not.toContain('/videos/agentic-walkthrough/');
    expect(text).not.toContain('/articles/test-draft-fixture/');
  }
  for (const path of ['rss.xml', 'sitemap-0.xml']) {
    const response = await request.get(path);
    expect(response.ok()).toBeTruthy();
    expect(await response.text()).toContain(
      'https://sunshine-engineer.github.io/articles/evidence-before-confidence/',
    );
  }
});

test('video loads on activation, with an external fallback', async ({
  page,
}) => {
  let embeds = 0;
  await page.route('https://www.youtube-nocookie.com/**', async (route) => {
    embeds++;
    await route.fulfill({
      contentType: 'text/html',
      body: '<html><body>Player fixture</body></html>',
    });
  });
  await page.goto('videos/test-player-fixture/');
  await expect(page.locator('iframe')).toHaveCount(0);
  expect(embeds).toBe(0);
  await expect(
    page.getByRole('link', { name: 'Watch on YouTube ↗' }),
  ).toHaveAttribute('href', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  await page.getByRole('button', { name: 'Play Test player' }).click();
  await expect(page.locator('iframe')).toHaveAttribute(
    'src',
    'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1',
  );
  await expect.poll(() => embeds).toBe(1);
  await expect(
    page.getByRole('link', { name: /Related project/ }),
  ).toHaveAttribute('href', '/projects/agentic-demo/');
});
