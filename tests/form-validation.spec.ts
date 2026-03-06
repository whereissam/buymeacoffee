import { test, expect } from '@playwright/test';

const MOCK_WALLET = {
  address: '0xAbCdEf1234567890AbCdEf1234567890AbCdEf12',
  isConnected: true,
  chainId: 84532, // Base Sepolia
};

function seedCreator(page: import('@playwright/test').Page, slug: string) {
  return page.evaluate((s) => {
    const creators = {
      [s]: {
        slug: s,
        walletAddress: '0xDeAdBeEf1234567890AbCdEf1234567890DeAdBe',
        displayName: 'Validation Creator',
        description: '',
        suggestedAmounts: [
          { value: '0.001', label: 'Coffee' },
          { value: '0.01', label: 'Meal' },
        ],
        theme: 'minimal',
        createdAt: Date.now(),
      },
    };
    localStorage.setItem('givemecoffee_creators', JSON.stringify(creators));
  }, slug);
}

test.describe('Form Validation - Tip Page (connected wallet)', () => {
  test.beforeEach(async ({ page }) => {
    // Inject wallet mock before navigation
    await page.addInitScript(`window.__E2E_WALLET_MOCK__ = ${JSON.stringify(MOCK_WALLET)};`);
    await page.goto('/');
    await seedCreator(page, 'val-tip-abc123');
    await page.goto('/tip/val-tip-abc123');
  });

  test('message input enforces 64 character maxLength on the actual element', async ({ page }) => {
    const msgInput = page.locator('input[placeholder="Thanks for the great work!"]');
    await expect(msgInput).toBeVisible();
    await expect(msgInput).toHaveAttribute('maxlength', '64');
  });

  test('message input truncates text beyond 64 characters', async ({ page }) => {
    const msgInput = page.locator('input[placeholder="Thanks for the great work!"]');
    const longText = 'A'.repeat(80);
    await msgInput.fill(longText);
    const value = await msgInput.inputValue();
    expect(value.length).toBeLessThanOrEqual(64);
  });

  test('character counter updates with input', async ({ page }) => {
    const msgInput = page.locator('input[placeholder="Thanks for the great work!"]');
    await msgInput.fill('Hello');
    await expect(page.locator('text=5/64')).toBeVisible();
  });

  test('send button is disabled when no amount selected and custom is empty', async ({ page }) => {
    // Clear the custom amount field and deselect preset
    const customInput = page.locator('input[type="number"]');
    await customInput.fill('0');
    // Button should be disabled for zero amount
    const sendBtn = page.getByRole('button', { name: /Send .* ETH/ });
    await expect(sendBtn).toBeDisabled();
  });

  test('preset amount buttons are visible and selectable', async ({ page }) => {
    await expect(page.locator('.font-semibold', { hasText: '0.001 ETH' })).toBeVisible();
    await expect(page.locator('.font-semibold', { hasText: '0.01 ETH' })).toBeVisible();
    // Click a preset
    await page.locator('.font-semibold', { hasText: '0.01 ETH' }).click();
    const sendBtn = page.getByRole('button', { name: /Send 0.01 ETH/ });
    await expect(sendBtn).toBeVisible();
  });

  test('custom amount input accepts decimal values', async ({ page }) => {
    const customInput = page.locator('input[type="number"]');
    await customInput.fill('0.0042');
    const sendBtn = page.getByRole('button', { name: /Send 0.0042 ETH/ });
    await expect(sendBtn).toBeEnabled();
  });
});

test.describe('Form Validation - Creator Setup (connected wallet)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(`window.__E2E_WALLET_MOCK__ = ${JSON.stringify(MOCK_WALLET)};`);
    await page.goto('/create');
  });

  test('display name is required - button disabled when empty', async ({ page }) => {
    // With mock wallet, we should auto-advance to configure step
    const createBtn = page.getByRole('button', { name: 'Create Tip Page' });
    await expect(createBtn).toBeVisible();
    await expect(createBtn).toBeDisabled();
  });

  test('display name enables button when filled', async ({ page }) => {
    const nameInput = page.locator('input[placeholder="Your name or project name"]');
    await nameInput.fill('Test Creator');
    const createBtn = page.getByRole('button', { name: 'Create Tip Page' });
    await expect(createBtn).toBeEnabled();
  });

  test('description character counter reflects input length', async ({ page }) => {
    const descInput = page.locator('textarea[placeholder="Tell supporters what you\'re building..."]');
    await descInput.fill('Hello world');
    await expect(page.locator('text=11/200')).toBeVisible();
  });

  test('description enforces 200 character maxLength', async ({ page }) => {
    const descInput = page.locator('textarea[placeholder="Tell supporters what you\'re building..."]');
    await expect(descInput).toHaveAttribute('maxlength', '200');
    await descInput.fill('X'.repeat(250));
    const value = await descInput.inputValue();
    expect(value.length).toBeLessThanOrEqual(200);
  });

  test('display name enforces 50 character maxLength', async ({ page }) => {
    const nameInput = page.locator('input[placeholder="Your name or project name"]');
    await expect(nameInput).toHaveAttribute('maxlength', '50');
  });
});

test.describe('Form Validation - Embed Page (connected wallet)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(`window.__E2E_WALLET_MOCK__ = ${JSON.stringify(MOCK_WALLET)};`);
    await page.goto('/');
    await seedCreator(page, 'embed-val-abc123');
    await page.goto('/embed/embed-val-abc123');
  });

  test('message input has maxlength=64 attribute', async ({ page }) => {
    const msgInput = page.locator('input[placeholder="Message (optional, max 64 chars)"]');
    await expect(msgInput).toBeVisible();
    await expect(msgInput).toHaveAttribute('maxlength', '64');
  });

  test('message input actually truncates long text', async ({ page }) => {
    const msgInput = page.locator('input[placeholder="Message (optional, max 64 chars)"]');
    await msgInput.fill('B'.repeat(100));
    const value = await msgInput.inputValue();
    expect(value.length).toBeLessThanOrEqual(64);
  });
});
