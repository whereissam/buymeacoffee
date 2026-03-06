import { test, expect } from '@playwright/test';

const MOCK_WALLET = {
  address: '0xAbCdEf1234567890AbCdEf1234567890AbCdEf12',
  isConnected: true,
  chainId: 84532,
};

test.describe('Creator Setup Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/create');
  });

  test('shows connect wallet step initially', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Create Your Tip Page');
    await expect(page.locator('h2')).toContainText('Connect Your Wallet');
    await expect(page.getByRole('button', { name: 'Connect Wallet' })).toBeVisible();
  });

  test('progress stepper shows all 3 step indicators', async ({ page }) => {
    // Step circles numbered 1, 2, 3 should all be present
    const stepCircles = page.locator('.rounded-full.flex.items-center.justify-center');
    await expect(stepCircles).toHaveCount(3);
    await expect(stepCircles.nth(0)).toContainText('1');
    await expect(stepCircles.nth(1)).toContainText('2');
    await expect(stepCircles.nth(2)).toContainText('3');
  });

  test('step 1 circle is active (primary color), others are inactive', async ({ page }) => {
    const stepCircles = page.locator('.rounded-full.flex.items-center.justify-center');
    // Step 1 should have primary styling
    await expect(stepCircles.nth(0)).toHaveClass(/bg-primary/);
    // Steps 2 and 3 should have muted styling
    await expect(stepCircles.nth(1)).toHaveClass(/bg-muted/);
    await expect(stepCircles.nth(2)).toHaveClass(/bg-muted/);
  });

  test('wallet connect button is clickable', async ({ page }) => {
    const btn = page.getByRole('button', { name: 'Connect Wallet' });
    await expect(btn).toBeEnabled();
  });
});

test.describe('Creator Setup - Connected Wallet (configure step)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(`window.__E2E_WALLET_MOCK__ = ${JSON.stringify(MOCK_WALLET)};`);
    await page.goto('/create');
  });

  test('auto-advances to configure step when wallet is connected', async ({ page }) => {
    // Should show the configure form, not the connect step
    await expect(page.locator('text=Display Name')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create Tip Page' })).toBeVisible();
  });

  test('shows connected wallet address', async ({ page }) => {
    await expect(page.locator('text=Connected:')).toBeVisible();
    await expect(page.locator('text=0xAbCd...Ef12')).toBeVisible();
  });

  test('theme selection works', async ({ page }) => {
    // Click Modern theme
    await page.click('text=Modern');
    const modernBtn = page.locator('button', { hasText: 'Modern' });
    await expect(modernBtn).toHaveClass(/border-primary/);
  });

  test('customize amounts toggle works', async ({ page }) => {
    // Click Customize link
    await page.click('text=Customize');
    // Amount inputs should now be editable
    const amountInputs = page.locator('input[placeholder="0.001"]');
    if (await amountInputs.count() > 0) {
      await expect(amountInputs.first()).toBeEnabled();
    }
  });

  test('full setup flow: configure and create', async ({ page }) => {
    // Fill display name
    await page.locator('input[placeholder="Your name or project name"]').fill('E2E Test Creator');
    await page.locator('textarea').fill('Created by E2E tests');

    // Select Fun theme
    await page.click('text=Fun & Colorful');

    // Create
    await page.click('text=Create Tip Page');

    // Should advance to "done" step
    await expect(page.locator('h2')).toContainText('Your Tip Page is Ready');
    await expect(page.locator('text=Hosted Page URL')).toBeVisible();
    await expect(page.locator('text=Iframe Embed Code')).toBeVisible();
    await expect(page.locator('text=GitHub Badge Markdown')).toBeVisible();
  });

  test('done step shows correct URLs', async ({ page }) => {
    await page.locator('input[placeholder="Your name or project name"]').fill('URL Test');
    await page.click('text=Create Tip Page');

    // URL should contain /tip/ and the slug
    const urlText = page.locator('text=/tip/').first();
    await expect(urlText).toBeVisible();
  });

  test('edit settings returns to configure step', async ({ page }) => {
    await page.locator('input[placeholder="Your name or project name"]').fill('Edit Test');
    await page.click('text=Create Tip Page');
    await expect(page.locator('h2')).toContainText('Your Tip Page is Ready');

    await page.click('text=Edit Settings');
    await expect(page.locator('text=Display Name')).toBeVisible();
  });
});

test.describe('Creator Setup - Responsive', () => {
  test('renders correctly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/create');

    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Connect Wallet' })).toBeVisible();

    // Verify no horizontal overflow
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyScrollWidth).toBeLessThanOrEqual(375);
  });

  test('renders correctly on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/create');

    await expect(page.locator('h1')).toContainText('Create Your Tip Page');
    await expect(page.getByRole('button', { name: 'Connect Wallet' })).toBeVisible();
  });

  test('configure step is usable on mobile', async ({ page }) => {
    await page.addInitScript(`window.__E2E_WALLET_MOCK__ = ${JSON.stringify(MOCK_WALLET)};`);
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/create');

    // Should be able to fill the form
    await page.locator('input[placeholder="Your name or project name"]').fill('Mobile Test');
    const createBtn = page.getByRole('button', { name: 'Create Tip Page' });
    await expect(createBtn).toBeEnabled();

    // No horizontal overflow
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyScrollWidth).toBeLessThanOrEqual(375);
  });
});
