// app/dashboard/layout.tsx
'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const { token, role, setToken, setRole } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setToken(null);
    setRole(null);
    router.push('/');
  };

  const isAdmin = role === 'ROLE_ADMIN';

  return (
    <div className="flex h-screen bg-[#ecf0f1]">
      <aside className="w-64 bg-[#2c3e50] shadow-md">
        <div className="p-4 border-b border-[#34495e] flex justify-center">
          <Image
            src="https://raw.githubusercontent.com/victorradael/condoguard/81f8c3663e2bacb222beef5032bd9c52b9903019/assets/condoguard-logo.svg"
            alt="CondoGuard Logo"
            width={150}
            height={50}
          />
        </div>
        <nav className="mt-6">
          <Link href="/dashboard" className="block px-4 py-2 text-[#ecf0f1] hover:bg-[#34495e]">
            Dashboard
          </Link>
          {isAdmin && (
            <>
              <Link href="/dashboard/users" className="block px-4 py-2 text-[#ecf0f1] hover:bg-[#34495e]">
                Usuários
              </Link>
              <Link href="/dashboard/residents" className="block px-4 py-2 text-[#ecf0f1] hover:bg-[#34495e]">
                Residências
              </Link>
              <Link href="/dashboard/shopOwners" className="block px-4 py-2 text-[#ecf0f1] hover:bg-[#34495e]">
                Lojas
              </Link>
            </>
          )}
          <Link href="/dashboard/notifications" className="block px-4 py-2 text-[#ecf0f1] hover:bg-[#34495e]">
            Notificações
          </Link>
          <Link href="/dashboard/expenses" className="block px-4 py-2 text-[#ecf0f1] hover:bg-[#34495e]">
            Despesas
          </Link>
        </nav>
        <div className="absolute bottom-0 w-64 p-4 border-t border-[#34495e]">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-sm text-white bg-[#e74c3c] rounded hover:bg-[#c0392b]"
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