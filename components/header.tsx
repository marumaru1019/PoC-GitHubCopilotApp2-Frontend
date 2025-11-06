'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
  };

  const roleColors = {
    admin: 'bg-purple-100 text-purple-800',
    operator: 'bg-blue-100 text-blue-800',
    requester: 'bg-green-100 text-green-800',
  };

  const roleLabels = {
    admin: '管理者',
    operator: 'オペレーター',
    requester: 'ユーザー',
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 items-center">
        <div className="mr-8 flex items-center">
          <Link href="/" className="flex items-center space-x-2 cursor-pointer group">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent group-hover:from-blue-500 group-hover:via-blue-600 group-hover:to-blue-700 transition-all duration-300">
              社内ヘルプデスク
            </span>
          </Link>
        </div>
        <nav className="flex items-center space-x-1 flex-1">
          <Link
            href="/tickets"
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer ${
              pathname.startsWith('/tickets')
                ? 'bg-primary text-primary-foreground'
                : 'text-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            チケット
          </Link>
          <Link
            href="/knowledge"
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer ${
              pathname.startsWith('/knowledge')
                ? 'bg-primary text-primary-foreground'
                : 'text-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            ナレッジベース
          </Link>
          {user?.role === 'admin' && (
            <Link
              href="/admin"
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer ${
                pathname.startsWith('/admin')
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              管理
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{user?.name}</span>
            <Badge variant="secondary" className={roleColors[user?.role as keyof typeof roleColors]}>
              {roleLabels[user?.role as keyof typeof roleLabels]}
            </Badge>
          </div>
          <Button onClick={handleLogout} variant="ghost" size="sm" className="shadow-sm">
            ログアウト
          </Button>
        </div>
      </div>
    </header>
  );
}
