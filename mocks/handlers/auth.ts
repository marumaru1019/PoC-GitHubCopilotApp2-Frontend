import { http, HttpResponse } from 'msw';
import { mockOperator } from '@/mocks/data/fixtures';

export const authHandlers = [
  http.get('*/api/auth/me', () => {
    return HttpResponse.json(mockOperator);
  }),
  http.post('*/api/auth/login', async ({ request }) => {
    const { email } = (await request.json()) as { email: string };

    if (email !== mockOperator.email) {
      return HttpResponse.json(
        { detail: 'Incorrect email or password' },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      access_token: 'mock-token',
      token_type: 'bearer',
    });
  }),
];
