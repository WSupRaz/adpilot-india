// BigInt cannot be serialized by JSON.stringify — convert to number globally
(BigInt.prototype as any).toJSON = function () { return Number(this); };

import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import { config } from "./config";
import { errorHandler } from "./middleware/errorHandler.middleware";
import { requestLogger } from "./middleware/requestLogger.middleware";
import { v1Router } from "./routes/v1";
import { adminRouter } from "./routes/admin";

export const app = express();

app.set("trust proxy", 1);

// Security headers
app.use(helmet());

// CORS — allow frontend origin
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(requestLogger);

// Health check (no auth required)
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes
app.use("/api/v1", v1Router);
app.use("/api/admin", adminRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Route not found" } });
});

// Global error handler (must be last)
app.use(errorHandler);
