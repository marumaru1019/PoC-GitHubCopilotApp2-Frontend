'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import ProtectedRoute from '@/components/protected-route';
import Header from '@/components/header';
import { useAuth } from '@/lib/auth-context';
import apiClient from '@/lib/api-client';
import { Ticket, Comment, CommentCreate, User } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const statusLabels: Record<string, string> = {
  NEW: '新規',
  OPEN: '対応中',
  WAITING_CUSTOMER: '顧客待ち',
  RESOLVED: '解決済み',
  CLOSED: 'クローズ',
};

const priorityLabels: Record<string, string> = {
  LOW: '低',
  MEDIUM: '中',
  HIGH: '高',
  CRITICAL: '緊急',
};

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const ticketId = params.id as string;
  
  const [comment, setComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState('');

  const { data: ticket, isLoading, error } = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: async () => {
      const response = await apiClient.get<Ticket>(`/api/tickets/${ticketId}`);
      return response.data;
    },
  });

  const { data: comments } = useQuery({
    queryKey: ['ticket-comments', ticketId],
    queryFn: async () => {
      const response = await apiClient.get<Comment[]>(`/api/tickets/${ticketId}/comments`);
      return response.data;
    },
  });

  // Fetch operators and admins for assignee selection
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await apiClient.get<User[]>('/api/admin/users?limit=100');
      return response.data.filter((u: User) => u.role === 'operator' || u.role === 'admin');
    },
    enabled: user?.role === 'operator' || user?.role === 'admin',
  });

  const createCommentMutation = useMutation({
    mutationFn: async (data: CommentCreate) => {
      return apiClient.post(`/api/tickets/${ticketId}/comments`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-comments', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      setComment('');
      setIsInternal(false);
    },
  });

  const transitionStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      return apiClient.post(`/api/tickets/${ticketId}/transition`, { status: newStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      setSelectedStatus('');
    },
  });

  const assignTicketMutation = useMutation({
    mutationFn: async (assigneeId: string | null) => {
      const params = new URLSearchParams();
      if (assigneeId) {
        params.append('assignee_id', assigneeId);
      }
      return apiClient.post(`/api/tickets/${ticketId}/assign?${params}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      setSelectedAssignee('');
    },
  });

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    createCommentMutation.mutate({
      content: comment,
      is_internal: isInternal,
    });
  };

  const canComment = user?.role === 'operator' || user?.role === 'admin' || 
                     (user?.role === 'requester' && ticket?.requester_id === user?.id);

  const canChangeStatusFull = user?.role === 'operator' || user?.role === 'admin';
  
  const canChangeStatusLimited = user?.role === 'requester' && 
                                  ticket?.requester_id === user?.id &&
                                  (ticket?.status === 'WAITING_CUSTOMER' || ticket?.status === 'RESOLVED');

  const handleStatusChange = (newStatus: string) => {
    if (window.confirm(`ステータスを「${statusLabels[newStatus]}」に変更しますか？`)) {
      transitionStatusMutation.mutate(newStatus);
    }
  };

  const handleAssigneeChange = () => {
    const assigneeName = selectedAssignee 
      ? users?.find(u => u.id === selectedAssignee)?.name 
      : '未割当';
    
    if (window.confirm(`担当者を「${assigneeName}」に変更しますか？`)) {
      assignTicketMutation.mutate(selectedAssignee || null);
    }
  };

  return (
    <ProtectedRoute>
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-600">読み込み中...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            エラーが発生しました
          </div>
        )}

        {ticket && (
          <>
            <Card className="mb-6 shadow-lg">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h1 className="text-2xl font-bold">
                    {ticket.ticket_number}: {ticket.title}
                  </h1>
                  <div className="flex gap-2">
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                      {statusLabels[ticket.status]}
                    </Badge>
                    <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                      {priorityLabels[ticket.priority]}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 p-4 rounded-lg bg-muted/30">
                  <div className="text-sm">
                    <span className="text-muted-foreground">依頼者:</span>
                    <span className="ml-2 font-medium">{ticket.requester.name}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">担当者:</span>
                    <span className="ml-2 font-medium">
                      {ticket.assignee?.name || '未割当'}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">カテゴリ:</span>
                    <span className="ml-2 font-medium">{ticket.category.name}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">作成日:</span>
                    <span className="ml-2">
                      {new Date(ticket.created_at).toLocaleString('ja-JP')}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h2 className="text-sm font-semibold text-muted-foreground mb-2">詳細</h2>
                  <p className="whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
                </div>

                {ticket.tags.length > 0 && (
                  <div className="border-t pt-4 mt-4">
                    <div className="flex flex-wrap gap-2">
                      {ticket.tags.map((tag) => (
                        <Badge key={tag.id} variant="secondary">
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {(user?.role === 'operator' || user?.role === 'admin') && (
                  <div className="border-t pt-4 mt-4">
                    <Button
                      onClick={() => router.push(`/tickets/${ticket.id}/edit`)}
                      variant="outline"
                    >
                      チケットを編集
                    </Button>
                  </div>
                )}

                {/* Assignee change for operators/admins */}
                {canChangeStatusFull && (
                  <div className="border-t pt-4 mt-4">
                    <h3 className="text-sm font-semibold mb-3">担当者変更</h3>
                    <div className="flex gap-2">
                      <select
                        value={selectedAssignee || ticket.assignee?.id || ''}
                        onChange={(e) => setSelectedAssignee(e.target.value)}
                        className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring flex-1"
                      >
                        <option value="">未割当</option>
                        {users?.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.role === 'admin' ? '管理者' : 'オペレーター'})
                          </option>
                        ))}
                      </select>
                      <Button 
                        onClick={handleAssigneeChange}
                        disabled={assignTicketMutation.isPending || (!selectedAssignee && !ticket.assignee?.id) || selectedAssignee === ticket.assignee?.id}
                        variant="outline"
                      >
                        {assignTicketMutation.isPending ? '変更中...' : '担当者を変更'}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Status change for requesters */}
                {canChangeStatusLimited && (
                  <div className="border-t pt-4 mt-4">
                    <h3 className="text-sm font-semibold mb-3">ステータス変更</h3>
                    <div className="flex gap-2">
                      {ticket.status === 'WAITING_CUSTOMER' && (
                        <Button 
                          onClick={() => handleStatusChange('IN_PROGRESS')}
                          disabled={transitionStatusMutation.isPending}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {transitionStatusMutation.isPending ? '変更中...' : '追加情報を提供（対応再開）'}
                        </Button>
                      )}
                      {ticket.status === 'RESOLVED' && (
                        <Button 
                          onClick={() => handleStatusChange('CLOSED')}
                          disabled={transitionStatusMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {transitionStatusMutation.isPending ? '変更中...' : '解決を確認してクローズ'}
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Status change for operators/admins */}
                {canChangeStatusFull && (
                  <div className="border-t pt-4 mt-4">
                    <h3 className="text-sm font-semibold mb-3">ステータス変更（管理者）</h3>
                    <div className="flex gap-2">
                      <select
                        value={selectedStatus || ticket.status}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="OPEN">対応中</option>
                        <option value="IN_PROGRESS">対応中</option>
                        <option value="WAITING_CUSTOMER">顧客待ち</option>
                        <option value="RESOLVED">解決済み</option>
                        <option value="CLOSED">クローズ</option>
                        <option value="CANCELED">キャンセル</option>
                      </select>
                      <Button 
                        onClick={() => selectedStatus && handleStatusChange(selectedStatus)}
                        disabled={transitionStatusMutation.isPending || !selectedStatus || selectedStatus === ticket.status}
                      >
                        {transitionStatusMutation.isPending ? '変更中...' : 'ステータスを変更'}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>コメント</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-6">
                  {comments?.map((c) => (
                    <div
                      key={c.id}
                      className={`p-4 rounded-lg border ${
                        c.is_internal
                          ? 'bg-yellow-50/50 border-yellow-200'
                          : 'bg-muted/30 border-border'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{c.author.name}</span>
                          {c.is_internal && (
                            <Badge variant="secondary" className="bg-yellow-200 text-yellow-800 hover:bg-yellow-200">
                              内部メモ
                            </Badge>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(c.created_at).toLocaleString('ja-JP')}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap leading-relaxed">{c.content}</p>
                    </div>
                  ))}
                </div>

                {canComment && (
                  <form onSubmit={handleSubmitComment} className="border-t pt-4">
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="コメントを入力..."
                      className="w-full px-3 py-2 border border-input bg-background rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-ring"
                      rows={4}
                      required
                    />
                    
                    {(user?.role === 'operator' || user?.role === 'admin') && (
                      <label className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          checked={isInternal}
                          onChange={(e) => setIsInternal(e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm">内部メモとして投稿</span>
                      </label>
                    )}
                    
                    <Button
                      type="submit"
                      disabled={createCommentMutation.isPending}
                    >
                      {createCommentMutation.isPending ? '投稿中...' : 'コメントを投稿'}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
