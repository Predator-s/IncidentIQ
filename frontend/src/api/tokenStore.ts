import type { AuthResponse, AuthUser } from "../types";

const ACCESS = "iq_access";
const REFRESH = "iq_refresh";
const USER = "iq_user";

export const getAccessToken = (): string | null => localStorage.getItem(ACCESS);
export const getRefreshToken = (): string | null => localStorage.getItem(REFRESH);

export const getUser = (): AuthUser | null => {
  const raw = localStorage.getItem(USER);
  return raw ? (JSON.parse(raw) as AuthUser) : null;
};

export const setSession = (s: Partial<AuthResponse>): void => {
  if (s.accessToken) localStorage.setItem(ACCESS, s.accessToken);
  if (s.refreshToken) localStorage.setItem(REFRESH, s.refreshToken);
  if (s.user) localStorage.setItem(USER, JSON.stringify(s.user));
};

export const clearSession = (): void => {
  localStorage.removeItem(ACCESS);
  localStorage.removeItem(REFRESH);
  localStorage.removeItem(USER);
};
