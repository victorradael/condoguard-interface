import type {
  Block,
  CondominiumOption,
  CreateExpense,
  CreateUnitLinkBody,
  Expense,
  ImportPreviewResponse,
  InvitationRecord,
  InviteAcceptResponse,
  InviteInspectResponse,
  LoginMfaResponse,
  Notification,
  Page,
  Person,
  Resident,
  ShopOwner,
  TotpEnableResponse,
  TotpSetupResponse,
  TransferResult,
  Unit,
  UnitLink,
  User,
  UserRole,
} from "@/types";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import axios from "axios";

export { API_URL } from "./api-url";
import { API_URL as BASE_URL } from "./api-url";

export const MAX_PAGE_SIZE = 100;

// A sessão vive em cookies httpOnly gravados pela API (cg_access / cg_refresh);
// o web nunca vê nem guarda token.
export const api = axios.create({ baseURL: BASE_URL, withCredentials: true });

const AUTH_PATHS = ["/auth/login", "/auth/register", "/auth/refresh", "/auth/logout"];

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshing: Promise<unknown> | null = null;

const refreshSession = () => {
  refreshing ??= api.post("/auth/refresh").finally(() => {
    refreshing = null;
  });
  return refreshing;
};

const PUBLIC_PATHS = ["/login", "/create-account"];

export const redirectToLogin = () => {
  if (typeof window === "undefined" || PUBLIC_PATHS.includes(window.location.pathname)) return;
  const next = encodeURIComponent(window.location.pathname + window.location.search);
  window.location.assign(`/login?next=${next}`);
};

// 401 → um único POST /auth/refresh e repete a requisição; se falhar, volta ao login.
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined;
    if (
      error.response?.status !== 401 ||
      !config ||
      config._retry ||
      AUTH_PATHS.includes(config.url ?? "")
    ) {
      throw error;
    }
    config._retry = true;
    try {
      await refreshSession();
    } catch {
      redirectToLogin();
      throw error;
    }
    return api(config);
  }
);

// Auth — login pode responder 200 com sessão, 200 com mfaRequired, ou 409 condominiums
export type LoginSuccessResponse = { roles: UserRole[]; tokenType: string; expiresIn: number };
export type LoginResponse = LoginSuccessResponse | LoginMfaResponse;

export const login = (email: string, password: string, condominiumId?: string) =>
  api.post<LoginResponse>("/auth/login", {
    email,
    password,
    useCookies: true,
    ...(condominiumId ? { condominiumId } : {}),
  });

export const loginCondominiumChoice = (email: string, password: string, condominiumId: string) =>
  login(email, password, condominiumId);

// 409 ao logar sem condominiumId quando há mais de um vínculo
export interface LoginCondominiumsBody {
  condominiums: CondominiumOption[];
}

export const register = (username: string, email: string, password: string) =>
  api.post("/auth/register", { username, email, password });

export const logout = () => api.post("/auth/logout");
export const refresh = () => api.post("/auth/refresh");
export const fetchMe = () => api.get<User>("/users/me");

// Email verification
export const verifyEmail = (token: string) => api.post("/auth/email/verify", { token });
export const resendVerificationEmail = (email: string) => api.post("/auth/email/resend", { email });

// Password reset
export const forgotPassword = (email: string) => api.post("/auth/password/forgot", { email });
export const resetPassword = (token: string, password: string) =>
  api.post("/auth/password/reset", { token, password });

// 2FA — mfaToken é passado no corpo quando vem do fluxo de login (não autenticado)
export const setup2fa = (mfaToken?: string) =>
  api.post<TotpSetupResponse>("/auth/2fa/setup", mfaToken ? { mfaToken } : {});

export const enable2fa = (code: string, mfaToken?: string) =>
  api.post<TotpEnableResponse>("/auth/2fa/enable", { code, ...(mfaToken ? { mfaToken } : {}) });

export const verify2fa = (code: string, mfaToken: string) =>
  api.post("/auth/2fa/verify", { code, mfaToken, useCookies: true });

// Toda listagem responde { items, page, pageSize, total }
const list =
  <T>(path: string) =>
  (page = 1, pageSize = 20) =>
    api.get<Page<T>>(path, { params: { page, pageSize } });

// Percorre todas as páginas (máx. 100 por requisição) — para seletores e agregações.
export const fetchAll = async <T>(
  fetchPage: (page: number, pageSize: number) => Promise<{ data: Page<T> }>
): Promise<T[]> => {
  const items: T[] = [];
  for (let page = 1; ; page++) {
    const { data } = await fetchPage(page, MAX_PAGE_SIZE);
    items.push(...data.items);
    if (items.length >= data.total || data.items.length === 0) return items;
  }
};

// Expenses
export const fetchExpenses = list<Expense>("/expenses");
export const createExpense = (data: CreateExpense) => api.post<Expense>("/expenses", data);
export const deleteExpense = (id: string) => api.delete(`/expenses/${id}`);

// Users
export const fetchUsers = list<User>("/users");
export const deleteUser = (id: string) => api.delete(`/users/${id}`);

// Notifications
export const fetchNotifications = list<Notification>("/notifications");
export const markNotificationRead = (id: string) => api.put(`/notifications/${id}/read`);

// Residents
export const fetchResidents = list<Resident>("/residents");

// Shop Owners
export const fetchShopOwners = list<ShopOwner>("/shop-owners");

// Blocks
export const fetchBlocks = (page = 1, pageSize = 20) =>
  api.get<Page<Block>>("/blocks", { params: { page, pageSize } });
export const fetchBlock = (id: string) => api.get<Block>(`/blocks/${id}`);
export const createBlock = (name: string) => api.post<Block>("/blocks", { name });
export const updateBlock = (id: string, name: string) => api.put<Block>(`/blocks/${id}`, { name });
export const deleteBlock = (id: string) => api.delete(`/blocks/${id}`);

// Units
export const fetchUnits = (page = 1, pageSize = 20, blockId?: string, sort?: "number") =>
  api.get<Page<Unit>>("/units", {
    params: { page, pageSize, ...(blockId ? { blockId } : {}), ...(sort ? { sort } : {}) },
  });
export const fetchUnit = (id: string) => api.get<Unit>(`/units/${id}`);
export const createUnit = (data: { unitNumber: string; floor?: number; blockId?: string }) =>
  api.post<Unit>("/units", data);
export const updateUnit = (
  id: string,
  data: { unitNumber?: string; floor?: number; blockId?: string | "" }
) => api.put<Unit>(`/units/${id}`, data);
export const deleteUnit = (id: string) => api.delete(`/units/${id}`);

// People
export const fetchPeople = (page = 1, pageSize = 20, q?: string, unitId?: string) =>
  api.get<Page<Person>>("/people", {
    params: { page, pageSize, ...(q ? { q } : {}), ...(unitId ? { unitId } : {}) },
  });
export const fetchPerson = (id: string) => api.get<Person>(`/people/${id}`);
export const createPerson = (data: {
  fullName: string;
  cpf?: string;
  email?: string;
  phone?: string;
}) => api.post<Person>("/people", data);
export const updatePerson = (
  id: string,
  data: { fullName?: string; cpf?: string; email?: string; phone?: string }
) => api.put<Person>(`/people/${id}`, data);
export const deletePerson = (id: string) => api.delete(`/people/${id}`);

// Unit Links
export const fetchUnitLinks = (unitId: string, active?: boolean) =>
  api.get<Page<UnitLink>>(`/units/${unitId}/links`, {
    params: { ...(active !== undefined ? { active } : {}) },
  });
export const createUnitLink = (unitId: string, data: CreateUnitLinkBody) =>
  api.post<UnitLink>(`/units/${unitId}/links`, data);
export const endUnitLink = (linkId: string, endsOn?: string) =>
  api.put<UnitLink>(`/links/${linkId}/end`, { ...(endsOn ? { endsOn } : {}) });
export const deleteUnitLink = (linkId: string) => api.delete(`/links/${linkId}`);

// Transfers
export const createTransfer = (
  unitId: string,
  data: {
    kind: "proprietario" | "inquilino";
    effectiveDate?: string;
    personId?: string;
    person?: { fullName: string; cpf?: string; email?: string; phone?: string };
  }
) => api.post<TransferResult>(`/units/${unitId}/transfers`, data);

// Invitations
export const sendInvitation = (personId: string, channel: "email" | "link") =>
  api.post<{ id: string; status: string; token?: string; link?: string }>(
    `/people/${personId}/invitations`,
    { channel }
  );
export const fetchPersonInvitations = (personId: string) =>
  api.get<{ items: InvitationRecord[] }>(`/people/${personId}/invitations`);
export const inspectInvitation = (token: string) =>
  api.post<InviteInspectResponse>("/auth/invitations/inspect", { token });
export const acceptInvitation = (data: {
  token: string;
  password: string;
  username?: string;
}) => api.post<InviteAcceptResponse>("/auth/invitations/accept", data);

// CSV Import
export const previewImport = (csv: string) =>
  api.post<ImportPreviewResponse>("/imports/preview", csv, {
    headers: { "Content-Type": "text/csv" },
  });
export const commitImport = (csv: string) =>
  api.post<ImportPreviewResponse>("/imports", csv, {
    headers: { "Content-Type": "text/csv" },
  });
