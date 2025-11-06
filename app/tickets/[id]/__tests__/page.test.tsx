import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import TicketDetailPage from '../page';
import { renderWithProviders } from '@/__tests__/test-utils';
import { mockOperator } from '@/mocks/data/fixtures';
import { resetTicketMocks } from '@/mocks/handlers/tickets';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: '1' }),
  useRouter: () => ({
    push: pushMock,
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
    user: mockOperator,
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
    isAuthenticated: true,
    hasRole: () => true,
  }),
}));

describe('TicketDetailPage', () => {
  beforeEach(() => {
    resetTicketMocks();
  });

  it('renders ticket information', async () => {
    renderWithProviders(<TicketDetailPage />);

    expect(await screen.findByText('TKT-0001: テストチケット')).toBeInTheDocument();
    expect(screen.getAllByText('対応中')[0]).toBeInTheDocument();
    expect(screen.getByText('高')).toBeInTheDocument();
  });

  it('displays existing comments', async () => {
    renderWithProviders(<TicketDetailPage />);

    expect(await screen.findByText('最初のコメントです。')).toBeInTheDocument();
  });

  it('submits a new comment', async () => {
    const user = userEvent.setup();

    renderWithProviders(<TicketDetailPage />);

    const textarea = await screen.findByPlaceholderText('コメントを入力...');
    await user.type(textarea, '新しいコメント');

    await user.click(screen.getByRole('button', { name: 'コメントを投稿' }));

    await waitFor(() => {
      expect(screen.getByText('新しいコメント')).toBeInTheDocument();
    });
  });
});
