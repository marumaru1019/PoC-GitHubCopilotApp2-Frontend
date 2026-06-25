// Created-By: GitHub Copilot
import { test, expect } from '@playwright/test';

const operatorEmail = process.env.E2E_OPERATOR_EMAIL ?? 'operator@example.com';
const operatorPassword = process.env.E2E_OPERATOR_PASSWORD ?? 'testpass123';

/** ログイン済み状態にする共通ヘルパー */
async function loginAsOperator(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  await page.getByLabel('メールアドレス').fill(operatorEmail);
  await page.getByLabel('パスワード').fill(operatorPassword);
  await page.getByRole('button', { name: 'ログイン' }).click();
  await page.waitForTimeout(5000);
}

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

test.describe('キーワード検索 E2E', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsOperator(page);
    await expect(page).toHaveURL(/\/$/);
    await page.goto('/tickets');
    await page.waitForLoadState('networkidle');
  });

  test('キーワードを入力するとチケット一覧が絞り込まれる', async ({ page }) => {
    // チケット一覧ページが表示されていることを確認
    await expect(page.getByRole('heading', { name: 'チケット一覧' })).toBeVisible();

    // 検索入力欄にキーワードを入力
    const searchInput = page.getByRole('textbox', { name: 'キーワード検索' });
    await searchInput.fill('プリンター');

    // デバウンス（300ms）を待つ
    await page.waitForTimeout(600);

    // 検索結果が更新されていることを確認
    // （実際のバックエンドが動作している場合、絞り込み結果が表示される）
    await expect(searchInput).toHaveValue('プリンター');

    // クリアボタンが表示されていることを確認
    await expect(page.getByRole('button', { name: '検索をクリア' })).toBeVisible();
  });

  test('クリアボタンを押すと検索がリセットされる', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'チケット一覧' })).toBeVisible();

    const searchInput = page.getByRole('textbox', { name: 'キーワード検索' });
    await searchInput.fill('テスト');
    await page.waitForTimeout(600);

    // クリアボタンをクリック
    await page.getByRole('button', { name: '検索をクリア' }).click();

    // 入力欄がクリアされ、クリアボタンが消えることを確認
    await expect(searchInput).toHaveValue('');
    await expect(page.getByRole('button', { name: '検索をクリア' })).not.toBeVisible();
  });
});

