'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import ProtectedRoute from '@/components/protected-route';
import Header from '@/components/header';
import { useAuth } from '@/lib/auth-context';
import apiClient from '@/lib/api-client';
import { KnowledgeArticle, PaginatedResponse } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const statusLabels: Record<string, string> = {
  DRAFT: '下書き',
  PUBLISHED: '公開中',
  ARCHIVED: 'アーカイブ',
};

export default function KnowledgePage() {
  const { user } = useAuth();
  const [status, setStatus] = useState<string>('PUBLISHED');
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['articles', status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      
      const response = await apiClient.get<PaginatedResponse<KnowledgeArticle>>(`/api/articles?${params}`);
      return response.data;
    },
  });

  return (
    <ProtectedRoute>
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">ナレッジベース</h1>
          {(user?.role === 'operator' || user?.role === 'admin') && (
            <Link href="/knowledge/new">
              <Button>新規作成</Button>
            </Link>
          )}
        </div>

        {(user?.role === 'operator' || user?.role === 'admin') && (
          <Card className="mb-6 shadow-md">
            <CardContent className="p-4">
              <label className="block text-sm font-medium mb-1">
                ステータス
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full md:w-64 px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">すべて</option>
                <option value="DRAFT">下書き</option>
                <option value="PUBLISHED">公開中</option>
                <option value="ARCHIVED">アーカイブ</option>
              </select>
            </CardContent>
          </Card>
        )}

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

        {data && data.items?.length === 0 && (
          <Card className="shadow-md">
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">記事が見つかりませんでした</p>
            </CardContent>
          </Card>
        )}

        {data && data.items && data.items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.items.map((article) => (
              <Link key={article.id} href={`/knowledge/${article.id}`}>
                <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h2 className="text-lg font-semibold flex-1">
                        {article.title}
                      </h2>
                      {article.status !== 'PUBLISHED' && (
                        <Badge variant="secondary" className="ml-2">
                          {statusLabels[article.status]}
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {article.content.substring(0, 150)}...
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                      <span>{article.category.name}</span>
                      <span>{article.view_count} 閲覧</span>
                    </div>
                    
                    {article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-3 border-t">
                        {article.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag.id} variant="secondary" className="text-xs">
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {data && (
          <div className="mt-6 text-sm text-muted-foreground">
            全 {data.total} 件中 {data.items?.length || 0} 件を表示
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
