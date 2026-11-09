import type { components } from "./api";

type Schemas = components["schemas"];

export type UserRole = Schemas["User"]["roles"][number];
export type User = Schemas["User"];
export type Resident = Schemas["Resident"];
export type ShopOwner = Schemas["ShopOwner"];
export type Expense = Schemas["Expense"];
export type Notification = Schemas["Notification"];
export type CreateExpense = Schemas["CreateExpenseRequest"];

export interface Page<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
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
