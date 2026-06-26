import { describe, test, expect } from "vitest";
import {
  createIncidentSchema,
  listIncidentsQuerySchema,
  updateStatusSchema,
} from "../src/validators/incident.validator.js";
import { registerSchema } from "../src/validators/auth.validator.js";

describe("incident validators", () => {
  test("accepts a valid incident and applies defaults", () => {
    const r = createIncidentSchema.safeParse({
      title: "DB outage",
      description: "Primary database unreachable",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.severity).toBe("MEDIUM");
      expect(r.data.status).toBe("OPEN");
    }
  });

  test("rejects short title", () => {
    const r = createIncidentSchema.safeParse({ title: "x", description: "long enough" });
    expect(r.success).toBe(false);
  });

  test("rejects invalid status", () => {
    expect(updateStatusSchema.safeParse({ status: "DONE" }).success).toBe(false);
    expect(updateStatusSchema.safeParse({ status: "RESOLVED" }).success).toBe(true);
  });

  test("coerces and defaults pagination query", () => {
    const r = listIncidentsQuerySchema.safeParse({ page: "2", pageSize: "25" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.pageSize).toBe(25);
      expect(r.data.sortBy).toBe("createdAt");
      expect(r.data.sortOrder).toBe("desc");
    }
  });

  test("caps pageSize at 100", () => {
    expect(listIncidentsQuerySchema.safeParse({ pageSize: "500" }).success).toBe(false);
  });
});

describe("auth validators", () => {
  test("normalizes email to lowercase", () => {
    const r = registerSchema.safeParse({
      name: "Jane",
      email: "JANE@Example.COM",
      password: "secret12",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.email).toBe("jane@example.com");
  });

  test("rejects short password", () => {
    const r = registerSchema.safeParse({ name: "Jane", email: "a@b.com", password: "123" });
    expect(r.success).toBe(false);
  });

  test("rejects password without a number", () => {
    const r = registerSchema.safeParse({ name: "Jane", email: "a@b.com", password: "onlyletters" });
    expect(r.success).toBe(false);
  });
});
