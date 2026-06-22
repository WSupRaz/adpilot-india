"use client";

import { useSession } from "next-auth/react";

export function useAuth() {
  const { data: session, status } = useSession();

  return {
    user: session?.user,
    userId: (session?.user as any)?.id as string | undefined,
    role: (session?.user as any)?.role as string | undefined,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
  };
}
