// Created-By: GitHub Copilot
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/__tests__/test-utils';
import TicketsPage from '@/app/tickets/page';
import { mockOperator } from '@/mocks/data/fixtures';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
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

vi.mock('@/components/protected-route', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/components/header', () => ({
  __esModule: true,
  default: () => <div data-testid="header" />,
}));

describe('TicketsPage キーワード検索', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.runAllTimers();
    vi.useRealTimers();
  });

  it('検索入力欄が表示される', async () => {
    renderWithProviders(<TicketsPage />);

    expect(
      await screen.findByPlaceholderText('タイトル・本文・チケット番号で検索')
    ).toBeInTheDocument();
  });

  it('検索入力欄のmaxLengthが100である', async () => {
    renderWithProviders(<TicketsPage />);

    const input = await screen.findByPlaceholderText('タイトル・本文・チケット番号で検索');
    expect(input).toHaveAttribute('maxlength', '100');
  });

  it('初期表示で全チケットが表示される', async () => {
    renderWithProviders(<TicketsPage />);

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(screen.getByText('TKT-0001')).toBeInTheDocument();
      expect(screen.getByText('TKT-0002')).toBeInTheDocument();
      expect(screen.getByText('TKT-0003')).toBeInTheDocument();
    });
  });

  it('キーワード入力後300ms後にフィルタ結果が表示される', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProviders(<TicketsPage />);

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(screen.getByText('TKT-0001')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('タイトル・本文・チケット番号で検索');
    await user.type(input, 'ネットワーク');

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(screen.getByText('TKT-0002')).toBeInTheDocument();
      expect(screen.queryByText('TKT-0001')).not.toBeInTheDocument();
    });
  });

  it('0件時にキーワードを含むメッセージを表示する', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProviders(<TicketsPage />);

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(screen.getByText('TKT-0001')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('タイトル・本文・チケット番号で検索');
    await user.type(input, '存在しないキーワード12345');

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(
        screen.getByText('『存在しないキーワード12345』に一致するチケットが見つかりませんでした')
      ).toBeInTheDocument();
    });
  });

  it('検索クリア後に全件が再表示される', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProviders(<TicketsPage />);

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(screen.getByText('TKT-0001')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('タイトル・本文・チケット番号で検索');
    await user.type(input, 'ネットワーク');

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(screen.queryByText('TKT-0001')).not.toBeInTheDocument();
    });

    await user.clear(input);

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(screen.getByText('TKT-0001')).toBeInTheDocument();
      expect(screen.getByText('TKT-0002')).toBeInTheDocument();
      expect(screen.getByText('TKT-0003')).toBeInTheDocument();
    });
  });

  it('キーワードなし0件時は既存の文言を表示する', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProviders(<TicketsPage />);

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(screen.getByText('TKT-0001')).toBeInTheDocument();
    });

    const statusSelect = screen.getByRole('combobox', { name: 'ステータス' });
    await user.selectOptions(statusSelect, 'WAITING_CUSTOMER');

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(screen.getByText('チケットが見つかりませんでした')).toBeInTheDocument();
    });
  });

  it('ステータスフィルタとキーワード検索を併用できる', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProviders(<TicketsPage />);

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(screen.getByText('TKT-0001')).toBeInTheDocument();
    });

    const statusSelect = screen.getByRole('combobox', { name: 'ステータス' });
    await user.selectOptions(statusSelect, 'RESOLVED');

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(screen.getByText('TKT-0003')).toBeInTheDocument();
      expect(screen.queryByText('TKT-0001')).not.toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('タイトル・本文・チケット番号で検索');
    await user.type(input, 'ソフトウェア');

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(screen.getByText('TKT-0003')).toBeInTheDocument();
    });
  });
});
