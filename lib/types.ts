export interface User {
  id: number;
  email: string;
  name: string;
  role: 'requester' | 'operator' | 'admin';
  team_id: number | null;
  team?: Team;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Ticket {
  id: number;
  ticket_number: string;
  title: string;
  description: string;
  status: 'NEW' | 'OPEN' | 'WAITING_CUSTOMER' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category_id: number;
  category: Category;
  requester_id: number;
  requester: User;
  assignee_id: number | null;
  assignee: User | null;
  assigned_team_id: number | null;
  assigned_team: Team | null;
  tags: Tag[];
  first_response_at: string | null;
  resolved_at: string | null;
  closed_at: string | null;
  waiting_customer_started_at: string | null;
  total_waiting_customer_duration: number;
  created_at: string;
  updated_at: string;
}

export interface TicketCreate {
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category_id: number;
  tag_names?: string[];
}

export interface TicketUpdate {
  title?: string;
  description?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category_id?: number;
  tag_names?: string[];
}

export interface Comment {
  id: number;
  ticket_id: number;
  author_id: number;
  author: User;
  content: string;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommentCreate {
  content: string;
  is_internal?: boolean;
}

export interface KnowledgeArticle {
  id: number;
  title: string;
  content: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  category_id: number;
  category: Category;
  author_id: number;
  author: User;
  tags: Tag[];
  view_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ArticleCreate {
  title: string;
  content: string;
  category_id: number;
  tag_names?: string[];
}

export interface ArticleUpdate {
  title?: string;
  content?: string;
  category_id?: number;
  tag_names?: string[];
}

export interface Category {
  id: number;
  name: string;
  type: 'TICKET' | 'ARTICLE' | 'BOTH';
  description: string | null;
  created_at: string;
}

export interface Tag {
  id: number;
  name: string;
  created_at: string;
}

export interface SLASettings {
  id: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  first_response_target_minutes: number;
  resolution_target_minutes: number;
  pause_on_waiting_customer: boolean;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: number;
  user_id: number;
  user: User;
  action: string;
  entity_type: string;
  entity_id: number;
  meta_data: Record<string, any>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}
