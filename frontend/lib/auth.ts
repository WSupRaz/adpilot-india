import type { NextAuthOptions, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
    };
  }
  interface User {
    id: string;
    role: string;
    accessToken?: string;
    refreshToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpiry?: number; // unix seconds
  }
}

const API_URL = process.env.API_URL ?? "http://localhost:4000";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        try {
          const res = await fetch(`${API_URL}/api/v1/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!res.ok) return null;

          const { data } = await res.json();
          if (!data?.user || !data?.tokens?.accessToken) return null;

          // Return both user info and backend access token
          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.fullName,
            image: data.user.avatarUrl ?? null,
            role: data.user.role,
            accessToken: data.tokens.accessToken,
            refreshToken: data.tokens.refreshToken,
          } satisfies User;
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle Google OAuth: create/get user in our backend
      if (account?.provider === "google" && profile?.email) {
        try {
          const res = await fetch(`${API_URL}/api/v1/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              googleId: account.providerAccountId,
              email: profile.email,
              fullName: (profile as any).name ?? profile.email,
              avatarUrl: (profile as any).picture ?? null,
            }),
          });

          if (!res.ok) return false;

          const { data } = await res.json();
          if (!data?.user || !data?.tokens?.accessToken) return false;

          // Attach backend tokens to the user object (NextAuth passes this to jwt callback)
          user.id = data.user.id;
          user.role = data.user.role;
          (user as any).accessToken = data.tokens.accessToken;
          (user as any).refreshToken = data.tokens.refreshToken;
        } catch {
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      // On first sign-in, `user` is populated — persist to token
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
        // Decode expiry from the JWT itself so we can proactively refresh
        try {
          const parts = token.accessToken?.split(".");
          if (parts && parts[1]) {
            const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
            token.accessTokenExpiry = payload.exp as number;
          }
        } catch { /* ignore */ }
        return token;
      }

      // Proactively refresh if within 5 minutes of expiry
      const nowSecs = Math.floor(Date.now() / 1000);
      const expiresIn = (token.accessTokenExpiry ?? 0) - nowSecs;
      if (expiresIn > 300) return token; // still valid, nothing to do

      // Token expired or about to expire — use refresh token
      if (!token.refreshToken) return token;
      try {
        const res = await fetch(`${API_URL}/api/v1/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: token.refreshToken }),
        });
        if (!res.ok) return token;
        const { data } = await res.json();
        if (!data?.tokens?.accessToken) return token;
        token.accessToken = data.tokens.accessToken;
        if (data.tokens.refreshToken) token.refreshToken = data.tokens.refreshToken;
        try {
          const parts = token.accessToken?.split(".");
          if (parts && parts[1]) {
            const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
            token.accessTokenExpiry = payload.exp as number;
          }
        } catch { /* ignore */ }
      } catch { /* keep old token, will 401 on next real request */ }
      return token;
    },

    async session({ session, token }) {
      // Expose token data to the client-side session
      if (token) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) ?? "user";
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },
};
