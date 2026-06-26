import "dotenv/config";
import app from "./app.js";
import prisma from "./lib/prisma.js";

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 IncidentIQ API running on http://localhost:${PORT}`);
});

// Graceful shutdown: close the HTTP listener and DB pool so the process
// exits immediately on Ctrl+C instead of being force-killed by tsx.
let shuttingDown = false;
const shutdown = async (signal: string) => {
  if (shuttingDown) return;
  shuttingDown = true;
  // eslint-disable-next-line no-console
  console.log(`\n${signal} received — shutting down gracefully…`);

  // Stop accepting new connections AND drop existing keep-alive sockets,
  // otherwise server.close() waits for idle browser/axios connections to drain.
  server.closeAllConnections?.();
  server.close();

  try {
    await prisma.$disconnect();
  } catch {
    /* ignore */
  }
  process.exit(0);
};

// Safety net: if anything stalls, exit before tsx's 5s force-kill window.
const armForceExit = () => setTimeout(() => process.exit(0), 1500).unref();

process.on("SIGINT", () => {
  armForceExit();
  void shutdown("SIGINT");
});
process.on("SIGTERM", () => {
  armForceExit();
  void shutdown("SIGTERM");
});
