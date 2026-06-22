"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";

interface JobProgressProps {
  jobId: string;
  title: string;
  description: string;
  onComplete: (resultId: string) => void;
}

type JobStatus = "queued" | "active" | "completed" | "failed";

interface JobState {
  status: JobStatus;
  progress: number;
  message: string;
  result_id?: string;
  error?: string;
}

export function JobProgress({ jobId, title, description, onComplete }: JobProgressProps) {
  const [job, setJob] = useState<JobState>({
    status: "queued",
    progress: 0,
    message: "Queued...",
  });

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const result = await apiClient.get<{ data: JobState }>(
          `/api/v1/jobs/${jobId}/status`
        );
        setJob(result.data);

        if (result.data.status === "completed" && result.data.result_id) {
          clearInterval(interval);
          onComplete(result.data.result_id);
        }
        if (result.data.status === "failed") {
          clearInterval(interval);
        }
      } catch {
        // Silently retry
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [jobId, onComplete]);

  return (
    <div className="rounded-xl border p-8 text-center space-y-4">
      <div className="flex justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
      <div className="max-w-xs mx-auto space-y-2">
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-500"
            style={{ width: `${job.progress}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">{job.message}</p>
      </div>
      {job.status === "failed" && (
        <p className="text-sm text-destructive">{job.error ?? "Something went wrong. Please try again."}</p>
      )}
    </div>
  );
}
