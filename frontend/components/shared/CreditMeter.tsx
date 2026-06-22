"use client";

import { useCredits } from "@/hooks/useCredits";
import { Zap } from "lucide-react";

interface CreditMeterProps {
  compact?: boolean;
}

export function CreditMeter({ compact = false }: CreditMeterProps) {
  const { balance, loading } = useCredits();

  if (loading) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 text-sm font-medium">
        <Zap className="h-3.5 w-3.5 text-primary" />
        <span>{balance ?? "—"}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-full border px-3 py-1.5">
      <Zap className="h-3.5 w-3.5 text-primary" />
      <span className="text-sm font-medium">{balance ?? "—"} credits</span>
    </div>
  );
}
