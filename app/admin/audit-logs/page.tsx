'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import ProtectedRoute from '@/components/protected-route';
import Header from '@/components/header';
import { useAuth } from '@/lib/auth-context';
import apiClient from '@/lib/api-client';
import { AuditLog, PaginatedResponse } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function AdminAuditLogsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [entityType, setEntityType] = useState<string>('');
  const [action, setAction] = useState<string>('');

  if (user && user.role !== 'admin') {
    router.push('/');
    return null;
  }

  const { data, isLoading } = useQuery({
    queryKey: ['admin-audit-logs', entityType, action],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (entityType) params.append('entity_type', entityType);
      if (action) params.append('action', action);
      
      const response = await apiClient.get<PaginatedResponse<AuditLog>>(`/api/admin/audit-logs?${params}`);
      return response.data;
    },
  });

  return (
    <ProtectedRoute>
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">監査ログ</h1>
        </div>

        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                エンティティタイプ
              </label>
              <select
                value={entityType}
                onChange={(e) => setEntityType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">すべて</option>
                <option value="Ticket">チケット</option>
                <option value="KnowledgeArticle">記事</option>
                <option value="User">ユーザー</option>
                <option value="Team">チーム</option>
                <option value="Category">カテゴリ</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                アクション
              </label>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">すべて</option>
                <option value="CREATE">作成</option>
                <option value="UPDATE">更新</option>
                <option value="DELETE">削除</option>
                <option value="PUBLISH">公開</option>
                <option value="UNPUBLISH">非公開</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-600">読み込み中...</p>
          </div>
        )}

        {data && data.items?.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600">監査ログが見つかりませんでした</p>
          </div>
        )}

        {data && data.items && data.items.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    日時
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ユーザー
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    アクション
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    エンティティ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IPアドレス
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.items.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.created_at).toLocaleString('ja-JP')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.entity_type} #{log.entity_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.ip_address || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && (
          <div className="mt-4 text-sm text-gray-600">
            全 {data.total} 件中 {data.items?.length || 0} 件を表示
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
