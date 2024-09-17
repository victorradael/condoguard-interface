// services/authService.ts
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Funções de Autenticação
export const login = async (username: string, password: string) => {
  const response = await axios.post(`${API_URL}/auth/login`, {
    username,
    password,
  });
  
  interface LoginResponse {
    token: string;
    roles: string[];
  }

  const data = response.data as LoginResponse;
  
  if (data.token && data.roles) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.roles[0]); // Assuming the first role is the primary role
  }
  
  return data;
};

export const register = async (userData: any) => {
  const response = await axios.post(`${API_URL}/auth/register`, userData);
  return response.data;
};

// Função para criar uma nova despesa
export const createExpense = async (expenseData: {
  description: string;
  amount: number;
  date: string;
}) => {
  const response = await axios.post(`${API_URL}/expenses`, expenseData, {
    headers: getAuthHeader(),
  });
  return response.data;
};

// Função para deletar uma despesa
export const deleteExpense = async (expenseId: string) => {
  await axios.delete(`${API_URL}/expenses/${expenseId}`, { headers: getAuthHeader() });
};

// Funções para Usuários
export const fetchProtectedData = async () => {
  const response = await axios.get(`${API_URL}/users`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

// Funções para Usuários
export const fetchUsers = async () => {
  const response = await axios.get(`${API_URL}/users`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

// Funções para Notificações
export const fetchNotifications = async () => {
  const response = await axios.get(`${API_URL}/notifications`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

// Funções para Despesas
export const fetchExpenses = async () => {
  const response = await axios.get(`${API_URL}/expenses`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

// Funções para Residências
export const fetchResidents = async () => {
  const response = await axios.get(`${API_URL}/residents`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

// Funções para Lojas
export const fetchShopOwners = async () => {
  const response = await axios.get(`${API_URL}/shopOwners`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const deleteUser = async (userId: string) => {
  try {
    const response = await axios.delete(`${API_URL}/users/${userId}`, {
      headers: getAuthHeader(),
    });

    if (response.status !== 204) {
      throw new Error('Failed to delete user');
    }

    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// Funções de CRUD adicionais podem ser implementadas conforme necessário
export const createAccount = async (username: string, email: string, password: string) => {

  const response = await axios.post(`${API_URL}/auth/register`, {
    username,
    email,
    password,
    roles: ["ROLE_USER"]
  });

  if (response.status !== 201) {
    throw new Error('Failed to create account');
  }

  return response.data;
};