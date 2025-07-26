import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5174';

test('Debug - Check what actually loads on factory page', async ({ page }) => {
  // Enable console logging
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  // Go to factory page
  await page.goto(`${BASE_URL}/factory`);
  
  // Wait for page to load
  await page.waitForTimeout(3000);
  
  // Take a screenshot
  await page.screenshot({ path: 'debug-factory-page.png', fullPage: true });
  
  // Get page title
  const title = await page.title();
  console.log('PAGE TITLE:', title);
  
  // Get page content
  const bodyText = await page.locator('body').textContent();
  console.log('BODY TEXT (first 500 chars):', bodyText?.substring(0, 500));
  
  // Check for any h1 elements
  const h1Elements = await page.locator('h1').all();
  console.log('H1 ELEMENTS FOUND:', h1Elements.length);
  
  for (let i = 0; i < h1Elements.length; i++) {
    const text = await h1Elements[i].textContent();
    console.log(`H1[${i}]:`, text);
  }
  
  // The test should always pass - we're just debugging
  expect(true).toBe(true);
});