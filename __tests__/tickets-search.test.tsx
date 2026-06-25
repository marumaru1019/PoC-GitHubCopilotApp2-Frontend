// Created-By: GitHub Copilot
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import TicketsPage from '@/app/tickets/page';
import { renderWithProviders } from '@/__tests__/test-utils';
import { mockOperator, mockTicketList } from '@/mocks/data/fixtures';
import { server } from '@/mocks/server';
import { http, HttpResponse } from 'msw';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/components/protected-route', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/components/header', () => ({
  __esModule: true,
  default: () => <div data-testid="header" />,
}));

vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({
    user: mockOperator,
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
    isAuthenticated: true,
    hasRole: () => true,
  }),
}));

describe('TicketsPage – キーワード検索', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('初期表示ですべてのチケットが表示される', async () => {
    renderWithProviders(<TicketsPage />);

    expect(await screen.findByText('テストチケット')).toBeInTheDocument();
    expect(screen.getByText('プリンター故障')).toBeInTheDocument();
    expect(screen.getByText('ネットワーク接続不良')).toBeInTheDocument();
  });

  it('キーワードを入力するとデバウンス後に結果が絞り込まれる', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    renderWithProviders(<TicketsPage />);

    // 初期表示を待つ
    expect(await screen.findByText('テストチケット')).toBeInTheDocument();

    const searchInput = screen.getByRole('textbox', { name: 'キーワード検索' });
    await user.type(searchInput, 'プリンター');

    // デバウンス前：まだ API は呼ばれていない（旧結果が残っている）
    expect(screen.getByText('テストチケット')).toBeInTheDocument();

    // デバウンス発火
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    // 絞り込み結果を待つ
    await waitFor(() => {
      expect(screen.queryByText('テストチケット')).not.toBeInTheDocument();
      expect(screen.queryByText('ネットワーク接続不良')).not.toBeInTheDocument();
    });
    expect(screen.getByText('プリンター故障')).toBeInTheDocument();
  });

  it('300ms 以内の連続入力では API 呼び出しが 1 回に抑制される', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    let apiCallCount = 0;

    server.use(
      http.get('*/api/tickets', ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.has('q')) {
          apiCallCount += 1;
        }
        return HttpResponse.json({ items: [], total: 0, page: 1, size: 20 });
      })
    );

    renderWithProviders(<TicketsPage />);
    await screen.findByText('チケットが見つかりませんでした');

    const searchInput = screen.getByRole('textbox', { name: 'キーワード検索' });

    // 100ms おきに 3 文字入力（合計 300ms 以内）
    await user.type(searchInput, 'a');
    await act(async () => { vi.advanceTimersByTime(100); });
    await user.type(searchInput, 'b');
    await act(async () => { vi.advanceTimersByTime(100); });
    await user.type(searchInput, 'c');
    await act(async () => { vi.advanceTimersByTime(100); });

    // デバウンス発火
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(apiCallCount).toBe(1);
    });
  });

  it('クリアボタンを押すと q パラメータなしで再検索される', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const capturedUrls: string[] = [];

    server.use(
      http.get('*/api/tickets', ({ request }) => {
        capturedUrls.push(request.url);
        const url = new URL(request.url);
        const q = url.searchParams.get('q') ?? '';
        const items = q ? [mockTicketList[1]] : [];
        return HttpResponse.json({ items, total: items.length, page: 1, size: 20 });
      })
    );

    renderWithProviders(<TicketsPage />);
    await screen.findByText('チケットが見つかりませんでした');

    const searchInput = screen.getByRole('textbox', { name: 'キーワード検索' });
    await user.type(searchInput, 'プリンター');

    await act(async () => { vi.advanceTimersByTime(300); });
    await screen.findByText(mockTicketList[1].title);

    // クリアボタンをクリック
    const clearButton = screen.getByRole('button', { name: '検索をクリア' });
    await user.click(clearButton);

    await act(async () => { vi.advanceTimersByTime(300); });

    // クリア後の最終リクエストに q が含まれないことを確認
    await waitFor(() => {
      const lastUrl = capturedUrls[capturedUrls.length - 1];
      expect(new URL(lastUrl).searchParams.has('q')).toBe(false);
    });

    // クリアボタンが非表示になる
    expect(screen.queryByRole('button', { name: '検索をクリア' })).not.toBeInTheDocument();
  });

  it('検索入力欄が空のとき、クリアボタンは表示されない', async () => {
    renderWithProviders(<TicketsPage />);

    await screen.findByText('テストチケット');

    expect(screen.queryByRole('button', { name: '検索をクリア' })).not.toBeInTheDocument();
  });
});
