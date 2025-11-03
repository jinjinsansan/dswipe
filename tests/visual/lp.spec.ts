import { test, expect } from '@playwright/test';

const ROUTES = [
  { path: '/responsive-preview', label: 'responsive-preview' },
];

test.describe('Landing page responsive snapshots', () => {
  for (const route of ROUTES) {
    test(`captures ${route.label} layout`, async ({ page }, testInfo) => {
      await page.route('**/*', async (route) => {
        const request = route.request();
        const url = request.url();
        if (url.startsWith('https://fonts.googleapis.com') || url.startsWith('https://fonts.gstatic.com')) {
          const isFontBinary = request.resourceType() === 'font';
          await route.fulfill({
            status: 200,
            contentType: isFontBinary ? 'font/woff2' : 'text/css',
            body: '',
          });
          return;
        }

        if (request.resourceType() === 'image' && url.startsWith('http')) {
          await route.abort();
          return;
        }

        await route.continue();
      });

      await page.goto(route.path, { waitUntil: 'load' });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.waitForTimeout(250);

      await expect(page).toHaveScreenshot(`${route.label}-${testInfo.project.name}.png`, {
        fullPage: true,
        animations: 'disabled',
        caret: 'hide',
        maxDiffPixelRatio: 0.02,
      });
    });
  }
});
