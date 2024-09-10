// app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // Use o hook 'useRouter' para redirecionamento
import { login } from "./services/authService";
import Image from "next/image";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter(); // Inicializa o hook de roteamento

  const handleLogin = async () => {
    try {
      const data = await login(username, password);
      localStorage.setItem("token", data.token); // Armazena o token no localStorage
      router.push("/dashboard"); // Redireciona para a página após login
    } catch (err) {
      setError("Invalid username or password");
      console.error("Login error:", err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="mb-8 text-center">
        <div className="p-4 flex justify-center">
          <Image
            src="https://raw.githubusercontent.com/victorradael/condoguard/81f8c3663e2bacb222beef5032bd9c52b9903019/assets/condoguard-logo.svg"
            alt="Logo CondoGuard"
            width={200}
            height={100}
          />
        </div>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      <input
        type="text"
        placeholder="Username"
        className="p-2 mb-4 border border-gray-300 rounded w-80"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        className="p-2 mb-4 border border-gray-300 rounded w-80"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        onClick={handleLogin}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Login
      </button>
    </div>
  );
};

export default Login;
