import type { Metadata } from "next";
import "./globals.css";

import { ReactNode } from 'react';
import { AuthProvider } from './context/AuthContext';

export const metadata: Metadata = {
  title: 'CondoGuard',
  description: 'Aplicação de gerenciamento de despesas e comunicação para condomínios',
  icons: 'https://raw.githubusercontent.com/victorradael/condoguard/81f8c3663e2bacb222beef5032bd9c52b9903019/assets/condoguard-logo.svg',
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

