import { z } from "zod";

const SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
const STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;

export const createIncidentSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(150),
  description: z.string().trim().min(5, "Description must be at least 5 characters").max(5000),
  severity: z.enum(SEVERITIES).default("MEDIUM"),
  status: z.enum(STATUSES).default("OPEN"),
});

export const updateStatusSchema = z.object({
  status: z.enum(STATUSES, {
    errorMap: () => ({ message: `status must be one of: ${STATUSES.join(", ")}` }),
  }),
});

export const idParamSchema = z.object({
  id: z.string().uuid("Invalid incident id"),
});

// Server-side filter + search + pagination + sorting
export const listIncidentsQuerySchema = z.object({
  severity: z.enum(SEVERITIES).optional(),
  status: z.enum(STATUSES).optional(),
  search: z.string().trim().max(150).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(["createdAt", "updatedAt", "severity", "status", "title"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type ListIncidentsQuery = z.infer<typeof listIncidentsQuerySchema>;

export { SEVERITIES, STATUSES };
