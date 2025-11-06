'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ProtectedRoute from '@/components/protected-route';
import Header from '@/components/header';
import { useAuth } from '@/lib/auth-context';
import apiClient from '@/lib/api-client';
import { KnowledgeArticle } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const statusLabels: Record<string, string> = {
  DRAFT: '下書き',
  PUBLISHED: '公開中',
  ARCHIVED: 'アーカイブ',
};

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PUBLISHED: 'bg-green-100 text-green-800',
  ARCHIVED: 'bg-red-100 text-red-800',
};

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const articleId = params.id as string;
  
  const { data: article, isLoading, error } = useQuery({
    queryKey: ['article', articleId],
    queryFn: async () => {
      const response = await apiClient.get<KnowledgeArticle>(`/api/articles/${articleId}`);
      return response.data;
    },
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      return apiClient.post(`/api/articles/${articleId}/publish`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['article', articleId] });
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: async () => {
      return apiClient.post(`/api/articles/${articleId}/unpublish`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['article', articleId] });
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });

  const handlePublish = () => {
    if (confirm('この記事を公開しますか？')) {
      publishMutation.mutate();
    }
  };

  const handleUnpublish = () => {
    if (confirm('この記事を非公開にしますか？')) {
      unpublishMutation.mutate();
    }
  };

  return (
    <ProtectedRoute>
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {article && (
          <Card className="shadow-lg">
            <CardContent className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    {article.title}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{article.author.name}</span>
                    <span>•</span>
                    <span>{article.category.name}</span>
                    <span>•</span>
                    <span>{article.view_count} 閲覧</span>
                    <span>•</span>
                    <span>
                      {new Date(article.created_at).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                </div>
                <Badge className={statusColors[article.status]}>
                  {statusLabels[article.status]}
                </Badge>
              </div>

              {article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {article.tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="secondary"
                      className="bg-blue-50 text-blue-700 hover:bg-blue-50"
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="prose prose-slate max-w-none p-6 rounded-lg bg-muted/20 border">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-3xl font-bold mt-6 mb-4" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-2xl font-bold mt-5 mb-3" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-xl font-bold mt-4 mb-2" {...props} />,
                    p: ({node, ...props}) => <p className="mb-4 leading-7" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 ml-4" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 ml-4" {...props} />,
                    code: ({node, inline, ...props}: any) => 
                      inline ? (
                        <code className="bg-slate-100 px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
                      ) : (
                        <code className="block bg-slate-100 p-4 rounded my-4 overflow-x-auto font-mono text-sm" {...props} />
                      ),
                    blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-slate-300 pl-4 italic my-4" {...props} />,
                    a: ({node, ...props}) => <a className="text-blue-600 hover:underline" {...props} />,
                    table: ({node, ...props}) => <table className="border-collapse border border-slate-300 my-4" {...props} />,
                    th: ({node, ...props}) => <th className="border border-slate-300 px-4 py-2 bg-slate-50 font-bold" {...props} />,
                    td: ({node, ...props}) => <td className="border border-slate-300 px-4 py-2" {...props} />,
                  }}
                >
                  {article.content}
                </ReactMarkdown>
              </div>

              {(user?.role === 'operator' || user?.role === 'admin') && (
                <div className="mt-8 pt-6 border-t flex gap-2">
                  <Button
                    onClick={() => router.push(`/knowledge/${article.id}/edit`)}
                  >
                    編集
                  </Button>
                  {article.status === 'DRAFT' && (
                    <Button 
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={handlePublish}
                      disabled={publishMutation.isPending}
                    >
                      {publishMutation.isPending ? '公開中...' : '公開'}
                    </Button>
                  )}
                  {article.status === 'PUBLISHED' && (
                    <Button 
                      variant="secondary"
                      onClick={handleUnpublish}
                      disabled={unpublishMutation.isPending}
                    >
                      {unpublishMutation.isPending ? '処理中...' : '非公開にする'}
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </ProtectedRoute>
  );
}
