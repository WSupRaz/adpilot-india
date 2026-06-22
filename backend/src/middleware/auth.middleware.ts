import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { AuthError } from "../lib/errors";

export interface AuthRequest extends Request {
  userId: string;
  userRole: string;
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    throw new AuthError("No token provided");
  }

  try {
    const payload = jwt.verify(token, config.jwt.accessSecret) as {
      sub: string;
      role: string;
    };
    (req as AuthRequest).userId = payload.sub;
    (req as AuthRequest).userRole = payload.role;
    next();
  } catch {
    throw new AuthError("Invalid or expired token");
  }
}
