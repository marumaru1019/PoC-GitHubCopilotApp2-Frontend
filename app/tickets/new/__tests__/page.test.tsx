import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import NewTicketPage from '../page';
import { renderWithProviders } from '@/__tests__/test-utils';
import { mockRequester } from '@/mocks/data/fixtures';
import { resetTicketMocks } from '@/mocks/handlers/tickets';

const pushMock = vi.fn();
const backMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
    back: backMock,
  }),
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
    user: mockRequester,
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
    isAuthenticated: true,
    hasRole: () => true,
  }),
}));

describe('NewTicketPage', () => {
  beforeEach(() => {
    resetTicketMocks();
    pushMock.mockReset();
    backMock.mockReset();
  });

  it('loads categories and allows ticket creation', async () => {
    const user = userEvent.setup();

    renderWithProviders(<NewTicketPage />);

    const titleInput = await screen.findByLabelText(/タイトル/i);
    const descriptionInput = screen.getByLabelText(/説明/i);
    const categorySelect = screen.getByLabelText(/カテゴリ/i);

    await user.type(titleInput, 'プリンターの紙詰まり');
    await user.type(descriptionInput, 'プリンターが紙詰まりを起こしています。');
    await user.selectOptions(categorySelect, '1');
    await user.selectOptions(screen.getByLabelText(/優先度/), 'HIGH');

    await user.click(screen.getByRole('button', { name: 'チケットを作成' }));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/tickets/2');
    });
  });

  it('adds and removes tags from the form', async () => {
    const user = userEvent.setup();

    renderWithProviders(<NewTicketPage />);

    const tagInput = await screen.findByPlaceholderText('タグを追加');
    await user.type(tagInput, 'プリンター');
    await user.click(screen.getByRole('button', { name: '追加' }));

    expect(screen.getByText('プリンター')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '×' }));
    expect(screen.queryByText('プリンター')).not.toBeInTheDocument();
  });

  it('allows cancelling the form', async () => {
    const user = userEvent.setup();

    renderWithProviders(<NewTicketPage />);

    await user.click(await screen.findByRole('button', { name: 'キャンセル' }));
    expect(backMock).toHaveBeenCalled();
  });
});
