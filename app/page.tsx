"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "./services/authService";
import Image from "next/image";
import Link from "next/link";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await login(username, password);
      if (typeof data === 'object' && data !== null && 'token' in data) {
        localStorage.setItem("token", data.token as string);
        router.push("/dashboard");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      setError("Invalid username or password");
      console.error("Login error:", err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg rounded-lg">
        <div className="flex justify-center">
          <Image
            src="https://raw.githubusercontent.com/victorradael/condoguard/81f8c3663e2bacb222beef5032bd9c52b9903019/assets/condoguard-logo.svg"
            alt="CondoGuard Logo"
            width={200}
            height={100}
          />
        </div>
        <h3 className="text-2xl font-bold text-center mt-4">Login to your account</h3>
        <form onSubmit={handleLogin}>
          <div className="mt-4">
            <div>
              <label className="block" htmlFor="username">Username</label>
              <input
                type="text"
                placeholder="Username"
                id="username"
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="mt-4">
              <label className="block" htmlFor="password">Password</label>
              <input
                type="password"
                placeholder="Password"
                id="password"
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <div className="flex items-baseline justify-between">
              <button
                type="submit"
                className="px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex flex-1 justify-center"
              >
                Login
              </button>
            </div>
          </div>
        </form>
        <p className="mt-4 text-center text-sm text-[#34495e]">
          Não tem uma conta?{' '}
          <Link href="/create-account" className="text-[#3498db] hover:underline">
            Crie uma agora
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
