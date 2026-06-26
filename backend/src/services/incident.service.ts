import type { Prisma } from "@prisma/client";
import prisma from "../lib/prisma.js";
import ApiError from "../utils/ApiError.js";
import type {
  CreateIncidentInput,
  ListIncidentsQuery,
} from "../validators/incident.validator.js";

const auditSelect = {
  createdBy: { select: { id: true, name: true, email: true } },
  updatedBy: { select: { id: true, name: true, email: true } },
} satisfies Prisma.IncidentInclude;

// Compact textual snapshot of the incident state — fed to the chat assistant.
export const getIncidentContext = async (): Promise<string> => {
  const [bySeverity, byStatus, recent] = await Promise.all([
    prisma.incident.groupBy({ by: ["severity"], _count: true }),
    prisma.incident.groupBy({ by: ["status"], _count: true }),
    prisma.incident.findMany({
      orderBy: { createdAt: "desc" },
      take: 15,
      select: { title: true, severity: true, status: true },
    }),
  ]);

  const sev = bySeverity.map((s) => `${s.severity}: ${s._count}`).join(", ");
  const stat = byStatus.map((s) => `${s.status}: ${s._count}`).join(", ");
  const list = recent.map((i) => `- [${i.severity}/${i.status}] ${i.title}`).join("\n");

  return `By severity → ${sev || "none"}\nBy status → ${stat || "none"}\nRecent incidents:\n${list || "none"}`;
};

export const createIncident = (data: CreateIncidentInput, userId: string) =>
  prisma.incident.create({
    data: { ...data, createdById: userId, updatedById: userId },
    include: auditSelect,
  });

// Server-side filtering + search + pagination + sorting
export const listIncidents = async (query: ListIncidentsQuery) => {
  const { severity, status, search, page, pageSize, sortBy, sortOrder } = query;

  const where: Prisma.IncidentWhereInput = {
    ...(severity && { severity }),
    ...(status && { status }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const [total, items] = await Promise.all([
    prisma.incident.count({ where }),
    prisma.incident.findMany({
      where,
      include: auditSelect,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    items,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize) || 1,
    },
  };
};

export const getIncidentById = async (id: string) => {
  const incident = await prisma.incident.findUnique({
    where: { id },
    include: auditSelect,
  });
  if (!incident) throw new ApiError(404, "Incident not found");
  return incident;
};

export const updateIncidentStatus = async (id: string, status: string, userId: string) => {
  await getIncidentById(id); // throws 404 if missing
  return prisma.incident.update({
    where: { id },
    data: { status: status as Prisma.IncidentUpdateInput["status"], updatedById: userId },
    include: auditSelect,
  });
};
