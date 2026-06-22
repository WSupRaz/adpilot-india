import { z } from "zod";

export const createCampaignSchema = z.object({
  businessId: z.string().uuid(),
  goal: z.enum(["leads", "sales", "calls", "bookings", "brand_awareness", "website_traffic"]),
  goalDescription: z.string().min(10).max(1000),
  platforms: z.array(z.enum(["google", "meta"])).min(1),
  dailyBudgetPaise: z.number().int().min(10000).max(100_000_000), // ₹100 to ₹10 lakh
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
  festivalContext: z.string().max(100).optional(),
});

export const updateCampaignSchema = z.object({
  name: z.string().max(255).optional(),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
  dailyBudgetPaise: z.number().int().min(10000).optional(),
}).strict();

export const approveCampaignSchema = z.object({
  notes: z.string().max(500).optional(),
});
