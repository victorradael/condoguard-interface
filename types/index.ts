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

// --- Tipos de blocos, unidades, pessoas e vínculos (FAB-19) ---

export interface Block {
  id: string;
  name: string;
  unitCount: number;
  createdAt: string;
}

export interface Unit {
  id: string;
  unitNumber: string;
  floor?: number | null;
  blockId?: string | null;
  blockName?: string | null;
  condominiumId?: string;
}

export type UnitLinkKind =
  | "proprietario"
  | "coproprietario"
  | "inquilino"
  | "morador"
  | "dependente";

export interface UnitLink {
  id: string;
  unitId: string;
  personId: string;
  personName: string;
  kind: UnitLinkKind;
  startsOn: string;
  endsOn?: string | null;
  active: boolean;
}

export interface PersonUnit {
  linkId: string;
  unitId: string;
  unitNumber: string;
  blockName?: string | null;
  kind: UnitLinkKind;
  startsOn: string;
  endsOn?: string | null;
  active: boolean;
}

export interface Person {
  id: string;
  fullName: string;
  cpf?: string | null;
  email?: string | null;
  phone?: string | null;
  hasAccount?: boolean;
  units?: PersonUnit[];
}

export interface InvitationRecord {
  id: string;
  status: "pending" | "accepted" | "revoked" | "expired";
  channel: "email" | "link";
  createdAt: string;
  expiresAt: string;
  token?: string;
  link?: string;
}

export interface InviteSendResponse {
  id: string;
  status: string;
  token?: string;
  link?: string;
}

export interface InviteInspectResponse {
  condominiumName: string;
  personName: string;
  email: string;
  accountExists: boolean;
}

export interface InviteAcceptResponse {
  condominiumId: string;
  email: string;
  verifyEmail: boolean;
}

export interface TransferResult {
  created: UnitLink;
  ended: UnitLink[];
}

export interface ImportRow {
  line: number;
  block?: string;
  unit: string;
  kind?: string;
  person?: string;
  action: "create" | "update" | "unchanged" | "error";
}

export interface ImportError {
  line: number;
  field?: string;
  message: string;
}

export interface ImportPreviewResponse {
  valid: boolean;
  rows: number;
  newBlocks: number;
  newUnits: number;
  newPeople: number;
  newLinks: number;
  unchanged: number;
  errorCount: number;
  errors: ImportError[];
  preview: ImportRow[];
  truncated: boolean;
}

export type CreateUnitLinkBody =
  | {
      personId: string;
      kind: UnitLinkKind;
      startsOn?: string;
      endsOn?: string;
    }
  | {
      person: { fullName: string; cpf?: string; email?: string; phone?: string };
      kind: UnitLinkKind;
      startsOn?: string;
      endsOn?: string;
    };
