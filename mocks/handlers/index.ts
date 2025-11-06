import { authHandlers } from '@/mocks/handlers/auth';
import { ticketHandlers } from '@/mocks/handlers/tickets';
import { adminHandlers } from '@/mocks/handlers/admin';

export const handlers = [...authHandlers, ...ticketHandlers, ...adminHandlers];
