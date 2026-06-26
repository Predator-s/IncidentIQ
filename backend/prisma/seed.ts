import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient, type Severity, type Status } from "@prisma/client";

const prisma = new PrismaClient();

// Curated, realistic incidents spanning all severities — handy for testing the
// LLM features (summary / severity recommendation / root-cause suggestions).
const SAMPLE_INCIDENTS: { title: string; description: string; severity: Severity; status: Status }[] = [
  // CRITICAL
  {
    title: "Production database cluster down",
    description:
      "Primary Postgres cluster is unreachable across all regions. Every user request is failing with 503s; checkout and login are fully down. Started 8 minutes ago after a failover event.",
    severity: "CRITICAL",
    status: "OPEN",
  },
  {
    title: "Customer data exposed via public API",
    description:
      "An unauthenticated endpoint is returning other users' PII (emails, phone numbers). Confirmed reproducible. Potential data breach affecting all accounts.",
    severity: "CRITICAL",
    status: "IN_PROGRESS",
  },
  // HIGH
  {
    title: "Checkout API returning intermittent 500s",
    description:
      "About 20% of checkout requests fail with 500 errors since the last deploy. Payments succeed on retry but conversion is dropping. Other services unaffected.",
    severity: "HIGH",
    status: "OPEN",
  },
  {
    title: "Search latency severely degraded",
    description:
      "Search response times jumped from 200ms to 9 seconds for most queries. Users are timing out. CPU on the search nodes is pinned at 100%.",
    severity: "HIGH",
    status: "IN_PROGRESS",
  },
  // MEDIUM
  {
    title: "Some users report delayed email notifications",
    description:
      "A subset of users say password-reset and notification emails arrive 10-15 minutes late. Email eventually delivers; no data loss. Intermittent over the last few hours.",
    severity: "MEDIUM",
    status: "OPEN",
  },
  {
    title: "Dashboard charts occasionally fail to load",
    description:
      "The analytics dashboard intermittently shows a spinner and a 'retry' message for some users. Refreshing usually fixes it. Core features work fine.",
    severity: "MEDIUM",
    status: "RESOLVED",
  },
  // LOW
  {
    title: "Typo on the settings page",
    description:
      "The account settings page has a spelling mistake — 'Mange Account' instead of 'Manage Account'. Cosmetic only, no functional impact.",
    severity: "LOW",
    status: "OPEN",
  },
  {
    title: "Feature request: dark mode for exported reports",
    description:
      "A user suggested adding a dark theme to the exported PDF reports. Nice-to-have, not affecting anyone currently.",
    severity: "LOW",
    status: "CLOSED",
  },
];

async function main() {
  const password = await bcrypt.hash("password123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@incidentiq.dev" },
    update: {},
    create: { name: "Admin", email: "admin@incidentiq.dev", password },
  });

  // Reset to a deterministic demo dataset.
  await prisma.incident.deleteMany();
  await prisma.incident.createMany({
    data: SAMPLE_INCIDENTS.map((s) => ({
      ...s,
      createdById: admin.id,
      updatedById: admin.id,
    })),
  });

  console.log(
    `✅ Seed complete: ${SAMPLE_INCIDENTS.length} incidents. Login: admin@incidentiq.dev / password123`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
