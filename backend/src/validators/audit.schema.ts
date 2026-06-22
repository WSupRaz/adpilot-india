import { z } from "zod";

export const createAuditSchema = z.object({
  url: z.string().url("Please enter a valid website URL"),
  businessId: z.string().uuid().optional(),
});
