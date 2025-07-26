import { test, expect } from '@playwright/test';

// Test configuration
const BASE_URL = 'http://localhost:5174';

test.describe('Widget Factory - Complete User Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Start from home page
    await page.goto(BASE_URL);
  });

  test('Homepage displays Factory call-to-action correctly', async ({ page }) => {
    // Check main headline
    await expect(page.locator('h1')).toContainText('Coffee Widget Factory');
    
    // Check main CTA button exists and has correct styling
    const createWidgetBtn = page.locator('text=🚀 Create Your Widget');
    await expect(createWidgetBtn).toBeVisible();
    await expect(createWidgetBtn).toHaveClass(/bg-gradient-to-r/);
    
    // Check demo button
    const demoBtn = page.locator('text=👀 See Demo');
    await expect(demoBtn).toBeVisible();
    
    // Check status indicator
    await expect(page.locator('text=✨ Completely Free • 🔒 Your Contract • 🌍 Works Anywhere')).toBeVisible();
  });

  test('Navigation to Widget Factory works', async ({ page }) => {
    // Click main CTA button
    await page.click('text=🚀 Create Your Widget');
    
    // Should navigate to factory page
    await expect(page).toHaveURL('/factory');
    await expect(page.locator('h1')).toContainText('Coffee Widget Factory');
  });

  test('Navigation bar highlights Create Widget correctly', async ({ page }) => {
    // Check navigation styling
    const createWidgetLink = page.locator('nav a[href="/factory"]');
    await expect(createWidgetLink).toBeVisible();
    await expect(createWidgetLink).toHaveClass(/bg-gradient-to-r/);
    await expect(createWidgetLink).toContainText('☕ Create Widget');
  });
});

test.describe('Widget Factory - Step by Step Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/factory`);
  });

  test('Factory page loads with correct initial state', async ({ page }) => {
    // Check main elements are present
    await expect(page.locator('h1')).toContainText('Coffee Widget Factory');
    await expect(page.locator('text=Create your own "Buy Me Coffee" widget in minutes!')).toBeVisible();
    
    // Check progress bar steps
    await expect(page.locator('text=Setup').first()).toBeVisible();
    await expect(page.locator('text=Customize').first()).toBeVisible();
    await expect(page.locator('text=Deploy').first()).toBeVisible();
    await expect(page.locator('text=Launch').first()).toBeVisible();
    
    // Check step 1 is active
    const step1 = page.locator('.bg-indigo-600').first();
    await expect(step1).toContainText('1');
    
    // Check step 1 content
    await expect(page.locator('h2')).toContainText('🎯 Basic Setup');
  });

  test('Step 1: Basic Setup form validation and navigation', async ({ page }) => {
    // Check all form fields are present
    await expect(page.locator('input[placeholder="Buy Me a Coffee! ☕"]')).toBeVisible();
    await expect(page.locator('textarea[placeholder="Support my work with a coffee!"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Creator Name"]')).toBeVisible();
    await expect(page.locator('input[placeholder="https://yoursite.com"]')).toBeVisible();
    
    // Fill out the form
    await page.fill('input[placeholder="Buy Me a Coffee! ☕"]', 'Support My Awesome Project! ☕');
    await page.fill('textarea[placeholder="Support my work with a coffee!"]', 'Help me build amazing things with your support!');
    await page.fill('input[placeholder="Creator Name"]', 'Test Creator');
    await page.fill('input[placeholder="https://yoursite.com"]', 'https://testcreator.com');
    
    // Continue to next step
    await page.click('text=Continue to Customization →');
    
    // Should be on step 2
    await expect(page.locator('h2')).toContainText('🎨 Customize Your Widget');
  });

  test('Step 2: Customization options work correctly', async ({ page }) => {
    // Navigate to step 2 first
    await page.fill('input[placeholder="Buy Me a Coffee! ☕"]', 'Test Widget');
    await page.fill('input[placeholder="Creator Name"]', 'Test Creator');
    await page.click('text=Continue to Customization →');
    
    // Check theme selection
    await expect(page.locator('text=Choose Theme')).toBeVisible();
    await expect(page.locator('text=☕ Coffee Shop')).toBeVisible();
    await expect(page.locator('text=🎨 Modern')).toBeVisible();
    await expect(page.locator('text=⚪ Minimal')).toBeVisible();
    await expect(page.locator('text=🎉 Fun & Colorful')).toBeVisible();
    
    // Test theme selection
    await page.click('text=🎨 Modern');
    const modernTheme = page.locator('text=🎨 Modern').locator('..');
    await expect(modernTheme).toHaveClass(/border-indigo-500/);
    
    // Check feature toggles
    await expect(page.locator('text=Widget Features')).toBeVisible();
    await expect(page.locator('text=Soundscape')).toBeVisible();
    await expect(page.locator('text=Achievements')).toBeVisible();
    await expect(page.locator('text=Custom Messages')).toBeVisible();
    await expect(page.locator('text=Animations').first()).toBeVisible();
    
    // Test feature toggle
    const soundscapeCheckbox = page.locator('input[type="checkbox"]').first();
    await expect(soundscapeCheckbox).toBeChecked();
    await soundscapeCheckbox.uncheck();
    await expect(soundscapeCheckbox).not.toBeChecked();
    
    // Navigation buttons
    await expect(page.locator('text=← Back')).toBeVisible();
    await expect(page.locator('text=Continue to Deploy →')).toBeVisible();
  });

  test('Step 3: Deploy section shows wallet connection requirement', async ({ page }) => {
    // Navigate to step 3
    await page.fill('input[placeholder="Buy Me a Coffee! ☕"]', 'Test Widget');
    await page.fill('input[placeholder="Creator Name"]', 'Test Creator');
    await page.click('text=Continue to Customization →');
    await page.click('text=Continue to Deploy →');
    
    // Check deploy page content
    await expect(page.locator('h2')).toContainText('🚀 Deploy Your Coffee Shop');
    
    // Should show wallet connection requirement (since no wallet is connected)
    await expect(page.locator('text=🔗')).toBeVisible();
    await expect(page.locator('h3:has-text("Connect Your Wallet")')).toBeVisible();
    await expect(page.locator('text=You need to connect your wallet to deploy')).toBeVisible();
    await expect(page.locator('text=Connect Wallet')).toBeVisible();
  });

  test('Navigation between steps works correctly', async ({ page }) => {
    // Fill step 1 and go to step 2
    await page.fill('input[placeholder="Creator Name"]', 'Test Creator');
    await page.click('text=Continue to Customization →');
    
    // Go back to step 1
    await page.click('text=← Back');
    await expect(page.locator('h2')).toContainText('🎯 Basic Setup');
    await expect(page.locator('input[placeholder="Creator Name"]')).toHaveValue('Test Creator');
    
    // Go forward again
    await page.click('text=Continue to Customization →');
    await expect(page.locator('h2')).toContainText('🎨 Customize Your Widget');
    
    // Go to deploy
    await page.click('text=Continue to Deploy →');
    await expect(page.locator('h2')).toContainText('🚀 Deploy Your Coffee Shop');
    
    // Go back to customize
    await page.click('text=← Back to Customize');
    await expect(page.locator('h2')).toContainText('🎨 Customize Your Widget');
  });

  test('Progress bar updates correctly with navigation', async ({ page }) => {
    // Initially step 1 should be active
    const step1Circle = page.locator('.bg-indigo-600').first();
    await expect(step1Circle).toContainText('1');
    
    // Move to step 2
    await page.fill('input[placeholder="Creator Name"]', 'Test');
    await page.click('text=Continue to Customization →');
    
    // Progress bar should show 50%
    const progressBar = page.locator('.bg-indigo-600').nth(1);
    // Note: We can't easily test the exact width, but we can check that step 2 is now active
    
    // Move to step 3
    await page.click('text=Continue to Deploy →');
    
    // Step 3 should be active now
    // We can verify by checking that the deploy content is visible
    await expect(page.locator('text=Deploy Your Coffee Shop')).toBeVisible();
  });
});

test.describe('Widget Factory - Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/factory`);
  });

  test('Form fields accept input correctly', async ({ page }) => {
    const titleInput = page.locator('input[placeholder="Buy Me a Coffee! ☕"]');
    const descInput = page.locator('textarea[placeholder="Support my work with a coffee!"]');
    const nameInput = page.locator('input[placeholder="Creator Name"]');
    const websiteInput = page.locator('input[placeholder="https://yoursite.com"]');
    
    // Test various inputs
    await titleInput.fill('My Custom Coffee Widget ☕🚀');
    await expect(titleInput).toHaveValue('My Custom Coffee Widget ☕🚀');
    
    await descInput.fill('Support my open source projects and help me create amazing tools for developers worldwide!');
    await expect(descInput).toHaveValue('Support my open source projects and help me create amazing tools for developers worldwide!');
    
    await nameInput.fill('John Developer');
    await expect(nameInput).toHaveValue('John Developer');
    
    await websiteInput.fill('https://johndeveloper.dev');
    await expect(websiteInput).toHaveValue('https://johndeveloper.dev');
  });

  test('Form data persists during navigation', async ({ page }) => {
    // Fill out form
    await page.fill('input[placeholder="Buy Me a Coffee! ☕"]', 'Persistent Title');
    await page.fill('textarea[placeholder="Support my work with a coffee!"]', 'Persistent Description');
    await page.fill('input[placeholder="Creator Name"]', 'Persistent Name');
    await page.fill('input[placeholder="https://yoursite.com"]', 'https://persistent.com');
    
    // Navigate away and back
    await page.click('text=Continue to Customization →');
    await page.click('text=← Back');
    
    // Data should still be there
    await expect(page.locator('input[placeholder="Buy Me a Coffee! ☕"]')).toHaveValue('Persistent Title');
    await expect(page.locator('textarea[placeholder="Support my work with a coffee!"]')).toHaveValue('Persistent Description');
    await expect(page.locator('input[placeholder="Creator Name"]')).toHaveValue('Persistent Name');
    await expect(page.locator('input[placeholder="https://yoursite.com"]')).toHaveValue('https://persistent.com');
  });
});

test.describe('Widget Factory - Demo Integration', () => {
  test('Demo Coffee page is accessible from navigation', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Click demo button from home page
    await page.click('text=👀 See Demo');
    await expect(page).toHaveURL('/coffee');
    await expect(page.locator('text=Magical Coffee Experience')).toBeVisible();
  });

  test('Demo Coffee page from navigation menu', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Use navigation menu
    await page.click('nav a[href="/coffee"]');
    await expect(page).toHaveURL('/coffee');
    await expect(page.locator('text=Magical Coffee Experience')).toBeVisible();
    
    // Check that the magical features are present
    await expect(page.locator('text=Coffee Shop Vibes')).toBeVisible();
    await expect(page.locator('text=Brew Me Some Magic!')).toBeVisible();
  });
});

test.describe('Widget Factory - Accessibility & UX', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/factory`);
  });

  test('Page has proper headings hierarchy', async ({ page }) => {
    // Main heading
    await expect(page.locator('h1')).toContainText('Coffee Widget Factory');
    
    // Step heading
    await expect(page.locator('h2')).toContainText('Basic Setup');
    
    // Progress indicators
    await expect(page.locator('text=Setup').first()).toBeVisible();
    await expect(page.locator('text=Customize').first()).toBeVisible();
    await expect(page.locator('text=Deploy').first()).toBeVisible();
    await expect(page.locator('text=Launch').first()).toBeVisible();
  });

  test('Form labels are properly associated', async ({ page }) => {
    // Check that form fields have proper labels
    await expect(page.locator('label:has-text("Widget Title")')).toBeVisible();
    await expect(page.locator('label:has-text("Description")')).toBeVisible();
    await expect(page.locator('label:has-text("Your Name")')).toBeVisible();
    await expect(page.locator('label:has-text("Website")')).toBeVisible();
  });

  test('Buttons have proper styling and hover states', async ({ page }) => {
    const continueBtn = page.locator('text=Continue to Customization →');
    
    // Check button is visible and styled
    await expect(continueBtn).toBeVisible();
    await expect(continueBtn).toHaveClass(/bg-indigo-600/);
    
    // Test hover (we can check the hover class is defined)
    await expect(continueBtn).toHaveClass(/hover:bg-indigo-700/);
  });

  test('Progress bar provides visual feedback', async ({ page }) => {
    // Initial state - step 1 active
    const activeStep = page.locator('.bg-indigo-600').first();
    await expect(activeStep).toContainText('1');
    
    // Inactive steps should be gray
    const inactiveSteps = page.locator('.bg-gray-200');
    await expect(inactiveSteps).toHaveCount(3); // Steps 2, 3, 4
  });
});

test.describe('Widget Factory - Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/factory`);
  });

  test('Handles empty form submission gracefully', async ({ page }) => {
    // Try to continue without filling required fields
    await page.click('text=Continue to Customization →');
    
    // Should still allow navigation (fields aren't required in this demo)
    // But in a production app, you might want validation
    await expect(page.locator('h2')).toContainText('🎨 Customize Your Widget');
  });
});