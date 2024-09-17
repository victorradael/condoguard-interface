'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

// You'll need to implement this function in your authService
import { createAccount } from '../services/authService';

const CreateAccountPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    try {
      await createAccount(username, email, password);
      router.push('/');
    } catch (err) {
      console.error('Error creating account:', err);
      setError('Erro ao criar conta. Por favor, tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-[#ecf0f1] flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <div className="flex justify-center mb-6">
          <Image
            src="https://raw.githubusercontent.com/victorradael/condoguard/81f8c3663e2bacb222beef5032bd9c52b9903019/assets/condoguard-logo.svg"
            alt="CondoGuard Logo"
            width={150}
            height={50}
          />
        </div>
        <h1 className="text-2xl font-bold mb-6 text-center text-[#2c3e50]">Criar Conta</h1>
        {error && <p className="text-[#e74c3c] mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-[#34495e]">
              Nome de Usuário
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full rounded-md border-[#34495e] shadow-sm focus:border-[#3498db] focus:ring focus:ring-[#3498db] focus:ring-opacity-50"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-[#34495e]">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-[#34495e] shadow-sm focus:border-[#3498db] focus:ring focus:ring-[#3498db] focus:ring-opacity-50"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-[#34495e]">
              Senha
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-[#34495e] shadow-sm focus:border-[#3498db] focus:ring focus:ring-[#3498db] focus:ring-opacity-50"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#34495e]">
              Confirmar Senha
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-[#34495e] shadow-sm focus:border-[#3498db] focus:ring focus:ring-[#3498db] focus:ring-opacity-50"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#3498db] text-white py-2 px-4 rounded-md hover:bg-[#2980b9] focus:outline-none focus:ring-2 focus:ring-[#3498db] focus:ring-opacity-50"
          >
            Criar Conta
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-[#34495e]">
          Já tem uma conta?{' '}
          <Link href="/login" className="text-[#3498db] hover:underline">
            Faça login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default CreateAccountPage;