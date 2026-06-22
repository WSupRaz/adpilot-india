"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

interface CreditsResponse {
  data: { balance: number; reset_date: string };
}

export function useCredits() {
  const { data, isLoading } = useQuery({
    queryKey: ["credits"],
    queryFn: () => apiClient.get<CreditsResponse>("/api/v1/credits"),
    staleTime: 30_000,
  });

  return {
    balance: data?.data.balance,
    resetDate: data?.data.reset_date,
    loading: isLoading,
  };
}
