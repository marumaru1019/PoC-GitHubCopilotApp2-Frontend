import { test, expect } from '@playwright/test';

const operatorEmail = process.env.E2E_OPERATOR_EMAIL ?? 'operator@example.com';
const operatorPassword = process.env.E2E_OPERATOR_PASSWORD ?? 'testpass123';

test.describe('Ticket lifecycle (smoke)', () => {
  test('operator can log in and reach dashboard', async ({ page }) => {
    // ログイン前のページ
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    console.log('Filling login form...');
    await page.getByLabel('メールアドレス').fill(operatorEmail);
    await page.getByLabel('パスワード').fill(operatorPassword);
    
    // ログインボタンをクリック
    console.log('Clicking login button...');
    await page.getByRole('button', { name: 'ログイン' }).click();
    
    // エラーメッセージが表示されているか確認
    const errorElement = page.locator('.bg-destructive\\/10');
    if (await errorElement.isVisible()) {
      const errorText = await errorElement.textContent();
      console.error('Login error:', errorText);
    }
    
    // 5秒待ってからURLを確認
    await page.waitForTimeout(5000);
    console.log('Current URL:', page.url());
    
    // ダッシュボードに遷移しているか確認
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('heading', { name: /ようこそ/ })).toBeVisible();
  });
});
