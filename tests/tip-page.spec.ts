import { test, expect } from '@playwright/test';

const MOCK_WALLET_CORRECT_NETWORK = {
  address: '0xAbCdEf1234567890AbCdEf1234567890AbCdEf12',
  isConnected: true,
  chainId: 84532, // Base Sepolia
};

const MOCK_WALLET_WRONG_NETWORK = {
  address: '0xAbCdEf1234567890AbCdEf1234567890AbCdEf12',
  isConnected: true,
  chainId: 1, // Ethereum mainnet
};

function seedCreator(page: import('@playwright/test').Page, slug: string, theme = 'coffee') {
  return page.evaluate(
    ({ s, t }) => {
      const creators = {
        [s]: {
          slug: s,
          walletAddress: '0xDeAdBeEf1234567890AbCdEf1234567890DeAdBe',
          displayName: 'Test Creator',
          description: 'A test creator for E2E testing',
          suggestedAmounts: [
            { value: '0.001', label: 'Coffee' },
            { value: '0.003', label: 'Cappuccino' },
            { value: '0.005', label: 'Latte' },
            { value: '0.01', label: 'Meal' },
          ],
          theme: t,
          createdAt: Date.now(),
        },
      };
      localStorage.setItem('givemecoffee_creators', JSON.stringify(creators));
    },
    { s: slug, t: theme }
  );
}

test.describe('Tip Page - Creator Not Found', () => {
  test('shows not found for invalid creator slug', async ({ page }) => {
    await page.goto('/tip/nonexistent-creator-abc123');
    await expect(page.locator('text=Creator Not Found')).toBeVisible();
    await expect(page.locator('text=Go Home')).toBeVisible();
  });

  test('Go Home link navigates to homepage', async ({ page }) => {
    await page.goto('/tip/nonexistent-creator-abc123');
    await page.click('text=Go Home');
    await expect(page).toHaveURL('/');
  });
});

test.describe('Tip Page - Disconnected Wallet', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await seedCreator(page, 'test-disconnected');
    await page.goto('/tip/test-disconnected');
  });

  test('displays creator info', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Test Creator');
    await expect(page.locator('text=A test creator for E2E testing')).toBeVisible();
  });

  test('shows connect wallet button when not connected', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Connect Wallet' })).toBeVisible();
  });

  test('displays powered by footer', async ({ page }) => {
    await expect(page.locator('text=Powered by Give Me Coffee')).toBeVisible();
  });

  test('does NOT show amount buttons or message input', async ({ page }) => {
    await expect(page.locator('text=Choose Amount')).not.toBeVisible();
    await expect(page.locator('input[maxlength="64"]')).not.toBeVisible();
  });
});

test.describe('Tip Page - Wrong Network', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(
      `window.__E2E_WALLET_MOCK__ = ${JSON.stringify(MOCK_WALLET_WRONG_NETWORK)};`
    );
    await page.goto('/');
    await seedCreator(page, 'test-wrongnet');
    await page.goto('/tip/test-wrongnet');
  });

  test('shows wrong network warning', async ({ page }) => {
    await expect(page.locator('text=Wrong Network')).toBeVisible();
    await expect(page.locator('text=Please switch to Base')).toBeVisible();
  });

  test('shows switch to Base button', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Switch to Base' })).toBeVisible();
  });

  test('does NOT show donation form', async ({ page }) => {
    await expect(page.locator('text=Choose Amount')).not.toBeVisible();
  });
});

test.describe('Tip Page - Connected & Correct Network (donation form)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(
      `window.__E2E_WALLET_MOCK__ = ${JSON.stringify(MOCK_WALLET_CORRECT_NETWORK)};`
    );
    await page.goto('/');
    await seedCreator(page, 'test-connected');
    await page.goto('/tip/test-connected');
  });

  test('shows donation form with amount buttons', async ({ page }) => {
    await expect(page.locator('text=Choose Amount (ETH)')).toBeVisible();
    await expect(page.locator('.font-semibold', { hasText: '0.001 ETH' })).toBeVisible();
    await expect(page.locator('.font-semibold', { hasText: '0.003 ETH' })).toBeVisible();
    await expect(page.locator('.font-semibold', { hasText: '0.005 ETH' })).toBeVisible();
    await expect(page.locator('.font-semibold', { hasText: '0.01 ETH' })).toBeVisible();
  });

  test('shows message input with character counter', async ({ page }) => {
    const msgInput = page.locator('input[placeholder="Thanks for the great work!"]');
    await expect(msgInput).toBeVisible();
    await expect(page.locator('text=0/64')).toBeVisible();
  });

  test('shows custom amount input', async ({ page }) => {
    await expect(page.locator('input[type="number"]')).toBeVisible();
    await expect(page.locator('text=Or enter custom amount')).toBeVisible();
  });

  test('send button shows selected amount', async ({ page }) => {
    // Default first amount should be pre-selected
    const sendBtn = page.getByRole('button', { name: /Send 0.001 ETH/ });
    await expect(sendBtn).toBeVisible();
  });

  test('clicking different amount updates send button', async ({ page }) => {
    await page.locator('.font-semibold', { hasText: '0.01 ETH' }).click();
    const sendBtn = page.getByRole('button', { name: /Send 0.01 ETH/ });
    await expect(sendBtn).toBeVisible();
  });

  test('custom amount overrides preset selection', async ({ page }) => {
    await page.locator('input[type="number"]').fill('0.042');
    const sendBtn = page.getByRole('button', { name: /Send 0.042 ETH/ });
    await expect(sendBtn).toBeVisible();
  });

  test('does NOT show connect wallet or wrong network UI', async ({ page }) => {
    await expect(page.locator('button', { hasText: 'Connect Wallet' })).not.toBeVisible();
    await expect(page.locator('text=Wrong Network')).not.toBeVisible();
  });
});

test.describe('Tip Page - Responsive Design', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await seedCreator(page, 'responsive-test', 'modern');
  });

  test('mobile viewport: no horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/tip/responsive-test');

    await expect(page.locator('h1')).toContainText('Test Creator');
    await expect(page.getByRole('button', { name: 'Connect Wallet' })).toBeVisible();

    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyScrollWidth).toBeLessThanOrEqual(375);
  });

  test('mobile viewport: card fits within screen', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/tip/responsive-test');

    const card = page.locator('.rounded-2xl').first();
    await expect(card).toBeVisible();
    const box = await card.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeLessThanOrEqual(375);
  });

  test('desktop viewport: card is centered with max-width', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/tip/responsive-test');

    await expect(page.locator('h1')).toContainText('Test Creator');
    const wrapper = page.locator('.max-w-md').first();
    await expect(wrapper).toBeVisible();
    const box = await wrapper.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeLessThanOrEqual(450);
  });
});

test.describe('Tip Page - Theme Variations', () => {
  const themes = ['coffee', 'modern', 'minimal', 'fun'] as const;

  for (const theme of themes) {
    test(`renders with ${theme} theme`, async ({ page }) => {
      await page.goto('/');
      await page.evaluate(
        (t) => {
          const creators = {
            [`theme-test-${t}`]: {
              slug: `theme-test-${t}`,
              walletAddress: '0xAbCdEf1234567890AbCdEf1234567890AbCdEf12',
              displayName: `${t} Theme Creator`,
              description: `Testing ${t} theme`,
              suggestedAmounts: [{ value: '0.001', label: 'Tip' }],
              theme: t,
              createdAt: Date.now(),
            },
          };
          localStorage.setItem('givemecoffee_creators', JSON.stringify(creators));
        },
        theme
      );
      await page.goto(`/tip/theme-test-${theme}`);

      await expect(page.locator('h1')).toContainText(`${theme} Theme Creator`);
      await expect(page.getByRole('button', { name: 'Connect Wallet' })).toBeVisible();
    });
  }
});
