'use client';

import { useQuery } from '@tanstack/react-query';
import ProtectedRoute from '@/components/protected-route';
import Header from '@/components/header';
import { useAuth } from '@/lib/auth-context';
import apiClient from '@/lib/api-client';
import { Tag } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function AdminTagsPage() {
  const { user } = useAuth();
  const router = useRouter();

  if (user && user.role !== 'admin') {
    router.push('/');
    return null;
  }

  const { data: tags, isLoading } = useQuery({
    queryKey: ['admin-tags'],
    queryFn: async () => {
      const response = await apiClient.get<Tag[]>('/api/admin/tags');
      return response.data;
    },
  });

  return (
    <ProtectedRoute>
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">タグ管理</h1>
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-600">読み込み中...</p>
          </div>
        )}

        {tags && tags.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600">タグが見つかりませんでした</p>
          </div>
        )}

        {tags && tags.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    タグ名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    作成日
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tags.map((tag) => (
                  <tr key={tag.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tag.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                        {tag.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(tag.created_at).toLocaleDateString('ja-JP')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
