import { z } from "zod";

export const registerSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email().toLowerCase(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(128),
});

export const otpRequestSchema = z.object({
  type: z.enum(["email", "phone"]),
  email: z.string().email().optional(),
  phone: z.string().regex(/^\+91\d{10}$/).optional(),
});

export const otpVerifySchema = z.object({
  type: z.enum(["email", "phone"]),
  identifier: z.string(),
  otp: z.string().length(6).regex(/^\d{6}$/),
});
