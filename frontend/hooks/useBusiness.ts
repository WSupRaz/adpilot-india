"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Business } from "@/types";

export function useBusinesses() {
  return useQuery({
    queryKey: ["businesses"],
    queryFn: () =>
      apiClient.get<{ data: Business[] }>("/api/v1/businesses").then((r) => r.data),
  });
}

export function useBusiness(id: string) {
  return useQuery({
    queryKey: ["businesses", id],
    queryFn: () =>
      apiClient.get<{ data: Business }>(`/api/v1/businesses/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}
