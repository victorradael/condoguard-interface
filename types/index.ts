export type UserRole = "admin" | "user";

export interface User {
  id: string;
  username: string;
  email: string;
  role?: UserRole;
}

export interface Resident {
  id: string;
  name: string;
  address: string;
}

export interface ShopOwner {
  id: string;
  name: string;
  address: string;
}

export interface Expense {
  id: string;
  description: string;
  amountCents: number;
  dueDate: string;
  residentId?: string;
  shopOwnerId?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt?: string;
}

export interface AuthPayload {
  token: string;
  role: UserRole;
}

export type ExpenseDescription =
  | "Luz"
  | "Fundo de Reserva"
  | "Agua Área Comum"
  | "Água"
  | "Gás"
  | "Outros";

export const EXPENSE_DESCRIPTIONS: ExpenseDescription[] = [
  "Luz",
  "Fundo de Reserva",
  "Agua Área Comum",
  "Água",
  "Gás",
  "Outros",
];
