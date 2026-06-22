import "express-async-errors";
import { app } from "./app";
import { config } from "./config";
import { logger } from "./lib/logger";
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: config.sentryDsn,
  environment: config.nodeEnv,
  tracesSampleRate: config.nodeEnv === "production" ? 0.1 : 0,
});

async function bootstrap() {
  const server = app.listen(config.port, () => {
    logger.info(`Server running on port ${config.port} (${config.nodeEnv})`);
  });

  // Start workers after server is up, non-blocking
  setImmediate(async () => {
    try {
      const { startWorkers } = await import("./jobs/workers");
      const { startSchedulers } = await import("./jobs/schedulers");
      startWorkers();
      startSchedulers();
    } catch (err) {
      logger.warn("Workers failed to start (Redis may be unavailable) — campaign generation disabled");
    }
  });

  const shutdown = async (signal: string) => {
    logger.info(`${signal} received — shutting down gracefully`);
    server.close(async () => {
      await prisma.$disconnect();
      redis.disconnect();
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

bootstrap().catch((err) => {
  logger.error("Failed to start server", err);
  process.exit(1);
});
