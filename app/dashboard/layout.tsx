// app/dashboard/layout.tsx
'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const { token, setToken } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    router.push('/');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-md">
        <div className="p-4 border-b flex justify-center">
          <Image
            src="https://raw.githubusercontent.com/victorradael/condoguard/81f8c3663e2bacb222beef5032bd9c52b9903019/assets/condoguard-logo.svg"
            alt="CondoGuard Logo"
            width={150}
            height={50}
          />
        </div>
        <nav className="mt-6">
          <Link href="/dashboard" className="block px-4 py-2 text-gray-600 hover:bg-gray-100">
            Dashboard
          </Link>
          <Link href="/dashboard/users" className="block px-4 py-2 text-gray-600 hover:bg-gray-100">
            Usuários
          </Link>
          <Link href="/dashboard/residents" className="block px-4 py-2 text-gray-600 hover:bg-gray-100">
            Residências
          </Link>
          <Link href="/dashboard/shopOwners" className="block px-4 py-2 text-gray-600 hover:bg-gray-100">
            Lojas
          </Link>
          <Link href="/dashboard/notifications" className="block px-4 py-2 text-gray-600 hover:bg-gray-100">
            Notificações
          </Link>
          <Link href="/dashboard/expenses" className="block px-4 py-2 text-gray-600 hover:bg-gray-100">
            Despesas
          </Link>
        </nav>
        <div className="absolute bottom-0 w-64 p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-sm text-white bg-red-500 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;