// Created-By: GitHub Copilot
import { http, HttpResponse } from 'msw';
import { CommentCreate } from '@/lib/types';
import { mockComments, mockOperator, mockTicket, mockTicketList } from '@/mocks/data/fixtures';

let currentTicket = { ...mockTicket };
let comments = [...mockComments];
let nextTicketId = 2;

export const resetTicketMocks = () => {
  currentTicket = { ...mockTicket };
  comments = [...mockComments];
  nextTicketId = 2;
};

export const ticketHandlers = [
  http.get('*/api/tickets', ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get('q') ?? '';
    const status = url.searchParams.get('status') ?? '';
    const priority = url.searchParams.get('priority') ?? '';

    let items = mockTicketList;

    if (status) {
      items = items.filter((t) => t.status === status);
    }
    if (priority) {
      items = items.filter((t) => t.priority === priority);
    }
    if (q.trim()) {
      const lower = q.trim().toLowerCase();
      items = items.filter(
        (t) =>
          t.title.toLowerCase().includes(lower) ||
          t.description.toLowerCase().includes(lower) ||
          t.ticket_number.toLowerCase().includes(lower)
      );
    }

    return HttpResponse.json({ items, total: items.length });
  }),
  http.get('*/api/tickets/:id', () => {
    return HttpResponse.json(currentTicket);
  }),
  http.get('*/api/tickets/:id/comments', () => {
    return HttpResponse.json(comments);
  }),
  http.post('*/api/tickets/:id/comments', async ({ request }) => {
    const body = (await request.json()) as CommentCreate;
    const now = new Date().toISOString();

    const newComment = {
      id: comments.length + 1,
      ticket_id: currentTicket.id,
      author_id: mockOperator.id,
      author: mockOperator,
      content: body.content,
      is_internal: Boolean(body.is_internal),
      created_at: now,
      updated_at: now,
    };

    comments = [...comments, newComment];

    return HttpResponse.json(newComment, { status: 201 });
  }),
  http.post('*/api/tickets/:id/transition', async ({ request }) => {
    const { status } = (await request.json()) as { status: string };
    const allowedStatuses = ['OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'RESOLVED', 'CLOSED'];

    if (!allowedStatuses.includes(status)) {
      return HttpResponse.json(
        { detail: 'Invalid status' },
        { status: 400 }
      );
    }

    currentTicket = {
      ...currentTicket,
      status: status as typeof currentTicket.status,
      updated_at: new Date().toISOString(),
    };

    return HttpResponse.json(currentTicket);
  }),
  http.post('*/api/tickets', async ({ request }) => {
    const body = await request.json();
    const now = new Date().toISOString();
    const createdTicket = {
      ...mockTicket,
      ...body,
      id: nextTicketId,
      ticket_number: `TKT-${String(nextTicketId).padStart(4, '0')}`,
      created_at: now,
      updated_at: now,
    };
    nextTicketId += 1;
    return HttpResponse.json(createdTicket, { status: 201 });
  }),
];
