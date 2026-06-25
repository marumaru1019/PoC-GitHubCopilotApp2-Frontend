// Created-By: GitHub Copilot
import { Comment, Ticket, User } from '@/lib/types';

const now = new Date().toISOString();

export const mockOperator: User = {
  id: 1,
  email: 'operator@example.com',
  name: 'オペレーター太郎',
  role: 'operator',
  team_id: null,
  created_at: now,
  updated_at: now,
};

export const mockAdmin: User = {
  id: 3,
  email: 'admin@example.com',
  name: '管理者三郎',
  role: 'admin',
  team_id: null,
  created_at: now,
  updated_at: now,
};

export const mockRequester: User = {
  id: 2,
  email: 'requester@example.com',
  name: '依頼者花子',
  role: 'requester',
  team_id: null,
  created_at: now,
  updated_at: now,
};

export const mockTicket: Ticket = {
  id: 1,
  ticket_number: 'TKT-0001',
  title: 'テストチケット',
  description: 'テスト用のチケット詳細です。',
  status: 'OPEN',
  priority: 'HIGH',
  category_id: 1,
  category: {
    id: 1,
    name: 'ハードウェア',
    type: 'TICKET',
    description: null,
    created_at: now,
  },
  requester_id: mockRequester.id,
  requester: mockRequester,
  assignee_id: mockOperator.id,
  assignee: mockOperator,
  assigned_team_id: null,
  assigned_team: null,
  tags: [],
  first_response_at: now,
  resolved_at: null,
  closed_at: null,
  waiting_customer_started_at: null,
  total_waiting_customer_duration: 0,
  created_at: now,
  updated_at: now,
};

export const mockComments: Comment[] = [
  {
    id: 1,
    ticket_id: mockTicket.id,
    author_id: mockOperator.id,
    author: mockOperator,
    content: '最初のコメントです。',
    is_internal: false,
    created_at: now,
    updated_at: now,
  },
];

export const mockCategories = [
  { id: '1', name: 'ハードウェア' },
  { id: '2', name: 'ソフトウェア' },
];

export const mockTicketList: Ticket[] = [
  mockTicket,
  {
    id: 2,
    ticket_number: 'TKT-0002',
    title: 'ネットワーク接続の問題',
    description: 'オフィスのネットワークに接続できません。',
    status: 'NEW',
    priority: 'MEDIUM',
    category_id: 1,
    category: {
      id: 1,
      name: 'ハードウェア',
      type: 'TICKET',
      description: null,
      created_at: now,
    },
    requester_id: mockRequester.id,
    requester: mockRequester,
    assignee_id: null,
    assignee: null,
    assigned_team_id: null,
    assigned_team: null,
    tags: [],
    first_response_at: null,
    resolved_at: null,
    closed_at: null,
    waiting_customer_started_at: null,
    total_waiting_customer_duration: 0,
    created_at: now,
    updated_at: now,
  },
  {
    id: 3,
    ticket_number: 'TKT-0003',
    title: 'ソフトウェアのインストール依頼',
    description: '新しい開発ツールのインストールをお願いします。',
    status: 'RESOLVED',
    priority: 'LOW',
    category_id: 2,
    category: {
      id: 2,
      name: 'ソフトウェア',
      type: 'TICKET',
      description: null,
      created_at: now,
    },
    requester_id: mockRequester.id,
    requester: mockRequester,
    assignee_id: mockOperator.id,
    assignee: mockOperator,
    assigned_team_id: null,
    assigned_team: null,
    tags: [],
    first_response_at: now,
    resolved_at: now,
    closed_at: null,
    waiting_customer_started_at: null,
    total_waiting_customer_duration: 0,
    created_at: now,
    updated_at: now,
  },
];
