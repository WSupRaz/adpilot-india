import type { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { ValidationError } from "../lib/errors";

export function validate(schema: ZodSchema, source: "body" | "query" | "params" = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      throw new ValidationError(
        "Validation failed",
        result.error.flatten().fieldErrors
      );
    }
    req[source] = result.data;
    next();
  };
}
