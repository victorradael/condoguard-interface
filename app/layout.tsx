import type { Metadata } from "next";
import "./globals.css";

import { ReactNode } from 'react';
import { AuthProvider } from './context/AuthContext';

export const metadata: Metadata = {
  title: 'CondoGuard',
  description: 'Aplicação de gerenciamento de despesas e comunicação para condomínios',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-900">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

