import { Router } from "express";
import { authRateLimit } from "../../middleware/rateLimit.middleware";
import { validate } from "../../middleware/validate.middleware";
import { authenticate } from "../../middleware/auth.middleware";
import type { AuthRequest } from "../../middleware/auth.middleware";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
} from "../../validators/auth.schema";
import { authService } from "../../services/AuthService";
import { success, created } from "../../lib/response";
import { prisma } from "../../config/database";

export const authRouter = Router();

// ── Public ────────────────────────────────────────────────────────────────────

authRouter.post("/register", authRateLimit, validate(registerSchema), async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    const { tokens } = authService.generateTokens(user.id, user.role);
    return created(res, { user, tokens });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/login", authRateLimit, validate(loginSchema), async (req, res, next) => {
  try {
    const result = await authService.login(req.body.email, req.body.password);
    return success(res, result);
  } catch (err) {
    next(err);
  }
});

// Called by NextAuth after Google OAuth — exchanges Google ID token for a backend session
authRouter.post("/google", authRateLimit, async (req, res, next) => {
  try {
    const { googleId, email, fullName, avatarUrl } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Email is required" } });
    }
    const result = await authService.googleOAuth(googleId ?? "", email, fullName ?? email, avatarUrl);
    return success(res, result);
  } catch (err) {
    next(err);
  }
});

authRouter.post("/refresh", async (req, res, next) => {
  try {
    // Accept from cookie OR request body
    const token = req.cookies?.refreshToken ?? req.body?.refreshToken;
    if (!token) {
      return res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Refresh token required" } });
    }
    const result = await authService.refreshToken(token);
    return success(res, result);
  } catch (err) {
    next(err);
  }
});

authRouter.post("/forgot-password", authRateLimit, validate(forgotPasswordSchema), async (req, res, next) => {
  try {
    await authService.forgotPassword(req.body.email);
    // Always return success to prevent email enumeration
    return success(res, { message: "If that email exists, a reset link has been sent." });
  } catch (err) {
    next(err);
  }
});

// ── Protected ─────────────────────────────────────────────────────────────────

authRouter.post("/logout", authenticate, async (req, res) => {
  res.clearCookie("refreshToken");
  return success(res, { message: "Logged out" });
});

authRouter.get("/me", authenticate, async (req, res, next) => {
  try {
    const { userId } = req as AuthRequest;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        role: true,
        preferredLanguage: true,
        emailVerified: true,
        createdAt: true,
        credits: { select: { balance: true, resetDate: true } },
      },
    });
    if (!user) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "User not found" } });
    }
    return success(res, user);
  } catch (err) {
    next(err);
  }
});

authRouter.patch("/me", authenticate, async (req, res, next) => {
  try {
    const { userId } = req as AuthRequest;
    const allowed = ["fullName", "avatarUrl", "preferredLanguage"];
    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    const user = await prisma.user.update({
      where: { id: userId },
      data: updates,
      select: { id: true, email: true, fullName: true, avatarUrl: true, role: true, preferredLanguage: true },
    });
    return success(res, user);
  } catch (err) {
    next(err);
  }
});
