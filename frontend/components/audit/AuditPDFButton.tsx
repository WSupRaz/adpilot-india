"use client";

import { Download } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";

export function AuditPDFButton({ auditId }: { auditId: string }) {
  async function handleDownload() {
    try {
      const result = await apiClient.get<{ data: { pdf_url: string } }>(
        `/api/v1/audits/${auditId}/pdf`
      );
      window.open(result.data.pdf_url, "_blank");
    } catch {
      toast.error("PDF not ready yet. Please try again shortly.");
    }
  }

  return (
    <button
      onClick={handleDownload}
      className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted"
    >
      <Download className="h-4 w-4" />
      Download Report
    </button>
  );
}
