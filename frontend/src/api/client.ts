import axios, {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import {
  getAccessToken,
  getRefreshToken,
  setSession,
  clearSession,
} from "./tokenStore";
import type { AuthResponse } from "../types";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const api = axios.create({ baseURL });

// Attach access token to every request.
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// On 401, try a single refresh, then replay the original request.
let refreshing: Promise<AxiosResponse<{ data: AuthResponse }>> | null = null;

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;

    if (status === 401 && original && !original._retry && getRefreshToken()) {
      original._retry = true;
      try {
        refreshing =
          refreshing ||
          axios.post<{ data: AuthResponse }>(`${baseURL}/auth/refresh`, {
            refreshToken: getRefreshToken(),
          });
        const { data } = await refreshing;
        refreshing = null;
        setSession(data.data);
        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(original);
      } catch (e) {
        refreshing = null;
        clearSession();
        window.location.href = "/login";
        return Promise.reject(e);
      }
    }
    return Promise.reject(error);
  }
);

// Surface a readable message from the API error envelope.
export const apiError = (err: unknown): string => {
  if (axios.isAxiosError(err)) {
    return (
      (err.response?.data as { error?: { message?: string } } | undefined)?.error?.message ||
      err.message
    );
  }
  return err instanceof Error ? err.message : "Something went wrong";
};

export default api;
