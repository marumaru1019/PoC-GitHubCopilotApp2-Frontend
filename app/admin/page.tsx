'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import ProtectedRoute from '@/components/protected-route';
import Header from '@/components/header';
import { useAuth } from '@/lib/auth-context';
import apiClient from '@/lib/api-client';
import { User, Team, Category, Tag, SLASettings } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Redirect non-admins
  if (user && user.role !== 'admin') {
    router.push('/');
    return null;
  }

  const { data: users } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const response = await apiClient.get<User[]>('/api/admin/users');
      return response.data;
    },
  });

  const { data: teams } = useQuery({
    queryKey: ['admin-teams'],
    queryFn: async () => {
      const response = await apiClient.get<Team[]>('/api/admin/teams');
      return response.data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const response = await apiClient.get<Category[]>('/api/admin/categories');
      return response.data;
    },
  });

  const { data: tags } = useQuery({
    queryKey: ['admin-tags'],
    queryFn: async () => {
      const response = await apiClient.get<Tag[]>('/api/admin/tags');
      return response.data;
    },
  });

  const { data: slaSettings } = useQuery({
    queryKey: ['admin-sla'],
    queryFn: async () => {
      const response = await apiClient.get<SLASettings[]>('/api/admin/sla-settings');
      return response.data;
    },
  });

  return (
    <ProtectedRoute>
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">管理画面</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Users */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">ユーザー</h2>
              <Link
                href="/admin/users/new"
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                追加
              </Link>
            </div>
            <p className="text-3xl font-bold text-blue-600 mb-2">
              {users?.length || 0}
            </p>
            <Link
              href="/admin/users"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              管理 →
            </Link>
          </div>

          {/* Teams */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">チーム</h2>
              <Link
                href="/admin/teams/new"
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                追加
              </Link>
            </div>
            <p className="text-3xl font-bold text-green-600 mb-2">
              {teams?.length || 0}
            </p>
            <Link
              href="/admin/teams"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              管理 →
            </Link>
          </div>

          {/* Categories */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">カテゴリ</h2>
              <Link
                href="/admin/categories/new"
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                追加
              </Link>
            </div>
            <p className="text-3xl font-bold text-purple-600 mb-2">
              {categories?.length || 0}
            </p>
            <Link
              href="/admin/categories"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              管理 →
            </Link>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">タグ</h2>
              <Link
                href="/admin/tags/new"
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                追加
              </Link>
            </div>
            <p className="text-3xl font-bold text-orange-600 mb-2">
              {tags?.length || 0}
            </p>
            <Link
              href="/admin/tags"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              管理 →
            </Link>
          </div>

          {/* SLA Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">SLA設定</h2>
              <Link
                href="/admin/sla/new"
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                追加
              </Link>
            </div>
            <p className="text-3xl font-bold text-red-600 mb-2">
              {slaSettings?.length || 0}
            </p>
            <Link
              href="/admin/sla"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              管理 →
            </Link>
          </div>

          {/* Audit Logs */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">監査ログ</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              システムの操作履歴を確認
            </p>
            <Link
              href="/admin/audit-logs"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              表示 →
            </Link>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
