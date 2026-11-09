import type { components } from "./api";

type Schemas = components["schemas"];

// Mantém compat. com os tipos antigos (ROLE_ADMIN/ROLE_USER) enquanto a migração
// 00003 ainda não rodou em todos os ambientes. Papéis novos: administradora,
// sindico, conselho, porteiro, morador.
export type UserRole =
  | Schemas["User"]["roles"][number]
  | "administradora"
  | "sindico"
  | "conselho"
  | "porteiro"
  | "morador";

export type User = Schemas["User"];

// --- Tipos do fluxo de autenticação estendido (FAB-18) ---

export interface CondominiumOption {
  id: string;
  name: string;
}

export interface LoginMfaResponse {
  mfaRequired: true;
  stage: "enroll" | "verify";
  mfaToken: string;
}

export interface TotpSetupResponse {
  secret: string;
  otpauthUrl: string;
  qrCode: string;
}

export interface TotpEnableResponse {
  recoveryCodes: string[];
}
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
