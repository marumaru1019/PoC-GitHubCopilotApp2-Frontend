import { http, HttpResponse } from 'msw';
import { mockAdmin, mockCategories, mockOperator } from '@/mocks/data/fixtures';

export const adminHandlers = [
  http.get('*/api/admin/users', () => {
    return HttpResponse.json([mockOperator, mockAdmin]);
  }),
  http.get('*/api/admin/categories', () => {
    return HttpResponse.json(mockCategories);
  }),
];
