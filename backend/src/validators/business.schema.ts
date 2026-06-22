import { z } from "zod";

export const createBusinessSchema = z.object({
  name: z.string().min(2).max(255),
  description: z.string().max(2000).optional(),
  businessType: z.string().max(100).optional(),
  industryCategory: z.string().max(100).optional(),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional().or(z.literal("")),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  pincode: z.string().regex(/^\d{6}$/).optional(),
  cityTier: z.number().int().min(1).max(3).optional(),
});

export const updateBusinessSchema = createBusinessSchema.partial();
