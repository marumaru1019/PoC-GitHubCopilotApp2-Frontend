'use client';

import Link from 'next/link';
import ProtectedRoute from '@/components/protected-route';
import Header from '@/components/header';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <Header />
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            ようこそ、{user?.name}さん
          </h1>
          <p className="text-muted-foreground">
            ヘルプデスク＆ナレッジベースシステムへようこそ
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/tickets" className="group cursor-pointer">
            <Card className="h-full transition-all hover:shadow-2xl hover:scale-105 hover:border-blue-300">
              <CardHeader>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <CardTitle>チケット管理</CardTitle>
                <CardDescription>
                  新しいチケットの作成、既存チケットの確認と対応
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/knowledge" className="group cursor-pointer">
            <Card className="h-full transition-all hover:shadow-2xl hover:scale-105 hover:border-green-300">
              <CardHeader>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <CardTitle>ナレッジベース</CardTitle>
                <CardDescription>
                  よくある質問や解決方法を検索・閲覧
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          {(user?.role === 'operator' || user?.role === 'admin') && (
            <Link href="/tickets/new" className="group cursor-pointer">
              <Card className="h-full transition-all hover:shadow-2xl hover:scale-105 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 hover:border-blue-400">
                <CardHeader>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <CardTitle className="text-blue-900">新規チケット作成</CardTitle>
                  <CardDescription className="text-blue-700">
                    新しいサポートチケットを起票
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          )}

          {user?.role === 'admin' && (
            <Link href="/admin" className="group cursor-pointer">
              <Card className="h-full transition-all hover:shadow-2xl hover:scale-105 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100/50 hover:border-purple-400">
                <CardHeader>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <CardTitle className="text-purple-900">管理画面</CardTitle>
                  <CardDescription className="text-purple-700">
                    ユーザー、チーム、カテゴリなどの管理
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
