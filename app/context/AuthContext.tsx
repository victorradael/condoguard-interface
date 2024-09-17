// context/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  token: string | null;
  role: string | null;
  setToken: (token: string | null) => void;
  setRole: (role: string | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  role: null,
  setToken: () => {},
  setRole: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedRole = localStorage.getItem('role');
    if (savedToken) {
      setToken(savedToken);
    }
    if (savedRole) {
      setRole(savedRole);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ token, role, setToken, setRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
