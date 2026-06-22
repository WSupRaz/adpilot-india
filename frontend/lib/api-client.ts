import { getSession } from "next-auth/react";

export class APIError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = "APIError";
  }
}

// In development, calls hit /api/v1/... which Next.js proxies to the backend.
// In production, same — the rewrite in next.config.ts handles it.
const BASE_URL = "";

async function getAuthHeader(): Promise<Record<string, string>> {
  // `getSession()` returns the cached session or fetches /api/auth/session.
  // It works in client components and does NOT require a React hook context.
  // In server-side code (e.g. SSR), this returns null — server components use
  // getServerSession(authOptions) directly instead of this client.
  try {
    const session = await getSession();
    const token = (session as any)?.accessToken as string | undefined;
    if (token) return { Authorization: `Bearer ${token}` };
  } catch {
    // Not in a browser context — server components use different fetch helpers
  }
  return {};
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const authHeader = await getAuthHeader();

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new APIError(
      res.status,
      json.error?.code ?? "UNKNOWN_ERROR",
      json.error?.message ?? "An unexpected error occurred"
    );
  }

  return json as T;
}

export const apiClient = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body: unknown) => request<T>("POST", path, body),
  put: <T>(path: string, body: unknown) => request<T>("PUT", path, body),
  patch: <T>(path: string, body: unknown) => request<T>("PATCH", path, body),
  delete: <T>(path: string) => request<T>("DELETE", path),
};

// Server-side fetch helper — use this in Server Components and Route Handlers
// where getSession() is not available.
export async function serverFetch<T>(
  path: string,
  token: string | undefined,
  options?: RequestInit
): Promise<T> {
  const apiUrl = process.env.API_URL ?? "http://localhost:4000";
  const res = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    cache: "no-store",
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new APIError(
      res.status,
      json.error?.code ?? "UNKNOWN_ERROR",
      json.error?.message ?? "Fetch failed"
    );
  }
  return json as T;
}
