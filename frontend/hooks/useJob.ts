"use client";

import { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/api-client";

type JobStatus = "queued" | "active" | "completed" | "failed";

interface JobState {
  status: JobStatus;
  progress: number;
  message: string;
  result_id?: string;
  error?: string;
}

export function useJob(jobId: string | null) {
  const [state, setState] = useState<JobState | null>(null);

  const poll = useCallback(async () => {
    if (!jobId) return;
    const result = await apiClient.get<{ data: JobState }>(
      `/api/v1/jobs/${jobId}/status`
    );
    setState(result.data);
    return result.data;
  }, [jobId]);

  useEffect(() => {
    if (!jobId) return;

    const interval = setInterval(async () => {
      const s = await poll();
      if (s?.status === "completed" || s?.status === "failed") {
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [jobId, poll]);

  return state;
}
