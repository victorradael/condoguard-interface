import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = (username: string, password: string) =>
  api.post("/auth/login", { username, password });

export const register = (username: string, email: string, password: string) =>
  api.post("/auth/register", { username, email, password });

// Expenses
export const fetchExpenses = () => api.get("/expenses");
export const createExpense = (data: {
  description: string;
  amountCents: number;
  dueDate: string;
  residentId?: string;
  shopOwnerId?: string;
}) => api.post("/expenses", data);
export const deleteExpense = (id: string) => api.delete(`/expenses/${id}`);

// Users
export const fetchUsers = () => api.get("/users");
export const deleteUser = (id: string) => api.delete(`/users/${id}`);

// Notifications
export const fetchNotifications = () => api.get("/notifications");

// Residents
export const fetchResidents = () => api.get("/residents");

// Shop Owners
export const fetchShopOwners = () => api.get("/shop-owners");
