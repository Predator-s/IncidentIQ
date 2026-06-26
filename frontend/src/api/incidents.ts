import api from "./client";
import type { Incident, IncidentListResponse, Severity, Status } from "../types";

export interface ListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  severity?: Severity;
  status?: Status;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreateIncidentPayload {
  title: string;
  description: string;
  severity: Severity;
}

export const fetchIncidents = (params: ListParams): Promise<IncidentListResponse> =>
  api.get<IncidentListResponse>("/incidents", { params }).then((r) => r.data);

export const fetchIncident = (id: string): Promise<Incident> =>
  api.get<{ data: Incident }>(`/incidents/${id}`).then((r) => r.data.data);

export const createIncident = (payload: CreateIncidentPayload): Promise<Incident> =>
  api.post<{ data: Incident }>("/incidents", payload).then((r) => r.data.data);

export const updateIncidentStatus = (id: string, status: Status): Promise<Incident> =>
  api.patch<{ data: Incident }>(`/incidents/${id}/status`, { status }).then((r) => r.data.data);
