// app/dashboard/layout.tsx
'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Importa o componente Image do Next.js
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';


const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const { token, setToken } = useAuth();
  const router = useRouter();

  // Função para efetuar logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    router.push('/');
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Barra de navegação lateral */}
      <aside className="w-64 bg-white shadow-md p-6">
        <div className="p-4 flex justify-center">
          <Image
            src="https://raw.githubusercontent.com/victorradael/condoguard/81f8c3663e2bacb222beef5032bd9c52b9903019/assets/condoguard-logo.svg"
            alt="Logo CondoGuard"
            width={150}
            height={50}
          />
        </div>
        <h2 className="text-xl font-bold mb-6">CondoGuard</h2>
        <nav className="flex flex-col space-y-4">
          <Link href="/dashboard" className="text-blue-500 hover:underline">
            Dashboard
          </Link>
          <Link href="/dashboard/users" className="text-blue-500 hover:underline">
            Usuários
          </Link>
          <Link href="/dashboard/residents" className="text-blue-500 hover:underline">
            Residências
          </Link>
          <Link href="/dashboard/shopOwners" className="text-blue-500 hover:underline">
            Lojas
          </Link>
          <Link href="/dashboard/notifications" className="text-blue-500 hover:underline">
            Notificações
          </Link>
          <Link href="/dashboard/expenses" className="text-blue-500 hover:underline">
            Despesas
          </Link>
          <button
            onClick={handleLogout}
            className="text-red-500 hover:underline mt-4"
          >
            Logout
          </button>
        </nav>
      </aside>
      {/* Conteúdo Principal */}
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
