import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/database";
import { config } from "../config";
import { AuthError, ConflictError, NotFoundError } from "../lib/errors";
import { creditService } from "./CreditService";
import { PLANS } from "../../../shared/src/constants/plans";

export class AuthService {
  async register(data: { fullName: string; email: string; password: string }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new ConflictError("An account with this email already exists");

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        fullName: data.fullName,
        passwordHash,
      },
      select: { id: true, email: true, fullName: true, role: true },
    });

    // Grant starter plan trial credits
    await creditService.grant(user.id, 50, "Welcome bonus — 14-day trial");

    return user;
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) throw new AuthError("Invalid email or password");
    if (!user.isActive) throw new AuthError("Account suspended. Contact support.");

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new AuthError("Invalid email or password");

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
      tokens: this.generateTokens(user.id, user.role),
    };
  }

  async googleOAuth(googleId: string, email: string, fullName: string, avatarUrl?: string) {
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: { email, fullName, googleId, avatarUrl, emailVerified: true },
      });
      await creditService.grant(user.id, 50, "Welcome bonus — 14-day trial");
    } else if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId, avatarUrl: avatarUrl ?? user.avatarUrl },
      });
    }

    return {
      user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
      tokens: this.generateTokens(user.id, user.role),
    };
  }

  async refreshToken(token: string) {
    try {
      const payload = jwt.verify(token, config.jwt.refreshSecret) as { sub: string };
      const user = await prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user || !user.isActive) throw new AuthError("Invalid refresh token");

      return { tokens: this.generateTokens(user.id, user.role) };
    } catch {
      throw new AuthError("Invalid or expired refresh token");
    }
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return; // Silently succeed to prevent email enumeration

    // TODO: Generate reset token, store hash in DB, send email via Resend
  }

  generateTokens(userId: string, role: string) {
    const accessToken = jwt.sign(
      { sub: userId, role },
      config.jwt.accessSecret,
      { expiresIn: config.jwt.accessExpiry }
    );

    const refreshToken = jwt.sign(
      { sub: userId },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiry }
    );

    return { accessToken, refreshToken };
  }
}

export const authService = new AuthService();
