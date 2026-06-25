// Created-By: GitHub Copilot
'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/protected-route';
import Header from '@/components/header';
import { useAuth } from '@/lib/auth-context';
import apiClient from '@/lib/api-client';
import { Ticket, PaginatedResponse } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

const statusColors: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-800',
  OPEN: 'bg-yellow-100 text-yellow-800',
  WAITING_CUSTOMER: 'bg-purple-100 text-purple-800',
  RESOLVED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-800',
};

const priorityColors: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-800',
  MEDIUM: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800',
};

export default function TicketsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<string>('');
  const [priority, setPriority] = useState<string>('');
  const [keyword, setKeyword] = useState<string>('');
  const [debouncedKeyword, setDebouncedKeyword] = useState<string>('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 300);
    return () => clearTimeout(timer);
  }, [keyword]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['tickets', status, priority, debouncedKeyword],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (priority) params.append('priority', priority);
      if (debouncedKeyword) params.append('q', debouncedKeyword);
      
      const response = await apiClient.get<PaginatedResponse<Ticket>>(`/api/tickets?${params}`);
      return response.data;
    },
  });

  return (
    <ProtectedRoute>
      <Header />
      <div className="container py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">チケット一覧</h1>
            <p className="text-muted-foreground mt-1">サポートチケットの管理と追跡</p>
          </div>
          <Link href="/tickets/new" className="cursor-pointer">
            <Button>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新規作成
            </Button>
          </Link>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">キーワード</label>
                <div className="relative">
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="タイトル・説明で検索"
                    aria-label="キーワード検索"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-8 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  {keyword && (
                    <button
                      type="button"
                      onClick={() => setKeyword('')}
                      aria-label="検索をクリア"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">ステータス</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">すべて</option>
                  <option value="NEW">新規</option>
                  <option value="OPEN">対応中</option>
                  <option value="WAITING_CUSTOMER">顧客待ち</option>
                  <option value="RESOLVED">解決済み</option>
                  <option value="CLOSED">クローズ</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">優先度</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">すべて</option>
                  <option value="LOW">低</option>
                  <option value="MEDIUM">中</option>
                  <option value="HIGH">高</option>
                  <option value="CRITICAL">緊急</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading && (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-sm text-muted-foreground">読み込み中...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive">エラーが発生しました</p>
            </CardContent>
          </Card>
        )}

        {data && data.items?.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <svg className="w-12 h-12 text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-muted-foreground">チケットが見つかりませんでした</p>
            </CardContent>
          </Card>
        )}

        {data && data.items && data.items.length > 0 && (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        チケット番号
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        タイトル
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        ステータス
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        優先度
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        担当者
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        作成日
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data.items.map((ticket) => (
                      <tr 
                        key={ticket.id} 
                        onClick={() => router.push(`/tickets/${ticket.id}`)}
                        className="hover:bg-muted/50 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-primary hover:underline font-medium">
                            {ticket.ticket_number}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium">
                            {ticket.title}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            variant="secondary"
                            className={statusColors[ticket.status]}
                          >
                            {statusLabels[ticket.status]}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            variant="secondary"
                            className={priorityColors[ticket.priority]}
                          >
                            {priorityLabels[ticket.priority]}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {ticket.assignee?.name || '未割当'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {new Date(ticket.created_at).toLocaleDateString('ja-JP')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {data && (
          <div className="mt-4 text-sm text-muted-foreground">
            全 {data.total} 件中 {data.items?.length || 0} 件を表示
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
