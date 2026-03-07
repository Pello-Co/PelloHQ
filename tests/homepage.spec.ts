import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    // Disable animations for stable tests
    await page.addInitScript(() => {
      const style = document.createElement('style');
      style.textContent = `*, *::before, *::after { animation-duration: 0ms !important; transition-duration: 0ms !important; }`;
      document.head.appendChild(style);
    });
    await page.goto('/');
  });

  test('page loads and has correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Pello/);
  });

  test('hero section is visible', async ({ page }) => {
    await expect(page.locator('#hero')).toBeVisible();
    await expect(page.locator('#hero-headline')).toBeVisible();
  });

  test('hero headline contains key text', async ({ page }) => {
    const headline = page.locator('#hero-headline');
    await expect(headline).toContainText('growth');
  });

  test('primary CTA button is visible', async ({ page }) => {
    const cta = page.locator('a[href="#early-access"]').first();
    await expect(cta).toBeVisible();
  });

  test('URL input is present and functional', async ({ page }) => {
    const input = page.locator('#hero-url-input');
    await expect(input).toBeVisible();
    await input.fill('https://example.com');
    await expect(input).toHaveValue('https://example.com');
  });

  test('navigation is visible', async ({ page }) => {
    await expect(page.locator('header[role="banner"]')).toBeVisible();
    await expect(page.locator('nav[aria-label="Main navigation"]')).toBeVisible();
  });

  test('all 8 products are shown', async ({ page }) => {
    const productNames = ['PelloSEO', 'PelloReach', 'PelloPublish', 'PelloSocial', 'PelloPitch', 'PelloAds', 'PelloFlow', 'PelloBuild'];
    for (const name of productNames) {
      await expect(page.locator(`text=${name}`).first()).toBeVisible();
    }
  });

  test('FAQ section is accessible', async ({ page }) => {
    const faqSection = page.locator('#faq');
    await expect(faqSection).toBeVisible();

    // Click first FAQ item
    const firstTrigger = page.locator('.faq-trigger').first();
    await expect(firstTrigger).toBeVisible();
    await firstTrigger.click();
    await expect(firstTrigger).toHaveAttribute('aria-expanded', 'true');
  });

  test('footer is present with legal links', async ({ page }) => {
    await expect(page.locator('footer[role="contentinfo"]')).toBeVisible();
    await expect(page.locator('text=Privacy Policy')).toBeVisible();
  });

  test('skip link is present', async ({ page }) => {
    const skipLink = page.locator('#skip-link');
    await expect(skipLink).toBeAttached();
  });
});

test.describe('Mobile navigation', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('mobile menu button is visible on small screens', async ({ page }) => {
    await page.goto('/');
    const menuBtn = page.locator('#mobile-menu-btn');
    await expect(menuBtn).toBeVisible();
  });

  test('mobile menu opens and closes', async ({ page }) => {
    await page.goto('/');
    const menuBtn = page.locator('#mobile-menu-btn');
    const menu = page.locator('#mobile-menu');

    // Open
    await menuBtn.click();
    await expect(menuBtn).toHaveAttribute('aria-expanded', 'true');
    await expect(menu).toBeVisible();

    // Close via button
    await menuBtn.click();
    await expect(menuBtn).toHaveAttribute('aria-expanded', 'false');
  });

  test('mobile menu closes on Escape', async ({ page }) => {
    await page.goto('/');
    await page.locator('#mobile-menu-btn').click();
    await page.keyboard.press('Escape');
    await expect(page.locator('#mobile-menu-btn')).toHaveAttribute('aria-expanded', 'false');
  });
});

test.describe('Visual snapshots', () => {
  test('hero snapshot', async ({ page }) => {
    await page.addInitScript(() => {
      const style = document.createElement('style');
      style.textContent = `*, *::before, *::after { animation: none !important; transition: none !important; }`;
      document.head.appendChild(style);
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#hero')).toHaveScreenshot('hero.png', {
      maxDiffPixelRatio: 0.05,
    });
  });
});
