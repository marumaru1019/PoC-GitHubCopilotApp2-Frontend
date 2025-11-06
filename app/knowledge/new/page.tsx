'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
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

interface ArticleCreate {
  title: string;
  content: string;
  category_id: string;
  tags?: string[];
}

export default function NewArticlePage() {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<ArticleCreate>({
    title: '',
    content: '',
    category_id: '',
    tags: [],
  });
  
  const [tagInput, setTagInput] = useState('');

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await apiClient.get<Category[]>('/api/admin/categories');
      return response.data;
    },
  });

  const createArticleMutation = useMutation({
    mutationFn: async (data: ArticleCreate) => {
      return apiClient.post('/api/articles', data);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      router.push(`/knowledge/${response.data.id}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createArticleMutation.mutate(formData);
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

  // Redirect non-operators/admins
  if (user?.role === 'requester') {
    router.push('/knowledge');
    return null;
  }

  return (
    <ProtectedRoute>
      <Header />
      <div className="container py-8 max-w-5xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">新規ナレッジ記事作成</h1>
          <p className="text-muted-foreground mt-1">新しいナレッジベース記事を作成します（下書きとして保存されます）</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>記事情報</CardTitle>
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
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  required
                  placeholder="記事のタイトルを入力"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="content" className="text-sm font-medium">
                  内容 <span className="text-destructive">*</span>
                </label>
                <textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="flex min-h-[300px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  required
                  placeholder="記事の内容を入力（Markdown対応）"
                />
                <p className="text-xs text-muted-foreground">
                  Markdown形式での記述が可能です
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium">
                  カテゴリ <span className="text-destructive">*</span>
                </label>
                <select
                  id="category"
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  required
                >
                  <option value="">選択してください</option>
                  {categories?.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
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
                  disabled={createArticleMutation.isPending}
                  className="flex-1"
                >
                  {createArticleMutation.isPending ? '作成中...' : '下書きとして作成'}
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

              {createArticleMutation.isError && (
                <div className="text-sm text-destructive">
                  エラーが発生しました。もう一度お試しください。
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
