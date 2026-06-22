import type { Request, Response, NextFunction } from "express";
import { AppError } from "../lib/errors";
import { logger } from "../lib/logger";
import { config } from "../config";
import * as Sentry from "@sentry/node";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error(err.message, { code: err.code, stack: err.stack });
      Sentry.captureException(err);
    }

    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(config.nodeEnv !== "production" && err.details
          ? { details: err.details }
          : {}),
      },
    });
  }

  // Unexpected errors
  logger.error("Unhandled error", { message: err.message, stack: err.stack });
  Sentry.captureException(err);

  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred",
    },
  });
}
