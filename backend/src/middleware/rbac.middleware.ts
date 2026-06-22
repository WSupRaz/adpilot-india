import type { Request, Response, NextFunction } from "express";
import { ForbiddenError } from "../lib/errors";
import type { AuthRequest } from "./auth.middleware";

type Role = "user" | "admin" | "superadmin";

const ROLE_HIERARCHY: Record<Role, number> = {
  user: 1,
  admin: 2,
  superadmin: 3,
};

export function requireRole(minimumRole: Role) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const userRole = (req as AuthRequest).userRole as Role;
    const userLevel = ROLE_HIERARCHY[userRole] ?? 0;
    const requiredLevel = ROLE_HIERARCHY[minimumRole];

    if (userLevel < requiredLevel) {
      throw new ForbiddenError(`Role '${minimumRole}' or higher required`);
    }

    next();
  };
}

export const requireAdmin = requireRole("admin");
export const requireSuperAdmin = requireRole("superadmin");
