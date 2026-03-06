import { test, expect } from '@playwright/test';

const MOCK_WALLET_CORRECT = {
  address: '0xAbCdEf1234567890AbCdEf1234567890AbCdEf12',
  isConnected: true,
  chainId: 84532,
};

const MOCK_WALLET_WRONG = {
  address: '0xAbCdEf1234567890AbCdEf1234567890AbCdEf12',
  isConnected: true,
  chainId: 1,
};

function seedEmbed(page: import('@playwright/test').Page) {
  return page.evaluate(() => {
    const creators = {
      'embed-test-abcdef': {
        slug: 'embed-test-abcdef',
        walletAddress: '0xDeAdBeEf1234567890AbCdEf1234567890DeAdBe',
        displayName: 'Embed Creator',
        description: 'Testing embed page',
        suggestedAmounts: [
          { value: '0.001', label: 'Coffee' },
          { value: '0.003', label: 'Cappuccino' },
        ],
        theme: 'coffee',
        createdAt: Date.now(),
      },
    };
    localStorage.setItem('givemecoffee_creators', JSON.stringify(creators));
  });
}

test.describe('Embed Page - Disconnected', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await seedEmbed(page);
  });

  test('renders without navbar (minimal chrome)', async ({ page }) => {
    await page.goto('/embed/embed-test-abcdef');
    await expect(page.locator('h2')).toContainText('Embed Creator');
    // No nav element should exist
    const navCount = await page.locator('nav').count();
    expect(navCount).toBe(0);
  });

  test('shows connect wallet button', async ({ page }) => {
    await page.goto('/embed/embed-test-abcdef');
    await expect(page.locator('button', { hasText: 'Connect Wallet' })).toBeVisible();
  });

  test('displays creator description', async ({ page }) => {
    await page.goto('/embed/embed-test-abcdef');
    await expect(page.locator('text=Testing embed page')).toBeVisible();
  });

  test('shows footer link', async ({ page }) => {
    await page.goto('/embed/embed-test-abcdef');
    await expect(page.locator('text=Give Me Coffee')).toBeVisible();
  });

  test('not found creator shows error', async ({ page }) => {
    await page.goto('/embed/nonexistent-slug');
    await expect(page.locator('text=Creator not found')).toBeVisible();
  });

  test('fits within iframe dimensions (400x520) without horizontal scroll', async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 520 });
    await page.goto('/embed/embed-test-abcdef');

    await expect(page.locator('h2')).toContainText('Embed Creator');
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(400);
  });
});

test.describe('Embed Page - Wrong Network', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(`window.__E2E_WALLET_MOCK__ = ${JSON.stringify(MOCK_WALLET_WRONG)};`);
    await page.goto('/');
    await seedEmbed(page);
    await page.goto('/embed/embed-test-abcdef');
  });

  test('shows switch network prompt', async ({ page }) => {
    await expect(page.locator('text=Switch to Base network')).toBeVisible();
    await expect(page.locator('button', { hasText: 'Switch Network' })).toBeVisible();
  });

  test('does not show donation form', async ({ page }) => {
    await expect(page.locator('input[type="number"]')).not.toBeVisible();
  });
});

test.describe('Embed Page - Connected & Correct Network', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(`window.__E2E_WALLET_MOCK__ = ${JSON.stringify(MOCK_WALLET_CORRECT)};`);
    await page.goto('/');
    await seedEmbed(page);
    await page.goto('/embed/embed-test-abcdef');
  });

  test('shows donation form with amount buttons', async ({ page }) => {
    await expect(page.locator('button >> text=0.001 ETH').first()).toBeVisible();
    await expect(page.locator('button >> text=0.003 ETH').first()).toBeVisible();
  });

  test('shows custom amount input', async ({ page }) => {
    await expect(page.locator('input[placeholder="Custom amount (ETH)"]')).toBeVisible();
  });

  test('shows message input', async ({ page }) => {
    await expect(
      page.locator('input[placeholder="Message (optional, max 64 chars)"]')
    ).toBeVisible();
  });

  test('send button reflects selected amount', async ({ page }) => {
    const sendBtn = page.locator('button', { hasText: /Send 0.001 ETH/ });
    await expect(sendBtn).toBeVisible();

    await page.locator('.font-semibold', { hasText: '0.003 ETH' }).click();
    await expect(page.locator('button', { hasText: /Send 0.003 ETH/ })).toBeVisible();
  });

  test('custom amount overrides preset', async ({ page }) => {
    await page.locator('input[placeholder="Custom amount (ETH)"]').fill('0.007');
    await expect(page.locator('button', { hasText: /Send 0.007 ETH/ })).toBeVisible();
  });

  test('does not show connect wallet or switch network', async ({ page }) => {
    await expect(page.locator('button', { hasText: 'Connect Wallet' })).not.toBeVisible();
    await expect(page.locator('text=Switch to Base network')).not.toBeVisible();
  });
});
