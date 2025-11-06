'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/protected-route';
import Header from '@/components/header';
import { useAuth } from '@/lib/auth-context';
import apiClient from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Category {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Team {
  id: string;
  name: string;
}

interface TicketUpdate {
  title?: string;
  description?: string;
  priority?: string;
  category_id?: string;
  assignee_id?: string | null;
  assigned_team_id?: string | null;
  tags?: string[];
}

interface StatusTransition {
  status: string;
}

export default function EditTicketPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const ticketId = params.id as string;

  const [formData, setFormData] = useState<TicketUpdate>({
    title: '',
    description: '',
    priority: 'MEDIUM',
    category_id: '',
    assignee_id: null,
    assigned_team_id: null,
    tags: [],
  });

  const [currentStatus, setCurrentStatus] = useState('');
  const [tagInput, setTagInput] = useState('');

  // Fetch ticket data
  const { data: ticket, isLoading: ticketLoading } = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: async () => {
      const response = await apiClient.get(`/api/tickets/${ticketId}`);
      return response.data;
    },
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await apiClient.get<Category[]>('/api/admin/categories');
      return response.data;
    },
  });

  // Fetch operators for assignment
  const { data: operators } = useQuery({
    queryKey: ['users', 'operators'],
    queryFn: async () => {
      const response = await apiClient.get<User[]>('/api/admin/users?role=operator');
      return response.data;
    },
  });

  // Fetch teams
  const { data: teams } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const response = await apiClient.get<Team[]>('/api/admin/teams');
      return response.data;
    },
  });

  // Initialize form with ticket data
  useEffect(() => {
    if (ticket) {
      setFormData({
        title: ticket.title,
        description: ticket.description,
        priority: ticket.priority,
        category_id: ticket.category_id || '',
        assignee_id: ticket.assignee_id || null,
        assigned_team_id: ticket.assigned_team_id || null,
        tags: ticket.tags.map((tag: any) => tag.name),
      });
      setCurrentStatus(ticket.status);
    }
  }, [ticket]);

  const updateTicketMutation = useMutation({
    mutationFn: async (data: TicketUpdate) => {
      return apiClient.patch(`/api/tickets/${ticketId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      router.push(`/tickets/${ticketId}`);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (data: StatusTransition) => {
      return apiClient.post(`/api/tickets/${ticketId}/transition`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateTicketMutation.mutate(formData);
  };

  const handleStatusChange = (newStatus: string) => {
    if (confirm(`ステータスを「${getStatusLabel(newStatus)}」に変更しますか？`)) {
      updateStatusMutation.mutate({ status: newStatus });
      setCurrentStatus(newStatus);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((tag) => tag !== tagToRemove),
    });
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      OPEN: '対応中',
      IN_PROGRESS: '進行中',
      WAITING_CUSTOMER: '顧客待ち',
      RESOLVED: '解決済み',
      CLOSED: 'クローズ',
      CANCELED: 'キャンセル',
    };
    return labels[status] || status;
  };

  // Redirect non-operators/admins
  if (user?.role === 'requester') {
    router.push(`/tickets/${ticketId}`);
    return null;
  }

  if (ticketLoading) {
    return (
      <ProtectedRoute>
        <Header />
        <div className="container py-8 max-w-4xl">
          <p className="text-center">読み込み中...</p>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Header />
      <div className="container py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">チケット編集</h1>
          <p className="text-muted-foreground mt-1">
            チケット番号: {ticket?.ticket_number}
          </p>
        </div>

        <div className="space-y-6">
          {/* Status Management */}
          <Card>
            <CardHeader>
              <CardTitle>ステータス管理</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {['OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'RESOLVED', 'CLOSED'].map(
                  (status) => (
                    <Button
                      key={status}
                      variant={currentStatus === status ? 'default' : 'outline'}
                      onClick={() => handleStatusChange(status)}
                      disabled={updateStatusMutation.isPending}
                    >
                      {getStatusLabel(status)}
                    </Button>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* Edit Form */}
          <Card>
            <CardHeader>
              <CardTitle>チケット情報</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">
                    タイトル <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    説明 <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="priority" className="text-sm font-medium">
                      優先度 <span className="text-destructive">*</span>
                    </label>
                    <select
                      id="priority"
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData({ ...formData, priority: e.target.value })
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      required
                    >
                      <option value="LOW">低</option>
                      <option value="MEDIUM">中</option>
                      <option value="HIGH">高</option>
                      <option value="CRITICAL">緊急</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="category" className="text-sm font-medium">
                      カテゴリ
                    </label>
                    <select
                      id="category"
                      value={formData.category_id}
                      onChange={(e) =>
                        setFormData({ ...formData, category_id: e.target.value })
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">選択してください</option>
                      {categories?.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="assignee" className="text-sm font-medium">
                      担当者
                    </label>
                    <select
                      id="assignee"
                      value={formData.assignee_id || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          assignee_id: e.target.value || null,
                        })
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">未割当</option>
                      {operators?.map((op) => (
                        <option key={op.id} value={op.id}>
                          {op.name} ({op.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="team" className="text-sm font-medium">
                      担当チーム
                    </label>
                    <select
                      id="team"
                      value={formData.assigned_team_id || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          assigned_team_id: e.target.value || null,
                        })
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">未割当</option>
                      {teams?.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="tags" className="text-sm font-medium">
                    タグ
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="tags"
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      placeholder="タグを追加"
                      className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    <Button type="button" onClick={handleAddTag} variant="secondary">
                      追加
                    </Button>
                  </div>
                  {formData.tags && formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="hover:text-destructive"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={updateTicketMutation.isPending}
                    className="flex-1"
                  >
                    {updateTicketMutation.isPending ? '更新中...' : '変更を保存'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex-1"
                  >
                    キャンセル
                  </Button>
                </div>

                {updateTicketMutation.isError && (
                  <div className="text-sm text-destructive">
                    エラーが発生しました。もう一度お試しください。
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
