import type { Request } from "express";

export interface AuthRequest extends Request {
  userId: string;
  userRole: string;
}

export type PaginationQuery = {
  page?: string;
  limit?: string;
};

export type OrderBy = "asc" | "desc";
