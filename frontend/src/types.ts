export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type Status = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export interface UserRef {
  id: string;
  name: string;
  email: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  status: Status;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  updatedById: string;
  createdBy?: UserRef;
  updatedBy?: UserRef;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface IncidentListResponse {
  data: Incident[];
  pagination: Pagination;
}

export interface IncidentFilters {
  search: string;
  severity: Severity | "";
  status: Status | "";
  page: number;
  pageSize: number;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export const SEVERITIES: Severity[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
export const STATUSES: Status[] = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
